-- Initial Database Schema and Seed Data for Cadmus Sovereign Engine.
-- This migration sets up the core tables, indexes, and initial seed data for the application.

-- Enable the pgvector extension for vector embeddings, crucial for neural search capabilities.
CREATE EXTENSION IF NOT EXISTS vector;

-- Core `users` table to store user authentication and profile information.
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique user identifier.
    username VARCHAR(255) UNIQUE NOT NULL,         -- User's unique username for login.
    password_hash TEXT NOT NULL,                    -- Hashed password for security.
    tier VARCHAR(50) DEFAULT 'Community',           -- User's service tier (e.g., Community, Pro).
    settings_json JSONB DEFAULT '{}',               -- JSONB field for user-specific settings.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp of user creation.
);

-- Core `documents` table to store all knowledge base documents and their metadata.
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique document identifier.
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE, -- User who owns this document.
    parent_id UUID,                                -- Optional parent document ID for hierarchical structures.
    class_id VARCHAR(255),                         -- Identifier for the document's archetype/class.
    title TEXT NOT NULL,                           -- Main title of the document.
    is_public BOOLEAN DEFAULT FALSE,               -- Visibility status of the document.
    properties JSONB DEFAULT '{}',                 -- JSONB field for flexible, structured document metadata.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp of document creation.
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Last update timestamp.
);

-- `document_updates` table to store Yjs updates for collaborative editing.
CREATE TABLE IF NOT EXISTS document_updates (
    id SERIAL PRIMARY KEY,                         -- Auto-incrementing ID.
    doc_id UUID REFERENCES documents(id) ON DELETE CASCADE, -- Document this update belongs to.
    data BYTEA NOT NULL,                           -- Binary data of the Yjs update.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp of the update.
);

-- Index on `doc_id` for efficient retrieval of updates for a specific document.
CREATE INDEX IF NOT EXISTS idx_document_updates_doc_id ON document_updates(doc_id);

-- `document_links` table to define relationships between documents (graph structure).
CREATE TABLE IF NOT EXISTS document_links (
    from_id UUID REFERENCES documents(id) ON DELETE CASCADE, -- Source document of the link.
    to_id UUID REFERENCES documents(id) ON DELETE CASCADE,   -- Target document of the link.
    PRIMARY KEY (from_id, to_id)                           -- Composite primary key to ensure unique links.
);

-- `neural_metadata` table for storing vector embeddings and other AI-related document metadata.
CREATE TABLE IF NOT EXISTS neural_metadata (
    document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE, -- Document associated with this metadata.
    mass REAL DEFAULT 1.0,                                                 -- Physics-based ranking (Gravity) - mass attribute.
    hp INTEGER DEFAULT 100,                                                -- Health/integrity points.
    entropy REAL DEFAULT 0.0,                                              -- Measure of disorder/randomness.
    embedding VECTOR(384),                                                 -- Vector embedding for neural search, using pgvector extension.
    last_tick_at TIMESTAMP                                                 -- Last time physics simulation was updated.
);

-- `classes` table to define archetypes/classes for documents.
-- Each class has a schema, UI definition, behavior rules, and an icon.
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(255) PRIMARY KEY,                   -- Unique class identifier (e.g., "note", "asset").
    name VARCHAR(255) NOT NULL,                    -- Human-readable name of the class.
    json_schema JSONB NOT NULL,                    -- JSON Schema for validating document properties of this class.
    ui_schema JSONB NOT NULL,                      -- JSONB schema defining UI fields specific to this class.
    icon VARCHAR(50),                              -- Icon for visual representation.
    owner_id UUID REFERENCES users(id)             -- Optional: User who created this custom class.
);

-- Seed Primitives: Insert initial, fundamental archetype definitions.
INSERT INTO classes (id, name, json_schema, ui_schema, icon) VALUES
('note', 'Note', '{}', '{}', 'FileText') ON CONFLICT DO NOTHING;
INSERT INTO classes (id, name, json_schema, ui_schema, icon) VALUES
('task', 'Task', '{"properties": {"status": {"type": "string"}, "due": {"type": "string"}}}', '{}', 'CheckSquare') ON CONFLICT DO NOTHING;
INSERT INTO classes (id, name, json_schema, ui_schema, icon) VALUES
('project', 'Project', '{"properties": {"progress": {"type": "number"}}}', '{}', 'Briefcase') ON CONFLICT DO NOTHING;
INSERT INTO classes (id, name, json_schema, ui_schema, icon) VALUES
('container', 'Container', '{}', '{}', 'Box') ON CONFLICT DO NOTHING;
INSERT INTO classes (id, name, json_schema, ui_schema, icon) VALUES
('asset', 'Asset', '{"properties": {"value": {"type": "number"}}}', '{}', 'Gem') ON CONFLICT DO NOTHING;
INSERT INTO classes (id, name, json_schema, ui_schema, icon) VALUES
('ledger', 'Ledger', '{}', '{}', 'Table') ON CONFLICT DO NOTHING;
INSERT INTO classes (id, name, json_schema, ui_schema, icon) VALUES
('profile', 'Profile', '{"properties": {"role": {"type": "string"}, "email": {"type": "string"}}}', '{}', 'User') ON CONFLICT DO NOTHING;

-- SECURITY: Audit Logs (HIPAA Requirement)
-- Table for immutable audit trails of user and resource actions.
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Unique audit log entry ID.
    user_id UUID REFERENCES users(id),             -- User who performed the action.
    resource_id UUID,                              -- ID of the resource affected (e.g., Document ID).
    resource_type VARCHAR(50),                     -- Type of resource (e.g., Document, User, System).
    action VARCHAR(20),                            -- Action performed (e.g., READ, WRITE, DELETE, LOGIN).
    ip_address VARCHAR(45),                        -- IP address of the request origin (IPv4/IPv6).
    user_agent TEXT,                               -- User-Agent string from the client.
    details JSONB DEFAULT '{}',                    -- JSONB field for extra metadata about the action.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Timestamp of the audit event.
);

-- Indexes for efficient querying of audit logs.
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on sensitive tables to enforce access control at the database level.
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE neural_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: Policies for RLS will be strictly applied in production using database roles
-- and specific policy definitions, establishing a robust security boundary.
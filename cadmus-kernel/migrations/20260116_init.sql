CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    tier VARCHAR(50) DEFAULT 'Community',
    settings_json JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID,
    class_id VARCHAR(255),
    title TEXT NOT NULL,
    is_public BOOLEAN DEFAULT FALSE,
    properties JSONB DEFAULT '{}', -- Structured metadata for Classes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_updates (
    id SERIAL PRIMARY KEY,
    doc_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    data BYTEA NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_document_updates_doc_id ON document_updates(doc_id);

CREATE TABLE IF NOT EXISTS document_links (
    from_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    to_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    PRIMARY KEY (from_id, to_id)
);

CREATE TABLE IF NOT EXISTS neural_metadata (
    document_id UUID PRIMARY KEY REFERENCES documents(id) ON DELETE CASCADE,
    mass REAL DEFAULT 1.0,
    hp INTEGER DEFAULT 100,
    entropy REAL DEFAULT 0.0,
    embedding VECTOR(384),
    last_tick_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    json_schema JSONB NOT NULL,
    ui_schema JSONB NOT NULL,
    icon VARCHAR(50),
    owner_id UUID REFERENCES users(id)
);

-- Seed Primitives
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
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id), -- Quem fez
    resource_id UUID,                  -- O que foi acessado (Document ID)
    resource_type VARCHAR(50),         -- Tipo (Document, User, System)
    action VARCHAR(20),                -- READ, WRITE, DELETE, LOGIN
    ip_address VARCHAR(45),            -- Origem (IPv4/IPv6)
    user_agent TEXT,                   -- Dispositivo
    details JSONB DEFAULT '{}',        -- Metadados extras
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE neural_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: Policies will be strictly applied in production using database roles
-- For now, we establish the security boundary.
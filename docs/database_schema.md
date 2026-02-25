# 🗄️ Cadmus OS: Database Schema

This document details the core database schema of the Cadmus Sovereign Engine, outlining the purpose and key fields of its primary tables.

---

## Core Tables

### `users`
Stores user authentication and profile information.
- `id`: UUID (Primary Key) - Unique user identifier.
- `username`: VARCHAR(255) UNIQUE NOT NULL - User's unique username for login.
- `password_hash`: TEXT NOT NULL - Hashed password for security.
- `tier`: VARCHAR(50) DEFAULT 'Community' - User's service tier (e.g., Community, Pro).
- `settings_json`: JSONB DEFAULT '{}' - JSONB field for user-specific settings.
- `avatar_url`: TEXT - URL to the user's avatar image.
- `recovery_key`: TEXT - Key for password reset or account recovery.
- `trial_expires_at`: TIMESTAMP - Timestamp indicating when a free trial expires.
- `created_at`: TIMESTAMP - Timestamp of user creation.

### `documents`
Stores the metadata and structure of all knowledge nodes and content.
- `id`: UUID (Primary Key) - Unique document identifier.
- `owner_id`: UUID (FK to users.id) - User who owns this document.
- `parent_id`: UUID (Nullable, recursive link) - Optional parent document ID for hierarchical structures.
- `class_id`: VARCHAR(255) (FK to classes.id) - Identifier for the document's archetype/class.
- `title`: TEXT NOT NULL - Main title of the document.
- `is_public`: BOOLEAN DEFAULT FALSE - Visibility status of the document.
- `properties`: JSONB DEFAULT '{}' - JSONB field for flexible, structured document metadata specific to its class.
- `config`: JSONB DEFAULT '{}' - Hierarchical configuration overrides, supports cascading from Root -> Vault -> Doc.
- `created_at`: TIMESTAMP - Timestamp of document creation.
- `updated_at`: TIMESTAMP - Last update timestamp.

### `document_updates`
Stores the binary history of Yjs updates for collaborative editing, enabling real-time synchronization.
- `id`: SERIAL (Primary Key) - Auto-incrementing ID for the update.
- `doc_id`: UUID (FK to documents.id) - Document this update belongs to.
- `data`: BYTEA NOT NULL - Binary data of the Yjs update.
- `created_at`: TIMESTAMP - Timestamp of the update.

### `document_links`
Defines explicit relationships between documents, forming a graph structure for interconnected knowledge.
- `from_id`: UUID (FK to documents.id) - Source document of the link.
- `to_id`: UUID (FK to documents.id) - Target document of the link.
- `PRIMARY KEY (from_id, to_id)` - Composite primary key to ensure unique links.

### `neural_metadata`
Stores vector embeddings and other AI-related metadata for documents, powering neural search and physics-based ranking.
- `document_id`: UUID (Primary Key, FK to documents.id) - Document associated with this metadata.
- `mass`: REAL DEFAULT 1.0 - Physics-based ranking (Gravity) - mass attribute.
- `hp`: INTEGER DEFAULT 100 - Health/integrity points.
- `entropy`: REAL DEFAULT 0.0 - Measure of disorder/randomness.
- `embedding`: VECTOR(384) - Vector embedding for neural search, using the `pgvector` extension.
- `last_tick_at`: TIMESTAMP - Last time physics simulation was updated.

### `classes` (The Ontology)
Defines the structure and behavior of each Archetype, acting as a blueprint for documents.
- `id`: VARCHAR(255) (Primary Key) - Unique class identifier (e.g., "note", "asset", "project").
- `name`: VARCHAR(255) NOT NULL - Human-readable name of the class.
- `json_schema`: JSONB NOT NULL - JSON Schema for validating document properties of this class.
- `ui_schema`: JSONB NOT NULL - JSONB schema defining UI fields specific to this class.
- `behavior_rules`: JSONB NOT NULL - JSONB rules defining the behavior logic for this archetype (e.g., aggregation rules).
- `allowed_children`: TEXT[] - Native PostgreSQL TEXT array of IDs of archetypes that can be children of this class.
- `icon`: VARCHAR(50) - Icon for visual representation in the UI.
- `group_id`: VARCHAR(50) - Ontological categorization group (e.g., 'primitiva', 'operacional').
- `required_tier`: TEXT - Optional access tier required for documents of this class.
- `has_collection`: BOOLEAN DEFAULT false - Flag indicating if this class can function as a dynamic data collection.
- `owner_id`: UUID (FK to users.id) - Optional: User who created this custom class.

### `audit_logs`
Provides a HIPAA-compliant, verifiable audit trail of user and resource actions, ensuring integrity and traceability.
- `id`: UUID (Primary Key) - Unique audit log entry ID.
- `user_id`: UUID (FK to users.id) - User who performed the action.
- `resource_id`: UUID - ID of the resource affected (e.g., Document ID).
- `resource_type`: VARCHAR(50) - Type of resource (e.g., Document, User, System).
- `action`: VARCHAR(20) - Action performed (e.g., READ, WRITE, DELETE, LOGIN).
- `ip_address`: VARCHAR(45) - IP address of the request origin (IPv4/IPv6).
- `user_agent`: TEXT - User-Agent string from the client.
- `details`: JSONB DEFAULT '{}' - JSONB field for extra metadata about the action.
- `prev_hash`: TEXT - Stores the cryptographic hash of the previous audit log entry, forming a verifiable chain.
- `hash`: TEXT - Stores the cryptographic hash of the current audit log entry.
- `created_at`: TIMESTAMP - Timestamp of the audit event.

---

## Row Level Security (RLS) Policies
RLS is enabled and enforced on critical tables (`documents`, `neural_metadata`, `audit_logs`) to ensure data isolation and access control. Policies rely on a `SET LOCAL app.current_user_id` context set during authenticated transactions.
- **`documents_owner_policy`:** Ensures users can only access documents they own.
- **`neural_metadata_owner_policy`:** Links access to neural metadata to document ownership.
- **`audit_logs_owner_policy`:** Restricts users to viewing only their own audit logs.
- `FORCE ROW LEVEL SECURITY` is applied to these tables to ensure policies are always active.

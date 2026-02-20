# 🗄️ Cadmus OS: Database Schema

## Primary Tables

### `documents`
Stores the metadata and structure of knowledge nodes.
- `id`: UUID (Primary Key)
- `owner_id`: UUID (FK to users)
- `parent_id`: UUID (Nullable, recursive link)
- `class_id`: String (FK to classes)
- `title`: Text
- `properties`: JSONB (Dynamic fields)
- `config`: JSONB (Cascading configuration overrides)

### `document_updates`
Binary history for CRDT states and snapshots.
- `id`: Serial
- `doc_id`: UUID
- `data`: BYTEA (Binary Yjs updates or signed Snapshots)
- `created_at`: Timestamp

### `classes` (The Ontology)
Defines the structure and behavior of each Archetype.
- `id`: String (Primary Key)
- `name`: Text
- `ui_schema`: JSONB (Field definitions)
- `behavior_rules`: JSONB (Logic triggers)
- `group_id`: String (e.g., 'primitiva')
- `required_tier`: String

### `audit_logs`
HIPAA-compliant action chain.
- `id`: UUID
- `user_id`: UUID
- `action`: String (e.g., 'DOC_DELETE')
- `prev_hash`: Text (SHA-256 link to previous log)
- `hash`: Text (Current node integrity hash)

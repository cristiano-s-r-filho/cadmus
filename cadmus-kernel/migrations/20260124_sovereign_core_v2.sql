-- Sovereign Core V2 Atomic Update: Enhancements to `classes`, `documents`, and `audit_logs` tables.
-- This migration introduces new fields for archetype definition, improves document metadata handling,
-- and adds performance indexes.

-- 1. `classes` Table Structure Expansion:
--    Adds new columns to the `classes` table to support rich UI schema definitions,
--    behavioral rules, and allowed child archetypes, enabling dynamic archetype configurations.
ALTER TABLE classes ADD COLUMN IF NOT EXISTS ui_schema JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS behavior_rules JSONB DEFAULT '{}' NOT NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS allowed_children TEXT[] DEFAULT '{}';

-- 2. `documents` Table Enhancements and Performance Indexes:
--    Ensures the `properties` column is always present and non-null, and adds a GIN index
--    for efficient querying of JSONB 'tags' within document properties.
ALTER TABLE documents ADD COLUMN IF NOT EXISTS properties JSONB DEFAULT '{}' NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN ((properties->'tags'));

-- 3. Seeding of Core Archetypes (Update existing archetypes with new schemas/rules):
--    Updates the `ui_schema` and `behavior_rules` for predefined archetypes like 'task' and 'project'
--    to leverage the newly added columns.
-- TASK Archetype: Defines specific UI and behavior for tasks.
UPDATE classes SET 
    ui_schema = '[{"key": "status", "type": "select", "label": "STATUS", "options": ["todo", "doing", "done", "blocked"]},{"key": "due_date", "type": "date", "label": "DEADLINE"}]',
    behavior_rules = '{"on_complete": "suggest_archive"}'
WHERE id = 'task';

-- PROJECT Archetype: Defines UI and aggregation rules for projects.
UPDATE classes SET 
    ui_schema = '[{"key": "status", "type": "badge", "label": "STATE"},{"key": "progress", "type": "progress", "label": "COMPLETION"}]',
    behavior_rules = '{"aggregations": [{ "target": "progress", "source": "children", "filter": {"class_id": "task"}, "calc": "avg_completion" }]}'
WHERE id = 'project';

-- Ensure ui_schema and behavior_rules are non-null for any pre-existing classes without these defaults.
UPDATE classes SET ui_schema = '[]' WHERE ui_schema IS NULL;
UPDATE classes SET behavior_rules = '{}' WHERE behavior_rules IS NULL;

-- 4. `audit_logs` Table Indexing:
--    Adds an index for efficient querying of audit logs by `resource_id`.
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);

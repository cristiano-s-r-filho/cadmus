-- ATUALIZAÇÃO ATÔMICA: SOVEREIGN CORE V2
-- 1. Estrutura da Tabela de Classes
ALTER TABLE classes ADD COLUMN IF NOT EXISTS ui_schema JSONB DEFAULT '[]' NOT NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS behavior_rules JSONB DEFAULT '{}' NOT NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS allowed_children TEXT[] DEFAULT '{}';

-- 2. Índices de Performance e Tags
ALTER TABLE documents ADD COLUMN IF NOT EXISTS properties JSONB DEFAULT '{}' NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_tags ON documents USING GIN ((properties->'tags'));

-- 3. Seeding de Contratos (Active Archetypes)
-- TASK
UPDATE classes SET 
    ui_schema = '[{"key": "status", "type": "select", "label": "STATUS", "options": ["todo", "doing", "done", "blocked"]},{"key": "due_date", "type": "date", "label": "DEADLINE"}]',
    behavior_rules = '{"on_complete": "suggest_archive"}'
WHERE id = 'task';

-- PROJECT
UPDATE classes SET 
    ui_schema = '[{"key": "status", "type": "badge", "label": "STATE"},{"key": "progress", "type": "progress", "label": "COMPLETION"}]',
    behavior_rules = '{"aggregations": [{ "target": "progress", "source": "children", "filter": {"class_id": "task"}, "calc": "avg_completion" }]}'
WHERE id = 'project';

-- Outras classes seguem o padrão...
UPDATE classes SET ui_schema = '[]' WHERE ui_schema IS NULL;
UPDATE classes SET behavior_rules = '{}' WHERE behavior_rules IS NULL;

-- 4. Auditoria
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON audit_logs(resource_id);

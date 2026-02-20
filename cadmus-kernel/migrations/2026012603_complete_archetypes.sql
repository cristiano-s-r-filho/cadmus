-- ATUALIZAÇÃO COMPLETA: 7 ACTIVE ARCHETYPES
-- Esta migração define os contratos visuais e lógicos para todas as classes do sistema.

-- 1. NOTE (Partícula Fundamental)
UPDATE classes SET 
    ui_schema = '[
        {"key": "tags", "type": "tags", "label": "Context Tags"},
        {"key": "source_url", "type": "text", "label": "Source Link"},
        {"key": "importance", "type": "select", "label": "Priority Level", "options": ["Low", "Medium", "High", "Critical"]}
    ]',
    behavior_rules = '{
        "inheritance": { "tags": "merge_unique" }
    }',
    allowed_children = '{"note", "canvas", "media"}'
WHERE id = 'note';

-- 2. ASSET (Recurso Valorável)
UPDATE classes SET 
    ui_schema = '[
        {"key": "value", "type": "money", "label": "Estimated Value", "currency": "USD", "confidential": true},
        {"key": "currency", "type": "select", "label": "Currency", "options": ["USD", "EUR", "BRL", "BTC"]},
        {"key": "category", "type": "select", "label": "Category", "options": ["Hardware", "Software", "License", "Property"]},
        {"key": "acquired_at", "type": "date", "label": "Acquisition Date"}
    ]',
    behavior_rules = '{
        "on_update": "recalculate_ledger"
    }',
    allowed_children = '{"note", "media", "doc"}'
WHERE id = 'asset';

-- 3. LEDGER (Livro-Caixa)
UPDATE classes SET 
    ui_schema = '[
        {"key": "balance", "type": "money", "label": "Total Balance", "read_only": true},
        {"key": "last_audit", "type": "date", "label": "Last Audit"},
        {"key": "status", "type": "badge", "label": "Ledger Status"}
    ]',
    behavior_rules = '{
        "aggregations": [
            { "target": "balance", "source": "children", "filter": {"class_id": "asset"}, "calc": "sum_value" }
        ]
    }',
    allowed_children = '{"asset", "note"}'
WHERE id = 'ledger';

-- 4. CONTAINER (Agregador Estrutural)
UPDATE classes SET 
    ui_schema = '[
        {"key": "category", "type": "text", "label": "Vault Category"},
        {"key": "storage_limit", "type": "text", "label": "Storage Quota", "read_only": true},
        {"key": "default_clearance", "type": "select", "label": "Default Access", "options": ["Public", "Team", "Confidential", "Top Secret"]}
    ]',
    behavior_rules = '{
        "guardrails": { "restrict_children": true }
    }',
    allowed_children = '{"project", "ledger", "note", "container", "task", "profile", "asset"}'
WHERE id = 'container';

-- 5. PROFILE (Entidade/Pessoa)
UPDATE classes SET 
    ui_schema = '[
        {"key": "role", "type": "text", "label": "Organizational Role"},
        {"key": "email", "type": "email", "label": "Contact Email", "confidential": true},
        {"key": "access_level", "type": "select", "label": "System Clearance", "options": ["L1", "L2", "L3", "Admin"]},
        {"key": "status", "type": "badge", "label": "Availability"}
    ]',
    behavior_rules = '{
        "indexing": { "track_mentions": true }
    }',
    allowed_children = '{"note", "task"}'
WHERE id = 'profile';

-- 6. PROJECT (Atualização do existente para Human Readable)
UPDATE classes SET 
    ui_schema = '[
        {"key": "status", "type": "badge", "label": "Project State"},
        {"key": "progress", "type": "progress", "label": "Completion Rate"},
        {"key": "client", "type": "text", "label": "Client Code"}
    ]',
    allowed_children = '{"task", "note", "canvas", "ledger", "container"}'
WHERE id = 'project';

-- 7. TASK (Atualização do existente para Human Readable)
UPDATE classes SET 
    ui_schema = '[
        {"key": "status", "type": "select", "label": "Status", "options": ["To Do", "In Progress", "Done", "Blocked"]},
        {"key": "priority", "type": "select", "label": "Priority", "options": ["Low", "Medium", "High"]},
        {"key": "due_date", "type": "date", "label": "Due Date"}
    ]',
    allowed_children = '{"note", "checklist"}'
WHERE id = 'task';

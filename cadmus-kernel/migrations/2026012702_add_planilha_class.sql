-- Registra a classe Folha com UI_SCHEMA de colunas dinâmicas
INSERT INTO classes (id, name, json_schema, ui_schema, behavior_rules, icon, has_collection) 
VALUES (
    'folha', 
    'Planilha', 
    '{"type": "object", "properties": {"columns": {"type": "array"}}}', 
    '[{"key": "col1", "type": "text", "label": "Coluna A"}, {"key": "col2", "type": "number", "label": "Coluna B"}]', 
    '{"engine": "spreadsheet"}', 
    'Table', 
    true
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    ui_schema = EXCLUDED.ui_schema,
    json_schema = EXCLUDED.json_schema,
    has_collection = true;

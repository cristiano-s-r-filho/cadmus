-- Registers the 'Planilha' (Spreadsheet) class, designed to support dynamic columns
-- and function as a data collection. This migration ensures the class is present
-- and its schema is up-to-date, using ON CONFLICT DO UPDATE for idempotency.
INSERT INTO classes (id, name, json_schema, ui_schema, behavior_rules, icon, has_collection) 
VALUES (
    'folha',        -- Unique identifier for the 'Planilha' class.
    'Planilha',     -- Human-readable name.
    '{"type": "object", "properties": {"columns": {"type": "array"}}}', -- Basic JSON schema for dynamic columns.
    '[{"key": "col1", "type": "text", "label": "Coluna A"}, {"key": "col2", "type": "number", "label": "Coluna B"}]', -- Example UI schema for initial columns.
    '{"engine": "spreadsheet"}', -- Behavior rule indicating it's a spreadsheet engine.
    'Table',        -- Icon for visual representation.
    true            -- Flag indicating this class can function as a collection.
) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    ui_schema = EXCLUDED.ui_schema,
    json_schema = EXCLUDED.json_schema,
    has_collection = true;

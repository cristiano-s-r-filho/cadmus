-- ONTOLOGICAL EXPANSION: Professional Classes V1.
-- This migration introduces several new class archetypes with predefined UI schemas,
-- behavior rules, icons, and collection capabilities, enhancing the system's flexibility.

INSERT INTO classes (id, name, json_schema, ui_schema, behavior_rules, icon, has_collection) VALUES
('meeting', 'Reunião', '{}', -- Class for meeting notes and organization.
 '[{"key": "attendees", "type": "text", "label": "Participantes"}, {"key": "date", "type": "date", "label": "Data"}]', 
 '{}', 'Users', false),

('blueprint', 'Blueprint', '{}', -- Class for design documents or blueprints.
 '[{"key": "version", "type": "text", "label": "Versão"}, {"key": "status", "type": "select", "label": "Status", "options": ["Draft", "Review", "Approved"]}]', 
 '{}', 'Zap', false),

('inventory', 'Estoque', '{}', -- Class for managing inventory items, with collection capabilities.
 '[{"key": "sku", "type": "text", "label": "SKU"}, {"key": "quantity", "type": "number", "label": "Qtd"}]', 
 '{"engine": "collection"}', 'Box', true),

('contract', 'Contrato', '{}', -- Class for contract management.
 '[{"key": "client", "type": "text", "label": "Cliente"}, {"key": "expires", "type": "date", "label": "Expiração"}]', 
 '{}', 'Shield', false),

('finance', 'Financeiro', '{}', -- Class for financial records, with collection capabilities.
 '[{"key": "total", "type": "money", "label": "Valor Total"}, {"key": "category", "type": "select", "label": "Tipo", "options": ["Income", "Expense"]}]', 
 '{"engine": "collection"}', 'Gem', true)
ON CONFLICT (id) DO NOTHING; -- Ensures idempotency: inserts if not exists, otherwise does nothing.

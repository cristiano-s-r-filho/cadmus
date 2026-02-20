-- EXPANSÃO ONTOLÓGICA: CLASSES PROFISSIONAIS V1
INSERT INTO classes (id, name, json_schema, ui_schema, behavior_rules, icon, has_collection) VALUES
('meeting', 'Reunião', '{}', 
 '[{"key": "attendees", "type": "text", "label": "Participantes"}, {"key": "date", "type": "date", "label": "Data"}]', 
 '{}', 'Users', false),

('blueprint', 'Blueprint', '{}', 
 '[{"key": "version", "type": "text", "label": "Versão"}, {"key": "status", "type": "select", "label": "Status", "options": ["Draft", "Review", "Approved"]}]', 
 '{}', 'Zap', false),

('inventory', 'Estoque', '{}', 
 '[{"key": "sku", "type": "text", "label": "SKU"}, {"key": "quantity", "type": "number", "label": "Qtd"}]', 
 '{"engine": "collection"}', 'Box', true),

('contract', 'Contrato', '{}', 
 '[{"key": "client", "type": "text", "label": "Cliente"}, {"key": "expires", "type": "date", "label": "Expiração"}]', 
 '{}', 'Shield', false),

('finance', 'Financeiro', '{}', 
 '[{"key": "total", "type": "money", "label": "Valor Total"}, {"key": "category", "type": "select", "label": "Tipo", "options": ["Income", "Expense"]}]', 
 '{"engine": "collection"}', 'Gem', true)
ON CONFLICT (id) DO NOTHING;

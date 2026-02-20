-- Suporte para Governança em Cascata (GAP 5)
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}' NOT NULL;

COMMENT ON COLUMN documents.config IS 'Hierarchical configuration overrides. Supports cascading from Root -> Vault -> Doc.';

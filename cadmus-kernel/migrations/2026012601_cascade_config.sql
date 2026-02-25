-- Cascade Configuration Support (GAP 5):
-- This migration introduces a `config` column to the `documents` table, enabling
-- hierarchical configuration overrides that can cascade from parent documents down to children.

ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}' NOT NULL;

COMMENT ON COLUMN documents.config IS 'Hierarchical configuration overrides. Supports cascading from Root -> Vault -> Doc.';

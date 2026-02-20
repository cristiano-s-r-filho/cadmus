-- Collection Engine Infrastructure (GAP 7)
CREATE TABLE IF NOT EXISTS collection_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    data JSONB DEFAULT '{}' NOT NULL,
    order_index SERIAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_collection_rows_doc_id ON collection_rows(document_id);

-- Criamos a coluna se ela não existir
ALTER TABLE classes ADD COLUMN IF NOT EXISTS has_collection BOOLEAN DEFAULT false;

-- Populamos os dados garantindo integridade
UPDATE classes SET has_collection = true WHERE id IN ('ledger', 'project');

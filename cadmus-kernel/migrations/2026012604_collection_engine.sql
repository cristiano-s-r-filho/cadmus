-- Collection Engine Infrastructure (GAP 7):
-- This migration sets up the necessary tables and fields to support the dynamic
-- Collection Engine, allowing documents to act as data collections.

-- `collection_rows` table to store individual rows of data for collection-type documents.
CREATE TABLE IF NOT EXISTS collection_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),               -- Unique identifier for each row.
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE, -- The parent collection document.
    data JSONB DEFAULT '{}' NOT NULL,                            -- JSONB field to store arbitrary row data.
    order_index SERIAL,                                          -- For maintaining row order within a collection.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- Timestamp of row creation.
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP  -- Last update timestamp.
);

-- Index for efficient querying of collection rows by their parent document ID.
CREATE INDEX IF NOT EXISTS idx_collection_rows_doc_id ON collection_rows(document_id);

-- `classes` table update: Add `has_collection` flag.
-- This column indicates whether a specific archetype can function as a collection.
ALTER TABLE classes ADD COLUMN IF NOT EXISTS has_collection BOOLEAN DEFAULT false;

-- Populate data: Set `has_collection` to true for specific archetypes.
-- Ensures that certain archetypes (like 'ledger', 'project') are designated as collections.
UPDATE classes SET has_collection = true WHERE id IN ('ledger', 'project');

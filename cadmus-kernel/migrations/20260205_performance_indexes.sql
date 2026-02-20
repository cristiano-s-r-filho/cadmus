-- Performance Optimization for Sovereign Stats

-- 1. Index for Class Distribution
CREATE INDEX IF NOT EXISTS idx_documents_class_id ON documents(class_id);

-- 2. GIN Index for JSONB properties (Accelerates tag counting and property lookups)
CREATE INDEX IF NOT EXISTS idx_documents_properties ON documents USING GIN (properties);

-- 3. Index for Recent Activity
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);

-- 4. Index for Parent lookups (Tree/Hierarchy)
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents(parent_id);

-- Performance Optimization for Sovereign Stats and Document Operations.
-- This migration adds several key indexes to the `documents` table to improve
-- query performance for statistics, property lookups, and hierarchical navigation.

-- 1. Index for Class Distribution:
--    Accelerates queries that group or filter documents by their `class_id`,
--    improving the performance of class distribution statistics.
CREATE INDEX IF NOT EXISTS idx_documents_class_id ON documents(class_id);

-- 2. GIN Index for JSONB properties:
--    Significantly accelerates queries and operations on the `properties` JSONB column,
--    especially useful for tag counting and general property lookups within documents.
CREATE INDEX IF NOT EXISTS idx_documents_properties ON documents USING GIN (properties);

-- 3. Index for Recent Activity:
--    Optimizes queries that order or filter documents by their last update time,
--    improving the performance of "recent documents" features.
CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents(updated_at DESC);

-- 4. Index for Parent Lookups (Tree/Hierarchy):
--    Enhances performance for queries involving hierarchical document structures,
--    such as finding children of a parent document.
CREATE INDEX IF NOT EXISTS idx_documents_parent_id ON documents(parent_id);

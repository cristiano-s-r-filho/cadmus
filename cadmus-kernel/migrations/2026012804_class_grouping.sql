-- ONTOLOGICAL CATEGORIZATION (GAP FIX):
-- This migration enhances the `classes` table by introducing a `group_id` column
-- for ontological categorization of archetypes, and populates initial groups.

-- Add `group_id` column to the `classes` table. Defaults to 'primitiva' if not specified.
ALTER TABLE classes ADD COLUMN IF NOT EXISTS group_id VARCHAR(50) DEFAULT 'primitiva';

-- Update existing classes to assign them to specific ontological groups.
UPDATE classes SET group_id = 'primitiva' WHERE id IN ('note', 'task', 'project', 'container', 'profile', 'ledger', 'asset');
UPDATE classes SET group_id = 'operacional' WHERE id IN ('meeting', 'blueprint', 'inventory');
UPDATE classes SET group_id = 'recursos' WHERE id IN ('contract', 'finance');
UPDATE classes SET group_id = 'dados' WHERE id = 'folha';

-- Create an index on `group_id` for improved query performance when filtering by class group.
CREATE INDEX IF NOT EXISTS idx_classes_group ON classes(group_id);

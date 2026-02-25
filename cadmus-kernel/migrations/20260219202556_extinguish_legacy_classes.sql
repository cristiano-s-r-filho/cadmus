-- Extinction of Legacy Archetypes: Blueprint, Meeting, Contract, Finance, Inventory.
-- This migration ensures a clean system state by deprecating and removing older,
-- less flexible archetype definitions. It prevents orphaned documents by reassigning
-- them to the generic 'note' class before deleting the legacy archetypes.

-- 1. Reassign any existing documents associated with legacy class IDs to the base 'note' class.
--    This prevents orphaned documents and ensures data integrity during archetype removal.
UPDATE documents SET class_id = 'note' WHERE class_id IN ('blueprint', 'meeting', 'contract', 'finance', 'inventory');

-- 2. Remove the deprecated legacy class definitions from the system registry.
--    This cleans up the `classes` table, keeping the ontology lean and current.
DELETE FROM classes WHERE id IN ('blueprint', 'meeting', 'contract', 'finance', 'inventory');

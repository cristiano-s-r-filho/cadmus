-- Extinction of Legacy Archetypes: Blueprint, Meeting, Contract, Finance, Inventory
-- 1. Reassign any existing documents to base 'note' class to prevent orphans
UPDATE documents SET class_id = 'note' WHERE class_id IN ('blueprint', 'meeting', 'contract', 'finance', 'inventory');

-- 2. Remove the classes from the system registry
DELETE FROM classes WHERE id IN ('blueprint', 'meeting', 'contract', 'finance', 'inventory');

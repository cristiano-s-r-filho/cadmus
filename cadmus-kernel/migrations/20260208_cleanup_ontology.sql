-- Ontology Cleanup: Removes deprecated or unused class archetypes.
-- This migration ensures that the system's ontology remains lean and up-to-date
-- by deleting class definitions that are no longer actively used or supported.

DELETE FROM classes WHERE id IN ('meeting', 'stock', 'blueprint', 'finance', 'contract');

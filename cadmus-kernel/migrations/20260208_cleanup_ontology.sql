-- Remove deprecated classes
DELETE FROM classes WHERE id IN ('meeting', 'stock', 'blueprint', 'finance', 'contract');

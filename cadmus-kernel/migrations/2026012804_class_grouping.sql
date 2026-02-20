-- CATEGORIZAÇÃO ONTOLÓGICA (GAP FIX)
ALTER TABLE classes ADD COLUMN IF NOT EXISTS group_id VARCHAR(50) DEFAULT 'primitiva';

-- Atualiza Grupos
UPDATE classes SET group_id = 'primitiva' WHERE id IN ('note', 'task', 'project', 'container', 'profile', 'ledger', 'asset');
UPDATE classes SET group_id = 'operacional' WHERE id IN ('meeting', 'blueprint', 'inventory');
UPDATE classes SET group_id = 'recursos' WHERE id IN ('contract', 'finance');
UPDATE classes SET group_id = 'dados' WHERE id = 'folha';

-- Indexação para performance
CREATE INDEX IF NOT EXISTS idx_classes_group ON classes(group_id);

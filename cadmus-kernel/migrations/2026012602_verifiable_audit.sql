-- Implementação de Integridade Soberana (GAP 3.2)
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS prev_hash TEXT,
ADD COLUMN IF NOT EXISTS hash TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(created_at DESC);

COMMENT ON COLUMN audit_logs.hash IS 'SHA-256 hash of (user_id + resource_id + action + details + prev_hash)';

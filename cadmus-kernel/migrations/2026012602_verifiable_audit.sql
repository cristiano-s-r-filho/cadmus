-- Verifiable Audit Trail Implementation (GAP 3.2: Sovereign Integrity):
-- This migration enhances the `audit_logs` table to support a verifiable,
-- blockchain-like audit trail through cryptographic hashing.

ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS prev_hash TEXT, -- Stores the hash of the previous audit log entry, forming a chain.
ADD COLUMN IF NOT EXISTS hash TEXT;      -- Stores the cryptographic hash of the current audit log entry.

-- Index for efficient querying of audit logs by creation timestamp, especially for chronological lookups.
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(created_at DESC);

COMMENT ON COLUMN audit_logs.hash IS 'Cryptographic hash (SHA-256) of (user_id + resource_id + action + details + prev_hash)';

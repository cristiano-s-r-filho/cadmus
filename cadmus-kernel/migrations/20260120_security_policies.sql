-- HIPAA COMPLIANCE: Row Level Security Policies

-- 1. Documents: Only owner can access
CREATE POLICY documents_owner_policy ON documents
    FOR ALL
    USING (owner_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID);

-- 2. Neural Metadata: Matches document ownership
CREATE POLICY neural_metadata_owner_policy ON neural_metadata
    FOR ALL
    USING (document_id IN (SELECT id FROM documents));

-- 3. Audit Logs: Users can only see their own logs
CREATE POLICY audit_logs_owner_policy ON audit_logs
    FOR ALL
    USING (user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID);

-- 4. Apply to tables
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
ALTER TABLE neural_metadata FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

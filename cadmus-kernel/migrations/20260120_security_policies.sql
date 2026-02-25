-- Row Level Security (RLS) Policies for HIPAA Compliance and Data Isolation.
-- These policies ensure that users can only access data they own or are authorized to see.
-- They rely on the `app.current_user_id` session variable, which is set by the application
-- at the beginning of an authenticated database transaction.

-- 1. `documents` Table: Enforce ownership-based access.
--    Users can only access documents where `owner_id` matches their authenticated `current_user_id`.
CREATE POLICY documents_owner_policy ON documents
    FOR ALL  -- Applies to SELECT, INSERT, UPDATE, DELETE operations.
    USING (owner_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID);

-- 2. `neural_metadata` Table: Link access to document ownership.
--    Users can only access neural metadata entries for documents they can access.
CREATE POLICY neural_metadata_owner_policy ON neural_metadata
    FOR ALL
    USING (document_id IN (SELECT id FROM documents WHERE owner_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID));

-- 3. `audit_logs` Table: Users can only view their own audit trails.
--    This ensures privacy and prevents unauthorized access to audit records.
CREATE POLICY audit_logs_owner_policy ON audit_logs
    FOR ALL
    USING (user_id = NULLIF(current_setting('app.current_user_id', TRUE), '')::UUID);

-- 4. Apply FORCE ROW LEVEL SECURITY to tables.
--    This ensures that RLS policies are always enforced, even for superusers
--    (unless specifically bypassed with `SET session_replication_role = 'replica'`).
ALTER TABLE documents FORCE ROW LEVEL SECURITY;
ALTER TABLE neural_metadata FORCE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

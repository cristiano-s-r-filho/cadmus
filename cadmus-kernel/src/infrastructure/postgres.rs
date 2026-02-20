use async_trait::async_trait;
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;
use crate::domain::repository::{DocumentRepository, ArchetypeRepository, AuditRepository};
use crate::domain::archetypes::Archetype;
use crate::modules::content::workspace::WorkspaceNode;
use serde_json::json;

pub struct PostgresDocumentRepository {
    pool: PgPool,
}

impl PostgresDocumentRepository {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    async fn start_authenticated_tx(&self, user_id: Uuid) -> anyhow::Result<Transaction<'_, Postgres>> {
        let mut tx = self.pool.begin().await?;
        sqlx::query(&format!("SET LOCAL app.current_user_id = '{}'", user_id))
            .execute(&mut *tx)
            .await?;
        Ok(tx)
    }
}

#[async_trait]
impl DocumentRepository for PostgresDocumentRepository {
    async fn create(&self, owner_id: Uuid, title: String, class_id: Option<String>, parent_id: Option<Uuid>) -> anyhow::Result<WorkspaceNode> {
        let mut tx = self.start_authenticated_tx(owner_id).await?;
        let id = Uuid::new_v4();
        let final_class_id = class_id.unwrap_or_else(|| "note".to_string());

        sqlx::query(
            "INSERT INTO documents (id, owner_id, title, class_id, parent_id, properties) VALUES ($1, $2, $3, $4, $5, '{}'::jsonb)"
        )
        .bind(id)
        .bind(owner_id)
        .bind(&title)
        .bind(&final_class_id)
        .bind(parent_id)
        .execute(&mut *tx)
        .await?;

        tx.commit().await?;

        Ok(WorkspaceNode {
            id,
            title,
            parent_id,
            class_id: Some(final_class_id),
            properties: json!({}),
        })
    }

    async fn find_recent(&self, owner_id: Uuid, limit: i64) -> anyhow::Result<Vec<WorkspaceNode>> {
        let nodes = sqlx::query_as::<_, WorkspaceNode>(
            r#"
            SELECT id, title, parent_id, class_id, COALESCE(properties, '{}'::jsonb) as properties
            FROM documents
            WHERE owner_id = $1
            ORDER BY updated_at DESC
            LIMIT $2
            "#
        )
        .bind(owner_id)
        .bind(limit)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| { tracing::error!("SQLX_RECENT_FAIL: {:?}", e); e })?;

        Ok(nodes)
    }

    async fn find_all(&self, owner_id: Uuid) -> anyhow::Result<Vec<WorkspaceNode>> {
        let nodes = sqlx::query_as::<_, WorkspaceNode>(
            r#"
            SELECT id, title, parent_id, class_id, COALESCE(properties, '{}'::jsonb) as properties
            FROM documents
            WHERE owner_id = $1
            ORDER BY title ASC
            "#
        )
        .bind(owner_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| { tracing::error!("SQLX_ALL_FAIL: {:?}", e); e })?;

        Ok(nodes)
    }

    async fn find_by_id(&self, id: Uuid) -> anyhow::Result<Option<WorkspaceNode>> {
        let node = sqlx::query_as::<_, WorkspaceNode>(
            r#"
            SELECT id, title, parent_id, class_id, COALESCE(properties, '{}'::jsonb) as properties
            FROM documents
            WHERE id = $1
            "#
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| { tracing::error!("SQLX_BY_ID_FAIL ({}): {:?}", id, e); e })?;

        Ok(node)
    }

    async fn delete(&self, id: Uuid, _owner_id: Uuid) -> anyhow::Result<()> {
        sqlx::query("DELETE FROM documents WHERE id = $1")
            .bind(id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn get_stats(&self, owner_id: Uuid) -> anyhow::Result<crate::kernel::types::SystemStats> {
        let nodes: i32 = sqlx::query_scalar("SELECT COUNT(*)::int4 FROM documents WHERE owner_id = $1")
            .bind(owner_id).fetch_one(&self.pool).await?;

        let links: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM document_links l JOIN documents d ON l.from_id = d.id WHERE d.owner_id = $1")
            .bind(owner_id).fetch_one(&self.pool).await?;

        let recent: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM documents WHERE owner_id = $1 AND updated_at > NOW() - INTERVAL '24 hours'")
            .bind(owner_id).fetch_one(&self.pool).await?;

        let rows = sqlx::query("SELECT class_id, COUNT(*)::int4 FROM documents WHERE owner_id = $1 GROUP BY class_id")
            .bind(owner_id).fetch_all(&self.pool).await?;

        let mut distribution = std::collections::HashMap::new();
        for r in rows {
            use sqlx::Row;
            let cid: Option<String> = r.get(0); // Handle NULL class_id
            let count: i32 = r.get(1);
            distribution.insert(cid.unwrap_or_else(|| "unknown".to_string()), count);
        }

        let orphans: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*) FROM documents d
            WHERE owner_id = $1
              AND NOT EXISTS (SELECT 1 FROM document_links WHERE from_id = d.id OR to_id = d.id)
              AND parent_id IS NULL
            "#
        ).bind(owner_id).fetch_one(&self.pool).await?;

        let untagged: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*) FROM documents 
            WHERE owner_id = $1 
              AND (
                properties->'tags' IS NULL 
                OR properties->'tags' = '[]'::jsonb
                OR jsonb_typeof(properties->'tags') <> 'array'
              )
            "#
        ).bind(owner_id).fetch_one(&self.pool).await?;

        Ok(crate::kernel::types::SystemStats {
            nodes,
            class_distribution: distribution,
            recent_activity_count: recent as i32,
            total_links: links as i32,
            orphan_nodes: orphans as i32,
            untagged_nodes: untagged as i32,
        })
    }

    async fn update_property(&self, doc_id: Uuid, key: &str, value: serde_json::Value) -> anyhow::Result<()> {
        tracing::info!("[SQL_EXEC] Attempting property update: doc={}, key={}", doc_id, key);
        
        if key == "title" {
            let title = value.as_str().unwrap_or("UNTITLED");
            let result = sqlx::query("UPDATE documents SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2")
                .bind(title)
                .bind(doc_id)
                .execute(&self.pool)
                .await?;
            tracing::debug!("[SQL_SUCCESS] Title updated. Rows affected: {}", result.rows_affected());
        } else {
            let json_patch = serde_json::json!({ key: value });
            let result = sqlx::query("UPDATE documents SET properties = COALESCE(properties, '{}'::jsonb) || $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2")
                .bind(&json_patch)
                .bind(doc_id)
                .execute(&self.pool)
                .await?;
            tracing::debug!("[SQL_SUCCESS] Property '{}' merged into JSONB. Rows affected: {}", key, result.rows_affected());
        }
        Ok(())
    }

    async fn update_embedding(&self, doc_id: Uuid, embedding: Vec<f32>) -> anyhow::Result<()> {
        sqlx::query("UPDATE neural_metadata SET embedding = $1 WHERE document_id = $2")
            .bind(pgvector::Vector::from(embedding))
            .bind(doc_id)
            .execute(&self.pool)
            .await?;
        Ok(())
    }

    async fn search_similar(&self, embedding: Vec<f32>, limit: i64) -> anyhow::Result<Vec<Uuid>> {
        let rows = sqlx::query_scalar(
            "SELECT document_id FROM neural_metadata ORDER BY embedding <-> $1 LIMIT $2"
        )
        .bind(pgvector::Vector::from(embedding))
        .bind(limit)
        .fetch_all(&self.pool)
        .await?;
        Ok(rows)
    }

    async fn add_link(&self, from_id: Uuid, to_id: Uuid) -> anyhow::Result<()> {
        sqlx::query("INSERT INTO document_links (from_id, to_id) VALUES ($1, $2) ON CONFLICT DO NOTHING")
            .bind(from_id).bind(to_id).execute(&self.pool).await?;
        Ok(())
    }

    async fn find_links(&self, owner_id: Uuid) -> anyhow::Result<Vec<(Uuid, Uuid)>> {
        let rows = sqlx::query_as::<_, (Uuid, Uuid)>(
            "SELECT l.from_id, l.to_id FROM document_links l JOIN documents d ON l.from_id = d.id WHERE d.owner_id = $1"
        ).bind(owner_id).fetch_all(&self.pool).await?;
        Ok(rows)
    }

    async fn get_aggregate_sum(&self, parent_id: Uuid, property_key: &str) -> anyhow::Result<f64> {
        let sum: Option<f64> = sqlx::query_scalar(
            r#"
            SELECT SUM(
                CASE 
                    WHEN jsonb_typeof(properties->$1) = 'number' THEN (properties->$1)::numeric
                    ELSE 0 
                END
            )::float8 
            FROM documents 
            WHERE (parent_id = $2 OR id IN (SELECT to_id FROM document_links WHERE from_id = $2))
              AND id <> $2
            "#
        )
        .bind(property_key)
        .bind(parent_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(sum.unwrap_or(0.0))
    }

    async fn find_children_properties(&self, parent_id: Uuid, class_filter: Option<String>) -> anyhow::Result<Vec<serde_json::Value>> {
        let rows = if let Some(cf) = class_filter {
            sqlx::query_scalar::<_, serde_json::Value>("SELECT properties FROM documents WHERE parent_id = $1 AND class_id = $2")
                .bind(parent_id).bind(cf).fetch_all(&self.pool).await?
        } else {
            sqlx::query_scalar::<_, serde_json::Value>("SELECT properties FROM documents WHERE parent_id = $1")
                .bind(parent_id).fetch_all(&self.pool).await?
        };
        Ok(rows)
    }

    async fn get_tags_with_inheritance(&self, doc_id: Uuid) -> anyhow::Result<Vec<String>> {
        let tags: Vec<String> = sqlx::query_scalar(
            r#"
            WITH RECURSIVE lineage AS (
                SELECT id, parent_id, properties->'tags' as tags FROM documents WHERE id = $1
                UNION ALL
                SELECT d.id, d.parent_id, d.properties->'tags' FROM documents d
                INNER JOIN lineage l ON d.id = l.parent_id
            )
            SELECT DISTINCT jsonb_array_elements_text(tags) FROM lineage WHERE tags IS NOT NULL AND jsonb_typeof(tags) = 'array'
            "#
        ).bind(doc_id).fetch_all(&self.pool).await.unwrap_or_default();
        Ok(tags)
    }

    async fn get_collection_rows(&self, doc_id: Uuid) -> anyhow::Result<Vec<serde_json::Value>> {
        let rows = sqlx::query_as::<_, (Uuid, serde_json::Value)>(
            "SELECT id, data FROM collection_rows WHERE document_id = $1 ORDER BY order_index ASC"
        ).bind(doc_id).fetch_all(&self.pool).await?;
        Ok(rows.into_iter().map(|(id, mut data)| {
            if let Some(obj) = data.as_object_mut() { obj.insert("id".to_string(), json!(id)); }
            data
        }).collect())
    }

    async fn update_collection_cell(&self, _doc_id: Uuid, row_id: Uuid, col_id: &str, value: serde_json::Value) -> anyhow::Result<()> {
        sqlx::query("UPDATE collection_rows SET data = jsonb_set(data, ARRAY[$1], $2), updated_at = CURRENT_TIMESTAMP WHERE id = $3")
            .bind(col_id).bind(value).bind(row_id).execute(&self.pool).await?;
        Ok(())
    }

    async fn add_collection_row(&self, doc_id: Uuid) -> anyhow::Result<serde_json::Value> {
        let id = Uuid::new_v4();
        let data = json!({});
        sqlx::query("INSERT INTO collection_rows (id, document_id, data) VALUES ($1, $2, $3)")
            .bind(id).bind(doc_id).bind(&data).execute(&self.pool).await?;
        let mut result = data;
        if let Some(obj) = result.as_object_mut() { obj.insert("id".to_string(), json!(id)); }
        Ok(result)
    }
}

pub struct PostgresArchetypeRepository { pool: PgPool }
impl PostgresArchetypeRepository { pub fn new(pool: PgPool) -> Self { Self { pool } } }
#[async_trait]
impl ArchetypeRepository for PostgresArchetypeRepository {
    async fn find_all(&self) -> anyhow::Result<Vec<Archetype>> {
        // FIXED: Column Aliases for explicit sqlx mapping
        sqlx::query_as::<_, Archetype>(
            r#"
            SELECT 
                id, 
                name, 
                icon, 
                group_id,
                required_tier,
                COALESCE(ui_schema, '[]'::jsonb) AS ui_schema, 
                COALESCE(behavior_rules, '{}'::jsonb) AS behavior_rules, 
                allowed_children 
            FROM classes
            "#
        )
        .fetch_all(&self.pool).await.map_err(|e| anyhow::anyhow!("DB_ERROR: {}", e))
    }
    async fn find_by_id(&self, id: &str) -> anyhow::Result<Option<Archetype>> {
        sqlx::query_as::<_, Archetype>(
            r#"
            SELECT 
                id, 
                name, 
                icon, 
                group_id,
                COALESCE(ui_schema, '[]'::jsonb) AS ui_schema, 
                COALESCE(behavior_rules, '{}'::jsonb) AS behavior_rules, 
                allowed_children 
            FROM classes 
            WHERE id = $1
            "#
        )
        .bind(id).fetch_optional(&self.pool).await.map_err(|e| anyhow::anyhow!("DB_ERROR: {}", e))
    }
}

pub struct PostgresAuditRepository { pool: PgPool }
impl PostgresAuditRepository { pub fn new(pool: PgPool) -> Self { Self { pool } } }
#[async_trait]
impl AuditRepository for PostgresAuditRepository {
    async fn log(&self, user_id: Option<Uuid>, resource_id: Option<Uuid>, resource_type: &str, action: &str, details: Option<String>) -> anyhow::Result<()> {
        let details_json = details.unwrap_or("{}".to_string());
        let last_hash: Option<String> = sqlx::query_scalar("SELECT hash FROM audit_logs ORDER BY created_at DESC LIMIT 1").fetch_optional(&self.pool).await?;
        let new_hash = crate::domain::logic::integrity::IntegrityEngine::calculate_audit_hash(user_id.map(|u| u.to_string()).as_deref(), resource_id.map(|r| r.to_string()).as_deref(), action, &details_json, last_hash.as_deref());
        sqlx::query("INSERT INTO audit_logs (user_id, resource_id, resource_type, action, details, prev_hash, hash) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)")
            .bind(user_id).bind(resource_id).bind(resource_type).bind(action).bind(details_json).bind(last_hash).bind(new_hash).execute(&self.pool).await?;
        Ok(())
    }
}
use async_trait::async_trait;
use sqlx::{SqlitePool, Row};
use uuid::Uuid;
use crate::domain::repository::{DocumentRepository, ArchetypeRepository};
use crate::domain::archetypes::Archetype;
use crate::modules::content::workspace::WorkspaceNode;
use serde_json::json;

pub struct SqliteDocumentRepository {
    pool: SqlitePool,
}

impl SqliteDocumentRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }

    pub async fn initialize(&self) -> anyhow::Result<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                owner_id TEXT NOT NULL,
                title TEXT NOT NULL,
                class_id TEXT,
                parent_id TEXT,
                properties TEXT DEFAULT '{}' NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS document_links (
                from_id TEXT NOT NULL,
                to_id TEXT NOT NULL,
                PRIMARY KEY (from_id, to_id)
            );
            CREATE TABLE IF NOT EXISTS document_updates (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doc_id TEXT NOT NULL,
                data BLOB NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS collection_rows (
                id TEXT PRIMARY KEY,
                document_id TEXT NOT NULL,
                data TEXT DEFAULT '{}' NOT NULL,
                order_index INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS classes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                json_schema TEXT DEFAULT '{}',
                ui_schema TEXT DEFAULT '[]',
                behavior_rules TEXT DEFAULT '{}',
                icon TEXT,
                has_collection BOOLEAN DEFAULT 0,
                group_id TEXT DEFAULT 'primitiva',
                required_tier TEXT DEFAULT 'Community'
            );
            "#
        )
        .execute(&self.pool)
        .await?;

        let count: i32 = sqlx::query_scalar("SELECT COUNT(*) FROM classes").fetch_one(&self.pool).await?;
        if count == 0 {
            self.seed_archetypes().await?;
        }

        Ok(())
    }

    async fn seed_archetypes(&self) -> anyhow::Result<()> {
        let archetypes = vec![
            ("note", "Note", "{}", r#"[{"key":"sealed_at","type":"text","label":"INTEGRITY_SEAL","read_only":true}]"#, "{}", "FileText", false, "primitiva", "Community"),
            ("project", "Project", "{}", r#"[{"key":"status","type":"badge","label":"STATE"},{"key":"progress","type":"progress","label":"COMPLETION"}]"#, "{}", "Briefcase", true, "primitiva", "Community"),
            ("task", "Task", "{}", r#"[{"key":"status","type":"select","label":"STATUS","options":["todo","doing","done"]}]"#, "{}", "CheckSquare", false, "primitiva", "Community"),
            ("container", "Container", "{}", "[]", "{}", "Box", false, "primitiva", "Community"),
            ("folha", "Planilha", "{}", "[]", "{}", "Table", true, "dados", "Community"),
            ("meeting", "Reunião", "{}", r#"[{"key":"attendees","type":"text","label":"Participantes"}]"#, "{}", "Users", false, "operacional", "PRO"),
            ("blueprint", "Blueprint", "{}", "[]", "{}", "Zap", false, "operacional", "PRO"),
            ("inventory", "Estoque", "{}", "[]", "{}", "Box", true, "operacional", "PRO"),
            ("contract", "Contrato", "{}", "[]", "{}", "Shield", false, "recursos", "PRO"),
            ("finance", "Financeiro", "{}", "[]", "{}", "Gem", true, "recursos", "PRO"),
            ("ledger", "Ledger", "{}", r#"[{"key":"total_balance","type":"money","label":"AGGREGATE_BALANCE","read_only":true}]"#, "{}", "Table", true, "dados", "Community"),
        ];

        for (id, name, js, ui, rules, icon, has_coll, group, tier) in archetypes {
            sqlx::query("INSERT INTO classes (id, name, json_schema, ui_schema, behavior_rules, icon, has_collection, group_id, required_tier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
                .bind(id).bind(name).bind(js).bind(ui).bind(rules).bind(icon).bind(has_coll).bind(group).bind(tier)
                .execute(&self.pool).await?;
        }
        Ok(())
    }
}

#[async_trait]
impl DocumentRepository for SqliteDocumentRepository {
    async fn create(&self, owner_id: Uuid, title: String, class_id: Option<String>, parent_id: Option<Uuid>) -> anyhow::Result<WorkspaceNode> {
        let id = Uuid::new_v4();
        let final_class_id = class_id.unwrap_or_else(|| "note".to_string());

        sqlx::query("INSERT INTO documents (id, owner_id, title, class_id, parent_id) VALUES (?, ?, ?, ?, ?)")
            .bind(id.to_string()).bind(owner_id.to_string()).bind(&title).bind(&final_class_id).bind(parent_id.map(|u| u.to_string()))
            .execute(&self.pool).await?;

        Ok(WorkspaceNode {
            id,
            title,
            parent_id,
            class_id: Some(final_class_id),
            properties: json!({}),
        })
    }

    async fn update_property(&self, doc_id: Uuid, key: &str, value: serde_json::Value) -> anyhow::Result<()> {
        if key == "title" {
            let title = value.as_str().unwrap_or("UNTITLED");
            sqlx::query("UPDATE documents SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
                .bind(title).bind(doc_id.to_string()).execute(&self.pool).await?;
        } else {
            let current: String = sqlx::query_scalar("SELECT properties FROM documents WHERE id = ?").bind(doc_id.to_string()).fetch_one(&self.pool).await?;
            let mut props: serde_json::Value = serde_json::from_str(&current).unwrap_or(json!({}));
            if let Some(obj) = props.as_object_mut() { obj.insert(key.to_string(), value); }
            sqlx::query("UPDATE documents SET properties = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
                .bind(serde_json::to_string(&props)?).bind(doc_id.to_string()).execute(&self.pool).await?;
        }
        Ok(())
    }

    async fn find_recent(&self, owner_id: Uuid, limit: i64) -> anyhow::Result<Vec<WorkspaceNode>> {
        let rows = sqlx::query("SELECT id, title, parent_id, class_id, properties FROM documents WHERE owner_id = ? ORDER BY updated_at DESC LIMIT ?")
            .bind(owner_id.to_string()).bind(limit).fetch_all(&self.pool).await?;
        Ok(rows.into_iter().map(|r| {
            WorkspaceNode {
                id: Uuid::parse_str(r.get(0)).unwrap_or_default(),
                title: r.get(1),
                parent_id: r.get::<Option<String>, _>(2).and_then(|s| Uuid::parse_str(&s).ok()),
                class_id: r.get(3),
                properties: serde_json::from_str(&r.get::<String, _>(4)).unwrap_or_else(|_| json!({})),
            }
        }).collect())
    }

    async fn find_all(&self, owner_id: Uuid) -> anyhow::Result<Vec<WorkspaceNode>> {
        let rows = sqlx::query("SELECT id, title, parent_id, class_id, properties FROM documents WHERE owner_id = ? ORDER BY title ASC")
            .bind(owner_id.to_string()).fetch_all(&self.pool).await?;
        Ok(rows.into_iter().map(|r| {
            WorkspaceNode {
                id: Uuid::parse_str(r.get(0)).unwrap_or_default(),
                title: r.get(1),
                parent_id: r.get::<Option<String>, _>(2).and_then(|s| Uuid::parse_str(&s).ok()),
                class_id: r.get(3),
                properties: serde_json::from_str(&r.get::<String, _>(4)).unwrap_or_else(|_| json!({})),
            }
        }).collect())
    }

    async fn find_by_id(&self, id: Uuid) -> anyhow::Result<Option<WorkspaceNode>> {
        let row = sqlx::query("SELECT id, title, parent_id, class_id, properties FROM documents WHERE id = ?").bind(id.to_string()).fetch_optional(&self.pool).await?;
        Ok(row.map(|r| WorkspaceNode {
            id: Uuid::parse_str(r.get(0)).unwrap_or_default(),
            title: r.get(1),
            parent_id: r.get::<Option<String>, _>(2).and_then(|s| Uuid::parse_str(&s).ok()),
            class_id: r.get(3),
            properties: serde_json::from_str(&r.get::<String, _>(4)).unwrap_or_else(|_| json!({})),
        }))
    }

    async fn delete(&self, id: Uuid, _owner_id: Uuid) -> anyhow::Result<()> {
        sqlx::query("DELETE FROM documents WHERE id = ?").bind(id.to_string()).execute(&self.pool).await?;
        Ok(())
    }

    async fn get_stats(&self, owner_id: Uuid) -> anyhow::Result<crate::kernel::types::SystemStats> {
        let nodes: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM documents WHERE owner_id = ?")
            .bind(owner_id.to_string()).fetch_one(&self.pool).await?;
        
        let links: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM document_links l JOIN documents d ON l.from_id = d.id WHERE d.owner_id = ?")
            .bind(owner_id.to_string()).fetch_one(&self.pool).await?;

        let recent: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM documents WHERE owner_id = ? AND updated_at > datetime('now', '-1 day')")
            .bind(owner_id.to_string()).fetch_one(&self.pool).await?;

        let rows = sqlx::query("SELECT class_id, COUNT(*) FROM documents WHERE owner_id = ? GROUP BY class_id")
            .bind(owner_id.to_string()).fetch_all(&self.pool).await?;

        let mut distribution = std::collections::HashMap::new();
        for r in rows {
            let cid: String = r.get(0);
            let count: i64 = r.get(1);
            distribution.insert(cid, count as i32);
        }

        let orphans: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*) FROM documents 
            WHERE id NOT IN (SELECT from_id FROM document_links)
              AND id NOT IN (SELECT to_id FROM document_links)
              AND owner_id = ?
            "#
        ).bind(owner_id.to_string()).fetch_one(&self.pool).await?;

        let untagged: i64 = sqlx::query_scalar(
            r#"
            SELECT COUNT(*) FROM documents 
            WHERE (json_extract(properties, '$.tags') IS NULL OR json_extract(properties, '$.tags') = '[]')
              AND owner_id = ?
            "#
        ).bind(owner_id.to_string()).fetch_one(&self.pool).await?;

        Ok(crate::kernel::types::SystemStats {
            nodes: nodes as i32,
            class_distribution: distribution,
            recent_activity_count: recent as i32,
            total_links: links as i32,
            orphan_nodes: orphans as i32,
            untagged_nodes: untagged as i32,
        })
    }

    async fn add_link(&self, from_id: Uuid, to_id: Uuid) -> anyhow::Result<()> {
        sqlx::query("INSERT OR IGNORE INTO document_links (from_id, to_id) VALUES (?, ?)")
            .bind(from_id.to_string()).bind(to_id.to_string()).execute(&self.pool).await?;
        Ok(())
    }

    async fn find_links(&self, owner_id: Uuid) -> anyhow::Result<Vec<(Uuid, Uuid)>> {
        let rows = sqlx::query("SELECT l.from_id, l.to_id FROM document_links l JOIN documents d ON l.from_id = d.id WHERE d.owner_id = ?")
            .bind(owner_id.to_string()).fetch_all(&self.pool).await?;
        Ok(rows.into_iter().filter_map(|r| Some((Uuid::parse_str(r.get(0)).ok()?, Uuid::parse_str(r.get(1)).ok()?))).collect())
    }

    async fn find_children_properties(&self, parent_id: Uuid, _class_filter: Option<String>) -> anyhow::Result<Vec<serde_json::Value>> {
        let rows = sqlx::query("SELECT properties FROM documents WHERE parent_id = ?").bind(parent_id.to_string()).fetch_all(&self.pool).await?;
        Ok(rows.into_iter().filter_map(|r| serde_json::from_str(&r.get::<String, _>(0)).ok()).collect())
    }

    async fn get_tags_with_inheritance(&self, doc_id: Uuid) -> anyhow::Result<Vec<String>> {
        let rows = sqlx::query(r#"WITH RECURSIVE lineage AS (SELECT id, parent_id, properties FROM documents WHERE id = ? UNION ALL SELECT d.id, d.parent_id, d.properties FROM documents d JOIN lineage l ON d.id = l.parent_id) SELECT properties FROM lineage"#).bind(doc_id.to_string()).fetch_all(&self.pool).await?;
        let mut all_tags = std::collections::HashSet::new();
        for r in rows {
            let props_str: String = r.get(0);
            let props: serde_json::Value = serde_json::from_str(&props_str).unwrap_or_default();
            if let Some(tags) = props.get("tags").and_then(|t| t.as_array()) {
                for t in tags {
                    if let Some(s) = t.as_str() {
                        all_tags.insert(s.to_string());
                    }
                }
            }
        }
        Ok(all_tags.into_iter().collect())
    }

    async fn get_collection_rows(&self, doc_id: Uuid) -> anyhow::Result<Vec<serde_json::Value>> {
        let rows = sqlx::query("SELECT id, data FROM collection_rows WHERE document_id = ? ORDER BY order_index ASC")
            .bind(doc_id.to_string()).fetch_all(&self.pool).await?;
        Ok(rows.into_iter().map(|r| {
            let mut data: serde_json::Value = serde_json::from_str(&r.get::<String, _>(1)).unwrap_or(json!({}));
            if let Some(obj) = data.as_object_mut() { obj.insert("id".to_string(), json!(r.get::<String, _>(0))); }
            data
        }).collect())
    }

    async fn update_collection_cell(&self, _doc_id: Uuid, row_id: Uuid, col_id: &str, value: serde_json::Value) -> anyhow::Result<()> {
        let current: String = sqlx::query_scalar("SELECT data FROM collection_rows WHERE id = ?").bind(row_id.to_string()).fetch_one(&self.pool).await?;
        let mut data: serde_json::Value = serde_json::from_str(&current).unwrap_or(json!({}));
        if let Some(obj) = data.as_object_mut() { obj.insert(col_id.to_string(), value); }
        sqlx::query("UPDATE collection_rows SET data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
            .bind(serde_json::to_string(&data)?).bind(row_id.to_string()).execute(&self.pool).await?;
        Ok(())
    }

    async fn add_collection_row(&self, doc_id: Uuid) -> anyhow::Result<serde_json::Value> {
        let id = Uuid::new_v4();
        let data = json!({});
        sqlx::query("INSERT INTO collection_rows (id, document_id, data) VALUES (?, ?, ?)")
            .bind(id.to_string()).bind(doc_id.to_string()).bind(data.to_string()).execute(&self.pool).await?;
        let mut res = data;
        res.as_object_mut().unwrap().insert("id".to_string(), json!(id));
        Ok(res)
    }

    async fn get_aggregate_sum(&self, parent_id: Uuid, property_key: &str) -> anyhow::Result<f64> {
        let key_path = format!("$.{}", property_key);
        
        let sum: Option<f64> = sqlx::query_scalar(
            r#"
            SELECT SUM(CAST(json_extract(properties, ?) AS REAL)) 
            FROM documents 
            WHERE parent_id = ? 
               OR id IN (SELECT to_id FROM document_links WHERE from_id = ?)
            "#
        )
        .bind(key_path)
        .bind(parent_id.to_string())
        .bind(parent_id.to_string())
        .fetch_one(&self.pool)
        .await?;

        Ok(sum.unwrap_or(0.0))
    }

    // AI/Physics Removed
    async fn update_embedding(&self, _doc_id: Uuid, _embedding: Vec<f32>) -> anyhow::Result<()> { Ok(()) }
    async fn search_similar(&self, _target_vector: Vec<f32>, _limit: i64) -> anyhow::Result<Vec<Uuid>> { Ok(vec![]) }
}

pub struct SqliteArchetypeRepository { pool: SqlitePool }
impl SqliteArchetypeRepository { pub fn new(pool: SqlitePool) -> Self { Self { pool } } }
#[async_trait]
impl ArchetypeRepository for SqliteArchetypeRepository {
    async fn find_all(&self) -> anyhow::Result<Vec<Archetype>> {
        let rows = sqlx::query("SELECT id, name, icon, COALESCE(ui_schema, '[]'), COALESCE(behavior_rules, '{}'), group_id, required_tier FROM classes")
            .fetch_all(&self.pool).await?;
        Ok(rows.into_iter().map(|r| Archetype {
            id: r.get(0), name: r.get(1), icon: r.get(2), group_id: r.get(5), required_tier: r.get(6),
            ui_schema: serde_json::from_str(&r.get::<String, _>(3)).unwrap_or(json!([])),
            behavior_rules: serde_json::from_str(&r.get::<String, _>(4)).unwrap_or(json!({})),
            allowed_children: None
        }).collect())
    }
    async fn find_by_id(&self, id: &str) -> anyhow::Result<Option<Archetype>> {
        let row = sqlx::query("SELECT id, name, icon, COALESCE(ui_schema, '[]'), COALESCE(behavior_rules, '{}'), group_id, required_tier FROM classes WHERE id = ?")
            .bind(id).fetch_optional(&self.pool).await?;
        Ok(row.map(|r| Archetype {
            id: r.get(0), name: r.get(1), icon: r.get(2), group_id: r.get(5), required_tier: r.get(6),
            ui_schema: serde_json::from_str(&r.get::<String, _>(3)).unwrap_or(json!([])),
            behavior_rules: serde_json::from_str(&r.get::<String, _>(4)).unwrap_or(json!({})),
            allowed_children: None
        }))
    }
}
use sqlx::PgPool;
use uuid::Uuid;
use serde_json::{Value, json};
use anyhow::Result;

pub struct ConfigResolver;

impl ConfigResolver {
    /// Resolve a configuração final mesclando Root -> ... -> Pai -> Documento.
    /// Implementa o GAP 5.1 (Shadowing).
    pub async fn resolve_effective_config(pool: &PgPool, doc_id: Uuid) -> Result<Value> {
        let rows: Vec<Value> = sqlx::query_scalar(
            r#"
            WITH RECURSIVE lineage AS (
                SELECT id, parent_id, config, 1 as depth
                FROM documents
                WHERE id = $1
                UNION ALL
                SELECT d.id, d.parent_id, d.config, l.depth + 1
                FROM documents d
                INNER JOIN lineage l ON d.id = l.parent_id
            )
            SELECT config FROM lineage ORDER BY depth DESC
            "#
        )
        .bind(doc_id)
        .fetch_all(pool)
        .await?;

        // Mesclagem profunda (Deep Merge)
        let mut final_config = json!({});
        for config in rows {
            Self::deep_merge(&mut final_config, &config);
        }

        Ok(final_config)
    }

    fn deep_merge(target: &mut Value, source: &Value) {
        if let (Value::Object(target_map), Value::Object(source_map)) = (target, source) {
            for (k, v) in source_map {
                // Se a chave estiver marcada como 'locked' no alvo, não sobrescreve (GAP 5.3)
                if target_map.get(k).and_then(|val| val.get("locked")).and_then(|l| l.as_bool()).unwrap_or(false) {
                    continue;
                }
                
                if target_map.contains_key(k) && v.is_object() {
                    Self::deep_merge(target_map.get_mut(k).unwrap(), v);
                } else {
                    target_map.insert(k.clone(), v.clone());
                }
            }
        }
    }
}

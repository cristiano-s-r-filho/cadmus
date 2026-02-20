use sqlx::PgPool;
use uuid::Uuid;

pub struct ClassQueryEngine {
    pool: PgPool,
}

impl ClassQueryEngine {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Calcula o balanço financeiro de um Ledger baseado nos Assets linkados.
    pub async fn aggregate_ledger(&self, ledger_id: Uuid) -> anyhow::Result<f64> {
        let total: f64 = sqlx::query_scalar(
            r#"
            SELECT COALESCE(SUM((properties->>'value')::float8), 0)
            FROM documents
            WHERE id IN (
                SELECT to_id FROM document_links WHERE from_id = $1
            ) AND class_id = 'asset'
            "#
        )
        .bind(ledger_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(total)
    }

    /// Calcula o progresso de um Projeto baseado nas Tasks linkadas.
    pub async fn aggregate_project_progress(&self, project_id: Uuid) -> anyhow::Result<f64> {
        let stats: (i64, i64) = sqlx::query_as(
            r#"
            SELECT 
                COUNT(*),
                COUNT(*) FILTER (WHERE properties->>'status' = 'COMPLETED')
            FROM documents
            WHERE id IN (
                SELECT to_id FROM document_links WHERE from_id = $1
            ) AND class_id = 'task'
            "#
        )
        .bind(project_id)
        .fetch_one(&self.pool)
        .await?;

        if stats.0 == 0 { return Ok(0.0); }
        Ok((stats.1 as f64 / stats.0 as f64) * 100.0)
    }
}

use sqlx::{Pool, Postgres, Sqlite};
use anyhow::Result;
use uuid::Uuid;

#[derive(Clone)]
pub enum DbPool {
    Postgres(Pool<Postgres>),
    Sqlite(Pool<Sqlite>),
}

pub struct ContentStorage {
    pub pool: DbPool,
}

impl ContentStorage {
    pub fn new_pg(pool: Pool<Postgres>) -> Self {
        Self { pool: DbPool::Postgres(pool) }
    }

    pub fn new_sqlite(pool: Pool<Sqlite>) -> Self {
        Self { pool: DbPool::Sqlite(pool) }
    }

    pub async fn save_update(&self, doc_id: &str, update: Vec<u8>) -> Result<()> {
        let uuid = Uuid::parse_str(doc_id)?;
        let len = update.len();
        
        match &self.pool {
            DbPool::Postgres(p) => {
                sqlx::query("INSERT INTO document_updates (doc_id, data) VALUES ($1, $2)")
                    .bind(uuid)
                    .bind(&update)
                    .execute(p)
                    .await?;
            },
            DbPool::Sqlite(p) => {
                sqlx::query("INSERT INTO document_updates (doc_id, data) VALUES (?, ?)")
                    .bind(uuid.to_string())
                    .bind(&update)
                    .execute(p)
                    .await?;
            }
        }
        
        tracing::debug!("[Storage] COMMITTED update for {} ({} bytes)", doc_id, len);
        Ok(())
    }

    pub async fn load_updates(&self, doc_id: &str) -> Result<Vec<Vec<u8>>> {
        let uuid = Uuid::parse_str(doc_id)?;

        let updates: Vec<Vec<u8>> = match &self.pool {
            DbPool::Postgres(p) => {
                let rows: Vec<(Vec<u8>,)> = sqlx::query_as("SELECT data FROM document_updates WHERE doc_id = $1 ORDER BY created_at ASC")
                    .bind(uuid)
                    .fetch_all(p)
                    .await?;
                rows.into_iter().map(|r| r.0).collect()
            },
            DbPool::Sqlite(p) => {
                let rows: Vec<(Vec<u8>,)> = sqlx::query_as("SELECT data FROM document_updates WHERE doc_id = ? ORDER BY created_at ASC")
                    .bind(uuid.to_string())
                    .fetch_all(p)
                    .await?;
                rows.into_iter().map(|r| r.0).collect()
            }
        };

        tracing::info!("[Storage] LOADED {} updates for {}", updates.len(), doc_id);
        Ok(updates)
    }

    pub async fn load_latest_update(&self, doc_id: &str) -> Result<Option<Vec<u8>>> {
        let uuid = Uuid::parse_str(doc_id)?;

        let data = match &self.pool {
            DbPool::Postgres(p) => {
                sqlx::query_scalar::<_, Vec<u8>>("SELECT data FROM document_updates WHERE doc_id = $1 ORDER BY created_at DESC LIMIT 1")
                    .bind(uuid)
                    .fetch_optional(p)
                    .await?
            },
            DbPool::Sqlite(p) => {
                sqlx::query_scalar::<_, Vec<u8>>("SELECT data FROM document_updates WHERE doc_id = ? ORDER BY created_at DESC LIMIT 1")
                    .bind(uuid.to_string())
                    .fetch_optional(p)
                    .await?
            }
        };

        Ok(data)
    }

    pub async fn load_latest_snapshot(&self, doc_id: &str) -> Result<Option<Vec<u8>>> {
        let uuid = Uuid::parse_str(doc_id)?;
        let prefix = "CADMUS_SHEET_V1:".as_bytes();

        let data = match &self.pool {
            DbPool::Postgres(p) => {
                // Em Postgres ByteA, usamos o operador de prefixo
                sqlx::query_scalar::<_, Vec<u8>>("SELECT data FROM document_updates WHERE doc_id = $1 AND data >= $2 AND data < $3 ORDER BY created_at DESC LIMIT 1")
                    .bind(uuid)
                    .bind(prefix)
                    // Truque de range para prefixo binário
                    .bind([prefix, &[255u8]].concat()) 
                    .fetch_optional(p)
                    .await?
            },
            DbPool::Sqlite(p) => {
                // No SQLite, usamos o GLOB ou comparamos substr
                sqlx::query_scalar::<_, Vec<u8>>("SELECT data FROM document_updates WHERE doc_id = ? AND substr(data, 1, ?) = ? ORDER BY created_at DESC LIMIT 1")
                    .bind(uuid.to_string())
                    .bind(prefix.len() as i32)
                    .bind(prefix)
                    .fetch_optional(p)
                    .await?
            }
        };

        Ok(data)
    }
}
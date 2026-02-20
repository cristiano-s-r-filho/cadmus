use sqlx::PgPool;
use anyhow::Result;
use tracing::{info, error};

pub async fn run_migrations(pool: &PgPool) -> Result<()> {
    info!("Starting Sovereign Migration Runner...");

    // Usamos o migrator nativo do sqlx que gerencia a tabela _sqlx_migrations
    // Isso garante que novas migrações sejam detectadas automaticamente
    let migrator = sqlx::migrate!("./migrations");
    
    match migrator.run(pool).await {
        Ok(_) => {
            info!("Database Migrations: ALL_SYSTEMS_GO (Applied Successfully)");
            Ok(())
        },
        Err(e) => {
            error!("CRITICAL_MIGRATION_FAILURE: {}", e);
            Err(anyhow::anyhow!("Failed to run migrations: {}", e))
        }
    }
}
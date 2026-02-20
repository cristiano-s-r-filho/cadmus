//! Database and State Management
//!
//! Provides the primary connection pool and the global system state (CoreState).

use sqlx::PgPool;
use std::sync::Arc;
use crate::infrastructure::postgres::{PostgresDocumentRepository, PostgresArchetypeRepository, PostgresAuditRepository};
use crate::modules::content::socket::ContentRegistry;
use crate::modules::security::service::SecurityService;
use crate::domain::archetypes::modules::ModuleRegistry;

/// CoreState serves as the central dependency injector for the system.
/// It encapsulates database connections and service handles required across modules.
pub struct CoreState {
    pub pool: PgPool,
    pub documents: Arc<PostgresDocumentRepository>,
    pub archetypes: Arc<PostgresArchetypeRepository>,
    pub audit: Arc<PostgresAuditRepository>,
    pub security: Arc<SecurityService>,
    pub modules: Arc<ModuleRegistry>,
    pub registry: Arc<ContentRegistry>,
}

impl CoreState {
    /// Creates a new CoreState instance with initialized repositories and services.
    pub fn new(pool: PgPool, registry: Arc<ContentRegistry>) -> Self {
        Self {
            pool: pool.clone(),
            documents: Arc::new(PostgresDocumentRepository::new(pool.clone())),
            archetypes: Arc::new(PostgresArchetypeRepository::new(pool.clone())),
            audit: Arc::new(PostgresAuditRepository::new(pool.clone())),
            security: Arc::new(SecurityService::new(pool)),
            modules: Arc::new(ModuleRegistry::new()),
            registry,
        }
    }
}

/// Database connection wrapper for PostgreSQL.
pub struct Db {
    pub pool: PgPool,
}

impl Db {
    /// Establishes a new connection pool to the database using the provided URL.
    pub async fn new(url: &str) -> Result<Self, sqlx::Error> {
        tracing::info!("Initializing Database Pool (Postgres)...");
        
        let max_connections = std::env::var("DB_MAX_CONNECTIONS")
            .ok()
            .and_then(|v| v.parse().ok())
            .unwrap_or(10);

        let pool = sqlx::postgres::PgPoolOptions::new()
            .max_connections(max_connections)
            .min_connections(1)
            .acquire_timeout(std::time::Duration::from_secs(30))
            .idle_timeout(std::time::Duration::from_secs(60))
            .connect(url)
            .await?;
        
        tracing::info!("Database Pool established with {} max connections.", max_connections);
        Ok(Self { pool })
    }
}

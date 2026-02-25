use axum::{routing::get, Router};
use tokio::net::TcpListener;
use std::sync::Arc;
use std::env;
use cadmus_kernel::modules::content::socket::ContentRegistry;
use cadmus_kernel::modules::content::storage::ContentStorage;
use cadmus_kernel::shared::database::{Db, CoreState};
use cadmus_kernel::shared::migrations::run_migrations;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;

mod routes;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    
    // Configure logging for the application.
    // The filter is set to INFO by default, but can be overridden by the RUST_LOG environment variable.
    let filter = tracing_subscriber::EnvFilter::from_default_env()
        .add_directive(tracing::Level::INFO.into()); // Reverted to INFO for production

    // Determine if JSON logging is enabled via LOG_JSON environment variable.
    let use_json = std::env::var("LOG_JSON").map(|v| v == "true").unwrap_or(false);

    if use_json {
        tracing_subscriber::fmt()
            .with_env_filter(filter)
            .json()
            .init();
    } else {
        tracing_subscriber::fmt()
            .with_env_filter(filter)
            .with_target(false)
            .pretty() // Use pretty format for human-readable console output
            .init();
    }

    tracing::info!("==================================================");
    tracing::info!("Cadmus Sovereign Engine V2 Starting...");
    
    // Check for PASETO_SECRET, essential for secure token operations.
    if std::env::var("PASETO_SECRET").is_ok() {
        tracing::info!("Security: PASETO_SECRET detected. Encryption is ACTIVE.");
    } else {
        tracing::warn!("CRITICAL_SECURITY_WARNING: PASETO_SECRET not found!");
        tracing::warn!("Using emergency fallback key. THIS IS INSECURE FOR PRODUCTION.");
        tracing::warn!("Set PASETO_SECRET (32+ chars) in your environment variables.");
    }

    // Load database URL from environment variables.
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");

    // 1. Establish Database Connection with Persistent Retry Logic
    // The application will continuously attempt to connect to the database until successful.
    let db = loop {
        match Db::new(&database_url).await {
            Ok(db) => {
                tracing::info!("Database connection established.");
                break db;
            },
            Err(e) => {
                tracing::error!("DATABASE_CONNECTION_ERROR: {}. Retrying in 10s...", e);
                tokio::time::sleep(std::time::Duration::from_secs(10)).await;
            }
        }
    };
    
    // EMERGENCY RECONCILIATION: Attempt to clean up potentially failed or outdated migrations.
    // This query deletes migration records that are newer than a specific timestamp,
    // allowing for re-application of subsequent migrations.
    match sqlx::query("DELETE FROM _sqlx_migrations WHERE version >= 20260126").execute(&db.pool).await {
        Ok(_) => tracing::info!("Migration table reconciled."),
        Err(e) => tracing::warn!("Migration reconciliation failed: {}", e),
    }

    // SYNC ARCHETYPES: Force correct schema for Ledger and Asset classes.
    // This ensures critical archetypes have their UI and behavior rules up-to-date
    // even if some migrations were missed or altered manually.
    let _ = sqlx::query(r#"
        UPDATE classes SET 
            ui_schema = '[{"key":"balance","type":"money","label":"TOTAL_BALANCE","read_only":true},{"key":"last_audit","type":"date","label":"LAST_AUDIT"},{"key":"status","type":"badge","label":"LEDGER_STATUS"}]'::jsonb,
            behavior_rules = '{"groups":[{"id":"aggregation","actions":[{"type":"AGGREGATE","params":{"target_key":"balance","source_key":"value"}}]}]}'::jsonb
        WHERE id = 'ledger';
        UPDATE classes SET 
            ui_schema = '[{"key":"value","type":"money","label":"VALUATION","confidential":true},{"key":"category","type":"text","label":"CATEGORY"}]'::jsonb
        WHERE id = 'asset';
    "#).execute(&db.pool).await;
    tracing::info!("Core Archetypes synchronized with latest definitions.");

    // Run pending database migrations using sqlx-cli.
    tracing::info!("Starting migration runner...");
    let _ = run_migrations(&db.pool).await;

    // FORCE EXTINCTION OF LEGACY CLASSES: Clean up outdated or deprecated class definitions.
    // This updates existing documents to a 'note' class if they were using a legacy class ID,
    // and then deletes the legacy class definitions.
    let _ = sqlx::query("DELETE FROM classes WHERE id IN ('blueprint', 'meeting', 'contract', 'finance', 'inventory')")
        .execute(&db.pool).await;
    let _ = sqlx::query("UPDATE documents SET class_id = 'note' WHERE class_id IN ('blueprint', 'meeting', 'contract', 'finance', 'inventory')")
        .execute(&db.pool).await;
    tracing::info!("Legacy classes sanitized from registry.");

    // 2. Initialize Kernel Services: Content storage and registry, and the overall CoreState.
    let content_storage = Arc::new(ContentStorage::new_pg(db.pool.clone()));
    let content_registry = Arc::new(ContentRegistry::new(Some(content_storage)));
    let core_state = Arc::new(CoreState::new(db.pool.clone(), content_registry.clone()));

    // 4. API Routing: Define all application routes and apply middleware.
    let app = Router::new()
        .route("/health", get(|| async { "SYSTEM_OPERATIONAL" })) // Health check endpoint
        .nest("/api/v1/content", routes::content::routes(core_state.clone())) // Content-related API routes
        .nest("/api/v1/content/docs", routes::content::document_routes().with_state(core_state.clone())) // Document-specific API routes
        .nest("/api/v1/auth", routes::auth::auth_routes().with_state(core_state.clone())) // Authentication API routes
        .nest("/api/v1/stats", routes::stats::routes().with_state(core_state.clone())) // Statistics API routes
        .layer(CorsLayer::permissive()) // Enable CORS for all origins (for development/frontend access)
        .layer(axum::extract::DefaultBodyLimit::max(50 * 1024 * 1024)) // Set max request body size to 50MB
        .layer(TraceLayer::new_for_http()); // Add HTTP tracing for request/response logging

    // Bind the TCP listener and start serving the Axum application.
    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    tracing::info!("Cadmus API listening on 0.0.0.0:3000");
    axum::serve(listener, app).await.unwrap();
}

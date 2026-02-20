use axum::{Router, routing::get, extract::{State, Path}, Json};
use std::sync::Arc;
use cadmus_kernel::shared::database::CoreState;
use cadmus_kernel::domain::repository::DocumentRepository;
use uuid::Uuid;
use crate::routes::content::ApiError;
use crate::routes::auth::AuthenticatedUser;

pub fn routes() -> Router<Arc<CoreState>> {
    Router::new()
        .route("/", get(get_system_stats))
        .route("/aggregate/:id/:key", get(get_doc_aggregation))
}

async fn get_system_stats(
    AuthenticatedUser(uid): AuthenticatedUser,
    State(state): State<Arc<CoreState>>,
) -> Result<Json<cadmus_kernel::kernel::types::SystemStats>, ApiError> {
    let stats = state.documents.get_stats(uid).await
        .map_err(|e| {
            tracing::error!("DB_FAIL in get_stats: {:?}", e);
            ApiError { error: e.to_string(), code: "DB_ERROR".into() }
        })?;
        
    Ok(Json(stats))
}

async fn get_doc_aggregation(
    _auth: AuthenticatedUser,
    State(state): State<Arc<CoreState>>,
    Path((id, key)): Path<(String, String)>,
) -> Result<Json<f64>, ApiError> {
    let doc_id = Uuid::parse_str(&id).map_err(|_| ApiError { error: "INVALID_DOC_ID".into(), code: "VALIDATION".into() })?;
    
    let sum = state.documents.get_aggregate_sum(doc_id, &key).await
        .map_err(|e| {
            tracing::error!("DB_FAIL in aggregate: {:?}", e);
            ApiError { error: e.to_string(), code: "DB_ERROR".into() }
        })?;
        
    Ok(Json(sum))
}
use axum::{
    extract::{ws::{Message, WebSocket, WebSocketUpgrade}, State, Path},
    response::IntoResponse,
    routing::{get, post, delete},
    Router, Json,
};
use std::sync::Arc;
use cadmus_kernel::shared::database::CoreState;
use cadmus_kernel::domain::repository::{DocumentRepository, ArchetypeRepository};
use y_sync::sync::{Message as YSyncMessage, SyncMessage};
use yrs::updates::encoder::Encode;
use yrs::updates::decoder::Decode;
use yrs::{Transact, ReadTxn};
use futures::{SinkExt, StreamExt};
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use crate::routes::auth::AuthenticatedUser;

#[derive(Serialize)]
pub struct ApiError {
    pub error: String,
    pub code: String,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        let status = match self.code.as_str() {
            "UNAUTHORIZED" => axum::http::StatusCode::UNAUTHORIZED,
            "404" => axum::http::StatusCode::NOT_FOUND,
            "DB_ERROR" | "INTERNAL" | "STORAGE_FAIL" => axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            "VALIDATION" | "VALIDATION_FAIL" | "INVALID_ID" => axum::http::StatusCode::BAD_REQUEST,
            _ => axum::http::StatusCode::BAD_REQUEST,
        };
        (status, Json(self)).into_response()
    }
}

pub fn routes(state: Arc<CoreState>) -> Router {
    Router::new()
        .route("/ws/doc/:id", get(ws_handler))
        .with_state(state)
}

pub fn document_routes() -> Router<Arc<CoreState>> {
    Router::new()
        .route("/all", get(list_all))
        .route("/recent", get(list_recent))
        .route("/create", post(create_doc))
        .route("/stats", get(get_stats))
        .route("/archetypes", get(list_archetypes))
        .route("/update_property", post(update_property))
        .route("/embedding", post(update_embedding))
        .route("/search", post(search_docs))
        .route("/tags/:id", get(get_tags))
        .route("/links", get(list_links))
        .route("/links/create", post(create_link))
        .route("/collection/:id", get(get_collection))
        .route("/collection/:id/cell", post(update_collection_cell))
        .route("/collection/:id/row", post(add_collection_row))
        .route("/:id/snapshot", post(save_snapshot))
        .route("/:id/updates", get(get_updates_route))
        .route("/:id/latest", get(get_latest_update_route))
        .route("/:id/latest_snapshot", get(get_latest_snapshot_route))
        .route("/:id", get(get_doc))
        .route("/:id", delete(delete_doc))
        .route("/health/db", get(db_health_check)) // New Health Check
}

async fn get_latest_snapshot_route(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Path(id): Path<String>) -> Result<Json<Option<Vec<u8>>>, ApiError> {
    if let Some(storage) = state.registry.get_storage() {
        let snapshot = storage.load_latest_snapshot(&id).await
            .map_err(|e| ApiError { error: e.to_string(), code: "STORAGE_FAIL".into() })?;
        Ok(Json(snapshot))
    } else {
        Ok(Json(None))
    }
}

#[derive(Deserialize)]
pub struct SnapshotRequest {
    pub data: Vec<u8>,
}

async fn save_snapshot(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Path(id): Path<String>, Json(req): Json<SnapshotRequest>) -> Result<String, ApiError> {
    if let Some(storage) = state.registry.get_storage() {
        storage.save_update(&id, req.data).await
            .map_err(|e| ApiError { error: e.to_string(), code: "STORAGE_FAIL".into() })?;
        Ok("SNAPSHOT_SAVED".into())
    } else {
        Err(ApiError { error: "NO_STORAGE_CONFIGURED".into(), code: "CONFIG_ERROR".into() })
    }
}

async fn get_latest_update_route(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Path(id): Path<String>) -> Result<Json<Option<Vec<u8>>>, ApiError> {
    if let Some(storage) = state.registry.get_storage() {
        let update = storage.load_latest_update(&id).await
            .map_err(|e| ApiError { error: e.to_string(), code: "STORAGE_FAIL".into() })?;
        Ok(Json(update))
    } else {
        Ok(Json(None))
    }
}

async fn get_updates_route(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Path(id): Path<String>) -> Result<Json<Vec<Vec<u8>>>, ApiError> {
    if let Some(storage) = state.registry.get_storage() {
        let updates = storage.load_updates(&id).await
            .map_err(|e| ApiError { error: e.to_string(), code: "STORAGE_FAIL".into() })?;
        Ok(Json(updates))
    } else {
        Ok(Json(vec![]))
    }
}

async fn get_doc(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Path(id): Path<Uuid>) -> Result<Json<cadmus_kernel::modules::content::workspace::WorkspaceNode>, ApiError> {
    let doc = state.documents.find_by_id(id).await
        .map_err(|e| ApiError { error: e.to_string(), code: "DB_ERROR".into() })?
        .ok_or(ApiError { error: "NOT_FOUND".into(), code: "404".into() })?;
    Ok(Json(doc))
}

#[derive(Deserialize)]
pub struct EmbeddingRequest {
    pub doc_id: Uuid,
    pub vector: Vec<f32>,
}

async fn update_embedding(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Json(req): Json<EmbeddingRequest>) -> Result<String, ApiError> {
    state.documents.update_embedding(req.doc_id, req.vector).await
        .map(|_| "VECTOR_SYNCED".into())
        .map_err(|e| ApiError { error: e.to_string(), code: "DB_ERROR".into() })
}

#[derive(Deserialize)]
pub struct SearchRequest {
    pub vector: Vec<f32>,
}

async fn search_docs(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Json(req): Json<SearchRequest>) -> Result<Json<Vec<Uuid>>, ApiError> {
    state.documents.search_similar(req.vector, 10).await
        .map(Json)
        .map_err(|e| ApiError { error: e.to_string(), code: "SEARCH_ERROR".into() })
}

async fn list_links(AuthenticatedUser(uid): AuthenticatedUser, State(state): State<Arc<CoreState>>) -> Result<Json<Vec<(Uuid, Uuid)>>, ApiError> {
    state.documents.find_links(uid).await
        .map(Json)
        .map_err(|e| ApiError { error: e.to_string(), code: "DB_ERROR".into() })
}

#[derive(Deserialize)]
pub struct CreateLinkRequest {
    pub from_id: Uuid,
    pub to_id: Uuid,
}

async fn create_link(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Json(req): Json<CreateLinkRequest>) -> Result<String, ApiError> {
    state.documents.add_link(req.from_id, req.to_id).await
        .map(|_| "LINK_CREATED".into())
        .map_err(|e| ApiError { error: e.to_string(), code: "DB_ERROR".into() })
}

async fn get_tags(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Path(id): Path<Uuid>) -> Result<Json<Vec<String>>, ApiError> {
    state.documents.get_tags_with_inheritance(id).await
        .map(Json)
        .map_err(|e| ApiError { error: e.to_string(), code: "DB_ERROR".into() })
}

#[derive(Deserialize)]
pub struct CreateDocRequest {
    pub title: String,
    pub class_id: Option<String>,
    pub parent_id: Option<Uuid>,
}

async fn list_all(AuthenticatedUser(uid): AuthenticatedUser, State(state): State<Arc<CoreState>>) -> Result<Json<Vec<cadmus_kernel::modules::content::workspace::WorkspaceNode>>, ApiError> {
    state.documents.find_all(uid).await
        .map(Json)
        .map_err(|e| {
            tracing::error!("DB_FAIL in list_all: {:?}", e);
            ApiError { error: e.to_string(), code: "DB_ERROR".into() }
        })
}

async fn create_doc(AuthenticatedUser(uid): AuthenticatedUser, State(state): State<Arc<CoreState>>, Json(req): Json<CreateDocRequest>) -> Result<Json<cadmus_kernel::modules::content::workspace::WorkspaceNode>, ApiError> {
    state.documents.create(uid, req.title, req.class_id, req.parent_id).await
        .map(Json)
        .map_err(|e| ApiError { error: e.to_string(), code: "DB_ERROR".into() })
}

async fn delete_doc(AuthenticatedUser(uid): AuthenticatedUser, State(state): State<Arc<CoreState>>, Path(id): Path<Uuid>) -> Result<String, ApiError> {
    state.documents.delete(id, uid).await.map(|_| "DELETED".into()).map_err(|e| e.to_string()).map_err(|e| ApiError { error: e, code: "DB_ERROR".into() })
}

async fn get_stats(AuthenticatedUser(uid): AuthenticatedUser, State(state): State<Arc<CoreState>>) -> Result<Json<cadmus_kernel::kernel::types::SystemStats>, ApiError> {
    state.documents.get_stats(uid).await
        .map(Json)
        .map_err(|e| ApiError { error: e.to_string(), code: "DB_ERROR".into() })
}

async fn list_archetypes(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>) -> Result<Json<Vec<cadmus_kernel::domain::archetypes::Archetype>>, ApiError> {
    state.archetypes.find_all().await.map(Json).map_err(|e| ApiError { error: e.to_string(), code: "DB_ERROR".into() })
}

async fn update_property(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Json(req): Json<serde_json::Value>) -> Result<String, ApiError> {
    let doc_id = Uuid::parse_str(req["id"].as_str().ok_or("MISSING_ID").map_err(|e| ApiError { error: e.to_string(), code: "VALIDATION_FAIL".into() })?).map_err(|e| ApiError { error: e.to_string(), code: "INVALID_ID".into() })?;
    let key = req["key"].as_str().ok_or("MISSING_KEY").map_err(|e| ApiError { error: e.to_string(), code: "VALIDATION_FAIL".into() })?;
    let value = &req["value"];

    state.documents.update_property(doc_id, key, value.clone()).await
        .map_err(|e| ApiError { error: e.to_string(), code: "DB_ERROR".into() })?;
    Ok("UPDATED".into())
}

async fn list_recent(AuthenticatedUser(uid): AuthenticatedUser, State(state): State<Arc<CoreState>>) -> Result<Json<Vec<cadmus_kernel::modules::content::workspace::WorkspaceNode>>, ApiError> {
    state.documents.find_recent(uid, 10).await
        .map(Json)
        .map_err(|e| {
            tracing::error!("DB_FAIL in list_recent: {:?}", e);
            ApiError { error: e.to_string(), code: "DB_ERROR".into() }
        })
}

async fn ws_handler(ws: WebSocketUpgrade, Path(id): Path<String>, State(state): State<Arc<CoreState>>) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, id, state.registry.clone()))
}

async fn handle_socket(socket: WebSocket, doc_id: String, registry: Arc<cadmus_kernel::modules::content::socket::ContentRegistry>) {
    let (mut sender, mut receiver) = socket.split();
    let room = registry.get_room(&doc_id).await;
    let mut bcast_rx = room.tx.subscribe();

    let (tx, mut rx) = tokio::sync::mpsc::channel(100);
    let initial_sv = room.doc.transact().state_vector();
    let _ = tx.send(Message::Binary(YSyncMessage::Sync(SyncMessage::SyncStep1(initial_sv)).encode_v1())).await;

    let fwd = tokio::spawn(async move { while let Some(m) = rx.recv().await { if sender.send(m).await.is_err() { break; } } });
    let bcast = tokio::spawn(async move { while let Ok(u) = bcast_rx.recv().await { let _ = tx.send(Message::Binary(YSyncMessage::Sync(SyncMessage::Update(u)).encode_v1())).await; } });

    while let Some(Ok(Message::Binary(data))) = receiver.next().await {
        if let Ok(YSyncMessage::Sync(sm)) = YSyncMessage::decode_v1(&data) {
            match sm {
                SyncMessage::SyncStep1(sv) => {
                    let upd = room.doc.transact().encode_diff_v1(&sv);
                    let _ = registry.process_update(&doc_id, upd).await;
                },
                SyncMessage::Update(u) => { registry.process_update(&doc_id, u).await; },
                _ => {}
            }
        }
    }
    fwd.abort(); bcast.abort();
}

async fn get_collection(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Path(id): Path<Uuid>) -> Result<Json<serde_json::Value>, ApiError> {
    let rows = state.documents.get_collection_rows(id).await
        .map_err(|e| ApiError { error: e.to_string(), code: "DB_ERROR".into() })?;
    Ok(Json(serde_json::json!({ "rows": rows, "columns": [] })))
}

#[derive(Deserialize)]
pub struct UpdateCellRequest {
    pub row_id: Uuid,
    pub col_id: String,
    pub value: serde_json::Value,
}

async fn update_collection_cell(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Path(id): Path<Uuid>, Json(req): Json<UpdateCellRequest>) -> Result<String, ApiError> {
    state.documents.update_collection_cell(id, req.row_id, &req.col_id, req.value).await
        .map(|_| "CELL_UPDATED".into())
        .map_err(|e| ApiError { error: e.to_string(), code: "DB_ERROR".into() })
}

async fn add_collection_row(_auth: AuthenticatedUser, State(state): State<Arc<CoreState>>, Path(id): Path<Uuid>) -> Result<Json<serde_json::Value>, ApiError> {
    state.documents.add_collection_row(id).await
        .map(Json)
        .map_err(|e| ApiError { error: e.to_string(), code: "DB_ERROR".into() })
}

// Health Check
async fn db_health_check(State(state): State<Arc<CoreState>>) -> Result<String, ApiError> {
    sqlx::query("SELECT 1").execute(&state.pool).await
        .map(|_| "DB_OK".into())
        .map_err(|e| ApiError { error: e.to_string(), code: "DB_DOWN".into() })
}
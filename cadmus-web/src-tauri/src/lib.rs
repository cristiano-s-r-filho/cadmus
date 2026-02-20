use cadmus_kernel::domain::repository::{DocumentRepository, ArchetypeRepository};
use cadmus_kernel::infrastructure::sqlite::{SqliteDocumentRepository, SqliteArchetypeRepository};
use cadmus_kernel::modules::content::storage::ContentStorage;
use sqlx::sqlite::SqlitePoolOptions;
use tauri::{State, Manager};
use std::sync::Arc;
use uuid::Uuid;
use serde_json::json;

struct AppState {
    doc_repo: Arc<SqliteDocumentRepository>,
    arch_repo: Arc<SqliteArchetypeRepository>,
    storage: Arc<ContentStorage>,
}

#[tauri::command]
async fn push_update(state: State<'_, AppState>, doc_id: String, update: Vec<u8>) -> Result<(), String> {
    state.storage.save_update(&doc_id, update).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_updates(state: State<'_, AppState>, doc_id: String) -> Result<Vec<Vec<u8>>, String> {
    state.storage.load_updates(&doc_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_latest_update(state: State<'_, AppState>, doc_id: String) -> Result<Option<Vec<u8>>, String> {
    state.storage.load_latest_update(&doc_id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_recent_docs(state: State<'_, AppState>, user_id: String, limit: i64) -> Result<serde_json::Value, String> {
    let uid = Uuid::parse_str(&user_id).map_err(|e| e.to_string())?;
    let docs = state.doc_repo.find_recent(uid, limit).await.map_err(|e| e.to_string())?;
    Ok(json!(docs))
}

#[tauri::command]
async fn get_all_docs(state: State<'_, AppState>, user_id: String) -> Result<serde_json::Value, String> {
    let uid = Uuid::parse_str(&user_id).map_err(|e| e.to_string())?;
    let docs = state.doc_repo.find_all(uid).await.map_err(|e| e.to_string())?;
    Ok(json!(docs))
}

#[tauri::command]
async fn create_doc(state: State<'_, AppState>, user_id: String, title: String, class_id: Option<String>, parent_id: Option<String>) -> Result<serde_json::Value, String> {
    let uid = Uuid::parse_str(&user_id).map_err(|e| e.to_string())?;
    let pid = parent_id.and_then(|s| Uuid::parse_str(&s).ok());
    let node = state.doc_repo.create(uid, title, class_id, pid).await.map_err(|e| e.to_string())?;
    Ok(json!(node))
}

#[tauri::command]
async fn delete_doc(state: State<'_, AppState>, doc_id: String, user_id: String) -> Result<(), String> {
    let did = Uuid::parse_str(&doc_id).map_err(|e| e.to_string())?;
    let uid = Uuid::parse_str(&user_id).map_err(|e| e.to_string())?;
    state.doc_repo.delete(did, uid).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_archetypes(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let archs = state.arch_repo.find_all().await.map_err(|e| e.to_string())?;
    Ok(json!(archs))
}

#[tauri::command]
async fn get_system_stats(state: State<'_, AppState>, user_id: String) -> Result<serde_json::Value, String> {
    let uid = Uuid::parse_str(&user_id).map_err(|e| e.to_string())?;
    let stats = state.doc_repo.get_stats(uid).await.map_err(|e| e.to_string())?;
    Ok(json!(stats))
}

#[tauri::command]
async fn update_doc_property(state: State<'_, AppState>, doc_id: String, key: String, value: serde_json::Value, _user_id: Option<String>) -> Result<(), String> {
    let did = Uuid::parse_str(&doc_id).map_err(|e| e.to_string())?;
    state.doc_repo.update_property(did, &key, value).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_collection(state: State<'_, AppState>, doc_id: String) -> Result<serde_json::Value, String> {
    let did = Uuid::parse_str(&doc_id).map_err(|e| e.to_string())?;
    let rows = state.doc_repo.get_collection_rows(did).await.map_err(|e| e.to_string())?;
    Ok(json!({ "rows": rows, "columns": [] }))
}

#[tauri::command]
async fn update_collection_cell(state: State<'_, AppState>, doc_id: String, row_id: String, col_id: String, value: serde_json::Value) -> Result<(), String> {
    let did = Uuid::parse_str(&doc_id).map_err(|e| e.to_string())?;
    let rid = Uuid::parse_str(&row_id).map_err(|e| e.to_string())?;
    state.doc_repo.update_collection_cell(did, rid, &col_id, value).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn add_collection_row(state: State<'_, AppState>, doc_id: String) -> Result<serde_json::Value, String> {
    let did = Uuid::parse_str(&doc_id).map_err(|e| e.to_string())?;
    let row = state.doc_repo.add_collection_row(did).await.map_err(|e| e.to_string())?;
    Ok(json!(row))
}

#[tauri::command]
async fn get_tags(state: State<'_, AppState>, doc_id: String) -> Result<Vec<String>, String> {
    let did = Uuid::parse_str(&doc_id).map_err(|e| e.to_string())?;
    state.doc_repo.get_tags_with_inheritance(did).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_links(state: State<'_, AppState>, user_id: String) -> Result<serde_json::Value, String> {
    let uid = Uuid::parse_str(&user_id).map_err(|e| e.to_string())?;
    let links = state.doc_repo.find_links(uid).await.map_err(|e| e.to_string())?;
    Ok(json!(links))
}

#[tauri::command]
async fn create_link(state: State<'_, AppState>, from_id: String, to_id: String) -> Result<(), String> {
    let fid = Uuid::parse_str(&from_id).map_err(|e| e.to_string())?;
    let tid = Uuid::parse_str(&to_id).map_err(|e| e.to_string())?;
    state.doc_repo.add_link(fid, tid).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_doc(state: State<'_, AppState>, doc_id: String) -> Result<serde_json::Value, String> {
    let did = Uuid::parse_str(&doc_id).map_err(|e| e.to_string())?;
    let doc = state.doc_repo.find_by_id(did).await.map_err(|e| e.to_string())?
        .ok_or("DOC_NOT_FOUND".to_string())?;
    Ok(json!(doc))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_data_dir = app.path().app_data_dir().expect("failed to get app data dir");
            if !app_data_dir.exists() {
                std::fs::create_dir_all(&app_data_dir).expect("failed to create app data dir");
            }
            let db_path = app_data_dir.join("cadmus_local.db");
            let db_url = format!("sqlite:{}?mode=rwc", db_path.display());

            let pool = tauri::async_runtime::block_on(async {
                SqlitePoolOptions::new()
                    .max_connections(5)
                    .connect(&db_url)
                    .await
                    .expect("Failed to connect to local SQLite")
            });

            let doc_repo = Arc::new(SqliteDocumentRepository::new(pool.clone()));
            let arch_repo = Arc::new(SqliteArchetypeRepository::new(pool.clone()));
            let storage = Arc::new(ContentStorage::new_sqlite(pool.clone()));

            // Initialize DB tables
            tauri::async_runtime::block_on(async {
                println!("Cadmus Kernel: Initializing Local Storage at {}...", db_path.display());
                match doc_repo.initialize().await {
                    Ok(_) => println!("Cadmus Kernel: Database Ready & Seeded."),
                    Err(e) => eprintln!("Cadmus Kernel: Initialization Failed: {}", e),
                }
            });

            app.manage(AppState { doc_repo, arch_repo, storage });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_doc,
            push_update,
            get_updates,
            get_latest_update,
            get_recent_docs,
            get_all_docs,
            create_doc,
            delete_doc,
            get_archetypes,
            get_system_stats,
            update_doc_property,
            get_collection,
            update_collection_cell,
            add_collection_row,
            get_tags,
            get_links,
            create_link
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

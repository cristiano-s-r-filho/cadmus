use serde::{Deserialize, Serialize};
use uuid::Uuid;
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct WorkspaceNode {
    pub id: Uuid,
    pub title: String,
    pub parent_id: Option<Uuid>,
    pub class_id: Option<String>,
    #[sqlx(default)]
    pub properties: serde_json::Value,
}

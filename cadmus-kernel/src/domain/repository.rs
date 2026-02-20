use async_trait::async_trait;
use uuid::Uuid;
use crate::modules::content::workspace::WorkspaceNode;
use crate::domain::archetypes::Archetype;

#[async_trait]
pub trait DocumentRepository: Send + Sync {
    async fn create(&self, owner_id: Uuid, title: String, class_id: Option<String>, parent_id: Option<Uuid>) -> anyhow::Result<WorkspaceNode>;
    async fn find_recent(&self, owner_id: Uuid, limit: i64) -> anyhow::Result<Vec<WorkspaceNode>>;
    async fn find_all(&self, owner_id: Uuid) -> anyhow::Result<Vec<WorkspaceNode>>;
    async fn find_by_id(&self, id: Uuid) -> anyhow::Result<Option<WorkspaceNode>>;
    async fn delete(&self, id: Uuid, owner_id: Uuid) -> anyhow::Result<()>;
    async fn get_stats(&self, owner_id: Uuid) -> anyhow::Result<crate::kernel::types::SystemStats>;
    
    // Properties & Content
    async fn update_property(&self, doc_id: Uuid, key: &str, value: serde_json::Value) -> anyhow::Result<()>;
    async fn get_tags_with_inheritance(&self, doc_id: Uuid) -> anyhow::Result<Vec<String>>;
    
    // Links & Graph
    async fn add_link(&self, from_id: Uuid, to_id: Uuid) -> anyhow::Result<()>;
    async fn find_links(&self, owner_id: Uuid) -> anyhow::Result<Vec<(Uuid, Uuid)>>;
    async fn find_children_properties(&self, parent_id: Uuid, class_filter: Option<String>) -> anyhow::Result<Vec<serde_json::Value>>;
    async fn get_aggregate_sum(&self, parent_id: Uuid, property_key: &str) -> anyhow::Result<f64>;
    
    // Collection Engine
    async fn get_collection_rows(&self, doc_id: Uuid) -> anyhow::Result<Vec<serde_json::Value>>;
    async fn update_collection_cell(&self, doc_id: Uuid, row_id: Uuid, col_id: &str, value: serde_json::Value) -> anyhow::Result<()>;
    async fn add_collection_row(&self, doc_id: Uuid) -> anyhow::Result<serde_json::Value>;

    // Intelligence & Vector Store (GAP 2 Solved)
    async fn update_embedding(&self, doc_id: Uuid, embedding: Vec<f32>) -> anyhow::Result<()>;
    async fn search_similar(&self, embedding: Vec<f32>, limit: i64) -> anyhow::Result<Vec<Uuid>>;
}

#[async_trait]
pub trait ArchetypeRepository: Send + Sync {
    async fn find_all(&self) -> anyhow::Result<Vec<Archetype>>;
    async fn find_by_id(&self, id: &str) -> anyhow::Result<Option<Archetype>>;
}

#[async_trait]
pub trait AuditRepository: Send + Sync {
    async fn log(&self, user_id: Option<Uuid>, resource_id: Option<Uuid>, resource_type: &str, action: &str, details: Option<String>) -> anyhow::Result<()>;
}

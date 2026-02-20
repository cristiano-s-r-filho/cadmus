use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use async_trait::async_trait;
use serde_json::Value;

pub mod modules;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Archetype {
    pub id: String,
    pub name: String,
    pub icon: Option<String>,
    pub group_id: Option<String>,
    pub required_tier: Option<String>,
    #[sqlx(default)]
    pub ui_schema: Value,      
    #[sqlx(default)]
    pub behavior_rules: Value, 
    #[sqlx(default)]
    pub allowed_children: Option<Vec<String>>, 
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldDefinition {
    pub key: String,
    pub r#type: String, 
    pub label: String,
    pub options: Option<Vec<String>>,
    pub read_only: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AggregationRule {
    pub target: String,
    pub source: String, 
    pub filter: Value,
    pub calc: String, 
}

/// Interface fundamental para comportamentos especializados de domínio (GAP 6).
#[async_trait]
pub trait SovereignBehavior: Send + Sync {
    /// Executado quando uma propriedade de um documento filho é alterada.
    async fn on_child_change(&self, parent_id: &uuid::Uuid, child_id: &uuid::Uuid, key: &str, value: &Value) -> anyhow::Result<()>;
    
    /// Valida se um documento pode ser criado ou movido para este contexto.
    async fn validate_integrity(&self, document_id: &uuid::Uuid) -> anyhow::Result<bool>;
}

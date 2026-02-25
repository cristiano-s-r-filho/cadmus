use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use async_trait::async_trait;
use serde_json::Value;

pub mod modules;

/// Represents an Archetype, which defines the structure and behavior for different types of documents.
/// This struct is directly mapped from the 'classes' table in the database.
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Archetype {
    pub id: String, // Unique identifier for the archetype (e.g., "note", "asset").
    pub name: String, // Human-readable name of the archetype.
    pub icon: Option<String>, // Optional icon associated with the archetype.
    pub group_id: Option<String>, // Optional group identifier for categorization.
    pub required_tier: Option<String>, // Optional field indicating a required access tier.
    #[sqlx(default)] // Uses Default trait if column is missing from SELECT statement.
    pub ui_schema: Value,      // JSONB schema defining the UI fields for this archetype.
    #[sqlx(default)] // Uses Default trait if column is missing from SELECT statement.
    pub behavior_rules: Value, // JSONB rules defining the behavior logic for this archetype.
    pub allowed_children: Option<Vec<String>>, // Native PostgreSQL TEXT[] array of allowed child archetype IDs.
}

/// Defines the structure for a UI field within an Archetype's ui_schema.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FieldDefinition {
    pub key: String, // The unique key for the field.
    pub r#type: String, // The type of the UI component (e.g., "text", "money", "select").
    pub label: String, // The display label for the field.
    pub options: Option<Vec<String>>, // Options for 'select' type fields.
    pub read_only: Option<bool>, // Whether the field is read-only.
}

/// Defines an aggregation rule for archetype behavior.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AggregationRule {
    pub target: String, // The target field for the aggregation.
    pub source: String, // The source of the data (e.g., "children").
    pub filter: Value, // JSON filter criteria for source data.
    pub calc: String, // The calculation method (e.g., "sum_value").
}

/// Interface fundamental para comportamentos especializados de domínio (GAP 6).
/// This trait defines actions that archetypes can perform, such as reacting to child changes
/// or validating integrity within their context.
#[async_trait]
pub trait SovereignBehavior: Send + Sync {
    /// Executado quando uma propriedade de um documento filho é alterada.
    /// Triggered when a property of a child document is modified.
    async fn on_child_change(&self, parent_id: &uuid::Uuid, child_id: &uuid::Uuid, key: &str, value: &Value) -> anyhow::Result<()>;
    
    /// Valida se um documento pode ser criado ou movido para este contexto.
    /// Validates if a document can be created or moved into this context.
    async fn validate_integrity(&self, document_id: &uuid::Uuid) -> anyhow::Result<bool>;
}

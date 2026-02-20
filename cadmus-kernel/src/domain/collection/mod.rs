use serde::{Deserialize, Serialize};
use evalexpr::*;
use serde_json::{Value, json};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CollectionSchema {
    pub columns: Vec<ColumnDefinition>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ColumnDefinition {
    pub id: String,
    pub name: String,
    pub r#type: ColumnType,
    pub formula: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ColumnType {
    Text,
    Number,
    Date,
    Select,
    Formula,
    DocRef,
}

pub struct FormulaEngine;

impl FormulaEngine {
    pub fn evaluate(formula: &str, context: &Value) -> Result<Value, String> {
        let mut eval_context = HashMapContext::new();
        
        // Injeta valores das colunas no contexto da fórmula
        if let Some(obj) = context.as_object() {
            for (k, v) in obj {
                if let Some(n) = v.as_f64() {
                    let _ = eval_context.set_value(k.into(), n.into());
                } else if let Some(s) = v.as_str() {
                    let _ = eval_context.set_value(k.into(), s.into());
                }
            }
        }

        eval_with_context(formula, &eval_context)
            .map(|v| match v {
                evalexpr::Value::Float(f) => json!(f),
                evalexpr::Value::Int(i) => json!(i),
                evalexpr::Value::String(s) => json!(s),
                evalexpr::Value::Boolean(b) => json!(b),
                _ => json!(null),
            })
            .map_err(|e| e.to_string())
    }
}

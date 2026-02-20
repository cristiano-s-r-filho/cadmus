use serde::{Deserialize, Serialize};

use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemStats {
    pub nodes: i32,
    pub class_distribution: HashMap<String, i32>,
    pub recent_activity_count: i32,
    pub total_links: i32,
    pub orphan_nodes: i32,
    pub untagged_nodes: i32,
}

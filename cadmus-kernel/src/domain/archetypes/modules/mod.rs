pub mod legal;
pub mod tech;
pub mod finance;

use std::collections::HashMap;
use std::sync::Arc;
use crate::domain::archetypes::SovereignBehavior;

pub struct ModuleRegistry {
    behaviors: HashMap<String, Arc<dyn SovereignBehavior>>,
}

impl Default for ModuleRegistry {
    fn default() -> Self {
        Self::new()
    }
}

impl ModuleRegistry {
    pub fn new() -> Self {
        let mut behaviors: HashMap<String, Arc<dyn SovereignBehavior>> = HashMap::new();
        
        // Registro de módulos especializados
        behaviors.insert("legal".to_string(), Arc::new(legal::LegalModule));
        behaviors.insert("tech".to_string(), Arc::new(tech::TechModule));
        behaviors.insert("finance".to_string(), Arc::new(finance::FinanceModule));

        Self { behaviors }
    }

    pub fn get_behavior(&self, module_id: &str) -> Option<Arc<dyn SovereignBehavior>> {
        self.behaviors.get(module_id).cloned()
    }
}

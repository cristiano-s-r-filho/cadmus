use sha2::{Sha256, Digest};
use hex;

pub struct IntegrityEngine;

impl IntegrityEngine {
    /// Calcula o hash soberano para um elo da auditoria.
    /// Combina os dados da transação com o hash do elo anterior.
    pub fn calculate_audit_hash(
        user_id: Option<&str>,
        resource_id: Option<&str>,
        action: &str,
        details: &str,
        prev_hash: Option<&str>
    ) -> String {
        let mut hasher = Sha256::new();
        
        hasher.update(user_id.unwrap_or("SYSTEM"));
        hasher.update(resource_id.unwrap_or("NULL"));
        hasher.update(action);
        hasher.update(details);
        hasher.update(prev_hash.unwrap_or("GENESIS_BLOCK"));

        hex::encode(hasher.finalize())
    }

    /// Verifica se um elo da corrente é válido.
    pub fn verify_link(
        current_hash: &str,
        user_id: Option<&str>,
        resource_id: Option<&str>,
        action: &str,
        details: &str,
        prev_hash: Option<&str>
    ) -> bool {
        let calculated = Self::calculate_audit_hash(user_id, resource_id, action, details, prev_hash);
        calculated == current_hash
    }
}

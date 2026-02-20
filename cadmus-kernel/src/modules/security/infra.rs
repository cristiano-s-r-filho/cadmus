use argon2::{
    password_hash::{rand_core::OsRng, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use pasetors::local;
use pasetors::keys::SymmetricKey;
use pasetors::version4::V4;
use pasetors::claims::Claims;
use serde_json::json;
use crate::shared::errors::KernelError;

pub struct SecurityService {
    key: SymmetricKey<V4>,
}

impl SecurityService {
    pub fn new(secret: &str) -> Self {
        // In a production app, we'd use a real 32-byte key. 
        // For dev, we derive it or use a fixed one.
        let mut key_bytes = [0u8; 32];
        let secret_bytes = secret.as_bytes();
        let len = secret_bytes.len().min(32);
        key_bytes[..len].copy_from_slice(&secret_bytes[..len]);
        
        let key = SymmetricKey::<V4>::from(&key_bytes).unwrap();
        Self { key }
    }

    pub fn hash_password(&self, password: &str) -> Result<String, KernelError> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(password.as_bytes(), &salt)
            .map_err(|_| KernelError::Internal("Hashing failed".to_string()))?
            .to_string();
        Ok(password_hash)
    }

    pub fn verify_password(&self, password: &str, hash: &str) -> bool {
        let argon2 = Argon2::default();
        let parsed_hash = match argon2::PasswordHash::new(hash) {
            Ok(h) => h,
            Err(_) => return false,
        };
        argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok()
    }

    pub fn generate_token(&self, user_id: &str) -> Result<String, KernelError> {
        let mut claims = Claims::new().unwrap();
        claims.add_additional("user_id", json!(user_id)).unwrap();
        claims.expiration("2027-01-01T00:00:00Z").unwrap(); 

        let token = local::encrypt(&self.key, &claims, None, None)
            .map_err(|e| KernelError::Internal(e.to_string()))?;
        
        Ok(token)
    }
}

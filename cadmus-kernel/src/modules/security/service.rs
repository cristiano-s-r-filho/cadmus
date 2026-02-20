//! Security Service Logic
//!
//! Handles user authentication, registration, and token management using Paseto and Argon2.

use argon2::{
    password_hash::{
        rand_core::OsRng,
        PasswordHash, PasswordHasher, PasswordVerifier, SaltString
    },
    Argon2
};
use pasetors::local;
use pasetors::keys::SymmetricKey;
use pasetors::version4::V4;
use pasetors::claims::Claims;
use serde_json::json;
use super::domain::{LoginRequest, RegisterRequest, User};
use crate::shared::errors::KernelError;
use sqlx::PgPool;
use uuid::Uuid;

/// Service responsible for identity management and cryptographic operations.
pub struct SecurityService {
    db: PgPool,
    key: SymmetricKey<V4>,
}

#[derive(sqlx::FromRow)]
struct UserRecord {
    id: Uuid,
    username: String,
    password_hash: String,
    avatar_url: Option<String>,
}

impl SecurityService {
    /// Initializes a new SecurityService. 
    /// Expects PASETO_SECRET environment variable for token encryption.
    pub fn new(db: PgPool) -> Self {
        let secret = std::env::var("PASETO_SECRET").unwrap_or_else(|_| "emergency_fallback_secret_32bytes_!!".to_string());
        let mut key_bytes = [0u8; 32];
        let secret_bytes = secret.as_bytes();
        let len = secret_bytes.len().min(32);
        key_bytes[..len].copy_from_slice(&secret_bytes[..len]);
        
        let key = SymmetricKey::<V4>::from(&key_bytes).unwrap();
        Self { db, key }
    }

    /// Generates a signed Paseto V4 local token for a given user ID.
    pub fn generate_token(&self, user_id: Uuid) -> Result<String, KernelError> {
        let mut claims = Claims::new().unwrap();
        claims.add_additional("user_id", json!(user_id)).unwrap();
        let exp = (chrono::Utc::now() + chrono::Duration::days(30)).to_rfc3339();
        claims.expiration(&exp).unwrap(); 

        let token = local::encrypt(&self.key, &claims, None, None)
            .map_err(|e| KernelError::Internal(e.to_string()))?;
        
        Ok(token)
    }

    /// Validates a Paseto token and extracts the contained user ID.
    pub fn validate_token(&self, token: &str) -> Result<Uuid, KernelError> {
        use pasetors::token::UntrustedToken;
        use pasetors::claims::ClaimsValidationRules;

        let untrusted_token = UntrustedToken::<pasetors::Local, V4>::try_from(token)
            .map_err(|_| KernelError::AuthError)?;

        let validation_rules = ClaimsValidationRules::new();

        let trusted_data = local::decrypt(&self.key, &untrusted_token, &validation_rules, None, None)
            .map_err(|_| KernelError::AuthError)?;
        
        let payload: serde_json::Value = serde_json::from_str(trusted_data.payload())
            .map_err(|_| KernelError::AuthError)?;

        let uid_str = payload["user_id"].as_str().ok_or(KernelError::AuthError)?;
        Uuid::parse_str(uid_str).map_err(|_| KernelError::AuthError)
    }

    /// Registers a new operator in the system.
    pub async fn register(&self, req: RegisterRequest) -> Result<User, KernelError> {
        let salt = SaltString::generate(&mut OsRng);
        let argon2 = Argon2::default();
        let password_hash = argon2.hash_password(req.password.as_bytes(), &salt)
            .map_err(|e| KernelError::Internal(e.to_string()))?
            .to_string();

        let user_id = Uuid::new_v4();

        sqlx::query(
            "INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3)"
        )
        .bind(user_id)
        .bind(&req.username)
        .bind(password_hash)
        .execute(&self.db)
        .await?;

        Ok(User {
            id: user_id,
            username: req.username,
            avatar_url: None,
            token: None,
        })
    }

    /// Authenticates an operator using username and password.
    pub async fn login(&self, req: LoginRequest) -> Result<User, KernelError> {
        let record: Option<UserRecord> = sqlx::query_as(
            "SELECT id, username, password_hash, avatar_url FROM users WHERE username = $1"
        )
        .bind(&req.username)
        .fetch_optional(&self.db)
        .await?;

        let record = record.ok_or(KernelError::AuthError)?;

        let parsed_hash = PasswordHash::new(&record.password_hash)
            .map_err(|e| KernelError::Internal(e.to_string()))?;

        Argon2::default().verify_password(req.password.as_bytes(), &parsed_hash)
            .map_err(|_| KernelError::AuthError)?;

        Ok(User {
            id: record.id,
            username: record.username,
            avatar_url: record.avatar_url,
            token: None,
        })
    }

    /// Updates the operator profile metadata.
    pub async fn update_profile(&self, user_id: Uuid, avatar_url: Option<String>) -> Result<(), KernelError> {
        sqlx::query(
            "UPDATE users SET avatar_url = $1 WHERE id = $2"
        )
        .bind(avatar_url)
        .bind(user_id)
        .execute(&self.db)
        .await
        .map_err(|e| KernelError::Internal(e.to_string()))?;
        
        Ok(())
    }
}
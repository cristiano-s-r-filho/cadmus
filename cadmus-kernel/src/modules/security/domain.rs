use serde::{Deserialize, Serialize};
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub username: String,
    pub avatar_url: Option<String>,
    pub token: Option<String>,
}

#[derive(Debug, Clone)]
pub struct PasskeyCredential {
    pub id: Uuid,
    pub user_id: Uuid,
    // pub passkey: Passkey, // Temporarily disabled due to build issues
    pub credential_id: Vec<u8>,
}

#[derive(Debug, Validate, Deserialize)]

pub struct RegisterRequest {

    #[validate(length(min = 3, max = 20))]

    pub username: String,

    #[validate(length(min = 8))]

    pub password: String,

}



#[derive(Debug, Validate, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateProfileRequest {
    pub user_id: Uuid,
    pub avatar_url: Option<String>,
}

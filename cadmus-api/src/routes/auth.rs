use axum::{
    extract::{State, FromRef, FromRequestParts}, 
    routing::post, 
    Json, Router,
    http::{HeaderMap, request::Parts}
};
use uuid::Uuid;
use cadmus_kernel::modules::security::domain::{LoginRequest, RegisterRequest, UpdateProfileRequest, User};
use cadmus_kernel::shared::database::CoreState;
use cadmus_kernel::domain::repository::AuditRepository;
use std::sync::Arc;
use crate::routes::content::ApiError;

pub struct AuthenticatedUser(pub Uuid);

#[axum::async_trait]
impl<S> FromRequestParts<S> for AuthenticatedUser
where
    Arc<CoreState>: axum::extract::FromRef<S>,
    S: Send + Sync,
{
    type Rejection = ApiError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let auth_header = parts.headers.get("Authorization")
            .and_then(|v| v.to_str().ok());

        if auth_header.is_none() {
            tracing::warn!("Auth: Missing Authorization header");
            return Err(ApiError { error: "MISSING_AUTH_TOKEN".into(), code: "UNAUTHORIZED".into() });
        }

        let auth_header = auth_header.unwrap();
        if !auth_header.starts_with("Bearer ") {
            tracing::warn!("Auth: Invalid header format: {}", auth_header);
            return Err(ApiError { error: "INVALID_AUTH_FORMAT".into(), code: "UNAUTHORIZED".into() });
        }

        let token = &auth_header[7..];
        let core_state = Arc::<CoreState>::from_ref(state);

        match core_state.security.validate_token(token) {
            Ok(user_id) => {
                tracing::debug!("Auth: Validated user session: {}", user_id);
                Ok(AuthenticatedUser(user_id))
            },
            Err(e) => {
                tracing::error!("Auth: Token validation failed: {:?}", e);
                Err(ApiError { error: "INVALID_OR_EXPIRED_TOKEN".into(), code: "UNAUTHORIZED".into() })
            }
        }
    }
}

pub fn auth_routes() -> Router<Arc<CoreState>> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/profile", post(update_profile))
}

async fn register(
    State(state): State<Arc<CoreState>>,
    Json(payload): Json<RegisterRequest>,
) -> Result<Json<User>, ApiError> {
    let mut user = state.security.register(payload).await
        .map_err(|e| ApiError { error: e.to_string(), code: "REGISTRATION_FAIL".into() })?;

    // Generate PASETO Token immediately after registration
    let token = state.security.generate_token(user.id)
        .map_err(|e| ApiError { error: e.to_string(), code: "TOKEN_ERROR".into() })?;
    
    user.token = Some(token);

    Ok(Json(user))
}

async fn login(
    State(state): State<Arc<CoreState>>,
    headers: HeaderMap,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<User>, ApiError> {
    let mut user = state.security.login(payload).await
        .map_err(|_| ApiError { error: "AUTHENTICATION_FAILED".into(), code: "AUTH_ERROR".into() })?;

    // Generate PASETO Token
    let token = state.security.generate_token(user.id)
        .map_err(|e| ApiError { error: e.to_string(), code: "TOKEN_ERROR".into() })?;
    
    user.token = Some(token);

    // GAP 3.3: Session Hardening / Device Fingerprinting
    let user_agent = headers.get("user-agent")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("UNKNOWN_AGENT");
    
    let details = format!("UA: {}", user_agent);
    
    let _ = state.audit.log(
        Some(user.id), 
        None, 
        "Identity", 
        "SESSION_START", 
        Some(details)
    ).await;

    Ok(Json(user))
}

async fn update_profile(
    State(state): State<Arc<CoreState>>,
    Json(payload): Json<UpdateProfileRequest>,
) -> Result<String, ApiError> {
    state.security.update_profile(payload.user_id, payload.avatar_url).await
        .map(|_| "PROFILE_SYNCED".into())
        .map_err(|e| ApiError { error: e.to_string(), code: "SYNC_ERROR".into() })
}
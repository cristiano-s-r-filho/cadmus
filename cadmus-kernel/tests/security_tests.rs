use cadmus_kernel::modules::security::service::SecurityService;
use cadmus_kernel::modules::security::domain::{LoginRequest, RegisterRequest};
use sqlx::postgres::PgPoolOptions;
use std::env;

#[tokio::test]
async fn test_security_flow_full() {
    dotenvy::dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set for integration tests");
    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&db_url)
        .await
        .expect("Failed to connect to test database");

    let service = SecurityService::new(pool.clone());

    // 1. Register
    let username = format!("test_user_{}", uuid::Uuid::new_v4());
    let reg_req = RegisterRequest {
        username: username.clone(),
        password: "secure_password_123".to_string(),
    };

    let user = service.register(reg_req).await.expect("Failed to register");
    assert_eq!(user.username, username);

    // 2. Login
    let login_req = LoginRequest {
        username: username.clone(),
        password: "secure_password_123".to_string(),
    };

    let logged_in_user = service.login(login_req).await.expect("Failed to login");
    assert_eq!(logged_in_user.id, user.id);

    // 3. Token Generation & Validation
    let token = service.generate_token(user.id).expect("Failed to generate token");
    let validated_id = service.validate_token(&token).expect("Failed to validate token");
    assert_eq!(validated_id, user.id);

    // 4. Invalid Login
    let wrong_login = LoginRequest {
        username: username.clone(),
        password: "wrong_password".to_string(),
    };
    let result = service.login(wrong_login).await;
    assert!(result.is_err());

    // Cleanup (optional, depends on test DB strategy)
    sqlx::query("DELETE FROM users WHERE id = $1").bind(user.id).execute(&pool).await.ok();
}

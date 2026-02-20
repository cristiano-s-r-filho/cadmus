use cadmus_kernel::infrastructure::postgres::PostgresDocumentRepository;
use cadmus_kernel::domain::repository::DocumentRepository;
use sqlx::postgres::PgPoolOptions;
use std::env;
use uuid::Uuid;

#[tokio::test]
async fn test_document_lifecycle() {
    dotenvy::dotenv().ok();
    let db_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set for integration tests");
    let pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&db_url)
        .await
        .expect("Failed to connect to test database");

    let repo = PostgresDocumentRepository::new(pool.clone());
    let user_id = Uuid::new_v4();

    // 1. Create User (required for FK constraints if any, or just use random UUID)
    sqlx::query("INSERT INTO users (id, username, password_hash) VALUES ($1, $2, $3)")
        .bind(user_id)
        .bind(format!("user_{}", user_id))
        .bind("hash")
        .execute(&pool).await.ok();

    // 2. Create Document
    let doc = repo.create(user_id, "Test Document".to_string(), Some("note".to_string()), None)
        .await.expect("Failed to create doc");
    
    assert_eq!(doc.title, "Test Document");

    // 3. Update Property
    repo.update_property(doc.id, "content", serde_json::json!("Hello Cadmus"))
        .await.expect("Failed to update property");

    // 4. Find Document
    let found = repo.find_by_id(doc.id).await.expect("Failed to find doc");
    assert!(found.is_some());
    let found = found.unwrap();
    assert_eq!(found.properties["content"], "Hello Cadmus");

    // 5. Delete
    repo.delete(doc.id, user_id).await.expect("Failed to delete doc");
    let missing = repo.find_by_id(doc.id).await.expect("Fail");
    assert!(missing.is_none());
}

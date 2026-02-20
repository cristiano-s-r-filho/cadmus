use thiserror::Error;

#[derive(Error, Debug)]
pub enum KernelError {
    #[error("Database error: {0}")]
    DbError(#[from] sqlx::Error),
    #[error("Authentication failed")]
    AuthError,
    #[error("Not found")]
    NotFound,
    #[error("Internal error: {0}")]
    Internal(String),
}

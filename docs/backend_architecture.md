# Cadmus Backend Architecture: Rust (Axum, SQLx)

This document details the architectural design and key component integrations of the Cadmus API backend, built with Rust using the Axum web framework and SQLx for asynchronous database access.

---

## 1. Core Framework and Ecosystem

- **Web Framework:** Axum (built on Tokio and Hyper)
- **Database Access:** SQLx (asynchronous, compile-time checked SQL queries)
- **Asynchronous Runtime:** Tokio
- **Logging:** `tracing` and `tracing-subscriber`
- **Dependency Management:** `cargo`

---

## 2. Application Structure (`cadmus-api` & `cadmus-kernel`)

The backend is structured as a modular monolith, separating API concerns (`cadmus-api`) from core business logic and domain models (`cadmus-kernel`).

- **`cadmus-api` (API Layer):**
    - Handles HTTP request routing, deserialization of incoming requests, and serialization of outgoing responses.
    - Contains route handlers (`src/routes/*`) for authentication, content management, and statistics.
    - Utilizes Axum's `State` extractor for dependency injection of `Arc<CoreState>`.
    - Implements custom `ApiError` for consistent error responses across the API.
    - Integrates `tower-http` for CORS and tracing middleware.
- **`cadmus-kernel` (Core Logic Layer):**
    - Contains domain models, business logic, and database repository implementations.
    - Organized into modules like `security`, `content`, `domain`, `infrastructure`, and `shared`.
    - **`CoreState`:** A central `Arc<CoreState>` struct (`cadmus-kernel/src/shared/database/CoreState.rs`) holds shared, application-wide resources such as the database pool (`PgPool`) and instances of various repositories (e.g., `DocumentRepository`, `ArchetypeRepository`, `AuditRepository`, `SecurityService`). This pattern allows efficient access to these services from any route handler via Axum's `State` extractor.

---

## 3. Database Interaction (SQLx & Migrations)

Cadmus uses PostgreSQL as its primary data store, with `sqlx` providing robust, asynchronous, and type-safe database access.

- **`sqlx`:**
    - Compile-time checking of SQL queries ensures data integrity and prevents common SQL errors.
    - Used for all direct database interactions within the repository implementations (`cadmus-kernel/src/infrastructure/postgres.rs`).
- **Migrations:**
    - Managed by `sqlx-cli`. Migration files (`cadmus-kernel/migrations/*.sql`) define schema changes.
    - **Automatic Execution:** Migrations are automatically applied on application startup (`run_migrations`) in `cadmus-api/src/main.rs`. This ensures the database schema is always up-to-date with the application code.
- **Key Database Design:**
    - **`classes` Table:** Defines `Archetype` (document types) with `ui_schema` (JSONB for frontend UI definition), `behavior_rules` (JSONB for backend logic), `allowed_children` (PostgreSQL `TEXT[]` array), and `required_tier` (TEXT for access control).
    - **Row Level Security (RLS):** Policies are enabled and enforced to control data access based on `owner_id` (set via `SET LOCAL app.current_user_id` in authenticated transactions), ensuring data isolation and HIPAA compliance for audit logs.

---

## 4. Authentication and Authorization

- **PASETO Tokens:** Used for secure, stateless authentication. Tokens are generated upon login/registration and validated per request.
- **`AuthenticatedUser` Extractor:** A custom Axum `FromRequestParts` extractor (`cadmus-api/src/routes/auth.rs`) handles PASETO token validation and injects the authenticated user's ID (`Uuid`) into route handlers.
- **Audit Logging:** All significant authentication actions (login, registration) and resource access are logged to the `audit_logs` table, forming a verifiable audit trail with cryptographic hashing (`prev_hash`, `hash`).

---

## 5. Error Handling and Logging

- **`ApiError`:** A custom error struct (`cadmus-api/src/routes/content.rs`) for consistent, structured error responses across the API. It maps specific error codes to appropriate HTTP status codes.
- **`anyhow`:** Used for flexible error handling within the kernel and repository layers. Errors are converted to `ApiError` at the API boundary.
- **`tracing`:** Provides structured and context-aware logging.
    - Configured to `INFO` level by default in `cadmus-api/src/main.rs`, adjustable via `RUST_LOG` environment variable.
    - `RUST_BACKTRACE=1` environment variable is essential during debugging for capturing detailed Rust stack traces.

---

## 6. Real-time Collaboration (WebSockets)

- **Yjs WebSockets:** The `cadmus-api` provides a WebSocket endpoint (`/api/v1/content/ws/doc/:id`) for real-time collaborative editing of documents.
- **`y-sync` and `yrs`:** Integrates with the Yjs ecosystem to handle document synchronization and updates.

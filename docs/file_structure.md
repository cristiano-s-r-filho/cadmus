# Cadmus Project Structure

## Overview
The Cadmus project is organized as a modular monolith to balance development velocity with architectural clarity. It consists of three primary crates and a comprehensive documentation suite.

## /cadmus-api (Backend Interface)
The API layer serves as the entry point for all network communication.
- src/main.rs: Server initialization, middleware configuration (CORS, Logging), and route mounting.
- src/routes/: Module-based route definitions.
  - auth.rs: Identity management and session validation.
  - content.rs: Document CRUD and synchronization endpoints.
  - stats.rs: System telemetry and node metrics.

## /cadmus-kernel (Core Engine)
The kernel contains the system's "brain" and is decoupled from the transport layer (HTTP/WS).
- src/domain/: Core entities, repository interfaces, and business logic.
- src/infrastructure/: Concrete implementations of repositories (SQLx for Postgres/SQLite).
- src/modules/: Specialized functional blocks.
  - security/: Encryption logic and access control.
  - physics/: Ranking algorithms and document gravity.
  - configuration/: System-wide settings and resolver logic.
- src/shared/: Common utilities, error types, and database migration runner.

## /cadmus-web (Frontend & Native Desktop)
A unified interface built with React and integrated with Tauri.
- src/kernel/: Core UI infrastructure (i18n, Theme Store, Data Service Provider).
- src/features/: Domain-specific UI components (Editor, Dashboard, Vault).
- src/design-system/: Reusable UI primitives and design tokens.
- src-tauri/: Rust configuration for the native desktop layer, including system permissions and local SQLite integration.

## /docs (Technical Documentation)
- architecture.md: Detailed data flow and synchronization patterns.
- ontology.md: Definition of the document classes and knowledge structure.
- database_schema.md: SQL definitions and relationship mappings.
- mental_model.md: Conceptual framework for the system's design.

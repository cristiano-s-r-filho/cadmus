# Cadmus

Sovereign Knowledge Engine | Local-First Architecture | High-Performance Collaboration

Cadmus is a professional-grade knowledge management system designed for technical operators who require data sovereignty, zero-latency collaboration, and local-first performance. The system is built using a modular monolith approach with a Rust backend and a React-based frontend.

## Key Technical Features

- Tri-State Synchronization: Real-time collaboration powered by Yjs (CRDTs) with atomic persistence to SQL databases.
- Sovereign Security: Implementation of Client-Side Field Encryption (CSFE) and Paseto-based identity management to ensure data remains private.
- Hybrid Interface: A unified codebase providing a responsive Web Application and a native Desktop Experience via Tauri v2.
- Kinetic Intelligence: Integrated physics-based document ranking and local AI-driven search capabilities using ONNX Runtime.

## Technical Stack

- Backend: Rust, Axum, SQLx, PostgreSQL (Cloud/Server), SQLite (Local Desktop).
- Frontend: React 18, TypeScript, Tailwind CSS, Radix UI.
- Collaboration: Yjs, WebSockets for state propagation.
- Desktop Layer: Tauri v2 for native system integration.
- Intelligence: ONNX Runtime Web, Transformers.js for client-side processing.

## Project Structure

- /cadmus-api: Axum server handling routing, authentication, and WebSocket synchronization.
- /cadmus-kernel: The core business logic, including domain models, infrastructure abstraction, and shared utilities.
- /cadmus-web: React frontend and Tauri desktop configuration.
- /docs: Comprehensive system documentation regarding architecture, ontology, and schema.

## Environment Configuration

The system uses standard environment variables for configuration. A template is provided in the root directory:

1. Copy .env.example to .env
2. Configure the DATABASE_URL and PASETO_SECRET.
3. Install dependencies for the backend using 'cargo build' and for the frontend using 'npm install' within the cadmus-web directory.

## Operational Procedures

### Starting the API Server
cd cadmus-api
cargo run

### Starting the Web Interface
cd cadmus-web
npm run dev

### Starting the Desktop Application
cd cadmus-web
npm run tauri dev

## Documentation Index

Detailed technical documentation is available in the /docs directory:
- Architecture and Data Flow: ./docs/architecture.md
- Knowledge Ontology: ./docs/ontology.md
- Database Schema: ./docs/database_schema.md
- Mental Model: ./docs/mental_model.md

---
Cadmus: Escape the Static. Own your Stream.

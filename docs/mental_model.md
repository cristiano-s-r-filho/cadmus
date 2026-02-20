# 🗺️ Cadmus OS: Project Mental Model (LLM Optimized)

## 1. Core Logic & Data flow
The system operates on a **Tri-State Synchronization Model**:
1. **Persistent State (DB):** Authoritative long-term storage (Postgres/SQLite).
2. **Distributed State (Yjs):** Real-time conflict-free replicated data types (CRDT).
3. **UI State (React):** Ephemeral state for user interaction.

### Reactive Protocol:
- **Outbound:** UI Interaction -> Atomic REST API Call -> DB Merge -> Success Ack -> Local Yjs Update.
- **Inbound:** Yjs Observer -> Partial React State Update -> Reactive Child Render.
- **Conflict Prevention:** `isFocused` ref blocks inbound sync during user input to prevent cursor jumps. `JSON.stringify` comparison prevents infinite update loops.

## 2. Service Responsibilities
### cadmus-api
- Gatekeeper for Auth, Billing, and Metadata Persistence.
- Routes are nested by domain: `/auth`, `/content`, `/stats`, `/billing`.
- Handles WebSocket upgrades for Yjs syncing.

### cadmus-kernel
- **Domain:** Traits for Repositories and Behavior rules.
- **Infrastructure:** SQL implementations. Postgres uses `COALESCE(properties, '{}'::jsonb)` for null-safe merges.
- **Modules:** 
  - `Content`: Manages `document_updates` (Yjs deltas & Signed Snapshots).
  - `Intelligence`: SQL-based aggregation for class logic.
  - `Security`: Client-side encryption keys and Audit logging.

### cadmus-web
- **Kernel/Data:** `HttpDataService` implements `IDataService`.
- **Kernel/Behavior:** `BehaviorRegistry` maps Class IDs to async executable commands.
- **Features/Editor:** Tiptap-based text editor with custom Reactive Widgets.
- **Features/Collections:** FortuneSheet for spreadsheets using specialized `/latest_snapshot` endpoint.

## 3. Database Schema Reference
- `documents`: Primary artifact store. Uses JSONB for `properties`.
- `document_updates`: Binary store for Yjs history.
- `classes`: Ontological definitions (ui_schema, behavior_rules).
- `audit_logs`: Verifiable chain of actions (SHA-256).

## 4. Key Security Rules
- **CSFE (Client-Side Field Encryption):** Fields marked `confidential: true` are encrypted in the browser before reaching the server.
- **Sovereign Recalculation:** Aggregations (like Ledger sums) are performed on the Client to allow decryption of values before summation.
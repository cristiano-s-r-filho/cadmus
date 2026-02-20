# 🏗️ Cadmus OS: Architecture & Data Flow

## 1. Project Architecture
The system follows a **Monolithic Modular** pattern in Rust and a **Domain-Driven Feature** pattern in React.

### Design Patterns:
- **Command-Query Separation (CQS):**
    - **Queries:** Handled via TanStack Query for caching and invalidation.
    - **Commands:** Atomic property updates via `POST /update_property`.
- **Observer Pattern:** `SmartHeader` and `SmartField` observe the `Y.Doc` map for real-time reactivity without state drilling.
- **Repository Pattern:** `IDataService` abstracts the storage source (Cloud REST vs. Local Tauri Bridge).

## 2. The Complete Data Flow (Tri-State Sync)
1. **User Action:** Input change in `SmartField`.
2. **Authority Lock:** `isFocused.current` blocks inbound sync to prevent cursor flicker.
3. **Rest Persistence:** `HttpDataService` sends an atomic patch to the database.
4. **SQL Atomic Merge:** Backend uses `COALESCE(properties, '{}'::jsonb) || patch` to ensure data integrity.
5. **CRDT Injection:** On HTTP success, the value is injected into the local `ydoc.properties`.
6. **Broadcast:** Yjs propagates the change to all other clients/observers.
7. **UI Refresh:** React state is updated from the Yjs observer, closing the loop.

## 3. Security Rules (CSFE)
- **Client-Side Field Encryption:** Fields marked `confidential` are encrypted using AES-256-GCM in the browser.
- **Sovereign Computation:** Any aggregation (Sum, Average) involving encrypted fields must be performed on the Client, where keys are present.

#set page(paper: "a4", margin: (x: 2cm, y: 2cm))
#set text(font: "Linux Libertine", size: 11pt)

= Cadmus System Architecture

=== Overview
Cadmus is a distributed system comprising a central synchronization server and multiple heterogeneous clients (TUI and Web).

=== Component Stack
- *Core*: Shared logic and `SyncMessage` protocol using `serde` and `automerge`.
- *Server*: Axum-based WebSocket and REST API. Uses `SeaORM` for PostgreSQL persistence.
- *TUI*: `Ratatui` and `Crossterm` for terminal rendering.
- *Web*: `Yew` (WASM) for browser-based editing.

=== Data Model
Cadmus treats documents as Automerge binary blobs. 
- *PostgreSQL*: Stores document metadata and the full compressed binary state.
- *Redis*: (Planned) For scaling WebSockets across multiple server nodes.

=== Security
- *JWT*: Used for both REST and WebSocket authentication.
- *Argon2*: Industry-standard password hashing.

=== Synchronization Flow
1. Client joins a "Room" via WebSocket with a JWT.
2. Server loads the latest state from DB and sends a `Sync` message.
3. Local edits generate `Op` messages sent to the server.
4. Server applies the operation to its local copy, saves to DB, and broadcasts to all other participants.

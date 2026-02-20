#set page(paper: "a4", margin: (x: 2cm, y: 2cm))
#set text(font: "Linux Libertine", size: 11pt)

= Cadmus User Manual
== Production-Grade Collaborative Editor

=== Introduction
Cadmus is a real-time collaborative document editor designed for both terminal power users and web-based teams. Built entirely in Rust, it leverages CRDT technology (Automerge) to ensure conflict-free editing across different clients.

=== Getting Started
==== TUI Client
To start the terminal interface:
```bash
cargo run -p cadmus-tui
```
1. *Login*: Enter your username. The password defaults to "password" for the prototype.
2. *Dashboard*: Use #strong[Up/Down] arrows to select a document and #strong[Enter] to open it. Press #strong['n'] to create a new document.
3. *Editor*: Type naturally. Your changes are synced in real-time. Use #strong[Esc] to return to the list.

==== Web Client
To serve the web interface (requires Trunk):
```bash
cd cadmus-web
trunk serve
```
Navigate to `http://localhost:8080`.

=== Features
- *Real-time Sync*: Changes from TUI appear instantly on Web and vice versa.
- *Presence*: See a list of online users in the sidebar.
- *Persistence*: All operations are saved to a PostgreSQL database.
- *Conflict Resolution*: Powered by Automerge CRDTs.

=== Troubleshooting
- Ensure Docker is running (`docker-compose up -d`).
- Check that port 5435 is available for PostgreSQL.

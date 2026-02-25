# Cadmus Sovereign Engine Deployment Guide

This document outlines the deployment strategy for the Cadmus application, encompassing both the Rust-based API backend and the React/Vite frontend.

---

## 1. Backend Deployment: Render (Rust + PostgreSQL)

The Cadmus API is deployed as a Web Service on [Render](https://render.com), leveraging its robust support for Rust applications and integration with external PostgreSQL databases (Supabase).

### Technologies Used:
- **Runtime:** Rust (Axum, SQLx)
- **Database:** PostgreSQL (Supabase)
- **Containerization:** Docker

### Key Configurations and Decisions:

#### a. `cadmus-api/Dockerfile`
- Uses `rust:1.91.0-bullseye` as the base image to ensure compatibility with Rust 2024 edition.
- Installs necessary system dependencies (`pkg-config`, `libssl-dev`, `build-essential`, `libpq-dev`).
- Implements a multi-stage build for optimized image size and build speed.
- **Problem Resolution:** Initially, GDK build errors were resolved by isolating `cadmus-web/src-tauri` using `.dockerignore` and `sed` commands within the Dockerfile to prevent unwanted compilation.

#### b. Render Service Settings
- **Service Type:** Web Service
- **Root Directory:** `/`
- **DockerfilePath:** `cadmus-api/Dockerfile` (specifies the Dockerfile for the API service).
- **Build Command:** (Handled by Dockerfile)
- **Start Command:** `cadmus-api` (the compiled Rust binary)
- **Health Check Path:** `/health` (configured in `cadmus-api/src/main.rs`)

#### c. Environment Variables on Render
- **`DATABASE_URL`:** Crucial for connecting to the PostgreSQL database. **Must use the Supabase Connection Pooler (port 6543) for IPv4 compatibility.** Example: `postgresql://user:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
    - **Problem Resolution:** Initial `Network is unreachable (os error 101)` errors were traced to IPv6 incompatibility with Supabase's direct port. The connection pooler provides an IPv4-compatible endpoint.
- **`PASETO_SECRET`:** A strong, randomly generated key (32+ characters) for PASETO token encryption. **CRITICAL FOR SECURITY.**
- **`RUST_BACKTRACE`:** `1` (for detailed error stack traces in logs during development/debugging). Remove in production if not needed.
- **`RUST_LOG`:** `info,sqlx=info,cadmus_api=debug,cadmus_kernel=debug` (or similar, for controlling logging verbosity). `info` is standard for production.

#### d. Database Migrations (`cadmus-kernel/migrations`)
- **Management:** `sqlx-cli` is used for managing database migrations.
- **Execution:** Migrations are automatically run on application startup via `run_migrations(&db.pool).await;` in `cadmus-api/src/main.rs`.
- **Key Migrations & Resolutions:**
    - `20260116_init.sql`: Added `CREATE EXTENSION IF NOT EXISTS vector;` for `pgvector` support.
    - `20260219202556_extinguish_legacy_classes.sql`: BOM removed to prevent `sqlx-cli` parsing errors.
    - `20260225123000_add_required_tier_to_classes.sql`: **Crucial fix** for a `500 Internal Server Error`. The `required_tier` column was missing from the `classes` table in the database, causing SQL queries to fail. This migration adds `required_tier TEXT NULL`.

---

## 2. Frontend Deployment: Cloudflare Pages (React/Vite)

The Cadmus frontend is deployed as a Static Site on [Cloudflare Pages](https://pages.cloudflare.com), leveraging its global CDN and integrated serverless functions (Pages Functions).

### Technologies Used:
- **Framework:** React, Vite
- **Language:** TypeScript
- **State Management:** Zustand, React Query
- **Collaboration:** Yjs, Tiptap v2
- **AI/ML (Client-side):** `@xenova/transformers`, `onnxruntime-web`
- **Visualization:** D3.js, Mermaid.js

### Key Configurations and Decisions:

#### a. Cloudflare Pages Project Settings
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Functions Directory:** `functions` (Cloudflare Pages auto-detects this in the root of the build output).

#### b. `cadmus-web/package.json`
- **Dependency Management:** Strict pinning of Tiptap v2 versions (`2.27.2` for most, `2.26.2` for `collaboration-cursor`, `2.0.0` for `y-tiptap`, `0.8.4` for `tiptap-markdown`) was crucial to resolve `ERESOLVE` conflicts during `npm clean-install`.

#### c. `cadmus-web/vite.config.ts`
- **Node.js Polyfills:** `vite-plugin-node-polyfills` is used to provide browser polyfills for Node.js built-in modules (`buffer`, `process`, `util`) required by certain dependencies.
- **WASM/Top-Level Await:** `vite-plugin-wasm` and `vite-plugin-top-level-await` enable advanced features.
- **`global` Definition:** `define: { 'global': 'globalThis' }` ensures compatibility with libraries expecting a global `global` object.
- **Dependency Optimization (`optimizeDeps`):**
    - `exclude`: `@automerge/automerge-wasm`, `@xenova/transformers`. `y-protocols` was initially excluded, then included with `commonjsOptions`.
    - `include`: `yjs`, `lib0`, `mermaid`, `y-protocols`, `d3`. These are explicitly included or managed by `commonjsOptions` for Vite's pre-bundling.
- **CommonJS Transformation:** `commonjsOptions.transformMixedEsModules: true` and `include: [/node_modules/, 'y-protocols']` explicitly guide Rollup on handling mixed CommonJS/ESM modules, specifically addressing `y-protocols` resolution.
- **Externalization (`rollupOptions.external`):**
    - `onnxruntime-web`: Externalized and loaded via CDN in `index.html` to reduce bundle size and memory usage during build.
    - `d3`: **Crucial fix** for `TypeError: Cannot set properties of undefined (setting 'prototype')`. D3 was externalized and loaded via CDN in `index.html` to bypass bundling issues with its AMD/UMD wrappers.

#### d. `cadmus-web/index.html`
- **CDN Imports:** `onnxruntime-web` and `d3.js` are loaded via `<script>` tags from CDNs to prevent bundling conflicts and reduce main bundle size.
- **Error Boundary:** `window.onerror` was used for debug, to be removed in production builds.

#### e. `cadmus-web/public/_redirects`
- **SPA Fallback:** Contains `/* /index.html` to ensure all non-file paths are routed to the main `index.html` for client-side routing.
    - **Problem Resolution:** Previous `200` status caused an infinite loop warning. Removed `200` to simplify.

#### f. Cloudflare Pages Functions (`cadmus-web/functions/api/[[path]].js`)
- **Purpose:** Acts as an API proxy for all requests to `/api/*` from the frontend, forwarding them to the Render backend. This was implemented to bypass Cloudflare Pages' `_redirects` limitations for external API proxies.
- **Routing:** Uses the `functions/api/[[path]].js` filename convention for **automatic optional catch-all routing** by Cloudflare Pages. This pattern maps all requests to `/api` and its subpaths to this single function.
    - **Problem Resolution:** Initial attempts with `_redirects` proxy rules and other dynamic filename patterns (e.g., `[...path].js`, `[...segments].js`) failed due to Cloudflare Pages' strict routing and parameter naming requirements. `[[path]].js` was found to be the reliable pattern for auto-discovery.
- **Logic:** The `onRequest` function extracts the path from `request.url` and reconstructs the backend URL (e.g., `https://cadmus-kndb.onrender.com/api/...`), preserving original request details.

# Cadmus Frontend Architecture: Key Components and Design Decisions

This document outlines the architectural design and key component integrations of the Cadmus frontend, focusing on choices that enable its collaborative, performant, and intelligent features.

---

## 1. Core Framework and Ecosystem

- **Framework:** React (with TypeScript)
- **Build Tool:** Vite
- **State Management:** Zustand (for global state), React Query (for server-state management/caching)

---

## 2. Collaborative Editing (Tiptap & Yjs)

The collaborative editing experience is a cornerstone of Cadmus, powered by the integration of Tiptap and Yjs.

- **Tiptap v2:**
    - Serves as the rich text editor framework, built on ProseMirror.
    - **Key Decision:** Pinning to **Tiptap v2 (specifically `2.27.2` for core packages)** and compatible extensions was crucial. Earlier attempts with Tiptap v3 led to extensive dependency resolution issues (`ERESOLVE` errors) due to breaking changes and inconsistent versioning across its ecosystem.
    - **Custom Extensions:** Leverages Tiptap's extensibility for features like collaborative cursors, code blocks, tables, and custom nodes.
- **Yjs:**
    - The CRDT (Conflict-free Replicated Data Type) library that enables real-time, offline-first collaboration.
    - **Integration:** Integrated with Tiptap via `@tiptap/y-tiptap` (pinned to `2.0.0` for Tiptap v2 compatibility) and `y-websocket` for real-time synchronization via WebSockets.

---

## 3. Performance and Bundling Optimizations

Given the inclusion of several heavy client-side libraries (AI/ML, visualization), significant effort has been made to optimize frontend performance and manage bundle size.

### a. Vite Configuration (`cadmus-web/vite.config.ts`)

- **Node.js Polyfills:** `vite-plugin-node-polyfills` is used to provide browser-compatible implementations for Node.js built-in modules (`buffer`, `process`, `util`). This is essential for libraries that might have Node.js dependencies but run in the browser.
- **WASM & Top-Level Await:** `vite-plugin-wasm` and `vite-plugin-top-level-await` are configured to support WebAssembly modules and top-level await syntax, critical for efficient client-side AI/ML inference.
- **`global` Definition:** `define: { 'global': 'globalThis' }` ensures compatibility with legacy libraries that expect a global `global` object to exist in the browser context.
- **Dependency Optimization (`optimizeDeps`):**
    - **Explicit `include` and `exclude`:** Carefully curated lists of dependencies are managed by Vite's `optimizeDeps` to control pre-bundling.
    - **`y-protocols` Resolution:** Specific configuration in `commonjsOptions.include` was required to resolve persistent issues with `y-protocols`'s CommonJS/ESM interop in Vite's bundling process.
- **CommonJS Transformation:** `commonjsOptions.transformMixedEsModules: true` explicitly guides Rollup on handling modules that mix CommonJS and ES Modules syntax, resolving many import/export errors.
- **Externalization (`rollupOptions.external`):**
    - **`onnxruntime-web`:** Externalized from the main bundle and loaded via CDN. This significantly reduces the main bundle size and improves build times, as `onnxruntime-web` is a very large dependency.
    - **`d3` (D3.js libraries):** **Crucial Fix:** Identified as the source of a `TypeError: Cannot set properties of undefined (setting 'prototype')` during runtime. D3.js (and its sub-modules) were externalized from the main bundle and loaded via a CDN script in `index.html`. This completely bypasses Vite's bundling process for D3, resolving conflicts with its AMD/UMD wrappers.

### b. Lazy Loading Strategies

- **`React.lazy` and `Suspense`:** Employed for dynamically importing heavy React components like `CollaborativeEditor` and `MermaidWidget`. This ensures these components are only loaded when needed, improving initial page load times and reducing the main bundle's initial parse/execution cost.

---

## 4. Client-side Intelligence (AI/ML)

- **`@xenova/transformers`:** Utilized for client-side AI/ML inference, specifically for text embeddings via pre-trained BERT models (converted to ONNX format).
- **`onnxruntime-web`:** The WebAssembly runtime for executing ONNX models directly in the browser. Externalized via CDN for performance.
- **Web Workers:** AI inference tasks are offloaded to Web Workers (`synapse.worker.ts`) to prevent blocking the main UI thread, maintaining responsiveness.

---

## 5. Deployment Considerations (Cloudflare Pages)

- **API Proxying:** Due to Cloudflare Pages' limitations with `_redirects` for external API proxies, a **Cloudflare Pages Function** (`functions/api/[[path]].js`) was implemented. This serverless function acts as a transparent proxy, forwarding all `/api/*` requests from the frontend to the Render-hosted Rust backend.
    - **Key Routing:** The `[[path]].js` filename convention is used for automatic optional catch-all routing, proving more robust than `_routes.json` or other dynamic filename patterns.

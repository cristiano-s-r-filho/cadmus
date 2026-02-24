import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import path from 'path';

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util'],
      globals: {
        Buffer: true,
        process: true,
      },
    }),
  ],
  define: {
    'global': 'globalThis',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3000',
        changeOrigin: true,
      },
      '/api/v1/content/ws': {
        target: 'http://127.0.0.1:3000',
        ws: true,
      }
    }
  },
  worker: {
    format: 'es',
    plugins: () => [wasm(), topLevelAwait()]
  },
  // Removed resolve.alias for y-protocols
  optimizeDeps: {
    // Exclude @automerge/automerge-wasm and @xenova/transformers
    exclude: ['@automerge/automerge-wasm', '@xenova/transformers'], 
    // Explicitly include yjs, y-protocols, lib0, mermaid, d3
    include: ['yjs', 'y-protocols', 'lib0', 'mermaid', 'd3'] 
  },
  build: {
    target: 'es2020',
    minify: true, // Re-enable minification for production
    sourcemap: false, // Disable sourcemaps for production
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/, 'y-protocols'] // Explicitly include y-protocols for CommonJS transformation
    },
    rollupOptions: {
      external: ['onnxruntime-web'],
      output: {
        globals: {
          'onnxruntime-web': 'ort'
        }
      }
    }
  }
})

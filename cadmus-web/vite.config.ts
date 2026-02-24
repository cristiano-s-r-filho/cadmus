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
  resolve: {
    alias: {
      'd3': 'https://d3js.org/d3.v7.min.js', // Alias d3 to its CDN
    },
  },
  optimizeDeps: {
    exclude: ['@automerge/automerge-wasm', '@xenova/transformers', 'y-protocols', 'd3'], // Exclude d3
    include: ['yjs', 'lib0', 'mermaid'] // Keep core yjs deps and mermaid
  },
  build: {
    target: 'es2020',
    minify: false, // DISABLE MINIFICATION FOR DEBUGGING
    sourcemap: true, // ENABLE SOURCEMAPS FOR DEBUGGING
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/node_modules/, 'y-protocols'] 
    },
    rollupOptions: {
      external: ['onnxruntime-web', 'd3'], // Externalize d3
      output: {
        globals: {
          'onnxruntime-web': 'ort',
          'd3': 'd3' // Global variable for d3
        }
      }
    }
  }
})

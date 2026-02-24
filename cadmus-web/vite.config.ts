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
      // Explicitly alias y-protocols to its CommonJS entry to resolve "Missing ." specifier error
      'y-protocols': path.resolve(__dirname, 'node_modules/y-protocols/dist/index.cjs'),
    },
  },
  optimizeDeps: {
    exclude: ['@automerge/automerge-wasm', '@xenova/transformers', 'y-protocols'],
    include: ['yjs', 'lib0', 'mermaid', 'd3']
  },
  build: {
    target: 'es2020',
    minify: true, // Re-enable minification for production
    sourcemap: false, // Disable sourcemaps for production
    commonjsOptions: {
      transformMixedEsModules: true
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

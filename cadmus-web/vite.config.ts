import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    react(),
    nodePolyfills({
      include: ['buffer', 'process', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  define: {
    // Satisfy libraries that expect 'global' to be present
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
  optimizeDeps: {
    exclude: ['@automerge/automerge-wasm', '@xenova/transformers'],
    include: ['yjs', 'y-protocols', 'lib0', 'mermaid', 'd3']
  },
  build: {
    target: 'es2020', // More stable target for inheritance patterns
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

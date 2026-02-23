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
    'global': 'globalThis',
  },
  build: {
    target: 'esnext',
    minify: false, // DISABLE MINIFICATION TO GET READABLE STACK TRACE
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  worker: {
    format: 'es',
    plugins: () => [wasm(), topLevelAwait()]
  },
  optimizeDeps: {
    exclude: ['@automerge/automerge-wasm', '@xenova/transformers'],
    include: ['yjs', 'y-protocols', 'lib0', 'mermaid', 'd3']
  }
})

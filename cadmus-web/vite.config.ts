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
    // nodePolyfills({
    //   include: ['buffer', 'process', 'util'],
    //   globals: {
    //     Buffer: true,
    //     global: true,
    //     process: true,
    //   },
    // }),
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
  optimizeDeps: {
    // Exclude these from optimization to prevent double-bundling issues
    exclude: ['@automerge/automerge-wasm', '@xenova/transformers']
  },
  build: {
    target: 'esnext',
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

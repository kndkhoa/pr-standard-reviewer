import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// The dashboard host provides React, ReactDOM, the App SDK, lucide-react and
// react-query at runtime through its import map. They must be marked external
// so the app shares the host's exact module instances and ships a small bundle.
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      formats: ['es'],
      fileName: () => 'index.mjs',
    },
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        '@kirocrew/app-sdk',
        '@kirocrew/app-sdk/ui',
        'lucide-react',
        '@tanstack/react-query',
      ],
    },
  },
})

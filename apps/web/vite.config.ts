import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Codespaces/other tunnels serve the dev server through a forwarded
    // hostname (e.g. *.app.github.dev), which Vite's Host-header check
    // rejects by default.
    allowedHosts: true,
  },
})

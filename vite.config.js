import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config — local dev only, no backend, no external services.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// http://localhost:5100 is the API
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5100'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
})

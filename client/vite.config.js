import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // API-Endpunkt vom Backend (Port ggf. anpassen)
      '/words': 'http://localhost:3001'
    }
  }
})

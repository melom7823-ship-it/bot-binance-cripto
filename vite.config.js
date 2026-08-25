import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    },
    watch: {
      ignored: ['**/dist/**', '**/dist - copia/**', '**/*.jpeg', '**/*.jpg', '**/*.png']
    }
  },
  preview: {
    allowedHosts: true,
    host: true
  }
})

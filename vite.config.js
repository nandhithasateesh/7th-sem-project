import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Enable HTTPS with self-signed certificate (for microphone access on IP)
    https: process.env.VITE_HTTPS === 'true' ? {
      key: fs.existsSync('./certs/key.pem') ? fs.readFileSync('./certs/key.pem') : undefined,
      cert: fs.existsSync('./certs/cert.pem') ? fs.readFileSync('./certs/cert.pem') : undefined,
    } : false,
    // Proxy API calls to backend server
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})

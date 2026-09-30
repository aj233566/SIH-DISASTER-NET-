import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: false,
    https: false,
    proxy: {
      '/sachet': {
        target: 'https://sachet.ndma.gov.in',
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/sachet/, '')
      }
    }
  }
});
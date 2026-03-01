import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // ⭐ GitHub Pages ke liye
 base: "/git-github.com-ADARSh86Verma-adarshvarma.github.io/",

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost/school-erp/backend',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})

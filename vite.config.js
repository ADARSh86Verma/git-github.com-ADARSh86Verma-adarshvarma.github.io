import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/git-github.com-ADARSh86Verma-adarshvarma.github.io/',
  build: {
    outDir: 'dist',
  }
})

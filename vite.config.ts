import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: '.', // Bolt parte desde la raíz
  build: {
    outDir: 'dist',
  }
})

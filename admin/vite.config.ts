import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/administrador/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: '../public/administrador',
    emptyOutDir: true,
  },
})

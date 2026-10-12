import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Собранный мини-апп ложится в webapp/: его раздают и FastAPI (main.py), и GitHub Pages.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: '../webapp', emptyOutDir: true },
})

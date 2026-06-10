import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dynamic configuration base logic
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/Library-Management-System/' : '/',
})
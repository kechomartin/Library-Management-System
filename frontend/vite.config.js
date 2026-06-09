import { defineConfig } from 'vite'
import react from '@vitejs/react-plugin'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  base: '/Library-Management-System/', 
})
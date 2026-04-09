import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // 重要：這裡必須對應您的 GitHub 倉庫名稱，網頁路徑才不會錯
  base: '/Dietitian-workshop/', 
})

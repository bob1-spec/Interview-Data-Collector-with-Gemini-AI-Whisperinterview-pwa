import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/Interview-Data-Collector-with-Gemini-AI-Whisperinterview-pwa/',
  plugins: [react()],
})

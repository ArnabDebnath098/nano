import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import preloadManifest from './scripts/preloadManifest.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), preloadManifest()],
})

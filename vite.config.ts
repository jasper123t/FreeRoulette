import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/FreeRoulette/', // Github Pages
  server: {
    watch: {
      usePolling: true, // WSL HMR workaround
    },
  },
})

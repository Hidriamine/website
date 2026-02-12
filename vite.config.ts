import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Base URL pour le déploiement sur IONOS Hébergement Web
  base: '/',
  build: {
    outDir: 'dist',
    // Générer les assets avec des noms hashés pour le cache-busting
    assetsDir: 'assets',
  },
})
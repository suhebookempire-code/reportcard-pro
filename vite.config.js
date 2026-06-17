import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

let pwaPlugin = [];
try {
  const { VitePWA } = require('vite-plugin-pwa');
  pwaPlugin = [VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['suebem-icon.svg'],
    manifest: false,
    workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] }
  })];
} catch(e) {}

export default defineConfig({
  plugins: [react(), ...pwaPlugin],
})

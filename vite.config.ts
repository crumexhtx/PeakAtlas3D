import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

function isMapLibreOutput(file: string): boolean {
  return /maplibre/i.test(file) || /AtlasMap/i.test(file)
}

/** Keep the 1MB MapLibre globe off the homepage `<head>` (JS preload + CSS). */
function stripMapLibreFromIndexHtml(): Plugin {
  return {
    name: 'strip-maplibre-from-index-html',
    transformIndexHtml(html) {
      return html
        .replace(/<link rel="modulepreload"[^>]*maplibre[^>]*>\s*/gi, '')
        .replace(/<link rel="stylesheet"[^>]*maplibre[^>]*>\s*/gi, '')
        .replace(/<link rel="modulepreload"[^>]*AtlasMap[^>]*>\s*/gi, '')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stripMapLibreFromIndexHtml()],
  build: {
    modulePreload: {
      resolveDependencies(_filename, deps) {
        return deps.filter((dep) => !isMapLibreOutput(dep))
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules/maplibre-gl') ||
            id.includes('node_modules/@vis.gl/react-maplibre') ||
            id.includes('node_modules/react-map-gl')
          ) {
            return 'maplibre'
          }
        },
      },
    },
  },
})

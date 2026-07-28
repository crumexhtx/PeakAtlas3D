import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

const rootEl = document.getElementById('root')
if (!rootEl) {
  throw new Error('PeakAtlas3D: #root missing')
}

// Prerender injects crawlable HTML into #root for Search Console / no-JS.
// Clear it before React mounts so users never see a double document.
rootEl.replaceChildren()

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { UnitsProvider } from './context/UnitsContext'
import { DebugTapOverlay } from './components/DebugTapOverlay'
import './styles/app.css'

// TEMP: ?debug=1 shows an on-page log of what element every tap actually
// hits — diagnosing a mobile tap bug without remote devtools. Remove once
// that's found (tracked alongside the peak details-sheet tap investigation).
const DEBUG_TAPS =
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get('debug') === '1'

const AtlasLayout = lazy(() =>
  import('./pages/AtlasLayout').then((m) => ({ default: m.AtlasLayout })),
)
const HomePage = lazy(() =>
  import('./pages/HomePage').then((m) => ({ default: m.HomePage })),
)
const PeakPage = lazy(() =>
  import('./pages/PeakPage').then((m) => ({ default: m.PeakPage })),
)
const ContentLayout = lazy(() =>
  import('./pages/ContentLayout').then((m) => ({ default: m.ContentLayout })),
)
const AboutPage = lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })),
)
const ReleasesPage = lazy(() =>
  import('./pages/ReleasesPage').then((m) => ({ default: m.ReleasesPage })),
)
const ContactPage = lazy(() =>
  import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })),
)

function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite">
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <UnitsProvider>
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<AtlasLayout />}>
              <Route index element={<HomePage />} />
              <Route path="peak/:peakId" element={<PeakPage />} />
            </Route>
            <Route element={<ContentLayout />}>
              <Route path="about" element={<AboutPage />} />
              <Route path="releases" element={<ReleasesPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Analytics />
      {DEBUG_TAPS && <DebugTapOverlay />}
    </UnitsProvider>
  )
}

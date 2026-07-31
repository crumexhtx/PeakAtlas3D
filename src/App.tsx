import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { GoogleAnalytics } from './components/GoogleAnalytics'
import { PlausibleAnalytics } from './components/PlausibleAnalytics'
import { UnitsProvider } from './context/UnitsContext'
import './styles/app.css'

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
const PeaksPage = lazy(() =>
  import('./pages/PeaksPage').then((m) => ({ default: m.PeaksPage })),
)
const CountryPage = lazy(() =>
  import('./pages/CountryPage').then((m) => ({ default: m.CountryPage })),
)
const CompareIndexPage = lazy(() =>
  import('./pages/CompareIndexPage').then((m) => ({
    default: m.CompareIndexPage,
  })),
)
const ComparePage = lazy(() =>
  import('./pages/ComparePage').then((m) => ({ default: m.ComparePage })),
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
        <GoogleAnalytics />
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route element={<AtlasLayout />}>
              <Route index element={<HomePage />} />
              <Route path="peak/:peakId" element={<PeakPage />} />
            </Route>
            <Route element={<ContentLayout />}>
              <Route path="about" element={<AboutPage />} />
              <Route path="peaks" element={<PeaksPage />} />
              <Route path="compare" element={<CompareIndexPage />} />
              <Route path="compare/:compareSlug" element={<ComparePage />} />
              <Route path="countries/:countrySlug" element={<CountryPage />} />
              <Route path="releases" element={<ReleasesPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Analytics />
      <PlausibleAnalytics />
    </UnitsProvider>
  )
}

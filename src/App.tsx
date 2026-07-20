import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { UnitsProvider } from './context/UnitsContext'
import { AtlasLayout } from './pages/AtlasLayout'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { ContentLayout } from './pages/ContentLayout'
import { HomePage } from './pages/HomePage'
import { PeakPage } from './pages/PeakPage'
import { ReleasesPage } from './pages/ReleasesPage'
import './styles/app.css'

export default function App() {
  return (
    <UnitsProvider>
      <BrowserRouter>
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
      </BrowserRouter>
      <Analytics />
    </UnitsProvider>
  )
}

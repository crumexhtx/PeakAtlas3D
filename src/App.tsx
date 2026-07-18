import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { UnitsProvider } from './context/UnitsContext'
import { AtlasLayout } from './pages/AtlasLayout'
import { HomePage } from './pages/HomePage'
import { PeakPage } from './pages/PeakPage'
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </UnitsProvider>
  )
}

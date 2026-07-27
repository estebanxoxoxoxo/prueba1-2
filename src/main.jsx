import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdPlacas from './components/AdPlacas.jsx'
import { LanguageProvider } from './i18n/index.jsx'
import { TrackingProvider } from '../tracking-suite'

// Placas animadas para Facebook Ads:
//   /placas · /placas/916 · /ads → 9:16
//   /placas/11                   → 1:1
const path =
  typeof window !== 'undefined' ? window.location.pathname.toLowerCase().replace(/\/+$/, '') : ''
let placasAspect = null
if (path === '/placas/11') placasAspect = '11'
else if (path === '/placas' || path === '/placas/916' || path === '/ads') placasAspect = '916'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      {placasAspect ? (
        <AdPlacas aspect={placasAspect} />
      ) : (
        // TrackingProvider solo en la landing: arranca la sesión y la flushea a la
        // DB al cerrar. Las placas de ads no generan sesión.
        <TrackingProvider>
          <App />
        </TrackingProvider>
      )}
    </LanguageProvider>
  </StrictMode>,
)

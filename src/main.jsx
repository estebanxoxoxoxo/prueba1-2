import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdPlacas from './components/AdPlacas.jsx'
import { LanguageProvider } from './i18n/index.jsx'

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
      {placasAspect ? <AdPlacas aspect={placasAspect} /> : <App />}
    </LanguageProvider>
  </StrictMode>,
)

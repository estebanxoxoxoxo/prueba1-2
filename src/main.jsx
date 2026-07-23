import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdPlacas from './components/AdPlacas.jsx'
import { LanguageProvider } from './i18n/index.jsx'

// Ruta /placas (o /ads): secuencia de placas animadas para Facebook Ads.
const path =
  typeof window !== 'undefined' ? window.location.pathname.toLowerCase().replace(/\/+$/, '') : ''
const isPlacas = path === '/placas' || path === '/ads'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      {isPlacas ? <AdPlacas /> : <App />}
    </LanguageProvider>
  </StrictMode>,
)

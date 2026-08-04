import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Pipeline de analytics: en dev/preview este server hace de dataplane
// same-origin — sirve /sourceConfig (el mismo JSON estático que Vercel sirve
// en prod) y proxya /v1/batch al ingestador (Vector en EC2). En prod el
// equivalente son los rewrites de vercel.json.
const INGEST = 'http://44.207.109.162:8080'

const sourceConfig = readFileSync(
  fileURLToPath(new URL('./public/sourceConfig.json', import.meta.url)),
  'utf8'
)

const serveSourceConfig = (server) => {
  server.middlewares.use((req, res, next) => {
    const path = (req.url || '').split('?')[0].replace(/\/+$/, '')
    if (path.endsWith('/sourceConfig')) {
      res.setHeader('Content-Type', 'application/json')
      res.end(sourceConfig)
      return
    }
    next()
  })
}

// Mock de /api/get-vercel-session-metadata para dev/preview: en prod es una función de
// Vercel que devuelve los headers x-vercel-ip-* (geo/IP) del edge.
const DEV_SESSION_METADATA = {
  supplier: 'vercel',
  ip: '127.0.0.1',
  country: 'DEV',
  region: 'DEV',
  city: 'localhost',
  timezone: 'America/Argentina/Buenos_Aires',
}

const serveSessionMetadata = (server) => {
  server.middlewares.use((req, res, next) => {
    const path = (req.url || '').split('?')[0]
    if (path === '/api/get-vercel-session-metadata') {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(DEV_SESSION_METADATA))
      return
    }
    // Mock de la CAPI para dev: en prod es api/send-server-event.ts (Meta Graph).
    if (path === '/api/send-server-event') {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ success: true, dev: true }))
      return
    }
    next()
  })
}

const analyticsDataplane = () => ({
  name: 'smarty-analytics-dataplane',
  configureServer: (server) => {
    serveSourceConfig(server)
    serveSessionMetadata(server)
  },
  configurePreviewServer: (server) => {
    serveSourceConfig(server)
    serveSessionMetadata(server)
  },
})

// Los singletons de events-suite (sources, gateway, FSMs) no sobreviven un
// hot-swap parcial: cualquier cambio dentro de la carpeta recarga la página.
const eventsSuiteFullReload = () => ({
  name: 'events-suite-full-reload',
  handleHotUpdate({ file, server }) {
    if (file.includes('/events-suite/')) {
      server.ws.send({ type: 'full-reload' })
      return []
    }
  },
})

const proxy = {
  '/v1/batch': { target: INGEST, changeOrigin: true },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), analyticsDataplane(), eventsSuiteFullReload()],
  server: { proxy },
  preview: { proxy },
})

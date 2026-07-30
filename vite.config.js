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

const analyticsDataplane = () => ({
  name: 'smarty-analytics-dataplane',
  configureServer: serveSourceConfig,
  configurePreviewServer: serveSourceConfig,
})

const proxy = {
  '/v1/batch': { target: INGEST, changeOrigin: true },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), analyticsDataplane()],
  server: { proxy },
  preview: { proxy },
})

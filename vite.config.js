
import { eventsSuiteVite } from './events-suite/host/vite.js'
import { ANALYTICS_WRITE_KEY } from './src/config.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // events-suite (submódulo): el cableado que necesita del host — dataplane
    // same-origin en dev/preview, sourceConfig.json al build, recarga completa
    // al editarla. El código vive en la suite; acá solo se enchufa.
    ...eventsSuiteVite({
      writeKey: ANALYTICS_WRITE_KEY,
      sourceName: 'smarty-landing',
      workspace: 'smarty',
    }),
  ],
})

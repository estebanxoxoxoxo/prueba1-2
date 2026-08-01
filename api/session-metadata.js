// Echo de la metadata de sesión que Vercel adjunta al request en el edge:
// geo/IP viajan como headers x-vercel-ip-* que el navegador no puede ver por
// sí mismo — este endpoint se los devuelve. Sin dependencias, sin estado.

const header = (req, name) => {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value || undefined;
};

const decoded = (value) => {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value); // Vercel manda p. ej. la ciudad URL-encoded
  } catch {
    return value;
  }
};

export default function handler(req, res) {
  const forwarded = header(req, 'x-forwarded-for');
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({
    ip: header(req, 'x-real-ip') || (forwarded ? forwarded.split(',')[0].trim() : undefined),
    country: header(req, 'x-vercel-ip-country'),
    region: decoded(header(req, 'x-vercel-ip-country-region')),
    city: decoded(header(req, 'x-vercel-ip-city')),
    postal_code: header(req, 'x-vercel-ip-postal-code'),
    latitude: header(req, 'x-vercel-ip-latitude'),
    longitude: header(req, 'x-vercel-ip-longitude'),
    timezone: header(req, 'x-vercel-ip-timezone'),
    deployment: {
      env: process.env.VERCEL_ENV,
      url: process.env.VERCEL_URL,
      commit: process.env.VERCEL_GIT_COMMIT_SHA,
      branch: process.env.VERCEL_GIT_COMMIT_REF,
    },
  });
}

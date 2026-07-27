// Extrae el contexto del request en un solo lugar (lo usan los dos handlers): ip,
// geo (headers que agrega Vercel), user-agent, idioma, referer, cookies de Meta
// (_fbp/_fbc) y el event_source_url.
export interface RequestContext {
  ip: string | null;
  userAgent: string | null;
  language: string | null;
  referer: string | null;
  eventSourceUrl: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  timezone: string | null;
  latitude: string | null;
  longitude: string | null;
  fbp: string | null;
  fbc: string | null;
}

export function readVercelMetadata(req: any): RequestContext {
  const h = req.headers || {};
  const city = h["x-vercel-ip-city"];
  return {
    ip: h["x-forwarded-for"] || req.socket?.remoteAddress || null,
    userAgent: h["user-agent"] || null,
    language: h["accept-language"] || null,
    referer: h.referer || null,
    // event_source_url: cliente → referer → armado desde el host (Meta lo exige).
    eventSourceUrl:
      req.body?.eventSourceUrl ||
      h.referer ||
      (h.host ? `https://${h.host}/` : null),
    country: h["x-vercel-ip-country"] || null,
    region: h["x-vercel-ip-country-region"] || null,
    city: city ? decodeURIComponent(String(city)) : null,
    timezone: h["x-vercel-ip-timezone"] || null,
    latitude: h["x-vercel-ip-latitude"] || null,
    longitude: h["x-vercel-ip-longitude"] || null,
    fbp: req.body?.fbp || req.cookies?._fbp || null,
    fbc: req.body?.fbc || req.cookies?._fbc || null,
  };
}

export const config = {
  runtime: "nodejs",
};

// Sirve la config web de Firebase (valores PÚBLICOS: van al navegador).
// Se leen de las env vars de Vercel para no hardcodearlas en el bundle.
export default function handler(_req: any, res: any) {
  res.setHeader("Cache-Control", "public, max-age=3600");
  return res.status(200).json({
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
  });
}

// Adaptador Vercel → lógica en tracking-suite. La suite es portable; este archivo
// solo declara el runtime y enchufa el handler.
import handleSession from "../tracking-suite/handleSession";

export const config = {
  runtime: "nodejs",
};

export default handleSession;

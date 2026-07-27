// Adaptador Vercel → lógica en tracking-suite. La suite es portable; este archivo
// solo declara el runtime y enchufa el handler.
import sendServerEvent from "../tracking-suite/sendServerEvent";

export const config = {
  runtime: "nodejs",
};

export default sendServerEvent;

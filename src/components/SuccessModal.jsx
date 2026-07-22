import { lazy, Suspense, useEffect, useState } from 'react';
import { REGISTERED_EVENT } from '../registerWithGoogle';

// Host liviano del modal de éxito: no importa `motion` (queda fuera de la
// carga inicial). Escucha REGISTERED_EVENT y recién ahí baja el chunk con el
// contenido animado. Una vez disparado, el body queda montado para que la
// animación de salida (cerrar) pueda reproducirse.
const SuccessModalBody = lazy(() => import('./SuccessModalBody'));

export default function SuccessModal() {
  const [triggered, setTriggered] = useState(false);
  const [open, setOpen] = useState(false);
  const [data, setData] = useState({ email: null, name: null });

  useEffect(() => {
    const onReg = (e) => {
      setData({ email: e.detail?.email || null, name: e.detail?.name || null });
      setTriggered(true);
      setOpen(true);
      // Warm-up del chunk por si el registro se completa muy rápido.
      import('./SuccessModalBody');
    };
    window.addEventListener(REGISTERED_EVENT, onReg);
    return () => window.removeEventListener(REGISTERED_EVENT, onReg);
  }, []);

  if (!triggered) return null;

  return (
    <Suspense fallback={null}>
      <SuccessModalBody open={open} data={data} onClose={() => setOpen(false)} />
    </Suspense>
  );
}

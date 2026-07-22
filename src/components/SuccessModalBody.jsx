import { useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { MailIcon, CheckIcon, XIcon } from './icons';
import { useT } from '../i18n/core';

// Contenido animado del modal de éxito. Se carga en un chunk aparte (lazy)
// desde SuccessModal, así el runtime de `motion` no pesa en la carga inicial
// de la landing —solo se baja cuando alguien completa el registro.
export default function SuccessModalBody({ open, data, onClose }) {
  const t = useT();
  const reduced = useReducedMotion();
  const okRef = useRef(null);

  // Confeti: burst radial de una sola vez (posiciones deterministas).
  const confetti = useMemo(() => {
    const colors = [
      '#6d28d9', '#14b8a6', '#f59e0b', '#f43f5e',
      '#16a34a', '#2f6bff', '#8b5cf6', '#0d9488',
    ];
    return Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2;
      const dist = 86 + (i % 3) * 30;
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        c: colors[i % colors.length],
        rot: (i % 2 ? 1 : -1) * (140 + i * 10),
        delay: (i % 5) * 0.025,
        circle: i % 3 === 0,
      };
    });
  }, []);

  // Bloquea el scroll del body y cierra con Escape mientras está abierto.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (ev) => {
      if (ev.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  // Foco al botón principal al abrir (accesibilidad).
  useEffect(() => {
    if (open) okRef.current?.focus();
  }, [open]);

  const first = data.name ? data.name.trim().split(/\s+/)[0] : '';
  const title = first
    ? `${t.success.titleNamedPre}${first}${t.success.titleNamedPost}`
    : t.success.titleAnon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="sm-overlay"
          onClick={onClose}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="sm-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sm-title"
            onClick={(ev) => ev.stopPropagation()}
            initial={reduced ? false : { opacity: 0, y: 22, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <button className="sm-close" onClick={onClose} aria-label="Cerrar">
              <XIcon />
            </button>

            <div className="sm-badge-wrap">
              {!reduced && (
                <div className="sm-confetti" aria-hidden="true">
                  {confetti.map((p, i) => (
                    <motion.i
                      // eslint-disable-next-line react/no-array-index-key
                      key={i}
                      style={{ background: p.c, borderRadius: p.circle ? '50%' : '2px' }}
                      initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
                      animate={{ x: p.x, y: p.y, scale: 1, rotate: p.rot, opacity: 0 }}
                      transition={{ duration: 0.9, delay: 0.05 + p.delay, ease: 'easeOut' }}
                    />
                  ))}
                </div>
              )}
              <span className="sm-ring" aria-hidden="true" />
              <span className="sm-ring sm-ring-2" aria-hidden="true" />
              <div className="sm-badge">
                <MailIcon />
              </div>
              <div className="sm-check" aria-hidden="true">
                <CheckIcon />
              </div>
            </div>

            <span className="sm-eyebrow">
              <CheckIcon /> {t.success.eyebrow}
            </span>
            <h3 id="sm-title" className="sm-title">{title}</h3>
            <p className="sm-text">{t.success.text}</p>

            <div className="sm-email">
              <MailIcon />
              <span>{data.email || t.success.emailFallback}</span>
            </div>

            <button ref={okRef} type="button" className="sm-btn" onClick={onClose}>
              {t.success.ok}
            </button>
            <p className="sm-note">{t.success.note}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

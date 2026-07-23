import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Owl from './Owl';

/* ============================================================
   Placas animadas para Facebook Ads (React + Motion).
   Una placa por línea del guion. Auto-play en loop, ritmo de
   lectura, estilo "stories". Ruta: /placas
   ============================================================ */

// Cada placa: segmentos de texto (m: true = palabra/frase destacada) + ms en
// pantalla. La última es la placa CTA.
const PLACAS = [
  {
    seg: [{ t: 'Tu hijo en internet ve lo que ' }, { t: 'el algoritmo', m: 1 }, { t: ' quiere que vea' }],
    ms: 3600,
  },
  { seg: [{ t: 'Y eso tiene ' }, { t: 'un precio', m: 1 }, { t: ' para vos' }], ms: 2900 },
  { seg: [{ t: 'La pregunta no es ' }, { t: 'si', m: 1 }, { t: ' lo vas a pagar' }], ms: 3000 },
  {
    seg: [{ t: 'La pregunta es si lo vas a hacer con ' }, { t: 'la integridad de tu hijo', m: 1 }],
    ms: 4200,
  },
  {
    seg: [
      { t: 'O con una solución que ' },
      { t: 'bloquea el algoritmo basura', m: 1 },
      { t: ' y te permite ' },
      { t: 'diseñar tu propio algoritmo', m: 1 },
    ],
    ms: 5000,
  },
  { seg: [{ t: 'Los dueños del algoritmo tienen ' }, { t: 'su propia agenda', m: 1 }], ms: 3200 },
  { seg: [{ t: 'Y no es una agenda que quieras para tu hijo' }], ms: 3300 },
  { seg: [{ t: 'Solo ' }, { t: 'vos', m: 1 }, { t: ' sabés lo que querés para tu hijo' }], ms: 3500 },
  { cta: true, ms: 5000 },
];

// Aplana los segmentos a palabras (para el stagger), conservando el destaque.
function toWords(seg) {
  const words = [];
  seg.forEach((s) => {
    s.t.split(' ').forEach((word) => {
      if (word) words.push({ text: word, mark: !!s.m });
    });
  });
  return words;
}

const EASE = [0.22, 1, 0.36, 1];

// Hook de QA: ?p=4 congela esa placa para screenshots.
function forcedIndex() {
  if (typeof window === 'undefined') return null;
  const v = new URLSearchParams(window.location.search).get('p');
  if (v == null) return null;
  const n = parseInt(v, 10);
  return Number.isInteger(n) ? Math.max(0, Math.min(PLACAS.length - 1, n)) : null;
}

export default function AdPlacas() {
  const reduced = useReducedMotion();
  const forced = forcedIndex();
  const still = forced != null; // QA: render sin animación de entrada
  const [i, setI] = useState(forced ?? 0);

  // Auto-avance en loop, respetando el ms de cada placa (salvo QA congelado).
  useEffect(() => {
    if (forced != null) return undefined;
    const id = setTimeout(() => setI((prev) => (prev + 1) % PLACAS.length), PLACAS[i].ms);
    return () => clearTimeout(id);
  }, [i, forced]);

  const placa = PLACAS[i];

  const container = {
    initial: {},
    animate: { transition: { staggerChildren: still || reduced ? 0 : 0.055, delayChildren: still ? 0 : 0.12 } },
    exit: { opacity: 0, y: -14, transition: { duration: 0.35, ease: 'easeIn' } },
  };
  const wordV = {
    initial: still
      ? { opacity: 1, y: 0, filter: 'blur(0px)' }
      : reduced
        ? { opacity: 0 }
        : { opacity: 0, y: 26, filter: 'blur(8px)' },
    animate: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: still ? 0 : 0.55, ease: EASE },
    },
  };

  return (
    <div className="placas-root">
      {/* Glows ambiente que derivan lento */}
      <motion.div
        className="placas-glow placas-glow-a"
        animate={reduced ? undefined : { x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="placas-glow placas-glow-b"
        animate={reduced ? undefined : { x: [0, -30, 25, 0], y: [0, 25, -20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Barra de progreso estilo stories */}
      <div className="placas-progress">
        {PLACAS.map((_, idx) => (
          <div key={idx} className="placas-seg">
            <motion.div
              className="placas-seg-fill"
              initial={false}
              animate={{ width: idx < i ? '100%' : idx === i ? '100%' : '0%' }}
              transition={{ duration: idx === i ? PLACAS[i].ms / 1000 : 0.25, ease: 'linear' }}
            />
          </div>
        ))}
      </div>

      {/* Contenido */}
      <div className="placas-stage">
        <AnimatePresence mode="wait">
          {placa.cta ? (
            <motion.div
              key="cta"
              className="placas-cta"
              initial={still ? false : reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.35 } }}
            >
              <Owl className="placas-owl" />
              <div className="placas-cta-title">
                Probanos <span className="placas-mark-teal">sin cargo</span>
              </div>
              <div className="placas-cta-btn">Registrate gratis</div>
              <div className="placas-brand-big">
                <span className="placas-spark">✦</span> Smarty
              </div>
            </motion.div>
          ) : (
            <motion.p
              key={i}
              className="placas-text"
              variants={container}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {toWords(placa.seg).map((w, j) => (
                <motion.span
                  key={j}
                  variants={wordV}
                  className={w.mark ? 'placas-word placas-mark' : 'placas-word'}
                >
                  {w.text}
                </motion.span>
              ))}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Marca fija (excepto en la placa CTA que tiene la suya) */}
      {!placa.cta && (
        <div className="placas-brand">
          <span className="placas-spark">✦</span> Smarty
        </div>
      )}
    </div>
  );
}

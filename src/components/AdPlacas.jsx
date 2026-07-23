import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Owl from './Owl';

/* ============================================================
   Placas animadas para Facebook Ads (React + Motion) — inglés,
   9:16 centrado. Auto-play en loop, una placa por línea.
   Ruta: /placas
   ============================================================ */

// Cada placa: segmentos de texto (m: true = destacado) + ms en pantalla.
const PLACAS = [
  { seg: [{ t: "On the internet, your child sees what " }, { t: "the algorithm", m: 1 }, { t: " wants them to see" }], ms: 3900 },
  { seg: [{ t: "And that comes at " }, { t: "a price", m: 1 }, { t: " for you" }], ms: 2900 },
  { seg: [{ t: "The question isn't " }, { t: "whether", m: 1 }, { t: " you'll pay it" }], ms: 3000 },
  { seg: [{ t: "The question is whether you'll pay it with " }, { t: "your child's integrity", m: 1 }], ms: 4400 },
  { seg: [{ t: "Or with a solution that " }, { t: "blocks the garbage algorithm", m: 1 }], ms: 3900 },
  { seg: [{ t: "And lets you " }, { t: "design your own algorithm", m: 1 }], ms: 3700 },
  { seg: [{ t: "The owners of the algorithm have " }, { t: "their own agenda", m: 1 }], ms: 3500 },
  { seg: [{ t: "And it's not an agenda you want for your child" }], ms: 3700 },
  { seg: [{ t: "Only " }, { t: "you", m: 1 }, { t: " know what you want for your child" }], ms: 3800 },
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

// aspect: '916' (9:16, default) | '11' (1:1)
export default function AdPlacas({ aspect = '916' }) {
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
    animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: still ? 0 : 0.55, ease: EASE } },
  };

  return (
    <div className="placas-root">
      {/* Marco centrado (9:16 o 1:1) con letterbox si la ventana no coincide */}
      <div className={`placas-frame ${aspect === '11' ? 'is-11' : 'is-916'}`}>
        {/* Glows ambiente que derivan lento */}
        <motion.div
          className="placas-glow placas-glow-a"
          animate={reduced ? undefined : { x: ['0%', '18%', '-8%', '0%'], y: ['0%', '-12%', '8%', '0%'] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="placas-glow placas-glow-b"
          animate={reduced ? undefined : { x: ['0%', '-14%', '10%', '0%'], y: ['0%', '10%', '-8%', '0%'] }}
          transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }}
        />

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
                  Try it <span className="placas-mark-teal">free</span>
                </div>
                <div className="placas-cta-btn">Get started free</div>
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
    </div>
  );
}

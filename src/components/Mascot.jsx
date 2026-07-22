import { useState } from 'react';
import Owl from './Owl';
import { useT } from '../i18n/core';

// Muestra la mascota real si existe /owl-mascot.png en /public;
// si no, usa el búho SVG como respaldo (sin romper nada).
export default function Mascot({ className, style }) {
  const t = useT();
  const [failed, setFailed] = useState(false);
  if (failed) return <Owl className={className} style={style} />;
  return (
    <img
      className={className}
      style={{ objectFit: 'contain', ...style }}
      src="/owl-mascot.png"
      alt={t.brand.alt}
      onError={() => setFailed(true)}
    />
  );
}

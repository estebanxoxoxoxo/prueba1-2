// Mascota Smarty — búho amigable (SVG puro, sin dependencias).
export default function Owl({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Smarty, la mascota búho"
    >
      {/* Cuerpo */}
      <path
        d="M100 18c-38 0-64 27-64 66 0 46 30 82 64 82s64-36 64-82c0-39-26-66-64-66Z"
        fill="#12a8a0"
      />
      {/* Panza */}
      <path
        d="M100 78c-24 0-40 18-40 44 0 24 18 44 40 44s40-20 40-44c0-26-16-44-40-44Z"
        fill="#e8fbf8"
      />
      {/* Orejas / plumas */}
      <path d="M58 40c-8-14-6-26-6-26s14 4 22 14c-6 3-12 7-16 12Z" fill="#0d9488" />
      <path d="M142 40c8-14 6-26 6-26s-14 4-22 14c6 3 12 7 16 12Z" fill="#0d9488" />
      {/* Alas laterales */}
      <path d="M40 92c-8 6-10 20-4 34 6 12 14 16 20 14-10-14-14-32-16-48Z" fill="#0d9488" />
      <path d="M160 92c8 6 10 20 4 34-6 12-14 16-20 14 10-14 14-32 16-48Z" fill="#f5a623" />
      {/* Gafas */}
      <circle cx="78" cy="92" r="26" fill="#fff" stroke="#6d28d9" strokeWidth="7" />
      <circle cx="128" cy="92" r="26" fill="#fff" stroke="#6d28d9" strokeWidth="7" />
      <path d="M100 90h4" stroke="#6d28d9" strokeWidth="7" strokeLinecap="round" />
      {/* Ojo abierto */}
      <circle cx="78" cy="94" r="12" fill="#1b1550" />
      <circle cx="82" cy="90" r="4" fill="#fff" />
      {/* Ojo guiño */}
      <path d="M116 96q12 8 24 0" stroke="#1b1550" strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* Pico */}
      <path d="M100 108l-9 12h18l-9-12Z" fill="#f5a623" />
      {/* Mejillas */}
      <circle cx="66" cy="120" r="6" fill="#f9c2d6" />
      <circle cx="134" cy="120" r="6" fill="#f9c2d6" />
      {/* Patas */}
      <path d="M86 164v10M100 166v10M114 164v10" stroke="#f5a623" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

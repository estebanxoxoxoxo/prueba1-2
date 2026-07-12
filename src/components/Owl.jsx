// Mascota Smarty — búho amigable (SVG puro, sin dependencias).
export default function Owl({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 220 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Smarty, la mascota búho"
    >
      <defs>
        <radialGradient id="bodyGrad" cx="42%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#2bc4bb" />
          <stop offset="100%" stopColor="#0f9b93" />
        </radialGradient>
        <linearGradient id="wingGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffd34d" />
          <stop offset="100%" stopColor="#f5a623" />
        </linearGradient>
      </defs>

      {/* Orejas / plumas */}
      <path d="M78 40c-6-16-3-30-3-30s16 6 24 20c-8 2-15 5-21 10Z" fill="#0d8f88" />
      <path d="M142 40c6-16 3-30 3-30s-16 6-24 20c8 2 15 5 21 10Z" fill="#0d8f88" />

      {/* Ala trasera morada (izq) */}
      <ellipse cx="58" cy="132" rx="26" ry="40" fill="#7b3ff2" transform="rotate(-18 58 132)" />

      {/* Cuerpo */}
      <path
        d="M110 26c-42 0-70 30-70 74 0 44 30 78 70 78s70-34 70-78c0-44-28-74-70-74Z"
        fill="url(#bodyGrad)"
      />

      {/* Panza */}
      <path
        d="M110 86c-26 0-42 18-42 46 0 26 18 46 42 46s42-20 42-46c0-28-16-46-42-46Z"
        fill="#eafcf9"
      />

      {/* Alita lateral izquierda que saluda */}
      <path d="M46 108c-13 2-20 14-16 27 3 11 12 15 18 12-6-13-6-27-2-39Z" fill="#17b0a7" />

      {/* Ala amarilla (der) */}
      <path
        d="M158 118c14 4 20 18 14 32-5 12-16 15-23 10 7-14 9-28 9-42Z"
        fill="url(#wingGrad)"
      />

      {/* Mejillas */}
      <circle cx="74" cy="128" r="8" fill="#f7b8d0" opacity="0.9" />
      <circle cx="146" cy="128" r="8" fill="#f7b8d0" opacity="0.9" />

      {/* Gafas */}
      <circle cx="86" cy="98" r="30" fill="#fff" stroke="#7b3ff2" strokeWidth="8" />
      <circle cx="140" cy="98" r="30" fill="#fff" stroke="#7b3ff2" strokeWidth="8" />
      <path d="M113 96h0" stroke="#7b3ff2" strokeWidth="8" strokeLinecap="round" />
      <path d="M116 92c-3-2-6-2-9 0" stroke="#7b3ff2" strokeWidth="7" strokeLinecap="round" />

      {/* Ojo abierto (izq) */}
      <circle cx="86" cy="100" r="15" fill="#241a4d" />
      <circle cx="91" cy="95" r="5" fill="#fff" />
      <circle cx="82" cy="105" r="2.5" fill="#fff" opacity="0.8" />

      {/* Ojo guiño (der) */}
      <path
        d="M128 102q12 9 24 0"
        stroke="#241a4d"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Pico */}
      <path d="M113 114l-11 13q11 6 22 0l-11-13Z" fill="#f5a623" />
      <path d="M107 126q6 3 12 0" stroke="#d98a12" strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Patas */}
      <g stroke="#f5a623" strokeWidth="7" strokeLinecap="round">
        <path d="M96 176v11M110 178v11M124 176v11" />
      </g>
      <path d="M92 188h9M105 190h10M119 188h9" stroke="#f5a623" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

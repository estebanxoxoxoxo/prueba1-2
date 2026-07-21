import {
  SparkleIcon,
  ChatIcon,
  SearchIcon,
  ImageIcon,
  PlayIcon,
  ChevronIcon,
  ArrowLeftIcon,
  ShieldFilledIcon,
  VerifiedIcon,
  HeartIcon,
  ThumbUpIcon,
  SendIcon,
  HomeIcon,
  ClockIcon,
  BookmarkIcon,
  GearIcon,
} from './icons';

/* ============================================================
   Marco de teléfono reutilizable + pantallas reales de Smarty
   recreadas fielmente en CSS (sin dependencias de imágenes).
   ============================================================ */

export function PhoneFrame({ children, label }) {
  return (
    <div className="phone" role="img" aria-label={label}>
      <div className="phone-notch" aria-hidden="true" />
      <div className="phone-screen">
        <div className="ph-status" aria-hidden="true">
          <span>9:41</span>
          <span className="ph-status-dots"><i /><i /><i /></span>
        </div>
        {children}
      </div>
    </div>
  );
}

function BottomNav({ active = 'home' }) {
  const items = [
    { k: 'home', ico: <HomeIcon />, l: 'Inicio' },
    { k: 'history', ico: <ClockIcon />, l: 'Historial' },
    { k: 'saved', ico: <BookmarkIcon />, l: 'Guardados' },
    { k: 'settings', ico: <GearIcon />, l: 'Ajustes' },
  ];
  return (
    <nav className="sc-nav" aria-hidden="true">
      {items.map((i) => (
        <span key={i.k} className={i.k === active ? 'active' : ''}>
          {i.ico}
          <em>{i.l}</em>
        </span>
      ))}
    </nav>
  );
}

/* ---------- Pantalla 1: Inicio (4 opciones) → HERO ---------- */
const homeOpts = [
  { ico: <ChatIcon />, t: 'Chat', s: 'Habla de cualquier tema' },
  { ico: <SearchIcon />, t: 'Buscar contenidos', s: 'Información de la web' },
  { ico: <ImageIcon />, t: 'Buscar imágenes', s: 'Explora imágenes' },
  { ico: <PlayIcon />, t: 'Buscar videos', s: 'Mira videos y aprende' },
];

export function ScreenHome() {
  return (
    <div className="sc sc-home">
      <header className="home-head">
        <span className="home-logo"><SparkleIcon /> Smarty</span>
        <span className="home-ava" aria-hidden="true" />
      </header>
      <div className="home-hi">
        <h4>Hola, Alex <span aria-hidden="true">👋</span></h4>
        <p>¿Qué quieres descubrir hoy?</p>
      </div>
      <div className="home-opts">
        {homeOpts.map((o) => (
          <div className="opt" key={o.t}>
            <span className="opt-ico">{o.ico}</span>
            <span className="opt-txt">
              <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{o.t}</p>
              <p>{o.s}</p>
            </span>
            <ChevronIcon className="opt-chev" />
          </div>
        ))}
      </div>
      <BottomNav active="home" />
    </div>
  );
}

/* ---------- Pantalla 2: Chat con Smarty ---------- */
export function ScreenChat() {
  return (
    <div className="sc sc-chat">
      <header className="chat-head">
        <span className="sc-back"><ArrowLeftIcon /></span>
        <div className="chat-title">
          <strong><SparkleIcon /> Chat con Smarty</strong>
          <em><ShieldFilledIcon /> Conversación moderada</em>
        </div>
        <span className="home-ava sm" aria-hidden="true" />
      </header>

      <div className="chat-body">
        <div className="msg me">
          <div className="bubble">
            ¿Qué es la fotosíntesis?
            <span className="bubble-time">9:41 ✓✓</span>
          </div>
        </div>

        <div className="msg bot">
          <span className="msg-ava"><SparkleIcon /></span>
          <div className="bubble">
            <p>¡Buena pregunta! 🌱 La fotosíntesis es el proceso que usan las plantas para producir su propio alimento.</p>
            <p>Usan la luz del sol, agua y dióxido de carbono para crear glucosa y liberar oxígeno.</p>
            <div className="bubble-actions"><ThumbUpIcon /></div>
          </div>
        </div>

        <div className="msg me">
          <div className="bubble">
            ¿Me recomiendas un video?
            <span className="bubble-time">9:42 ✓✓</span>
          </div>
        </div>

        <div className="msg bot">
          <span className="msg-ava"><SparkleIcon /></span>
          <div className="bubble">
            <p>¡Claro! Aquí tienes uno seguro y fácil de entender:</p>
            <div className="vidcard">
              <span className="vidcard-thumb" style={{ background: 'linear-gradient(135deg,#22c55e,#0d9488)' }}>
                <PlayIcon />
              </span>
              <div className="vidcard-meta">
                <p style={{ fontWeight: 'bold', fontSize: '0.65rem', lineHeight: '1.2' }}>La fotosíntesis explicada fácil</p>
                <p style={{  fontSize: '0.5rem', lineHeight: '1.2', marginTop: '2px' }}>Smile and Learn <VerifiedIcon /></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-input">
        <span>Escribe tu mensaje…</span>
        <button type="button" aria-label="Enviar"><SendIcon /></button>
      </div>
    </div>
  );
}

/* ---------- Pantalla 3: Buscar videos ---------- */
const channels = [
  { n: 'Smile and Learn', c: '#2f6bff' },
  { n: 'Kurzgesagt', c: '#0d9488' },
  { n: 'Veritasium', c: '#1b1550' },
  { n: 'Academind', c: '#f59e0b' },
  { n: 'SciShow Kids', c: '#8b5cf6' },
];
const vids = [
  { t: '¿Qué hay dentro de la Tierra?', ch: 'Smile and Learn', v: '1.2 M · hace 2 meses', d: '6:42', g: 'linear-gradient(135deg,#f97316,#ef4444)' },
  { t: 'El sistema solar para principiantes', ch: 'Smile and Learn', v: '895 K · hace 3 meses', d: '8:15', g: 'linear-gradient(135deg,#2f6bff,#22a6c9)' },
  { t: '¿Qué es la materia? Explicado fácil', ch: 'Kurzgesagt', v: '7.8 M · hace 6 meses', d: '5:33', g: 'linear-gradient(135deg,#38bdf8,#2563eb)' },
];

export function ScreenVideos() {
  return (
    <div className="sc sc-videos">
      <header className="vid-head">
        <span className="sc-back"><ArrowLeftIcon /></span>
        <h4>Buscar videos</h4>
      </header>

      <div className="vid-search">
        <SearchIcon />
        <span>Buscar videos…</span>
      </div>

      <div className="vid-sec">
        <span>Canales favoritos</span>
        <a>Ver todos</a>
      </div>
      <div className="chan-row">
        {channels.map((c) => (
          <div className="chan" key={c.n}>
            <span className="chan-ava" style={{ background: c.c }}>
              {c.n[0]}
              <span className="chan-fav"><HeartIcon /></span>
            </span>
            <span className="chan-name">{c.n}</span>
          </div>
        ))}
      </div>

      <div className="vid-sec"><span>Recomendados para ti</span></div>
      <div className="vid-list">
        {vids.map((v) => (
          <div className="vidrow" key={v.t}>
            <span className="vidrow-thumb" style={{ background: v.g }}>
              <PlayIcon />
              <em>{v.d}</em>
            </span>
            <div className="vidrow-meta">
              <p style={{ fontWeight: 'bold', fontSize: '0.65rem', lineHeight: '1.2' }}>{v.t}</p>
              <p className="vidrow-ch">{v.ch} <VerifiedIcon /></p>
              <p className="vidrow-stats">{v.v}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="home" />
    </div>
  );
}

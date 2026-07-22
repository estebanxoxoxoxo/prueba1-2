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
import { useT } from '../i18n/core';

/* ============================================================
   Marco de teléfono reutilizable + pantallas reales de Smarty
   recreadas fielmente en CSS (sin dependencias de imágenes).
   El texto viene del diccionario i18n; iconos/colores no.
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

const NAV_ICONS = [<HomeIcon key="home" />, <ClockIcon key="clock" />, <BookmarkIcon key="bookmark" />, <GearIcon key="gear" />];

function BottomNav({ active = 0 }) {
  const t = useT();
  return (
    <nav className="sc-nav" aria-hidden="true">
      {t.phone.nav.map((label, i) => (
        <span key={label} className={i === active ? 'active' : ''}>
          {NAV_ICONS[i]}
          <em>{label}</em>
        </span>
      ))}
    </nav>
  );
}

/* ---------- Pantalla 1: Inicio (4 opciones) → HERO ---------- */
const homeOptIcons = [<ChatIcon key="chat" />, <SearchIcon key="search" />, <ImageIcon key="image" />, <PlayIcon key="play" />];

export function ScreenHome() {
  const t = useT();
  const home = t.screens.home;
  return (
    <div className="sc sc-home">
      <header className="home-head">
        <span className="home-logo"><SparkleIcon /> Smarty</span>
        <span className="home-ava" aria-hidden="true" />
      </header>
      <div className="home-hi">
        <h4>{home.greeting} <span aria-hidden="true">👋</span></h4>
        <p>{home.prompt}</p>
      </div>
      <div className="home-opts">
        {home.opts.map((o, i) => (
          <div className="opt" key={o.t}>
            <span className="opt-ico">{homeOptIcons[i]}</span>
            <span className="opt-txt">
              <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{o.t}</p>
              <p>{o.s}</p>
            </span>
            <ChevronIcon className="opt-chev" />
          </div>
        ))}
      </div>
      <BottomNav active={0} />
    </div>
  );
}

/* ---------- Pantalla 2: Chat con Smarty ---------- */
export function ScreenChat() {
  const t = useT();
  const chat = t.screens.chat;
  return (
    <div className="sc sc-chat">
      <header className="chat-head">
        <span className="sc-back"><ArrowLeftIcon /></span>
        <div className="chat-title">
          <strong><SparkleIcon /> {chat.title}</strong>
          <em><ShieldFilledIcon /> {chat.moderated}</em>
        </div>
        <span className="home-ava sm" aria-hidden="true" />
      </header>

      <div className="chat-body">
        <div className="msg me">
          <div className="bubble">
            {chat.q1}
            <span className="bubble-time">9:41 ✓✓</span>
          </div>
        </div>

        <div className="msg bot">
          <span className="msg-ava"><SparkleIcon /></span>
          <div className="bubble">
            <p>{chat.a1p1}</p>
            <p>{chat.a1p2}</p>
            <div className="bubble-actions"><ThumbUpIcon /></div>
          </div>
        </div>

        <div className="msg me">
          <div className="bubble">
            {chat.q2}
            <span className="bubble-time">9:42 ✓✓</span>
          </div>
        </div>

        <div className="msg bot">
          <span className="msg-ava"><SparkleIcon /></span>
          <div className="bubble">
            <p>{chat.a2}</p>
            <div className="vidcard">
              <span className="vidcard-thumb" style={{ background: 'linear-gradient(135deg,#22c55e,#0d9488)' }}>
                <PlayIcon />
              </span>
              <div className="vidcard-meta">
                <p style={{ fontWeight: 'bold', fontSize: '0.65rem', lineHeight: '1.2' }}>{chat.vidTitle}</p>
                <p style={{  fontSize: '0.5rem', lineHeight: '1.2', marginTop: '2px' }}>{chat.vidChannel} <VerifiedIcon /></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="chat-input">
        <span>{chat.inputPlaceholder}</span>
        <button type="button" aria-label={t.a11y.send}><SendIcon /></button>
      </div>
    </div>
  );
}

/* ---------- Pantalla 3: Buscar videos ---------- */
// Datos visuales (marca/colores/duración): NO se traducen.
const channels = [
  { n: 'Smile and Learn', c: '#2f6bff' },
  { n: 'Kurzgesagt', c: '#0d9488' },
  { n: 'Veritasium', c: '#1b1550' },
  { n: 'Academind', c: '#f59e0b' },
  { n: 'SciShow Kids', c: '#8b5cf6' },
];
const vidMeta = [
  { ch: 'Smile and Learn', d: '6:42', g: 'linear-gradient(135deg,#f97316,#ef4444)' },
  { ch: 'Smile and Learn', d: '8:15', g: 'linear-gradient(135deg,#2f6bff,#22a6c9)' },
  { ch: 'Kurzgesagt', d: '5:33', g: 'linear-gradient(135deg,#38bdf8,#2563eb)' },
];

export function ScreenVideos() {
  const t = useT();
  const v = t.screens.videos;
  return (
    <div className="sc sc-videos">
      <header className="vid-head">
        <span className="sc-back"><ArrowLeftIcon /></span>
        <h4>{v.title}</h4>
      </header>

      <div className="vid-search">
        <SearchIcon />
        <span>{v.searchPlaceholder}</span>
      </div>

      <div className="vid-sec">
        <span>{v.favChannels}</span>
        <a>{v.seeAll}</a>
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

      <div className="vid-sec"><span>{v.recommended}</span></div>
      <div className="vid-list">
        {v.list.map((vid, i) => (
          <div className="vidrow" key={vid.t}>
            <span className="vidrow-thumb" style={{ background: vidMeta[i].g }}>
              <PlayIcon />
              <em>{vidMeta[i].d}</em>
            </span>
            <div className="vidrow-meta">
              <p style={{ fontWeight: 'bold', fontSize: '0.65rem', lineHeight: '1.2' }}>{vid.t}</p>
              <p className="vidrow-ch">{vidMeta[i].ch} <VerifiedIcon /></p>
              <p className="vidrow-stats">{vid.v}</p>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active={0} />
    </div>
  );
}

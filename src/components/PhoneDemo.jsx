import { useEffect, useRef, useState } from 'react';
import { useAnimationFrame, useReducedMotion } from 'motion/react';
import {
  SparkleIcon,
  PlayIcon,
  ChatIcon,
  SearchIcon,
  ImageIcon,
  ChevronIcon,
  ArrowLeftIcon,
  ShieldFilledIcon,
  VerifiedIcon,
  ThumbUpIcon,
  SendIcon,
  HomeIcon,
  ClockIcon,
  BookmarkIcon,
  GearIcon,
} from './icons';
import poster from '../assets/miniatura.jpg';

/* ============================================================
   Demo animada de la app (React + Motion) — versión liviana del
   video: mismo guion (Home → Chat → pide video → card → player),
   todo en DOM/CSS, sin renderizar un MP4. Loopea sola.
   ============================================================ */

const SCREEN_W = 330;
const SCREEN_H = 670;
const PHONE_PAD = 10;
const DESIGN_W = SCREEN_W + PHONE_PAD * 2; // 350
const DESIGN_H = SCREEN_H + PHONE_PAD * 2; // 690

// Línea de tiempo en segundos (loopea en TL.total).
const TL = {
  tapChat: 1.35,
  goChat: 1.8,
  chatDone: 2.35,
  typeStart: 2.75,
  typeEnd: 5.05,
  send: 5.3,
  botTyping: 5.7,
  botText: 6.8,
  cardIn: 7.6,
  tapCard: 8.9,
  playerIn: 9.2,
  playerReady: 9.9,
  tapPlay: 10.35,
  playStart: 10.55,
  total: 16,
};

const clampNum = (v, a, b) => (v < a ? a : v > b ? b : v);
function interp(x, [x0, x1], [y0, y1], clamp = true) {
  if (x1 === x0) return x < x0 ? y0 : y1;
  let p = (x - x0) / (x1 - x0);
  if (clamp) p = clampNum(p, 0, 1);
  return y0 + (y1 - y0) * p;
}
const easeOut = (p) => 1 - Math.pow(1 - clampNum(p, 0, 1), 3);
const px = (n) => `${n}px`;

const CopyGlyph = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

/* ---------- Indicador de "tap" (auto-centrado en su contenedor) ---------- */
function TapPulse({ t, at, light }) {
  const local = t - at;
  if (local < -0.27 || local > 0.9) return null;
  const appear = interp(t, [at - 0.27, at - 0.07], [0, 1]);
  const disappear = interp(t, [at + 0.53, at + 0.87], [1, 0]);
  const op = appear * disappear;
  const press = t < at + 0.1 ? interp(t, [at - 0.07, at + 0.1], [1, 0.7]) : interp(t, [at + 0.1, at + 0.3], [0.7, 1]);
  const ringScale = interp(t, [at, at + 0.73], [0.3, 2.7]);
  const ringOp = interp(t, [at, at + 0.73], [0.5, 0]);
  const rgb = light ? '255,255,255' : '109,40,217';
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 20 }}>
      <div style={{ position: 'relative', width: 34, height: 34 }}>
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 54, height: 54, marginLeft: -27, marginTop: -27, borderRadius: '50%', border: `2px solid rgba(${rgb},1)`, transform: `scale(${ringScale})`, opacity: ringOp }} />
        <div style={{ position: 'absolute', left: '50%', top: '50%', width: 34, height: 34, marginLeft: -17, marginTop: -17, borderRadius: '50%', background: `rgba(${rgb},0.28)`, border: `2px solid rgba(${rgb},0.9)`, transform: `scale(${press})`, opacity: op }} />
      </div>
    </div>
  );
}

function TypingDots({ t }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 2px' }}>
      {[0, 1, 2].map((i) => {
        const yy = Math.sin(t * 7 + i * 0.9) * 2.4;
        return <span key={i} style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#b7b1d4', transform: `translateY(${yy}px)` }} />;
      })}
    </span>
  );
}

const NAV = [
  { ico: <HomeIcon />, l: 'Inicio', active: true },
  { ico: <ClockIcon />, l: 'Historial' },
  { ico: <BookmarkIcon />, l: 'Guardados' },
  { ico: <GearIcon />, l: 'Ajustes' },
];
function BottomNav() {
  return (
    <nav style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '10px 14px 14px', background: '#fff', borderTop: '1px solid var(--line)' }}>
      {NAV.map((i) => (
        <span key={i.l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: i.active ? 'var(--violet)' : '#b7b1d4' }}>
          <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22 }}>{i.ico}</span>
          <em style={{ fontStyle: 'normal', fontSize: 9, fontWeight: 800 }}>{i.l}</em>
        </span>
      ))}
    </nav>
  );
}

/* ---------- Home ---------- */
const HOME_OPTS = [
  { ico: <ChatIcon />, t: 'Chat', s: 'Habla con Smarty sobre cualquier tema' },
  { ico: <SearchIcon />, t: 'Buscar contenidos', s: 'Encuentra información de la web' },
  { ico: <ImageIcon />, t: 'Buscar imágenes', s: 'Explora y descubre imágenes increíbles' },
  { ico: <PlayIcon />, t: 'Buscar videos', s: 'Encuentra y reproduce videos sobre lo que buscas' },
];

function HomeScreen({ t }) {
  const gone = interp(t, [TL.goChat, TL.chatDone], [0, 1]);
  const show = interp(t, [TL.tapChat - 0.33, TL.tapChat - 0.13], [0, 1]) * (1 - gone);
  const press = t < TL.tapChat + 0.17 ? interp(t, [TL.tapChat, TL.tapChat + 0.17], [1, 0.98]) : interp(t, [TL.tapChat + 0.17, TL.tapChat + 0.4], [0.98, 1]);
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#f6f5fb', opacity: 1 - gone, transform: `translateX(${-28 * gone}px) scale(${1 - 0.04 * gone})`, transformOrigin: 'center' }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 0' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 900, fontSize: 20, color: 'var(--violet)' }}>
          <SparkleIcon style={{ width: 22, height: 22 }} /> Smarty
        </span>
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet-2), var(--teal))', border: '2px solid #fff', boxShadow: 'var(--sh-xs)' }} />
      </header>

      <div style={{ padding: '12px 20px 4px' }}>
        <h4 style={{ fontSize: 26, fontWeight: 900, color: 'var(--ink)' }}>Hola, Alex <span aria-hidden="true">👋</span></h4>
        <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 700, marginTop: 3 }}>¿Qué quieres descubrir hoy?</p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '12px 16px 0', minHeight: 0 }}>
        {HOME_OPTS.map((o, i) => (
          <div key={o.t} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 13, background: '#fff', border: '1.5px solid #e2ddf1', borderRadius: 20, padding: '13px 14px', boxShadow: 'var(--sh-sm)' }}>
            <span style={{ width: 52, height: 52, borderRadius: 15, flex: 'none', display: 'grid', placeItems: 'center', background: 'rgba(109,40,217,0.10)', color: 'var(--violet)' }}>{o.ico}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15.5, fontWeight: 900, color: 'var(--ink)' }}>{o.t}</p>
              <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', marginTop: 3, lineHeight: 1.3 }}>{o.s}</p>
            </span>
            <span style={{ width: 38, height: 38, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', background: 'rgba(109,40,217,0.08)', color: 'var(--violet)' }}>
              <ChevronIcon style={{ width: 18, height: 18, transform: 'rotate(-90deg)' }} />
            </span>
            {i === 0 && (
              <>
                <div style={{ position: 'absolute', inset: -3, borderRadius: 22, border: '2px solid var(--violet)', boxShadow: '0 0 0 6px rgba(109,40,217,0.14)', opacity: show, transform: `scale(${press})`, transformOrigin: 'center', pointerEvents: 'none' }} />
                <TapPulse t={t} at={TL.tapChat} />
              </>
            )}
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}

/* ---------- Chat ---------- */
const QUERY = Array.from('¿Me buscás un video sobre dinosaurios? 🦕');

function ChatScreen({ t }) {
  if (t < TL.goChat - 0.1) return null;
  const inn = easeOut(interp(t, [TL.goChat, TL.chatDone], [0, 1]));
  const nChars = Math.round(interp(t, [TL.typeStart, TL.typeEnd], [0, QUERY.length]));
  const typedText = QUERY.slice(0, nChars).join('');
  const isTyping = t >= TL.typeStart && t < TL.send;
  const caret = Math.floor(t * 3.6) % 2 === 0 ? '▏' : '';

  const showUser = t >= TL.send;
  const userIn = easeOut(interp(t, [TL.send, TL.send + 0.5], [0, 1]));
  const botTyping = t >= TL.botTyping && t < TL.botText;
  const showBot = t >= TL.botText;
  const botIn = easeOut(interp(t, [TL.botText, TL.botText + 0.5], [0, 1]));
  const showCard = t >= TL.cardIn;
  const cardIn = easeOut(interp(t, [TL.cardIn, TL.cardIn + 0.5], [0, 1]));

  const bubbleTextStyle = { fontSize: 13, fontWeight: 600, lineHeight: 1.45 };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#f4f1fb', opacity: inn, transform: `translateX(${40 * (1 - inn)}px)` }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px 12px', background: '#faf8ff' }}>
        <span style={{ width: 32, height: 32, borderRadius: 11, flex: 'none', display: 'grid', placeItems: 'center', background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)' }}>
          <ArrowLeftIcon style={{ width: 17, height: 17 }} />
        </span>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>
            <SparkleIcon style={{ width: 17, height: 17, color: 'var(--violet)' }} /> Chat con Smarty
          </strong>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginTop: 2 }}>
            <ShieldFilledIcon style={{ width: 12, height: 12, color: 'var(--muted)' }} /> Conversación moderada
          </div>
        </div>
        <span style={{ width: 34, height: 34, borderRadius: '50%', flex: 'none', background: 'linear-gradient(135deg, var(--violet-2), var(--teal))', border: '2px solid #fff', boxShadow: 'var(--sh-xs)' }} />
      </header>

      <div style={{ flex: 1, overflow: 'hidden', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {showUser && (
          <div style={{ alignSelf: 'flex-end', maxWidth: '84%', opacity: userIn, transform: `translateY(${(1 - userIn) * 12}px)` }}>
            <div style={{ background: 'var(--violet)', color: '#fff', border: '1px solid var(--violet-ink)', borderRadius: 18, borderBottomRightRadius: 6, padding: '11px 14px', ...bubbleTextStyle }}>
              ¿Me buscás un video sobre dinosaurios? 🦕
              <span style={{ display: 'block', textAlign: 'right', fontSize: 10, fontWeight: 700, opacity: 0.9, marginTop: 4 }}>9:41 ✓✓</span>
            </div>
          </div>
        )}

        {botTyping && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 8, maxWidth: '90%' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', background: '#fff', color: 'var(--violet)', boxShadow: 'var(--sh-xs)' }}><SparkleIcon style={{ width: 15, height: 15 }} /></span>
            <div style={{ background: '#fff', border: '1px solid #e6e1f4', borderRadius: 18, borderBottomLeftRadius: 6, padding: '12px 14px', boxShadow: 'var(--sh-xs)' }}><TypingDots t={t} /></div>
          </div>
        )}

        {showBot && (
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 8, maxWidth: '90%', opacity: botIn, transform: `translateY(${(1 - botIn) * 12}px)` }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', background: '#fff', color: 'var(--violet)', boxShadow: 'var(--sh-xs)' }}><SparkleIcon style={{ width: 15, height: 15 }} /></span>
            <div style={{ background: '#fff', border: '1px solid #e6e1f4', borderRadius: 18, borderBottomLeftRadius: 6, padding: '12px 14px', boxShadow: 'var(--sh-xs)' }}>
              <p style={{ ...bubbleTextStyle, color: 'var(--ink)' }}>¡Genial! 🦖 Encontré uno buenísimo, seguro y ya aprobado para vos:</p>

              {showCard && (
                <div style={{ position: 'relative', display: 'flex', gap: 11, marginTop: 11, alignItems: 'center', opacity: cardIn, transform: `translateY(${(1 - cardIn) * 8}px)` }}>
                  <span style={{ position: 'relative', width: 116, height: 76, borderRadius: 11, flex: 'none', overflow: 'hidden', display: 'block' }}>
                    <img src={poster} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                      <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.42)', display: 'grid', placeItems: 'center' }}><PlayIcon style={{ width: 16, height: 16, color: '#fff' }} /></span>
                    </span>
                    <em style={{ position: 'absolute', right: 5, bottom: 5, fontStyle: 'normal', background: 'rgba(0,0,0,0.72)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 5 }}>12:04</em>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12.5, fontWeight: 900, color: 'var(--ink)', lineHeight: 1.25 }}>El mundo de los dinosaurios</p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', marginTop: 4 }}>Veritasium <VerifiedIcon style={{ width: 12, height: 12, color: 'var(--violet)' }} /></p>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginTop: 2 }}>1.4 M visualizaciones</p>
                  </div>
                  <TapPulse t={t} at={TL.tapCard} />
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 11 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)' }}>9:41</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#c3bedd' }}>
                  <CopyGlyph style={{ width: 14, height: 14 }} />
                  <ThumbUpIcon style={{ width: 14, height: 14 }} />
                  <ThumbUpIcon style={{ width: 14, height: 14, transform: 'scaleY(-1)' }} />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 14px', background: '#fff', borderTop: '1px solid var(--line)' }}>
        <span style={{ flex: 1, background: '#f2eefc', borderRadius: 'var(--r-pill)', padding: '11px 16px', fontSize: 12.5, color: isTyping && typedText ? 'var(--ink)' : 'var(--muted)', fontWeight: 600 }}>
          {isTyping && typedText ? typedText + caret : 'Escribe tu mensaje…'}
        </span>
        <button type="button" aria-label="Enviar" style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', flex: 'none', background: 'var(--violet)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <SendIcon style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </div>
  );
}

/* ---------- Player (póster real + reproducción simulada) ---------- */
function PlayerScreen({ t }) {
  if (t < TL.playerIn - 0.1) return null;
  const inn = easeOut(interp(t, [TL.playerIn, TL.playerIn + 0.47], [0, 1]));
  const playing = t >= TL.playStart;
  const playBtn = interp(t, [TL.playerReady, TL.playerReady + 0.27], [0, 1]) * interp(t, [TL.tapPlay, TL.playStart], [1, 0]);
  const zoom = playing ? interp(t, [TL.playStart, TL.total], [1, 1.1]) : 1;
  const progress = interp(t, [TL.playStart, TL.total], [0, 0.16]);
  const cur = Math.floor(interp(t, [TL.playStart, TL.total], [0, 8]));

  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - inn) * 100}%)`, background: '#0b0a1f', display: 'flex', flexDirection: 'column', color: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
        <span style={{ width: 32, height: 32, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.12)', color: '#fff' }}><ArrowLeftIcon style={{ width: 17, height: 17 }} /></span>
        <strong style={{ fontSize: 13, fontWeight: 800 }}>Reproduciendo</strong>
      </div>

      <div style={{ position: 'relative', margin: '0 18px', borderRadius: 16, overflow: 'hidden', aspectRatio: '9 / 16', background: '#000' }}>
        <img src={poster} alt="El mundo de los dinosaurios" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }} />

        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: playBtn }}>
          <div style={{ width: 62, height: 62, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center' }}>
            <PlayIcon style={{ width: 26, height: 26, color: '#fff' }} />
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '40px 12px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.72))' }}>
          <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.25 }}>El mundo de los dinosaurios</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 10.5, fontWeight: 700, opacity: 0.92 }}>
            Veritasium <VerifiedIcon style={{ width: 12, height: 12, color: '#8b5cf6' }} /> · 1.4 M vistas
          </div>
          <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.3)', marginTop: 9 }}>
            <div style={{ height: '100%', width: `${progress * 100}%`, background: '#ff2b53', borderRadius: 4 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, marginTop: 4, opacity: 0.9 }}>
            <span>{`0:${String(playing ? cur : 0).padStart(2, '0')}`}</span>
            <span>0:52</span>
          </div>
        </div>

        <TapPulse t={t} at={TL.tapPlay} light />
      </div>

      <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 999, background: 'rgba(34,197,94,0.16)', color: '#4ade80', fontSize: 12, fontWeight: 800 }}>
          <ShieldFilledIcon style={{ width: 15, height: 15 }} /> Revisado y aprobado por Smarty
        </div>
      </div>
    </div>
  );
}

/* ---------- Subtítulo por escena ---------- */
const CAPTIONS = [
  { from: 0, to: TL.goChat + 0.27, text: 'Tu hijo entra al chat' },
  { from: TL.goChat + 0.27, to: TL.botTyping, text: 'Pide lo que quiera aprender' },
  { from: TL.botTyping, to: TL.playerIn, text: 'Smarty lo busca y lo modera' },
  { from: TL.playerIn, to: TL.total, text: 'Solo contenido seguro y aprobado' },
];
function Caption({ t }) {
  const cur = CAPTIONS.find((c) => t >= c.from && t < c.to) || CAPTIONS[CAPTIONS.length - 1];
  const local = t - cur.from;
  const opIn = interp(local, [0, 0.33], [0, 1]);
  const opOut = cur.to < TL.total ? interp(t, [cur.to - 0.33, cur.to], [1, 0]) : 1;
  const up = interp(local, [0, 0.4], [10, 0]);
  return (
    <div style={{ marginTop: 18, minHeight: 40, display: 'flex', justifyContent: 'center' }}>
      <div style={{ opacity: Math.min(opIn, opOut), transform: `translateY(${up}px)`, background: 'var(--ink)', color: '#fff', padding: '10px 20px', borderRadius: 999, fontSize: 14.5, fontWeight: 800, boxShadow: 'var(--sh-md)' }}>
        {cur.text}
      </div>
    </div>
  );
}

/* ---------- Marco del teléfono ---------- */
function Phone({ t }) {
  return (
    <div style={{ position: 'relative', width: DESIGN_W, height: DESIGN_H, background: '#14103a', borderRadius: 46, padding: PHONE_PAD, boxShadow: 'var(--sh-lg), inset 0 0 0 2px rgba(255,255,255,0.06)' }}>
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', width: 120, height: 24, background: '#14103a', borderRadius: '0 0 16px 16px', zIndex: 3 }} />
      <div style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, background: 'linear-gradient(180deg,#faf8ff,#f2eefc)', borderRadius: 36, overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px 6px', fontSize: 12, fontWeight: 800, color: 'var(--ink)' }}>
          <span>9:41</span>
          <span style={{ display: 'flex', gap: 3 }}>
            {[0, 1, 2].map((i) => <i key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink)', opacity: 0.75, display: 'inline-block' }} />)}
          </span>
        </div>
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          <HomeScreen t={t} />
          <ChatScreen t={t} />
          <PlayerScreen t={t} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Componente principal ---------- */
export default function PhoneDemo() {
  const reduced = useReducedMotion();
  const wrapRef = useRef(null);
  const frameRef = useRef(-1);
  const [scale, setScale] = useState(1);
  // Con reduced-motion: cuadro fijo representativo (chat con la card).
  const [t, setT] = useState(reduced ? 8.2 : 0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setScale(Math.min(1, el.clientWidth / DESIGN_W));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useAnimationFrame((time) => {
    if (reduced) return;
    const nt = (time / 1000) % TL.total;
    const fr = Math.floor(nt * 30); // ~30 fps de re-render
    if (fr !== frameRef.current) {
      frameRef.current = fr;
      setT(nt);
    }
  });

  return (
    <div ref={wrapRef} style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: DESIGN_W * scale, height: DESIGN_H * scale }}>
        <div style={{ width: px(DESIGN_W), height: px(DESIGN_H), transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <Phone t={t} />
        </div>
      </div>
      <Caption t={t} />
    </div>
  );
}

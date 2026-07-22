import { useEffect, useRef, useState } from 'react';
import { useAnimationFrame, useReducedMotion } from 'motion/react';
import {
  SparkleIcon,
  PlayIcon,
  SearchIcon,
  ImageIcon,
  ArrowLeftIcon,
  ShieldFilledIcon,
  VerifiedIcon,
  SendIcon,
  CheckIcon,
  XIcon,
  NoAdsIcon,
  UsersOffIcon,
} from './icons';
import poster from '../assets/miniatura.jpg';
import { useT } from '../i18n/core';

/* ============================================================
   Demo animada del hero (React + Motion) — versión demostrativa
   de 4 capítulos, todo en DOM/CSS (sin MP4). Loopea sola.
     1. Buscar videos + MODERACIÓN en vivo (bloquea lo malo)
     2. Chat que enseña (respuesta a su edad)
     3. Buscar imágenes (moderación visual)
     4. Cierre: resumen / tranquilidad del padre
   ============================================================ */

const SCREEN_W = 330;
const SCREEN_H = 670;
const PHONE_PAD = 10;
const DESIGN_W = SCREEN_W + PHONE_PAD * 2; // 350
const DESIGN_H = SCREEN_H + PHONE_PAD * 2; // 690

// Línea de tiempo en segundos (loopea en TL.total).
const TL = {
  // Cap. 1 — Videos + moderación (0–10.5)
  gridIn: 0.2,
  scanStart: 1.3,
  good1: 2.0, block1: 2.3,
  good2: 3.0, block2: 3.3,
  good3: 4.0, block3: 4.3,
  scanEnd: 5.4,
  tapVideo: 6.6,
  playerIn: 7.3,
  playStart: 8.1,
  cap1End: 10.5,
  // Cap. 2 — Chat (10.5–17.5)
  chatIn: 10.6,
  typeStart: 11.5, typeEnd: 13.3,
  send: 13.5, botTyping: 13.8, botText: 14.3, ageChip: 15.1,
  cap2End: 17.5,
  // Cap. 3 — Imágenes (17.5–22.5)
  imgIn: 17.6, imgScanStart: 18.4, imgBlock: 19.5, imgCounter: 20.4,
  cap3End: 22.5,
  // Cap. 4 — Resumen (22.5–28)
  sumIn: 22.7, sumChips: 23.6, sumStats: 24.7,
  total: 28.0,
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
// Aparece (fade+slide in) al entrar al capítulo y se va al final.
const chapOut = (t, end, d = 0.4) => interp(t, [end - d, end], [1, 0]);

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
    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none', zIndex: 30 }}>
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

/* ---------- Barra de búsqueda (cabecera reutilizable) ---------- */
function SearchBar({ query, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '2px 16px 0', padding: '10px 14px', background: '#fff', border: '1.5px solid #e4e0f4', borderRadius: 'var(--r-pill)', boxShadow: 'var(--sh-xs)' }}>
      <span style={{ color: 'var(--violet)', display: 'grid', placeItems: 'center' }}>{icon}</span>
      <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>{query}</span>
    </div>
  );
}

/* ---------- Contador de moderación (revisados / bloqueados) ---------- */
function ModCounter({ reviewedLabel, reviewed, blockedLabel, blocked }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '9px 16px 4px' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 800, color: 'var(--violet-ink)', background: 'rgba(109,40,217,0.09)', padding: '4px 9px', borderRadius: 'var(--r-pill)' }}>
        <ShieldFilledIcon style={{ width: 12, height: 12, color: 'var(--violet)' }} /> {reviewedLabel} {reviewed}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 800, color: '#b4342f', background: 'rgba(220,38,38,0.09)', padding: '4px 9px', borderRadius: 'var(--r-pill)' }}>
        <XIcon style={{ width: 11, height: 11 }} /> {blockedLabel} {blocked}
      </span>
    </div>
  );
}

/* ============================================================
   CAP. 1 — Buscar videos + moderación en vivo
   ============================================================ */
const GRID_PAD = 16;
const GRID_GAP = 10;
const GRID_TOP = 92;
const CARD_W = (SCREEN_W - GRID_PAD * 2 - GRID_GAP) / 2; // 144
const CARD_H = 120;
const ROW_H = CARD_H + GRID_GAP;
const GOOD_GRADS = ['linear-gradient(135deg,#f97316,#ef4444)', 'linear-gradient(135deg,#2f6bff,#22a6c9)', 'linear-gradient(135deg,#8b5cf6,#6d28d9)'];
const GOOD_DUR = ['5:12', '6:40', '4:28'];
// good indices 0,2,4 ; bad 1,3,5
const CARDS = [
  { good: true, gi: 0, at: TL.good1 },
  { good: false, reason: 'violent', at: TL.block1 },
  { good: true, gi: 1, at: TL.good2 },
  { good: false, reason: 'clickbait', at: TL.block2 },
  { good: true, gi: 2, at: TL.good3 },
  { good: false, reason: 'ads', at: TL.block3 },
];

function ResultCard({ i, card, t, tr }) {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = GRID_PAD + col * (CARD_W + GRID_GAP);
  const y = GRID_TOP + row * ROW_H;

  const appear = easeOut(interp(t, [TL.gridIn + i * 0.08, TL.gridIn + i * 0.08 + 0.4], [0, 1]));
  const enterY = (1 - appear) * -14;

  // bloqueado: sello rojo + motivo, luego se retira (queda el hueco).
  const remove = card.good ? 0 : easeOut(interp(t, [card.at + 0.55, card.at + 0.95], [0, 1]));
  const opacity = appear * (1 - remove);
  const scale = 1 - 0.12 * remove;
  const checkOn = card.good ? interp(t, [card.at, card.at + 0.3], [0, 1]) : 0;
  const blockOn = card.good ? 0 : interp(t, [card.at, card.at + 0.28], [0, 1]);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width: CARD_W, height: CARD_H, opacity, transform: `translateY(${enterY}px) scale(${scale})`, transformOrigin: 'center' }}>
      <div style={{ position: 'relative', width: '100%', height: 74, borderRadius: 12, overflow: 'hidden', background: card.good ? GOOD_GRADS[card.gi] : 'linear-gradient(135deg,#c9d0dd,#9aa3b5)' }}>
        {!card.good && (
          <div style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(3px)', background: 'rgba(255,255,255,0.06)' }} />
        )}
        {card.good ? (
          <>
            <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.42)', display: 'grid', placeItems: 'center' }}><PlayIcon style={{ width: 14, height: 14, color: '#fff' }} /></span>
            </span>
            <em style={{ position: 'absolute', right: 5, bottom: 5, fontStyle: 'normal', background: 'rgba(0,0,0,0.72)', color: '#fff', fontSize: 8.5, fontWeight: 800, padding: '1px 4px', borderRadius: 4 }}>{GOOD_DUR[card.gi]}</em>
            {/* check verde de aprobado */}
            <span style={{ position: 'absolute', left: 5, top: 5, width: 20, height: 20, borderRadius: '50%', background: 'var(--green)', border: '2px solid #fff', display: 'grid', placeItems: 'center', opacity: checkOn, transform: `scale(${0.6 + 0.4 * checkOn})` }}>
              <CheckIcon style={{ width: 11, height: 11, color: '#fff' }} />
            </span>
          </>
        ) : (
          <>
            {/* velo rojo + escudo + motivo */}
            <span style={{ position: 'absolute', inset: 0, background: 'rgba(220,38,38,0.34)', opacity: blockOn }} />
            <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: blockOn }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(180,25,25,0.92)', display: 'grid', placeItems: 'center', border: '2px solid #fff' }}><XIcon style={{ width: 15, height: 15, color: '#fff' }} /></span>
            </span>
            <span style={{ position: 'absolute', left: '50%', bottom: 6, transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: '#b4191a', color: '#fff', fontSize: 9.5, fontWeight: 800, padding: '2px 7px', borderRadius: 'var(--r-pill)', opacity: blockOn }}>
              {tr.phone.videos.reasons[card.reason]}
            </span>
          </>
        )}
      </div>
      {card.good ? (
        <div style={{ padding: '6px 2px 0' }}>
          <p style={{ fontSize: 10.5, fontWeight: 900, color: 'var(--ink)', lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tr.phone.videos.good[card.gi].title}</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, color: 'var(--muted)', marginTop: 3 }}>{tr.phone.videos.good[card.gi].channel} <VerifiedIcon style={{ width: 10, height: 10, color: 'var(--violet)' }} /></p>
        </div>
      ) : (
        <div style={{ padding: '6px 2px 0' }}>
          <span style={{ display: 'inline-block', width: '70%', height: 8, borderRadius: 4, background: '#e4e0f4' }} />
          <span style={{ display: 'block', width: '45%', height: 7, borderRadius: 4, background: '#eee9f7', marginTop: 5 }} />
        </div>
      )}
      {i === 0 && <TapPulse t={t} at={TL.tapVideo} />}
    </div>
  );
}

function VideoSearchScreen({ t, tr }) {
  if (t > TL.playerIn + 0.5) return null;
  const out = chapOut(t, TL.playerIn + 0.4, 0.4);
  const scanning = t >= TL.scanStart && t <= TL.scanEnd;
  const scanY = interp(t, [TL.scanStart, TL.scanEnd], [GRID_TOP - 8, GRID_TOP + 3 * ROW_H - 4]);
  const scanOp = interp(t, [TL.scanStart, TL.scanStart + 0.2], [0, 1]) * interp(t, [TL.scanEnd - 0.3, TL.scanEnd], [1, 0]);
  const reviewed = Math.round(interp(t, [TL.scanStart, TL.scanEnd], [3, 24]));
  const blocked = (t >= TL.block1 ? 1 : 0) + (t >= TL.block2 ? 1 : 0) + (t >= TL.block3 ? 1 : 0);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#f6f5fb', opacity: out }}>
      <SearchBar query={tr.phone.videos.searchQuery} icon={<SearchIcon style={{ width: 17, height: 17 }} />} />
      <ModCounter reviewedLabel={tr.phone.videos.reviewed} reviewed={reviewed} blockedLabel={tr.phone.videos.blocked} blocked={blocked} />

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {CARDS.map((c, i) => <ResultCard key={i} i={i} card={c} t={t} tr={tr} />)}
        {scanning && (
          <div style={{ position: 'absolute', left: 10, right: 10, top: scanY, height: 3, borderRadius: 3, background: 'linear-gradient(90deg,transparent,var(--violet),transparent)', boxShadow: '0 0 14px 2px rgba(109,40,217,0.55)', opacity: scanOp }} />
        )}
      </div>
    </div>
  );
}

/* ---------- Player (póster real + reproducción simulada) ---------- */
function PlayerScreen({ t, tr }) {
  if (t < TL.playerIn - 0.1 || t > TL.cap1End + 0.5) return null;
  const inn = easeOut(interp(t, [TL.playerIn, TL.playerIn + 0.47], [0, 1]));
  const out = chapOut(t, TL.cap1End + 0.4, 0.4);
  const playing = t >= TL.playStart;
  const zoom = playing ? interp(t, [TL.playStart, TL.cap1End], [1, 1.08]) : 1;
  const progress = interp(t, [TL.playStart, TL.cap1End], [0, 0.14]);
  const cur = Math.floor(interp(t, [TL.playStart, TL.cap1End], [0, 8]));

  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - inn) * 100}%)`, background: '#0b0a1f', display: 'flex', flexDirection: 'column', color: '#fff', opacity: out, zIndex: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px' }}>
        <span style={{ width: 32, height: 32, borderRadius: 11, display: 'grid', placeItems: 'center', background: 'rgba(255,255,255,0.12)', color: '#fff' }}><ArrowLeftIcon style={{ width: 17, height: 17 }} /></span>
        <strong style={{ fontSize: 13, fontWeight: 800 }}>{tr.phone.player.playing}</strong>
      </div>

      <div style={{ position: 'relative', margin: '0 18px', borderRadius: 16, overflow: 'hidden', aspectRatio: '9 / 16', background: '#000' }}>
        <img src={poster} alt={tr.phone.player.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }} />
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '40px 12px 10px', background: 'linear-gradient(transparent, rgba(0,0,0,0.72))' }}>
          <div style={{ fontSize: 13, fontWeight: 900, lineHeight: 1.25 }}>{tr.phone.player.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, fontSize: 10.5, fontWeight: 700, opacity: 0.92 }}>
            Veritasium <VerifiedIcon style={{ width: 12, height: 12, color: '#8b5cf6' }} /> · {tr.phone.player.metaViews}
          </div>
          <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.3)', marginTop: 9 }}>
            <div style={{ height: '100%', width: `${progress * 100}%`, background: '#ff2b53', borderRadius: 4 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, marginTop: 4, opacity: 0.9 }}>
            <span>{`0:${String(playing ? cur : 0).padStart(2, '0')}`}</span>
            <span>0:52</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 999, background: 'rgba(34,197,94,0.16)', color: '#4ade80', fontSize: 12, fontWeight: 800 }}>
          <ShieldFilledIcon style={{ width: 15, height: 15 }} /> {tr.phone.player.approved}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CAP. 2 — Chat que enseña
   ============================================================ */
function ChatScreen({ t, tr }) {
  if (t < TL.chatIn - 0.1 || t > TL.cap2End + 0.5) return null;
  const QUERY = Array.from(tr.phone.chat.query);
  const inn = easeOut(interp(t, [TL.chatIn, TL.chatIn + 0.45], [0, 1]));
  const out = chapOut(t, TL.cap2End + 0.4, 0.4);
  const nChars = Math.round(interp(t, [TL.typeStart, TL.typeEnd], [0, QUERY.length]));
  const typedText = QUERY.slice(0, nChars).join('');
  const isTyping = t >= TL.typeStart && t < TL.send;
  const caret = Math.floor(t * 3.6) % 2 === 0 ? '▏' : '';

  const showUser = t >= TL.send;
  const userIn = easeOut(interp(t, [TL.send, TL.send + 0.5], [0, 1]));
  const botTyping = t >= TL.botTyping && t < TL.botText;
  const showBot = t >= TL.botText;
  const botIn = easeOut(interp(t, [TL.botText, TL.botText + 0.5], [0, 1]));
  const chipIn = easeOut(interp(t, [TL.ageChip, TL.ageChip + 0.4], [0, 1]));

  const bubbleTextStyle = { fontSize: 13, fontWeight: 600, lineHeight: 1.45 };

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#f4f1fb', opacity: out, transform: `translateX(${40 * (1 - inn)}px)`, zIndex: 3 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 14px 12px', background: '#faf8ff' }}>
        <span style={{ width: 32, height: 32, borderRadius: 11, flex: 'none', display: 'grid', placeItems: 'center', background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)' }}>
          <ArrowLeftIcon style={{ width: 17, height: 17 }} />
        </span>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>
            <SparkleIcon style={{ width: 17, height: 17, color: 'var(--violet)' }} /> {tr.phone.chat.title}
          </strong>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginTop: 2 }}>
            <ShieldFilledIcon style={{ width: 12, height: 12, color: 'var(--muted)' }} /> {tr.phone.chat.moderated}
          </div>
        </div>
        <span style={{ width: 34, height: 34, borderRadius: '50%', flex: 'none', background: 'linear-gradient(135deg, var(--violet-2), var(--teal))', border: '2px solid #fff', boxShadow: 'var(--sh-xs)' }} />
      </header>

      <div style={{ flex: 1, overflow: 'hidden', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {showUser && (
          <div style={{ alignSelf: 'flex-end', maxWidth: '86%', opacity: userIn, transform: `translateY(${(1 - userIn) * 12}px)` }}>
            <div style={{ background: 'var(--violet)', color: '#fff', border: '1px solid var(--violet-ink)', borderRadius: 18, borderBottomRightRadius: 6, padding: '11px 14px', ...bubbleTextStyle }}>
              {tr.phone.chat.query}
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
          <div style={{ alignSelf: 'flex-start', display: 'flex', gap: 8, maxWidth: '92%', opacity: botIn, transform: `translateY(${(1 - botIn) * 12}px)` }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', background: '#fff', color: 'var(--violet)', boxShadow: 'var(--sh-xs)' }}><SparkleIcon style={{ width: 15, height: 15 }} /></span>
            <div style={{ background: '#fff', border: '1px solid #e6e1f4', borderRadius: 18, borderBottomLeftRadius: 6, padding: '12px 14px', boxShadow: 'var(--sh-xs)' }}>
              <p style={{ ...bubbleTextStyle, color: 'var(--ink)' }}>{tr.phone.chat.botText}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 9, opacity: chipIn }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 800, color: 'var(--violet-ink)', background: 'rgba(109,40,217,0.09)', padding: '3px 8px', borderRadius: 'var(--r-pill)' }}>
                  <ShieldFilledIcon style={{ width: 11, height: 11, color: 'var(--violet)' }} /> {tr.phone.chat.ageChip}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px 14px', background: '#fff', borderTop: '1px solid var(--line)' }}>
        <span style={{ flex: 1, background: '#f2eefc', borderRadius: 'var(--r-pill)', padding: '11px 16px', fontSize: 12.5, color: isTyping && typedText ? 'var(--ink)' : 'var(--muted)', fontWeight: 600 }}>
          {isTyping && typedText ? typedText + caret : tr.phone.chat.inputPlaceholder}
        </span>
        <button type="button" aria-label={tr.a11y.send} style={{ width: 40, height: 40, borderRadius: '50%', border: 'none', flex: 'none', background: 'var(--violet)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
          <SendIcon style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   CAP. 3 — Buscar imágenes (moderación visual)
   ============================================================ */
const IMG_TOP = 82;
const IMG_PAD = 16;
const IMG_GAP = 8;
const IMG_W = (SCREEN_W - IMG_PAD * 2 - IMG_GAP * 2) / 3; // 94
const IMG_GRADS = [
  'linear-gradient(135deg,#22c55e,#0d9488)', 'linear-gradient(135deg,#f59e0b,#f97316)', 'linear-gradient(135deg,#2f6bff,#22a6c9)',
  'linear-gradient(135deg,#8b5cf6,#6d28d9)', 'linear-gradient(135deg,#ef4444,#b91c1c)', 'linear-gradient(135deg,#14b8a6,#0e7490)',
  'linear-gradient(135deg,#f472b6,#db2777)', 'linear-gradient(135deg,#84cc16,#4d7c0f)', 'linear-gradient(135deg,#38bdf8,#2563eb)',
];
const IMG_EMOJI = ['🦕', '🦖', '🦴', '🌋', '🥚', '🌿', '🐊', '🦎', '🌊'];
const IMG_BLOCK_IDX = 4; // el del centro se bloquea

function ImagesScreen({ t, tr }) {
  if (t < TL.imgIn - 0.1 || t > TL.cap3End + 0.5) return null;
  const inn = easeOut(interp(t, [TL.imgIn, TL.imgIn + 0.45], [0, 1]));
  const out = chapOut(t, TL.cap3End + 0.4, 0.4);
  const scanning = t >= TL.imgScanStart && t <= TL.imgBlock + 0.4;
  const scanY = interp(t, [TL.imgScanStart, TL.imgBlock + 0.2], [IMG_TOP - 6, IMG_TOP + 3 * (IMG_W + IMG_GAP)]);
  const showCounter = interp(t, [TL.imgCounter, TL.imgCounter + 0.35], [0, 1]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#f6f5fb', opacity: out, transform: `scale(${0.98 + 0.02 * inn})`, zIndex: 4 }}>
      <SearchBar query={tr.phone.images.searchQuery} icon={<ImageIcon style={{ width: 17, height: 17 }} />} />

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {IMG_GRADS.map((g, i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = IMG_PAD + col * (IMG_W + IMG_GAP);
          const y = IMG_TOP + row * (IMG_W + IMG_GAP);
          const ap = easeOut(interp(t, [TL.imgIn + 0.1 + i * 0.04, TL.imgIn + 0.5 + i * 0.04], [0, 1]));
          const isBlocked = i === IMG_BLOCK_IDX;
          const blockOn = isBlocked ? interp(t, [TL.imgBlock, TL.imgBlock + 0.28], [0, 1]) : 0;
          const remove = isBlocked ? easeOut(interp(t, [TL.imgBlock + 0.5, TL.imgBlock + 0.9], [0, 1])) : 0;
          return (
            <div key={i} style={{ position: 'absolute', left: x, top: y, width: IMG_W, height: IMG_W, borderRadius: 14, overflow: 'hidden', background: g, display: 'grid', placeItems: 'center', fontSize: 30, opacity: ap * (1 - remove), transform: `scale(${(0.8 + 0.2 * ap) * (1 - 0.1 * remove)})` }}>
              <span aria-hidden="true" style={{ filter: isBlocked ? `blur(${3 * blockOn}px)` : 'none' }}>{IMG_EMOJI[i]}</span>
              {isBlocked && (
                <>
                  <span style={{ position: 'absolute', inset: 0, background: 'rgba(220,38,38,0.42)', opacity: blockOn }} />
                  <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: blockOn }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(180,25,25,0.95)', border: '2px solid #fff', display: 'grid', placeItems: 'center' }}><XIcon style={{ width: 13, height: 13, color: '#fff' }} /></span>
                  </span>
                  <span style={{ position: 'absolute', left: '50%', bottom: 5, transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: '#b4191a', color: '#fff', fontSize: 8.5, fontWeight: 800, padding: '2px 6px', borderRadius: 'var(--r-pill)', opacity: blockOn }}>{tr.phone.images.reason}</span>
                </>
              )}
            </div>
          );
        })}
        {scanning && (
          <div style={{ position: 'absolute', left: 12, right: 12, top: scanY, height: 3, borderRadius: 3, background: 'linear-gradient(90deg,transparent,var(--violet),transparent)', boxShadow: '0 0 14px 2px rgba(109,40,217,0.55)' }} />
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 20, display: 'flex', justifyContent: 'center', gap: 8, opacity: showCounter }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: 'var(--violet-ink)', background: 'rgba(109,40,217,0.1)', padding: '5px 11px', borderRadius: 'var(--r-pill)' }}>
            <ShieldFilledIcon style={{ width: 12, height: 12, color: 'var(--violet)' }} /> {tr.phone.images.reviewed}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: '#b4342f', background: 'rgba(220,38,38,0.1)', padding: '5px 11px', borderRadius: 'var(--r-pill)' }}>
            <XIcon style={{ width: 11, height: 11 }} /> {tr.phone.images.blocked}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   CAP. 4 — Cierre: resumen / tranquilidad
   ============================================================ */
const SUMMARY_TOPIC_EMOJI = ['🦕', '🌋', '🪐'];
const SUMMARY_STAT_ICONS = [<NoAdsIcon key="ads" />, <UsersOffIcon key="str" />, <ShieldFilledIcon key="mod" />];

function SummaryScreen({ t, tr }) {
  if (t < TL.sumIn - 0.1) return null;
  const inn = easeOut(interp(t, [TL.sumIn, TL.sumIn + 0.5], [0, 1]));
  const out = chapOut(t, TL.total, 0.4);
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#faf8ff,#efeafc)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', opacity: inn * out, zIndex: 5 }}>
      <div style={{ width: 66, height: 66, borderRadius: '50%', display: 'grid', placeItems: 'center', color: '#fff', background: 'linear-gradient(135deg, var(--violet-2), var(--teal))', boxShadow: 'var(--sh-violet)', transform: `scale(${0.7 + 0.3 * inn})` }}>
        <ShieldFilledIcon style={{ width: 32, height: 32 }} />
      </div>
      <p style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--muted)', marginTop: 16 }}>{tr.phone.summary.title}</p>
      <h4 style={{ fontSize: 21, fontWeight: 900, color: 'var(--ink)', marginTop: 3, textAlign: 'center', lineHeight: 1.15 }}>{tr.phone.summary.learned}</h4>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 16 }}>
        {tr.phone.summary.topics.map((topic, i) => {
          const chip = easeOut(interp(t, [TL.sumChips + i * 0.12, TL.sumChips + 0.4 + i * 0.12], [0, 1]));
          return (
            <span key={topic} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 800, color: 'var(--ink)', background: '#fff', border: '1.5px solid var(--line-2)', padding: '7px 13px', borderRadius: 'var(--r-pill)', boxShadow: 'var(--sh-xs)', opacity: chip, transform: `translateY(${(1 - chip) * 8}px)` }}>
              <span aria-hidden="true">{SUMMARY_TOPIC_EMOJI[i]}</span> {topic}
            </span>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 26 }}>
        {tr.phone.summary.stats.map((s, i) => {
          const st = easeOut(interp(t, [TL.sumStats + i * 0.12, TL.sumStats + 0.4 + i * 0.12], [0, 1]));
          return (
            <div key={s.l} style={{ flex: 1, background: '#fff', border: '1px solid var(--line-2)', borderRadius: 16, padding: '12px 8px', textAlign: 'center', boxShadow: 'var(--sh-xs)', opacity: st, transform: `translateY(${(1 - st) * 10}px)` }}>
              <span style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, margin: '0 auto', color: 'var(--violet)' }}>{SUMMARY_STAT_ICONS[i]}</span>
              <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--ink)', marginTop: 4 }}>{s.n}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', marginTop: 1 }}>{s.l}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Subtítulo por escena (timings acá, texto en el diccionario) ---------- */
const CAPTION_TIMES = [
  { from: 0.2, to: 2.2, i: 0 },
  { from: 2.2, to: 5.4, i: 1 },
  { from: 5.4, to: 7.8, i: 2 },
  { from: 7.8, to: 10.5, i: 3 },
  { from: 10.6, to: 14.2, i: 4 },
  { from: 14.2, to: 17.5, i: 5 },
  { from: 17.6, to: 22.5, i: 6 },
  { from: 22.6, to: TL.total, i: 7 },
];
function Caption({ t }) {
  const tr = useT();
  let cur = CAPTION_TIMES.find((c) => t >= c.from && t < c.to);
  if (!cur) {
    // en los micro-huecos de transición, mantené el último válido
    for (let k = CAPTION_TIMES.length - 1; k >= 0; k--) {
      if (t >= CAPTION_TIMES[k].from) { cur = CAPTION_TIMES[k]; break; }
    }
    if (!cur) cur = CAPTION_TIMES[0];
  }
  const local = t - cur.from;
  const opIn = interp(local, [0, 0.33], [0, 1]);
  const opOut = cur.to < TL.total ? interp(t, [cur.to - 0.3, cur.to], [1, 0]) : 1;
  const up = interp(local, [0, 0.4], [10, 0]);
  return (
    <div style={{ marginTop: 12, minHeight: 40, display: 'flex', justifyContent: 'center', padding: '0 12px' }}>
      <div style={{ opacity: Math.min(opIn, opOut), transform: `translateY(${up}px)`, background: 'var(--ink)', color: '#fff', padding: '10px 20px', borderRadius: 999, fontSize: 14.5, fontWeight: 800, boxShadow: 'var(--sh-md)', textAlign: 'center' }}>
        {tr.phone.captions[cur.i]}
      </div>
    </div>
  );
}

/* ---------- Puntos de capítulo ---------- */
function ChapterDots({ t }) {
  const active = t < TL.cap1End ? 0 : t < TL.cap2End ? 1 : t < TL.cap3End ? 2 : 3;
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
      {[0, 1, 2, 3].map((i) => (
        <span key={i} style={{ width: i === active ? 20 : 6, height: 6, borderRadius: 3, background: i === active ? 'var(--violet)' : '#d5cfe9', transition: 'width 0.3s ease, background 0.3s ease' }} />
      ))}
    </div>
  );
}

/* ---------- Marco del teléfono ---------- */
function Phone({ t, tr }) {
  return (
    <div style={{ position: 'relative', width: DESIGN_W, height: DESIGN_H, background: '#14103a', borderRadius: 46, padding: PHONE_PAD, boxShadow: 'var(--sh-lg), inset 0 0 0 2px rgba(255,255,255,0.06)' }}>
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', width: 120, height: 24, background: '#14103a', borderRadius: '0 0 16px 16px', zIndex: 3 }} />
      <div style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, background: 'linear-gradient(180deg,#faf8ff,#f2eefc)', borderRadius: 36, overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 22px 6px', fontSize: 12, fontWeight: 800, color: 'var(--ink)', zIndex: 10, position: 'relative' }}>
          <span>9:41</span>
          <span style={{ display: 'flex', gap: 3 }}>
            {[0, 1, 2].map((i) => <i key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ink)', opacity: 0.75, display: 'inline-block' }} />)}
          </span>
        </div>
        <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
          <VideoSearchScreen t={t} tr={tr} />
          <PlayerScreen t={t} tr={tr} />
          <ChatScreen t={t} tr={tr} />
          <ImagesScreen t={t} tr={tr} />
          <SummaryScreen t={t} tr={tr} />
        </div>
      </div>
    </div>
  );
}

/* ---------- Componente principal ---------- */
export default function PhoneDemo() {
  const tr = useT();
  const reduced = useReducedMotion();
  const wrapRef = useRef(null);
  const frameRef = useRef(-1);
  const [scale, setScale] = useState(1);

  // Hook de QA: ?demoT=3.2 congela el demo en ese segundo para screenshots.
  const forcedT = (() => {
    if (typeof window === 'undefined') return null;
    const v = new URLSearchParams(window.location.search).get('demoT');
    if (v == null) return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  })();
  const frozen = forcedT != null || reduced;
  // Con reduced-motion: cuadro fijo en el momento del bloqueo (lo más demostrativo).
  const [t, setT] = useState(forcedT != null ? forcedT : reduced ? 2.6 : 0);

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
    if (frozen) return;
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
          <Phone t={t} tr={tr} />
        </div>
      </div>
      <ChapterDots t={t} />
      <Caption t={t} />
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useAnimationFrame, useReducedMotion } from 'motion/react';
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
  SendIcon,
  CheckIcon,
  XIcon,
} from './icons';
import poster from '../assets/miniatura.jpg';
import dino1 from '../assets/dino-1.jpg';
import dino2 from '../assets/dino-2.jpg';
import dino3 from '../assets/dino-3.jpg';
import dino4 from '../assets/dino-4.jpg';
import dino5 from '../assets/dino-5.jpg';
import dino6 from '../assets/dino-6.jpg';
import { useT } from '../i18n/core';

/* ============================================================
   Demo animada del hero (React + Motion), todo en DOM/CSS.
   Recorrido: menú → chat → menú → imágenes → menú → contenidos.
   La moderación se ve en imágenes y contenidos: al bloquear algo,
   el resto se REACOMODA (reflow) para no dejar huecos. Loopea sola.
   ============================================================ */

const SCREEN_W = 330;
const SCREEN_H = 670;
const PHONE_PAD = 10;
const DESIGN_W = SCREEN_W + PHONE_PAD * 2; // 350
const DESIGN_H = SCREEN_H + PHONE_PAD * 2; // 690

// Línea de tiempo en segundos (loopea en TL.total).
// Regla: tras la última acción de una fase, ~500ms de hold y vuelve a home.
const TL = {
  // Menú 1 → Chat  (menú ~1.2s: la mitad, más dinámico)
  m1In: 0.2, m1Tap: 0.8, m1End: 1.4,
  chatIn: 1.4, cType0: 1.8, cType1: 2.7, cSend: 2.9, cBotTyping: 3.2, cBotText: 3.7, cAgeChip: 4.5, chatEnd: 5.4,
  // Menú 2 → Imágenes
  m2In: 5.5, m2Tap: 6.1, m2End: 6.7,
  imgIn: 6.7, imgScan: 7.5, imgBlock1: 8.3, imgBlock2: 9.2, imgCounter: 10.3, imgEnd: 11.2,
  // Menú 3 → Contenidos
  m3In: 11.3, m3Tap: 11.9, m3End: 12.5,
  artIn: 12.5, artScan: 13.5, artBlock: 14.5, artCounter: 15.6, artEnd: 16.5,
  // Menú 4 → Videos
  m4In: 16.6, m4Tap: 17.2, m4End: 17.8,
  vidIn: 17.8, vidScan: 18.8, vidBlock1: 19.6, vidBlock2: 20.5, vidBlock3: 21.4, vidCounter: 22.3,
  tapVideo: 23.1, playerIn: 23.7, playStart: 24.5, vidEnd: 26.0,
  total: 26.6,
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

// Progreso de "corrimiento" de un bloqueo (para el reflow).
const shift = (t, at) => easeOut(interp(t, [at + 0.35, at + 0.95], [0, 1]));
// Slot de reflow: cuántos lugares se corre el item i por los bloqueos previos.
function reflowSlot(i, t, blocks) {
  let s = i;
  for (const b of blocks) if (b.idx < i) s -= shift(t, b.at);
  return s;
}
// (col,row) de un slot en grilla; cw/rh = paso horizontal/vertical entre celdas.
function slotXY(slot, cfg) {
  const col = ((slot % cfg.cols) + cfg.cols) % cfg.cols;
  const row = Math.floor(slot / cfg.cols);
  return { x: cfg.pad + col * cfg.cw, y: cfg.top + row * cfg.rh };
}
function reflowXY(s, cfg) {
  const s0 = Math.floor(s + 1e-6);
  const f = s - s0;
  const a = slotXY(s0, cfg);
  if (f < 1e-4) return a;
  const b = slotXY(s0 + 1, cfg);
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f };
}

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

function SearchBar({ query, icon, back }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '4px 16px 0' }}>
      {back && <span style={{ width: 30, height: 30, borderRadius: 10, flex: 'none', display: 'grid', placeItems: 'center', background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)' }}><ArrowLeftIcon style={{ width: 16, height: 16 }} /></span>}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: '#fff', border: '1.5px solid #e4e0f4', borderRadius: 'var(--r-pill)', boxShadow: 'var(--sh-xs)' }}>
        <span style={{ color: 'var(--violet)', display: 'grid', placeItems: 'center' }}>{icon}</span>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)' }}>{query}</span>
      </div>
    </div>
  );
}

function ModPills({ t, at, reviewed, blocked }) {
  const op = interp(t, [at, at + 0.35], [0, 1]);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 18, display: 'flex', justifyContent: 'center', gap: 8, opacity: op }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: 'var(--violet-ink)', background: 'rgba(109,40,217,0.1)', padding: '5px 11px', borderRadius: 'var(--r-pill)' }}>
        <ShieldFilledIcon style={{ width: 12, height: 12, color: 'var(--violet)' }} /> {reviewed}
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: '#b4342f', background: 'rgba(220,38,38,0.1)', padding: '5px 11px', borderRadius: 'var(--r-pill)' }}>
        <XIcon style={{ width: 11, height: 11 }} /> {blocked}
      </span>
    </div>
  );
}

/* ============================================================
   MENÚ (pantalla de inicio) — aparece 3 veces y "tapea" una opción
   ============================================================ */
const HOME_OPT_ICONS = [<ChatIcon key="chat" />, <SearchIcon key="search" />, <ImageIcon key="image" />, <PlayIcon key="play" />];

function MenuScreen({ t, tr, from, to, tapAt, highlight }) {
  if (t < from - 0.1 || t > to + 0.35) return null;
  const inn = easeOut(interp(t, [from, from + 0.4], [0, 1]));
  const out = interp(t, [to - 0.3, to], [1, 0]);
  const opacity = Math.min(inn, out);
  const ringOp = interp(t, [tapAt - 0.35, tapAt - 0.12], [0, 1]) * interp(t, [to - 0.25, to], [1, 0]);
  const press = t < tapAt + 0.1 ? interp(t, [tapAt - 0.05, tapAt + 0.1], [1, 0.97]) : interp(t, [tapAt + 0.1, tapAt + 0.35], [0.97, 1]);

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: '#f6f5fb', opacity, zIndex: 2 }}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 0' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 900, fontSize: 20, color: 'var(--violet)' }}>
          <SparkleIcon style={{ width: 22, height: 22 }} /> Smarty
        </span>
        <span style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--violet-2), var(--teal))', border: '2px solid #fff', boxShadow: 'var(--sh-xs)' }} />
      </header>

      <div style={{ padding: '12px 20px 4px' }}>
        <h4 style={{ fontSize: 26, fontWeight: 900, color: 'var(--ink)' }}>{tr.phone.home.greeting} <span aria-hidden="true">👋</span></h4>
        <p style={{ fontSize: 14, color: 'var(--muted)', fontWeight: 700, marginTop: 3 }}>{tr.phone.home.prompt}</p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 11, padding: '12px 16px 0', minHeight: 0 }}>
        {tr.phone.home.opts.map((o, i) => {
          const isHi = i === highlight;
          const ap = easeOut(interp(t, [from + i * 0.05, from + 0.32 + i * 0.05], [0, 1]));
          return (
            <div key={o.t} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 13, background: '#fff', border: '1.5px solid #e2ddf1', borderRadius: 20, padding: '13px 14px', boxShadow: 'var(--sh-sm)', opacity: ap, transform: `translateY(${(1 - ap) * 10}px) scale(${isHi ? press : 1})`, transformOrigin: 'center' }}>
              <span style={{ width: 52, height: 52, borderRadius: 15, flex: 'none', display: 'grid', placeItems: 'center', background: 'rgba(109,40,217,0.10)', color: 'var(--violet)' }}>{HOME_OPT_ICONS[i]}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15.5, fontWeight: 900, color: 'var(--ink)' }}>{o.t}</p>
                <p style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)', marginTop: 3, lineHeight: 1.3 }}>{o.s}</p>
              </span>
              <span style={{ width: 38, height: 38, borderRadius: '50%', flex: 'none', display: 'grid', placeItems: 'center', background: 'rgba(109,40,217,0.08)', color: 'var(--violet)' }}>
                <ChevronIcon style={{ width: 18, height: 18, transform: 'rotate(-90deg)' }} />
              </span>
              {isHi && (
                <>
                  <div style={{ position: 'absolute', inset: -3, borderRadius: 22, border: '2px solid var(--violet)', boxShadow: '0 0 0 6px rgba(109,40,217,0.14)', opacity: ringOp, pointerEvents: 'none' }} />
                  <TapPulse t={t} at={tapAt} />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   CHAT que enseña
   ============================================================ */
function ChatScreen({ t, tr }) {
  if (t < TL.chatIn - 0.1 || t > TL.chatEnd + 0.5) return null;
  const QUERY = Array.from(tr.phone.chat.query);
  const inn = easeOut(interp(t, [TL.chatIn, TL.chatIn + 0.45], [0, 1]));
  const out = interp(t, [TL.chatEnd, TL.chatEnd + 0.4], [1, 0]);
  const nChars = Math.round(interp(t, [TL.cType0, TL.cType1], [0, QUERY.length]));
  const typedText = QUERY.slice(0, nChars).join('');
  const isTyping = t >= TL.cType0 && t < TL.cSend;
  const caret = Math.floor(t * 3.6) % 2 === 0 ? '▏' : '';

  const showUser = t >= TL.cSend;
  const userIn = easeOut(interp(t, [TL.cSend, TL.cSend + 0.5], [0, 1]));
  const botTyping = t >= TL.cBotTyping && t < TL.cBotText;
  const showBot = t >= TL.cBotText;
  const botIn = easeOut(interp(t, [TL.cBotText, TL.cBotText + 0.5], [0, 1]));
  const chipIn = easeOut(interp(t, [TL.cAgeChip, TL.cAgeChip + 0.4], [0, 1]));
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
   BUSCAR IMÁGENES — moderación + reflow (grilla 3×3)
   ============================================================ */
const IMG_W = (SCREEN_W - 32 - 16) / 3; // 94
const IMG_CFG = { top: 96, pad: 16, cols: 3, w: IMG_W, cw: IMG_W + 8, rh: IMG_W + 8 };
// 6 fotos reales de dinosaurios. Las 2 "intensas" (idx 1 y 4) se bloquean:
// se muestran BLUREADAS (censuradas) → marca roja + motivo → se eliminan → reflow.
const IMG_PHOTOS = [dino2, dino1, dino3, dino4, dino6, dino5];
const IMG_BLOCKS = [{ idx: 1, at: TL.imgBlock1, reason: 'age' }, { idx: 4, at: TL.imgBlock2, reason: 'violent' }];

function ImagesScreen({ t, tr }) {
  if (t < TL.imgIn - 0.1 || t > TL.imgEnd + 0.5) return null;
  const inn = easeOut(interp(t, [TL.imgIn, TL.imgIn + 0.45], [0, 1]));
  const out = interp(t, [TL.imgEnd, TL.imgEnd + 0.4], [1, 0]);
  const scanning = t >= TL.imgScan && t <= TL.imgBlock2 + 0.4;
  const scanY = interp(t, [TL.imgScan, TL.imgBlock2 + 0.2], [IMG_CFG.top - 6, IMG_CFG.top + 2 * IMG_CFG.rh]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#f6f5fb', opacity: out, transform: `scale(${0.98 + 0.02 * inn})`, zIndex: 4 }}>
      <SearchBar query={tr.phone.images.searchQuery} icon={<ImageIcon style={{ width: 17, height: 17 }} />} back />

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {IMG_PHOTOS.map((src, i) => {
          const block = IMG_BLOCKS.find((b) => b.idx === i);
          const ap = easeOut(interp(t, [TL.imgIn + 0.15 + i * 0.05, TL.imgIn + 0.55 + i * 0.05], [0, 1]));
          const pos = block ? slotXY(i, IMG_CFG) : reflowXY(reflowSlot(i, t, IMG_BLOCKS), IMG_CFG);
          const blockOn = block ? interp(t, [block.at, block.at + 0.28], [0, 1]) : 0;
          const remove = block ? easeOut(interp(t, [block.at + 0.5, block.at + 0.9], [0, 1])) : 0;
          const row = Math.floor(i / 3);
          const rowAt = TL.imgScan + row * 0.7 + 0.45;
          const checkOn = block ? 0 : interp(t, [rowAt, rowAt + 0.3], [0, 1]);
          return (
            <div key={i} style={{ position: 'absolute', left: pos.x, top: pos.y, width: IMG_CFG.w, height: IMG_CFG.w, borderRadius: 14, overflow: 'hidden', background: '#e6e1f4', opacity: ap * (1 - remove), transform: `scale(${(0.85 + 0.15 * ap) * (1 - 0.15 * remove)})` }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: block ? 'blur(9px) saturate(0.9)' : 'none', transform: block ? 'scale(1.15)' : 'none' }} />
              {!block && (
                <span style={{ position: 'absolute', left: 5, top: 5, width: 18, height: 18, borderRadius: '50%', background: 'var(--green)', border: '2px solid #fff', display: 'grid', placeItems: 'center', opacity: checkOn }}>
                  <CheckIcon style={{ width: 10, height: 10, color: '#fff' }} />
                </span>
              )}
              {block && (
                <>
                  <span style={{ position: 'absolute', inset: 0, background: 'rgba(20,15,54,0.28)' }} />
                  <span style={{ position: 'absolute', inset: 0, background: 'rgba(220,38,38,0.42)', opacity: blockOn }} />
                  <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', opacity: blockOn }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(180,25,25,0.95)', border: '2px solid #fff', display: 'grid', placeItems: 'center' }}><XIcon style={{ width: 13, height: 13, color: '#fff' }} /></span>
                  </span>
                  <span style={{ position: 'absolute', left: '50%', bottom: 5, transform: 'translateX(-50%)', whiteSpace: 'nowrap', background: '#b4191a', color: '#fff', fontSize: 8.5, fontWeight: 800, padding: '2px 6px', borderRadius: 'var(--r-pill)', opacity: blockOn }}>{tr.phone.images.reasons[block.reason]}</span>
                </>
              )}
            </div>
          );
        })}
        {scanning && (
          <div style={{ position: 'absolute', left: 12, right: 12, top: scanY, height: 3, borderRadius: 3, background: 'linear-gradient(90deg,transparent,var(--violet),transparent)', boxShadow: '0 0 14px 2px rgba(109,40,217,0.55)' }} />
        )}
        <ModPills t={t} at={TL.imgCounter} reviewed={tr.phone.images.reviewed} blocked={tr.phone.images.blocked} />
      </div>
    </div>
  );
}

/* ============================================================
   BUSCAR CONTENIDOS — artículos: moderación + reflow (lista)
   ============================================================ */
const ART_TOP = 92;
const ART_ROW_H = 78;
const ART_GRADS = ['linear-gradient(135deg,#f59e0b,#f97316)', 'linear-gradient(135deg,#2f6bff,#22a6c9)', 'linear-gradient(135deg,#8b5cf6,#6d28d9)', 'linear-gradient(135deg,#14b8a6,#0e7490)'];
const ART_EMOJI = ['🪐', '🌟', '🌌', '🔭'];
const ART_BLOCKS = [{ idx: 2, at: TL.artBlock }];
// 5 slots: 0,1 = good0,good1 · 2 = bloqueado · 3,4 = good2,good3
function ArticlesScreen({ t, tr }) {
  if (t < TL.artIn - 0.1 || t > TL.artEnd + 0.5) return null;
  const inn = easeOut(interp(t, [TL.artIn, TL.artIn + 0.45], [0, 1]));
  const out = interp(t, [TL.artEnd, TL.artEnd + 0.4], [1, 0]);
  const scanning = t >= TL.artScan && t <= TL.artBlock + 0.4;
  const scanY = interp(t, [TL.artScan, TL.artBlock + 0.2], [ART_TOP - 6, ART_TOP + 5 * ART_ROW_H]);
  const slots = [0, 1, 2, 3, 4];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#f6f5fb', opacity: out, transform: `translateX(${30 * (1 - inn)}px)`, zIndex: 5 }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 16px 8px' }}>
        <span style={{ width: 30, height: 30, borderRadius: 10, flex: 'none', display: 'grid', placeItems: 'center', background: '#fff', border: '1px solid var(--line-2)', color: 'var(--ink)' }}><ArrowLeftIcon style={{ width: 16, height: 16 }} /></span>
        <strong style={{ fontSize: 16, fontWeight: 900, color: 'var(--ink)' }}>{tr.phone.articles.title}</strong>
      </header>
      <SearchBar query={tr.phone.articles.searchQuery} icon={<SearchIcon style={{ width: 17, height: 17 }} />} />

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {slots.map((i) => {
          const block = ART_BLOCKS.find((b) => b.idx === i);
          const gi = i < 2 ? i : i - 1; // índice en la lista de buenos
          const art = block ? null : tr.phone.articles.list[gi];
          const y = block ? ART_TOP + i * ART_ROW_H : ART_TOP + reflowSlot(i, t, ART_BLOCKS) * ART_ROW_H;
          const ap = easeOut(interp(t, [TL.artIn + 0.15 + i * 0.05, TL.artIn + 0.55 + i * 0.05], [0, 1]));
          const blockOn = block ? interp(t, [block.at, block.at + 0.28], [0, 1]) : 0;
          const remove = block ? easeOut(interp(t, [block.at + 0.5, block.at + 0.9], [0, 1])) : 0;
          const checkOn = block ? 0 : interp(t, [TL.artScan + 0.5, TL.artScan + 0.8], [0, 1]);
          return (
            <div key={i} style={{ position: 'absolute', left: 16, top: y, width: SCREEN_W - 32, height: ART_ROW_H - 10, display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1px solid #e6e1f4', borderRadius: 16, padding: '10px 12px', boxShadow: 'var(--sh-xs)', opacity: ap * (1 - remove), transform: `scale(${1 - 0.06 * remove})` }}>
              <span style={{ position: 'relative', width: 50, height: 50, borderRadius: 12, flex: 'none', display: 'grid', placeItems: 'center', fontSize: 24, overflow: 'hidden', background: block ? 'linear-gradient(135deg,#c9d0dd,#9aa3b5)' : ART_GRADS[gi] }}>
                <span aria-hidden="true" style={{ filter: block ? `blur(${3 * blockOn}px)` : 'none' }}>{block ? '🚫' : ART_EMOJI[gi]}</span>
                {block && (
                  <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(180,25,25,0.5)', opacity: blockOn }}>
                    <XIcon style={{ width: 18, height: 18, color: '#fff' }} />
                  </span>
                )}
              </span>
              {block ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#b4342f' }}>{tr.phone.articles.reason}</span>
                  <span style={{ flex: 1, height: 8, borderRadius: 4, background: '#efe6e6' }} />
                </div>
              ) : (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 900, color: 'var(--ink)', lineHeight: 1.25, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{art.title}</p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', marginTop: 3 }}>{art.source} <VerifiedIcon style={{ width: 11, height: 11, color: 'var(--violet)' }} /></p>
                </div>
              )}
              {!block && (
                <span style={{ width: 22, height: 22, borderRadius: '50%', flex: 'none', background: 'var(--green)', display: 'grid', placeItems: 'center', opacity: checkOn }}>
                  <CheckIcon style={{ width: 12, height: 12, color: '#fff' }} />
                </span>
              )}
            </div>
          );
        })}
        {scanning && (
          <div style={{ position: 'absolute', left: 12, right: 12, top: scanY, height: 3, borderRadius: 3, background: 'linear-gradient(90deg,transparent,var(--violet),transparent)', boxShadow: '0 0 14px 2px rgba(109,40,217,0.55)' }} />
        )}
        <ModPills t={t} at={TL.artCounter} reviewed={tr.phone.articles.reviewed} blocked={tr.phone.articles.blocked} />
      </div>
    </div>
  );
}

/* ============================================================
   BUSCAR VIDEOS — moderación + reflow (grilla 2 col) → player
   ============================================================ */
const VID_CARD_W = (SCREEN_W - 32 - 10) / 2; // 144
const VID_CARD_H = 118;
const VID_CFG = { top: 90, pad: 16, cols: 2, cw: VID_CARD_W + 10, rh: VID_CARD_H + 12 };
const VID_GOOD_GRADS = ['linear-gradient(135deg,#f97316,#ef4444)', 'linear-gradient(135deg,#2f6bff,#22a6c9)', 'linear-gradient(135deg,#8b5cf6,#6d28d9)'];
const VID_GOOD_DUR = ['5:12', '6:40', '4:28'];
// slots 0,2,4 = buenos (gi 0,1,2) · 1,3,5 = bloqueados
const VID_CARDS = [
  { good: true, gi: 0 },
  { good: false, reason: 'violent', at: TL.vidBlock1 },
  { good: true, gi: 1 },
  { good: false, reason: 'clickbait', at: TL.vidBlock2 },
  { good: true, gi: 2 },
  { good: false, reason: 'ads', at: TL.vidBlock3 },
];
const VID_BLOCKS = VID_CARDS.map((c, i) => (c.good ? null : { idx: i, at: c.at })).filter(Boolean);

function VideoCard({ i, card, t, tr }) {
  const pos = card.good ? reflowXY(reflowSlot(i, t, VID_BLOCKS), VID_CFG) : slotXY(i, VID_CFG);
  const ap = easeOut(interp(t, [TL.vidIn + 0.15 + i * 0.06, TL.vidIn + 0.55 + i * 0.06], [0, 1]));
  const remove = card.good ? 0 : easeOut(interp(t, [card.at + 0.5, card.at + 0.9], [0, 1]));
  const blockOn = card.good ? 0 : interp(t, [card.at, card.at + 0.28], [0, 1]);
  const rowAt = TL.vidScan + Math.floor(i / 2) * 0.6 + 0.4;
  const checkOn = card.good ? interp(t, [rowAt, rowAt + 0.3], [0, 1]) : 0;

  return (
    <div style={{ position: 'absolute', left: pos.x, top: pos.y, width: VID_CARD_W, height: VID_CARD_H, opacity: ap * (1 - remove), transform: `scale(${1 - 0.12 * remove})`, transformOrigin: 'center' }}>
      <div style={{ position: 'relative', width: '100%', height: 74, borderRadius: 12, overflow: 'hidden', background: card.good ? VID_GOOD_GRADS[card.gi] : 'linear-gradient(135deg,#c9d0dd,#9aa3b5)' }}>
        {card.good ? (
          <>
            <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.42)', display: 'grid', placeItems: 'center' }}><PlayIcon style={{ width: 14, height: 14, color: '#fff' }} /></span>
            </span>
            <em style={{ position: 'absolute', right: 5, bottom: 5, fontStyle: 'normal', background: 'rgba(0,0,0,0.72)', color: '#fff', fontSize: 8.5, fontWeight: 800, padding: '1px 4px', borderRadius: 4 }}>{VID_GOOD_DUR[card.gi]}</em>
            <span style={{ position: 'absolute', left: 5, top: 5, width: 20, height: 20, borderRadius: '50%', background: 'var(--green)', border: '2px solid #fff', display: 'grid', placeItems: 'center', opacity: checkOn, transform: `scale(${0.6 + 0.4 * checkOn})` }}>
              <CheckIcon style={{ width: 11, height: 11, color: '#fff' }} />
            </span>
          </>
        ) : (
          <>
            <span style={{ position: 'absolute', inset: 0, backdropFilter: 'blur(3px)', background: 'rgba(255,255,255,0.06)' }} />
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
  if (t < TL.vidIn - 0.1 || t > TL.playerIn + 0.5) return null;
  const inn = easeOut(interp(t, [TL.vidIn, TL.vidIn + 0.45], [0, 1]));
  const out = interp(t, [TL.playerIn, TL.playerIn + 0.4], [1, 0]);
  const scanning = t >= TL.vidScan && t <= TL.vidBlock3 + 0.4;
  const scanY = interp(t, [TL.vidScan, TL.vidBlock3 + 0.2], [VID_CFG.top - 6, VID_CFG.top + 3 * VID_CFG.rh]);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#f6f5fb', opacity: Math.min(inn, out), transform: `translateX(${30 * (1 - inn)}px)`, zIndex: 6 }}>
      <SearchBar query={tr.phone.videos.searchQuery} icon={<PlayIcon style={{ width: 17, height: 17 }} />} back />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {VID_CARDS.map((c, i) => <VideoCard key={i} i={i} card={c} t={t} tr={tr} />)}
        {scanning && (
          <div style={{ position: 'absolute', left: 12, right: 12, top: scanY, height: 3, borderRadius: 3, background: 'linear-gradient(90deg,transparent,var(--violet),transparent)', boxShadow: '0 0 14px 2px rgba(109,40,217,0.55)' }} />
        )}
        <ModPills t={t} at={TL.vidCounter} reviewed={tr.phone.videos.reviewed} blocked={tr.phone.videos.blocked} />
      </div>
    </div>
  );
}

function PlayerScreen({ t, tr }) {
  if (t < TL.playerIn - 0.1) return null;
  const inn = easeOut(interp(t, [TL.playerIn, TL.playerIn + 0.47], [0, 1]));
  const out = interp(t, [TL.vidEnd, TL.total], [1, 0]);
  const playing = t >= TL.playStart;
  const zoom = playing ? interp(t, [TL.playStart, TL.vidEnd], [1, 1.08]) : 1;
  const progress = interp(t, [TL.playStart, TL.vidEnd], [0, 0.14]);
  const cur = Math.floor(interp(t, [TL.playStart, TL.vidEnd], [0, 8]));

  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateY(${(1 - inn) * 100}%)`, background: '#0b0a1f', display: 'flex', flexDirection: 'column', color: '#fff', opacity: out, zIndex: 7 }}>
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

/* ---------- Subtítulo por escena (timings acá, texto en el diccionario) ---------- */
const CAPTION_TIMES = [
  { from: 0.3, to: 1.35, i: 0 },
  { from: 1.5, to: 2.9, i: 1 },
  { from: 2.9, to: 5.3, i: 2 },
  { from: 5.5, to: 6.7, i: 3 },
  { from: 6.8, to: 9.2, i: 4 },
  { from: 9.2, to: 11.2, i: 5 },
  { from: 11.3, to: 15.6, i: 6 },
  { from: 15.6, to: 16.5, i: 7 },
  { from: 16.6, to: 21.4, i: 8 },
  { from: 21.4, to: 23.7, i: 9 },
  { from: 23.7, to: TL.total, i: 10 },
];
function Caption({ t }) {
  const tr = useT();
  let cur = CAPTION_TIMES.find((c) => t >= c.from && t < c.to);
  if (!cur) {
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

/* ---------- Puntos de capítulo (4 features) ---------- */
function ChapterDots({ t }) {
  const active = t < TL.m2In ? 0 : t < TL.m3In ? 1 : t < TL.m4In ? 2 : 3;
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
          <MenuScreen t={t} tr={tr} from={TL.m1In} to={TL.m1End} tapAt={TL.m1Tap} highlight={0} />
          <ChatScreen t={t} tr={tr} />
          <MenuScreen t={t} tr={tr} from={TL.m2In} to={TL.m2End} tapAt={TL.m2Tap} highlight={2} />
          <ImagesScreen t={t} tr={tr} />
          <MenuScreen t={t} tr={tr} from={TL.m3In} to={TL.m3End} tapAt={TL.m3Tap} highlight={1} />
          <ArticlesScreen t={t} tr={tr} />
          <MenuScreen t={t} tr={tr} from={TL.m4In} to={TL.m4End} tapAt={TL.m4Tap} highlight={3} />
          <VideoSearchScreen t={t} tr={tr} />
          <PlayerScreen t={t} tr={tr} />
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

  // Hook de QA: ?demoT=13.2 congela el demo en ese segundo para screenshots.
  const forcedT = (() => {
    if (typeof window === 'undefined') return null;
    const v = new URLSearchParams(window.location.search).get('demoT');
    if (v == null) return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  })();
  const frozen = forcedT != null || reduced;
  // Con reduced-motion: cuadro fijo en el reflow de imágenes (lo más demostrativo).
  const [t, setT] = useState(forcedT != null ? forcedT : reduced ? 10.4 : 0);

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

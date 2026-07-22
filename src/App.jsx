import { useEffect } from 'react';
import { BRAND } from './config';
import { useT } from './i18n/core';
import { LangSwitch } from './i18n/index.jsx';
import Mascot from './components/Mascot';
import { PhoneFrame, ScreenChat, ScreenVideos } from './components/AppScreens';
import PhoneDemo from './components/PhoneDemo';
import RegisterButton from './components/RegisterButton';
import {
  PlayIcon,
  SearchIcon,
  SparkleIcon,
  HeartIcon,
  ShieldIcon,
  ShieldFilledIcon,
  CheckIcon,
  XIcon,
  EyeOffIcon,
  AlertIcon,
  BatteryLowIcon,
  CpuIcon,
  NoAdsIcon,
  UsersOffIcon,
  SlidersIcon,
  ChevronIcon,
} from './components/icons';
import { sendMetaEvent } from './metaEventSender';
import { MetaEvent } from './metaEventsTypes';
import { completeRedirectSignIn } from './registerWithGoogle';
import SuccessModal from './components/SuccessModal';

const NCES_URL = 'https://nces.ed.gov/programs/coe/indicator/tgk';

/* Anima elementos .reveal cuando entran en viewport. */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ============================================================ NAVBAR */
function Navbar() {
  const t = useT();
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a className="brand" href="#top">
          <Mascot className="owl-badge" />
          Smarty
        </a>
        <nav className="nav-links">
          <a href="#problema">{t.nav.problem}</a>
          <a href="#solucion">{t.nav.solution}</a>
          <a href="#como">{t.nav.how}</a>
          <a href="#faq">{t.nav.faq}</a>
        </nav>
        <div className="nav-cta">
          <LangSwitch />
          <RegisterButton source="navbar" />
        </div>
      </div>
    </header>
  );
}

/* ============================================================ HERO */
function Hero() {
  const t = useT();
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">
            <ShieldIcon /> <div style={{ display: 'flex', width: '100%', textAlign: 'center', flexDirection: 'column', justifyContent: 'center', gap: '0px' }}><div>{t.hero.eyebrow1}</div> <div>{t.hero.eyebrow2}</div>  </div>
          </span>
          <h1 style={{ fontSize: '2.0rem', margin: '0', marginTop: '2rem' }}>
            {t.hero.title1}{' '}
          </h1>
          <h1 style={{ fontSize: '2.0rem', margin: '0', marginTop: '0.5rem' }}>{t.hero.title2pre}<span className="mark">{t.hero.title2mark}</span>{t.hero.title2post}</h1>
          <p className="hero-sub">
            {t.hero.subA}<b>{t.hero.subB}</b>{t.hero.subC}
          </p>
          <div className="hero-actions">
            <RegisterButton source="hero" />
            <a className="btn btn-ghost" href="#solucion">
              {t.hero.seeHow}
            </a>
          </div>
          <div className="hero-trust">
            <ShieldFilledIcon style={{ width: 26, height: 26, color: 'var(--green)', flex: 'none' }} />
            <div className="t-copy">
              <b>{t.hero.trust}</b>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <span className="halo" aria-hidden="true" />
          <PhoneDemo />
        </div>
      </div>
    </section>
  );
}

/* ============================================================ GARANTÍAS */
const guaranteeIcons = [<CpuIcon key="cpu" />, <NoAdsIcon key="noads" />, <UsersOffIcon key="users" />, <SlidersIcon key="sliders" />];

function Guarantees() {
  const t = useT();
  return (
    <section className="guarantees">
      <div className="container">
        {t.guarantees.map((text, i) => (
          <span className="guarantee" key={i}>
            {guaranteeIcons[i]}
            {text}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ PROBLEMA + DATO */
const painIcons = [<EyeOffIcon key="eyeoff" />, <AlertIcon key="alert" />, <BatteryLowIcon key="battery" />];

function Problem() {
  const t = useT();
  return (
    <section className="section problem" id="problema">
      <div className="container">
        <div className="stat-feature reveal">
          <div className="stat-big">
            <div className="num">{t.problem.statNum}</div>
            <div className="cap">
              {t.problem.statCap}
            </div>
            <div className="src">
              {t.problem.srcLabel}
              <a href={NCES_URL} target="_blank" rel="noopener noreferrer">
                {t.problem.srcLink}
              </a>
            </div>
          </div>
          <div className="stat-copy">
            <span className="eyebrow"><AlertIcon /> {t.problem.eyebrow}</span>
            <h2>{t.problem.h2}</h2>
            <p>{t.problem.p1}</p>
            <p className="pull">{t.problem.pull}</p>
          </div>
        </div>

        <div className="pain-grid">
          {t.problem.pains.map((p, i) => (
            <div className={`pain-card reveal d${i + 1}`} key={i}>
              <div className="pico">{painIcons[i]}</div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ SOLUCIÓN / RECORRIDO */
const walkMeta = [
  { id: 'chat', icon: <SparkleIcon />, screen: <ScreenChat />, reverse: false },
  { id: 'videos', icon: <PlayIcon />, screen: <ScreenVideos />, reverse: true },
];

function Walkthrough() {
  const t = useT();
  return (
    <section className="section walk" id="solucion">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow"><SparkleIcon /> {t.walk.eyebrow}</span>
          <h2>{t.walk.h2}</h2>
          <p>{t.walk.p}</p>
        </div>

        {walkMeta.map((w, i) => {
          const item = t.walk.items[i];
          return (
            <div className={`walk-row ${w.reverse ? 'rev' : ''} reveal`} key={w.id}>
              <div className="walk-copy">
                <span className="walk-chip">{w.icon} {item.chip}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <ul className="walk-list">
                  {item.bullets.map((b) => (
                    <li key={b}><CheckIcon /> {b}</li>
                  ))}
                </ul>
              </div>
              <div className="walk-phone">
                <span className="walk-glow" aria-hidden="true" />
                <PhoneFrame label={`${t.walk.frameLabelPrefix}${item.chip}`}>
                  {w.screen}
                </PhoneFrame>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================ CÓMO FUNCIONA (pipeline) */
const pipelineIcons = [<SearchIcon key="search" />, <CpuIcon key="cpu" />, <ShieldFilledIcon key="shield" />];

function HowItWorks() {
  const t = useT();
  return (
    <section className="section how" id="como">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow"><CpuIcon /> {t.how.eyebrow}</span>
          <h2>{t.how.h2}</h2>
          <p>{t.how.p}</p>
        </div>

        <div className="pipeline">
          {t.how.steps.map((s, i) => (
            <div className={`pipe reveal d${i + 1}`} key={i}>
              <span className="pipe-ico">{pipelineIcons[i]}</span>
              <span className="pipe-num">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ COMPARATIVA */
function Compare() {
  const t = useT();
  return (
    <section className="section compare">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow"><ShieldIcon /> {t.compare.eyebrow}</span>
          <h2>{t.compare.h2}</h2>
          <p>{t.compare.p}</p>
        </div>

        <div className="compare-table reveal">
          <div className="compare-row compare-head">
            <div className="compare-cell c-feature">{t.compare.headFeature}</div>
            <div className="compare-cell c-smarty">
              <Mascot className="owl-badge" /> Smarty
            </div>
            <div className="compare-cell c-other">{t.compare.headOther}</div>
          </div>
          {t.compare.rows.map((r) => (
            <div className="compare-row" key={r}>
              <div className="compare-cell c-feature">{r}</div>
              <div className="compare-cell c-smarty">
                <span className="yes"><CheckIcon /></span>
              </div>
              <div className="compare-cell c-other">
                <span className="no"><XIcon /></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ BANDA DE CONFIANZA */
function TrustBand() {
  const t = useT();
  return (
    <section className="trust-band">
      <div className="container">
        <h2 className="reveal">
          {t.trust.h2pre}<span className="lo-bueno">{t.trust.h2good}</span>{t.trust.h2mid}
          <span className="lo-malo">{t.trust.h2bad}</span>
        </h2>
        <p className="tb-sub reveal">{t.trust.sub}</p>
        <div className="trust-stats reveal">
          {t.trust.stats.map((s, i) => (
            <div className="trust-stat" key={i}>
              <div className="n">{s.n}</div>
              <div className="l">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ FAQ */
function Faq() {
  const t = useT();
  return (
    <section className="section faq" id="faq">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow"><HeartIcon /> {t.faq.eyebrow}</span>
          <h2>{t.faq.h2}</h2>
          <p>{t.faq.p}</p>
        </div>
        <div className="faq-list reveal">
          {t.faq.items.map((f) => (
            <details className="faq-item" key={f.q}>
              <summary>
                {f.q}
                <ChevronIcon className="chev" />
              </summary>
              <div className="faq-body">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================ CTA FINAL */
function FinalCTA() {
  const t = useT();
  return (
    <section className="section final-cta">
      <div className="container">
        <div className="cta-card reveal">
          <Mascot className="owl-badge" />
          <h2>{t.finalCta.h2}</h2>
          <p>{t.finalCta.p}</p>
          <RegisterButton source="final-cta" />
        </div>
      </div>
    </section>
  );
}

/* ============================================================ FOOTER */
function Footer() {
  const t = useT();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <a className="brand" href="#top">
              <Mascot className="owl-badge" />
              Smarty
            </a>
            <p className="foot-tag">{t.footer.tag}</p>
          </div>
          <nav className="footer-links">
            <a href="#problema">{t.nav.problem}</a>
            <a href="#solucion">{t.nav.solution}</a>
            <a href="#como">{t.nav.how}</a>
            <a href="#faq">{t.nav.faq}</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {BRAND.name}. {t.brand.tagline}.
          </span>
          <span>
            {t.footer.dataPrefix}
            <a href={NCES_URL} target="_blank" rel="noopener noreferrer">
              {t.footer.dataLink}
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ============================================================ APP */
export default function App() {
  useReveal();

  useEffect(() => {
    const eventId = crypto.randomUUID();

    fbq('track', 'PageView', {}, { eventID: eventId });
    fbq('track', 'ViewContent', {}, { eventID: eventId });

    sendMetaEvent(MetaEvent.ViewContent, eventId);
  }, []);

  // Completa el registro si volvimos de un signInWithRedirect (fallback
  // cuando el navegador bloqueó el popup de Google).
  useEffect(() => {
    completeRedirectSignIn().catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Guarantees />
        <Problem />
        <Walkthrough />
        <HowItWorks />
        <Compare />
        <TrustBand />
        <Faq />
        <FinalCTA />
      </main>
      <Footer />
      <SuccessModal />
    </>
  );
}

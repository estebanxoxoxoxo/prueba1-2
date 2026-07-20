import { useEffect } from 'react';
import { BRAND } from './config';
import Mascot from './components/Mascot';
import WhatsAppButton, { WhatsAppFloat } from './components/WhatsAppButton';
import {
  PlayIcon,
  ImageIcon,
  SearchIcon,
  HeartIcon,
  ShieldIcon,
  CheckIcon,
} from './components/icons';
import { sendMetaEvent } from './metaEventSender';
import { MetaEvent } from './metaEventsTypes';

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
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function Navbar() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a className="brand" href="#top">
          <Mascot className="owl-badge" />
          Smarty
        </a>
        <nav className="nav-links">
          <a href="#problema">El problema</a>
          <a href="#solucion">La solución</a>
          <a href="#como">Cómo funciona</a>
        </nav>
        <div className="nav-cta">
          <WhatsAppButton>Hablar con nosotros</WhatsAppButton>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">
            <ShieldIcon style={{ width: 15, height: 15 }} /> Internet seguro para niños
          </span>
          <h1>
            Cuida a tu hijo de la{' '}
            <span className="mark">basura de internet</span>
          </h1>
          <p className="hero-sub">
            Hacerlo solo es <b>agotador y frustrante</b>. Smarty es la única app
            donde tu hijo disfruta imágenes, contenido y videos{' '}
            <b>100% moderados</b>. Todo lo bueno, nada de lo malo.
          </p>
          <div className="hero-actions">
            <WhatsAppButton>Contactar por WhatsApp</WhatsAppButton>
            <a className="btn btn-ghost" href="#solucion">
              Ver cómo funciona
            </a>
          </div>
          <div className="hero-trust">
            <span className="stars">★★★★★</span>
            <span>Pensada por y para familias</span>
          </div>
        </div>

        <div className="hero-visual">
          <span className="float-ico fi-1"><PlayIcon /></span>
          <span className="float-ico fi-2"><ImageIcon /></span>
          <span className="float-ico fi-3"><SearchIcon /></span>
          <span className="float-ico fi-4"><HeartIcon /></span>

          <div className="hero-card">
            <div className="owl-stage">
              <span className="owl-glow" aria-hidden="true" />
              <Mascot className="hero-owl" />
              <span className="owl-shadow" aria-hidden="true" />
            </div>
            <h3>Una única app donde tu hijo puede</h3>
            <div className="chip-row">
              <span className="chip green"><PlayIcon /> imágenes</span>
              <span className="chip purple"><ImageIcon /> contenido</span>
              <span className="chip blue"><PlayIcon /> videos</span>
            </div>
            <div className="moderated-badge">
              <span className="dash" aria-hidden="true">〉〉</span>
              100% moderado
              <span className="dash" aria-hidden="true">〈〈</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const pains = [
  {
    ico: '😵‍💫',
    title: 'Vigilancia constante',
    text: 'Estar encima de cada video y cada búsqueda para que no aparezca nada inapropiado.',
  },
  {
    ico: '🔞',
    title: 'Contenido tóxico',
    text: 'Violencia, lenguaje adulto y basura que aparece de la nada, incluso en apps “para niños”.',
  },
  {
    ico: '😩',
    title: 'Culpa y agotamiento',
    text: 'Bloquear todo tampoco es la solución. Quieres que aprenda y se divierta, sin riesgos.',
  },
];

function Problem() {
  return (
    <section className="section problem" id="problema">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">El problema</span>
          <h2>Cuidar a tu hijo de la basura de internet es un trabajo agotador</h2>
          <p>Y no debería recaer solo sobre ti.</p>
        </div>
        <div className="pain-grid">
          {pains.map((p) => (
            <div className="pain-card reveal" key={p.title}>
              <div className="pico">{p.ico}</div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    color: 'var(--green)',
    icon: <PlayIcon />,
    title: 'Imágenes seguras',
    text: 'Un catálogo visual cuidado, sin sustos ni contenido para adultos.',
  },
  {
    color: 'var(--purple-2)',
    icon: <ImageIcon />,
    title: 'Contenido con propósito',
    text: 'Material que entretiene y enseña, filtrado para su edad.',
  },
  {
    color: 'var(--blue)',
    icon: <PlayIcon />,
    title: 'Videos moderados',
    text: 'Cada video pasa un control humano y automático antes de llegar a tu hijo.',
  },
];

function Features() {
  return (
    <section className="section features" id="solucion">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">La solución</span>
          <h2>Conoce a Smarty</h2>
          <p>Una única app, tres formas de disfrutar internet sin peligros.</p>
        </div>
        <div className="feat-grid">
          {features.map((f) => (
            <div className="feat-card reveal" key={f.title}>
              <div className="feat-ico" style={{ background: f.color }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const steps = [
  {
    title: 'Descarga Smarty',
    text: 'Instala la app y crea el perfil de tu hijo en menos de 2 minutos.',
  },
  {
    title: 'Todo llega filtrado',
    text: 'Imágenes, contenido y videos pasan por moderación antes de mostrarse.',
  },
  {
    title: 'Tú, tranquilo',
    text: 'Tu hijo explora y aprende mientras tú dejas de vigilar cada pantalla.',
  },
];

function HowItWorks() {
  return (
    <section className="section how" id="como">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow">Cómo funciona</span>
          <h2>Seguro en 3 pasos</h2>
          <p>Sin configuraciones complicadas ni conocimientos técnicos.</p>
        </div>
        <div className="steps">
          {steps.map((s) => (
            <div className="step reveal" key={s.title}>
              <div className="num" />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustBand() {
  return (
    <section className="trust-band">
      <div className="container">
        <h2 className="reveal">
          <HeartIcon style={{ width: 30, height: 30, verticalAlign: '-4px', color: 'var(--pink)' }} />{' '}
          Todo <span className="lo-bueno">lo bueno</span> de internet, nada de{' '}
          <span className="lo-malo">lo malo</span>
        </h2>
        <div className="trust-stats">
          <div className="trust-stat">
            <div className="n">100%</div>
            <div className="l">Contenido moderado</div>
          </div>
          <div className="trust-stat">
            <div className="n">0</div>
            <div className="l">Sustos inesperados</div>
          </div>
          <div className="trust-stat">
            <div className="n">3</div>
            <div className="l">Formatos: imagen, contenido y video</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="section final-cta">
      <div className="container">
        <div className="cta-card reveal">
          <Mascot className="owl-badge" />
          <h2>Dale a tu hijo un internet sin basura</h2>
          <p>
            Escríbenos por WhatsApp y te contamos cómo empezar con Smarty hoy
            mismo. Sin compromiso.
          </p>
          <WhatsAppButton>Contactar por WhatsApp</WhatsAppButton>
          <div className="cta-note">
            <CheckIcon style={{ width: 14, height: 14, verticalAlign: '-2px' }} />{' '}
            Respuesta rápida de una persona real.
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <a className="brand" href="#top">
            <Mascot className="owl-badge" />
            Smarty
          </a>
          <nav className="footer-links">
            <a href="#problema">El problema</a>
            <a href="#solucion">La solución</a>
            <a href="#como">Cómo funciona</a>
          </nav>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline}.
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  useReveal();

  useEffect(()=>{
    const eventId = crypto.randomUUID();

    fbq("track", "PageView", {}, { eventID: eventId });
    fbq("track", "ViewContent", {}, { eventID: eventId });

    sendMetaEvent(MetaEvent.PageView, eventId)
    sendMetaEvent(MetaEvent.ViewContent, eventId)  
  },[])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <TrustBand />
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}

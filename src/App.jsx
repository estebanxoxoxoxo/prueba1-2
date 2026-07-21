import { useEffect } from 'react';
import { BRAND } from './config';
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
          <a href="#faq">Preguntas</a>
        </nav>
        <div className="nav-cta">
          <RegisterButton source="navbar">Registrarse</RegisterButton>
        </div>
      </div>
    </header>
  );
}

/* ============================================================ HERO */
function Hero() {
  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">
            <ShieldIcon /> <div style={{ display: 'flex', width: '100%', textAlign: 'center', flexDirection: 'column', justifyContent: 'center', gap: '0px' }}><div>Internet seguro</div> <div>Niños de 6 a 13 años</div>  </div>
          </span>
          <h1 style={{ fontSize: '2.0rem', margin: '0', marginTop: '2rem' }}>
            Máxima libertad para aprender.{' '}
          </h1>
          <h1 style={{ fontSize: '2.0rem', margin: '0', marginTop: '0.5rem' }}>Máxima <span className="mark">tranquilidad</span> para vos.</h1>
          <p className="hero-sub">
            Cuando tu hijo busca un video, una imagen o un tema, Smarty rastrea
            internet, <b>analiza cada resultado</b> y solo le muestra lo
            apropiado. Todo el conocimiento, sin que tengas que revisar nada.
          </p>
          <div className="hero-actions">
            <RegisterButton source="hero">Registrarse</RegisterButton>
            <a className="btn btn-ghost" href="#solucion">
              Ver cómo funciona
            </a>
          </div>
          <div className="hero-trust">
            <ShieldFilledIcon style={{ width: 26, height: 26, color: 'var(--green)', flex: 'none' }} />
            <div className="t-copy">
              <b>Diseñada para familias que quieren proteger la integridad de sus hijos de 6 a 13 años."
</b>
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
const guarantees = [
  { icon: <CpuIcon />, text: 'Moderación automática' },
  { icon: <NoAdsIcon />, text: 'Sin anuncios' },
  { icon: <UsersOffIcon />, text: 'Sin chats con extraños' },
  { icon: <SlidersIcon />, text: 'Contenido por edad' },
];

function Guarantees() {
  return (
    <section className="guarantees">
      <div className="container">
        {guarantees.map((g) => (
          <span className="guarantee" key={g.text}>
            {g.icon}
            {g.text}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ PROBLEMA + DATO */
const pains = [
  {
    ico: <EyeOffIcon />,
    title: 'El filtro sos vos',
    text: 'Revisar cada video, cada búsqueda y cada imagen para que no aparezca nada inapropiado. Un trabajo que no termina nunca.',
  },
  {
    ico: <AlertIcon />,
    title: 'Por tu miedo, aprende menos',
    text: 'Para protegerlo le limitás el acceso. Y se pierde justo lo bueno: todo el conocimiento que internet tiene para enseñarle.',
  },
  {
    ico: <BatteryLowIcon />,
    title: 'Nunca desconectás',
    text: 'Bloquear todo no alcanza y estar encima, tampoco. Querés que explore y aprenda, pero tranquilo.',
  },
];

function Problem() {
  return (
    <section className="section problem" id="problema">
      <div className="container">
        <div className="stat-feature reveal">
          <div className="stat-big">
            <div className="num">80%</div>
            <div className="cap">
              de las familias estan preocupadas por el entorno al que están expuestos sus hijos.
            </div>
            <div className="src">
              Fuente:{' '}
              <a href={NCES_URL} target="_blank" rel="noopener noreferrer">
                NCES · Condition of Education (2019)
              </a>
            </div>
          </div>
          <div className="stat-copy">
            <span className="eyebrow"><AlertIcon /> El problema</span>
            <h2>El instinto de proteger es real. El de que aprenda, también.</h2>
            <p>
              Cuidar lo que tu hijo ve en internet es agotador, y no debería
              recaer solo sobre vos. Pero bloquearlo todo tampoco es la solución:
              internet es también el lugar donde más puede aprender.
            </p>
            <p className="pull">
              El problema no es internet. Es no poder darle lo bueno sin
              exponerlo a lo malo.
            </p>
          </div>
        </div>

        <div className="pain-grid">
          {pains.map((p, i) => (
            <div className={`pain-card reveal d${i + 1}`} key={p.title}>
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

/* ============================================================ SOLUCIÓN / RECORRIDO */
const walk = [
  {
    id: 'chat',
    icon: <SparkleIcon />,
    chip: 'Chat con IA',
    title: 'Un chat con IA que además le enseña',
    text: 'Tu hijo pregunta lo que quiera y recibe respuestas seguras, a su nivel. Cuando pide un video o un artículo, Smarty se lo trae ya moderado.',
    bullets: ['Respuestas a su edad', 'Conversación siempre moderada', 'Le sugiere videos y artículos seguros'],
    screen: <ScreenChat />,
    reverse: false,
  },
  {
    id: 'videos',
    icon: <PlayIcon />,
    chip: 'Buscar videos',
    title: 'Busca videos de todo, ve solo lo bueno',
    text: 'Escribí cualquier tema y Smarty rastrea internet, analiza cada video y solo muestra los apropiados. Sin recomendaciones raras, sin sorpresas.',
    bullets: ['Rastrea y analiza en tiempo real', 'Canales educativos favoritos', 'Cero contenido inapropiado'],
    screen: <ScreenVideos />,
    reverse: true,
  },
];

function Walkthrough() {
  return (
    <section className="section walk" id="solucion">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow"><SparkleIcon /> La solución</span>
          <h2>Así se ve Smarty por dentro</h2>
          <p>
            Un solo entorno donde tu hijo accede a todo lo bueno de internet
            —chat, contenidos, imágenes y videos— siempre moderado.
          </p>
        </div>

        {walk.map((w) => (
          <div className={`walk-row ${w.reverse ? 'rev' : ''} reveal`} key={w.id}>
            <div className="walk-copy">
              <span className="walk-chip">{w.icon} {w.chip}</span>
              <h3>{w.title}</h3>
              <p>{w.text}</p>
              <ul className="walk-list">
                {w.bullets.map((b) => (
                  <li key={b}><CheckIcon /> {b}</li>
                ))}
              </ul>
            </div>
            <div className="walk-phone">
              <span className="walk-glow" aria-hidden="true" />
              <PhoneFrame label={`Pantalla de Smarty: ${w.chip}`}>
                {w.screen}
              </PhoneFrame>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================================ CÓMO FUNCIONA (pipeline) */
const pipeline = [
  {
    icon: <SearchIcon />,
    title: 'Tu hijo busca',
    text: 'Escribe un tema, una imagen o un video que quiere ver.',
  },
  {
    icon: <CpuIcon />,
    title: 'Smarty analiza todo',
    text: 'Rastrea internet y revisa automáticamente cada resultado antes de mostrar nada.',
  },
  {
    icon: <ShieldFilledIcon />,
    title: 'Solo ve lo apropiado',
    text: 'Lo bueno pasa; lo inapropiado se bloquea. Filtrado a su edad, en tiempo real.',
  },
];

function HowItWorks() {
  return (
    <section className="section how" id="como">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow"><CpuIcon /> Cómo funciona</span>
          <h2>Moderación automática, en tiempo real</h2>
          <p>En el mismo instante en que busca algo, Smarty ya lo analizó.</p>
        </div>

        <div className="pipeline">
          {pipeline.map((s, i) => (
            <div className={`pipe reveal d${i + 1}`} key={s.title}>
              <span className="pipe-ico">{s.icon}</span>
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
const compareRows = [
  'Contenido moderado por edad',
  'Acceso a todo el conocimiento',
  'Chat con IA seguro',
  'Sin anuncios ni recomendaciones raras',
  'Sin chats con extraños',
  'Sin que revises cada cosa',
];

function Compare() {
  return (
    <section className="section compare">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow"><ShieldIcon /> Por qué Smarty</span>
          <h2>Lo que cambia con Smarty</h2>
          <p>Frente al internet abierto o a las apps genéricas “para niños”.</p>
        </div>

        <div className="compare-table reveal">
          <div className="compare-row compare-head">
            <div className="compare-cell c-feature">Lo que importa</div>
            <div className="compare-cell c-smarty">
              <Mascot className="owl-badge" /> Smarty
            </div>
            <div className="compare-cell c-other">Internet abierto</div>
          </div>
          {compareRows.map((r) => (
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
  return (
    <section className="trust-band">
      <div className="container">
        <h2 className="reveal">
          Todo <span className="lo-bueno">lo bueno</span> de internet, nada de{' '}
          <span className="lo-malo">lo malo</span>
        </h2>
        <p className="tb-sub reveal">
          Para que tu hijo aprenda de todo, sin que veas nada que no querés que
          vea.
        </p>
        <div className="trust-stats reveal">
          <div className="trust-stat">
            <div className="n">100%</div>
            <div className="l">del contenido, analizado antes de mostrarse</div>
          </div>
          <div className="trust-stat">
            <div className="n">0</div>
            <div className="l">anuncios y chats con extraños</div>
          </div>
          <div className="trust-stat">
            <div className="n">6–13</div>
            <div className="l">años: la edad para la que está pensada</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ FAQ */
const faqs = [
  {
    q: '¿Desde qué edad es Smarty?',
    a: 'Está pensada para niños de 6 a 13 años. Los contenidos y el chat se adaptan a la edad que configures.',
  },
  {
    q: '¿Cómo se modera el contenido?',
    a: 'De forma automática: apenas tu hijo busca algo, Smarty rastrea internet y analiza cada búsqueda, imagen y video antes de mostrarlo. Nada aparece sin pasar por ese control.',
  },
  {
    q: '¿Tiene anuncios o recomienda cosas raras?',
    a: 'No. Sin anuncios y sin algoritmos diseñados para engancharlo a ver “una más”. Solo contenido que suma.',
  },
  {
    q: '¿Puede hablar con extraños?',
    a: 'No. Smarty es un entorno cerrado y seguro: tu hijo no queda expuesto a desconocidos.',
  },
  {
    q: '¿Reemplaza al control parental?',
    a: 'Es más simple que eso. En lugar de perseguir cada app y cada permiso, tu hijo tiene un único lugar seguro donde vos ponés las reglas.',
  },
  {
    q: '¿Cuándo está disponible y cuánto cuesta?',
    a: 'Está en desarrollo y muy avanzada. Tendrá suscripción mensual con prueba gratis. Escribinos por WhatsApp y te avisamos apenas esté lista, con todos los detalles.',
  },
];

function Faq() {
  return (
    <section className="section faq" id="faq">
      <div className="container">
        <div className="section-head reveal">
          <span className="eyebrow"><HeartIcon /> Preguntas frecuentes</span>
          <h2>Lo que las familias nos preguntan</h2>
          <p>Y si te queda alguna duda, escribinos por WhatsApp.</p>
        </div>
        <div className="faq-list reveal">
          {faqs.map((f) => (
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
  return (
    <section className="section final-cta">
      <div className="container">
        <div className="cta-card reveal">
          <Mascot className="owl-badge" />
          <h2>Dale un internet donde aprenda sin riesgos</h2>
          <p>
            Sumate a las familias que ya están esperando Smarty.
          </p>
          <RegisterButton source="final-cta">Registrarse</RegisterButton>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ FOOTER */
function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <a className="brand" href="#top">
              <Mascot className="owl-badge" />
              Smarty
            </a>
            <p className="foot-tag">
              Un entorno seguro para que los chicos de 6 a 13 años aprendan de
              todo lo bueno de internet, sin nada de lo malo.
            </p>
          </div>
          <nav className="footer-links">
            <a href="#problema">El problema</a>
            <a href="#solucion">La solución</a>
            <a href="#como">Cómo funciona</a>
            <a href="#faq">Preguntas</a>
          </nav>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {BRAND.name}. {BRAND.tagline}.
          </span>
          <span>
            Dato: 80% —{' '}
            <a href={NCES_URL} target="_blank" rel="noopener noreferrer">
              NCES, Condition of Education (2019)
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
    </>
  );
}

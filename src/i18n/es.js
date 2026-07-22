// ============================================================
//  Diccionario ES (idioma por defecto). Fuente de verdad del
//  texto actual de la landing. Mantener la MISMA forma que en.js.
//  Solo texto: iconos, colores, gradientes y timings viven en los
//  componentes. Rich-text (negritas/marcas) va partido en piezas.
// ============================================================

export default {
  meta: {
    lang: 'es',
    title: 'Smarty — Internet seguro para que tu hijo aprenda',
    description:
      'Smarty busca en todo internet, analiza cada resultado y solo le muestra a tu hijo lo apropiado. Todo el conocimiento, 100% moderado. Diseñada para familias que quieren proteger la integridad de sus hijos de 6 a 13 años.',
    ogTitle: 'Smarty — Todo lo bueno de internet para que aprenda. Nada de lo malo.',
    ogDescription:
      'El entorno seguro donde tu hijo accede a todo el conocimiento de internet —videos, imágenes y un chat con IA— 100% moderado. Sin que tengas que revisar nada.',
  },

  brand: {
    alt: 'Smarty, la mascota búho',
    tagline: 'Todo lo bueno de internet, nada de lo malo',
  },

  langSwitch: { label: 'Cambiar idioma', es: 'ES', en: 'EN' },

  a11y: { send: 'Enviar' },

  nav: {
    problem: 'El problema',
    solution: 'La solución',
    how: 'Cómo funciona',
    faq: 'Preguntas',
    register: 'Registrarse',
  },

  hero: {
    eyebrow1: 'Internet seguro',
    eyebrow2: 'Niños de 6 a 13 años',
    title1: 'Máxima libertad para aprender.',
    title2pre: 'Máxima ',
    title2mark: 'tranquilidad',
    title2post: ' para vos.',
    subA: 'Cuando tu hijo busca un video, una imagen o un tema, Smarty rastrea internet, ',
    subB: 'analiza cada resultado',
    subC: ' y solo le muestra lo apropiado. Todo el conocimiento, sin que tengas que revisar nada.',
    register: 'Registrarse',
    seeHow: 'Ver cómo funciona',
    trust: 'Diseñada para familias que quieren proteger la integridad de sus hijos de 6 a 13 años."',
  },

  guarantees: [
    'Moderación automática',
    'Sin anuncios',
    'Sin chats con extraños',
    'Contenido por edad',
  ],

  problem: {
    statNum: '80%',
    statCap: 'de las familias estan preocupadas por el entorno al que están expuestos sus hijos.',
    srcLabel: 'Fuente: ',
    srcLink: 'NCES · Condition of Education (2019)',
    eyebrow: 'El problema',
    h2: 'El instinto de proteger es real. El de que aprenda, también.',
    p1: 'Cuidar lo que tu hijo ve en internet es agotador, y no debería recaer solo sobre vos. Pero bloquearlo todo tampoco es la solución: internet es también el lugar donde más puede aprender.',
    pull: 'El problema no es internet. Es no poder darle lo bueno sin exponerlo a lo malo.',
    pains: [
      {
        title: 'El filtro sos vos',
        text: 'Revisar cada video, cada búsqueda y cada imagen para que no aparezca nada inapropiado. Un trabajo que no termina nunca.',
      },
      {
        title: 'Por tu miedo, aprende menos',
        text: 'Para protegerlo le limitás el acceso. Y se pierde justo lo bueno: todo el conocimiento que internet tiene para enseñarle.',
      },
      {
        title: 'Nunca desconectás',
        text: 'Bloquear todo no alcanza y estar encima, tampoco. Querés que explore y aprenda, pero tranquilo.',
      },
    ],
  },

  walk: {
    eyebrow: 'La solución',
    h2: 'Así se ve Smarty por dentro',
    p: 'Un solo entorno donde tu hijo accede a todo lo bueno de internet —chat, contenidos, imágenes y videos— siempre moderado.',
    frameLabelPrefix: 'Pantalla de Smarty: ',
    items: [
      {
        chip: 'Chat con IA',
        title: 'Un chat con IA que además le enseña',
        text: 'Tu hijo pregunta lo que quiera y recibe respuestas seguras, a su nivel. Cuando pide un video o un artículo, Smarty se lo trae ya moderado.',
        bullets: [
          'Respuestas a su edad',
          'Conversación siempre moderada',
          'Le sugiere videos y artículos seguros',
        ],
      },
      {
        chip: 'Buscar videos',
        title: 'Busca videos de todo, ve solo lo bueno',
        text: 'Escribí cualquier tema y Smarty rastrea internet, analiza cada video y solo muestra los apropiados. Sin recomendaciones raras, sin sorpresas.',
        bullets: [
          'Rastrea y analiza en tiempo real',
          'Canales educativos favoritos',
          'Cero contenido inapropiado',
        ],
      },
    ],
  },

  how: {
    eyebrow: 'Cómo funciona',
    h2: 'Moderación automática, en tiempo real',
    p: 'En el mismo instante en que busca algo, Smarty ya lo analizó.',
    steps: [
      { title: 'Tu hijo busca', text: 'Escribe un tema, una imagen o un video que quiere ver.' },
      {
        title: 'Smarty analiza todo',
        text: 'Rastrea internet y revisa automáticamente cada resultado antes de mostrar nada.',
      },
      {
        title: 'Solo ve lo apropiado',
        text: 'Lo bueno pasa; lo inapropiado se bloquea. Filtrado a su edad, en tiempo real.',
      },
    ],
  },

  compare: {
    eyebrow: 'Por qué Smarty',
    h2: 'Lo que cambia con Smarty',
    p: 'Frente al internet abierto o a las apps genéricas “para niños”.',
    headFeature: 'Lo que importa',
    headOther: 'Internet abierto',
    rows: [
      'Contenido moderado por edad',
      'Acceso a todo el conocimiento',
      'Chat con IA seguro',
      'Sin anuncios ni recomendaciones raras',
      'Sin chats con extraños',
      'Sin que revises cada cosa',
    ],
  },

  trust: {
    h2pre: 'Todo ',
    h2good: 'lo bueno',
    h2mid: ' de internet, nada de ',
    h2bad: 'lo malo',
    sub: 'Para que tu hijo aprenda de todo, sin que veas nada que no querés que vea.',
    stats: [
      { n: '100%', l: 'del contenido, analizado antes de mostrarse' },
      { n: '0', l: 'anuncios y chats con extraños' },
      { n: '6–13', l: 'años: la edad para la que está pensada' },
    ],
  },

  faq: {
    eyebrow: 'Preguntas frecuentes',
    h2: 'Lo que las familias nos preguntan',
    p: 'Y si te queda alguna duda, escribinos por WhatsApp.',
    items: [
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
    ],
  },

  finalCta: {
    h2: 'Dale un internet donde aprenda sin riesgos',
    p: 'Sumate a las familias que ya están esperando Smarty.',
    register: 'Registrarse',
  },

  footer: {
    tag: 'Un entorno seguro para que los chicos de 6 a 13 años aprendan de todo lo bueno de internet, sin nada de lo malo.',
    dataPrefix: 'Dato: 80% — ',
    dataLink: 'NCES, Condition of Education (2019)',
  },

  register: {
    cta: 'Registrarse',
    opening: 'Abriendo Google…',
    done: '¡Registrado!',
  },

  success: {
    eyebrow: 'Registro confirmado',
    titleNamedPre: '¡Listo, ',
    titleNamedPost: '!',
    titleAnon: '¡Ya estás en la lista!',
    text: 'Apenas Smarty esté disponible, te vamos a enviar un mail para que seas de los primeros en probarlo.',
    emailFallback: 'tu correo',
    ok: 'Perfecto',
    note: 'Revisá tu casilla (y el spam) cuando te escribamos.',
  },

  // "Video" animado del hero (PhoneDemo)
  phone: {
    nav: ['Inicio', 'Historial', 'Guardados', 'Ajustes'],
    home: {
      greeting: 'Hola, Alex',
      prompt: '¿Qué quieres descubrir hoy?',
      opts: [
        { t: 'Chat', s: 'Habla con Smarty sobre cualquier tema' },
        { t: 'Buscar contenidos', s: 'Encuentra información de la web' },
        { t: 'Buscar imágenes', s: 'Explora y descubre imágenes increíbles' },
        { t: 'Buscar videos', s: 'Encuentra y reproduce videos sobre lo que buscas' },
      ],
    },
    chat: {
      title: 'Chat con Smarty',
      moderated: 'Conversación moderada',
      query: '¿Me buscás un video sobre dinosaurios? 🦕',
      botIntro: '¡Genial! 🦖 Encontré uno buenísimo, seguro y ya aprobado para vos:',
      cardTitle: 'El mundo de los dinosaurios',
      views: '1.4 M visualizaciones',
      inputPlaceholder: 'Escribe tu mensaje…',
    },
    player: {
      playing: 'Reproduciendo',
      title: 'El mundo de los dinosaurios',
      metaViews: '1.4 M vistas',
      approved: 'Revisado y aprobado por Smarty',
    },
    captions: [
      'Tu hijo entra al chat',
      'Pide lo que quiera aprender',
      'Smarty lo busca y lo modera',
      'Solo contenido seguro y aprobado',
    ],
  },

  // Frames estáticos de la sección "La solución" (AppScreens)
  screens: {
    home: {
      greeting: 'Hola, Alex',
      prompt: '¿Qué quieres descubrir hoy?',
      opts: [
        { t: 'Chat', s: 'Habla de cualquier tema' },
        { t: 'Buscar contenidos', s: 'Información de la web' },
        { t: 'Buscar imágenes', s: 'Explora imágenes' },
        { t: 'Buscar videos', s: 'Mira videos y aprende' },
      ],
    },
    chat: {
      title: 'Chat con Smarty',
      moderated: 'Conversación moderada',
      q1: '¿Qué es la fotosíntesis?',
      a1p1: '¡Buena pregunta! 🌱 La fotosíntesis es el proceso que usan las plantas para producir su propio alimento.',
      a1p2: 'Usan la luz del sol, agua y dióxido de carbono para crear glucosa y liberar oxígeno.',
      q2: '¿Me recomiendas un video?',
      a2: '¡Claro! Aquí tienes uno seguro y fácil de entender:',
      vidTitle: 'La fotosíntesis explicada fácil',
      vidChannel: 'Smile and Learn',
      inputPlaceholder: 'Escribe tu mensaje…',
    },
    videos: {
      title: 'Buscar videos',
      searchPlaceholder: 'Buscar videos…',
      favChannels: 'Canales favoritos',
      seeAll: 'Ver todos',
      recommended: 'Recomendados para ti',
      list: [
        { t: '¿Qué hay dentro de la Tierra?', v: '1.2 M · hace 2 meses' },
        { t: 'El sistema solar para principiantes', v: '895 K · hace 3 meses' },
        { t: '¿Qué es la materia? Explicado fácil', v: '7.8 M · hace 6 meses' },
      ],
    },
  },
};

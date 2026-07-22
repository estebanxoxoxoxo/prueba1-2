// ============================================================
//  English dictionary. Must mirror es.js EXACTLY in shape.
//  Double-quoted strings so apostrophes need no escaping.
//  Proper nouns (channel names, "Smarty", "Veritasium") stay as-is.
// ============================================================

export default {
  meta: {
    lang: "en",
    title: "Smarty — Safe internet so your child learns",
    description:
      "Smarty searches the whole internet, analyzes every result and only shows your child what's appropriate. All the knowledge, 100% moderated. Built for families who want to protect the integrity of their 6-to-13-year-olds.",
    ogTitle: "Smarty — All the good of the internet to learn from. None of the bad.",
    ogDescription:
      "The safe space where your child accesses all of the internet's knowledge —videos, images and an AI chat— 100% moderated. Without you having to check a thing.",
  },

  brand: {
    alt: "Smarty, the owl mascot",
    tagline: "All the good of the internet, none of the bad",
  },

  langSwitch: { label: "Change language", es: "ES", en: "EN" },

  a11y: { send: "Send" },

  nav: {
    problem: "The problem",
    solution: "The solution",
    how: "How it works",
    faq: "FAQ",
    register: "Sign up",
  },

  hero: {
    eyebrow1: "Safe internet",
    eyebrow2: "Kids ages 6 to 13",
    title1: "Total freedom to learn.",
    title2pre: "Total ",
    title2mark: "peace of mind",
    title2post: " for you.",
    subA: "When your child searches for a video, an image or a topic, Smarty scans the internet, ",
    subB: "analyzes every result",
    subC: " and shows only what's appropriate. All the knowledge, without you having to check a thing.",
    register: "Sign up",
    seeHow: "See how it works",
    trust: "Built for families who want to protect the integrity of their 6-to-13-year-olds.",
  },

  guarantees: [
    "Automatic moderation",
    "No ads",
    "No chats with strangers",
    "Age-based content",
  ],

  problem: {
    statNum: "80%",
    statCap: "of families are worried about the environment their children are exposed to.",
    srcLabel: "Source: ",
    srcLink: "NCES · Condition of Education (2019)",
    eyebrow: "The problem",
    h2: "The instinct to protect is real. So is the one to let them learn.",
    p1: "Keeping track of what your child sees online is exhausting, and it shouldn't fall on you alone. But blocking it all isn't the answer either: the internet is also where they can learn the most.",
    pull: "The problem isn't the internet. It's not being able to give them the good without exposing them to the bad.",
    pains: [
      {
        title: "You are the filter",
        text: "Checking every video, every search and every image so nothing inappropriate slips through. A job that never ends.",
      },
      {
        title: "Out of fear, they learn less",
        text: "To protect them, you limit their access. And they miss out on exactly the good part: all the knowledge the internet has to teach them.",
      },
      {
        title: "You never switch off",
        text: "Blocking everything isn't enough, and hovering over them isn't either. You want them to explore and learn — but with peace of mind.",
      },
    ],
  },

  walk: {
    eyebrow: "The solution",
    h2: "This is what Smarty looks like inside",
    p: "A single space where your child gets everything good about the internet —chat, content, images and videos— always moderated.",
    frameLabelPrefix: "Smarty screen: ",
    items: [
      {
        chip: "AI chat",
        title: "An AI chat that teaches them too",
        text: "Your child asks whatever they want and gets safe answers, at their level. When they ask for a video or an article, Smarty brings it already moderated.",
        bullets: [
          "Answers for their age",
          "Always-moderated conversation",
          "Suggests safe videos and articles",
        ],
      },
      {
        chip: "Search videos",
        title: "Search for any video, watch only the good ones",
        text: "Type any topic and Smarty scans the internet, analyzes every video and shows only the appropriate ones. No weird recommendations, no surprises.",
        bullets: [
          "Scans and analyzes in real time",
          "Favorite educational channels",
          "Zero inappropriate content",
        ],
      },
    ],
  },

  how: {
    eyebrow: "How it works",
    h2: "Automatic moderation, in real time",
    p: "The very moment they search for something, Smarty has already analyzed it.",
    steps: [
      { title: "Your child searches", text: "They type a topic, an image or a video they want to see." },
      {
        title: "Smarty analyzes everything",
        text: "It scans the internet and automatically reviews every result before showing anything.",
      },
      {
        title: "They only see what's appropriate",
        text: "The good gets through; the inappropriate is blocked. Filtered for their age, in real time.",
      },
    ],
  },

  compare: {
    eyebrow: "Why Smarty",
    h2: "What changes with Smarty",
    p: "Compared to the open internet or generic “for kids” apps.",
    headFeature: "What matters",
    headOther: "Open internet",
    rows: [
      "Age-based moderated content",
      "Access to all knowledge",
      "Safe AI chat",
      "No ads or weird recommendations",
      "No chats with strangers",
      "Without you checking everything",
    ],
  },

  trust: {
    h2pre: "All ",
    h2good: "the good",
    h2mid: " of the internet, none of ",
    h2bad: "the bad",
    sub: "So your child can learn about everything, without you seeing anything you don't want them to see.",
    stats: [
      { n: "100%", l: "of content, analyzed before it's shown" },
      { n: "0", l: "ads and chats with strangers" },
      { n: "6–13", l: "the age range it's built for" },
    ],
  },

  faq: {
    eyebrow: "Frequently asked questions",
    h2: "What families ask us",
    p: "And if you still have any questions, message us on WhatsApp.",
    items: [
      {
        q: "What age is Smarty for?",
        a: "It's built for kids ages 6 to 13. The content and the chat adapt to the age you set.",
      },
      {
        q: "How is content moderated?",
        a: "Automatically: the moment your child searches for something, Smarty scans the internet and analyzes every search, image and video before showing it. Nothing appears without passing that check.",
      },
      {
        q: "Does it have ads or recommend weird stuff?",
        a: "No. No ads and no algorithms designed to hook them into “just one more.” Only content that adds value.",
      },
      {
        q: "Can they talk to strangers?",
        a: "No. Smarty is a closed, safe environment: your child is never exposed to strangers.",
      },
      {
        q: "Does it replace parental controls?",
        a: "It's simpler than that. Instead of chasing every app and every permission, your child has one safe place where you set the rules.",
      },
      {
        q: "When is it available and how much does it cost?",
        a: "It's in development and very far along. It'll have a monthly subscription with a free trial. Message us on WhatsApp and we'll let you know the moment it's ready, with all the details.",
      },
    ],
  },

  finalCta: {
    h2: "Give them an internet where they learn without risks",
    p: "Join the families already waiting for Smarty.",
    register: "Sign up",
  },

  footer: {
    tag: "A safe space for kids ages 6 to 13 to learn from everything good about the internet, with none of the bad.",
    dataPrefix: "Data: 80% — ",
    dataLink: "NCES, Condition of Education (2019)",
  },

  register: {
    cta: "Sign up",
    opening: "Opening Google…",
    done: "You're in!",
  },

  success: {
    eyebrow: "Registration confirmed",
    titleNamedPre: "You're in, ",
    titleNamedPost: "!",
    titleAnon: "You're on the list!",
    text: "As soon as Smarty is available, we'll send you an email so you're among the first to try it.",
    emailFallback: "your email",
    ok: "Perfect",
    note: "Check your inbox (and spam) when we reach out.",
  },

  phone: {
    nav: ["Home", "History", "Saved", "Settings"],

    captions: [
      "A complete space, built for them.",
      "Ask anything, without fear.",
      "Answers for their age, always moderated.",
      "And whatever they search, it moderates.",
      "It analyzes every image and blocks the inappropriate.",
      "It reshuffles and keeps only the good.",
      "Explore any topic. Every article, already reviewed.",
      "All the knowledge, with none of the bad.",
      "And it searches videos from all over the internet.",
      "It analyzes every video and drops what doesn't belong.",
      "Only the good: reviewed and ready to watch.",
    ],

    // Menu (home screen)
    home: {
      greeting: "Hi, Alex",
      prompt: "What do you want to discover today?",
      opts: [
        { t: "Chat", s: "Talk to Smarty about anything" },
        { t: "Search content", s: "Articles and info from the web" },
        { t: "Search images", s: "Explore safe images" },
        { t: "Search videos", s: "Moderated videos on anything" },
      ],
    },

    // A chat that teaches
    chat: {
      title: "Chat with Smarty",
      moderated: "Moderated conversation",
      query: "Why did the dinosaurs go extinct? 🦕",
      botText:
        "Great question! 🦖 About 66 million years ago, a huge meteorite hit the Earth and changed the climate. Many dinosaurs couldn't adapt.",
      ageChip: "Answer for age 8",
      inputPlaceholder: "Type your message…",
    },

    // Search images (visual moderation + reflow)
    images: {
      searchQuery: "dinosaurs",
      reasons: { age: "Not allowed", violent: "Violent" },
      reviewed: "9 reviewed",
      blocked: "2 blocked",
    },

    // Search content (articles: moderation + reflow)
    articles: {
      title: "Search content",
      searchQuery: "the solar system",
      reason: "Not allowed",
      reviewed: "12 reviewed",
      blocked: "1 blocked",
      list: [
        { title: "The solar system explained for kids", source: "Smile and Learn" },
        { title: "How many planets are there?", source: "National Geographic Kids" },
        { title: "Stars and galaxies", source: "BBC" },
        { title: "A journey to the center of the Sun", source: "Kids Encyclopedia" },
      ],
    },

    // Search videos (moderation + reflow) → player
    videos: {
      searchQuery: "dinosaurs 🦕",
      reasons: { violent: "Violent", clickbait: "Clickbait", ads: "Ad" },
      reviewed: "24 reviewed",
      blocked: "3 blocked",
      good: [
        { title: "The world of dinosaurs", channel: "Veritasium" },
        { title: "How did dinosaurs live?", channel: "Smile and Learn" },
        { title: "Dinosaurs for kids", channel: "Kurzgesagt" },
      ],
    },
    player: {
      playing: "Now playing",
      title: "The world of dinosaurs",
      metaViews: "1.4M views",
      approved: "Reviewed and approved by Smarty",
    },
  },

  screens: {
    home: {
      greeting: "Hi, Alex",
      prompt: "What do you want to discover today?",
      opts: [
        { t: "Chat", s: "Talk about anything" },
        { t: "Search content", s: "Information from the web" },
        { t: "Search images", s: "Explore images" },
        { t: "Search videos", s: "Watch videos and learn" },
      ],
    },
    chat: {
      title: "Chat with Smarty",
      moderated: "Moderated conversation",
      q1: "What is photosynthesis?",
      a1p1: "Great question! 🌱 Photosynthesis is the process plants use to make their own food.",
      a1p2: "They use sunlight, water and carbon dioxide to create glucose and release oxygen.",
      q2: "Can you recommend a video?",
      a2: "Of course! Here's a safe, easy-to-follow one:",
      vidTitle: "Photosynthesis made easy",
      vidChannel: "Smile and Learn",
      inputPlaceholder: "Type your message…",
    },
    videos: {
      title: "Search videos",
      searchPlaceholder: "Search videos…",
      favChannels: "Favorite channels",
      seeAll: "See all",
      recommended: "Recommended for you",
      list: [
        { t: "What's inside the Earth?", v: "1.2M · 2 months ago" },
        { t: "The solar system for beginners", v: "895K · 3 months ago" },
        { t: "What is matter? Explained simply", v: "7.8M · 6 months ago" },
      ],
    },
  },
};

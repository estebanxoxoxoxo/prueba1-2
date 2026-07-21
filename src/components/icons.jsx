// Iconos SVG reutilizables.
// Los de trazo usan stroke="currentColor"; los rellenos, fill="currentColor".
// Sistema visual consistente: trazo 2px, esquinas redondeadas, viewBox 24.

const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.7.2-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.6-.8-2.7-1.5-3.7-3.3-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5 0-.2-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 1.9.8 2.7.9 3.6.8.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3Z" />
    <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-2.9.8.8-2.8-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
  </svg>
);

export const PlayIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10.5-6.5a1 1 0 0 0 0-1.7L9.5 4.6A1 1 0 0 0 8 5.5Z" />
  </svg>
);

export const ImageIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="8.5" cy="9.5" r="1.6" fill="currentColor" stroke="none" />
    <path d="m4 18 5-5 4 4 3-3 4 4" />
  </svg>
);

export const SearchIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth="2.2" {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const HeartIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 21s-7-4.6-9.3-9C1.2 9 2.4 5.5 5.7 5c2-.3 3.6.8 4.3 2 .7-1.2 2.3-2.3 4.3-2 3.3.5 4.5 4 3 7-2.3 4.4-9.3 9-9.3 9Z" />
  </svg>
);

export const ShieldIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6l-7-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const ShieldFilledIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.5 4.5 5.6v5.1c0 4.9 3.2 8.4 7.5 9.8 4.3-1.4 7.5-4.9 7.5-9.8V5.6L12 2.5Zm-1 12.9-3.2-3.2 1.5-1.4L11 12.6l3.7-3.7 1.5 1.4-5.2 5.1Z" />
  </svg>
);

export const CheckIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth="3" {...props}>
    <path d="m5 13 4 4L19 7" />
  </svg>
);

export const StarIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="m12 2 2.9 6 6.6.6-5 4.3 1.5 6.5L12 16l-5.9 3.4L7.6 13l-5-4.3L9.1 8 12 2Z" />
  </svg>
);

/* ---------- Nuevos: problema / dolores ---------- */

export const EyeOffIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="M10.7 5.1A9.8 9.8 0 0 1 12 5c6 0 9.5 5.5 9.5 7 0 .6-.6 1.8-1.8 3M6.2 6.7C3.7 8.2 2.5 10.4 2.5 12c0 1.5 3.5 7 9.5 7 1.7 0 3.2-.4 4.4-1.1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="M3 3l18 18" />
  </svg>
);

export const AlertIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="M10.3 3.9 2.4 17.5A2 2 0 0 0 4.1 20.5h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

export const BatteryLowIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <rect x="2" y="7" width="16" height="10" rx="2.5" />
    <path d="M22 11v2" />
    <path d="M6 11v2" />
  </svg>
);

/* ---------- Nuevos: features / cómo funciona ---------- */

export const CpuIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <rect x="6" y="6" width="12" height="12" rx="2.5" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M9 2v2.5M15 2v2.5M9 19.5V22M15 19.5V22M2 9h2.5M2 15h2.5M19.5 9H22M19.5 15H22" />
  </svg>
);

export const UserCheckIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="m16 12 2 2 4-4" />
  </svg>
);

export const NoAdsIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <rect x="3" y="5" width="18" height="14" rx="3" />
    <path d="M8 14V9.5l3 4.5" />
    <path d="M3 3l18 18" />
  </svg>
);

export const UsersOffIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19a5.5 5.5 0 0 1 9.5-3.8" />
    <path d="M16.5 7.5a3 3 0 0 1 1.7 5.3M18 16.2a5.6 5.6 0 0 1 2.5 2.8" />
    <path d="M3 3l18 18" />
  </svg>
);

export const SlidersIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M18 18h2" />
    <circle cx="16" cy="6" r="2" fill="currentColor" stroke="none" />
    <circle cx="10" cy="12" r="2" fill="currentColor" stroke="none" />
    <circle cx="16" cy="18" r="2" fill="currentColor" stroke="none" />
  </svg>
);

export const SparkleIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.5c.4 3.9 1.6 5.1 5.5 5.5-3.9.4-5.1 1.6-5.5 5.5-.4-3.9-1.6-5.1-5.5-5.5 3.9-.4 5.1-1.6 5.5-5.5Z" />
    <path d="M18.5 13c.2 2 .8 2.6 2.8 2.8-2 .2-2.6.8-2.8 2.8-.2-2-.8-2.6-2.8-2.8 2-.2 2.6-.8 2.8-2.8Z" />
  </svg>
);

export const DownloadIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="M12 3v11" />
    <path d="m7.5 10 4.5 4 4.5-4" />
    <path d="M4 20h16" />
  </svg>
);

export const FilterIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z" />
  </svg>
);

export const SmileIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0" />
    <path d="M9 9.5h.01M15 9.5h.01" />
  </svg>
);

/* ---------- Utilitarios de UI ---------- */

export const ArrowRightIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export const ChevronIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const XIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} strokeWidth="2.4" {...props}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const QuoteIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M9 6c-3 1.3-5 4-5 7.5V18h6v-6H6.5c.2-1.8 1.3-3.2 2.9-4L9 6Zm9 0c-3 1.3-5 4-5 7.5V18h6v-6h-3.5c.2-1.8 1.3-3.2 2.9-4L18 6Z" />
  </svg>
);

/* ---------- UI de la app (mockups) ---------- */

export const ChatIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V16.5H4A1.5 1.5 0 0 1 2.5 15V7A1.5 1.5 0 0 1 4 5.5Z" />
    <path d="M8 10.5h.01M12 10.5h.01M16 10.5h.01" />
  </svg>
);

export const HomeIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-4v-6h-5v6h-4A1.5 1.5 0 0 1 4 19v-8.5Z" />
  </svg>
);

export const ClockIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const BookmarkIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
  </svg>
);

export const GearIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13.5a7.7 7.7 0 0 0 0-3l1.7-1.3-1.8-3.1-2 .8a7.6 7.6 0 0 0-2.6-1.5L12.3 2h-3.6l-.4 2.4a7.6 7.6 0 0 0-2.6 1.5l-2-.8L1.9 8.2l1.7 1.3a7.7 7.7 0 0 0 0 3l-1.7 1.3 1.8 3.1 2-.8a7.6 7.6 0 0 0 2.6 1.5l.4 2.4h3.6l.4-2.4a7.6 7.6 0 0 0 2.6-1.5l2 .8 1.8-3.1-1.7-1.3Z" />
  </svg>
);

export const SendIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M3.4 3.3 21 11.1a1 1 0 0 1 0 1.8L3.4 20.7a1 1 0 0 1-1.4-1.2L4 13l9-1-9-1-2-6.5a1 1 0 0 1 1.4-1.2Z" />
  </svg>
);

export const DotsIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <circle cx="12" cy="5" r="1.7" />
    <circle cx="12" cy="12" r="1.7" />
    <circle cx="12" cy="19" r="1.7" />
  </svg>
);

export const ArrowLeftIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="M19 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
);

export const ThumbUpIcon = (props) => (
  <svg viewBox="0 0 24 24" {...stroke} {...props}>
    <path d="M7 10v10H4V10h3Zm0 0 4.5-7c1.3 0 2.2 1.1 2 2.4L13 9h5.3a2 2 0 0 1 2 2.4l-1.3 6.5a2 2 0 0 1-2 1.6H7" />
  </svg>
);

export const VerifiedIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="m12 2 2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.6 2.6.9 2.5-2 1.8v2.7l-2.6.6-1.5 2.3-2.6-.7L12 22l-2.2-1.6-2.7.2-1-2.5L3.8 16l.6-2.6-.9-2.5 2-1.8V6.4l2.6-.6L11.6 3.5 12 2Zm-1 12.5 4.7-4.7-1.4-1.4L11 11.7 9.7 10.4l-1.4 1.4L11 14.5Z" />
  </svg>
);

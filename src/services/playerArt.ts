import { PLAYER_IMAGE_MAP } from '../data/playerImageMap';

const PALETTE = [
  ['#0f172a', '#1d4ed8', '#22c55e'],
  ['#111827', '#0ea5e9', '#14b8a6'],
  ['#1e1b4b', '#7c3aed', '#f59e0b'],
  ['#1f2937', '#ef4444', '#f97316'],
  ['#0b1020', '#10b981', '#facc15'],
  ['#111827', '#ec4899', '#06b6d4'],
  ['#172554', '#2563eb', '#60a5fa'],
  ['#052e16', '#22c55e', '#84cc16'],
];

const WIDTH = 640;
const HEIGHT = 800;

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getInitials(name: string) {
  const parts = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'FC';
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : parts[0].slice(1, 2);
  return `${first}${last}`.toUpperCase();
}

function getPalette(name: string) {
  const hash = hashString(name);
  const colors = PALETTE[hash % PALETTE.length];
  return {
    bgA: colors[0],
    bgB: colors[1],
    accent: colors[2],
    number: String((hash % 99) + 1).padStart(2, '0'),
  };
}

export function getPlayerCardSvg(name: string) {
  const { bgA, bgB, accent, number } = getPalette(name);
  const initials = escapeXml(getInitials(name));
  const safeName = escapeXml(name);

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-label="${safeName}">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="${bgA}" />
        <stop offset="55%" stop-color="${bgB}" />
        <stop offset="100%" stop-color="${accent}" />
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="20%" r="80%">
        <stop offset="0%" stop-color="rgba(255,255,255,0.35)" />
        <stop offset="60%" stop-color="rgba(255,255,255,0.08)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
      </radialGradient>
      <linearGradient id="panel" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="rgba(255,255,255,0.18)" />
        <stop offset="100%" stop-color="rgba(255,255,255,0.02)" />
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="12" stdDeviation="24" flood-color="rgba(0,0,0,0.45)" />
      </filter>
    </defs>

    <rect width="${WIDTH}" height="${HEIGHT}" rx="36" fill="url(#bg)" />
    <circle cx="${WIDTH * 0.74}" cy="${HEIGHT * 0.2}" r="${HEIGHT * 0.42}" fill="url(#glow)" />
    <path d="M0 540C126 485 236 464 320 464C409 464 520 490 640 540V800H0Z" fill="rgba(2,6,23,0.28)" />
    <path d="M70 150C202 116 386 116 570 154" stroke="rgba(255,255,255,0.18)" stroke-width="10" stroke-linecap="round" />
    <path d="M56 640C184 576 456 576 584 640" stroke="rgba(255,255,255,0.08)" stroke-width="14" stroke-linecap="round" />

    <g filter="url(#shadow)">
      <circle cx="320" cy="350" r="148" fill="rgba(255,255,255,0.10)" />
      <path d="M235 392c0-54 38-94 85-94s85 40 85 94v75H235z" fill="rgba(15,23,42,0.70)" />
      <circle cx="320" cy="278" r="58" fill="rgba(15,23,42,0.72)" />
      <path d="M262 292c10 10 24 17 58 17s48-7 58-17v25H262z" fill="rgba(255,255,255,0.12)" />
      <path d="M210 520c16-67 53-110 110-128l-18 70h126l-18-70c57 18 94 61 110 128z" fill="rgba(15,23,42,0.72)" />
      <path d="M282 386l38 30 38-30" stroke="${accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    </g>

    <rect x="44" y="44" width="120" height="54" rx="27" fill="rgba(2,6,23,0.42)" stroke="rgba(255,255,255,0.18)" />
    <text x="104" y="80" text-anchor="middle" fill="white" font-family="Inter, Arial, sans-serif" font-size="30" font-weight="800">${number}</text>

    <rect x="48" y="648" width="544" height="84" rx="24" fill="url(#panel)" stroke="rgba(255,255,255,0.14)" />
    <text x="320" y="690" text-anchor="middle" fill="white" font-family="Oswald, Inter, Arial, sans-serif" font-size="34" font-weight="700" letter-spacing="2">${initials}</text>
    <text x="320" y="720" text-anchor="middle" fill="rgba(255,255,255,0.80)" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="600">${safeName}</text>
  </svg>`.trim();
}

export function getPlayerCardDataUri(name: string) {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(getPlayerCardSvg(name))}`;
}

export function getPlayerPortraitSrc(name: string) {
  return PLAYER_IMAGE_MAP[name] ?? getPlayerCardDataUri(name);
}

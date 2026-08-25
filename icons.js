// Small inline SVG icon set (stroke-based, currentColor) — no external assets needed.
const ICONS = {
  blueprint: '<path d="M3 3h13l5 5v13H3z"/><path d="M16 3v5h5"/><path d="M7 12h10M7 16h6"/>',
  crane: '<path d="M4 21V9l10-6v6"/><path d="M14 9h6l-2 4h-4"/><path d="M4 21h9"/><circle cx="9" cy="21" r="1.5"/>',
  network: '<circle cx="5" cy="6" r="2.5"/><circle cx="19" cy="6" r="2.5"/><circle cx="12" cy="18" r="2.5"/><path d="M7 7.5 10.5 16M17 7.5 13.5 16"/>',
  renovate: '<path d="M3 21 12 3l9 18"/><path d="M8 21v-6h8v6"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  design: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  measure: '<path d="M3 8v8h18V8z"/><path d="M7 8v3M11 8v3M15 8v3M19 8v3"/>',
  build: '<path d="M14 3l7 7-2 2-2-2-7 7H6v-4l7-7-2-2 2-2z"/><path d="M4 21h6"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2.1L7.9 9.9a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.9 2z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m3 6 9 7 9-7"/>',
  pin: '<path d="M12 21s-7-6.4-7-11a7 7 0 0 1 14 0c0 4.6-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
};

export function icon(name, size = 24) {
  const body = ICONS[name] || ICONS.check;
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

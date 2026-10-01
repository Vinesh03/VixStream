/**
 * Temi dell'app. Ogni tema definisce le custom property CSS usate in index.css.
 * 'cinema' è il tema di default (dark rosso).
 */
export const THEMES = {
  cinema: {
    label: 'Cinema Dark',
    hint: 'Tema predefinito',
    vars: {
      '--c-bg': '#101014',
      '--c-bg-light': '#1a1a21',
      '--c-bg-dark': '#08080b',
      '--c-surface': '#16161c',
      '--c-surface-variant': '#20202a',
      '--c-secondary': '#26262f',
      '--c-secondary-light': '#34343f',
      '--c-accent': '#ff3848',
      '--c-accent-hover': '#ff5a67',
      '--c-accent-soft': 'rgba(255,56,72,.35)',
      '--c-border': 'rgba(255,255,255,.08)',
      // glass: disattivato
      '--glass-blur': '0px',
      '--glass-bg': 'rgba(26,26,33,.95)',
      '--radius-card': '20px',
      '--radius-m3': '28px',
    },
  },
  oneui: {
    label: 'One UI',
    hint: 'Stile Samsung: superfici chiare su dark profondo',
    vars: {
      '--c-bg': '#010101',
      '--c-bg-light': '#171717',
      '--c-bg-dark': '#000000',
      '--c-surface': '#1c1c1e',
      '--c-surface-variant': '#2c2c2e',
      '--c-secondary': '#252528',
      '--c-secondary-light': '#39393d',
      '--c-accent': '#4f8cff',
      '--c-accent-hover': '#6da2ff',
      '--c-accent-soft': 'rgba(79,140,255,.25)',
      '--c-border': 'rgba(255,255,255,.09)',
      '--glass-blur': '0px',
      '--glass-bg': 'rgba(23,23,23,.97)',
      '--radius-card': '26px',
      '--radius-m3': '32px',
    },
  },
  amoled: {
    label: 'AMOLED Pure Black',
    hint: 'Nero puro: risparmia batteria sugli schermi AMOLED',
    vars: {
      '--c-bg': '#000000',
      '--c-bg-light': '#0d0d0d',
      '--c-bg-dark': '#000000',
      '--c-surface': '#111111',
      '--c-surface-variant': '#1b1b1b',
      '--c-secondary': '#181818',
      '--c-secondary-light': '#262626',
      '--c-accent': '#e50914',
      '--c-accent-hover': '#ff2222',
      '--c-accent-soft': 'rgba(229,9,20,.3)',
      '--c-border': 'rgba(255,255,255,.07)',
      '--glass-blur': '0px',
      '--glass-bg': 'rgba(13,13,13,.97)',
      '--radius-card': '18px',
      '--radius-m3': '26px',
    },
  },
};

export function applyTheme(themeId, accentColor = null) {
  // Fallback al tema di default se il tema richiesto non esiste più (es. 'glass' rimosso)
  const theme = THEMES[themeId] || THEMES.cinema;
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => {
    // Il colore accento personalizzato dell'utente sovrascrive quello del tema
    if (accentColor && (k === '--c-accent' || k === '--c-accent-soft')) return;
    root.style.setProperty(k, v);
  });
  if (accentColor) {
    root.style.setProperty('--c-accent', accentColor);
    root.style.setProperty('--c-accent-soft', hexToRgba(accentColor, .35));
    // hover: versione schiarita
    root.style.setProperty('--c-accent-hover', lighten(accentColor, .18));
  }
  root.dataset.theme = THEMES[themeId] ? themeId : 'cinema';
}

function hexToRgba(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

function lighten(hex, amt) {
  const h = hex.replace('#', '');
  const r = Math.min(255, parseInt(h.slice(0,2),16) + Math.round(255*amt));
  const g = Math.min(255, parseInt(h.slice(2,4),16) + Math.round(255*amt));
  const b = Math.min(255, parseInt(h.slice(4,6),16) + Math.round(255*amt));
  return `#${((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}`;
}

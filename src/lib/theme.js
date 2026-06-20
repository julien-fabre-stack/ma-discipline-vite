// Thèmes commutables. Le rendu Vite repose sur des variables CSS (--color-*),
// donc applyTheme() les réécrit dynamiquement sur :root.

export const THEMES = {
  aube:    { name: 'Aube',    night: '#15121C', surf: '#1E1A28', surf2: '#2A2438', line: 'rgba(255,255,255,0.08)', ember: '#FF7A45', gold: '#FFC24B' },
  nuit:    { name: 'Nuit',    night: '#0F1320', surf: '#191F33', surf2: '#262C45', line: 'rgba(255,255,255,0.09)', ember: '#5B8DEF', gold: '#8B5CF6' },
  ardoise: { name: 'Ardoise', night: '#171A21', surf: '#222732', surf2: '#2F3543', line: 'rgba(255,255,255,0.10)', ember: '#34D1BF', gold: '#5BC0FF' },
  aurore:  { name: 'Aurore',  night: '#120E1A', surf: '#1C1726', surf2: '#2A2138', line: 'rgba(255,255,255,0.08)', ember: '#FF6FA5', gold: '#FFA94D' },
  foret:   { name: 'Forêt',   night: '#101713', surf: '#18211B', surf2: '#243029', line: 'rgba(255,255,255,0.09)', ember: '#4ADE80', gold: '#A3E635' },
}

export function lighten(hex, amt) {
  try {
    const h = hex.replace('#', '')
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16)
    const m = c => Math.round(c + (255 - c) * amt)
    const x = c => c.toString(16).padStart(2, '0')
    return '#' + x(m(r)) + x(m(g)) + x(m(b))
  } catch (e) { return hex }
}

// Applique un thème (+ accent optionnel) en écrivant les variables CSS sur :root.
export function applyTheme(themeId, accent) {
  const t = THEMES[themeId] || THEMES.aube
  const ember = accent || t.ember
  const gold = accent ? lighten(accent, 0.35) : t.gold
  const root = document.documentElement
  const set = (k, v) => root.style.setProperty(k, v)
  set('--color-night', t.night)
  set('--color-surface', t.surf)
  set('--color-surface-2', t.surf2)
  set('--color-line', t.line)
  set('--color-ember', ember)
  set('--color-gold', gold)
  try { document.body.style.background = t.night } catch (e) {}
}

// Compat ascendante : certains fichiers importaient THEME (objet plat).
export const THEME = {
  night: '#15121C', surface: '#1E1A28', surface2: '#2A2438', line: 'rgba(255,255,255,0.08)',
  ember: '#FF7A45', gold: '#FFC24B', text: '#F3EDE7', muted: '#9C90A8', ok: '#4ADE80', info: '#5BC0FF', danger: '#E5484D',
}

export const TAB_ICONS = { seance: '🏋️', nutrition: '🥗', suivi: '📊', settings: '⚙️' }

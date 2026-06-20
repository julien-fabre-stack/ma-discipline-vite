export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0s'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return h + 'h ' + m + 'm'
  if (m > 0) return m + 'm ' + s + 's'
  return s + 's'
}

export function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleDateString('fr-FR')
}

export function timeNow() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val))
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}

export function sumMacros(items = []) {
  return items.reduce((acc, item) => ({
    kcal:  acc.kcal  + (item.kcal  || 0),
    protG: acc.protG + (item.protG || 0),
    lipG:  acc.lipG  + (item.lipG  || 0),
    glucG: acc.glucG + (item.glucG || 0),
  }), { kcal: 0, protG: 0, lipG: 0, glucG: 0 })
}

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

// ===== Helpers Runner / WOD / Profil (repris de l'app d'origine) =====

// Formate un nombre de secondes en mm:ss (pour les minuteurs).
export function fmt(totalSec) {
  const s = Math.max(0, Math.floor(totalSec || 0))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

// Transforme une liste d'exercices (format workouts.exercices) en étapes pour le Runner.
// Chaque exercice -> 1..N séries ; après chaque série, un repos si repos > 0.
// kinds: "work" (reps), "timed" (durée), "rest" (repos).
export function expandSession(items) {
  const steps = []
  ;(items || []).forEach(it => {
    const name = it.nom || it.name || ''
    const sets = it.series && it.series > 1 ? it.series : (it.sets && it.sets > 1 ? it.sets : 1)
    const timed = !!it.timed
    const dur = it.dur || it.duree || 0
    const rest = it.repos != null ? it.repos : (it.rest || 0)
    const repsVal = it.repsMin != null
      ? (it.repsMin === it.repsMax ? it.repsMin : `${it.repsMin}-${it.repsMax}`)
      : (it.reps != null ? it.reps : 0)
    for (let s = 0; s < sets; s++) {
      const tag = sets > 1 ? `${s + 1}/${sets}` : null
      if (timed) {
        steps.push({ kind: 'timed', block: name, name, reps: `${dur} s`, dur: dur || 20, tag })
      } else {
        steps.push({ kind: 'work', block: name, name, reps: String(repsVal), tag })
      }
      if (rest > 0) steps.push({ kind: 'rest', block: name, name: 'Repos', dur: rest })
    }
  })
  return steps
}

// Redimensionne une image (File) côté client en JPEG base64, côté max `max` px.
export function resizeImage(file, max, cb) {
  const r = new FileReader()
  r.onload = () => {
    const img = new Image()
    img.onload = () => {
      let w = img.width, h = img.height
      const sc = Math.min(1, max / Math.max(w, h))
      w = Math.round(w * sc); h = Math.round(h * sc)
      const cv = document.createElement('canvas')
      cv.width = w; cv.height = h
      cv.getContext('2d').drawImage(img, 0, 0, w, h)
      cb(cv.toDataURL('image/jpeg', 0.82))
    }
    img.src = r.result
  }
  r.readAsDataURL(file)
}

// Calcule l'âge à partir d'une date de naissance "YYYY-MM-DD".
export function ageFrom(bd) {
  if (!bd) return null
  const [y, m, d] = bd.split('-').map(Number)
  const b = new Date(y, m - 1, d)
  const n = new Date()
  let a = n.getFullYear() - b.getFullYear()
  const mm = n.getMonth() - b.getMonth()
  if (mm < 0 || (mm === 0 && n.getDate() < b.getDate())) a--
  return a
}

// Parse un WOD collé en texte. 1re ligne "Nom | minutes", puis 1 exercice/ligne finissant par le nb de reps.
export function parseWod(txt) {
  const lines = (txt || '').split('\n').map(l => l.trim()).filter(Boolean)
  if (!lines.length) return null
  const head = lines[0].split('|')
  const name = (head[0] || 'WOD').trim()
  const dur = (parseInt(head[1]) || 15) * 60
  const items = lines.slice(1).map(l => {
    const m = l.match(/^(.*?)[\s:·-]+(\d+)\s*$/)
    return m ? { name: m[1].trim(), reps: +m[2] } : { name: l, reps: 10 }
  }).filter(x => x.name)
  return { id: uid(), name, dur, items }
}

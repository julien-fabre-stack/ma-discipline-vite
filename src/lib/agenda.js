import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const COL = 'users'

export const DEFAULT_STATUSES = [
  { id: 'mission', label: 'Mission',    color: '#FF7A45' },
  { id: 'repos',   label: 'Repos',      color: '#5BC0FF' },
  { id: 'perm',    label: 'Permission', color: '#A78BFA' },
]

export const DEFAULT_ACTIVITIES = [
  { id: 'reposport', label: 'Repos sport', color: '#4ADE80' },
]

export const DEFAULT_RDV_TYPES = [
  { id: 'rdvperso',   label: 'Perso',   color: '#FFC24B' },
  { id: 'rdvtravail', label: 'Travail', color: '#5BC0FF' },
  { id: 'rdvsante',   label: 'Sante',   color: '#E5484D' },
  { id: 'rdvfamille', label: 'Famille', color: '#FF6FA5' },
]

export const RDV_COLORS = ['#FFC24B', '#E5484D', '#FF6FA5', '#34D1BF', '#5BC0FF', '#A78BFA']

export const DEFAULT_HABITS = [
  { id: 'reveil',   label: 'Reveil tot' },
  { id: 'sport',    label: 'Sport' },
  { id: 'douche',   label: 'Douche froide' },
  { id: 'medit',    label: 'Meditation' },
  { id: 'tracking', label: 'Tracking' },
  { id: 'manger',   label: 'Manger sain' },
  { id: 'dormir',   label: 'Dormir tot' },
]

export function uid() {
  return 'x' + Math.random().toString(36).slice(2, 9)
}

const pad = n => String(n).padStart(2, '0')
export const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
export const parseKey = k => { const [y,m,d] = k.split('-').map(Number); return new Date(y, m-1, d) }
export const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate()+n); return dateKey(d) }
export const daysBetween = (a, b) => Math.floor((parseKey(b) - parseKey(a)) / 86400000)
export const inRange = (k, start, end) => k >= start && k <= end

export function statusOf(agenda, k) {
  const p = (agenda.periods || []).find(p => p.kind === 'status' && inRange(k, p.start, p.end))
  return p ? (agenda.statuses || []).find(s => s.id === p.catId) : null
}
export function activitiesOf(agenda, k) {
  const ps = (agenda.periods || []).filter(p => p.kind === 'activity' && inRange(k, p.start, p.end))
  return ps.map(p => (agenda.activities || []).find(a => a.id === p.catId)).filter(Boolean)
}
export function eventsOf(agenda, k) {
  return (agenda.events || []).filter(e => e.date === k).sort((a, b) => (a.time || '') < (b.time || '') ? -1 : 1)
}
export function cycleStatusOf(agenda, k) {
  const p = (agenda.periods || []).find(p => p.kind === 'cycle' && inRange(k, p.start, p.end))
  return p ? p.catId : null
}
export function ratioOfDay(habits, dayHabits) {
  if (!dayHabits || Object.keys(dayHabits).length === 0) return 0
  const total = habits.length || 1
  const done = Object.values(dayHabits).filter(Boolean).length
  return done / total
}
export function sportStatus(agenda, k, cycleStart, dayTypeFn) {
  const cyc = cycleStatusOf(agenda, k)
  if (cyc) return cyc
  const w = Math.floor(daysBetween(cycleStart || dateKey(), k) / 7)
  const pos = ((w % 9) + 9) % 9
  if (pos >= 8) return 'off'
  return dayTypeFn(parseKey(k)) === 'repos' ? 'off' : 'actif'
}
export function dayType(d = new Date()) {
  const w = d.getDay()
  if ([1, 2, 4, 5].includes(w)) return 'train'
  if (w === 3) return 'recup'
  return 'repos'
}

// Libellé du cycle d'entraînement (9 semaines : 8 actives + 1 décharge).
export function cycleLabel(cycleStart) {
  const w = Math.floor(daysBetween(cycleStart || dateKey(), dateKey()) / 7)
  const pos = ((w % 9) + 9) % 9
  return pos < 8 ? `Semaine ${pos + 1}/8` : 'Semaine de décharge'
}

// Variante tenant compte d'une période "cycle" manuelle posée dans l'agenda.
export function cycleLabelFor(agendaDoc, k) {
  const ag = (agendaDoc && agendaDoc.agenda) || {}
  const cur = (ag.periods || []).find(p => p.kind === 'cycle' && inRange(k, p.start, p.end))
  if (cur) {
    if (cur.catId === 'off') return 'Semaine de décharge'
    const wk = Math.floor(daysBetween(cur.start, k) / 7) + 1
    return `Semaine ${wk}`
  }
  return cycleLabel((agendaDoc && agendaDoc.cycleStart) || dateKey())
}

export async function loadAgendaDoc(userId) {
  const ref = doc(db, COL, userId, 'app', 'agenda')
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data()
  const defaults = {
    cycleStart: dateKey(),
    drinkfree: { date: dateKey(), count: 0 },
    habits: DEFAULT_HABITS,
    days: {},
    agenda: {
      statuses: DEFAULT_STATUSES,
      activities: DEFAULT_ACTIVITIES,
      rdvTypes: DEFAULT_RDV_TYPES,
      periods: [],
      events: [],
    },
  }
  await setDoc(ref, defaults)
  return defaults
}

export async function saveAgendaDoc(userId, patch) {
  const ref = doc(db, COL, userId, 'app', 'agenda')
  await setDoc(ref, patch, { merge: true })
}

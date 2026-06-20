import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const COL = 'users'

export const DEFAULT_HABITS = [
  { id: 'reveil',   label: 'Reveil tot' },
  { id: 'sport',    label: 'Sport' },
  { id: 'douche',   label: 'Douche froide' },
  { id: 'medit',    label: 'Meditation' },
  { id: 'tracking', label: 'Tracking' },
  { id: 'manger',   label: 'Manger sain' },
  { id: 'dormir',   label: 'Dormir tot' },
]

export async function loadSuiviDoc(userId) {
  const ref = doc(db, COL, userId, 'app', 'suivi')
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data()
  const defaults = { habits: DEFAULT_HABITS, days: {} }
  await setDoc(ref, defaults)
  return defaults
}

export async function saveSuiviDoc(userId, patch) {
  const ref = doc(db, COL, userId, 'app', 'suivi')
  await setDoc(ref, patch, { merge: true })
}

export function ratioOfDay(habits, dayHabits) {
  if (!dayHabits || Object.keys(dayHabits).length === 0) return 0
  const total = habits.length || 1
  const done = Object.values(dayHabits).filter(Boolean).length
  return done / total
}

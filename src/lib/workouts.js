import { db } from './firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const COL = 'users'

export const WEEKDAYS = [
  ['Lundi', 1], ['Mardi', 2], ['Mercredi', 3], ['Jeudi', 4],
  ['Vendredi', 5], ['Samedi', 6], ['Dimanche', 0],
]

export async function loadWorkoutsDoc(userId) {
  const ref = doc(db, COL, userId, 'app', 'workouts')
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data()
  const defaults = { workouts: [], weekTemplate: {} }
  await setDoc(ref, defaults)
  return defaults
}

export async function saveWorkoutsDoc(userId, patch) {
  const ref = doc(db, COL, userId, 'app', 'workouts')
  await setDoc(ref, patch, { merge: true })
}

export function workoutForDay(workoutsDoc, dateKeyStr) {
  const [y, m, d] = dateKeyStr.split('-').map(Number)
  const wd = new Date(y, m - 1, d).getDay()
  const wid = (workoutsDoc.weekTemplate || {})[wd]
  if (!wid) return null
  return (workoutsDoc.workouts || []).find(w => w.id === wid) || null
}

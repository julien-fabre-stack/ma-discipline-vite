import { db } from './firebase'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'

const COL = 'users'

export const MEALS = [
  ['petitdej', 'Petit Dejeuner', '#FFC24B'],
  ['dej',      'Dejeuner',       '#FF7A45'],
  ['diner',    'Diner',          '#5BC0FF'],
  ['snack',    'Snacks / Autre', '#A78BFA'],
]

export function macrosOf(food, qty) {
  const k = food.unit === 'g' ? qty / 100 : qty
  return { kcal: food.kcal * k, p: food.p * k, c: food.c * k, f: food.f * k }
}

export function sumMeals(meals, allFoods) {
  let tot = { kcal: 0, p: 0, c: 0, f: 0 }
  MEALS.forEach(([key]) => {
    ;(meals[key] || []).forEach(e => {
      const food = allFoods.find(x => x.id === e.id)
      if (!food) return
      const m = macrosOf(food, e.qty)
      tot.kcal += m.kcal; tot.p += m.p; tot.c += m.c; tot.f += m.f
    })
  })
  return tot
}

export async function loadNutritionDoc(userId) {
  const ref = doc(db, COL, userId, 'app', 'nutrition')
  const snap = await getDoc(ref)
  if (snap.exists()) return snap.data()
  const defaults = { customFoods: [], combos: [], days: {}, targets: { kcal: 2200, p: 160, l: 70, g: 220, water: 2 } }
  await setDoc(ref, defaults)
  return defaults
}

export async function saveNutritionDoc(userId, data) {
  const ref = doc(db, COL, userId, 'app', 'nutrition')
  await setDoc(ref, data, { merge: true })
}

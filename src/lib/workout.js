import { db } from './firebase'
import {
  collection, doc, addDoc, updateDoc, deleteDoc,
  getDocs, query, where, orderBy, Timestamp
} from 'firebase/firestore'

const COL = 'seances'

export async function saveSeance(userId, seance) {
  const payload = { ...seance, userId, updatedAt: Timestamp.now() }
  if (seance.id) {
    const ref = doc(db, COL, seance.id)
    await updateDoc(ref, payload)
    return seance.id
  } else {
    payload.createdAt = Timestamp.now()
    const ref = await addDoc(collection(db, COL), payload)
    return ref.id
  }
}

export async function getSeances(userId) {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export async function deleteSeance(id) {
  await deleteDoc(doc(db, COL, id))
}

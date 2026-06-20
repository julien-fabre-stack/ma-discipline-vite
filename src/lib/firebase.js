import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBI5nQ9umTNerRPiXxdhJdCsxKLrV1xvss",
  authDomain: "snake-s-rule.firebaseapp.com",
  projectId: "snake-s-rule",
  storageBucket: "snake-s-rule.firebasestorage.app",
  messagingSenderId: "195967724839",
  appId: "1:195967724839:web:384e1d39d9e85fd2728d02"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Cache local persistant + synchronisation multi-onglets, pour que l'app reste
// utilisable hors-ligne (lecture des dernières données + écritures mises en
// file d'attente jusqu'au retour du réseau).
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})

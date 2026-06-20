import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from './lib/firebase'
import { migrateProfile } from './lib/migrate'
import { DEFAULT_PROFILE } from './lib/defaults'
import { Tabs, Spinner, Button, Input, Card } from './components/UI'
import { ConfirmHost } from './components/ConfirmHost'
import SeanceTab    from './pages/SeanceTab'
import NutritionTab from './pages/NutritionTab'
import SuiviTab     from './pages/SuiviTab'
import Settings     from './pages/Settings'

const TABS = [
  { id: 'seance',    label: 'Seances',   icon: '🏋️' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { id: 'suivi',     label: 'Suivi',     icon: '📊' },
  { id: 'settings',  label: 'Reglages',  icon: '⚙️' },
]

function AuthScreen() {
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handle = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
    } catch (e) {
      const msgs = {
        'auth/invalid-credential':   'Email ou mot de passe incorrect.',
        'auth/email-already-in-use': 'Cet email est deja utilise.',
        'auth/weak-password':        'Mot de passe trop court (min. 6 caracteres).',
        'auth/invalid-email':        'Adresse email invalide.',
      }
      setError(msgs[e.code] || e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <Card className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <p className="text-3xl mb-1">💪</p>
          <h1 className="text-xl font-bold text-slate-100">Ma Discipline</h1>
          <p className="text-sm text-slate-400 mt-1">{mode === 'login' ? 'Connexion' : 'Creer un compte'}</p>
        </div>
        {error && (
          <p className="text-sm text-red-400 bg-red-900/30 border border-red-800 rounded-lg px-3 py-2">{error}</p>
        )}
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.com" />
        <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="........." />
        <Button className="w-full" onClick={handle} disabled={loading || !email || !password}>
          {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
        </Button>
        <p className="text-center text-xs text-slate-400">
          {mode === 'login' ? 'Pas encore de compte ?' : 'Deja inscrit ?'}{' '}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
            className="text-sky-400 hover:underline"
          >
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </p>
      </Card>
    </div>
  )
}

export default function App() {
  const [user, setUser]       = useState(undefined)
  const [profile, setProfile] = useState(null)
  const [tab, setTab]         = useState('seance')

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const ref  = doc(db, 'users', u.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setProfile(migrateProfile(snap.data()))
        } else {
          const p = { ...DEFAULT_PROFILE }
          await setDoc(ref, p)
          setProfile(p)
        }
      } else {
        setProfile(null)
      }
    })
  }, [])

  const updateProfile = useCallback(async (patch) => {
    if (!user) return
    const next = { ...profile, ...patch }
    setProfile(next)
    await updateDoc(doc(db, 'users', user.uid), patch)
  }, [user, profile])

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return <AuthScreen />

  const pageProps = { user, profile, onProfileUpdate: updateProfile }

  return (
    <>
      <ConfirmHost />
      <div className="min-h-screen bg-slate-900 flex flex-col">
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <h1 className="font-bold text-slate-100 flex items-center gap-2">
              <span>💪</span> Ma Discipline
            </h1>
            <span className="text-xs text-slate-500 truncate max-w-xs">{user.email}</span>
          </div>
        </header>

        <div className="sticky top-[57px] z-20 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-4 py-2">
          <div className="max-w-2xl mx-auto">
            <Tabs tabs={TABS} active={tab} onChange={setTab} />
          </div>
        </div>

        <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
          {tab === 'seance'    && <SeanceTab    {...pageProps} />}
          {tab === 'nutrition' && <NutritionTab {...pageProps} />}
          {tab === 'suivi'     && <SuiviTab     {...pageProps} />}
          {tab === 'settings'  && <Settings     {...pageProps} />}
        </main>
      </div>
    </>
  )
}

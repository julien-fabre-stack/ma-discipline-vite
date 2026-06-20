import { useState, useEffect, useCallback } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from './lib/firebase'
import { migrateProfile } from './lib/migrate'
import { DEFAULT_PROFILE } from './lib/defaults'
import { Tabs, Spinner, Button, Input, Card } from './components/UI'
import { ConfirmHost } from './components/ConfirmHost'
import { useOnlineStatus } from './hooks/useOnlineStatus'
import { applyTheme } from './lib/theme'
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-night">
      <Card className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <p className="text-3xl mb-1">💪</p>
          <h1 className="text-xl font-bold text-dawn">Ma Discipline</h1>
          <p className="text-sm text-muted mt-1">{mode === 'login' ? 'Connexion' : 'Creer un compte'}</p>
        </div>
        {error && (
          <p className="text-sm text-danger bg-danger/15 border border-danger/40 rounded-lg px-3 py-2">{error}</p>
        )}
        <Input label="Email" type="email" value={email} onChange={setEmail} placeholder="vous@exemple.com" />
        <Input label="Mot de passe" type="password" value={password} onChange={setPassword} placeholder="........." />
        <Button className="w-full" onClick={handle} disabled={loading || !email || !password}>
          {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
        </Button>
        <p className="text-center text-xs text-muted">
          {mode === 'login' ? 'Pas encore de compte ?' : 'Deja inscrit ?'}{' '}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setError('') }}
            className="text-gold hover:underline"
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
  const online                = useOnlineStatus()

  // Applique le thème / accent dès que le profil est disponible.
  useEffect(() => {
    if (profile) applyTheme(profile.theme, profile.accent)
  }, [profile?.theme, profile?.accent])

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
      <div className="min-h-screen flex items-center justify-center bg-night">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user) return <AuthScreen />

  const pageProps = { user, profile, onProfileUpdate: updateProfile }

  return (
    <>
      <ConfirmHost />
      {!online && (
        <div
          className="fixed z-40 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-surface/90 backdrop-blur border border-gold/40 text-gold"
          style={{ top: 'calc(env(safe-area-inset-top) + 10px)' }}
        >
          <span className="w-2 h-2 rounded-full bg-gold" />
          Hors ligne — les modifications seront synchronisées au retour du reseau
        </div>
      )}
      <div className="min-h-screen bg-night flex flex-col">
        <header className="sticky top-0 z-30 bg-night/80 backdrop-blur border-b border-line px-4 py-3" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <h1 className="font-bold text-text flex items-center gap-2">
              <span>💪</span> Ma Discipline
            </h1>
            <span className="text-xs text-muted truncate max-w-xs">{user.email}</span>
          </div>
        </header>

        <div className="sticky top-[57px] z-20 bg-night/80 backdrop-blur border-b border-line px-4 py-2">
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

import { useState, useEffect, useRef } from 'react'
import Icon from '../components/Icon'
import { auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'
import { loadAgendaDoc, saveAgendaDoc } from '../lib/agenda'
import { loadWorkoutsDoc, saveWorkoutsDoc } from '../lib/workouts'
import { loadNutritionDoc, saveNutritionDoc } from '../lib/nutrition'

import ProfileSettings   from './settings/ProfileSettings'
import TrainingSettings  from './settings/TrainingSettings'
import NutritionSettings from './settings/NutritionSettings'
import DashboardSettings from './settings/DashboardSettings'
import ThemeSettings     from './settings/ThemeSettings'
import HelpSettings      from './settings/HelpSettings'

const MENUS = [
  ['profil',    'user',     'Data opérateur', 'Nom, âge, photo, objectifs'],
  ['training',  'dumbbell', 'Training',       'Workouts, WOD, semaine type'],
  ['nutrition', 'apple',    'Nutrition',      'Objectifs caloriques & eau'],
  ['dashboard', 'calendar', 'Tableau de bord','Habitudes & agenda'],
  ['apparence', 'palette',  'Apparence',      'Thème, accent, transparence'],
  ['aide',      'help',     'Aide & FAQ',     'Tuto, principe de fonctionnement'],
]
const TITLE = { profil: 'Data opérateur', training: 'Training', nutrition: 'Nutrition', dashboard: 'Tableau de bord', apparence: 'Apparence', aide: 'Aide & FAQ' }

// Clés routées vers chaque document Firestore.
const WORKOUT_KEYS   = ['workouts', 'weekTemplate', 'progress']
const NUTRITION_KEYS = ['customFoods', 'combos', 'targets']
const AGENDA_KEYS    = ['habits', 'agenda', 'wods', 'cycleStart', 'days']
const PROFILE_KEYS   = ['profile', 'theme', 'accent', 'navAlpha', 'nom', 'poids', 'objectifKcal', 'objectifProtG', 'objectifLipG', 'objectifGlucG']

export default function Settings({ user, profile, onProfileUpdate }) {
  const [section, setSection] = useState(null)
  const prev = useRef(null)
  if (section) prev.current = section
  const sec = section || prev.current

  const [wDoc, setWDoc] = useState(null)
  const [nDoc, setNDoc] = useState(null)
  const [aDoc, setADoc] = useState(null)

  useEffect(() => {
    if (!user) return
    loadWorkoutsDoc(user.uid).then(setWDoc)
    loadNutritionDoc(user.uid).then(setNDoc)
    loadAgendaDoc(user.uid).then(setADoc)
  }, [user])

  // Vue "data" agrégée façon ancienne app, à partir des docs séparés.
  const data = {
    profile: profile?.profile || {
      name: profile?.nom || '', birthdate: profile?.birthdate || '', height: profile?.height || '',
      weight: profile?.poids || '', goals: profile?.goals || '', photo: profile?.photo || '',
    },
    theme: profile?.theme || 'aube',
    accent: profile?.accent || null,
    navAlpha: profile?.navAlpha,
    workouts: wDoc?.workouts || [],
    weekTemplate: wDoc?.weekTemplate || {},
    progress: wDoc?.progress || null,
    customFoods: nDoc?.customFoods || [],
    combos: nDoc?.combos || [],
    targets: nDoc?.targets || { train: 2400, recup: 2050, repos: 1800, water: 2 },
    habits: aDoc?.habits || [],
    wods: aDoc?.wods || [],
    cycleStart: aDoc?.cycleStart || null,
    days: aDoc?.days || {},
    agenda: aDoc?.agenda || { statuses: [], activities: [], rdvTypes: [], periods: [], events: [] },
  }

  // Dispatch d'un patch vers le bon document.
  const update = async (patch) => {
    const wPatch = {}, nPatch = {}, aPatch = {}, pPatch = {}
    Object.entries(patch).forEach(([k, v]) => {
      if (WORKOUT_KEYS.includes(k)) wPatch[k] = v
      else if (NUTRITION_KEYS.includes(k)) nPatch[k] = v
      else if (AGENDA_KEYS.includes(k)) aPatch[k] = v
      else if (PROFILE_KEYS.includes(k)) pPatch[k] = v
    })
    if (Object.keys(wPatch).length) { setWDoc(d => ({ ...d, ...wPatch })); await saveWorkoutsDoc(user.uid, wPatch) }
    if (Object.keys(nPatch).length) { setNDoc(d => ({ ...d, ...nPatch })); await saveNutritionDoc(user.uid, nPatch) }
    if (Object.keys(aPatch).length) { setADoc(d => ({ ...d, ...aPatch })); await saveAgendaDoc(user.uid, aPatch) }
    if (Object.keys(pPatch).length && onProfileUpdate) await onProfileUpdate(pPatch)
  }

  const ready = wDoc && nDoc && aDoc
  const handleLogout = () => signOut(auth)

  return (
    <div className="flex flex-col bg-night text-text rounded-2xl overflow-hidden border border-line" style={{ minHeight: '70vh' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-line">
        {section ? (
          <button onClick={() => setSection(null)} className="p-2 rounded-full flex-shrink-0 bg-surface"><Icon name="left" size={20} className="text-gold" /></button>
        ) : <div style={{ width: 36 }} className="flex-shrink-0" />}
        <div className="font-bold text-lg flex-1 text-center truncate">{section ? TITLE[section] : 'Réglages'}</div>
        <div style={{ width: 36 }} className="flex-shrink-0" />
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Menu principal */}
        <div
          className="absolute inset-0 overflow-y-auto px-4 pt-4 pb-8"
          style={{ transform: section ? 'translateX(-22%)' : 'translateX(0)', opacity: section ? 0 : 1, transition: 'transform 360ms cubic-bezier(.22,1,.36,1),opacity 260ms ease', pointerEvents: section ? 'none' : 'auto' }}
        >
          {MENUS.map(([k, ic, l, desc]) => (
            <button key={k} onClick={() => setSection(k)} className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl mb-3 bg-surface border border-line">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-surface-2"><Icon name={ic} size={20} className="text-gold" /></div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-semibold text-sm">{l}</div>
                <div className="text-xs truncate text-muted">{desc}</div>
              </div>
              <Icon name="right" size={18} className="text-muted" />
            </button>
          ))}
          <button onClick={handleLogout} className="w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 mt-4 bg-surface text-muted">
            <Icon name="logout" size={18} /> Se déconnecter
          </button>
        </div>

        {/* Sous-page */}
        <div
          className="absolute inset-0 overflow-y-auto px-4 pt-4 pb-8"
          style={{ transform: section ? 'translateX(0)' : 'translateX(100%)', transition: 'transform 360ms cubic-bezier(.22,1,.36,1)', pointerEvents: section ? 'auto' : 'none' }}
        >
          {!ready ? (
            <p className="text-muted text-sm">Chargement…</p>
          ) : (
            <>
              {sec === 'profil'    && <ProfileSettings   data={data} update={update} />}
              {sec === 'training'  && <TrainingSettings  data={data} update={update} />}
              {sec === 'nutrition' && <NutritionSettings data={data} update={update} />}
              {sec === 'dashboard' && <DashboardSettings data={data} update={update} user={user} />}
              {sec === 'apparence' && <ThemeSettings     data={data} update={update} />}
              {sec === 'aide'      && <HelpSettings />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

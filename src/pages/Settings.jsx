import { useState, useEffect } from 'react'
import { Card, Button, Input, Tabs } from '../components/UI'
import { auth } from '../lib/firebase'
import { signOut } from 'firebase/auth'
import AgendaSettings from './AgendaSettings'
import TrainingSettings from './TrainingSettings'
import NutritionSettings from './NutritionSettings'
import { loadAgendaDoc, saveAgendaDoc } from '../lib/agenda'
import { loadWorkoutsDoc, saveWorkoutsDoc } from '../lib/workouts'
import { loadNutritionDoc, saveNutritionDoc } from '../lib/nutrition'

const SUB_TABS = [
  { id: 'profil',    label: 'Profil',    icon: '👤' },
  { id: 'seances',   label: 'Seances',   icon: '🏋️' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { id: 'suivi',     label: 'Suivi',     icon: '📊' },
]

export default function Settings({ user, profile, onProfileUpdate }) {
  const [sub, setSub] = useState('profil')
  const [agendaDoc, setAgendaDoc]     = useState(null)
  const [workoutsDoc, setWorkoutsDoc] = useState(null)
  const [nutDoc, setNutDoc]           = useState(null)

  useEffect(() => {
    if (!user) return
    if (sub === 'suivi' && !agendaDoc) loadAgendaDoc(user.uid).then(setAgendaDoc)
    if (sub === 'seances' && !workoutsDoc) loadWorkoutsDoc(user.uid).then(setWorkoutsDoc)
    if (sub === 'nutrition' && !nutDoc) loadNutritionDoc(user.uid).then(setNutDoc)
  }, [sub, user])

  const handleLogout = () => signOut(auth)

  const updateAgenda = async (nextAgenda) => {
    const next = { ...agendaDoc, agenda: nextAgenda }
    setAgendaDoc(next)
    await saveAgendaDoc(user.uid, { agenda: nextAgenda })
  }

  const updateWorkouts = async (patch) => {
    const next = { ...workoutsDoc, ...patch }
    setWorkoutsDoc(next)
    await saveWorkoutsDoc(user.uid, patch)
  }

  const updateNutrition = async (patch) => {
    const next = { ...nutDoc, ...patch }
    setNutDoc(next)
    await saveNutritionDoc(user.uid, patch)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-100">Reglages</h2>

      <Tabs tabs={SUB_TABS} active={sub} onChange={setSub} />

      {sub === 'profil' && (
        <div className="space-y-4">
          <Card>
            <p className="text-sm text-slate-400 mb-1">Compte connecte</p>
            <p className="text-slate-100 font-medium">{user?.email}</p>
          </Card>
          <Card className="space-y-3">
            <p className="text-sm font-medium text-slate-300">Profil</p>
            <Input label="Prenom / Pseudo" value={profile?.nom || ''} onChange={v => onProfileUpdate({ nom: v })} placeholder="Snake" />
            <Input label="Poids corporel (kg)" type="number" min="30" max="300" step="0.1" value={profile?.poids || ''} onChange={v => onProfileUpdate({ poids: Number(v) })} />
            <Input label="Objectif kcal / jour" type="number" min="1000" max="6000" step="50" value={profile?.objectifKcal || ''} onChange={v => onProfileUpdate({ objectifKcal: Number(v) })} />
          </Card>
          <Card className="space-y-3">
            <p className="text-sm font-medium text-slate-300">Objectifs macros</p>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Prot (g)" type="number" min="0" value={profile?.objectifProtG || ''} onChange={v => onProfileUpdate({ objectifProtG: Number(v) })} />
              <Input label="Lip (g)"  type="number" min="0" value={profile?.objectifLipG  || ''} onChange={v => onProfileUpdate({ objectifLipG:  Number(v) })} />
              <Input label="Gluc (g)" type="number" min="0" value={profile?.objectifGlucG || ''} onChange={v => onProfileUpdate({ objectifGlucG: Number(v) })} />
            </div>
          </Card>
          <Button variant="danger" onClick={handleLogout} className="w-full">Se deconnecter</Button>
        </div>
      )}

      {sub === 'seances' && (
        workoutsDoc
          ? <TrainingSettings workoutsDoc={workoutsDoc} onUpdate={updateWorkouts} />
          : <p className="text-slate-400 text-sm">Chargement...</p>
      )}

      {sub === 'nutrition' && (
        nutDoc
          ? <NutritionSettings nutData={nutDoc} onUpdate={updateNutrition} />
          : <p className="text-slate-400 text-sm">Chargement...</p>
      )}

      {sub === 'suivi' && (
        agendaDoc
          ? <AgendaSettings agenda={agendaDoc.agenda || {}} onUpdate={updateAgenda} />
          : <p className="text-slate-400 text-sm">Chargement...</p>
      )}
    </div>
  )
}

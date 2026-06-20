import { useState, useEffect } from 'react'
import { Card, Button, EmptyState, Modal, Input } from '../components/UI'
import { loadWorkoutsDoc, saveWorkoutsDoc, workoutForDay } from '../lib/workouts'
import { DEFAULT_EXERCICE } from '../lib/defaults'
import { uid } from '../lib/utils'
import { confirm } from '../components/ConfirmHost'
import Runner from './Runner'
import WodRunner from './WodRunner'

const pad = n => String(n).padStart(2, '0')
const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`

export default function SeanceTab({ user }) {
  const today = dateKey()
  const [doc, setDoc]               = useState(null)
  const [loading, setLoading]       = useState(true)
  const [showModal, setShowModal]   = useState(false)
  const [editWorkout, setEditWorkout] = useState(null)
  const [activeRun, setActiveRun]   = useState(null)
  const [showWod, setShowWod]       = useState(false)

  useEffect(() => {
    if (!user) return
    loadWorkoutsDoc(user.uid).then(d => { setDoc(d); setLoading(false) })
  }, [user])

  const workouts = doc?.workouts || []
  const weekTemplate = doc?.weekTemplate || {}
  const todayWorkout = doc ? workoutForDay(doc, today) : null

  const save = async (patch) => {
    const next = { ...doc, ...patch }
    setDoc(next)
    await saveWorkoutsDoc(user.uid, patch)
  }

  const openNew = () => {
    setEditWorkout({ id: uid(), name: 'Nouvelle seance', exercices: [{ ...DEFAULT_EXERCICE, id: uid() }] })
    setShowModal(true)
  }
  const openEdit = (w) => { setEditWorkout({ ...w }); setShowModal(true) }

  const handleSave = async () => {
    const exists = workouts.some(w => w.id === editWorkout.id)
    const next = exists ? workouts.map(w => w.id === editWorkout.id ? editWorkout : w) : [...workouts, editWorkout]
    await save({ workouts: next })
    setShowModal(false)
  }

  const handleDelete = async (id) => {
    const ok = await confirm('Supprimer cette seance ?', 'Supprimer')
    if (!ok) return
    const nextTemplate = { ...weekTemplate }
    Object.keys(nextTemplate).forEach(d => { if (nextTemplate[d] === id) delete nextTemplate[d] })
    await save({ workouts: workouts.filter(w => w.id !== id), weekTemplate: nextTemplate })
  }

  const handleComplete = async (duree) => {
    if (!activeRun) return
    const next = workouts.map(w => w.id === activeRun.id ? { ...w, lastRun: new Date().toISOString(), lastDuree: duree } : w)
    await save({ workouts: next })
    setActiveRun(null)
  }

  if (activeRun) {
    return <Runner seance={activeRun} onClose={() => setActiveRun(null)} onComplete={handleComplete} />
  }

  if (showWod) {
    return <WodRunner onClose={() => setShowWod(false)} />
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-slate-600 border-t-sky-400 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Seance du jour (selon semaine type) */}
      <div>
        <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Aujourd'hui</p>
        {todayWorkout ? (
          <Card className="border-sky-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-100">{todayWorkout.name}</p>
                <p className="text-xs text-slate-400">{todayWorkout.exercices?.length || 0} exercice(s)</p>
              </div>
              <Button variant="success" onClick={() => setActiveRun(todayWorkout)}>Demarrer</Button>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-4">
            <p className="text-sm text-slate-400">Pas de seance prevue aujourd'hui. Profite du repos.</p>
          </Card>
        )}
      </div>

      {/* WOD Runner */}
      <Card className="flex items-center justify-between">
        <div>
          <p className="font-bold text-slate-100 flex items-center gap-2">🔥 WOD</p>
          <p className="text-xs text-slate-400">AMRAP, For Time, EMOM, Tabata</p>
        </div>
        <Button variant="secondary" onClick={() => setShowWod(true)}>Lancer un WOD</Button>
      </Card>

      {/* Bibliotheque complete */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Mes seances</h2>
        <Button onClick={openNew}>+ Nouvelle</Button>
      </div>

      {workouts.length === 0
        ? (
          <EmptyState
            title="Aucune seance"
            subtitle="Cree ta premiere seance pour commencer."
            action={<Button onClick={openNew}>Creer une seance</Button>}
          />
        ) : (
          <div className="space-y-3">
            {workouts.map(w => (
              <Card key={w.id} className="hover:border-slate-500 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(w)}>
                    <p className="font-semibold text-slate-100 truncate">{w.name || 'Seance sans nom'}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {w.exercices?.length ? w.exercices.length + ' exercice(s)' : 'Vide'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {w.exercices?.length > 0 && (
                      <Button variant="success" onClick={() => setActiveRun(w)} className="text-xs px-3 py-1.5">
                        Demarrer
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => openEdit(w)} className="text-slate-400 px-2">✏️</Button>
                    <Button variant="ghost" onClick={() => handleDelete(w.id)} className="text-red-400 hover:text-red-300 px-2">🗑</Button>
                  </div>
                </div>
                {w.exercices?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-700 flex flex-wrap gap-1.5">
                    {w.exercices.slice(0, 5).map((ex, i) => (
                      <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                        {ex.nom || 'Exercice ' + (i + 1)}
                      </span>
                    ))}
                    {w.exercices.length > 5 && <span className="text-xs text-slate-500">+{w.exercices.length - 5}</span>}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      }

      <p className="text-[11px] text-slate-500 text-center">
        Pour configurer la semaine type, va dans Reglages → Seances.
      </p>

      {/* Modal edition */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editWorkout?.name || 'Seance'}>
        {editWorkout && (
          <div className="space-y-4">
            <Input label="Nom de la seance" value={editWorkout.name} onChange={v => setEditWorkout(w => ({ ...w, name: v }))} placeholder="Ex : Full body A" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-400 font-medium">Exercices</p>
                <Button variant="ghost" className="text-xs py-1"
                  onClick={() => setEditWorkout(w => ({ ...w, exercices: [...(w.exercices || []), { ...DEFAULT_EXERCICE, id: uid() }] }))}>
                  + Ajouter
                </Button>
              </div>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {(editWorkout.exercices || []).map((ex, idx) => (
                  <div key={ex.id || idx} className="bg-slate-700/50 rounded-lg p-3 space-y-2">
                    <div className="flex gap-2">
                      <Input className="flex-1" placeholder="Nom de l'exercice" value={ex.nom}
                        onChange={v => setEditWorkout(w => ({ ...w, exercices: w.exercices.map((e, i) => i === idx ? { ...e, nom: v } : e) }))} />
                      <Button variant="ghost" className="text-red-400 px-2 self-end"
                        onClick={() => setEditWorkout(w => ({ ...w, exercices: w.exercices.filter((_, i) => i !== idx) }))}>✕</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input label="Series" type="number" min="1" value={ex.series}
                        onChange={v => setEditWorkout(w => ({ ...w, exercices: w.exercices.map((e, i) => i === idx ? { ...e, series: Number(v) } : e) }))} />
                      <Input label="Reps min" type="number" min="0" value={ex.repsMin}
                        onChange={v => setEditWorkout(w => ({ ...w, exercices: w.exercices.map((e, i) => i === idx ? { ...e, repsMin: Number(v) } : e) }))} />
                      <Input label="Reps max" type="number" min="0" value={ex.repsMax}
                        onChange={v => setEditWorkout(w => ({ ...w, exercices: w.exercices.map((e, i) => i === idx ? { ...e, repsMax: Number(v) } : e) }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input label="Poids (kg)" type="number" min="0" step="0.5" value={ex.poids}
                        onChange={v => setEditWorkout(w => ({ ...w, exercices: w.exercices.map((e, i) => i === idx ? { ...e, poids: Number(v) } : e) }))} />
                      <Input label="Repos (s)" type="number" min="0" step="10" value={ex.repos}
                        onChange={v => setEditWorkout(w => ({ ...w, exercices: w.exercices.map((e, i) => i === idx ? { ...e, repos: Number(v) } : e) }))} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button onClick={handleSave}>Enregistrer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

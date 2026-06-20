import { useState, useEffect } from 'react'
import { Card, Button, EmptyState, Modal, Input } from '../components/UI'
import { loadWorkoutsDoc, saveWorkoutsDoc, workoutForDay } from '../lib/workouts'
import { DEFAULT_EXERCICE } from '../lib/defaults'
import { uid } from '../lib/utils'
import { confirm } from '../components/ConfirmHost'
import Runner from './Runner'
import WodRunner from './WodRunner'
import ExerciseRow from '../components/ExerciseRow'

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
    setEditWorkout({ id: uid(), name: 'Nouvelle seance', exercices: [{ ...DEFAULT_EXERCICE, id: uid(), repos: 60, poids: 0 }] })
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
      <div className="w-8 h-8 border-2 border-surface-2 border-t-ember rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Seance du jour (selon semaine type) */}
      <div>
        <p className="text-xs text-muted uppercase tracking-wide mb-2">Aujourd'hui</p>
        {todayWorkout ? (
          <Card className="border-ember/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-text">{todayWorkout.name}</p>
                <p className="text-xs text-muted">{todayWorkout.exercices?.length || 0} exercice(s)</p>
              </div>
              <Button variant="success" onClick={() => setActiveRun(todayWorkout)}>Demarrer</Button>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-4">
            <p className="text-sm text-muted">Pas de seance prevue aujourd'hui. Profite du repos.</p>
          </Card>
        )}
      </div>

      {/* WOD Runner */}
      <Card className="flex items-center justify-between">
        <div>
          <p className="font-bold text-text flex items-center gap-2">🔥 WOD</p>
          <p className="text-xs text-muted">AMRAP, For Time, EMOM, Tabata</p>
        </div>
        <Button variant="secondary" onClick={() => setShowWod(true)}>Lancer un WOD</Button>
      </Card>

      {/* Bibliotheque complete */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Mes seances</h2>
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
              <Card key={w.id} className="hover:border-surface-2 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => openEdit(w)}>
                    <p className="font-semibold text-text truncate">{w.name || 'Seance sans nom'}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {w.exercices?.length ? w.exercices.length + ' exercice(s)' : 'Vide'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {w.exercices?.length > 0 && (
                      <Button variant="success" onClick={() => setActiveRun(w)} className="text-xs px-3 py-1.5">
                        Demarrer
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => openEdit(w)} className="text-muted px-2">✏️</Button>
                    <Button variant="ghost" onClick={() => handleDelete(w.id)} className="text-danger hover:text-danger px-2">🗑</Button>
                  </div>
                </div>
                {w.exercices?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-line flex flex-wrap gap-1.5">
                    {w.exercices.slice(0, 5).map((ex, i) => (
                      <span key={i} className="text-xs bg-surface-2 text-muted px-2 py-0.5 rounded-full">
                        {ex.nom || 'Exercice ' + (i + 1)}
                      </span>
                    ))}
                    {w.exercices.length > 5 && <span className="text-xs text-muted">+{w.exercices.length - 5}</span>}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      }

      <p className="text-[11px] text-muted text-center">
        Pour configurer la semaine type, va dans Reglages → Seances.
      </p>

      {/* Modal edition */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editWorkout?.name || 'Seance'}>
        {editWorkout && (
          <div className="space-y-4">
            <Input label="Nom de la seance" value={editWorkout.name} onChange={v => setEditWorkout(w => ({ ...w, name: v }))} placeholder="Ex : Full body A" />
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted font-medium">Exercices</p>
                <Button variant="ghost" className="text-xs py-1"
                  onClick={() => setEditWorkout(w => ({ ...w, exercices: [...(w.exercices || []), { ...DEFAULT_EXERCICE, id: uid(), repos: 60, poids: 0 }] }))}>
                  + Ajouter
                </Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(editWorkout.exercices || []).map((ex, idx) => (
                  <ExerciseRow
                    key={ex.id || idx}
                    ex={ex}
                    idx={idx}
                    onChange={(i, patch) => setEditWorkout(w => ({ ...w, exercices: w.exercices.map((e, j) => j === i ? { ...e, ...patch } : e) }))}
                    onRemove={(i) => setEditWorkout(w => ({ ...w, exercices: w.exercices.filter((_, j) => j !== i) }))}
                  />
                ))}
                {(editWorkout.exercices || []).length === 0 && (
                  <p className="text-sm text-muted text-center py-3">Aucun exercice. Clique + Ajouter.</p>
                )}
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

import { useState } from 'react'
import { Card, Button, Input, Modal } from '../components/UI'
import { WEEKDAYS } from '../lib/workouts'
import { DEFAULT_EXERCICE } from '../lib/defaults'
import { uid } from '../lib/utils'
import { confirm } from '../components/ConfirmHost'
import ExerciseRow from '../components/ExerciseRow'

export default function TrainingSettings({ workoutsDoc, onUpdate }) {
  const workouts = workoutsDoc.workouts || []
  const weekTemplate = workoutsDoc.weekTemplate || {}
  const [editWorkout, setEditWorkout] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const openNew = () => {
    setEditWorkout({ id: uid(), name: 'Nouvelle seance', exercices: [{ ...DEFAULT_EXERCICE, id: uid(), repos: 60, poids: 0 }] })
    setShowModal(true)
  }
  const openEdit = (w) => { setEditWorkout({ ...w }); setShowModal(true) }

  const saveWorkout = () => {
    const exists = workouts.some(w => w.id === editWorkout.id)
    const next = exists ? workouts.map(w => w.id === editWorkout.id ? editWorkout : w) : [...workouts, editWorkout]
    onUpdate({ workouts: next, weekTemplate })
    setShowModal(false)
  }

  const deleteWorkout = async (id) => {
    const w = workouts.find(x => x.id === id)
    const ok = await confirm(`Supprimer "${w?.name}" ? Les jours qui y sont assignes seront liberes.`, 'Supprimer la seance')
    if (!ok) return
    const nextTemplate = { ...weekTemplate }
    Object.keys(nextTemplate).forEach(d => { if (nextTemplate[d] === id) delete nextTemplate[d] })
    onUpdate({ workouts: workouts.filter(w => w.id !== id), weekTemplate: nextTemplate })
  }

  const duplicateWorkout = (w) => {
    const copy = { ...w, id: uid(), name: w.name + ' (copie)' }
    onUpdate({ workouts: [...workouts, copy], weekTemplate })
  }

  const assignDay = (weekday, workoutId) => {
    const next = { ...weekTemplate }
    if (workoutId === '') delete next[weekday]
    else next[weekday] = workoutId
    onUpdate({ workouts, weekTemplate: next })
  }

  const updateExercise = (idx, patch) => {
    setEditWorkout(w => ({ ...w, exercices: w.exercices.map((e, i) => i === idx ? { ...e, ...patch } : e) }))
  }
  const removeExercise = (idx) => {
    setEditWorkout(w => ({ ...w, exercices: w.exercices.filter((_, i) => i !== idx) }))
  }
  const addExercise = () => {
    setEditWorkout(w => ({ ...w, exercices: [...(w.exercices || []), { ...DEFAULT_EXERCICE, id: uid(), repos: 60, poids: 0 }] }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text">Mes seances</h2>
        <Button onClick={openNew}>+ Nouvelle</Button>
      </div>

      {workouts.length === 0 && (
        <Card className="text-center py-6">
          <p className="text-sm text-muted">Aucune seance creee.</p>
        </Card>
      )}

      <div className="space-y-2">
        {workouts.map(w => (
          <Card key={w.id} className="flex items-center justify-between">
            <div className="min-w-0 flex-1 cursor-pointer" onClick={() => openEdit(w)}>
              <p className="font-semibold text-text truncate">{w.name}</p>
              <p className="text-xs text-muted">{w.exercices?.length || 0} exercice(s)</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => duplicateWorkout(w)} className="p-2 text-muted text-sm">📋</button>
              <button onClick={() => openEdit(w)} className="p-2 text-muted text-sm">✏️</button>
              <button onClick={() => deleteWorkout(w.id)} className="p-2 text-danger text-sm">🗑</button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="space-y-3">
        <p className="font-bold text-text">Semaine type</p>
        <p className="text-xs text-muted">Assigne une seance a chaque jour de la semaine.</p>
        {WEEKDAYS.map(([label, wd]) => (
          <div key={wd} className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted w-24 flex-shrink-0">{label}</span>
            <select
              value={weekTemplate[wd] || ''}
              onChange={e => assignDay(wd, e.target.value)}
              className="flex-1 bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-ember"
            >
              <option value="">Repos</option>
              {workouts.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
        ))}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editWorkout?.name || 'Seance'}>
        {editWorkout && (
          <div className="space-y-4">
            <Input label="Nom de la seance" value={editWorkout.name} onChange={v => setEditWorkout(w => ({ ...w, name: v }))} />

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted font-medium">Exercices</p>
                <Button variant="ghost" className="text-xs py-1" onClick={addExercise}>+ Ajouter</Button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {(editWorkout.exercices || []).map((ex, idx) => (
                  <ExerciseRow key={ex.id || idx} ex={ex} idx={idx} onChange={updateExercise} onRemove={removeExercise} />
                ))}
                {(editWorkout.exercices || []).length === 0 && (
                  <p className="text-sm text-muted text-center py-3">Aucun exercice. Clique + Ajouter.</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button onClick={saveWorkout}>Enregistrer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

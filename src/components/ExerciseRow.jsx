import { useState } from 'react'

// Formulaire d'édition d'un exercice, partagé entre SeanceTab et TrainingSettings.
// Nom + Séries + Reps toujours visibles ; Poids / Repos masqués derrière ⚙️.
export default function ExerciseRow({ ex, idx, onChange, onRemove }) {
  const [showMore, setShowMore] = useState(false)
  const update = (patch) => onChange(idx, patch)

  return (
    <div className="bg-surface-2/50 rounded-lg p-3 space-y-2">
      <div className="flex gap-2 items-center">
        <input
          value={ex.nom}
          onChange={e => update({ nom: e.target.value })}
          placeholder="Nom de l'exercice"
          className="flex-1 bg-surface border border-line rounded-lg px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button onClick={() => onRemove(idx)} className="text-danger text-sm px-2 flex-shrink-0">✕</button>
      </div>

      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted w-10">Series</span>
          <button onClick={() => update({ series: Math.max(1, (ex.series || 1) - 1) })}
            className="w-7 h-7 rounded-full bg-surface text-text/80 flex items-center justify-center text-sm">-</button>
          <span className="w-6 text-center text-sm text-text tabular-nums">{ex.series}</span>
          <button onClick={() => update({ series: (ex.series || 1) + 1 })}
            className="w-7 h-7 rounded-full bg-surface text-text/80 flex items-center justify-center text-sm">+</button>
        </div>

        <div className="flex items-center gap-1.5 flex-1">
          <span className="text-xs text-muted w-8">Reps</span>
          <button onClick={() => update({ repsMin: Math.max(0, (ex.repsMin || 0) - 1), repsMax: Math.max(0, (ex.repsMax || 0) - 1) })}
            className="w-7 h-7 rounded-full bg-surface text-text/80 flex items-center justify-center text-sm">-</button>
          <span className="w-8 text-center text-sm text-text tabular-nums">{ex.repsMin === ex.repsMax ? ex.repsMin : `${ex.repsMin}-${ex.repsMax}`}</span>
          <button onClick={() => update({ repsMin: (ex.repsMin || 0) + 1, repsMax: (ex.repsMax || 0) + 1 })}
            className="w-7 h-7 rounded-full bg-surface text-text/80 flex items-center justify-center text-sm">+</button>
        </div>

        <button onClick={() => setShowMore(s => !s)} className="text-xs text-accent flex-shrink-0 px-1">
          {showMore ? '▲' : '⚙️'}
        </button>
      </div>

      {showMore && (
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <span className="text-xs text-muted block mb-1">Poids (kg)</span>
            <input type="number" min="0" step="0.5" value={ex.poids}
              onChange={e => update({ poids: Number(e.target.value) })}
              className="w-full bg-surface border border-line rounded-lg px-2 py-1.5 text-sm text-text" />
          </div>
          <div>
            <span className="text-xs text-muted block mb-1">Repos (s)</span>
            <input type="number" min="0" step="5" value={ex.repos}
              onChange={e => update({ repos: Number(e.target.value) })}
              className="w-full bg-surface border border-line rounded-lg px-2 py-1.5 text-sm text-text" />
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import Icon from '../components/Icon'
import Ring from '../components/Ring'
import ExerciseImg from '../components/ExerciseImg'
import { useBeep } from '../hooks/useBeep'
import { useWakeLock } from '../hooks/useWakeLock'
import { fmt } from '../lib/utils'

// Lanceur de WOD : échauffement (10 burpees + 10 remises debout) puis AMRAP chronométré.
export default function WodRunner({ wod, onClose, onDone }) {
  const safeWod = wod || { name: 'WOD', dur: 900, items: [] }
  const [phase, setPhase] = useState('warm1')   // warm1 -> warm2 -> amrap
  const [sec, setSec] = useState(safeWod.dur || 900)
  const [run, setRun] = useState(false)
  const { ensure, beep } = useBeep()
  const tickRef = useRef(null)

  useWakeLock(true)
  useEffect(() => { ensure() }, [])

  useEffect(() => {
    clearInterval(tickRef.current)
    if (phase !== 'amrap' || !run) return
    tickRef.current = setInterval(() => {
      setSec(s => {
        const nr = s - 1
        if (nr <= 5 && nr >= 1) beep(820, 0.09)
        if (nr <= 0) { clearInterval(tickRef.current); beep(440, 0.5); setRun(false); return 0 }
        return nr
      })
    }, 1000)
    return () => clearInterval(tickRef.current)
  }, [phase, run])

  const isWarm = phase === 'warm1' || phase === 'warm2'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-night text-text">
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={onClose} className="p-2 rounded-full bg-surface"><Icon name="x" size={20} className="text-muted" /></button>
        <div className="text-xs tracking-widest uppercase text-gold">{safeWod.name}</div>
        <div style={{ width: 36 }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {isWarm && (
          <>
            <div className="mb-3 px-3 py-1 rounded-full text-xs tracking-wider uppercase bg-surface text-gold">Échauffement</div>
            {phase === 'warm1' && <ExerciseImg name="Burpees" className="w-32 h-32 object-contain rounded-2xl mb-2 bg-surface" />}
            {phase === 'warm2' && <ExerciseImg name="Remises debout" className="w-32 h-32 object-contain rounded-2xl mb-2 bg-surface" />}
            <div className="text-3xl font-bold max-w-xs">{phase === 'warm1' ? 'Burpees' : 'Remises debout'}</div>
            <div className="mt-4 text-5xl font-extrabold text-dawn">10</div>
            <button
              onClick={() => setPhase(phase === 'warm1' ? 'warm2' : 'amrap')}
              className="mt-10 w-full max-w-xs py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 bg-dawn text-night shadow-glow"
            >
              <Icon name="check" size={22} /> Terminé
            </button>
          </>
        )}

        {phase === 'amrap' && (
          <>
            <div className="flex items-center gap-2 mb-1 text-gold">
              <Icon name="flame" size={18} />
              <span className="tracking-widest uppercase text-xs">AMRAP {Math.round((safeWod.dur || 900) / 60)} min · max de tours</span>
            </div>
            <div className="relative flex items-center justify-center my-2">
              <Ring value={sec} max={safeWod.dur || 900} id="gw" />
              <div className="absolute text-5xl font-bold tabular-nums">{fmt(sec)}</div>
            </div>
            <div className="w-full max-w-xs rounded-2xl p-4 mb-5 text-left bg-surface">
              {(safeWod.items || []).map((m, i) => (
                <div key={i} className="flex justify-between py-1.5" style={{ borderBottom: i < safeWod.items.length - 1 ? '1px solid var(--color-line)' : 'none' }}>
                  <span>{m.name}</span>
                  <span className="font-bold text-gold">×{m.reps}</span>
                </div>
              ))}
              {(safeWod.items || []).length === 0 && <p className="text-sm text-muted text-center">Aucun exercice dans ce WOD.</p>}
            </div>
            <button onClick={() => setRun(r => !r)} className="w-full max-w-xs py-3 rounded-2xl font-bold flex items-center justify-center gap-2 bg-dawn text-night shadow-glow">
              <Icon name={run ? 'pause' : 'play'} size={18} /> {run ? 'Pause' : 'Lancer le chrono'}
            </button>
            <button onClick={onDone} className="mt-4 w-full max-w-xs py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 bg-ok text-night">
              <Icon name="trophy" size={20} /> WOD terminé
            </button>
          </>
        )}
      </div>
    </div>
  )
}

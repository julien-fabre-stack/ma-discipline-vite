import { useState, useEffect, useRef } from 'react'
import Icon from '../components/Icon'
import Ring from '../components/Ring'
import ExerciseImg from '../components/ExerciseImg'
import { useBeep } from '../hooks/useBeep'
import { useWakeLock } from '../hooks/useWakeLock'
import { fmt, expandSession } from '../lib/utils'

// Runner plein écran fidèle à l'app d'origine.
// Accepte soit `steps` déjà calculées, soit une `seance` { exercices } qu'on déplie.
export default function Runner({ seance, steps: stepsProp, startIdx = 0, onClose, onProgress, onComplete }) {
  const steps = stepsProp || expandSession(seance?.exercices || seance?.items || [])
  const [idx, setIdx] = useState(startIdx)
  const [remaining, setRemaining] = useState(0)
  const [running, setRunning] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const beepApi = useBeep()
  const { ensure, beep } = beepApi
  const tickRef = useRef(null)
  const total = steps.length
  const step = steps[idx]

  useWakeLock(true)
  useEffect(() => { ensure() }, [])
  useEffect(() => { if (onProgress) onProgress(idx) }, [idx])

  // chrono total
  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // init du minuteur quand on change d'étape
  useEffect(() => {
    if (!step) return
    if (step.kind === 'rest' || step.kind === 'timed') setRemaining(step.dur)
    else setRemaining(0)
    setRunning(true)
  }, [idx])

  // décompte des étapes minutées
  useEffect(() => {
    clearInterval(tickRef.current)
    const isTimer = step && (step.kind === 'rest' || step.kind === 'timed')
    if (!isTimer || !running) return
    tickRef.current = setInterval(() => {
      setRemaining(r => {
        const nr = r - 1
        if (nr <= 5 && nr >= 1) beep(820, 0.09)
        if (nr <= 0) {
          clearInterval(tickRef.current)
          beep(440, 0.45)
          setTimeout(() => setIdx(i => Math.min(i + 1, total)), 100)
          return 0
        }
        return nr
      })
    }, 1000)
    return () => clearInterval(tickRef.current)
  }, [idx, running])

  const next = () => setIdx(i => Math.min(i + 1, total))
  const prev = () => setIdx(i => Math.max(i - 1, 0))
  const finished = idx >= total

  useEffect(() => { if (finished) onComplete && onComplete(elapsed) }, [finished])

  if (finished || !step) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-night text-text px-6">
        <Icon name="trophy" size={48} className="text-gold" />
        <p className="font-bold text-xl">Séance terminée !</p>
        <p className="text-muted text-sm">Durée : {fmt(elapsed)}</p>
        <button onClick={() => onComplete && onComplete(elapsed)} className="px-6 py-3 rounded-2xl font-bold bg-dawn text-night shadow-glow">
          Fermer
        </button>
      </div>
    )
  }

  const isTimer = step.kind === 'rest' || step.kind === 'timed'

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-night text-text">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <button onClick={onClose} className="p-2 rounded-full bg-surface"><Icon name="x" size={20} className="text-muted" /></button>
        <div className="text-xs tracking-widest uppercase text-center flex-1 px-2 truncate text-muted">{step.block}</div>
        <div className="text-xs tabular-nums text-muted">{idx + 1}/{total}</div>
      </div>

      {/* Barre de progression */}
      <div className="mx-5 h-1 rounded-full overflow-hidden bg-surface-2">
        <div className="h-full bg-dawn" style={{ width: `${(idx / total) * 100}%`, transition: 'width 320ms cubic-bezier(.22,1,.36,1)' }} />
      </div>

      {/* Corps */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div key={idx} className="fade-enter flex flex-col items-center w-full">
          {step.tag && (
            <div className="mb-3 px-3 py-1 rounded-full text-xs tracking-wider uppercase bg-surface text-gold">Série {step.tag}</div>
          )}
          {step.kind !== 'rest' && (
            <ExerciseImg name={step.name} className="w-40 h-40 object-contain rounded-2xl mb-4 bg-surface" />
          )}

          {isTimer ? (
            <div className="relative flex items-center justify-center my-2">
              <Ring value={remaining} max={step.dur} />
              <div className="absolute flex flex-col items-center">
                <div className="text-6xl font-bold tabular-nums">{fmt(remaining)}</div>
                <div className="text-sm mt-1 max-w-[10rem] text-muted">{step.kind === 'timed' ? step.name : 'Récupération'}</div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold leading-tight max-w-xs">{step.name}</div>
              <div className="mt-4 text-5xl font-extrabold text-dawn">{step.reps}</div>
            </>
          )}

          {step.kind === 'work' && (
            <button onClick={next} className="mt-10 w-full max-w-xs py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 bg-dawn text-night shadow-glow">
              <Icon name="check" size={22} /> Terminé
            </button>
          )}

          {isTimer && (
            <div className="mt-8 flex gap-3 w-full max-w-xs">
              <button onClick={() => setRunning(r => !r)} className="flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center bg-surface text-text">
                <Icon name={running ? 'pause' : 'play'} size={18} />
              </button>
              <button onClick={next} className="flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 bg-surface text-gold">
                <Icon name="skip" size={18} /> Passer
              </button>
            </div>
          )}
        </div>

        <button onClick={prev} className="mt-6 text-xs text-muted">← étape précédente</button>
      </div>
    </div>
  )
}

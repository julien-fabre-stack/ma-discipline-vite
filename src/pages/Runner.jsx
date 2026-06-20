import { useState, useEffect, useRef, useCallback } from 'react'
import { Button, Card, ProgressBar } from '../components/UI'
import { useBeep } from '../hooks/useBeep'
import { formatDuration } from '../lib/utils'

export default function Runner({ seance, onClose, onComplete }) {
  const [exIdx, setExIdx]     = useState(0)
  const [setIdx, setSetIdx]   = useState(0)
  const [phase, setPhase]     = useState('work')
  const [timer, setTimer]     = useState(0)
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef           = useRef(null)
  const beep                  = useBeep()

  const exercices = seance?.exercices || []
  const ex        = exercices[exIdx]

  useEffect(() => {
    const id = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (!running || phase !== 'rest') return
    intervalRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current)
          beep(440, 300)
          setPhase('work')
          setRunning(false)
          return 0
        }
        if (t === 4) beep(880, 100)
        return t - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, phase, beep])

  const startRest = useCallback(() => {
    setTimer(ex?.repos ?? 90)
    setPhase('rest')
    setRunning(true)
    beep(660, 200)
  }, [ex, beep])

  const nextSet = useCallback(() => {
    if (setIdx + 1 < (ex?.series ?? 3)) {
      setSetIdx(s => s + 1)
      startRest()
    } else if (exIdx + 1 < exercices.length) {
      setExIdx(i => i + 1)
      setSetIdx(0)
      setPhase('work')
    } else {
      onComplete?.(elapsed)
    }
  }, [setIdx, ex, exIdx, exercices, elapsed, startRest, onComplete])

  if (!ex) return (
    <div className="flex flex-col items-center justify-center h-full gap-6 py-20">
      <p className="font-semibold text-slate-100">Seance terminee !</p>
      <p className="text-slate-400 text-sm">Duree : {formatDuration(elapsed)}</p>
      <Button onClick={() => onComplete?.(elapsed)}>Fermer</Button>
    </div>
  )

  const restPct = phase === 'rest' ? (timer / (ex.repos || 90)) * 100 : 100

  return (
    <div className="flex flex-col gap-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400">Exercice {exIdx + 1}/{exercices.length}</p>
          <h2 className="font-bold text-slate-100 text-lg">{ex.nom}</h2>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Temps total</p>
          <p className="font-mono text-sky-400">{formatDuration(elapsed)}</p>
        </div>
      </div>

      <Card className="text-center py-6">
        {phase === 'work' ? (
          <>
            <p className="text-5xl font-bold text-slate-100">
              {setIdx + 1}<span className="text-2xl text-slate-400">/{ex.series}</span>
            </p>
            <p className="text-slate-400 mt-2">
              {ex.repsMin === ex.repsMax ? ex.repsMin : ex.repsMin + '-' + ex.repsMax} reps
              {ex.poids ? ' - ' + ex.poids + ' kg' : ''}
            </p>
            <Button className="mt-4" onClick={nextSet}>
              {setIdx + 1 < ex.series ? 'Serie faite - Repos' : exIdx + 1 < exercices.length ? 'Exercice suivant' : 'Terminer la seance'}
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-2">Repos</p>
            <p className="text-5xl font-mono font-bold text-sky-400">{timer}s</p>
            <ProgressBar value={restPct} max={100} color="sky" className="mt-4" />
            <Button variant="ghost" className="mt-4 text-xs" onClick={() => { setRunning(false); setPhase('work') }}>
              Passer
            </Button>
          </>
        )}
      </Card>

      <div className="space-y-1">
        {exercices.map((e, i) => (
          <div key={e.id || i} className={'flex items-center gap-2 p-2 rounded-lg text-sm ' + (i === exIdx ? 'bg-sky-900/40 text-sky-300' : i < exIdx ? 'text-slate-600' : 'text-slate-400')}>
            <span>{i < exIdx ? 'OK' : i === exIdx ? '>' : 'o'}</span>
            <span className="flex-1 truncate">{e.nom}</span>
            <span className="text-xs">{e.series}x{e.repsMin}</span>
          </div>
        ))}
      </div>

      <Button variant="ghost" onClick={onClose} className="text-slate-500 text-xs">Abandonner la seance</Button>
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'
import { Button, Card } from '../components/UI'
import { useBeep } from '../hooks/useBeep'
import { formatDuration } from '../lib/utils'

const MODES = [
  { id: 'amrap',   label: 'AMRAP',   desc: 'Max rounds en temps limite' },
  { id: 'fortime', label: 'For Time', desc: 'Terminer le plus vite possible' },
  { id: 'emom',    label: 'EMOM',    desc: 'Chaque minute, une tache' },
  { id: 'tabata',  label: 'Tabata',  desc: '20s effort / 10s repos x8' },
]

export default function WodRunner({ onClose }) {
  const [mode, setMode]         = useState(null)
  const [duration, setDuration] = useState(600)
  const [timer, setTimer]       = useState(0)
  const [running, setRunning]   = useState(false)
  const [rounds, setRounds]     = useState(0)
  const intervalRef             = useRef(null)
  const beep                    = useBeep()

  useEffect(() => {
    clearInterval(intervalRef.current)
    if (!running) return
    intervalRef.current = setInterval(() => {
      setTimer(t => {
        if (mode === 'amrap' || mode === 'emom') {
          if (t + 1 >= duration) { setRunning(false); beep(440, 500); return duration }
          if (mode === 'emom' && (t + 1) % 60 === 0) beep(880, 200)
          return t + 1
        }
        if (mode === 'fortime') return t + 1
        if (mode === 'tabata') {
          const cycle = 30
          if ((t + 1) % cycle === 20) beep(440, 150)
          if ((t + 1) % cycle === 0)  { beep(880, 200); setRounds(r => r + 1) }
          if (t + 1 >= cycle * 8)     { setRunning(false); beep(440, 500); return cycle * 8 }
          return t + 1
        }
        return t
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, mode, duration, beep])

  const toggle = () => { if (!mode) return; setRunning(r => !r) }
  const reset  = () => { setRunning(false); setTimer(0); setRounds(0) }

  if (!mode) return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-100">WOD Runner</h2>
        <Button variant="ghost" onClick={onClose}>Fermer</Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {MODES.map(m => (
          <Card key={m.id} className="cursor-pointer hover:border-sky-500 transition-colors text-center" onClick={() => setMode(m.id)}>
            <p className="font-bold text-sky-400">{m.label}</p>
            <p className="text-xs text-slate-400 mt-1">{m.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  )

  const tabataPhase = mode === 'tabata' ? (timer % 30 < 20 ? 'EFFORT' : 'REPOS') : null
  const display     = (mode === 'amrap' || mode === 'emom') ? formatDuration(duration - timer) : formatDuration(timer)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-slate-100">{MODES.find(m => m.id === mode)?.label}</h2>
        <Button variant="ghost" onClick={() => { reset(); setMode(null) }}>Retour</Button>
      </div>
      <Card className="text-center py-8">
        {tabataPhase && <p className={'text-sm font-bold mb-2 ' + (tabataPhase === 'EFFORT' ? 'text-red-400' : 'text-sky-400')}>{tabataPhase}</p>}
        <p className="text-6xl font-mono font-bold text-slate-100">{display}</p>
        {mode === 'tabata' && <p className="text-slate-400 mt-2">Round {Math.floor(timer / 30) + 1}/8</p>}
        {mode === 'amrap'  && <p className="text-slate-400 mt-2">Rounds : {rounds}</p>}
      </Card>
      {(mode === 'amrap' || mode === 'emom') && (
        <div className="flex gap-2 items-center">
          <label className="text-xs text-slate-400 whitespace-nowrap">Duree (min)</label>
          <input type="range" min="60" max="3600" step="60" value={duration}
            onChange={e => { setDuration(Number(e.target.value)); reset() }}
            className="flex-1 accent-sky-500" />
          <span className="text-xs text-sky-400 w-10 text-right">{duration / 60}min</span>
        </div>
      )}
      {mode === 'amrap' && running && (
        <Button variant="secondary" onClick={() => setRounds(r => r + 1)}>+ Round</Button>
      )}
      <div className="flex gap-3">
        <Button className="flex-1" onClick={toggle} variant={running ? 'warning' : 'primary'}>
          {running ? 'Pause' : timer > 0 ? 'Reprendre' : 'Demarrer'}
        </Button>
        <Button variant="ghost" onClick={reset}>Reset</Button>
      </div>
    </div>
  )
}

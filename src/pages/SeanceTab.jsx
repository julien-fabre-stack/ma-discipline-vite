import { useState, useEffect } from 'react'
import Icon from '../components/Icon'
import { Collapsible } from '../components/Collapsible'
import Runner from './Runner'
import WodRunner from './WodRunner'
import { loadWorkoutsDoc, saveWorkoutsDoc, workoutForDay } from '../lib/workouts'
import { loadAgendaDoc, saveAgendaDoc, cycleLabelFor, dateKey } from '../lib/agenda'

const WD = [['Lundi', 1], ['Mardi', 2], ['Mercredi', 3], ['Jeudi', 4], ['Vendredi', 5], ['Samedi', 6], ['Dimanche', 0]]

export default function SeanceTab({ user }) {
  const today = dateKey()
  const [wDoc, setWDoc]   = useState(null)
  const [aDoc, setADoc]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [run, setRun]     = useState(null)   // { startIdx }
  const [wod, setWod]     = useState(null)    // wod en cours
  const [openWeek, setOpenWeek] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([loadWorkoutsDoc(user.uid), loadAgendaDoc(user.uid)])
      .then(([w, a]) => { setWDoc(w); setADoc(a); setLoading(false) })
  }, [user])

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-surface-2 border-t-ember rounded-full animate-spin" />
    </div>
  )

  const workouts = wDoc?.workouts || []
  const wt = wDoc?.weekTemplate || {}
  const todayWorkout = wDoc ? workoutForDay(wDoc, today) : null
  const progress = wDoc?.progress
  const hasProg = progress && progress.idx > 0 && todayWorkout
  const wods = aDoc?.wods || []
  const todayWd = new Date().getDay()
  const nameOf = (wid) => { const w = workouts.find(x => x.id === wid); return w ? w.name : null }

  const day = (aDoc?.days || {})[today] || {}
  const sportDone = day.habits && !Array.isArray(day.habits) && day.habits.sport

  const saveW = async (patch) => { const next = { ...wDoc, ...patch }; setWDoc(next); await saveWorkoutsDoc(user.uid, patch) }
  const saveA = async (patch) => { const next = { ...aDoc, ...patch }; setADoc(next); await saveAgendaDoc(user.uid, patch) }

  const onProgress = (idx) => { saveW({ progress: { idx } }) }
  const onSeanceDone = () => { saveW({ progress: null }); markSport(true); setRun(null) }

  const markSport = async (force) => {
    const cur = (aDoc?.days || {})[today] || {}
    const habits = (cur.habits && !Array.isArray(cur.habits)) ? cur.habits : {}
    const nextVal = force ? true : !habits.sport
    const nextDays = { ...(aDoc?.days || {}), [today]: { ...cur, habits: { ...habits, sport: nextVal } } }
    await saveA({ days: nextDays })
  }

  if (run) {
    return (
      <Runner
        seance={todayWorkout}
        startIdx={run.startIdx || 0}
        onClose={() => setRun(null)}
        onProgress={onProgress}
        onComplete={onSeanceDone}
      />
    )
  }
  if (wod) {
    return <WodRunner wod={wod} onClose={() => setWod(null)} onDone={() => { markSport(true); setWod(null) }} />
  }

  return (
    <div className="pb-4">
      {/* Entête : date + workout du jour + cycle */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-xs tracking-widest uppercase mb-1 text-muted">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-text">{todayWorkout ? todayWorkout.name : 'Repos'}</h1>
          <div className="text-sm text-gold">{cycleLabelFor(aDoc, today)}</div>
        </div>
      </div>

      {/* Carte séance du jour */}
      {todayWorkout ? (
        <div className="rounded-3xl p-5 mb-4 bg-surface border border-line">
          <div className="font-bold mb-1 text-text">{todayWorkout.name}</div>
          <div className="text-sm mb-4 text-muted">
            {(todayWorkout.exercices || []).length} exercices · minuteurs auto.{hasProg && ' Séance en cours.'}
          </div>
          <div className="flex gap-2">
            {hasProg && (
              <button onClick={() => setRun({ startIdx: progress.idx })} className="flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 bg-dawn text-night shadow-glow">
                <Icon name="play" size={20} /> Reprendre
              </button>
            )}
            <button
              onClick={() => setRun({ startIdx: 0 })}
              className={'flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 ' + (hasProg ? 'bg-surface-2 text-text' : 'bg-dawn text-night shadow-glow')}
            >
              <Icon name={hasProg ? 'skip' : 'play'} size={20} /> {hasProg ? 'Recommencer' : 'Démarrer'}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl p-5 mb-4 text-center bg-surface border border-line">
          <div className="text-sm text-muted">Pas de séance prévue aujourd'hui. Profite du repos.</div>
        </div>
      )}

      {/* Bibliothèque WOD */}
      <div className="rounded-3xl p-5 mb-4 bg-surface border border-line">
        <div className="font-bold mb-1 flex items-center gap-2 text-text"><Icon name="flame" size={18} className="text-gold" /> WOD</div>
        <div className="text-sm mb-3 text-muted">Échauffement 10 burpees + 10 remises debout, puis le WOD choisi.</div>
        {wods.length === 0 ? (
          <div className="text-sm text-gold">Ajoute tes WODs dans Réglages → Training → WOD.</div>
        ) : wods.map(w => (
          <button key={w.id} onClick={() => setWod(w)} className="w-full flex items-center justify-between px-4 py-3 rounded-2xl mb-2 bg-surface-2">
            <span className="text-sm font-medium text-text">{w.name}</span>
            <Icon name="play" size={18} className="text-gold" />
          </button>
        ))}
      </div>

      {/* Marquer sport */}
      <button onClick={() => markSport(false)} className={'w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 mb-6 bg-surface-2 ' + (sportDone ? 'text-ok' : 'text-text')}>
        <Icon name="check" size={18} /> {sportDone ? '« Sport » fait ✓' : 'Marquer « Sport » fait aujourd\'hui'}
      </button>

      {/* Semaine type */}
      <Collapsible title="La semaine type" open={openWeek} onToggle={() => setOpenWeek(o => !o)}>
        <div className="rounded-2xl overflow-hidden border border-line">
          {WD.map(([lbl, wd], i) => {
            const nm = nameOf(wt[wd]); const isToday = wd === todayWd
            return (
              <div key={wd} className="flex justify-between px-4 py-3 text-sm"
                style={{ background: isToday ? 'var(--color-surface-2)' : (i % 2 ? 'var(--color-surface)' : 'var(--color-night)'), borderLeft: isToday ? '3px solid var(--color-gold)' : '3px solid transparent' }}>
                <span style={{ fontWeight: isToday ? 700 : 400, color: isToday ? 'var(--color-gold)' : 'var(--color-text)' }}>{lbl}</span>
                <span style={{ color: nm ? 'var(--color-text)' : 'var(--color-muted)' }}>{nm || 'Repos'}</span>
              </div>
            )
          })}
        </div>
      </Collapsible>
    </div>
  )
}

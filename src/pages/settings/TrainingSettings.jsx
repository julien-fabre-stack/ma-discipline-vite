import { useState } from 'react'
import Icon from '../../components/Icon'
import Stepper from '../../components/Stepper'
import ExerciseImg from '../../components/ExerciseImg'
import { exerciseImageSrc } from '../../lib/exercises'
import { uid } from '../../lib/utils'
import WodSettings from './WodSettings'

const WD = [['Lun', 1], ['Mar', 2], ['Mer', 3], ['Jeu', 4], ['Ven', 5], ['Sam', 6], ['Dim', 0]]

// Editeur plein-bloc d'un exercice (format Vite : nom/series/repsMin/repsMax/poids/repos + timed/dur).
function ExerciseEditor({ ex, onChange, onClose }) {
  const inputCls = 'w-full px-3 py-2.5 rounded-xl outline-none text-sm bg-surface text-text'
  return (
    <div className="rounded-2xl p-4 mb-3 bg-surface-2">
      <ExerciseImg name={ex.nom} className="w-full h-40 object-contain rounded-xl mb-3 bg-surface" />
      <input value={ex.nom || ''} onChange={e => onChange({ nom: e.target.value })} className={inputCls + ' mb-3'} placeholder="Nom de l'exercice" />
      <div className="flex items-center justify-between py-2 text-sm"><span>Séries</span><Stepper value={ex.series || 1} min={1} onChange={v => onChange({ series: v })} /></div>
      <div className="flex items-center justify-between py-2 text-sm">
        <span>Chronométré</span>
        <button onClick={() => onChange({ timed: !ex.timed })} className={'px-3 py-1.5 rounded-full text-xs font-semibold ' + (ex.timed ? 'bg-ember text-night' : 'bg-surface text-muted')}>
          {ex.timed ? 'Oui' : 'Non'}
        </button>
      </div>
      {ex.timed ? (
        <div className="flex items-center justify-between py-2 text-sm"><span>Durée (s)</span><Stepper value={ex.dur || 20} min={5} step={5} onChange={v => onChange({ dur: v })} /></div>
      ) : (
        <>
          <div className="flex items-center justify-between py-2 text-sm"><span>Reps min</span><Stepper value={ex.repsMin || 0} min={0} onChange={v => onChange({ repsMin: v, repsMax: Math.max(v, ex.repsMax || 0) })} /></div>
          <div className="flex items-center justify-between py-2 text-sm"><span>Reps max</span><Stepper value={ex.repsMax || 0} min={0} onChange={v => onChange({ repsMax: v })} /></div>
        </>
      )}
      <div className="flex items-center justify-between py-2 text-sm"><span>Poids (kg)</span><Stepper value={ex.poids || 0} min={0} onChange={v => onChange({ poids: v })} /></div>
      <div className="flex items-center justify-between py-2 text-sm"><span>Repos après (s)</span><Stepper value={ex.repos || 0} min={0} step={5} onChange={v => onChange({ repos: v })} /></div>
      <button onClick={onClose} className="w-full mt-3 py-2.5 rounded-xl font-semibold bg-dawn text-night shadow-glow">OK</button>
    </div>
  )
}

function ExerciseList({ items, onChange }) {
  const [edit, setEdit] = useState(null)
  const move = (i, dir) => { const s = [...items]; const j = i + dir; if (j < 0 || j >= s.length) return;[s[i], s[j]] = [s[j], s[i]]; onChange(s) }
  const del = (i) => { onChange(items.filter((_, j) => j !== i)); setEdit(null) }
  const add = () => { const s = [...items, { id: uid(), nom: 'Nouvel exercice', repsMin: 10, repsMax: 10, repos: 60, series: 1, poids: 0, timed: false, dur: 20 }]; onChange(s); setEdit(s.length - 1) }
  const setEx = (i, patch) => { const s = [...items]; s[i] = { ...s[i], ...patch }; onChange(s) }
  const dup = (i) => { const s = [...items]; s.splice(i + 1, 0, { ...s[i], id: uid() }); onChange(s); setEdit(i + 1) }

  if (edit != null && items[edit]) return <ExerciseEditor ex={items[edit]} onChange={p => setEx(edit, p)} onClose={() => setEdit(null)} />

  const repsLabel = (ex) => ex.timed ? (ex.dur + ' s') : (ex.repsMin === ex.repsMax ? ex.repsMin + ' reps' : `${ex.repsMin}-${ex.repsMax} reps`)

  return (
    <>
      <div className="text-xs mb-3 text-muted">Repos = 0 → exercice enchaîné avec le suivant.</div>
      {items.map((ex, i) => (
        <div key={ex.id || i} className="flex items-center gap-2 mb-2 px-3 py-2.5 rounded-xl bg-surface-2">
          <div className="flex flex-col gap-0.5">
            <button onClick={() => move(i, -1)} className="p-0.5"><Icon name="up" size={14} className="text-muted" /></button>
            <button onClick={() => move(i, 1)} className="p-0.5"><Icon name="down" size={14} className="text-muted" /></button>
          </div>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-surface">
            {exerciseImageSrc(ex.nom)
              ? <ExerciseImg name={ex.nom} className="w-full h-full object-cover" />
              : <Icon name="dumbbell" size={16} className="text-muted" />}
          </div>
          <button onClick={() => setEdit(i)} className="flex-1 text-left min-w-0">
            <div className="text-sm truncate">{ex.nom}</div>
            <div className="text-xs text-muted">{ex.series > 1 ? ex.series + '× ' : ''}{repsLabel(ex)} · repos {ex.repos || 0}s</div>
          </button>
          <button onClick={() => setEdit(i)} className="p-1.5 rounded-lg bg-surface"><Icon name="edit" size={14} className="text-gold" /></button>
          <button onClick={() => dup(i)} className="p-1.5 rounded-lg bg-surface"><Icon name="copy" size={14} className="text-muted" /></button>
          <button onClick={() => del(i)} className="p-1.5 rounded-lg bg-surface"><Icon name="trash" size={14} className="text-muted" /></button>
        </div>
      ))}
      <button onClick={add} className="w-full py-2.5 rounded-xl font-semibold text-sm mt-1 bg-surface-2 text-gold">+ Ajouter un exercice</button>
    </>
  )
}

export default function TrainingSettings({ data, update }) {
  const workouts = data.workouts || []
  const wt = data.weekTemplate || {}
  const [openId, setOpenId] = useState(null)

  const setWorkouts = (ws) => update({ workouts: ws })
  const setItems = (wid, items) => setWorkouts(workouts.map(w => w.id === wid ? { ...w, exercices: items } : w))
  const rename = (wid, name) => setWorkouts(workouts.map(w => w.id === wid ? { ...w, name } : w))
  const addW = () => { const id = uid(); setWorkouts([...workouts, { id, name: 'Nouveau workout', exercices: [] }]); setOpenId(id) }
  const delW = (wid) => { const ws = workouts.filter(w => w.id !== wid); const nt = { ...wt }; Object.keys(nt).forEach(d => { if (nt[d] === wid) delete nt[d] }); update({ workouts: ws, weekTemplate: nt }) }
  const setDayW = (wd, wid) => { const nt = { ...wt }; if (wid) nt[wd] = wid; else delete nt[wd]; update({ weekTemplate: nt }) }

  return (
    <>
      <div className="text-xs tracking-widest uppercase mb-1 text-muted">Workouts</div>
      <div className="text-xs mb-3 text-muted">Touche un workout pour déplier et modifier son contenu.</div>

      {workouts.map(w => {
        const open = openId === w.id
        return (
          <div key={w.id} className="rounded-2xl mb-3 overflow-hidden bg-surface border border-line">
            <div className="flex items-center px-3 py-2.5 gap-2">
              <button onClick={() => setOpenId(open ? null : w.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                <Icon name="down" size={14} className="text-muted" style={{ transition: 'transform 320ms cubic-bezier(.22,1,.36,1)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                <span className="min-w-0">
                  <span className="text-sm font-semibold block truncate">{w.name}</span>
                  <span className="text-xs block text-muted">{(w.exercices || []).length} exercices</span>
                </span>
              </button>
              {workouts.length > 1 && <button onClick={() => delW(w.id)} className="p-1.5 rounded-lg flex-shrink-0 bg-surface-2"><Icon name="trash" size={14} className="text-muted" /></button>}
            </div>
            <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 320ms cubic-bezier(.22,1,.36,1)' }}>
              <div style={{ minHeight: 0, overflow: 'hidden', opacity: open ? 1 : 0, transition: `opacity 220ms ease ${open ? '60ms' : '0ms'}` }}>
                <div className="px-3 pb-3 border-t border-line">
                  <div className="text-xs tracking-widest uppercase mt-3 mb-1 text-muted">Nom</div>
                  <input value={w.name} onChange={e => rename(w.id, e.target.value)} className="w-full px-3 py-2.5 rounded-xl mb-3 outline-none text-sm bg-surface-2 text-text" />
                  <ExerciseList items={w.exercices || []} onChange={items => setItems(w.id, items)} />
                </div>
              </div>
            </div>
          </div>
        )
      })}
      <button onClick={addW} className="w-full py-2.5 rounded-xl font-semibold text-sm mb-6 bg-surface-2 text-gold">+ Ajouter un workout</button>

      <WodSettings data={data} update={update} />

      <div style={{ height: 24 }} />
      <div className="text-xs tracking-widest uppercase mb-1 text-muted">Semaine type</div>
      <div className="text-xs mb-3 text-muted">Quel workout appliquer chaque jour (sinon repos).</div>
      <div className="rounded-2xl overflow-hidden border border-line">
        {WD.map(([lbl, wd], i) => (
          <div key={wd} className="flex items-center gap-2 px-3 py-2" style={{ background: i % 2 ? 'var(--color-surface)' : 'var(--color-night)' }}>
            <span className="text-sm w-10 flex-shrink-0">{lbl}</span>
            <select value={wt[wd] || ''} onChange={e => setDayW(wd, e.target.value)} className="flex-1 px-3 py-2 rounded-xl outline-none text-sm bg-surface-2 text-text border border-line">
              <option value="">Repos</option>
              {workouts.map(w => (<option key={w.id} value={w.id}>{w.name}</option>))}
            </select>
          </div>
        ))}
      </div>
    </>
  )
}

import { useState } from 'react'
import { Button, Input } from '../components/UI'
import { Collapsible } from '../components/Collapsible'
import { statusOf, activitiesOf, eventsOf, sportStatus, parseKey, dayType, uid, RDV_COLORS } from '../lib/agenda'
import { confirm } from '../components/ConfirmHost'

export default function DayPanel({ data, agenda, update, dayKey, cycleStart }) {
  const rdvTypes = agenda.rdvTypes || []
  const day = data.days?.[dayKey] || {}
  const todos = day.todos || []
  const note = day.note || ''
  const habits = data.habits || []
  const dh = (day.habits && !Array.isArray(day.habits)) ? day.habits : {}

  const [newTodo, setNewTodo]   = useState('')
  const [evtDraft, setEvtDraft] = useState(null)
  const [noteVal, setNoteVal]   = useState(note)
  const [open, setOpen]         = useState({ habits: false, rdv: false, todo: false, note: false })
  const toggle = k => setOpen(o => ({ ...o, [k]: !o[k] }))

  const st    = statusOf(agenda, dayKey)
  const acts  = activitiesOf(agenda, dayKey)
  const evts  = eventsOf(agenda, dayKey)
  const sport = sportStatus(agenda, dayKey, cycleStart, dayType)

  const setDay = (patch) => {
    const days = { ...(data.days || {}) }
    days[dayKey] = { ...day, ...patch }
    update({ days })
  }
  const setHabit = (id) => setDay({ habits: { ...dh, [id]: !dh[id] } })
  const addTodo = () => {
    if (!newTodo.trim()) return
    setDay({ todos: [...todos, { id: uid(), text: newTodo.trim(), done: false }] })
    setNewTodo('')
  }
  const toggleTodo = (id) => setDay({ todos: todos.map(t => t.id === id ? { ...t, done: !t.done } : t) })
  const delTodo = async (id) => {
    const t = todos.find(x => x.id === id)
    const ok = await confirm(`Supprimer "${t?.text || 'cette tache'}" ?`, 'Supprimer la tache')
    if (!ok) return
    setDay({ todos: todos.filter(t => t.id !== id) })
  }
  const addEvent = () => {
    if (!evtDraft || !evtDraft.label.trim()) return
    const events = [...(agenda.events || []), {
      id: uid(), date: dayKey, label: evtDraft.label.trim(),
      time: evtDraft.time || '', typeId: evtDraft.typeId || null,
      color: evtDraft.color || RDV_COLORS[0],
    }]
    update({ agenda: { ...agenda, events } })
    setEvtDraft(null)
  }
  const delEvent = async (id) => {
    const e = (agenda.events || []).find(x => x.id === id)
    const ok = await confirm(`Supprimer "${e?.label || 'ce rendez-vous'}" ?`, 'Supprimer le RDV')
    if (!ok) return
    update({ agenda: { ...agenda, events: (agenda.events || []).filter(e => e.id !== id) } })
  }
  const saveNote = () => setDay({ note: noteVal })

  const dateLabel = parseKey(dayKey).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const doneCount = habits.filter(h => dh[h.id]).length
  const openTodos = todos.filter(t => !t.done).length

  return (
    <div>
      <div className="font-bold capitalize mb-2 text-text text-sm">{dateLabel}</div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        {st && <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: st.color, color: '#1A1206' }}>{st.label}</span>}
        <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-surface-2 text-text">
          Sport : <span className={sport === 'actif' ? 'font-bold underline' : 'italic text-muted'}>{sport}</span>
        </span>
        {acts.map(a => (
          <span key={a.id} className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5 bg-night text-text" style={{ border: `1px solid ${a.color}` }}>
            <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />{a.label}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-muted mb-3">
        Pour definir le statut, cycle ou activite de ce jour : Reglages → Suivi → Planning.
      </p>

      <Collapsible title="Habitudes" badge={`${doneCount}/${habits.length}`} open={open.habits} onToggle={() => toggle('habits')}>
        <div className="rounded-xl overflow-hidden border border-line">
          {habits.map((h, i) => (
            <button key={h.id} onClick={() => setHabit(h.id)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 text-left ${i % 2 ? 'bg-night' : 'bg-surface'}`}>
              <div className={`rounded-full flex items-center justify-center flex-shrink-0 w-[18px] h-[18px] ${dh[h.id] ? 'bg-dawn' : 'border-2 border-surface-2'}`}>
                {dh[h.id] && <span className="text-[9px] text-night font-bold">✓</span>}
              </div>
              <span className={`text-xs ${dh[h.id] ? 'text-text' : 'text-muted'}`}>{h.label}</span>
            </button>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Rendez-vous" badge={evts.length || null} open={open.rdv} onToggle={() => toggle('rdv')}>
        <div className="rounded-xl mb-2 overflow-hidden bg-night border border-line">
          {evts.length === 0 && <div className="px-3 py-2.5 text-sm text-muted">Aucun RDV.</div>}
          {evts.map((e, i) => {
            const rt = rdvTypes.find(x => x.id === e.typeId)
            const sub = [rt?.label, e.time].filter(Boolean).join(' - ')
            return (
              <div key={e.id} className={`flex items-center gap-2 px-3 py-2.5 ${i > 0 ? 'border-t border-line' : ''}`}>
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.color || RDV_COLORS[0] }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text">{e.label}</div>
                  {sub && <div className="text-xs text-gold">{sub}</div>}
                </div>
                <button onClick={() => delEvent(e.id)} className="p-1.5 rounded-lg bg-surface-2 text-muted text-xs">✕</button>
              </div>
            )
          })}
        </div>
        {evtDraft ? (
          <div className="rounded-xl p-3 mb-1 bg-night">
            <input autoFocus value={evtDraft.label} onChange={e => setEvtDraft({ ...evtDraft, label: e.target.value })}
              placeholder="Intitule du RDV" className="w-full px-3 py-2.5 rounded-xl mb-2 outline-none text-sm bg-surface text-text" />
            {rdvTypes.length > 0 ? (
              <div className="flex gap-1.5 mb-2 flex-wrap">
                {rdvTypes.map(rt => {
                  const sel = evtDraft.typeId === rt.id
                  return (
                    <button key={rt.id} onClick={() => setEvtDraft({ ...evtDraft, typeId: rt.id, color: rt.color })}
                      className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
                      style={{ background: sel ? rt.color : '#2A2438', color: sel ? '#1A1206' : '#9C90A8' }}>
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: sel ? '#1A1206' : rt.color }} />{rt.label}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex gap-1.5 mb-2">
                {RDV_COLORS.map(c => (
                  <button key={c} onClick={() => setEvtDraft({ ...evtDraft, color: c, typeId: null })}
                    className="w-7 h-7 rounded-full flex-shrink-0"
                    style={{ background: c, border: (evtDraft.color || RDV_COLORS[0]) === c ? '2px solid white' : '2px solid transparent' }} />
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input type="time" value={evtDraft.time} onChange={e => setEvtDraft({ ...evtDraft, time: e.target.value })}
                className="flex-1 px-3 py-2.5 rounded-xl outline-none text-sm bg-surface text-text" />
              <button onClick={() => setEvtDraft(null)} className="px-4 rounded-xl text-sm bg-surface-2 text-muted">Annuler</button>
            </div>
            <Button className="w-full mt-2" onClick={addEvent}>Ajouter</Button>
          </div>
        ) : (
          <Button variant="ghost" className="w-full text-xs" onClick={() => setEvtDraft({ label: '', time: '', typeId: null, color: RDV_COLORS[0] })}>
            + Ajouter un RDV
          </Button>
        )}
      </Collapsible>

      <Collapsible title="Taches" badge={openTodos || null} open={open.todo} onToggle={() => toggle('todo')}>
        <div className="space-y-2">
          {todos.length === 0 && <p className="text-sm text-muted">Aucune tache.</p>}
          {todos.map(t => (
            <div key={t.id} className="flex items-center gap-2 bg-night rounded-lg px-3 py-2">
              <button onClick={() => toggleTodo(t.id)}
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${t.done ? 'bg-ok' : 'border-2 border-surface-2'}`}>
                {t.done && <span className="text-[10px] text-white font-bold">✓</span>}
              </button>
              <span className={`flex-1 text-sm ${t.done ? 'text-muted line-through' : 'text-text'}`}>{t.text}</span>
              <button onClick={() => delTodo(t.id)} className="text-danger text-xs px-1.5">✕</button>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="Nouvelle tache..." className="flex-1 bg-night border border-line rounded-lg px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-ember" />
            <Button onClick={addTodo} className="px-4">+</Button>
          </div>
        </div>
      </Collapsible>

      <Collapsible title="Note" open={open.note} onToggle={() => toggle('note')}>
        <textarea
          value={noteVal}
          onChange={e => setNoteVal(e.target.value)}
          onBlur={saveNote}
          placeholder="Observations du jour..."
          rows={3}
          className="w-full bg-night border border-line rounded-lg px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-ember resize-none"
        />
      </Collapsible>
    </div>
  )
}

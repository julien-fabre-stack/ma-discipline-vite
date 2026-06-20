import { useState, useEffect, useMemo, useRef } from 'react'
import { Spinner } from '../components/UI'
import DayPanel from './DayPanel'
import {
  loadAgendaDoc, saveAgendaDoc, statusOf, activitiesOf, eventsOf,
  sportStatus, ratioOfDay, dayType, dateKey, parseKey, addDays, daysBetween,
  DEFAULT_STATUSES, DEFAULT_ACTIVITIES, DEFAULT_RDV_TYPES,
} from '../lib/agenda'

const ROWH = 38
const LANEW = 7

function driftLabel(drinkfree, today) {
  const count = (drinkfree?.count || 0) + Math.max(0, daysBetween(drinkfree?.date || today, today))
  const y = Math.floor(count / 365)
  const r = count % 365
  const m = Math.floor(r / 30)
  const d = r % 30
  return (y > 0 ? y + (y > 1 ? ' ans ' : ' an ') : '') + (m > 0 ? m + ' mois ' : '') + d + ' j'
}

export default function SuiviTab({ user }) {
  const today = dateKey()
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState(today)
  const todayRef = useRef(null)
  const Y = new Date().getFullYear()

  useEffect(() => {
    if (!user) return
    loadAgendaDoc(user.uid).then(d => { setData(d); setLoading(false) })
  }, [user])

  const update = async (patch) => {
    const next = { ...data, ...patch }
    setData(next)
    await saveAgendaDoc(user.uid, patch)
  }

  const agenda = data?.agenda || { statuses: DEFAULT_STATUSES, activities: DEFAULT_ACTIVITIES, rdvTypes: DEFAULT_RDV_TYPES, periods: [], events: [] }
  const statuses   = agenda.statuses || []
  const activities = agenda.activities || []
  const rdvTypes   = agenda.rdvTypes || []
  const habits     = data?.habits || []
  const cycleStart = data?.cycleStart || today

  const days = useMemo(() => {
    const start = addDays(today, -60)
    const end = `${Y + 1}-12-31`
    const arr = []
    for (let k = start; k <= end; k = addDays(k, 1)) arr.push(k)
    return arr
  }, [today, Y])

  useEffect(() => {
    if (!loading) todayRef.current?.scrollIntoView({ block: 'start' })
  }, [loading])

  const findNextDay = (pred) => {
    const i0 = days.indexOf(selectedDay)
    const start = i0 === -1 ? days.indexOf(today) : i0
    if (start === -1) return null
    for (let i = start + 1; i < days.length; i++) if (pred(days[i])) return days[i]
    for (let i = 0; i <= start; i++) if (pred(days[i])) return days[i]
    return null
  }
  const scrollToDay = (k) => {
    if (!k) return
    setSelectedDay(k)
    requestAnimationFrame(() => {
      document.getElementById('day-' + k)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }
  const goToStatus   = (catId) => scrollToDay(findNextDay(k => statusOf(agenda, k)?.id === catId))
  const goToActivity = (catId) => scrollToDay(findNextDay(k => activitiesOf(agenda, k).some(a => a.id === catId)))
  const goToCycle    = (catId) => scrollToDay(findNextDay(k => sportStatus(agenda, k, cycleStart, dayType) === catId))
  const goToPerfect  = () => scrollToDay(findNextDay(k => k <= today && ratioOfDay(habits, data?.days?.[k]?.habits) >= 1))
  const goToRdv      = (catId) => scrollToDay(findNextDay(k => eventsOf(agenda, k).some(e => e.typeId === catId)))

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 220px)' }}>
      {/* Header sticky */}
      <div className="flex-shrink-0 pb-2">
        <div className="flex items-start justify-between mb-1">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-100">Tableau de bord</h1>
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs">
            <span className="tracking-widest uppercase text-yellow-400">Sans alcool</span>{' '}
            <span className="text-slate-400">- {driftLabel(data?.drinkfree, today)}</span>
          </div>
          <button onClick={() => scrollToDay(today)}
            className="flex items-center gap-1 text-xs font-bold tabular-nums px-2.5 py-1 rounded-full text-slate-900"
            style={{ background: 'linear-gradient(135deg, #FF7A45 0%, #FFC24B 100%)' }}>
            📅 Aujourd'hui
          </button>
        </div>

        {/* Filtres Statuts */}
        <div className="flex items-center gap-2 mb-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <span className="text-[9px] tracking-widest uppercase flex-shrink-0 text-slate-500" style={{ width: 50 }}>Statuts</span>
          {statuses.map(s => (
            <button key={s.id} onClick={() => goToStatus(s.id)}
              className="px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0 whitespace-nowrap"
              style={{ background: s.color, color: '#1A1206' }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Filtres Cycle */}
        <div className="flex items-center gap-2 mb-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <span className="text-[9px] tracking-widest uppercase flex-shrink-0 text-slate-500" style={{ width: 50 }}>Cycle</span>
          <button onClick={() => goToCycle('actif')}
            className="px-2 py-1 rounded-full text-[10px] flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap bg-slate-800 border border-slate-700">
            <span className="rounded-sm bg-green-500" style={{ width: 5, height: 12 }} />actif
          </button>
          <button onClick={() => goToCycle('off')}
            className="px-2 py-1 rounded-full text-[10px] flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap bg-slate-800 border border-slate-700">
            <span className="rounded-sm bg-slate-600" style={{ width: 5, height: 12 }} />off
          </button>
          <button onClick={goToPerfect}
            className="px-2 py-1 rounded-full text-[10px] flex items-center gap-1 flex-shrink-0 whitespace-nowrap bg-slate-800 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-green-500" />parfaite
          </button>
        </div>

        {/* Filtres Activites */}
        <div className="flex items-center gap-2 mb-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <span className="text-[9px] tracking-widest uppercase flex-shrink-0 text-slate-500" style={{ width: 50 }}>Periodes</span>
          {activities.map(a => (
            <button key={a.id} onClick={() => goToActivity(a.id)}
              className="px-2 py-1 rounded-full text-[10px] flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap bg-slate-800"
              style={{ border: `1px solid ${a.color}` }}>
              <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />{a.label}
            </button>
          ))}
        </div>

        {/* Filtres RDV */}
        <div className="flex items-center gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <span className="text-[9px] tracking-widest uppercase flex-shrink-0 text-slate-500" style={{ width: 50 }}>RDV</span>
          {rdvTypes.length === 0 && <span className="text-[10px] text-slate-500">Aucune categorie</span>}
          {rdvTypes.map(r => (
            <button key={r.id} onClick={() => goToRdv(r.id)}
              className="px-2 py-1 rounded-full text-[10px] flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap bg-slate-800"
              style={{ border: `1px solid ${r.color}` }}>
              <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />{r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline verticale + DayPanel */}
      <div className="flex-1 flex overflow-hidden border-t border-slate-700">
        <div className="overflow-y-auto flex-shrink-0" style={{ width: 74 + (activities.length + 1) * (LANEW + 2) + 14 }}>
          {days.map(k => {
            const st = statusOf(agenda, k)
            const perfect = ratioOfDay(habits, data?.days?.[k]?.habits) >= 1 && k <= today
            const isToday = k === today
            const isSel = k === selectedDay
            const sport = sportStatus(agenda, k, cycleStart, dayType)
            const evts = eventsOf(agenda, k)
            const dayActs = activitiesOf(agenda, k)
            const d = parseKey(k)
            const wknd = [0, 6].includes(d.getDay())
            const cycColor = sport === 'actif' ? '#4ADE80' : '#46405C'
            const bg = wknd ? '#2A2438' : (st ? st.color : '#15121C')
            const txt = (!wknd && st) ? '#1A1206' : (isToday ? '#FFC24B' : (k < today ? '#F3EDE7' : '#9C90A8'))

            return (
              <button key={k} ref={isToday ? todayRef : null} id={'day-' + k} onClick={() => setSelectedDay(k)}
                className="w-full flex items-center gap-1"
                style={{ height: ROWH, background: bg, outline: isSel ? '2px solid #FFC24B' : 'none', outlineOffset: '-2px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="flex-shrink-0 self-stretch" style={{ width: LANEW, background: cycColor }} />
                <span className="text-[10px] leading-tight text-left flex-1 min-w-0 pl-1.5" style={{ color: txt }}>
                  {d.toLocaleDateString('fr-FR', { weekday: 'short' })}.<br />{d.getDate()} {d.toLocaleDateString('fr-FR', { month: 'short' })}
                </span>
                <span className="flex flex-col items-center justify-center gap-0.5 flex-shrink-0" style={{ width: 10 }}>
                  {perfect && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                  {evts.slice(0, 2).map(e => (
                    <span key={e.id} className="w-1.5 h-1.5 rounded-full" style={{ background: e.color || '#FFC24B' }} />
                  ))}
                </span>
                <span className="flex items-stretch flex-shrink-0 self-stretch" style={{ gap: 2, paddingRight: 2 }}>
                  {activities.map(a => (
                    <span key={a.id} style={{ width: LANEW, background: dayActs.some(x => x.id === a.id) ? a.color : 'transparent' }} />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3">
          <DayPanel data={data} agenda={agenda} update={update} dayKey={selectedDay} cycleStart={cycleStart} />
        </div>
      </div>
    </div>
  )
}

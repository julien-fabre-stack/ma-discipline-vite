import { useState } from 'react'
import { Card, Button, Input } from '../components/UI'
import PeriodEditor from '../components/PeriodEditor'
import { uid } from '../lib/agenda'
import { confirm } from '../components/ConfirmHost'

const PALETTE = ['#FF7A45', '#FFC24B', '#5BC0FF', '#A78BFA', '#4ADE80', '#E5484D', '#FF6FA5', '#34D1BF']
const CYCLE_CATS = [
  { id: 'actif', label: 'Actif', color: '#4ADE80' },
  { id: 'off',   label: 'Off',   color: '#46405C' },
]

function CategoryEditor({ title, items, onChange, withColor = true }) {
  const [draft, setDraft] = useState(null)

  const addNew = () => setDraft({ id: uid(), label: '', color: PALETTE[items.length % PALETTE.length] })
  const save = () => {
    if (!draft.label.trim()) return
    const exists = items.some(i => i.id === draft.id)
    const next = exists ? items.map(i => i.id === draft.id ? draft : i) : [...items, draft]
    onChange(next)
    setDraft(null)
  }
  const edit = (item) => setDraft({ ...item })
  const remove = async (id) => {
    const item = items.find(i => i.id === id)
    const ok = await confirm(`Supprimer "${item?.label}" ?`, 'Supprimer')
    if (!ok) return
    onChange(items.filter(i => i.id !== id))
  }

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-bold text-text">{title}</p>
        <Button variant="ghost" className="text-xs py-1" onClick={addNew}>+ Ajouter</Button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm text-muted">Aucune categorie.</p>}
        {items.map(item => (
          <div key={item.id} className="flex items-center gap-2 bg-surface-2/50 rounded-lg px-3 py-2">
            {withColor && <span className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: item.color }} />}
            <span className="flex-1 text-sm text-text truncate">{item.label}</span>
            <button onClick={() => edit(item)} className="text-muted text-xs px-2">✏️</button>
            <button onClick={() => remove(item.id)} className="text-danger text-xs px-2">🗑</button>
          </div>
        ))}
      </div>

      {draft && (
        <div className="bg-surface-2/50 rounded-lg p-3 space-y-2">
          <Input label="Nom" value={draft.label} onChange={v => setDraft(d => ({ ...d, label: v }))} placeholder="Ex: Mission" />
          {withColor && (
            <div>
              <p className="text-xs text-muted mb-1.5">Couleur</p>
              <div className="flex gap-2 flex-wrap">
                {PALETTE.map(c => (
                  <button key={c} onClick={() => setDraft(d => ({ ...d, color: c }))}
                    className="w-7 h-7 rounded-full flex-shrink-0"
                    style={{ background: c, border: draft.color === c ? '2px solid white' : '2px solid transparent' }} />
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" onClick={() => setDraft(null)}>Annuler</Button>
            <Button onClick={save}>Enregistrer</Button>
          </div>
        </div>
      )}
    </Card>
  )
}

// ── Gestion des periodes (planning) ────────────────────────────
function PeriodsManager({ agenda, onUpdate }) {
  const statuses   = agenda.statuses || []
  const activities = agenda.activities || []
  const periods    = agenda.periods || []
  const [draft, setDraft] = useState(null) // { kind, period }

  const kindLabel = { status: 'Statut', activity: 'Activite', cycle: 'Cycle' }
  const catsFor = (kind) => kind === 'status' ? statuses : kind === 'activity' ? activities : CYCLE_CATS

  const catLabel = (p) => catsFor(p.kind).find(c => c.id === p.catId)?.label || p.catId
  const catColor = (p) => catsFor(p.kind).find(c => c.id === p.catId)?.color || '#888'

  const savePeriod = (p) => {
    const exists = periods.some(x => x.id === p.id)
    const next = exists ? periods.map(x => x.id === p.id ? p : x) : [...periods, p]
    onUpdate({ ...agenda, periods: next })
    setDraft(null)
  }
  const editPeriod = (p) => setDraft({ kind: p.kind, period: p })
  const deletePeriod = async (id) => {
    const ok = await confirm('Supprimer cette periode ?', 'Supprimer')
    if (!ok) return
    onUpdate({ ...agenda, periods: periods.filter(x => x.id !== id) })
  }

  const today = new Date().toISOString().slice(0, 10)
  const sorted = [...periods].sort((a, b) => b.start.localeCompare(a.start))

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="font-bold text-text">Planning (periodes)</p>
      </div>
      <p className="text-xs text-muted">
        Assigne un Statut, un Cycle (actif/off) ou une Activite a une plage de dates.
        Ca colore automatiquement la timeline du Suivi.
      </p>

      <div className="flex gap-2 flex-wrap">
        <Button variant="ghost" className="text-xs flex-1"
          onClick={() => setDraft({ kind: 'status', period: { id: uid(), kind: 'status', catId: statuses[0]?.id, start: today, end: today } })}>
          + Statut
        </Button>
        <Button variant="ghost" className="text-xs flex-1"
          onClick={() => setDraft({ kind: 'cycle', period: { id: uid(), kind: 'cycle', catId: 'actif', start: today, end: today } })}>
          + Cycle
        </Button>
        <Button variant="ghost" className="text-xs flex-1"
          onClick={() => setDraft({ kind: 'activity', period: { id: uid(), kind: 'activity', catId: activities[0]?.id, start: today, end: today } })}>
          + Activite
        </Button>
      </div>

      {draft && (
        <PeriodEditor
          period={draft.period}
          kind={draft.kind}
          cats={catsFor(draft.kind)}
          onSave={savePeriod}
          onCancel={() => setDraft(null)}
        />
      )}

      <div className="space-y-2 pt-1">
        {sorted.length === 0 && <p className="text-sm text-muted">Aucune periode definie.</p>}
        {sorted.map(p => (
          <div key={p.id} className="flex items-center gap-2 bg-surface-2/50 rounded-lg px-3 py-2.5">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: catColor(p) }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text truncate">{kindLabel[p.kind]} : {catLabel(p)}</p>
              <p className="text-xs text-muted">{p.start} → {p.end}</p>
            </div>
            <button onClick={() => editPeriod(p)} className="text-muted text-xs px-2">✏️</button>
            <button onClick={() => deletePeriod(p.id)} className="text-danger text-xs px-2">🗑</button>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function AgendaSettings({ agenda, onUpdate }) {
  const statuses   = agenda.statuses || []
  const activities = agenda.activities || []
  const rdvTypes   = agenda.rdvTypes || []

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-text">Categories du tableau de bord</h2>
      <CategoryEditor title="Statuts" items={statuses} onChange={v => onUpdate({ ...agenda, statuses: v })} />
      <CategoryEditor title="Activites / Periodes" items={activities} onChange={v => onUpdate({ ...agenda, activities: v })} />
      <CategoryEditor title="Types de RDV" items={rdvTypes} onChange={v => onUpdate({ ...agenda, rdvTypes: v })} />

      <h2 className="text-lg font-semibold text-text pt-2">Planning</h2>
      <PeriodsManager agenda={agenda} onUpdate={onUpdate} />
    </div>
  )
}

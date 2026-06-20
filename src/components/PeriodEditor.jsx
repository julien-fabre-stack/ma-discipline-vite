import { useState } from 'react'
import { Button } from './UI'
import { uid } from '../lib/agenda'

export default function PeriodEditor({ period, cats, kind, onSave, onCancel }) {
  const [p, setP] = useState(period || {
    id: uid(), kind, catId: (cats[0] || {}).id,
    start: new Date().toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10),
  })
  const valid = p.catId && p.start && p.end && p.start <= p.end

  return (
    <div className="rounded-2xl p-4 mb-3 bg-surface border border-line">
      <p className="text-xs text-muted mb-2">Categorie</p>
      <div className="flex gap-2 mb-3 flex-wrap">
        {cats.map(c => (
          <button key={c.id} onClick={() => setP({ ...p, catId: c.id })}
            className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5"
            style={{ background: p.catId === c.id ? c.color : '#2A2438', color: p.catId === c.id ? '#1A1206' : '#9C90A8' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.catId === c.id ? '#1A1206' : c.color }} />
            {c.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2 mb-1">
        <div className="flex-1">
          <p className="text-xs mb-1 text-muted">Debut</p>
          <input type="date" value={p.start} onChange={e => setP({ ...p, start: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl outline-none text-sm bg-surface-2 text-text" />
        </div>
        <div className="flex-1">
          <p className="text-xs mb-1 text-muted">Fin</p>
          <input type="date" value={p.end} onChange={e => setP({ ...p, end: e.target.value })}
            className="w-full px-3 py-2.5 rounded-xl outline-none text-sm bg-surface-2 text-text" />
        </div>
      </div>
      {!valid && <p className="text-xs mt-1 text-danger">La date de fin doit etre apres ou egale a la date de debut.</p>}
      <div className="flex gap-2 mt-3">
        <Button variant="ghost" className="flex-1" onClick={onCancel}>Annuler</Button>
        <Button disabled={!valid} className="flex-[2]" onClick={() => onSave(p)}>Enregistrer</Button>
      </div>
    </div>
  )
}

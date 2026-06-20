import { useState } from 'react'
import Icon from '../../components/Icon'
import Stepper from '../../components/Stepper'
import { uid, parseWod } from '../../lib/utils'

function WodEditor({ wod, onSave, onCancel }) {
  const [w, setW] = useState({ ...wod, items: [...(wod.items || [])] })
  const setItem = (i, patch) => { const it = [...w.items]; it[i] = { ...it[i], ...patch }; setW({ ...w, items: it }) }
  return (
    <div className="rounded-2xl p-4 bg-surface">
      <input value={w.name} onChange={e => setW({ ...w, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl mb-3 outline-none text-sm bg-surface-2 text-text" />
      <div className="flex items-center justify-between py-2 text-sm mb-2"><span>Durée (min)</span><Stepper value={Math.round(w.dur / 60)} min={1} onChange={v => setW({ ...w, dur: v * 60 })} /></div>
      <div className="text-xs mb-2 text-muted">Exercices :</div>
      {w.items.map((it, i) => (
        <div key={i} className="flex items-center gap-2 mb-2">
          <input value={it.name} onChange={e => setItem(i, { name: e.target.value })} placeholder="Exercice" className="flex-1 px-3 py-2 rounded-lg outline-none text-sm bg-surface-2 text-text" />
          <Stepper value={it.reps} min={1} onChange={v => setItem(i, { reps: v })} />
          <button onClick={() => setW({ ...w, items: w.items.filter((_, j) => j !== i) })} className="p-1.5 rounded-lg bg-surface-2"><Icon name="trash" size={14} className="text-muted" /></button>
        </div>
      ))}
      <button onClick={() => setW({ ...w, items: [...w.items, { name: '', reps: 10 }] })} className="w-full py-2 rounded-lg text-sm font-semibold mb-3 bg-surface-2 text-gold">+ Exercice</button>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-surface-2 text-muted">Annuler</button>
        <button onClick={() => onSave(w)} className="flex-[2] py-2.5 rounded-xl font-semibold text-sm bg-dawn text-night shadow-glow">Enregistrer</button>
      </div>
    </div>
  )
}

export default function WodSettings({ data, update }) {
  const wods = data.wods || []
  const [wodOpen, setWodOpen] = useState(null)
  const [imp, setImp] = useState(null)

  return (
    <>
      <div className="text-xs tracking-widest uppercase mb-1 text-muted">WOD</div>
      <div className="text-xs mb-3 text-muted">L'échauffement (10 burpees + 10 remises debout) est ajouté automatiquement. Touche un WOD pour le modifier.</div>

      {wods.map((w, i) => {
        const open = wodOpen === w.id
        return (
          <div key={w.id} className="rounded-2xl mb-3 overflow-hidden bg-surface border border-line">
            <div className="flex items-center px-3 py-2.5 gap-2">
              <button onClick={() => setWodOpen(open ? null : w.id)} className="flex items-center gap-2 flex-1 min-w-0 text-left">
                <Icon name="down" size={14} className="text-muted" style={{ transition: 'transform 320ms cubic-bezier(.22,1,.36,1)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                <span className="min-w-0">
                  <span className="text-sm font-semibold block truncate">{w.name}</span>
                  <span className="text-xs block text-muted">{Math.round(w.dur / 60)} min · {(w.items || []).length} exos</span>
                </span>
              </button>
              <button onClick={() => { update({ wods: wods.filter((_, j) => j !== i) }); if (open) setWodOpen(null) }} className="p-1.5 rounded-lg flex-shrink-0 bg-surface-2"><Icon name="trash" size={14} className="text-muted" /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows 320ms cubic-bezier(.22,1,.36,1)' }}>
              <div style={{ minHeight: 0, overflow: 'hidden', opacity: open ? 1 : 0, transition: `opacity 220ms ease ${open ? '60ms' : '0ms'}` }}>
                <div className="px-3 pb-3 pt-3 border-t border-line">
                  <WodEditor wod={w} onSave={(nw) => { const a = [...wods]; a[i] = nw; update({ wods: a }); setWodOpen(null) }} onCancel={() => setWodOpen(null)} />
                </div>
              </div>
            </div>
          </div>
        )
      })}

      <button onClick={() => { const id = uid(); update({ wods: [...wods, { id, name: 'Nouveau WOD', dur: 900, items: [] }] }); setWodOpen(id) }} className="w-full py-2.5 rounded-xl font-semibold text-sm mt-1 bg-surface-2 text-gold">+ Ajouter un WOD</button>

      {imp == null ? (
        <button onClick={() => setImp('')} className="w-full py-2.5 rounded-xl font-semibold text-sm mt-2 bg-surface-2 text-muted">⤓ Importer un WOD (coller)</button>
      ) : (
        <div className="rounded-2xl p-4 mt-2 bg-surface">
          <div className="text-xs mb-2 text-muted">Colle le texte du WOD. 1ʳᵉ ligne : <span className="text-gold">Nom | minutes</span>, puis un exercice par ligne avec le nombre de reps à la fin.</div>
          <textarea value={imp} onChange={e => setImp(e.target.value)} rows={6} placeholder={'Murph allégé | 20\nPompes 15\nAir squats 20\nTractions 5'} className="w-full px-3 py-2.5 rounded-xl outline-none text-sm bg-surface-2 text-text" style={{ fontFamily: 'monospace' }} />
          <div className="flex gap-2 mt-2">
            <button onClick={() => setImp(null)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-surface-2 text-muted">Annuler</button>
            <button onClick={() => { const w = parseWod(imp); if (w && w.items.length) { update({ wods: [...wods, w] }); setImp(null) } }} className="flex-[2] py-2.5 rounded-xl font-semibold text-sm bg-dawn text-night shadow-glow">Importer</button>
          </div>
        </div>
      )}
    </>
  )
}

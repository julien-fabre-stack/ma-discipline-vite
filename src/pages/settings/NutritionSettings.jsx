import { useState } from 'react'
import Icon from '../../components/Icon'
import Stepper from '../../components/Stepper'
import { Collapsible } from '../../components/Collapsible'
import { macrosOf } from '../../lib/nutrition'

function FoodEditRow({ food, onChange, onDelete }) {
  const [edit, setEdit] = useState(false)
  if (edit) return (
    <div className="rounded-2xl p-3 mb-2 bg-surface-2">
      <input value={food.name} onChange={e => onChange({ name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl mb-2 outline-none text-sm bg-surface text-text" />
      <div className="flex gap-2 mb-2">
        {[['g', 'pour 100 g'], ['piece', 'par pièce']].map(([k, l]) => (
          <button key={k} onClick={() => onChange({ unit: k })} className={'flex-1 py-2 rounded-xl text-sm ' + (food.unit === k ? 'bg-ember text-night' : 'bg-surface text-muted')}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[['kcal', 'Cal'], ['p', 'P'], ['c', 'G'], ['f', 'L']].map(k => (
          <input key={k[0]} placeholder={k[1]} inputMode="decimal" value={food[k[0]] ?? ''} onChange={e => onChange({ [k[0]]: +e.target.value || 0 })} className="px-2 py-2.5 rounded-xl text-center outline-none text-sm bg-surface text-text" />
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={onDelete} className="p-2.5 rounded-xl bg-surface"><Icon name="trash" size={15} className="text-muted" /></button>
        <button onClick={() => setEdit(false)} className="flex-1 py-2 rounded-xl text-sm font-semibold bg-dawn text-night shadow-glow">OK</button>
      </div>
    </div>
  )
  return (
    <button onClick={() => setEdit(true)} className="w-full flex items-center px-3 py-2.5 rounded-xl mb-2 text-left bg-surface-2">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{food.name}</div>
        <div className="text-xs text-muted">{food.kcal} kcal /{food.unit === 'g' ? '100 g' : 'pièce'} · P{food.p} G{food.c} L{food.f}</div>
      </div>
      <Icon name="edit" size={16} className="text-gold" />
    </button>
  )
}

export default function NutritionSettings({ data, update }) {
  const [openC, setOpenC] = useState(false)
  const [openMine, setOpenMine] = useState(false)
  const [openImp, setOpenImp] = useState(false)
  const allFoods = data.customFoods || []
  const combos = data.combos || []
  const customFoods = data.customFoods || []
  const targets = data.targets || { train: 2400, recup: 2050, repos: 1800, water: 2 }

  const rename = (id, name) => update({ combos: combos.map(c => c.id === id ? { ...c, name } : c) })
  const del = (id) => update({ combos: combos.filter(c => c.id !== id) })
  const updateFood = (id, patch) => update({ customFoods: customFoods.map(f => f.id === id ? { ...f, ...patch } : f) })
  const deleteFood = (id) => update({ customFoods: customFoods.filter(f => f.id !== id) })
  const persoFoods = customFoods.filter(f => !String(f.id).startsWith('ci'))
  const importedFoods = customFoods.filter(f => String(f.id).startsWith('ci'))

  return (
    <>
      <Collapsible title="Mes aliments" badge={persoFoods.length || null} open={openMine} onToggle={() => setOpenMine(o => !o)}>
        {persoFoods.length === 0 && <div className="text-sm mb-2 text-muted">Aucun aliment personnalisé pour l'instant. Crée-en un via l'onglet « Créer » du sélecteur d'aliment.</div>}
        {persoFoods.map(f => (<FoodEditRow key={f.id} food={f} onChange={p => updateFood(f.id, p)} onDelete={() => deleteFood(f.id)} />))}
      </Collapsible>

      <Collapsible title="Issus de la table CIQUAL" badge={importedFoods.length || null} open={openImp} onToggle={() => setOpenImp(o => !o)}>
        <div className="text-xs mb-2 text-muted">Aliments ajoutés depuis la recherche CIQUAL lors de leur premier usage dans un repas.</div>
        {importedFoods.length === 0 && <div className="text-sm mb-2 text-muted">Aucun aliment CIQUAL utilisé pour l'instant.</div>}
        {importedFoods.map(f => (<FoodEditRow key={f.id} food={f} onChange={p => updateFood(f.id, p)} onDelete={() => deleteFood(f.id)} />))}
      </Collapsible>

      <Collapsible title="Repas enregistrés" badge={combos.length || null} open={openC} onToggle={() => setOpenC(o => !o)}>
        {combos.length === 0 && <div className="text-sm mb-2 text-muted">Aucun repas enregistré pour l'instant. Utilise « Enregistrer ce repas » dans le journal Nutrition.</div>}
        {combos.map(c => {
          const tot = (c.items || []).reduce((a, it) => { const f = allFoods.find(x => x.id === it.id); if (!f) return a; return a + macrosOf(f, it.qty).kcal }, 0)
          const validCount = (c.items || []).filter(it => allFoods.find(x => x.id === it.id)).length
          return (
            <div key={c.id} className="flex items-center gap-2 mb-2">
              <input value={c.name} onChange={e => rename(c.id, e.target.value)} className="flex-1 min-w-0 px-3 py-2.5 rounded-xl outline-none text-sm bg-surface text-text border border-line" />
              <div className="text-[11px] flex-shrink-0 text-right leading-tight text-muted" style={{ width: 64 }}>{validCount} alim.<br />{Math.round(tot)} kcal</div>
              <button onClick={() => del(c.id)} className="p-2.5 rounded-xl flex-shrink-0 bg-surface-2"><Icon name="trash" size={15} className="text-muted" /></button>
            </div>
          )
        })}
      </Collapsible>

      <div className="text-xs tracking-widest uppercase mb-1 mt-2 text-muted">Objectifs caloriques</div>
      <div className="text-xs mb-3 text-muted">Cibles utilisées dans le journal selon le type de jour.</div>
      <div className="rounded-2xl overflow-hidden border border-line">
        {[['train', 'Objectif kcal séance', 50], ['recup', 'Objectif kcal récup', 50], ['repos', 'Objectif kcal repos', 50], ['water', 'Objectif eau (L)', 1]].map(([k, l, st], i) => (
          <div key={k} className="flex items-center justify-between px-4 py-3" style={{ background: i % 2 ? 'var(--color-surface)' : 'var(--color-night)' }}>
            <span className="text-sm">{l}</span>
            <Stepper value={targets[k] ?? 0} step={st} onChange={v => update({ targets: { ...targets, [k]: v } })} />
          </div>
        ))}
      </div>
    </>
  )
}

import { useState, useEffect, useRef } from 'react'
import { Card, Button, Input, Modal, Spinner, EmptyState, ProgressBar } from '../components/UI'
import { MEALS, macrosOf, sumMeals, loadNutritionDoc, saveNutritionDoc } from '../lib/nutrition'
import { searchCiqual } from '../lib/ciqual'
import { uid } from '../lib/utils'

// ── Helpers date ─────────────────────────────────────────────
const pad = n => String(n).padStart(2, '0')
const dateKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
const addDays = (k, n) => {
  const [y, m, d] = k.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return dateKey(dt)
}
const dayLabel = (k, today) => {
  if (k === today) return "Aujourd'hui"
  if (k === addDays(today, -1)) return 'Hier'
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

// ── MacroBar ─────────────────────────────────────────────────
function MacroBar({ label, value, target, color }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0
  const over = target > 0 && value > target
  return (
    <div className="flex-1 min-w-0">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted">{label}</span>
        <span className={over ? 'text-danger' : 'text-muted'}>{Math.round(value)}g</span>
      </div>
      <div className="w-full bg-surface-2 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: over ? '#E5484D' : color }}
        />
      </div>
      <div className="text-[10px] text-muted mt-0.5 text-right">/{target}g</div>
    </div>
  )
}

// ── FoodPicker ────────────────────────────────────────────────
function FoodPicker({ onClose, onPick, onPickCombo, allFoods, combos }) {
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState([])
  const [selected, setSelected]   = useState(null)
  const [qty, setQty]             = useState(100)
  const [tab, setTab]             = useState('search') // 'search' | 'combos' | 'custom'
  const [showAdd, setShowAdd]     = useState(false)
  const [newFood, setNewFood]     = useState({ name: '', unit: 'g', kcal: 0, p: 0, c: 0, f: 0 })
  const inputRef                  = useRef(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100) }, [])

  const handleSearch = (q) => {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    const ciqual = searchCiqual(q, 40)
    const custom = allFoods.filter(f =>
      f.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(
        q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      )
    )
    // Merge, custom first
    const ids = new Set(custom.map(f => f.id))
    setResults([...custom, ...ciqual.filter(f => !ids.has(f.id))])
  }

  const pick = (food) => {
    setSelected(food)
    setQty(food.unit === 'g' ? 100 : 1)
  }

  const confirm = () => {
    if (!selected) return
    onPick(selected, qty)
  }

  const macros = selected ? macrosOf(selected, qty) : null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-night">
      <div className="flex items-center gap-3 p-4 border-b border-line">
        <button onClick={onClose} className="text-muted hover:text-text text-xl leading-none">&times;</button>
        <h2 className="font-semibold text-text flex-1">Ajouter un aliment</h2>
      </div>

      <div className="flex gap-1 px-4 pt-3 pb-2">
        {[['search','Recherche'],['combos','Combos'],['custom','Mes aliments']].map(([k,l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
              tab === k ? 'bg-dawn text-night' : 'bg-surface text-muted hover:text-text'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === 'search' && (
          <div className="px-4 pb-4">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Rechercher un aliment..."
              className="w-full bg-surface border border-line rounded-lg px-3 py-2.5 text-sm text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-ember mb-3"
            />
            {results.length === 0 && query.length >= 2 && (
              <p className="text-muted text-sm text-center py-4">Aucun resultat pour "{query}"</p>
            )}
            {results.map(food => (
              <button
                key={food.id}
                onClick={() => pick(food)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 text-left transition-colors ${
                  selected?.id === food.id ? 'bg-ember/20 border border-ember/60' : 'bg-surface hover:bg-surface-2'
                }`}
              >
                <div>
                  <p className="text-sm text-text truncate max-w-[200px]">{food.name}</p>
                  <p className="text-xs text-muted">P {food.p}g · G {food.c}g · L {food.f}g · {food.kcal} kcal/100{food.unit}</p>
                </div>
                {selected?.id === food.id && <span className="text-gold text-xs ml-2">✓</span>}
              </button>
            ))}
          </div>
        )}

        {tab === 'combos' && (
          <div className="px-4 pb-4">
            {combos.length === 0
              ? <EmptyState title="Aucun combo" subtitle="Enregistre un repas depuis le journal." />
              : combos.map(combo => (
                <button
                  key={combo.id}
                  onClick={() => onPickCombo(combo)}
                  className="w-full text-left bg-surface hover:bg-surface-2 rounded-lg px-3 py-3 mb-2"
                >
                  <p className="text-sm font-medium text-text">{combo.name}</p>
                  <p className="text-xs text-muted">{combo.items?.length} aliment(s)</p>
                </button>
              ))
            }
          </div>
        )}

        {tab === 'custom' && (
          <div className="px-4 pb-4">
            {allFoods.filter(f => f.id.startsWith('u')).length === 0 && !showAdd && (
              <EmptyState
                title="Aucun aliment perso"
                subtitle="Ajoute tes aliments avec leurs valeurs nutritionnelles."
                action={<Button onClick={() => setShowAdd(true)}>+ Ajouter</Button>}
              />
            )}
            {showAdd && (
              <div className="bg-surface rounded-xl p-4 mb-3 space-y-3">
                <p className="text-sm font-medium text-muted">Nouvel aliment</p>
                <Input label="Nom" value={newFood.name} onChange={v => setNewFood(f => ({...f, name: v}))} placeholder="Ex: Mon granola maison" />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Kcal / 100g" type="number" value={newFood.kcal} onChange={v => setNewFood(f => ({...f, kcal: Number(v)}))} />
                  <Input label="Proteines (g)" type="number" value={newFood.p} onChange={v => setNewFood(f => ({...f, p: Number(v)}))} />
                  <Input label="Glucides (g)" type="number" value={newFood.c} onChange={v => setNewFood(f => ({...f, c: Number(v)}))} />
                  <Input label="Lipides (g)" type="number" value={newFood.f} onChange={v => setNewFood(f => ({...f, f: Number(v)}))} />
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setShowAdd(false)}>Annuler</Button>
                  <Button onClick={() => {
                    if (!newFood.name.trim()) return
                    const food = { ...newFood, id: 'u' + uid(), unit: 'g' }
                    allFoods.push(food) // passed by ref via closure - parent updates
                    pick(food)
                    setShowAdd(false)
                    setTab('search')
                  }}>
                    Creer et ajouter
                  </Button>
                </div>
              </div>
            )}
            {!showAdd && <Button variant="ghost" className="w-full mb-3" onClick={() => setShowAdd(true)}>+ Ajouter un aliment</Button>}
            {allFoods.filter(f => f.id.startsWith('u')).map(food => (
              <button key={food.id} onClick={() => pick(food)}
                className={`w-full text-left bg-surface hover:bg-surface-2 rounded-lg px-3 py-2.5 mb-1 ${selected?.id === food.id ? 'border border-ember/60' : ''}`}
              >
                <p className="text-sm text-text">{food.name}</p>
                <p className="text-xs text-muted">{food.kcal} kcal · P{food.p} G{food.c} L{food.f}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="border-t border-line p-4 bg-night">
          <p className="text-sm font-medium text-muted mb-2 truncate">{selected.name}</p>
          <div className="flex items-center gap-3 mb-3">
            <button onClick={() => setQty(q => Math.max(selected.unit === 'g' ? 10 : 1, q - (selected.unit === 'g' ? 10 : 1)))}
              className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-muted text-lg">-</button>
            <div className="flex-1 text-center">
              <span className="text-2xl font-bold text-text">{qty}</span>
              <span className="text-muted ml-1 text-sm">{selected.unit === 'g' ? 'g' : 'portion(s)'}</span>
            </div>
            <button onClick={() => setQty(q => q + (selected.unit === 'g' ? 10 : 1))}
              className="w-9 h-9 rounded-full bg-surface-2 flex items-center justify-center text-muted text-lg">+</button>
          </div>
          {macros && (
            <div className="flex gap-4 text-center text-xs mb-3 bg-surface rounded-lg p-2">
              <div className="flex-1"><div className="text-muted">Kcal</div><div className="font-bold text-gold">{Math.round(macros.kcal)}</div></div>
              <div className="flex-1"><div className="text-muted">Prot</div><div className="font-bold text-ok">{macros.p.toFixed(1)}g</div></div>
              <div className="flex-1"><div className="text-muted">Gluc</div><div className="font-bold text-gold">{macros.c.toFixed(1)}g</div></div>
              <div className="flex-1"><div className="text-muted">Lip</div><div className="font-bold text-ember">{macros.f.toFixed(1)}g</div></div>
            </div>
          )}
          <Button className="w-full" onClick={confirm}>Ajouter au repas</Button>
        </div>
      )}
    </div>
  )
}

// ── NutritionTab ──────────────────────────────────────────────
export default function NutritionTab({ user, profile }) {
  const today = dateKey()
  const [viewKey, setViewKey]   = useState(today)
  const [nutData, setNutData]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [openMeal, setOpenMeal] = useState(null)
  const [picker, setPicker]     = useState(null)
  const [saveDraft, setSaveDraft] = useState(null)
  const [comboName, setComboName] = useState('')

  const targets = {
    kcal:  profile?.objectifKcal  ?? 2200,
    p:     profile?.objectifProtG ?? 160,
    c:     profile?.objectifGlucG ?? 220,
    f:     profile?.objectifLipG  ?? 70,
    water: 2,
  }

  useEffect(() => {
    if (!user) return
    loadNutritionDoc(user.uid).then(d => { setNutData(d); setLoading(false) })
  }, [user])

  const save = async (patch) => {
    const next = { ...nutData, ...patch }
    setNutData(next)
    await saveNutritionDoc(user.uid, patch)
  }

  const getDay = () => nutData?.days?.[viewKey] || {}
  const getMeals = () => getDay().meals || { petitdej: [], dej: [], diner: [], snack: [] }
  const getWater = () => getDay().water || 0

  const setDay = async (patch) => {
    const days = { ...(nutData?.days || {}) }
    days[viewKey] = { ...getDay(), ...patch }
    await save({ days })
  }

  const setMeals = (m) => setDay({ meals: m })

  const addToMeal = async (mealKey, entry) => {
    const meals = getMeals()
    await setMeals({ ...meals, [mealKey]: [...(meals[mealKey] || []), { ...entry, id: uid() }] })
  }

  const removeFromMeal = async (mealKey, entryId) => {
    const meals = getMeals()
    await setMeals({ ...meals, [mealKey]: (meals[mealKey] || []).filter(e => e.id !== entryId) })
  }

  const changeQty = async (mealKey, entryId, qty) => {
    if (qty <= 0) return removeFromMeal(mealKey, entryId)
    const meals = getMeals()
    await setMeals({ ...meals, [mealKey]: (meals[mealKey] || []).map(e => e.id === entryId ? { ...e, qty } : e) })
  }

  const addCombo = async (mealKey, combo) => {
    const allFoods = nutData?.customFoods || []
    const valid = (combo.items || []).filter(it => allFoods.find(f => f.id === it.id))
    if (!valid.length) return
    const meals = getMeals()
    await setMeals({ ...meals, [mealKey]: [...(meals[mealKey] || []), ...valid.map(it => ({ id: it.id, qty: it.qty, id: uid() }))] })
  }

  const saveCombo = async (mealKey) => {
    const meals = getMeals()
    const items = (meals[mealKey] || []).map(({ id, qty }) => ({ id, qty }))
    if (!items.length) return
    const name = comboName.trim() || MEALS.find(m => m[0] === mealKey)?.[1] || 'Combo'
    const combos = [...(nutData?.combos || []), { id: uid(), name, items }]
    await save({ combos })
    setSaveDraft(null)
    setComboName('')
  }

  const allFoods = nutData?.customFoods || []
  const meals = getMeals()
  const tots = sumMeals(meals, allFoods)
  const water = getWater()
  const kcalPct = targets.kcal > 0 ? Math.min(100, (tots.kcal / targets.kcal) * 100) : 0
  const kcalOver = tots.kcal > targets.kcal

  const goDay = (n) => {
    const k = addDays(viewKey, n)
    if (k > today) return
    setViewKey(k)
    setOpenMeal(null)
  }

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-4 pb-8">
      {/* Header nav jour */}
      <div className="flex items-center gap-2">
        <button onClick={() => goDay(-1)}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted hover:text-text flex-shrink-0">
          ←
        </button>
        <div className="flex-1 text-center min-w-0">
          <p className="font-bold text-text capitalize truncate">{dayLabel(viewKey, today)}</p>
          {viewKey !== today && (
            <button onClick={() => { setViewKey(today); setOpenMeal(null) }} className="text-xs text-gold hover:underline">
              Revenir a aujourd'hui
            </button>
          )}
        </div>
        <button onClick={() => goDay(1)} disabled={viewKey === today}
          className="w-10 h-10 rounded-full bg-surface flex items-center justify-center text-muted hover:text-text flex-shrink-0 disabled:opacity-30">
          →
        </button>
      </div>

      {/* Resume macro du jour */}
      <Card>
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="text-xs text-muted">Calories</p>
            <p className={`text-3xl font-bold tabular-nums ${kcalOver ? 'text-danger' : 'text-gold'}`}>
              {Math.round(tots.kcal)}
            </p>
          </div>
          <p className="text-sm text-muted pb-1">/ {targets.kcal} kcal</p>
        </div>
        <ProgressBar value={kcalPct} max={100} color={kcalOver ? 'red' : 'ember'} className="mb-4" />
        <div className="flex gap-3">
          <MacroBar label="Prot" value={tots.p} target={targets.p} color="#4ADE80" />
          <MacroBar label="Gluc" value={tots.c} target={targets.c} color="#FFC24B" />
          <MacroBar label="Lip"  value={tots.f} target={targets.f} color="#FF7A45" />
        </div>
      </Card>

      {/* Repas */}
      {MEALS.map(([key, label, color]) => {
        const mealItems = meals[key] || []
        const mealTot = mealItems.reduce((a, e) => {
          const food = allFoods.find(f => f.id === e.id)
          if (!food) return a
          const m = macrosOf(food, e.qty)
          return { kcal: a.kcal + m.kcal, p: a.p + m.p, c: a.c + m.c, f: a.f + m.f }
        }, { kcal: 0, p: 0, c: 0, f: 0 })
        const isOpen = openMeal === key

        return (
          <Card key={key} className="overflow-hidden p-0">
            {/* Header repas */}
            <div className="flex items-center px-4 py-3">
              <button
                onClick={() => setOpenMeal(isOpen ? null : key)}
                className="flex-1 text-left flex items-center gap-2"
              >
                <span className="text-lg" style={{ color }}>{isOpen ? '▼' : '▶'}</span>
                <div>
                  <p className="font-bold text-text">{label}</p>
                  <p className="text-xs text-muted">
                    L {mealTot.f.toFixed(1)} · G {mealTot.c.toFixed(1)} · P {mealTot.p.toFixed(1)}
                  </p>
                </div>
              </button>
              <p className="font-bold text-text mr-3">{Math.round(mealTot.kcal)} <span className="text-xs text-muted font-normal">kcal</span></p>
              <button
                onClick={() => setPicker(key)}
                className="w-8 h-8 rounded-full bg-surface-2 flex items-center justify-center text-gold text-xl leading-none hover:bg-surface-2"
              >
                +
              </button>
            </div>

            {/* Items du repas */}
            {isOpen && (
              <div className="border-t border-line">
                {mealItems.length === 0 && (
                  <p className="px-4 py-3 text-sm text-muted">Aucun aliment. Touche + pour en ajouter.</p>
                )}
                {mealItems.map(entry => {
                  const food = allFoods.find(f => f.id === entry.id)
                  if (!food) return null
                  const m = macrosOf(food, entry.qty)
                  return (
                    <div key={entry.id} className="flex items-center px-4 py-2.5 border-t border-line/50 first:border-t-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-text truncate">{food.name}</p>
                        <p className="text-xs text-muted">{entry.qty}{food.unit === 'g' ? 'g' : 'x'} · {Math.round(m.kcal)} kcal</p>
                      </div>
                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          onClick={() => changeQty(key, entry.id, entry.qty - (food.unit === 'g' ? 10 : 1))}
                          className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center text-muted text-sm"
                        >-</button>
                        <button
                          onClick={() => changeQty(key, entry.id, entry.qty + (food.unit === 'g' ? 10 : 1))}
                          className="w-7 h-7 rounded-full bg-surface-2 flex items-center justify-center text-muted text-sm"
                        >+</button>
                        <button
                          onClick={() => removeFromMeal(key, entry.id)}
                          className="w-7 h-7 rounded-full bg-danger/15 flex items-center justify-center text-danger text-xs ml-1"
                        >✕</button>
                      </div>
                    </div>
                  )
                })}
                {/* Enregistrer comme combo */}
                {mealItems.length > 0 && (
                  <div className="border-t border-line">
                    {saveDraft === key ? (
                      <div className="px-4 py-3 flex gap-2 items-center">
                        <input
                          autoFocus
                          value={comboName}
                          onChange={e => setComboName(e.target.value)}
                          placeholder="Nom du combo..."
                          className="flex-1 bg-surface-2 border border-surface-2 rounded-lg px-3 py-1.5 text-sm text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-ember"
                        />
                        <Button variant="ghost" className="text-xs py-1.5 px-2" onClick={() => setSaveDraft(null)}>Annuler</Button>
                        <Button className="text-xs py-1.5 px-3" onClick={() => saveCombo(key)}>OK</Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setSaveDraft(key); setComboName('') }}
                        className="w-full py-2.5 text-xs text-gold hover:text-gold flex items-center justify-center gap-1.5"
                      >
                        ⊞ Enregistrer ce repas comme combo
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        )
      })}

      {/* Eau */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-info">💧</span> Eau
          </div>
          <p className="text-sm text-muted tabular-nums">{water.toFixed(2)} / {targets.water} L</p>
        </div>
        <ProgressBar value={water} max={targets.water} color="ember" className="mb-3" />
        <div className="flex gap-2">
          <button
            onClick={() => setDay({ water: Math.max(0, +(water - 0.25).toFixed(2)) })}
            className="flex-1 py-2 rounded-xl bg-surface-2 text-muted text-sm flex items-center justify-center"
          >
            -25 cl
          </button>
          <button
            onClick={() => setDay({ water: +(water + 0.25).toFixed(2) })}
            className="flex-[2] py-2 rounded-xl bg-surface-2 text-info font-semibold text-sm flex items-center justify-center gap-1"
          >
            + 25 cl
          </button>
        </div>
      </Card>

      {/* FoodPicker */}
      {picker && (
        <FoodPicker
          allFoods={allFoods}
          combos={nutData?.combos || []}
          onClose={() => setPicker(null)}
          onPick={(food, qty) => {
            // Si aliment custom new, l'ajouter d'abord
            if (!allFoods.find(f => f.id === food.id)) {
              const nextFoods = [...allFoods, food]
              save({ customFoods: nextFoods })
            }
            addToMeal(picker, { id: food.id, qty })
            setPicker(null)
          }}
          onPickCombo={(combo) => {
            addCombo(picker, combo)
            setPicker(null)
          }}
        />
      )}
    </div>
  )
}

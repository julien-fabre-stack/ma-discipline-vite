import { useState } from 'react'
import { Card, Button, Input } from '../components/UI'
import { confirm } from '../components/ConfirmHost'
import { uid } from '../lib/utils'

export default function NutritionSettings({ nutData, onUpdate }) {
  const customFoods = (nutData?.customFoods || []).filter(f => f.id.startsWith('u'))
  const combos = nutData?.combos || []
  const [editFood, setEditFood] = useState(null)
  const [showAddFood, setShowAddFood] = useState(false)

  const saveFood = () => {
    if (!editFood.name.trim()) return
    const allFoods = nutData?.customFoods || []
    const exists = allFoods.some(f => f.id === editFood.id)
    const next = exists ? allFoods.map(f => f.id === editFood.id ? editFood : f) : [...allFoods, editFood]
    onUpdate({ customFoods: next })
    setEditFood(null)
    setShowAddFood(false)
  }

  const deleteFood = async (id) => {
    const f = customFoods.find(x => x.id === id)
    const ok = await confirm(`Supprimer "${f?.name}" ?`, 'Supprimer l aliment')
    if (!ok) return
    const allFoods = nutData?.customFoods || []
    onUpdate({ customFoods: allFoods.filter(f => f.id !== id) })
  }

  const deleteCombo = async (id) => {
    const c = combos.find(x => x.id === id)
    const ok = await confirm(`Supprimer le combo "${c?.name}" ?`, 'Supprimer le combo')
    if (!ok) return
    onUpdate({ combos: combos.filter(c => c.id !== id) })
  }

  const startNew = () => {
    setEditFood({ id: 'u' + uid(), name: '', unit: 'g', kcal: 0, p: 0, c: 0, f: 0 })
    setShowAddFood(true)
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text">Mes aliments</h2>
          <Button onClick={startNew}>+ Ajouter</Button>
        </div>

        {showAddFood && (
          <Card className="space-y-3 mb-3">
            <Input label="Nom" value={editFood.name} onChange={v => setEditFood(f => ({ ...f, name: v }))} placeholder="Ex: Mon granola maison" />
            <div className="grid grid-cols-2 gap-2">
              <Input label="Kcal / 100g" type="number" value={editFood.kcal} onChange={v => setEditFood(f => ({ ...f, kcal: Number(v) }))} />
              <Input label="Proteines (g)" type="number" value={editFood.p} onChange={v => setEditFood(f => ({ ...f, p: Number(v) }))} />
              <Input label="Glucides (g)" type="number" value={editFood.c} onChange={v => setEditFood(f => ({ ...f, c: Number(v) }))} />
              <Input label="Lipides (g)" type="number" value={editFood.f} onChange={v => setEditFood(f => ({ ...f, f: Number(v) }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => { setShowAddFood(false); setEditFood(null) }}>Annuler</Button>
              <Button onClick={saveFood}>Enregistrer</Button>
            </div>
          </Card>
        )}

        {customFoods.length === 0 && !showAddFood && (
          <Card className="text-center py-6">
            <p className="text-sm text-muted">Aucun aliment perso.</p>
          </Card>
        )}

        <div className="space-y-2">
          {customFoods.map(food => (
            <Card key={food.id} className="flex items-center justify-between py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text truncate">{food.name}</p>
                <p className="text-xs text-muted">{food.kcal} kcal - P{food.p} G{food.c} L{food.f}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setEditFood({ ...food }); setShowAddFood(true) }} className="p-1.5 text-muted text-xs">✏️</button>
                <button onClick={() => deleteFood(food.id)} className="p-1.5 text-danger text-xs">🗑</button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-text mb-3">Mes combos</h2>
        {combos.length === 0 && (
          <Card className="text-center py-6">
            <p className="text-sm text-muted">Aucun combo sauvegarde. Cree-en depuis l onglet Nutrition.</p>
          </Card>
        )}
        <div className="space-y-2">
          {combos.map(combo => (
            <Card key={combo.id} className="flex items-center justify-between py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text truncate">{combo.name}</p>
                <p className="text-xs text-muted">{combo.items?.length || 0} aliment(s)</p>
              </div>
              <button onClick={() => deleteCombo(combo.id)} className="p-1.5 text-danger text-xs flex-shrink-0">🗑</button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

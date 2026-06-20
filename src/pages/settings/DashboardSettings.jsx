import { useState } from 'react'
import Icon from '../../components/Icon'
import { Collapsible } from '../../components/Collapsible'
import { uid } from '../../lib/utils'
import AgendaSettings from '../AgendaSettings'

export default function DashboardSettings({ data, update }) {
  const [openH, setOpenH] = useState(false)
  const habits = data.habits || []

  return (
    <>
      <Collapsible title="Habitudes" badge={habits.length} open={openH} onToggle={() => setOpenH(o => !o)}>
        {habits.map((h, i) => (
          <div key={h.id} className="flex items-center gap-2 mb-2">
            <input
              value={h.label}
              onChange={e => { const a = [...habits]; a[i] = { ...h, label: e.target.value }; update({ habits: a }) }}
              className="flex-1 px-3 py-2.5 rounded-xl outline-none text-sm bg-surface text-text border border-line"
            />
            <button onClick={() => update({ habits: habits.filter((_, j) => j !== i) })} className="p-2.5 rounded-xl bg-surface-2"><Icon name="trash" size={15} className="text-muted" /></button>
          </div>
        ))}
        <button onClick={() => update({ habits: [...habits, { id: uid(), label: 'Nouvelle activité' }] })} className="w-full py-2.5 rounded-xl font-semibold text-sm mt-1 bg-surface-2 text-gold">+ Ajouter une activité</button>
      </Collapsible>

      <AgendaSettings agenda={data.agenda || {}} onUpdate={(nextAgenda) => update({ agenda: nextAgenda })} />
    </>
  )
}

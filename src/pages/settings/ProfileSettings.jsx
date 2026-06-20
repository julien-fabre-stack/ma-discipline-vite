import { useRef } from 'react'
import Icon from '../../components/Icon'
import { resizeImage, ageFrom } from '../../lib/utils'
import { dateKey } from '../../lib/agenda'

export default function ProfileSettings({ data, update }) {
  const p = data.profile || {}
  const set = (patch) => update({ profile: { ...p, ...patch } })
  const fileRef = useRef(null)
  const onPhoto = (e) => {
    const f = e.target.files && e.target.files[0]
    if (f) resizeImage(f, 256, (url) => set({ photo: url }))
  }
  const age = ageFrom(p.birthdate)

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ma-discipline-${dateKey()}.json`
    document.body.appendChild(a); a.click(); document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl outline-none text-sm bg-surface text-text border border-line'

  return (
    <div>
      <div className="flex flex-col items-center mb-6">
        <button onClick={() => fileRef.current && fileRef.current.click()}
          className="rounded-full flex items-center justify-center overflow-hidden mb-2 bg-surface-2 border-2 border-line" style={{ width: 96, height: 96 }}>
          {p.photo
            ? <img src={p.photo} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Icon name="plus" size={28} className="text-muted" />}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onPhoto} style={{ display: 'none' }} />
        <button onClick={() => fileRef.current && fileRef.current.click()} className="text-xs text-gold">
          {p.photo ? 'Changer la photo' : 'Ajouter une photo'}
        </button>
      </div>

      <label className="text-xs tracking-widest uppercase mb-1 block text-muted">Nom</label>
      <input value={p.name || ''} onChange={e => set({ name: e.target.value })} className={inputCls + ' mb-4'} />

      <label className="text-xs tracking-widest uppercase mb-1 block text-muted">Date de naissance{age != null ? ` · ${age} ans` : ''}</label>
      <input type="date" value={p.birthdate || ''} onChange={e => set({ birthdate: e.target.value })} className={inputCls + ' mb-4'} />

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="text-xs tracking-widest uppercase mb-1 block text-muted">Taille (cm)</label>
          <input type="number" inputMode="numeric" value={p.height || ''} onChange={e => set({ height: e.target.value })} className={inputCls} />
        </div>
        <div className="flex-1">
          <label className="text-xs tracking-widest uppercase mb-1 block text-muted">Poids (kg)</label>
          <input type="number" inputMode="decimal" value={p.weight || ''} onChange={e => set({ weight: e.target.value })} className={inputCls} />
        </div>
      </div>

      <label className="text-xs tracking-widest uppercase mb-1 block text-muted">Objectifs</label>
      <textarea value={p.goals || ''} onChange={e => set({ goals: e.target.value })} rows={4} placeholder="Tes objectifs…" className={inputCls + ' mb-2'} />

      <div className="text-xs tracking-widest uppercase mb-1 mt-4 text-muted">Données</div>
      <div className="text-xs mb-3 text-muted">Télécharge une copie complète de tes données (profil, séances, repas, agenda…) au format JSON.</div>
      <button onClick={exportJson} className="w-full py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 bg-surface text-gold">
        <Icon name="download" size={18} /> Exporter mes données (JSON)
      </button>
    </div>
  )
}

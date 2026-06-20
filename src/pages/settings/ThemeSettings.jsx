import Icon from '../../components/Icon'
import { THEMES } from '../../lib/theme'

export default function ThemeSettings({ data, update }) {
  const themeId = data.theme || 'aube'
  const accent = data.accent || null
  const navAlpha = data.navAlpha == null ? 0.92 : data.navAlpha
  const swatch = (t) => `linear-gradient(135deg, ${t.ember}, ${t.gold})`

  return (
    <div>
      <div className="text-xs tracking-widest uppercase mb-1 text-muted">Thème</div>
      <div className="text-xs mb-3 text-muted">Palette complète de l'application.</div>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {Object.entries(THEMES).map(([id, t]) => {
          const active = id === themeId
          return (
            <button key={id} onClick={() => update({ theme: id })} className="rounded-2xl p-3 text-left" style={{ background: t.surf, border: active ? '2px solid var(--color-gold)' : '1px solid var(--color-line)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full" style={{ background: swatch(t) }} />
                <span className="flex flex-col gap-1">
                  <span className="w-10 h-2 rounded-full" style={{ background: t.surf2 }} />
                  <span className="w-7 h-2 rounded-full" style={{ background: t.night }} />
                </span>
              </div>
              <div className="text-sm font-semibold" style={{ color: active ? 'var(--color-gold)' : '#F3EDE7' }}>{t.name}{active ? ' ✓' : ''}</div>
            </button>
          )
        })}
      </div>

      <div className="text-xs tracking-widest uppercase mb-1 text-muted">Couleur d'accent</div>
      <div className="text-xs mb-3 text-muted">Personnalise la couleur des boutons, anneaux et surlignages. Le dégradé en découle automatiquement.</div>
      <div className="rounded-2xl p-4 mb-2 bg-surface border border-line">
        <div className="flex items-center gap-3 mb-3">
          <input type="color" value={accent || '#FF7A45'} onChange={e => update({ accent: e.target.value })} className="w-12 h-12 rounded-xl flex-shrink-0 outline-none bg-surface-2 border border-line" />
          <div className="flex-1 h-12 rounded-xl bg-dawn" />
        </div>
        {accent && <button onClick={() => update({ accent: null })} className="w-full py-2 rounded-xl text-sm font-semibold bg-surface-2 text-muted">Revenir à l'accent du thème</button>}
      </div>

      <div className="text-xs tracking-widest uppercase mb-1 mt-6 text-muted">Barre de navigation</div>
      <div className="text-xs mb-3 text-muted">Transparence de la barre du bas (effet verre dépoli).</div>
      <div className="rounded-2xl overflow-hidden mb-2 border border-line">
        {[['Opaque', 1], ['Translucide', 0.85], ['Très translucide', 0.6]].map(([l, v], i) => {
          const active = Math.abs(navAlpha - v) < 0.05
          return (
            <button key={l} onClick={() => update({ navAlpha: v })} className="w-full flex items-center justify-between px-4 py-3 text-sm" style={{ background: i % 2 ? 'var(--color-surface)' : 'var(--color-night)' }}>
              <span style={{ color: active ? 'var(--color-gold)' : 'var(--color-text)', fontWeight: active ? 700 : 400 }}>{l}</span>
              {active && <Icon name="check" size={16} className="text-gold" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div className={'bg-surface border border-line rounded-xl p-4 ' + className}>
      {children}
    </div>
  )
}

export function Button({ children, onClick, variant = 'primary', disabled = false, className = '', type = 'button' }) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-dawn shadow-glow text-night hover:opacity-90',
    secondary: 'bg-surface-2 hover:bg-surface-2 text-text',
    danger:    'bg-danger hover:opacity-90 text-white',
    ghost:     'bg-transparent hover:bg-surface-2 text-muted',
    success:   'bg-ok hover:opacity-90 text-night',
    warning:   'bg-gold hover:opacity-90 text-night',
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={base + ' ' + (variants[variant] || variants.primary) + ' ' + className}
    >
      {children}
    </button>
  )
}

export function Input({ label, value, onChange, type = 'text', placeholder = '', min, max, step, className = '' }) {
  return (
    <div className={'flex flex-col gap-1 ' + className}>
      {label && <label className="text-xs text-muted font-medium">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min} max={max} step={step}
        className="bg-surface-2 border border-surface-2 rounded-lg px-3 py-2 text-sm text-text placeholder-muted focus:outline-none focus:ring-2 focus:ring-ember focus:border-transparent"
      />
    </div>
  )
}

export function Badge({ children, color = 'slate' }) {
  const colors = {
    slate:  'bg-surface-2 text-muted',
    sky:    'bg-ember/20 text-gold',
    green:  'bg-ok/20 text-ok',
    red:    'bg-danger/20 text-danger',
    yellow: 'bg-gold/20 text-gold',
  }
  return (
    <span className={'inline-block px-2 py-0.5 rounded-full text-xs font-medium ' + (colors[color] || colors.slate)}>
      {children}
    </span>
  )
}

export function Spinner({ size = 'md' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={(sz[size] || sz.md) + ' border-2 border-surface-2 border-t-ember rounded-full animate-spin'} />
  )
}

export function EmptyState({ icon = '', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-muted font-semibold">{title}</p>
      {subtitle && <p className="text-muted text-sm max-w-xs">{subtitle}</p>}
      {action}
    </div>
  )
}

export function ProgressBar({ value = 0, max = 100, color = 'ember', className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const colors = {
    ember:  'bg-dawn',
    green:  'bg-ok',
    red:    'bg-danger',
    yellow: 'bg-gold',
  }
  return (
    <div className={'w-full bg-surface-2 rounded-full h-2 overflow-hidden ' + className}>
      <div
        className={'h-full rounded-full transition-all duration-500 ' + (colors[color] || colors.ember)}
        style={{ width: pct + '%' }}
      />
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-line rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h2 className="font-semibold text-text">{title}</h2>
          <button onClick={onClose} className="text-muted hover:text-text text-xl leading-none">&times;</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-surface p-1 rounded-xl">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ' + (
            active === t.id
              ? 'bg-dawn text-night shadow'
              : 'text-muted hover:text-text hover:bg-surface-2'
          )}
        >
          <span>{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  )
}

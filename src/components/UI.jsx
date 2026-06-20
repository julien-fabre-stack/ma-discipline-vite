export function Card({ children, className = '' }) {
  return (
    <div className={'bg-slate-800 border border-slate-700 rounded-xl p-4 ' + className}>
      {children}
    </div>
  )
}

export function Button({ children, onClick, variant = 'primary', disabled = false, className = '', type = 'button' }) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed'
  const variants = {
    primary:   'bg-sky-500 hover:bg-sky-400 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-100',
    danger:    'bg-red-500 hover:bg-red-400 text-white',
    ghost:     'bg-transparent hover:bg-slate-700 text-slate-300',
    success:   'bg-green-500 hover:bg-green-400 text-white',
    warning:   'bg-yellow-500 hover:bg-yellow-400 text-white',
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
      {label && <label className="text-xs text-slate-400 font-medium">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        min={min} max={max} step={step}
        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
      />
    </div>
  )
}

export function Badge({ children, color = 'slate' }) {
  const colors = {
    slate:  'bg-slate-700 text-slate-300',
    sky:    'bg-sky-900 text-sky-300',
    green:  'bg-green-900 text-green-300',
    red:    'bg-red-900 text-red-300',
    yellow: 'bg-yellow-900 text-yellow-300',
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
    <div className={(sz[size] || sz.md) + ' border-2 border-slate-600 border-t-sky-400 rounded-full animate-spin'} />
  )
}

export function EmptyState({ icon = '', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-4xl">{icon}</span>
      <p className="text-slate-300 font-semibold">{title}</p>
      {subtitle && <p className="text-slate-500 text-sm max-w-xs">{subtitle}</p>}
      {action}
    </div>
  )
}

export function ProgressBar({ value = 0, max = 100, color = 'sky', className = '' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const colors = {
    sky:    'bg-sky-500',
    green:  'bg-green-500',
    red:    'bg-red-500',
    yellow: 'bg-yellow-500',
  }
  return (
    <div className={'w-full bg-slate-700 rounded-full h-2 overflow-hidden ' + className}>
      <div
        className={'h-full rounded-full transition-all duration-500 ' + (colors[color] || colors.sky)}
        style={{ width: pct + '%' }}
      />
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="font-semibold text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl leading-none">&times;</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ' + (
            active === t.id
              ? 'bg-sky-500 text-white shadow'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
          )}
        >
          <span>{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  )
}

export function Collapsible({ title, badge, open, onToggle, children }) {
  return (
    <div className="mb-3">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-1.5">
        <span className="text-xs tracking-widest uppercase text-slate-400">
          {title}
          {badge != null && badge !== '' && <span className="text-yellow-400"> - {badge}</span>}
        </span>
        <span
          className="text-slate-400 text-xs transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>
      {open && <div className="pt-1">{children}</div>}
    </div>
  )
}

export function Collapsible({ title, badge, open, onToggle, children }) {
  return (
    <div className="mb-3">
      <button onClick={onToggle} className="w-full flex items-center justify-between py-1.5">
        <span className="text-xs tracking-widest uppercase text-muted">
          {title}
          {badge != null && badge !== '' && <span className="text-gold"> - {badge}</span>}
        </span>
        <span
          className="text-muted text-xs transition-transform duration-300"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>
      {open && <div className="pt-1">{children}</div>}
    </div>
  )
}

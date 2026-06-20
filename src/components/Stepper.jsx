import Icon from './Icon'

// Sélecteur numérique +/- (séries, reps, durée, repos…)
export default function Stepper({ value, onChange, step = 1, min = 0 }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(min, (value || 0) - step))}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-2 text-text active:scale-95 transition-transform"
      >
        <Icon name="minus" size={14} />
      </button>
      <span className="tabular-nums w-12 text-center font-semibold text-text">{value ?? 0}</span>
      <button
        onClick={() => onChange((value || 0) + step)}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-2 text-text active:scale-95 transition-transform"
      >
        <Icon name="plus" size={14} />
      </button>
    </div>
  )
}

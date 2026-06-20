// Anneau de progression circulaire (minuteurs repos / timed / AMRAP).
// Le dégradé reprend les couleurs ember -> gold du thème via les variables CSS.
export default function Ring({ value, max, id = 'g', size = 190 }) {
  const R = 86
  const CIRC = 2 * Math.PI * R
  const off = CIRC * (1 - (max ? value / max : 0))
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-ember)" />
          <stop offset="100%" stopColor="var(--color-gold)" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r={R} fill="none" stroke="var(--color-surface-2)" strokeWidth="10" />
      <circle
        cx="100" cy="100" r={R} fill="none"
        stroke={`url(#${id})`} strokeWidth="10" strokeLinecap="round"
        strokeDasharray={CIRC} strokeDashoffset={off}
        style={{ transition: 'stroke-dashoffset 0.9s linear' }}
      />
    </svg>
  )
}

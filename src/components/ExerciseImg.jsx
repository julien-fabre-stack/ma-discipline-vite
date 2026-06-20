import { useState } from 'react'
import { exerciseImageSrc } from '../lib/exercises'

function GenericExerciseIcon({ className, style }) {
  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--color-muted, #9C90A8)' }}>
        <path d="M6 7v10" /><path d="M9 5v14" /><path d="M15 5v14" /><path d="M18 7v10" /><path d="M9 12h6" />
      </svg>
    </div>
  )
}

export default function ExerciseImg({ name, className = '', style }) {
  const src = exerciseImageSrc(name)
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <GenericExerciseIcon className={className} style={style} />
  }

  return (
    <img
      src={src}
      alt=""
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  )
}

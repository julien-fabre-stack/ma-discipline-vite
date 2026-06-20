import { exerciseImageSrc } from '../lib/exercises'

export default function ExerciseImg({ name, className = '', style }) {
  const src = exerciseImageSrc(name)
  if (!src) return null
  return (
    <img
      src={src}
      alt=""
      className={className}
      style={style}
      onError={(e) => { e.currentTarget.style.display = 'none' }}
    />
  )
}

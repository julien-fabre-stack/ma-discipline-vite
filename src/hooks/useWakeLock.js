import { useEffect, useRef } from 'react'

// Empêche l'écran de se verrouiller tant que `active` est vrai (utile pendant
// une séance ou un WOD). Redemande automatiquement le verrou si l'app revient
// au premier plan (l'API Wake Lock le relâche quand l'onglet passe en arrière-plan).
export function useWakeLock(active) {
  const lockRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    const request = async () => {
      try {
        if (active && 'wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen')
          if (!cancelled) lockRef.current = lock
          else lock.release().catch(() => {})
        }
      } catch (e) {
        // Wake Lock indisponible (navigateur non supporté, onglet caché, etc.) — silencieux.
      }
    }

    if (active) request()

    const onVisibility = () => {
      if (active && document.visibilityState === 'visible') request()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisibility)
      if (lockRef.current) {
        lockRef.current.release().catch(() => {})
        lockRef.current = null
      }
    }
  }, [active])
}

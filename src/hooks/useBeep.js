import { useRef, useCallback } from 'react'

// Bip court via Web Audio. API : const { ensure, beep } = useBeep()
// ensure() : (ré)active le contexte audio (à appeler sur une interaction). beep(freq, durSeconds).
export function useBeep() {
  const ref = useRef(null)

  const ensure = useCallback(() => {
    if (!ref.current) {
      try { ref.current = new (window.AudioContext || window.webkitAudioContext)() } catch (e) {}
    }
    if (ref.current && ref.current.state === 'suspended') ref.current.resume()
  }, [])

  const beep = useCallback((freq = 880, dur = 0.15) => {
    try {
      const ac = ref.current
      if (!ac) return
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.frequency.value = freq
      o.connect(g); g.connect(ac.destination)
      g.gain.setValueAtTime(0.0001, ac.currentTime)
      g.gain.exponentialRampToValueAtTime(0.5, ac.currentTime + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur)
      o.start()
      o.stop(ac.currentTime + dur)
    } catch (e) {}
  }, [])

  return { ensure, beep }
}

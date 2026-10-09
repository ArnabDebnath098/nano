import { useRef } from 'react'
import { gsap } from './gsap.js'
import { MOVE, prefersReducedMotion } from './motion.js'

// NANO press feel (animation-reference/noon-nano: `:active` 90ms down, release on PP Move):
// scales down while the pointer is held and springs back with PP Move's slight overshoot.
// A tap released before the press-down finishes still plays the full dip, so quick taps and
// keyboard activations are always visible. Spread the returned props onto the element.
const DOWN = { duration: 0.09, ease: 'nano.outCubic' } // --nn-dur-press, cubic-bezier(0.33, 1, 0.68, 1)

export function usePress(scale = 0.94) {
  const ref = useRef(null)
  const held = useRef(false)

  const down = () => {
    if (prefersReducedMotion() || !ref.current) return
    held.current = true
    gsap.to(ref.current, { scale, ...DOWN, overwrite: true })
  }

  const release = () => {
    if (!held.current || !ref.current) return
    held.current = false
    const el = ref.current
    // Let the dip land first if the tap was quicker than the press-down
    const pending = gsap.getTweensOf(el).some((t) => t.isActive())
    gsap.to(el, { scale: 1, ...MOVE, delay: pending ? DOWN.duration : 0, overwrite: 'auto' })
  }

  // Keyboard (Enter / Space) — no pointer events, so play the whole dip-and-return
  const pulse = () => {
    if (prefersReducedMotion() || !ref.current) return
    gsap
      .timeline({ overwrite: true })
      .to(ref.current, { scale, ...DOWN })
      .to(ref.current, { scale: 1, ...MOVE })
  }

  return {
    ref,
    onPointerDown: down,
    onPointerUp: release,
    onPointerCancel: release,
    onPointerLeave: release,
    onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && !e.repeat && pulse(),
  }
}

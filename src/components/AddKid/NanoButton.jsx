import { useLayoutEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/motion.js'
import './NanoButton.css'

// WAAPI can't read CSS variables in `easing`, so resolve PP Move from :root (fallback: --ease-out)
const FALLBACK_EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'

// Figma: nano button (62:2454) — Type Primary / Secondary × State Default / Disabled.
// Disabled is flat (no stroke, no inner shadow). Disabled ⇄ Default cross-fades fill,
// label, stroke and shadows on PP Fade instead of snapping (noon NANO .nano-btn).
// Pressed: the raised sculpt fades out and a sunken layer fades in (gradient darker at the top,
// shadow cast from the top edge) while the label sinks 1px — the button reads as pushed in.
// In over 90ms, out over 200ms (opacity only, so it stays on the compositor).
// Becoming enabled also gives a small 0.98 → 1 bump on PP Move (NANO's CTA enable, L2163)
// — a state-indication cue that Continue is now available. Reduced motion: colour fade only.
export default function NanoButton({ variant = 'primary', disabled = false, type = 'button', onClick, children, ...rest }) {
  const ref = useRef(null)
  const wasDisabled = useRef(disabled)

  useLayoutEffect(() => {
    const enabledNow = wasDisabled.current && !disabled
    wasDisabled.current = disabled
    if (!enabledNow || prefersReducedMotion() || !ref.current) return
    const easing = getComputedStyle(ref.current).getPropertyValue('--nn-pp-move').trim() || FALLBACK_EASE
    ref.current.animate([{ transform: 'scale(0.98)' }, { transform: 'scale(1)' }], { duration: 540, easing })
  }, [disabled])

  return (
    <button
      ref={ref}
      type={type}
      className={`nano-btn nano-btn--${variant}`}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      <span className="nano-btn__press" aria-hidden="true" />
      <span className="nano-btn__label">{children}</span>
    </button>
  )
}

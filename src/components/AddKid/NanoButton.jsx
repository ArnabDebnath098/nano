import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../../lib/motion.js'
import GooLoader from './GooLoader.jsx'
import './NanoButton.css'

// Matches the loader's fade-out in NanoButton.css
const LOADER_OUT_MS = 240

// WAAPI can't read CSS variables in `easing`, so resolve PP Move from :root (fallback: --ease-out)
const FALLBACK_EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'

// Figma: nano button (62:2454 / Kids-Side 19:5179) — Type Primary / Secondary / Tertiary ×
// State Default / Pressed / Disabled.
// Disabled is flat (no stroke, no inner shadow). Disabled ⇄ Default cross-fades fill,
// label, stroke and shadows on PP Fade instead of snapping (noon NANO .nano-btn).
// Pressed: the raised sculpt fades out and Figma's Pressed layer fades in (darker fill, shadow
// cast from the top edge) while the label sinks 1px — the button reads as pushed in.
// In over 90ms, out over 200ms (opacity only, so it stays on the compositor).
// Becoming enabled also gives a small 0.98 → 1 bump on PP Move (NANO's CTA enable, L2163)
// — a state-indication cue that Continue is now available. Reduced motion: colour fade only.
// Loading: `loading` swaps the label for the Goo loader. The label lifts out into a blur as the
// loader pops in from 0.6×, and back; the button keeps its size, ignores taps and doesn't press.
export default function NanoButton({
  variant = 'primary',
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  children,
  ...rest
}) {
  const ref = useRef(null)
  const wasDisabled = useRef(disabled)

  // Keep the loader mounted through its fade-out, and only then unmount it
  const [showLoader, setShowLoader] = useState(loading)
  if (loading && !showLoader) setShowLoader(true)
  useEffect(() => {
    if (loading || !showLoader) return
    const t = setTimeout(() => setShowLoader(false), LOADER_OUT_MS)
    return () => clearTimeout(t)
  }, [loading, showLoader])

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
      className={`nano-btn nano-btn--${variant}${loading ? ' nano-btn--loading' : ''}`}
      disabled={disabled}
      aria-busy={loading || undefined}
      onClick={loading ? undefined : onClick}
      {...rest}
    >
      <span className="nano-btn__press" aria-hidden="true" />
      <span className="nano-btn__label">{children}</span>
      {showLoader && (
        <span className="nano-btn__loader">
          <GooLoader />
        </span>
      )}
    </button>
  )
}

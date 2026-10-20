import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../../lib/gsap.js'
import {
  FADE,
  TOAST_CONTENT_AT,
  TOAST_EXIT_MS,
  TOAST_FALL,
  TOAST_HIT,
  TOAST_POP,
  TOAST_SPREAD_AT,
  TOAST_SPREAD_H,
  TOAST_SPREAD_W,
  prefersReducedMotion,
} from '../../lib/motion.js'
import './Toast.css'

const HOLD_MS = 2400
const RADIUS = 14

// Figma: M-Toast · Error (18:15457) — red pill at top 68, warning icon + one line.
// Motion — noon NANO's water-drop toast (makeDropToast, index.html L2317–2396):
//  • a red drop (0.66 × the pill height, fully round) falls from −100px on a spring;
//  • where it lands it squashes wide (1.22 × 0.8) and wobbles back (0.94 × 1.07 → 1.03 × 0.98 → 1),
//    segments on an ease-in-out-sine;
//  • from 260ms the drop spreads into the pill (width / height on springs, radius → 14);
//  • from 430ms the icon + text fade in and pop 0.8 → 1;
//  • leaving, it dips 7px then lifts 140px away while stretching tall (0.93 × 1.12).
// The wrapper keeps the pill's real size (layout + tap target); the blob is drawn behind it.
// Interruptible: a new message while one is showing retargets the pill (no new drop), and a
// stale exit can never clear the new message. Reduced motion: a plain 200ms fade.
// `toast` = { id, message, tone } — tone 'error' (default, red + warning) or 'success' (green +
// tick). A new id re-shows it. Tap to dismiss early.
export default function Toast({ toast, onDone }) {
  const root = useRef(null)
  const exitTween = useRef(null)
  const [shown, setShown] = useState(null)
  if (toast && toast.id !== shown?.id) setShown(toast)
  const shownId = useRef(null)
  shownId.current = shown?.id

  useGSAP(
    () => {
      if (!shown) return
      const el = root.current
      const blob = el.querySelector('[data-toast-blob]')
      const content = el.querySelector('[data-toast-content]')
      const W = el.offsetWidth
      const H = el.offsetHeight
      const dot = 0.66 * H

      // Already on screen (or mid-exit)? Cancel the exit and retarget from where it is
      const onScreen = exitTween.current?.isActive() || (el.dataset.landed && gsap.getProperty(el, 'y') > -100)
      exitTween.current?.kill()
      exitTween.current = null
      gsap.killTweensOf([el, blob, content])

      const tl = gsap.timeline()
      if (prefersReducedMotion()) {
        gsap.set([el, blob, content], { clearProps: 'transform' })
        gsap.set(blob, { width: W, height: H, borderRadius: RADIUS })
        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE })
      } else if (onScreen) {
        // New message on a toast that's already up: settle the pill to the new size
        tl.to(el, { y: 0, autoAlpha: 1, ...TOAST_FALL }, 0)
          .to(blob, { width: W, height: H, borderRadius: RADIUS, scaleX: 1, scaleY: 1, ...TOAST_SPREAD_W }, 0)
          .fromTo(content, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, ...TOAST_POP }, 0.05)
      } else {
        const sq = 'nano.inOutSine' // NANO SQ segment ease
        tl.set(el, { autoAlpha: 1 }, 0)
          .set(blob, { width: dot, height: dot, borderRadius: dot / 2 }, 0)
          .set(content, { autoAlpha: 0, scale: 0.8 }, 0)
          // the drop falls
          .fromTo(el, { y: -100 }, { y: 0, ...TOAST_FALL }, 0)
          // …squashes where it lands, and wobbles back
          .fromTo(blob, { scaleX: 0.9, scaleY: 1.12 }, { scaleX: 0.9, scaleY: 1.12, duration: TOAST_HIT - 0.03 }, 0)
          .to(blob, { scaleX: 1.22, scaleY: 0.8, duration: 0.07, ease: sq }, TOAST_HIT - 0.03)
          .to(blob, { scaleX: 0.94, scaleY: 1.07, duration: 0.09, ease: sq }, TOAST_HIT + 0.04)
          .to(blob, { scaleX: 1.03, scaleY: 0.98, duration: 0.08, ease: sq }, TOAST_HIT + 0.13)
          .to(blob, { scaleX: 1, scaleY: 1, duration: 0.08, ease: sq }, TOAST_HIT + 0.21)
          // …spreads into the pill
          .to(blob, { width: W, ...TOAST_SPREAD_W }, TOAST_SPREAD_AT)
          .to(blob, { height: H, ...TOAST_SPREAD_H }, TOAST_SPREAD_AT)
          .to(blob, { borderRadius: RADIUS, duration: 0.3, ease: 'nano.outCubic' }, TOAST_SPREAD_AT)
          // …and the message pops in
          .to(content, { autoAlpha: 1, duration: 0.2, ease: 'nano.outCubic' }, TOAST_CONTENT_AT)
          .to(content, { scale: 1, ...TOAST_POP }, TOAST_CONTENT_AT)
      }
      el.dataset.landed = '1'
      return () => tl.kill()
    },
    { scope: root, dependencies: [shown?.id] },
  )

  useEffect(() => {
    if (!shown) return
    const t = setTimeout(() => dismiss(), HOLD_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown?.id])

  function dismiss() {
    const el = root.current
    if (!el) return
    const blob = el.querySelector('[data-toast-blob]')
    const id = shown?.id
    const done = () => {
      exitTween.current = null
      // A newer toast took over mid-exit — leave it alone
      if (shownId.current !== id) return
      setShown(null)
      onDone?.()
    }
    exitTween.current?.kill()
    if (prefersReducedMotion()) {
      exitTween.current = gsap.to(el, { autoAlpha: 0, ...FADE, onComplete: done })
      return
    }
    // NANO exit: dip 7px (27% of 440ms), then lift 140px away stretching tall like a pulled drop
    const s = TOAST_EXIT_MS / 1000
    const dip = s * 0.27
    exitTween.current = gsap
      .timeline({ onComplete: done })
      .to(el, { y: 7, duration: dip, ease: 'nano.outCubic' }, 0)
      .to(el, { y: -140, duration: s - dip, ease: 'nano.toastExit' }, dip)
      .to(blob, { scaleX: 1.05, scaleY: 0.9, duration: dip, ease: 'nano.outCubic' }, 0)
      .to(blob, { scaleX: 0.93, scaleY: 1.12, duration: s - dip, ease: 'nano.toastStretch' }, dip)
  }

  return (
    <div className="add-kid-toast-layer" aria-live="assertive" aria-atomic="true">
      {shown && (
        <div ref={root} className={`add-kid-toast add-kid-toast--${shown.tone || 'error'}`} role="alert" onClick={dismiss}>
          <span className="add-kid-toast__blob" data-toast-blob aria-hidden="true" />
          <span className="add-kid-toast__content" data-toast-content>
            {shown.tone === 'success' ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="9" fill="#fff" />
                <path d="M8.2 12.3l2.6 2.6 5-5.2" stroke="#108757" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <img src="/figma/add-kid/warning-triangle.svg" width="24" height="24" alt="" />
            )}
            <span className="add-kid-toast__text">{shown.message}</span>
          </span>
        </div>
      )}
    </div>
  )
}

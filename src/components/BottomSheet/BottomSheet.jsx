import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, Draggable, useGSAP } from '../../lib/gsap.js'
import { lockScroll } from '../../lib/scrollLock.js'
import { CORNER_SMOOTHING, squirclePath } from '../../lib/squircle.js'
import {
  FADE,
  MOVE,
  SCRIM_IN,
  SCRIM_OUT,
  SWIPE_COMMIT_PX,
  SWIPE_COMMIT_VELOCITY,
  prefersReducedMotion,
  velocityTracker,
} from '../../lib/motion.js'
import './BottomSheet.css'

// Figma: M-BottomSheet (2:5466) — scrim, grabber, sheet slot and home indicator.
// Motion (noon NANO): the panel travels on PP Move (540ms) both ways, like NANO's sheets;
// the scrim uses NANO's overlay curves. Drag the grabber/header down — release past 70px
// or flick faster than 0.45px/ms to dismiss, otherwise it springs back on PP Move.
// Reduced motion: no travel, PP Fade only.
// cornerSmoothing (0–1, default the app's CORNER_SMOOTHING; 0 = plain radius) clips the sheet to a
// squircle at its CSS border-radius; the shadow then moves to a drop-shadow so it follows the clip.
export default function BottomSheet({
  open,
  onClose,
  labelledBy,
  showHomeIndicator = true,
  cornerSmoothing = CORNER_SMOOTHING,
  children,
}) {
  // Stay mounted until the close animation has finished
  const [mounted, setMounted] = useState(open)
  if (open && !mounted) setMounted(true)

  const root = useRef(null)
  const panel = useRef(null)
  const sheet = useRef(null)
  const returnFocus = useRef(null)

  // Smoothed corners can't be done with border-radius, so clip with a squircle path
  useLayoutEffect(() => {
    const el = sheet.current
    if (!mounted || !el || !cornerSmoothing) return
    const applyClip = () => {
      const { width, height } = el.getBoundingClientRect()
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
      el.style.clipPath = `path('${squirclePath({ width, height, radius, smoothing: cornerSmoothing })}')`
    }
    applyClip()
    // The path is in pixels, so rebuild it when the sheet's size changes
    const resize = new ResizeObserver(applyClip)
    resize.observe(el)
    return () => resize.disconnect()
  }, [mounted, cornerSmoothing])

  // Open / close animation
  useGSAP(
    () => {
      if (!mounted) return
      const reduced = prefersReducedMotion()
      const scrim = '[data-sheet-scrim]'

      if (open) {
        returnFocus.current = document.activeElement
        const tl = gsap.timeline()
        if (reduced) {
          tl.set(panel.current, { yPercent: 0, y: 0 })
            .fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE }, 0)
            .fromTo(panel.current, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE }, 0)
        } else {
          tl.fromTo(scrim, { autoAlpha: 0 }, { autoAlpha: 1, ...SCRIM_IN }, 0)
            .fromTo(panel.current, { yPercent: 100, y: 0 }, { yPercent: 0, ...MOVE }, 0)
        }
        panel.current.focus({ preventScroll: true })
      } else {
        const tl = gsap.timeline({
          onComplete: () => {
            setMounted(false)
            // Only restore focus if nothing else (e.g. a pushed page) has taken it
            const active = document.activeElement
            if (!active || active === document.body || root.current?.contains(active)) {
              returnFocus.current?.focus?.({ preventScroll: true })
            }
          },
        })
        if (reduced) {
          tl.to(panel.current, { autoAlpha: 0, ...FADE }, 0).to(scrim, { autoAlpha: 0, ...FADE }, 0)
        } else {
          tl.to(panel.current, { yPercent: 100, ...MOVE }, 0).to(scrim, { autoAlpha: 0, ...SCRIM_OUT }, 0)
        }
      }
    },
    { scope: root, dependencies: [open, mounted] },
  )

  // Drag-to-dismiss from the grabber / header area
  useGSAP(
    () => {
      if (!mounted) return
      const scrim = root.current.querySelector('[data-sheet-scrim]')
      const tracker = velocityTracker()
      Draggable.create(panel.current, {
        type: 'y',
        trigger: root.current.querySelectorAll('[data-sheet-drag]'),
        bounds: { minY: 0, maxY: window.innerHeight },
        edgeResistance: 0.85,
        onPress() {
          tracker.reset()
          tracker.add(this.y)
        },
        onDrag() {
          tracker.add(this.y)
          gsap.set(scrim, { autoAlpha: 1 - this.y / panel.current.offsetHeight })
        },
        onDragEnd() {
          if (this.y >= SWIPE_COMMIT_PX || tracker.velocity() > SWIPE_COMMIT_VELOCITY) {
            onClose?.()
          } else {
            gsap.to(panel.current, { y: 0, ...MOVE })
            gsap.to(scrim, { autoAlpha: 1, ...FADE })
          }
        },
      })
    },
    { scope: root, dependencies: [mounted] },
  )

  // Esc to close + lock page scroll while open
  useEffect(() => {
    if (!mounted) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    const unlock = lockScroll()
    window.addEventListener('keydown', onKey)
    return () => {
      unlock()
      window.removeEventListener('keydown', onKey)
    }
  }, [mounted, onClose])

  if (!mounted) return null

  return (
    <div ref={root} className="bottom-sheet">
      <div className="bottom-sheet__scrim" data-sheet-scrim onClick={onClose} aria-hidden="true" />

      <div
        ref={panel}
        className="bottom-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <div className="bottom-sheet__grabber" data-sheet-drag>
          <div className="bottom-sheet__grabber-bar" />
        </div>

        <div className={`bottom-sheet__wrapper ${cornerSmoothing ? 'bottom-sheet__wrapper--smooth' : ''}`}>
          <div ref={sheet} className="bottom-sheet__sheet">
            {children}
          </div>
        </div>

        {showHomeIndicator && (
          <div className="bottom-sheet__home-indicator" aria-hidden="true">
            <div className="bottom-sheet__home-indicator-bar" />
          </div>
        )}
      </div>
    </div>
  )
}

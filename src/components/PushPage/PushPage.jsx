import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../../lib/gsap.js'
import { lockScroll } from '../../lib/scrollLock.js'
import { FADE, MOVE, prefersReducedMotion } from '../../lib/motion.js'
import './PushPage.css'

// Full-screen page pushed over the current one, with its own scroll container.
// Motion (noon NANO): the page travels on PP Move (540ms) in and out; the shade under it
// fades on PP Fade (200ms). Reduced motion: no travel, PP Fade only.
// from="bottom" presents it as a full-screen modal (slides up), e.g. the Add a child flow.
// enter="none" shows it in place with no travel — for when something above it is revealing it
// (the intro video dissolving into Add a child). Closing still slides out as usual.
export default function PushPage({ open, labelledBy, from = 'right', enter = 'slide', children }) {
  const [mounted, setMounted] = useState(open)
  if (open && !mounted) setMounted(true)

  const root = useRef(null)

  useGSAP(
    () => {
      if (!mounted) return
      const reduced = prefersReducedMotion()
      const page = root.current.querySelector('[data-push-page]')
      const shade = root.current.querySelector('[data-push-shade]')

      if (open) {
        root.current.scrollTop = 0
        if (enter === 'none') {
          gsap.set(page, { xPercent: 0, yPercent: 0, autoAlpha: 1 })
          gsap.set(shade, { autoAlpha: 1 })
          page.focus({ preventScroll: true })
          return
        }
        if (reduced) {
          gsap.set(page, { xPercent: 0 })
          gsap.fromTo(page, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE })
        } else {
          // PP Move overshoots ~1.3%; clamp at 0 so the page never uncovers a sliver of
          // the screen underneath at its right edge
          const axis = from === 'bottom' ? 'yPercent' : 'xPercent'
          gsap.fromTo(
            page,
            { [axis]: 100 },
            { [axis]: 0, ...MOVE, modifiers: { [axis]: (v) => Math.max(0, parseFloat(v)) } },
          )
        }
        gsap.fromTo(shade, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE })
        page.focus({ preventScroll: true })
      } else {
        const done = () => setMounted(false)
        gsap.to(shade, { autoAlpha: 0, ...FADE })
        if (reduced) gsap.to(page, { autoAlpha: 0, ...FADE, onComplete: done })
        else gsap.to(page, { [from === 'bottom' ? 'yPercent' : 'xPercent']: 100, ...MOVE, onComplete: done })
      }
    },
    { scope: root, dependencies: [open, mounted] },
  )

  useEffect(() => (mounted ? lockScroll() : undefined), [mounted])

  if (!mounted) return null

  return (
    <div ref={root} className={`push-page push-page--from-${from}`}>
      <div className="push-page__shade" data-push-shade aria-hidden="true" />
      <div className="push-page__page" data-push-page role="region" aria-labelledby={labelledBy} tabIndex={-1}>
        {children}
      </div>
    </div>
  )
}

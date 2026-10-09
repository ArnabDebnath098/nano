import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap.js'
import { CORNER_SMOOTHING, bottomSquirclePath } from '../../lib/squircle.js'
import StatusBar from '../StatusBar/StatusBar.jsx'
import ManageFamilyHeader from '../ManageFamilyHeader/ManageFamilyHeader.jsx'
import HeroBackground from '../HeroBackground/HeroBackground.jsx'
import './TopBar.css'

// Figma 306:30909 — collapsed bar shows the hero artwork offset by -84px
const COLLAPSE_DISTANCE = 84
const COLLAPSED_RADIUS = 20

// Figma: Top bar (38:4215 expanded → 306:30909 collapsed) — pinned status bar + header.
// The bar carries its own clipped copy of the hero background. For the first 84px of
// scroll it moves 1:1 with the page (seamless with the hero behind it), then locks in
// place while the bottom corners round off to 20px with smoothing.
export default function TopBar({ showStatusBar = true, ...headerProps }) {
  const root = useRef(null)

  useGSAP(
    () => {
      const surface = root.current.querySelector('[data-bar-surface]')
      const corner = { radius: 0 }

      // Smoothed corners can't be done with border-radius, so clip with a squircle path
      const applyClip = () => {
        const { width, height } = surface.getBoundingClientRect()
        const path = bottomSquirclePath({ width, height, radius: corner.radius, smoothing: CORNER_SMOOTHING })
        surface.style.clipPath = `path('${path}')`
      }

      gsap
        .timeline({
          defaults: { ease: 'none' },
          // scrub: true (no smoothing) so the art tracks the page exactly
          scrollTrigger: { start: 0, end: COLLAPSE_DISTANCE, scrub: true },
        })
        .fromTo('[data-bar-art]', { y: 0 }, { y: -COLLAPSE_DISTANCE }, 0)
        .fromTo(corner, { radius: 0 }, { radius: COLLAPSED_RADIUS, onUpdate: applyClip }, 0)

      // The path is in pixels, so rebuild it when the bar's size changes
      const resize = new ResizeObserver(applyClip)
      resize.observe(surface)
      return () => resize.disconnect()
    },
    { scope: root },
  )

  return (
    <div ref={root} className={`top-bar ${showStatusBar ? '' : 'top-bar--native'}`}>
      <div className="top-bar__surface" data-bar-surface aria-hidden="true">
        <div className="top-bar__art" data-bar-art>
          <HeroBackground />
        </div>
      </div>
      {showStatusBar && <StatusBar />}
      <ManageFamilyHeader {...headerProps} />
    </div>
  )
}

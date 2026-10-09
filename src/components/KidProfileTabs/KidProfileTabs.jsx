import { useLayoutEffect, useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap.js'
import { MOVE, prefersReducedMotion } from '../../lib/motion.js'
import './KidProfileTabs.css'

// Figma artboard the tab geometry and recess shapes are drawn for
const DESIGN_WIDTH = 375
const DESIGN_HEIGHT = 66
const RECESS_HEIGHT = 59

// Recess geometry, measured from the four Figma variants: the notch sits 6px outside
// the pill, flares into the bar over 16px, and the bar's top corners are 40px.
const NOTCH_GAP = 6
const FLARE = 16
const CORNER = 40
const f = (n) => +n.toFixed(2)

// One continuous recess path for a pill at [x, x + w]. Every Figma variant is a point
// on this function, so tweening x/w morphs the notch instead of cross-fading shapes.
// Near an edge the corner radius shrinks to 0 and the flare runs off the bar (clipped
// by the viewBox), which reproduces the Wallet/Orders variants exactly.
function recessPath(x, w) {
  const l = x - NOTCH_GAP
  const r = x + w + NOTCH_GAP
  const rl = Math.min(CORNER, Math.max(0, l - FLARE))
  const rr = Math.min(CORNER, Math.max(0, DESIGN_WIDTH - (r + FLARE)))
  const k = (rad, v) => f((v * rad) / CORNER)
  const W = DESIGN_WIDTH
  return [
    `M0 ${RECESS_HEIGHT}V${f(rl)}`,
    // top-left corner (Figma's smoothed 40px corner, scaled to rl)
    `C0 ${k(rl, 21.144)} 0 ${k(rl, 11.715)} ${k(rl, 5.857)} ${k(rl, 5.857)}`,
    `C${k(rl, 11.715)} 0 ${k(rl, 21.144)} 0 ${f(rl)} 0`,
    // notch
    `H${f(l - FLARE)}C${f(l - 7.163)} 0 ${f(l)} 7.163 ${f(l)} 16V22`,
    `C${f(l)} 37.464 ${f(l + 12.536)} 50 ${f(l + 28)} 50H${f(r - 28)}`,
    `C${f(r - 12.536)} 50 ${f(r)} 37.464 ${f(r)} 22V16`,
    `C${f(r)} 7.163 ${f(r + 7.163)} 0 ${f(r + FLARE)} 0`,
    // top-right corner
    `H${f(W - rr)}C${f(W - k(rr, 21.144))} 0 ${f(W - k(rr, 11.715))} 0 ${f(W - k(rr, 5.857))} ${k(rr, 5.857)}`,
    `C${W} ${k(rr, 11.715)} ${W} ${k(rr, 21.144)} ${W} ${f(rr)}V${RECESS_HEIGHT}Z`,
  ].join('')
}

// Figma: Tab bar (noon Kids 10048:281155) — Wallet · Approvals · Tasks · Orders.
// The sculpted pill and the notch cut around it are driven by one tween, so the
// recess travels and stretches with the pill as a single object.
// The bar is rendered at its 375px design size and scaled uniformly to the screen,
// so pills and notches always stay aligned.
export default function KidProfileTabs({ tabs, selected, onSelect, idPrefix }) {
  const root = useRef(null)

  // Uniform scale to the available width
  useLayoutEffect(() => {
    const el = root.current
    const apply = () => {
      const scale = el.clientWidth / DESIGN_WIDTH
      el.style.setProperty('--tabs-scale', scale)
      el.style.height = `${DESIGN_HEIGHT * scale}px`
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Shared pill geometry — the single source both the pill and the notch render from
  const geom = useRef(null)

  useGSAP(
    () => {
      const tab = root.current.querySelector(`[data-tab="${selected}"]`)
      if (!tab) return
      const pill = root.current.querySelector('[data-tab-pill]')
      const recess = root.current.querySelector('[data-recess]')
      const render = () => {
        const { x, width } = geom.current
        pill.style.transform = `translateX(${x}px)`
        pill.style.width = `${width}px`
        recess.setAttribute('d', recessPath(x, width))
      }
      const target = { x: tab.offsetLeft, width: tab.offsetWidth }

      if (!geom.current || prefersReducedMotion()) {
        geom.current = target
        render()
        return
      }

      // noon NANO PP Move (540ms recorded spring). Tweening the shared object means a
      // tap mid-flight retargets from wherever the pill is, rather than snapping.
      gsap.to(geom.current, { ...target, ...MOVE, overwrite: true, onUpdate: render })
    },
    { scope: root, dependencies: [selected] },
  )

  // WAI-ARIA tabs with automatic activation: arrows/Home/End move the selection,
  // so the pill itself shows keyboard focus (no separate focus ring needed)
  const onKeyDown = (e) => {
    const i = tabs.findIndex((t) => t.id === selected)
    const next = {
      ArrowRight: (i + 1) % tabs.length,
      ArrowLeft: (i - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[e.key]
    if (next === undefined) return
    e.preventDefault()
    onSelect(tabs[next].id)
    root.current.querySelector(`[data-tab="${tabs[next].id}"]`)?.focus()
  }

  return (
    <div ref={root} className="kid-tabs">
      <div className="kid-tabs__stage">
        {/* Recess — white bar with the notch cut around the selected tab */}
        <svg
          className="kid-tabs__recess"
          width={DESIGN_WIDTH}
          height={RECESS_HEIGHT}
          viewBox={`0 0 ${DESIGN_WIDTH} ${RECESS_HEIGHT}`}
          aria-hidden="true"
        >
          <path data-recess fill="#fff" d={recessPath(16, tabs[0].width)} />
        </svg>

        <div className="kid-tabs__pill" data-tab-pill aria-hidden="true" />

        <div className="kid-tabs__list" role="tablist" aria-label="Profile sections" onKeyDown={onKeyDown}>
          {tabs.map((tab) => {
            const isSelected = tab.id === selected
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${idPrefix}-tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`${idPrefix}-panel`}
                tabIndex={isSelected ? 0 : -1}
                className={`kid-tabs__tab ${isSelected ? 'is-selected' : ''}`}
                style={{ width: tab.width }}
                data-tab={tab.id}
                onClick={() => onSelect(tab.id)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

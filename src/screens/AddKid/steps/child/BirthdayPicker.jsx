import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import BottomSheet from '../../../../components/BottomSheet/BottomSheet.jsx'
import { prefersReducedMotion } from '../../../../lib/motion.js'
import { haptic } from '../../../../lib/haptics.js'
import NanoButton from '../../../../components/AddKid/NanoButton.jsx'
import SquircleSurface from '../../../../components/SquircleSurface/SquircleSurface.jsx'
import { ageInRange } from '../../steps.js'
import './BirthdayPicker.css'

// Birthday entry — the same on iOS, Android and web: a date wheel in the app's M-BottomSheet
// (smoothed corners, as the app's other sheets), styled with the app's own type + tokens rather
// than imitating iOS chrome. Head: "Your kid’s date of birth" + the 7–18 age rule, which
// turns red when the picked date is out of range (you see it while scrolling, not as
// a toast after Done). Three columns, day · month · year, under one selection band; a full-width
// nano Done commits. The band is a lens: a flat, bold copy of each column is clipped to it and
// the drum underneath is masked out there, so the selected value reads crisp (as UIPickerView's
// magnifier does) while the rest turns away on the drum.
// Motion: each column is its own physics wheel (no native scroll-snap, which can't be elastic):
//  • drag — the drum follows the finger 1:1; past the first / last value it rubber-bands
//    (iOS's 1 − 1/(x·0.55/d + 1) curve), so it stretches and resists instead of stopping dead;
//  • release — the flick's velocity (last ~80ms of samples) is projected forward with iOS's
//    deceleration and rounded to a row, then an under-damped spring (ζ 0.66) carries
//    the drum there from its current speed: it lands with a small elastic overshoot, and a fling
//    into either end bounces back off it;
//  • trackpad / wheel — moves the drum directly (rubber-banding too) and springs to the nearest
//    row once the gesture pauses; a tap on a row springs to it. Grabbing a moving wheel stops it
//    under the finger (interruptible).
// Rows sit on a cylinder (20° apart, radius R = ROW / 20°), so their position, depth and
// rotation follow the angle from the centre — rows bunch up and turn away towards the edges, and
// fade with cos(angle). Haptics: every row crossing the band plays a `detent` tick (spaced ≥ 45ms
// so a fast spin stays a run of clicks), landing on a new value a firmer `settle`, and hitting
// either end a `light` bump. transform/opacity only, written per frame.
// Reduced motion: flat list, no tilt, no springs — the wheel jumps to its row. Keyboard steps
// (↑/↓) always jump — never animate a keyboard action.
// Portalled to <body>: the step body is transformed during step transitions, which would
// otherwise trap the sheet's position: fixed inside it.
const ROW = 44 // row height (a comfortable tap target)
const ROW_DEG = 20 // angle between rows on the drum
const RADIUS = ROW / ((ROW_DEG * Math.PI) / 180) // ≈ 126px, so arc length per row = ROW
const WHEEL_H = Math.round(RADIUS * 2) // the drum's full visible height (≈ 252px)
// Physics
const SNAP = { K: (2 * Math.PI / 0.42) ** 2, zeta: 0.66 } // ~0.42s period, a visible elastic overshoot
const DECEL = 0.996 // iOS-like deceleration per ms → projected distance = v · DECEL / (1 − DECEL)
const MAX_FLING = 4.5 // px/ms cap, so a wild flick can't spin through the whole list
const RUBBER = 0.55
const WHEEL_IDLE_MS = 140 // trackpad gesture pause before springing to a row
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const daysIn = (y, m) => new Date(y, m, 0).getDate() // m is 1-based
// iOS rubber band: how far the drum actually travels for `x` px of pull past an end
const rubber = (x, dim) => (1 - 1 / ((Math.abs(x) * RUBBER) / dim + 1)) * dim * Math.sign(x)
const pad = (n) => String(n).padStart(2, '0')

function parse(iso, fallback) {
  if (!iso) return fallback
  const [y, m, d] = iso.split('-').map(Number)
  return { y, m, d }
}

export default function BirthdayPicker({ open, value, onClose, onDone }) {
  const [today] = useState(() => new Date())
  const thisYear = today.getFullYear()
  const years = Array.from({ length: 26 }, (_, i) => thisYear - 25 + i)
  const fallback = { y: thisYear - 10, m: today.getMonth() + 1, d: today.getDate() }

  const [sel, setSel] = useState(() => parse(value, fallback))
  // Re-seed from the stored value each time the sheet opens
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setSel(parse(value, fallback))
  }

  const maxDay = daysIn(sel.y, sel.m)
  const days = Array.from({ length: maxDay }, (_, i) => i + 1)
  const day = Math.min(sel.d, maxDay)
  const iso = `${sel.y}-${pad(sel.m)}-${pad(day)}`
  const inRange = ageInRange(iso, today)

  return createPortal(
    <BottomSheet open={open} onClose={onClose} labelledBy="birthday-picker-title">
      <div className="birthday-picker">
        <div className="birthday-picker__head">
          <h2 id="birthday-picker-title" className="birthday-picker__title">
            Your kid’s date of birth
          </h2>
          {/* The age rule, always shown; turns red while the picked date is outside it */}
          <p className={`birthday-picker__value ${inRange ? '' : 'is-error'}`} aria-live="polite">
            Your kid should be between 7 and 18 years old
          </p>
        </div>

        <div className="birthday-picker__wheels">
          <div className="birthday-picker__band" aria-hidden="true">
            <SquircleSurface />
          </div>
          <Wheel
            label="Day"
            items={days}
            index={day - 1}
            onChange={(i) => setSel((s) => ({ ...s, d: i + 1 }))}
            open={open}
          />
          <Wheel
            label="Month"
            items={MONTHS}
            index={sel.m - 1}
            grow
            onChange={(i) => setSel((s) => ({ ...s, m: i + 1 }))}
            open={open}
          />
          <Wheel
            label="Year"
            items={years}
            index={Math.max(0, years.indexOf(sel.y))}
            onChange={(i) => setSel((s) => ({ ...s, y: years[i] }))}
            open={open}
          />
        </div>

        <div className="birthday-picker__actions">
          <NanoButton variant="primary" onClick={() => onDone(iso)}>
            Done
          </NanoButton>
        </div>
      </div>
    </BottomSheet>,
    document.body,
  )
}

function Wheel({ label, items, index, format = (v) => v, onChange, grow = false, open }) {
  const root = useRef(null)
  const lens = useRef(null)
  const rows = useRef([])
  const m = useRef({
    pos: index * ROW, // drum offset: row i is centred at pos = i · ROW
    vel: 0, // px/s while springing
    target: index * ROW,
    raf: 0,
    last: 0,
    drag: null, // { startY, startPos, samples, raw }
    wheelTimer: 0,
    current: index, // committed value
    detent: index, // last row through the band
    lastTick: 0,
    atEdge: false,
  })
  const count = items.length
  const maxPos = (count - 1) * ROW
  const ctl = useRef({}) // latest props for the frame loop
  ctl.current = { count, maxPos, onChange }

  // Place every row on the drum — written straight to each row (no React state)
  const paint = () => {
    const s = m.current
    const reduced = prefersReducedMotion()
    const centre = s.pos / ROW
    if (lens.current) lens.current.style.transform = `translate3d(0, ${(-s.pos).toFixed(2)}px, 0)`
    rows.current.forEach((row, i) => {
      if (!row) return
      const dist = i - centre
      if (reduced) {
        row.style.visibility = Math.abs(dist) > 3 ? 'hidden' : ''
        row.style.transform = `translate3d(0, ${(dist * ROW).toFixed(2)}px, 0)`
        row.style.opacity = String(Math.max(0.25, 1 - Math.abs(dist) * 0.3))
        return
      }
      const deg = dist * ROW_DEG
      if (Math.abs(deg) >= 90) {
        row.style.visibility = 'hidden' // behind the drum
        return
      }
      const a = (deg * Math.PI) / 180
      row.style.visibility = ''
      row.style.transform = `translate3d(0, ${(RADIUS * Math.sin(a)).toFixed(2)}px, ${(RADIUS * Math.cos(a) - RADIUS).toFixed(2)}px) rotateX(${(-deg).toFixed(2)}deg)`
      row.style.opacity = Math.cos(a).toFixed(3)
    })

    // Detent tick per row through the band (only rows that exist — not the rubber band)
    const nearest = Math.max(0, Math.min(ctl.current.count - 1, Math.round(centre)))
    if (nearest !== s.detent) {
      s.detent = nearest
      const now = performance.now()
      if (now - s.lastTick >= 45) {
        s.lastTick = now
        haptic.detent()
      }
    }
    // A bump the moment the drum runs past either end
    const past = s.pos < -1 || s.pos > ctl.current.maxPos + 1
    if (past && !s.atEdge) haptic.light()
    s.atEdge = past
  }

  const commit = () => {
    const s = m.current
    const i = Math.max(0, Math.min(ctl.current.count - 1, Math.round(s.pos / ROW)))
    if (i !== s.current) {
      s.current = i
      ctl.current.onChange(i)
      haptic.settle() // a firmer bump as the wheel lands on its new value
    }
  }

  // Spring the drum to `target` (px) from its current position and velocity
  const springTo = (target) => {
    const s = m.current
    s.target = target
    cancelAnimationFrame(s.raf)
    if (prefersReducedMotion()) {
      s.pos = target
      s.vel = 0
      paint()
      commit()
      return
    }
    const c = 2 * SNAP.zeta * Math.sqrt(SNAP.K)
    s.last = 0
    const frame = (now) => {
      const dt = s.last ? Math.min(0.032, (now - s.last) / 1000) : 1 / 60
      s.last = now
      s.vel += (-SNAP.K * (s.pos - s.target) - c * s.vel) * dt
      s.pos += s.vel * dt
      if (Math.abs(s.pos - s.target) < 0.1 && Math.abs(s.vel) < 4) {
        s.pos = s.target
        s.vel = 0
        s.raf = 0
        paint()
        commit()
        return
      }
      paint()
      s.raf = requestAnimationFrame(frame)
    }
    s.raf = requestAnimationFrame(frame)
  }

  const rowAt = (i) => Math.max(0, Math.min(ctl.current.count - 1, i)) * ROW
  // Raw (unbounded) offset → what the drum shows, rubber-banded past the ends
  const banded = (raw) => {
    const { maxPos: max } = ctl.current
    if (raw < 0) return rubber(raw, WHEEL_H)
    if (raw > max) return max + rubber(raw - max, WHEEL_H)
    return raw
  }
  // …and back, so a drag that starts mid-bounce doesn't jump
  const unband = (pos) => {
    const { maxPos: max } = ctl.current
    const inv = (y) => {
      const t = Math.min(0.95, Math.abs(y) / WHEEL_H)
      return ((1 / (1 - t) - 1) * WHEEL_H * Math.sign(y)) / RUBBER
    }
    if (pos < 0) return inv(pos)
    if (pos > max) return max + inv(pos - max)
    return pos
  }

  const onPointerDown = (e) => {
    if (e.button !== 0) return
    const s = m.current
    cancelAnimationFrame(s.raf) // grab a moving wheel: it stops under the finger
    s.raf = 0
    s.vel = 0
    s.drag = { id: e.pointerId, startY: e.clientY, startRaw: unband(s.pos), samples: [[performance.now(), e.clientY]], moved: false }
    root.current.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e) => {
    const d = m.current.drag
    if (!d || d.id !== e.pointerId) return
    const dy = e.clientY - d.startY
    if (Math.abs(dy) > 3) d.moved = true
    d.samples.push([performance.now(), e.clientY])
    if (d.samples.length > 8) d.samples.shift()
    m.current.pos = banded(d.startRaw - dy)
    paint()
  }

  const onPointerUp = (e) => {
    const s = m.current
    const d = s.drag
    if (!d || d.id !== e.pointerId) return
    s.drag = null
    if (!d.moved) {
      // A tap: spring to the tapped row (relative to the band at the wheel's centre)
      const box = root.current.getBoundingClientRect()
      const offset = Math.round((e.clientY - (box.top + box.height / 2)) / ROW)
      springTo(rowAt(Math.round(s.pos / ROW) + offset))
      return
    }
    // Release velocity over the last ~80ms (px/ms, positive = drum moving to later rows)
    const now = performance.now()
    const recent = d.samples.filter(([t]) => now - t <= 80)
    let v = 0
    if (recent.length >= 2) {
      const [t0, y0] = recent[0]
      const [t1, y1] = recent[recent.length - 1]
      if (t1 > t0) v = -(y1 - y0) / (t1 - t0)
    }
    v = Math.max(-MAX_FLING, Math.min(MAX_FLING, v))
    const projected = s.pos + (v * DECEL) / (1 - DECEL)
    s.vel = v * 1000 // carry the flick into the spring
    springTo(rowAt(Math.round(projected / ROW)))
  }

  // Trackpad / mouse wheel: move the drum directly, then settle on a row once it pauses
  useEffect(() => {
    const el = root.current
    const s = m.current // our own state object, not a DOM node
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      cancelAnimationFrame(s.raf)
      s.raf = 0
      s.vel = 0
      const delta = e.deltaMode === 1 ? e.deltaY * ROW : e.deltaY
      s.pos = banded(unband(s.pos) + delta)
      paint()
      clearTimeout(s.wheelTimer)
      s.wheelTimer = setTimeout(() => springTo(rowAt(Math.round(s.pos / ROW))), WHEEL_IDLE_MS)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      el.removeEventListener('wheel', onWheel)
      clearTimeout(s.wheelTimer)
      cancelAnimationFrame(s.raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Jump to the selected row whenever the sheet opens (no animation — it's where it already was)
  useLayoutEffect(() => {
    if (!open) return
    const s = m.current
    cancelAnimationFrame(s.raf)
    s.raf = 0
    s.pos = s.target = index * ROW
    s.vel = 0
    s.current = s.detent = index // no tick for the initial placement
    paint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // The list shrank under the selection (31 → 28 days): spring back onto the last row
  useEffect(() => {
    const s = m.current
    if (index !== s.current && !s.drag) {
      s.current = index
      springTo(index * ROW)
    } else paint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, index])

  const step = (dir) => {
    const s = m.current
    cancelAnimationFrame(s.raf)
    s.raf = 0
    s.vel = 0
    s.pos = s.target = rowAt(s.current + dir)
    paint()
    commit()
  }

  return (
    <div className={`birthday-wheel-col ${grow ? 'birthday-wheel-col--grow' : ''}`} style={{ '--row': `${ROW}px`, '--wheel-h': `${WHEEL_H}px` }}>
      <div
        ref={root}
        className="birthday-wheel"
        role="listbox"
        aria-label={label}
        aria-activedescendant={`${label}-opt-${index}`}
        tabIndex={0}
        data-haptic="off" /* the wheel plays its own detents */
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') step(1)
          else if (e.key === 'ArrowUp') step(-1)
          else return
          e.preventDefault()
        }}
      >
        {items.map((item, i) => (
          <div
            key={item}
            id={`${label}-opt-${i}`}
            ref={(el) => (rows.current[i] = el)}
            role="option"
            aria-selected={i === index}
            className="birthday-wheel__row"
          >
            {format(item)}
          </div>
        ))}
      </div>
      {/* Lens: the selected value, flat and bold, clipped to the band */}
      <div className="birthday-wheel__lens" aria-hidden="true">
        <div ref={lens} className="birthday-wheel__lens-track">
          {items.map((item) => (
            <div key={item} className="birthday-wheel__lens-row">
              {format(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

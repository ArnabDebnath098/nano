import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import BottomSheet from '../../../../components/BottomSheet/BottomSheet.jsx'
import { prefersReducedMotion } from '../../../../lib/motion.js'
import { haptic } from '../../../../lib/haptics.js'
import './BirthdayPicker.css'

// Birthday entry — the iOS native date wheel as a bottom sheet (Figma has no picker frame in
// 02 · Add a Child, so this follows UIDatePicker .wheels): a Cancel · title · Done toolbar,
// SF Pro 21 rows 34pt tall on a 216pt drum with the grey selection pill. Three columns:
// day · month · year. Used on iOS (Safari's own date input opens a calendar popover) and web.
// Motion: the columns are native scroll-snap lists, so flicks keep real momentum and can be
// interrupted mid-spin (Emil: interruptible > choreographed). Each column renders as an iOS
// drum: rows sit on a cylinder (18° apart, radius R = ROW / 18° ≈ 127px), so their position,
// depth and rotation follow the angle from the centre — rows bunch up and turn away towards
// the edges, and fade with cos(angle). The wheel's own `perspective` keeps the vanishing point
// fixed at its centre while the content scrolls. Every row that lands in the band plays a
// `detent` haptic (a 3-tick burst — iOS Safari's single tick is too faint), like UIPickerView's
// detents, and landing on a new value plays a firmer `settle` bump. transform/opacity only, written per frame.
// Reduced motion: flat list, no tilt; snapping is instant. Keyboard steps (↑/↓) always jump —
// never animate a keyboard action.
// Portalled to <body>: the step body is transformed during step transitions, which would
// otherwise trap the sheet's position: fixed inside it.
const ROW = 34 // UIDatePicker row height
const ROW_DEG = 18 // angle between rows on the drum
const RADIUS = ROW / ((ROW_DEG * Math.PI) / 180) // ≈ 108.2px, so arc length per row = ROW
const WHEEL_H = Math.round(RADIUS * 2) // the drum's full visible height (216pt, as UIDatePicker)
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

const daysIn = (y, m) => new Date(y, m, 0).getDate() // m is 1-based
// Tap / clamp scrolls glide; reduced motion jumps
const glide = () => (prefersReducedMotion() ? 'auto' : 'smooth')
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

  return createPortal(
    <BottomSheet open={open} onClose={onClose} labelledBy="birthday-picker-title">
      <div className="birthday-picker">
        {/* iOS toolbar: Cancel · title · Done */}
        <div className="birthday-picker__head">
          <button type="button" className="birthday-picker__action" onClick={onClose}>
            Cancel
          </button>
          <h2 id="birthday-picker-title" className="birthday-picker__title">
            Birthday
          </h2>
          <button
            type="button"
            className="birthday-picker__action birthday-picker__action--done"
            aria-describedby="birthday-picker-value"
            onClick={() => onDone(`${sel.y}-${pad(sel.m)}-${pad(day)}`)}
          >
            Done
          </button>
          <span id="birthday-picker-value" className="birthday-picker__sr">
            {day} {MONTHS[sel.m - 1]} {sel.y}
          </span>
        </div>

        <div className="birthday-picker__wheels">
          <div className="birthday-picker__band" aria-hidden="true" />
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

      </div>
    </BottomSheet>,
    document.body,
  )
}

function Wheel({ label, items, index, format = (v) => v, onChange, grow = false, open }) {
  const list = useRef(null)
  const settle = useRef(null)
  const current = useRef(index)
  const detent = useRef(index) // last row that crossed the centre (for haptic ticks)
  const lastTick = useRef(0)

  // Place every row on the drum — written straight to each row (no React state)
  const paint = () => {
    const el = list.current
    if (!el) return
    const reduced = prefersReducedMotion()
    const centre = el.scrollTop / ROW
    for (const row of el.children) {
      const i = Number(row.dataset.i)
      if (Number.isNaN(i)) continue
      const dist = i - centre
      if (reduced) {
        row.style.transform = ''
        row.style.opacity = String(Math.max(0.25, 1 - Math.abs(dist) * 0.3))
        row.style.visibility = ''
        continue
      }
      const deg = dist * ROW_DEG
      if (Math.abs(deg) >= 90) {
        row.style.visibility = 'hidden' // behind the drum
        continue
      }
      const a = (deg * Math.PI) / 180
      // From its flat scroll position, move the row onto the cylinder and turn it to face out
      const dy = RADIUS * Math.sin(a) - dist * ROW
      const dz = RADIUS * Math.cos(a) - RADIUS
      row.style.visibility = ''
      row.style.transform = `translate3d(0, ${dy.toFixed(2)}px, ${dz.toFixed(2)}px) rotateX(${(-deg).toFixed(2)}deg)`
      row.style.opacity = Math.cos(a).toFixed(3)
    }
    // Detent: a tick each time a new row reaches the centre band. Spaced ≥ 60ms (one burst's
    // length) so a fast spin stays a run of distinct clicks instead of smearing into nothing
    const nearest = Math.round(centre)
    if (nearest !== detent.current) {
      detent.current = nearest
      const now = performance.now()
      if (now - lastTick.current >= 60) {
        lastTick.current = now
        haptic.detent()
      }
    }
  }

  // Jump to the selected row whenever the sheet opens (no animation — it's where it already was)
  useLayoutEffect(() => {
    if (!open || !list.current) return
    list.current.scrollTop = index * ROW
    current.current = index
    detent.current = index // no tick for the initial placement
    paint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Clamp when the list shrinks (e.g. 31 → 28 days)
  useEffect(() => {
    const el = list.current
    if (!el) return
    if (index !== current.current) {
      el.scrollTo({ top: index * ROW, behavior: glide() })
      current.current = index
    }
    paint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, index])

  const onScroll = () => {
    paint()
    clearTimeout(settle.current)
    settle.current = setTimeout(() => {
      const el = list.current
      if (!el) return
      const i = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollTop / ROW)))
      if (i !== current.current) {
        current.current = i
        onChange(i)
        haptic.settle() // a firmer bump as the wheel lands on its new value
      }
    }, 90)
  }

  const step = (dir) => {
    const i = Math.max(0, Math.min(items.length - 1, current.current + dir))
    list.current?.scrollTo({ top: i * ROW, behavior: 'auto' })
  }

  return (
    <div
      ref={list}
      className={`birthday-wheel ${grow ? 'birthday-wheel--grow' : ''}`}
      role="listbox"
      aria-label={label}
      tabIndex={0}
      onScroll={onScroll}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') step(1)
        else if (e.key === 'ArrowUp') step(-1)
        else return
        e.preventDefault()
      }}
      style={{ '--row': `${ROW}px`, '--wheel-h': `${WHEEL_H}px` }}
    >
      <div className="birthday-wheel__spacer" aria-hidden="true" />
      {items.map((item, i) => (
        <div
          key={item}
          data-i={i}
          role="option"
          aria-selected={i === index}
          className="birthday-wheel__row"
          onClick={() => list.current?.scrollTo({ top: i * ROW, behavior: glide() })}
        >
          {format(item)}
        </div>
      ))}
      <div className="birthday-wheel__spacer" aria-hidden="true" />
    </div>
  )
}

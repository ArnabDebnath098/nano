import { useEffect, useRef, useState } from 'react'
import NanoButton from '../components/AddKid/NanoButton.jsx'
import ActionBar from '../components/AddKid/ActionBar.jsx'
import GooLoader from '../components/AddKid/GooLoader.jsx'
import './ButtonLab.css'

// Button lab (#/button-lab) — try the nano button's loading state (the Goo loader)
const DURATIONS = [
  { id: 1500, label: '1.5s' },
  { id: 3000, label: '3s' },
  { id: 'hold', label: 'Stay on' },
]
const VARIANTS = [
  { id: 'primary', label: 'Primary' },
  { id: 'secondary', label: 'Secondary' },
  { id: 'both', label: 'Both' },
]

function Segmented({ label, options, value, onChange }) {
  return (
    <div className="lab__field">
      <span className="lab__field-label">{label}</span>
      <div className="lab__seg" role="radiogroup" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            className={`lab__seg-item${value === o.id ? ' lab__seg-item--on' : ''}`}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function ButtonLab({ titleId, onBack }) {
  const [variant, setVariant] = useState('primary')
  const [duration, setDuration] = useState(1500)
  const [loading, setLoading] = useState(false)
  const timer = useRef(null)

  const hold = duration === 'hold'
  const busy = hold || loading

  useEffect(() => () => clearTimeout(timer.current), [])

  const start = () => {
    if (hold) return
    clearTimeout(timer.current)
    setLoading(true)
    timer.current = setTimeout(() => setLoading(false), duration)
  }

  const pickDuration = (d) => {
    clearTimeout(timer.current)
    setLoading(false)
    setDuration(d)
  }

  const buttons = variant === 'both' ? ['secondary', 'primary'] : [variant]

  return (
    <div className="lab">
      <header className="lab__header">
        <button type="button" className="lab__back" onClick={onBack} aria-label="Back">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 id={titleId} className="lab__title">
          Button loading
        </h1>
      </header>

      <div className="lab__body">
        {/* The loader at 3×, on the two button surfaces */}
        <div className="lab__stage" aria-hidden="true">
          <div className="lab__tile lab__tile--dark">
            <GooLoader className="lab__big" />
          </div>
          <div className="lab__tile lab__tile--light">
            <GooLoader className="lab__big" />
          </div>
        </div>

        <Segmented label="Button" options={VARIANTS} value={variant} onChange={setVariant} />
        <Segmented label="Loading for" options={DURATIONS} value={duration} onChange={pickDuration} />
      </div>

      <div className="lab__footer">
        <ActionBar layout="row" top={<span className="lab__hint">{hold ? 'Loading stays on' : 'Tap to load'}</span>}>
          {buttons.map((v) => (
            <NanoButton key={v} variant={v} loading={busy} onClick={start}>
              {v === 'primary' ? 'Continue' : 'Back'}
            </NanoButton>
          ))}
        </ActionBar>
      </div>
    </div>
  )
}

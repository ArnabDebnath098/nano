import StatusBar from '../StatusBar/StatusBar.jsx'
import { haptic } from '../../lib/haptics.js'
import { usePress } from '../../lib/usePress.js'
import './AddKidHeader.css'

// Figma: Top bar (57:1244) = Status bar + "Add a child header" (55:1162, Step 1–5).
// Close on the left; the progress track (72 × 4) is centred against a 48px right inset.
// The fill grows the moment Continue is tapped, on a 700ms strong ease-out so the travel reads
// (scaleX, so it never triggers layout).
export default function AddKidHeader({ step = 1, total = 5, onClose, solid = false }) {
  // Close: dips to 0.94 (NANO icon-button press) and springs back on PP Move, with a light haptic
  const press = usePress(0.94)

  return (
    <header className={`add-kid-header ${solid ? 'is-solid' : ''}`}>
      <StatusBar tone="dark" />
      <div className="add-kid-header__row">
        <button
          type="button"
          className="add-kid-header__close"
          aria-label="Close"
          {...press}
          onClick={(e) => {
            haptic.light()
            onClose?.(e)
          }}
        >
          <img src="/figma/add-kid/cross.svg" width="20" height="20" alt="" />
        </button>
        <div className="add-kid-header__content">
          <div
            className="add-kid-header__progress"
            role="progressbar"
            aria-label="Add a child progress"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={step}
            aria-valuetext={`Step ${step} of ${total}`}
          >
            <span className="add-kid-header__fill" style={{ '--progress': step / total }} />
          </div>
        </div>
      </div>
    </header>
  )
}

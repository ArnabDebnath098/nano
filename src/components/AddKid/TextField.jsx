import { useEffect, useId, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/motion.js'
import { useAddKid } from '../../screens/AddKid/AddKidContext.js'
import SquircleSurface from '../SquircleSurface/SquircleSurface.jsx'
import './TextField.css'

// Figma: M-Input-alt (field 56 tall, radius 12, label row B12 + red "*" when required).
// Empty → the label sits centred as a placeholder; focused or filled → it floats to the
// top row and the value shows below (PP Move for the travel, PP Fade for colour).
// placeholder → the label is a plain placeholder instead: it stays centred and fades away
// as soon as the field is focused or has text, and the value sits centred in its place.
// inputPlaceholder → a native placeholder on the input itself (muted), shown after any `prefix`.
// error → red border; `shake` (a counter) replays the NANO field shake each time it changes —
// via WAAPI on the live node, so the input keeps focus and caret (no remount).
// Focusing raises the drawn keyboard (desktop) via the flow: `keyboard="text" | "numpad"`.
export default function TextField({
  label,
  value,
  onChange,
  required = true,
  error = false,
  shake = 0,
  type = 'text',
  inputMode,
  autoComplete = 'off',
  keyboard = inputMode === 'numeric' || inputMode === 'decimal' ? 'numpad' : 'text',
  right,
  prefix,
  readOnly = false,
  placeholder = false,
  inputPlaceholder,
  onClick,
  inputRef,
  onFocus,
  onBlur,
  ...rest
}) {
  const id = useId()
  const { setKeyboard } = useAddKid()
  const filled = value !== undefined && value !== null && String(value).length > 0

  // NANO field shake: 340ms, 0 → −4 → 3 → −2 → 1 → 0 px, cubic-bezier(.36,.07,.19,.97)
  const fieldRef = useRef(null)
  useEffect(() => {
    if (!shake || prefersReducedMotion() || !fieldRef.current) return
    fieldRef.current.animate(
      [0, -4, 3, -2, 1, 0].map((x) => ({ translate: `${x}px` })),
      { duration: 340, easing: 'cubic-bezier(0.36, 0.07, 0.19, 0.97)' },
    )
  }, [shake])

  return (
    <div
      className={`text-field ${filled ? 'is-filled' : ''} ${error ? 'is-error' : ''} ${readOnly ? 'is-readonly' : ''} ${placeholder ? 'is-placeholder' : ''}`}
      onClick={onClick}
    >
      <label ref={fieldRef} className="text-field__field" htmlFor={id}>
        {/* Fill + border with Figma 60% corner smoothing (radius from CSS: 12, or a context override) */}
        <SquircleSurface />
        <span className="text-field__body">
          <span className="text-field__label" aria-hidden={placeholder || undefined}>
            {label}
            {required && <span className="text-field__required"> *</span>}
          </span>
          <span className="text-field__content">
            {prefix && <span className="text-field__prefix">{prefix}</span>}
            <input
              ref={inputRef}
              id={id}
              className="text-field__input"
              type={type}
              inputMode={inputMode}
              autoComplete={autoComplete}
              value={value ?? ''}
              readOnly={readOnly}
              placeholder={inputPlaceholder}
              aria-invalid={error || undefined}
              aria-label={placeholder ? label : undefined}
              onChange={(e) => onChange?.(e.target.value)}
              {...rest}
              onFocus={(e) => {
                if (!readOnly) setKeyboard(keyboard)
                onFocus?.(e)
              }}
              onBlur={(e) => {
                setKeyboard(null)
                onBlur?.(e)
              }}
            />
          </span>
        </span>
        {right && <span className="text-field__right">{right}</span>}
      </label>
    </div>
  )
}

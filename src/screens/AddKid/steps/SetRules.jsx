import { useEffect, useRef, useState } from 'react'
import { useAddKid, useStepFooter } from '../AddKidContext.js'
import TextField from '../../../components/AddKid/TextField.jsx'
import { KEYBOARD_HEIGHT } from '../../../components/AddKid/DrawnKeyboard.jsx'
import { prefersReducedMotion } from '../../../lib/motion.js'
import { preloadLottie } from '../../../lib/preloadLottie.js'
import RuleRadio from './rules/RuleRadio.jsx'
import RuleCheckbox from './rules/RuleCheckbox.jsx'
import './SetRules.css'

const ASSETS = '/figma/add-kid/rules'
const LIMIT_TOAST = 'Enter an order limit to continue'
const FOOTER_CLEARANCE = 132 // the row action bar + home bar over the scroller (AddKidFlow.css)

// Figma: Set rules — Nothing selected (57:1599), Auto-approve (18:16061 / 850:47390, identical),
// Manually approve expanded (18:15910), Typing a limit (18:15986), Order limit missing (18:16119),
// scroll states (57:2545 / 57:2627 / 57:2709).
// Two option cards. Picking one crossfades its fill (white → lilac gradient) and border on PP Fade
// and pops its radio dot. "Manually approve" grows to reveal "Select one" (Above an order limit +
// dhm field / For every order): grid rows 0fr → 1fr on PP Move while the content fades and rises
// 8px; collapsing is quicker. Cards and rows press to scale .98 (NANO .ich). Continue is disabled
// until a mode is picked; a manual limit that's empty or 0 → red toast + field error + shake.
export default function SetRules() {
  const { data, update, goNext, goBack, showToast, keyboard, fillName } = useAddKid()
  // Add address comes next — warm its pin Lottie so its hero never lands empty (NANO preloadHome)
  useEffect(() => preloadLottie('address'), [])
  const rules = data.rules ?? {}
  const mode = rules.mode ?? null
  const approve = rules.approve ?? 'limit'
  const limit = rules.limit ?? ''
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(0)
  const manualRef = useRef(null)
  const fieldRef = useRef(null)

  const setRules = (patch) => update((d) => ({ rules: { ...d.rules, ...patch } }))

  const pick = (next) => {
    if (next === mode) return
    setError(false)
    setRules({ mode: next, approve: next === 'manual' ? approve : undefined })
  }

  const onContinue = () => {
    if (mode === 'manual' && approve === 'limit' && !(Number(limit) > 0)) {
      showToast(LIMIT_TOAST)
      setError(true)
      setShake((n) => n + 1)
      return
    }
    goNext()
  }

  useStepFooter({
    layout: 'row',
    secondary: { label: 'Back', onClick: goBack },
    primary: { label: 'Continue', disabled: !mode, onClick: onContinue },
  })

  // Keep the expanded card / the field in view above the footer (and the drawn numpad)
  const reveal = (el, delay) => {
    const t = setTimeout(() => {
      const scroller = el?.closest('.add-kid__scroll')
      if (!scroller) return
      const kb = keyboard ? KEYBOARD_HEIGHT[keyboard] : 0
      const limitY = scroller.getBoundingClientRect().bottom - FOOTER_CLEARANCE - kb - 12
      const over = el.getBoundingClientRect().bottom - limitY
      if (over > 0) scroller.scrollBy({ top: over, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    }, delay)
    return () => clearTimeout(t)
  }

  // Expanded → bring the new rows into view once the height has settled
  useEffect(() => (mode === 'manual' ? reveal(manualRef.current, 380) : undefined), [mode]) // eslint-disable-line react-hooks/exhaustive-deps
  // Numpad up → lift the field above it (the keyboard rises on PP Move)
  useEffect(() => (keyboard ? reveal(fieldRef.current, 300) : undefined), [keyboard]) // eslint-disable-line react-hooks/exhaustive-deps

  const manual = mode === 'manual'

  return (
    <div className="set-rules">
      <div className={`rule-card ${mode === 'auto' ? 'is-selected' : ''}`} data-rise>
        <button type="button" className="rule-card__head" role="radio" aria-checked={mode === 'auto'} onClick={() => pick('auto')}>
          <span className="rule-card__action">
            <span className="rule-card__img">
              <img src={`${ASSETS}/auto-approve.png`} alt="" width="65" height="65" style={{ left: '-8.33%', top: '-5.42%' }} />
            </span>
            <RuleCheckbox checked={mode === 'auto'} />
          </span>
          <span className="rule-card__text">
            <span className="rule-card__title">Auto-approve orders</span>
            <span className="rule-card__desc">{fillName('{name} can place orders using available wallet balance')}</span>
          </span>
        </button>
      </div>

      <div ref={manualRef} className={`rule-card rule-card--manual ${manual ? 'is-selected is-open' : ''}`} data-rise>
        <button type="button" className="rule-card__head" role="radio" aria-checked={manual} aria-expanded={manual} onClick={() => pick('manual')}>
          <span className="rule-card__action">
            <span className="rule-card__img">
              <img src={`${ASSETS}/manual-approve.png`} alt="" width="65" height="65" style={{ left: '-7.74%', top: '-7.9%' }} />
            </span>
            <RuleCheckbox checked={manual} />
          </span>
          <span className="rule-card__text">
            <span className="rule-card__title">Manually approve orders</span>
            <span className="rule-card__desc">Approve all orders or those over a specific amount.</span>
          </span>
        </button>

        <div className="rule-card__expand" inert={!manual || undefined}>
          <div className="rule-card__expand-inner">
            <div className="rule-card__more">
              <img className="rule-card__divider" src={`${ASSETS}/divider.svg`} alt="" width="317" height="1" />
              <p className="rule-card__select">Select one</p>
              <div className="rule-inputs" role="radiogroup" aria-label="When to approve">
                <div className="rule-inputs__limit">
                  <button
                    type="button"
                    className="rule-option rule-option--card"
                    role="radio"
                    aria-checked={approve === 'limit'}
                    onClick={() => {
                      setRules({ approve: 'limit' })
                      // the field is inert until this re-renders — focus it on the next frame
                      requestAnimationFrame(() => fieldRef.current?.querySelector('input')?.focus())
                    }}
                  >
                    <span className="rule-option__label">Above an order limit</span>
                    <RuleRadio checked={approve === 'limit'} />
                  </button>
                  {/* Only shown for "Above an order limit": collapses away (height, fade, blur)
                      when "For every order" — or nothing yet — is selected */}
                  <div
                    className={`rule-limit-collapse ${approve === 'limit' ? 'is-open' : ''}`}
                    inert={approve !== 'limit' || undefined}
                  >
                    <div className="rule-limit-collapse__inner">
                      <div ref={fieldRef} className="rule-limit">
                        <TextField
                          label=""
                          aria-label="Order limit"
                          required={false}
                          inputMode="numeric"
                          value={limit}
                          error={error}
                          shake={shake}
                          prefix={<span className="dirham">dhm</span>}
                          inputPlaceholder="Amount"
                          onChange={(v) => {
                            setError(false)
                            setRules({ approve: 'limit', limit: v.replace(/\D/g, '').slice(0, 6) })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <img className="rule-inputs__divider" src={`${ASSETS}/divider-dashed.svg`} alt="" width="351" height="1" />
                <button
                  type="button"
                  className="rule-option rule-option--card"
                  role="radio"
                  aria-checked={approve === 'every'}
                  onClick={() => {
                    setError(false)
                    setRules({ approve: 'every' })
                  }}
                >
                  <span className="rule-option__label">For every order</span>
                  <RuleRadio checked={approve === 'every'} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { preloadLottie } from '../../../lib/preloadLottie.js'
import { createPortal } from 'react-dom'
import { useAddKid, useStepFooter } from '../AddKidContext.js'
import TextField from '../../../components/AddKid/TextField.jsx'
import NanoButton from '../../../components/AddKid/NanoButton.jsx'
import HeroIllustration from '../../../components/AddKid/HeroIllustration.jsx'
import BottomSheet from '../../../components/BottomSheet/BottomSheet.jsx'
import { prefersReducedMotion } from '../../../lib/motion.js'
import './EmailId.css'

// Prototype rules (deterministic, so every Figma error state can be reached):
//  • empty, after the field was touched (blur / return)  → "Email missing" (18:15406)
//  • not an email, or a typo'd common domain (Figma example kk@mai.com) → "Invalid email" (18:15610)
//  • kiaan@gmail.com (the Figma example) or anything @taken.com → "Already in another family" (57:2218)
//  • anything else → checking shimmer → "Confirm email" sheet (18:15458) → Let's go
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const TYPO_DOMAINS = ['mai.com', 'gmai.com', 'gmial.com', 'gamil.com', 'gmail.co', 'yaho.com', 'hotmial.com', 'outlok.com']
const IN_FAMILY = (email) => email === 'kiaan@gmail.com' || email.endsWith('@taken.com')
const isValidEmail = (email) => EMAIL_RE.test(email) && !TYPO_DOMAINS.includes(email.split('@')[1])

const CHECK_MS = 1300 // NANO checkEmail(): EMAIL_CHECK_MS
const EASE_OUT_CSS = 'cubic-bezier(0.23, 1, 0.32, 1)' // WAAPI twin of var(--ease-out)

// Figma: Email ID — Empty (57:1328, focused: keyboard up), Filled (18:15354), Confirm email
// sheet (18:15458), Email missing (18:15406), Invalid email (18:15610), Already in another
// family (57:2218), scroll states (66:3173 / 66:3204 — handled by the shell's hero).
// Motion (noon NANO email scene): the field is focused on arrival so the drawn keyboard and
// footer rise with the page; errors turn the field red + replay the NANO shake + drop the
// toast; a valid email locks the field and runs NANO's skeleton sweep (grey fill, light gap
// left → right, 1s a pass, 1.3s total) before the confirm sheet rises on PP Move; its art,
// copy, email pill and actions then rise 8px + fade in a 40ms stagger (as the close sheet).
// Reduced motion: no sweep travel (a short static pause), no shake, sheet contents fade only.
export default function EmailId() {
  const { data, update, goNext, goBack, goTo, showToast, fillName, setKeyboard } = useAddKid()

  // The parent-education beat comes next — fetch its 578 KB comp while this step is open
  useEffect(() => preloadLottie('parent-education'), [])
  const [email, setEmail] = useState(data.email ?? '')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(0)
  const [checking, setChecking] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const touched = useRef(false)
  const input = useRef(null)
  const shimmer = useRef(null)
  const timer = useRef(0)

  const value = email.trim().toLowerCase()

  // Auto-focus on arrival (Figma 57:1328 is the focused state) — after the body has started its slide
  useEffect(() => {
    const t = setTimeout(() => input.current?.focus({ preventScroll: true }), 160)
    return () => {
      clearTimeout(t)
      clearTimeout(timer.current)
    }
  }, [])

  function reject(message) {
    setError(true)
    setShake((n) => n + 1)
    showToast(message)
    // The shake remounts the field — keep it focused so it can be fixed straight away
    requestAnimationFrame(() => input.current?.focus({ preventScroll: true }))
  }

  function onChange(next) {
    touched.current = true
    setEmail(next)
    if (error) setError(false)
  }

  // Emptied and left (incl. a tap on the disabled Continue) → "Email missing". Our onBlur replaces
  // TextField's, so drop the keyboard here too. Leaving via Back / the username link is not an error.
  function onBlur(e) {
    setKeyboard(null)
    const to = e.relatedTarget
    if (to?.dataset?.footerBtn === 'secondary' || to?.classList?.contains('email-step__link')) return
    if (touched.current && !value && !checking) reject(fillName('Enter {name}’s email address to continue'))
  }

  function onContinue() {
    if (checking) return
    if (!value) return reject(fillName('Enter {name}’s email address to continue'))
    if (!isValidEmail(value)) return reject('Enter a valid email address')
    if (IN_FAMILY(value)) return reject('Already part of another family.')
    check()
  }

  // NANO checkEmail(): lock the value, sweep the field, then hand over to the confirm sheet
  function check() {
    setChecking(true)
    input.current?.blur()
    const sh = shimmer.current
    const band = sh?.firstElementChild
    const reduced = prefersReducedMotion()
    if (sh && !reduced) {
      sh.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: EASE_OUT_CSS, fill: 'forwards' })
      // The light band is a strip one field wide, slid across on transform (compositor only)
      band?.animate([{ transform: 'translateX(-100%)' }, { transform: 'translateX(100%)' }], {
        duration: 1000,
        iterations: Infinity,
        easing: 'cubic-bezier(0.45, 0, 0.55, 1)',
      })
    }
    timer.current = setTimeout(
      () => {
        sh?.getAnimations({ subtree: true }).forEach((a) => a.cancel())
        if (sh && !reduced) sh.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: EASE_OUT_CSS })
        setChecking(false)
        setConfirmOpen(true)
      },
      reduced ? 300 : CHECK_MS,
    )
  }

  function onConfirm() {
    update({ email: value, emailConfirmed: true, loginMethod: 'email' })
    setConfirmOpen(false)
    goNext()
  }

  function onEdit() {
    setConfirmOpen(false)
    setTimeout(() => input.current?.focus({ preventScroll: true }), 300)
  }

  function useUsername() {
    update({ loginMethod: 'username' })
    goTo('login')
  }

  useStepFooter({
    layout: 'row',
    secondary: { label: 'Back', onClick: goBack },
    primary: { label: 'Continue', disabled: !value, onClick: onContinue },
  })

  return (
    <div className="email-step">
      <div className={`email-step__field ${checking ? 'is-checking' : ''}`} data-rise>
        <TextField
          label="Email*"
          required={false}
          placeholder
          type="email"
          inputMode="email"
          autoComplete="email"
          enterKeyHint="next"
          value={email}
          onChange={onChange}
          onBlur={onBlur}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), onContinue())}
          readOnly={checking}
          error={error}
          shake={shake}
          inputRef={input}
        />
        <span ref={shimmer} className="email-step__shimmer" aria-hidden="true">
          <span className="email-step__shimmer-band" />
        </span>
      </div>

      <div className="email-step__info" data-rise>
        <img src="/figma/add-kid/info-circle.svg" width="24" height="24" alt="" />
        <p>If your child email already exists on noon, they will be added to your family after verification</p>
      </div>

      <p className="email-step__switch" data-rise>
        <span>Don&apos;t have an email?</span>
        <button type="button" className="email-step__link" onClick={useUsername}>
          Create a username
        </button>
      </p>

      {createPortal(
        <BottomSheet
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          labelledBy="confirm-email-title"
          cornerSmoothing={0.6}
        >
          <div className="confirm-email">
            <div className="confirm-email__art" aria-hidden="true">
              {/* The email page's Email-Pop Lottie, placed exactly as in the hero (235 × 125 slot) */}
              <HeroIllustration type="email" />
            </div>
            <div className="confirm-email__message">
              <h2 id="confirm-email-title">{fillName('Confirm {name}’s email')}</h2>
              <p>
                Make sure you have entered the right email
                <br />
                {fillName('so {name} can verify this account later.')}
              </p>
            </div>
            <div className="confirm-email__box">
              <span>{value}</span>
            </div>
            <div className="confirm-email__actions">
              <NanoButton variant="primary" onClick={onConfirm}>
                Yes, use this email
              </NanoButton>
              <NanoButton variant="secondary" onClick={onEdit}>
                Edit email
              </NanoButton>
            </div>
          </div>
        </BottomSheet>,
        document.body,
      )}
    </div>
  )
}

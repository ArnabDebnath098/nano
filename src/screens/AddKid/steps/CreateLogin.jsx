import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { preloadLottie } from '../../../lib/preloadLottie.js'
import { Flip } from 'gsap/Flip'
import { gsap } from '../../../lib/gsap.js'
import { MOVE, FADE, STAGGER, POP_FROM, POP_OUT, prefersReducedMotion } from '../../../lib/motion.js'
import { useAddKid, useStepFooter } from '../AddKidContext.js'
import TextField from '../../../components/AddKid/TextField.jsx'
import './CreateLogin.css'

gsap.registerPlugin(Flip)

const L = '/figma/add-kid/login'

// Password rules, in Figma chip order (57:1520)
const RULES = [
  { id: 'special', label: 'Special character', test: (p) => /[^A-Za-z0-9\s]/.test(p) },
  { id: 'digit', label: 'Numerical digit', test: (p) => /\d/.test(p) },
  { id: 'length', label: '8 characters', test: (p) => p.length >= 8 },
  { id: 'upper', label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { id: 'lower', label: 'Lowercase letter', test: (p) => /[a-z]/.test(p) },
]

// Prototype rule: the username "kiaan" (any case — the Figma example) is taken.
const TAKEN = ['kiaan']

const CHIP_POP_FROM = 0.92 // a chip that just went green dips this far, then settles on PP Move

// Figma: Create login — Empty (57:1489), Username & password (18:15537), Username taken
// (57:2088), scroll states (66:3294 / 66:3351 — handled by the shell's hero).
// Motion: rule chips go green live as the password is typed — the row re-flows on PP Move
// (FLIP, so the check icon's room opens without a jump), each newly met chip pops 0.92 → 1 on
// PP Move while its fill / label colour fade on PP Fade, staggered 40ms; the tick scales in
// from 0.9 on PP Move and fades in on PP Fade. A chip that un-meets settles from wherever it is
// on the quicker pop-out. Pops are interruptible: a chip that flips again mid-pop retargets from
// its current scale instead of snapping back. Errors: red field + NANO shake + toast. Eye toggle
// swaps the icon with a blur-masked crossfade. Reduced motion: colour fades only.
export default function CreateLogin() {
  const { data, update, goNext, goBack, goTo, showToast } = useAddKid()

  // The parent-education beat comes next — fetch its 578 KB comp while this step is open
  useEffect(() => preloadLottie('parent-education'), [])
  const [username, setUsername] = useState(data.username ?? '')
  const [password, setPassword] = useState(data.password ?? '')
  const [show, setShow] = useState(false)
  const [taken, setTaken] = useState(false)
  const [userShake, setUserShake] = useState(0)
  const [passError, setPassError] = useState(false)
  const [passShake, setPassShake] = useState(0)

  const chips = useRef(null)
  const flip = useRef(null)
  const prevMet = useRef(null)
  const popScale = useRef([])

  const met = RULES.map((r) => r.test(password))
  const metKey = met.map(Number).join('')
  const strong = met.every(Boolean)
  const name = username.trim()

  // Capture the chips before a password change re-renders them. Their in-flight pop scale is
  // read first — Flip.getState strips the chips' transforms.
  function onPassword(next) {
    if (chips.current) {
      const els = [...chips.current.children]
      popScale.current = els.map((el) => gsap.getProperty(el, 'scale'))
      flip.current = Flip.getState(els)
    }
    setPassword(next)
    if (passError) setPassError(false)
  }

  useLayoutEffect(() => {
    const before = prevMet.current
    prevMet.current = metKey
    const state = flip.current
    flip.current = null
    if (before === null || before === metKey || !state || prefersReducedMotion()) return
    const els = [...chips.current.children]
    const changed = els.filter((_, i) => before[i] !== metKey[i])
    const scaleNow = changed.map((el) => popScale.current[els.indexOf(el)] ?? 1)
    Flip.from(state, { targets: els, ...MOVE, scale: false })
    // An unchanged chip still settling from an earlier pop carries on from where it was
    els.forEach((el, i) => {
      const s = popScale.current[i] ?? 1
      if (changed.includes(el) || s === 1) return
      gsap.killTweensOf(el, 'scale')
      gsap.fromTo(el, { scale: s }, { scale: 1, ...MOVE })
    })
    changed.forEach((el, i) => {
      const delay = i * STAGGER
      const nowMet = metKey[els.indexOf(el)] === '1'
      // Mid-pop → carry on from the current scale; only start a fresh dip when at rest.
      // Un-met chips just settle from wherever they are, on the quicker pop-out.
      const from = scaleNow[i] !== 1 || !nowMet ? scaleNow[i] : CHIP_POP_FROM
      // Kill the old scale tween outright (a still-delayed one would otherwise overwrite this)
      gsap.killTweensOf(el, 'scale')
      gsap.fromTo(el, { scale: from }, { scale: 1, ...(nowMet ? MOVE : POP_OUT), delay })
      // The tick mounts with the met state (it unmounts with it), so it always pops from rest
      const tick = nowMet && el.querySelector('.login-rule__tick')
      if (tick) {
        gsap.fromTo(tick, { scale: POP_FROM }, { scale: 1, ...MOVE, delay })
        gsap.fromTo(tick, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE, delay })
      }
    })
  }, [metKey])

  function onContinue() {
    if (TAKEN.includes(name.toLowerCase())) {
      setTaken(true)
      setUserShake((n) => n + 1)
      showToast('That username is taken.')
      return
    }
    if (!strong) {
      setPassError(true)
      setPassShake((n) => n + 1)
      showToast('Password is too weak')
      return
    }
    update({ username: name, password, loginMethod: 'username' })
    goNext()
  }

  // Back to the email step: pop history if we came from it, otherwise go there
  function useEmail() {
    if (data.loginMethod === 'username') {
      update({ loginMethod: 'email' })
      goBack()
    } else {
      update({ loginMethod: 'email' })
      goTo('email')
    }
  }

  useStepFooter({
    layout: 'row',
    secondary: { label: 'Back', onClick: goBack },
    primary: { label: 'Continue', disabled: !name || !password, onClick: onContinue },
  })

  return (
    <div className="login-step">
      <div className="login-step__fields">
        <div className="login-step__group" data-rise>
          <TextField
            label="Username*"
            required={false}
            placeholder
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={username}
            onChange={(v) => {
              setUsername(v)
              if (taken) setTaken(false)
            }}
            error={taken}
            shake={userShake}
            aria-describedby={taken ? 'login-username-error' : undefined}
          />
          {taken && (
            <p className="login-step__support" id="login-username-error">
              That username is taken.
            </p>
          )}
        </div>

        <div data-rise>
          <TextField
            label="Password*"
            required={false}
            placeholder
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            autoCapitalize="none"
            spellCheck={false}
            value={password}
            onChange={onPassword}
            error={passError}
            shake={passShake}
            right={
              <button
                type="button"
                className={`login-step__eye ${show ? 'is-shown' : ''}`}
                aria-label={show ? 'Hide password' : 'Show password'}
                aria-pressed={show}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.preventDefault()
                  setShow((s) => !s)
                }}
              >
                <img src={`${L}/eye.svg`} width="18" height="18" alt="" />
                <span className="login-step__eye-slash" aria-hidden="true" />
              </button>
            }
          />
        </div>

        <div className="login-rules" data-rise>
          <div className="login-rules__head">
            <p>Password must include at least:</p>
            {password && (
              <span className={`login-rules__strength ${strong ? 'is-strong' : ''}`} aria-live="polite">
                {strong ? 'Strong' : 'Too weak'}
              </span>
            )}
          </div>
          <ul className="login-rules__chips" ref={chips}>
            {RULES.map((r, i) => (
              <li key={r.id} className={`login-rule ${met[i] ? 'is-met' : ''}`} aria-label={`${r.label}${met[i] ? ', done' : ''}`}>
                {met[i] && <img className="login-rule__tick" src={`${L}/check-circle.svg`} width="16" height="16" alt="" />}
                <span>{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="login-step__switch" data-rise>
        <span>Prefer to use an email?</span>
        <button type="button" className="login-step__link" onClick={useEmail}>
          Use email instead
        </button>
      </p>
    </div>
  )
}

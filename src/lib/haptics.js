// Haptics — ported from noon NANO (github.com/saswata2002/noon-NANO @ f137e63, index.html L1912–1983),
// with every level strengthened (see `haptic` below).
//
// Exactly one channel plays per event:
//  1. native iOS host — a WKWebView that registers `webkit.messageHandlers.haptic` gets a real
//     Taptic pulse ({ type, intensity });
//  2. iOS Safari (17.4+) — no Vibration API, but toggling an <input type=checkbox switch> plays the
//     system haptic. iOS has one fixed-strength tick, so "stronger" = a tighter burst of ticks;
//     WebKit only plays it within ~1s of a real tap;
//  3. Android / Chrome — navigator.vibrate pulses (longer = stronger). Desktop: silent.
//
//   selection — detents, field taps          light   — a tap / key press
//   medium    — things landing / appearing   heavy   — a strong landing
//   success   — two firm bumps               error   — three firm bumps


import { isIOS } from './platform.js'

const bridge = () => window.webkit?.messageHandlers?.haptic ?? null

// A fresh <label style=display:none><input type=checkbox switch></label> in <head> per tick.
// display:none means the switch can never take focus, so a focused field never blurs and the
// keyboard never drops; toggling it still plays the system haptic.
function iosTick() {
  const label = document.createElement('label')
  label.setAttribute('aria-hidden', 'true')
  label.style.display = 'none'
  const sw = document.createElement('input')
  sw.type = 'checkbox'
  sw.setAttribute('switch', '')
  label.appendChild(sw)
  document.head.appendChild(label)
  const active = document.activeElement
  label.click()
  label.remove()
  if (active && active !== document.body && document.activeElement !== active) active.focus({ preventScroll: true })
}

let lastAt = -1

// native: [kind, intensity] (or a list of [ms, kind, intensity]) · iOS Safari: tick offsets · Android: pattern
function play(native, iosOffsets, androidPattern) {
  lastAt = performance.now()
  const h = bridge()
  if (h) {
    const pulses = Array.isArray(native[0]) ? native : [[0, ...native]]
    for (const [ms, type, intensity] of pulses) {
      const post = () => {
        try {
          h.postMessage(intensity == null ? type : { type, intensity })
        } catch {
          /* host went away */
        }
      }
      if (ms) setTimeout(post, ms)
      else post()
    }
  } else if (isIOS) {
    for (const ms of iosOffsets) {
      if (ms === 0) iosTick()
      else setTimeout(iosTick, ms)
    }
  } else if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) {
    try {
      navigator.vibrate(androidPattern)
    } catch {
      /* blocked */
    }
  }
}

// Strengthened from NANO's values (which were too faint on iOS Safari's one fixed-strength tick):
// every level plays more ticks (iOS) and longer pulses (Android), and native hosts get full
// intensity. Taps on buttons (`light`) now land as firmly as NANO's `heavy`.
export const haptic = {
  selection: () => play(['medium', 1], [0, 25, 50], 40),
  light: () => play(['heavy', 1], [0, 24, 48, 72], 60),
  medium: () => play(['heavy', 1], [0, 22, 44, 66, 88], 80),
  heavy: () => play(['heavy', 1], [0, 20, 40, 60, 80, 100, 120], 110),
  success: () => play([[0, 'success'], [140, 'heavy', 1]], [0, 24, 48, 72, 140, 164, 188, 212], [70, 50, 90]),
  error: () => play([[0, 'error'], [200, 'heavy', 1]], [0, 24, 48, 72, 110, 134, 158, 200, 224, 248, 272], [80, 40, 80, 40, 100]),
  // Picker wheels (our addition): NANO's `selection` is two ticks, which iOS Safari's one fixed
  // tick makes too faint to feel on a wheel. A detent is a 3-tick burst; the wheel coming to rest
  // on a value is a firmer 5-tick bump. Native hosts get a full-strength rigid / medium pulse.
  detent: () => play(['rigid', 1], [0, 25, 50], 40),
  settle: () => play(['heavy', 1], [0, 24, 48, 72, 96], 70),
  get lastAt() {
    return lastAt
  },
}

// Text-entry fields answer a tap with a soft `selection` tick (NANO skips fields entirely; we play
// the lighter kind — the hidden-switch trick never steals focus, so the keyboard stays up).
const FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, select, .text-field'
// Everything else tappable answers with `light`, as in NANO.
const TAPPABLE =
  'button, a[href], [role="button"], [role="tab"], [role="option"], [role="switch"], [role="checkbox"], [role="radio"], label, [data-haptic]'

const isDisabled = (el) =>
  el.disabled || el.getAttribute('aria-disabled') === 'true' || el.closest('[aria-disabled="true"], fieldset:disabled')

// One global listener, like NANO: a tap on a button or field plays a haptic unless the control's
// own handler already played one for that tap (checked right after the handlers run, still inside
// the tap). A label's forwarded click to its input (same tap) is ignored via the 80ms window.
export function installTapHaptics() {
  const onClick = (e) => {
    if (!e.isTrusted) return // the iOS haptic itself is a scripted label click — never answer it
    const target = e.target instanceof Element ? e.target : null
    if (!target) return
    const field = target.closest(FIELD)
    const tappable = field ? null : target.closest(TAPPABLE)
    const el = field ?? tappable
    if (!el || isDisabled(el) || el.closest('[data-haptic="off"]')) return
    const at = performance.now()
    if (lastAt > at - 80) return
    setTimeout(() => {
      if (lastAt >= at) return
      if (field) haptic.selection()
      else haptic.light()
    }, 0)
  }
  document.addEventListener('click', onClick, true)
  return () => document.removeEventListener('click', onClick, true)
}

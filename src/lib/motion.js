// App motion tokens, built on the noon NANO motion system
// (animation-reference/noon-nano — extracted from github.com/saswata2002/noon-NANO @ f137e63).
//
// NANO's rule: anything that MOVES runs 540ms on PP Move (a recorded spring, ~1.3% overshoot);
// anything that only FADES runs 200ms on PP Fade. Lists stagger 40ms. Everything here is
// GSAP-ready ({ duration (s), ease }). Values are imported, never re-typed.
import { DUR, PP, ppMove, ppFade, springEase, springImpact } from '../../animation-reference/noon-nano/motion.js'

const s = (ms) => ms / 1000

// Core system
export const MOVE = { duration: s(DUR.MOVE), ease: ppMove } // 540ms PP Move
export const FADE = { duration: s(DUR.FADE), ease: ppFade } // 200ms PP Fade
export const STAGGER = s(PP.STAGGER) // 40ms

// Overlay scrim — NANO "Updates Today" sheet (openNotif L3903 / closeNotif L3963)
export const SCRIM_IN = { duration: 0.48, ease: 'nano.scrimIn' } // cubic-bezier(0.3, 0, 0.2, 1)
export const SCRIM_OUT = { duration: 0.44, ease: 'nano.scrimLift', delay: 0.15 } // cubic-bezier(0.45, 0, 0.2, 1)

// Arrival rise — NANO homeBuild rise() (L3649–3652): 10px on iOS ease-out + opacity fade
export const RISE = { y: 10, duration: 0.56, ease: 'nano.iosOut' } // cubic-bezier(0.32, 0.72, 0, 1)
export const RISE_FADE = { duration: 0.28, ease: 'nano.fade' } // cubic-bezier(0.25, 0.1, 0.25, 1)

// Water-drop toast — NANO makeDropToast (index.html L2317–2396, authored choreography):
// a 0.66·H drop falls in on a spring, squashes where it lands, spreads into the pill, then the
// content pops in; it leaves with a 7px dip and a tall stretch as it lifts away.
export const TOAST_FALL = { duration: 0.6, ease: springEase(0.52, 0.45, 600) } // TOAST_FALL L2301
export const TOAST_HIT = springImpact(0.52, 0.45) / 1000 // first touchdown ≈ 0.178s
export const TOAST_SPREAD_AT = 0.26
export const TOAST_SPREAD_W = { duration: 0.64, ease: springEase(0.6, 0.5, 640) } // L2303
export const TOAST_SPREAD_H = { duration: 0.56, ease: springEase(0.6, 0.45, 560) } // L2304
export const TOAST_CONTENT_AT = 0.43
export const TOAST_POP = { duration: 0.47, ease: springEase(0.55, 0.4, 470) } // L2305
export const TOAST_EXIT_MS = 440 // EXIT_MS L2275

// Page settle — arriving content rises 8px into place on a strong ease-out: no sideways
// slide, no overshoot (it should land, not bounce back down)
export const SETTLE = { y: 8, duration: 0.5, ease: 'emil.out' }

// Page change — NANO's own page-to-page choreography (noon-NANO @ 4db90ae, index.html):
//  • forward = showHome() clear (L3663–3671, authored pp:false): title lifts 8, subtitle 6,
//    content shrinks to .96 rows 12ms apart, all 220ms on a soft ease-in — things leave, they don't snap;
//  • back = backToAvatar() (L3561–3580): title lifts 10 quickly (160ms), subtitle 8, content
//    drops 14 with the last rows leaving first (25ms apart), on OUT;
//  • arriving = showInterests() build (L3540–3553): title rises 16 out of blur(6px), subtitle 10,
//    then each row rises 16 from .95, 40ms apart. Everything that travels runs PP Move (540ms),
//    opacity PP Fade — NANO's animate() wrapper re-times them to exactly that.
//  • the action bar is shared between pages (NANO hands its Continue button over in place):
//    buttons that persist never fade; only ones the new page adds rise in, 8px (L3557).
export const PAGE_OUT = { duration: 0.22, ease: 'nano.softIn', titleY: -8, subY: -6, rowScale: 0.96, rowStagger: 0.012 }
export const PAGE_BACK_OUT = { duration: 0.22, titleDuration: 0.16, ease: 'nano.outExit', titleY: -10, subY: -8, rowY: 14, rowStagger: 0.025 }
// `at`: the next page starts arriving this long after the old one starts leaving (NANO overlaps the
// two — its next page fades in 140ms into the exit; ours leaves on a copy, so the overlap is real)
export const PAGE_IN = { at: 0.12, titleY: 16, subY: 10, blur: 6, rowY: 16, rowScale: 0.95, rowAt: 0.04, subAt: 0.02, footerY: 8 }

// Blending a full-screen beat with the screen beneath (a crossfade, so on-screen in-out):
// in over the live screen, out dissolving over the next step
export const BLEND_IN = { duration: 0.45, ease: 'emil.inOut' }
export const BLEND_OUT = { duration: 0.6, ease: 'emil.inOut' }

// Emil Kowalski's strong ease-out for short UI exits / releases (CSS: var(--ease-out))
export const EASE_OUT = 'emil.out'
// Selected-state pop: from 0.9 (never 0) on PP Move; deselect is quicker (CSS: --pop-from)
export const POP_FROM = 0.9
export const POP_OUT = { duration: 0.14, ease: 'emil.out' }

// Swipe-to-dismiss commit — NANO skin swipe (L2839–2844): 70px, or a flick > 0.45 px/ms
export const SWIPE_COMMIT_PX = 70
export const SWIPE_COMMIT_VELOCITY = 0.45 // px/ms
export const VELOCITY_SAMPLES = 6 // NANO measures over the last 6 pointer samples

// Reduced motion — NANO's pattern: no travel, fades capped at 200ms, no delays
export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Tracks pointer velocity (px/ms) over the last N samples, as NANO does
export function velocityTracker(samples = VELOCITY_SAMPLES) {
  let points = []
  return {
    reset() {
      points = []
    },
    add(value) {
      points.push({ value, t: performance.now() })
      if (points.length > samples) points.shift()
    },
    velocity() {
      if (points.length < 2) return 0
      const a = points[0]
      const b = points[points.length - 1]
      return (b.value - a.value) / Math.max(1, b.t - a.t)
    },
  }
}

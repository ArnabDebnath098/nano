import { useEffect, useRef } from 'react'
import { CustomEase, gsap, useGSAP } from '../../../lib/gsap.js'
import { FADE, MOVE, STAGGER, prefersReducedMotion } from '../../../lib/motion.js'
import { useAddKid } from '../AddKidContext.js'
import { ageFrom } from '../steps.js'
import Lottie from '../../../components/AddKid/Lottie.jsx'
import './AgeReveal.css'

const HOLD_MS = 120 // beat on the plain overlay once the comp has played out (1.5s)
// The hand rig slides out down-right over frames 73 → 88 (Hand · rig position/rotation keys);
// the copy leaves on the same frames with the same direction so they exit as one.
const EXIT_FRAME = 73
const EXIT_S = (88 - 73) / 60
const HAND_EXIT_EASE = CustomEase.create('ageRevealHandExit', 'M0,0 C0.5,0 0.85,0.6 1,1')
const HOLD_REDUCED_MS = 2200 // reduced motion holds one still frame instead
const PEAK_FRAME = 45 // every layer of the comp is on screen here

// Figma: Child details · Age reveal (18:14954) — the purple overlay with rays, chrome stars,
// sphere and the shaka hand (all in the `age-reveal` Lottie, 375 × 812, 1.5s), and the
// copy laid over it in DOM: "{name} is" (H32 white) / "{age} Years Old" (H40 gradient with a
// white sticker outline), both tilted −4°.
// Motion: the copy lands while the rays sweep — each line rises 16px from blur(4px) to sharp
// on PP Move with its opacity and blur on PP Fade, 40ms apart; the age line also settles from
// 0.94.
// Exit: on the comp's frame 73 — the moment the hand starts sliding away — the copy follows it
// (drifts down-right, softens to blur, fades) over the same 250ms, so the hand and the age leave
// together. Then a short beat and on to Email. A tap anywhere skips: the copy makes the same
// down-right exit on PP Fade (200ms) first, so it leaves rather than blinking off.
// Reduced motion: one still frame of the comp (its peak — its last frame is the empty outro),
// the copy fades in (and out on skip), nothing travels.
export default function AgeReveal() {
  const { data, goNext } = useAddKid()
  const root = useRef(null)
  const left = useRef(false)
  const skipping = useRef(false)
  const timer = useRef(null)
  const lottie = useRef(null)

  const name = data.firstName.trim() || 'Your child'
  const age = ageFrom(data.birthday) ?? 10

  const leave = () => {
    if (left.current) return
    left.current = true
    clearTimeout(timer.current)
    goNext()
  }

  // Tap / Enter skips — the copy exits in the hand's direction, then on to Email
  const skip = () => {
    if (left.current || skipping.current) return
    skipping.current = true
    clearTimeout(timer.current)
    const lines = [...root.current.querySelectorAll('[data-line]')]
    if (lines.every((l) => Number(gsap.getProperty(l, 'opacity')) === 0)) return leave() // already gone with the hand
    gsap.killTweensOf(lines)
    const away = prefersReducedMotion() ? { autoAlpha: 0 } : { x: 14, y: 26, autoAlpha: 0, filter: 'blur(4px)' }
    gsap.to(lines, { ...away, ...FADE, onComplete: leave })
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  // The copy's exit is scrubbed by the comp's own playhead over the hand's exit frames, on the
  // hand rig's curve (its keys use bezier .5,0 → .85,.6) — locked to the hand, frame for frame.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const lines = root.current.querySelectorAll('[data-line]')
      let exit = null
      const sync = () => {
        const a = lottie.current?.anim
        if (!a?.isLoaded || a.currentFrame < EXIT_FRAME - 1) return
        if (skipping.current) return gsap.ticker.remove(sync) // a skip runs its own exit
        exit ??= gsap.to(lines, {
          x: 14,
          y: 26,
          autoAlpha: 0,
          filter: 'blur(4px)',
          duration: EXIT_S,
          ease: HAND_EXIT_EASE,
          paused: true,
        })
        exit.progress(Math.min(1, Math.max(0, (a.currentFrame - EXIT_FRAME) / (EXIT_S * 60))))
        if (exit.progress() >= 1) gsap.ticker.remove(sync)
      }
      gsap.ticker.add(sync)
      return () => gsap.ticker.remove(sync)
    },
    { scope: root },
  )

  useGSAP(
    () => {
      const lines = root.current.querySelectorAll('[data-line]')
      if (prefersReducedMotion()) {
        gsap.fromTo(lines, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE })
        return
      }
      const tl = gsap.timeline({ delay: 0.28 })
      tl.fromTo(lines, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE, stagger: STAGGER }, 0)
        .fromTo(lines, { y: 16 }, { y: 0, ...MOVE, stagger: STAGGER }, 0)
        .fromTo(lines, { filter: 'blur(4px)' }, { filter: 'blur(0px)', ...FADE, stagger: STAGGER, clearProps: 'filter' }, 0)
        .fromTo(lines[1], { scale: 0.94 }, { scale: 1, ...MOVE }, STAGGER)
    },
    { scope: root },
  )

  const onComplete = () => {
    clearTimeout(timer.current)
    if (prefersReducedMotion()) lottie.current?.anim?.goToAndStop(PEAK_FRAME, true)
    timer.current = setTimeout(leave, prefersReducedMotion() ? HOLD_REDUCED_MS : HOLD_MS)
  }

  return (
    <div
      ref={root}
      className="age-reveal"
      role="button"
      tabIndex={0}
      aria-label={`${name} is ${age} years old. Tap to continue`}
      onClick={skip}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && skip()}
    >
      <Lottie ref={lottie} name="age-reveal" playing loop={false} onComplete={onComplete} className="age-reveal__lottie" />

      <div className="age-reveal__copy" aria-hidden="true">
        <div className="age-reveal__line age-reveal__line--name">
          <p className="age-reveal__name" data-line>
            {name} is
          </p>
        </div>
        <div className="age-reveal__line age-reveal__line--age">
          <p className="age-reveal__age" data-line>
            <span className="age-reveal__age-outline">{age} Years Old</span>
            <span className="age-reveal__age-fill">{age} Years Old</span>
          </p>
        </div>
      </div>
    </div>
  )
}

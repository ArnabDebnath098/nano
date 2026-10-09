import { useEffect, useRef } from 'react'
import Lottie from '../../../components/AddKid/Lottie.jsx'
import { prefersReducedMotion } from '../../../lib/motion.js'
import { useAddKid } from '../AddKidContext.js'
import './Education.css'

const HOLD_MS = 700 // on the final "Set rules" frame before handing over
const REDUCED_HOLD_MS = 2200 // reduced motion shows the final frame alone, so give it time to read

// Haptics on the frames where things land (comp frames @60fps, read from the keyframes:
// each layer's scale settling / overshoot peak)
const EDUCATION_CUES = [
  { frame: 44, kind: 'medium' }, //    1st item stamps down (scale 291 → 70)
  { frame: 57, kind: 'medium' }, //    2nd item
  { frame: 70, kind: 'medium' }, //    3rd item
  { frame: 79, kind: 'medium' }, //    4th item
  { frame: 89, kind: 'light' }, //     coin pops in
  { frame: 97, kind: 'light' }, //     second coin
  { frame: 103, kind: 'heavy' }, //    metallic nano logo lands
  { frame: 115, kind: 'light' }, //    green sparkle pops
  { frame: 121, kind: 'selection' }, // rule pill slides into place
]

// Parent education — after the email (or username) step, the `parent-education` Lottie
// (Parent_Education.lottie, 750 × 1624 @ 60fps, 2.73s) introduces the child's nano wallet,
// then lands on "Set rules for shopping on nano" with the shield and rule pills.
// Motion: the Lottie is the beat — played once (its manifest loops; a story beat shouldn't),
// then a short hold on that final frame and goNext() (→ Set rules, whose hero carries the same
// shield, so the hand-off reads as one scene). The shell cross-fades the layers.
// Tap or Enter skips. Reduced motion: the Lottie jumps to its final frame (Lottie.jsx), held longer.
export default function Education() {
  const { goNext } = useAddKid()
  const done = useRef(false)
  const timer = useRef(0)

  const finish = () => {
    if (done.current) return
    done.current = true
    clearTimeout(timer.current)
    goNext()
  }

  const onComplete = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(finish, prefersReducedMotion() ? REDUCED_HOLD_MS : HOLD_MS)
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <button type="button" className="education" onClick={finish} aria-label="Introducing your child’s nano wallet. Tap to continue">
      <Lottie name="parent-education" playing loop={false} fit="cover" cues={EDUCATION_CUES} onComplete={onComplete} className="education__anim" />
    </button>
  )
}

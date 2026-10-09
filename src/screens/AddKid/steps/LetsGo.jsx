import { useEffect, useRef } from 'react'
import Lottie from '../../../components/AddKid/Lottie.jsx'
import { prefersReducedMotion } from '../../../lib/motion.js'
import { useAddKid } from '../AddKidContext.js'
import './LetsGo.css'

// Figma: Transition · Let's go (18:15748) — the "Overlay" (18:15817) plays over the screen
// just left — Add address, once setup is done (step is `overlay`, so the chrome stays beneath). Everything in the overlay —
// purple wash, grid, LETS / GO plates, ball face, blob, sparkles, red square, swooshes —
// is the `lets-go` Lottie (375 × 812, 1.5s @ 60fps), which builds in and clears itself.
// Motion: the Lottie is the beat. Just before it starts clearing (frame 60 of 90), goNext()
// (→ invite): the shell keeps this overlay beneath and fades the invite in over it, so the
// purple wash is still up until the invite covers the screen — Add address never shows
// through again. Tap anywhere to skip. Reduced motion: no playback — hold the fully-built
// frame for a moment, then move on.
const HANDOFF_FRAME = 60 // plates start leaving at 64; the wash holds until 80
const REDUCED_FRAME = 50 // all plates + ball on screen
const REDUCED_HOLD_MS = 1200

export default function LetsGo() {
  const { goNext } = useAddKid()
  const lottie = useRef(null)
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
    if (prefersReducedMotion()) {
      lottie.current?.anim?.goToAndStop(REDUCED_FRAME, true)
      timer.current = setTimeout(finish, REDUCED_HOLD_MS)
    } else {
      finish()
    }
  }

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <button type="button" className="lets-go" onClick={finish} aria-label="Let’s go — tap to continue">
      {/* Backdrop blur under the comp's purple wash — Lottie can't blur what's behind it */}
      <span className="lets-go__blur" aria-hidden="true" />
      {/* Hand off while the wash still covers the screen (no frames play in reduced motion) */}
      <Lottie
        ref={lottie}
        name="lets-go"
        playing
        loop={false}
        cues={[{ frame: HANDOFF_FRAME, run: finish }]}
        onComplete={onComplete}
        className="lets-go__anim"
      />
    </button>
  )
}

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import lottie from 'lottie-web'
import { prefersReducedMotion } from '../../lib/motion.js'

// Thin lottie-web wrapper (SVG renderer, like noon NANO's Email-Pop / bell players).
// Files live in /public/lottie/add-kid/<name>/animation.json with their images/ beside them.
//   name      — folder under /lottie/add-kid
//   playing   — true plays from frame 0 (after `delay` ms); false holds frame 0
//   loop      — loop forever
//   fit       — 'contain' (default) letterboxes the comp; 'cover' fills the box, cropping the edges
// Reduced motion: no playback, jumps straight to the last frame (NANO: goToAndStop(totalFrames-1)).
// The ref exposes { replay(), anim } for one-off triggers.
const Lottie = forwardRef(function Lottie(
  { name, playing = true, loop = false, delay = 0, fit = 'contain', onComplete, className, style },
  ref,
) {
  const container = useRef(null)
  const anim = useRef(null)
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  useEffect(() => {
    const a = lottie.loadAnimation({
      container: container.current,
      renderer: 'svg',
      loop,
      autoplay: false,
      path: `/lottie/add-kid/${name}/animation.json`,
      rendererSettings: { preserveAspectRatio: fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet', progressiveLoad: false },
    })
    anim.current = a
    const done = () => completeRef.current?.()
    a.addEventListener('complete', done)
    return () => {
      a.removeEventListener('complete', done)
      a.destroy()
      anim.current = null
    }
  }, [name, loop, fit])

  useEffect(() => {
    const a = anim.current
    if (!a) return
    let timer
    const start = () => {
      if (prefersReducedMotion()) {
        a.goToAndStop(a.totalFrames - 1, true)
        completeRef.current?.()
      } else if (playing) {
        timer = setTimeout(() => a.goToAndPlay(0, true), delay)
      } else {
        a.goToAndStop(0, true)
      }
    }
    // lottie-web's addEventListener returns its own remover; it must not run after destroy()
    let off = null
    if (a.isLoaded) start()
    else off = a.addEventListener('DOMLoaded', start)
    return () => {
      clearTimeout(timer)
      if (anim.current === a) off?.()
    }
  }, [name, loop, playing, delay])

  useImperativeHandle(ref, () => ({
    get anim() {
      return anim.current
    },
    replay() {
      const a = anim.current
      if (!a) return
      if (prefersReducedMotion()) a.goToAndStop(a.totalFrames - 1, true)
      else a.goToAndPlay(0, true)
    },
  }))

  return <div ref={container} className={className} style={style} aria-hidden="true" />
})

export default Lottie

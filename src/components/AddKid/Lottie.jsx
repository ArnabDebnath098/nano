import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import lottie from 'lottie-web'
import { prefersReducedMotion } from '../../lib/motion.js'

// Thin lottie-web wrapper. Canvas renderer by default: the image-led comps here re-layout an
// SVG tree every frame under the SVG renderer, which stutters on iOS Safari / Android WebView;
// canvas just blits bitmaps. Some comps use what lottie-web's canvas renderer draws wrong —
// gradient fills with alpha stops (age-reveal's rays), matte strokes (parent-education) — so
// they stay on SVG (verified frame-by-frame against SVG). Canvas can't draw AE effects either:
// bake them into the images, as parent-education's mascot drop shadow is.
const SVG_ONLY = new Set(['age-reveal', 'parent-education'])

// Files live in /public/lottie/add-kid/<name>/animation.json with their images/ beside them.
//   name      — folder under /lottie/add-kid
//   playing   — true plays from frame 0 (after `delay` ms); false holds frame 0
//   loop      — loop forever
//   fit       — 'contain' (default) letterboxes the comp; 'cover' fills the box, cropping the edges
//   renderer  — 'canvas' | 'svg'; defaults to canvas unless the comp is in SVG_ONLY
// Reduced motion: no playback, jumps straight to the last frame (NANO: goToAndStop(totalFrames-1)).
// The ref exposes { replay(), anim } for one-off triggers.
const Lottie = forwardRef(function Lottie(
  { name, playing = true, loop = false, delay = 0, fit = 'contain', renderer: rendererProp, onComplete, className, style },
  ref,
) {
  const container = useRef(null)
  const anim = useRef(null)
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  const renderer = rendererProp ?? (SVG_ONLY.has(name) ? 'svg' : 'canvas')

  useEffect(() => {
    const a = lottie.loadAnimation({
      container: container.current,
      renderer,
      loop,
      autoplay: false,
      path: `/lottie/add-kid/${name}/animation.json`,
      rendererSettings: {
        preserveAspectRatio: fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet',
        progressiveLoad: false,
        // canvas only: transparent stage; cap the backing store at 2× — a 3–3.5× Android screen
        // otherwise fills ~2.5× the pixels per frame for detail the 1–2× source images don't have
        clearCanvas: true,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
      },
    })
    // Render on the comp's own 60fps frames only. Subframes re-render every rAF —
    // 120 times a second on ProMotion iPhones / 120Hz Androids — for no visible gain.
    a.setSubframe(false)
    anim.current = a
    const done = () => completeRef.current?.()
    a.addEventListener('complete', done)
    return () => {
      a.removeEventListener('complete', done)
      a.destroy()
      anim.current = null
    }
  }, [name, loop, fit, renderer])

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

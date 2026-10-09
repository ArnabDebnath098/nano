import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import lottie from 'lottie-web'
import { prefersReducedMotion } from '../../lib/motion.js'
import { haptic } from '../../lib/haptics.js'

// Thin lottie-web wrapper, canvas renderer: the SVG renderer re-lays-out an SVG tree every frame,
// which stutters on iOS Safari / Android WebView; canvas just blits bitmaps. Comps must be
// canvas-safe — lottie-web's canvas renderer can't draw AE effects or gradients whose alpha
// stops don't line up with their colour stops, and every track matte costs several full-canvas
// copies per frame (and leaves edge artefacts inside precomps). So those get baked into images
// (parent-education's mascot shadow, coin flips and card shine; age-reveal's rays and stars) and
// mattes that are plain wipes become masks (parent-education's pill labels). Verified
// frame-by-frame against the SVG renderer.

// Decode every image of a loaded comp before its first played frame. lottie-web only waits
// for `load`; the decode itself then happens on the main thread on first draw, which on a
// phone is a visible hitch right as the animation starts. Capped so a slow image never stalls.
const DECODE_CAP_MS = 400
function decodeImages(a) {
  const base = a.path ?? ''
  const jobs = (a.animationData?.assets ?? [])
    .filter((as) => as.p && !as.layers && as.e !== 1)
    .map((as) => {
      const img = new Image()
      img.src = base + (as.u ?? '') + as.p
      return img.decode?.().catch(() => {})
    })
  return Promise.race([Promise.all(jobs), new Promise((ok) => setTimeout(ok, DECODE_CAP_MS))])
}

// Files live in /public/lottie/add-kid/<name>/animation.json with their images/ beside them.
//   name      — folder under /lottie/add-kid
//   playing   — true plays from frame 0 (after `delay` ms); false holds frame 0
//   loop      — loop forever
//   fit       — 'contain' (default) letterboxes the comp; 'cover' fills the box, cropping the edges
//   renderer  — 'canvas' (default) | 'svg', for checking a comp against the reference renderer
//   cues      — [{ frame, kind } | { frame, run }] fired once from the comp's own frame clock
//               (enterFrame), so they stay on the frame even if playback stalls. `kind` is a
//               haptic — skipped rather than played late when more than STALE_FRAMES behind (a
//               hiccup / tab switch); `run` is a callback, always run (late beats never).
// Reduced motion: no playback, jumps straight to the last frame (NANO: goToAndStop(totalFrames-1)).
// The ref exposes { replay(), anim } for one-off triggers.
const STALE_FRAMES = 15 // 250ms at 60fps
const NO_CUES = []

const Lottie = forwardRef(function Lottie(
  { name, playing = true, loop = false, delay = 0, fit = 'contain', renderer = 'canvas', cues = NO_CUES, onComplete, className, style },
  ref,
) {
  const container = useRef(null)
  const anim = useRef(null)
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete
  const cuesRef = useRef(cues)
  cuesRef.current = cues

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
    // Frame-synced cues: fire each once as playback crosses its frame
    let next = 0
    let last = -1
    const onFrame = () => {
      const list = cuesRef.current
      if (!list.length) return
      const f = a.currentFrame
      if (f < last) next = 0 // replayed / looped
      last = f
      while (next < list.length && list[next].frame <= f) {
        const cue = list[next++]
        if (cue.run) cue.run()
        else if (f - cue.frame <= STALE_FRAMES) haptic[cue.kind]?.()
      }
    }
    a.addEventListener('enterFrame', onFrame)
    return () => {
      a.destroy() // drops its listeners too
      anim.current = null
    }
  }, [name, loop, fit, renderer])

  useEffect(() => {
    const a = anim.current
    if (!a) return
    let timer
    let cancelled = false
    const start = () => {
      if (prefersReducedMotion()) {
        a.goToAndStop(a.totalFrames - 1, true)
        completeRef.current?.()
      } else if (playing) {
        a.goToAndStop(0, true)
        const t0 = performance.now()
        decodeImages(a).then(() => {
          if (cancelled) return
          timer = setTimeout(() => a.goToAndPlay(0, true), Math.max(0, delay - (performance.now() - t0)))
        })
      } else {
        a.goToAndStop(0, true)
      }
    }
    // lottie-web's addEventListener returns its own remover; it must not run after destroy()
    let off = null
    if (a.isLoaded) start()
    else off = a.addEventListener('DOMLoaded', start)
    return () => {
      cancelled = true
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

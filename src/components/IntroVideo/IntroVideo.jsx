import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../../lib/gsap.js'
import { FADE, prefersReducedMotion } from '../../lib/motion.js'
import { lockScroll } from '../../lib/scrollLock.js'
import { haptic } from '../../lib/haptics.js'
import './IntroVideo.css'


// Full-screen intro video. Haptics are fired from the video's own frame clock
// (requestVideoFrameCallback → mediaTime), so they stay on the frame even if playback stalls or
// starts late; a cue is skipped if playback has already moved >250ms past it (e.g. after a hiccup).
// Plays with sound when the browser allows it, otherwise muted. Ends → onDone(); Skip → onDone().
// Leaving (open → false) dissolves the video — fade + slight push-in + blur — revealing whatever
// was placed underneath (the Add a child flow).
const NO_CUES = []

export default function IntroVideo({ open, src, cues = NO_CUES, onDone }) {
  const [mounted, setMounted] = useState(open)
  if (open && !mounted) setMounted(true)
  const root = useRef(null)
  const video = useRef(null)
  const doneRef = useRef(onDone)
  useLayoutEffect(() => {
    doneRef.current = onDone
  })

  // Enter / leave
  useGSAP(
    () => {
      if (!mounted) return
      const el = root.current
      const reduced = prefersReducedMotion()
      if (open) {
        gsap.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE })
      } else {
        video.current?.pause()
        gsap.to(el, {
          autoAlpha: 0,
          ...(reduced ? {} : { scale: 1.04, filter: 'blur(6px)' }),
          duration: reduced ? FADE.duration : 0.5,
          ease: reduced ? FADE.ease : 'nano.iosOut',
          onComplete: () => setMounted(false),
        })
      }
    },
    { scope: root, dependencies: [open, mounted] },
  )

  // Playback + frame-synced haptics
  useEffect(() => {
    if (!mounted || !open) return
    const v = video.current
    if (!v) return
    const fired = new Set()
    let handle = 0
    let cancelled = false

    const fire = (mediaTime) => {
      cues.forEach((cue, i) => {
        if (fired.has(i) || mediaTime < cue.t) return
        fired.add(i)
        if (mediaTime - cue.t <= 0.25) haptic[cue.kind]?.()
      })
    }
    const onFrame = (_now, meta) => {
      if (cancelled) return
      fire(meta.mediaTime)
      handle = v.requestVideoFrameCallback(onFrame)
    }
    const onTime = () => fire(v.currentTime) // fallback where rVFC isn't available
    const onEnded = () => doneRef.current?.()

    if ('requestVideoFrameCallback' in v) handle = v.requestVideoFrameCallback(onFrame)
    else v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnded)

    v.currentTime = 0
    v.muted = false
    v.play().catch(() => {
      // Autoplay with sound refused — play muted instead
      v.muted = true
      v.play().catch(() => {})
    })

    return () => {
      cancelled = true
      if (handle && 'cancelVideoFrameCallback' in v) v.cancelVideoFrameCallback(handle)
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnded)
    }
  }, [mounted, open, cues])

  useEffect(() => (mounted ? lockScroll() : undefined), [mounted])

  if (!mounted) return null

  return (
    <div ref={root} className="intro-video" role="dialog" aria-modal="true" aria-label="Introducing noon nano">
      <video ref={video} className="intro-video__media" src={src} playsInline preload="auto" />
      <button type="button" className="intro-video__skip" onClick={() => doneRef.current?.()}>
        Skip
      </button>
    </div>
  )
}

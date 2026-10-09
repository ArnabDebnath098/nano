import { useLayoutEffect } from 'react'
import { squirclePath } from './squircle.js'

// Clip an element to a Figma-smoothed squircle at its own CSS border-radius (default 60%,
// Figma's "iOS" preset). For boxes with no border and nothing overhanging their edge — a
// textured card, an image — where the clip can't cut anything it shouldn't. Rebuilt on resize
// (the path is in pixels).
export function useSquircleClip(ref, smoothing = 0.6) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const apply = () => {
      const { width, height } = el.getBoundingClientRect()
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0
      el.style.clipPath = `path('${squirclePath({ width, height, radius, smoothing })}')`
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, smoothing])
}

import { useLayoutEffect } from 'react'
import { CORNER_SMOOTHING, squirclePath } from './squircle.js'

// Clip an element to a Figma-smoothed squircle at its own CSS border-radius (default CORNER_SMOOTHING,
// fully smoothed). For boxes with no border and nothing overhanging their edge — a
// textured card, an image — where the clip can't cut anything it shouldn't. Rebuilt on resize
// (the path is in pixels).
export function useSquircleClip(ref, smoothing = CORNER_SMOOTHING) {
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

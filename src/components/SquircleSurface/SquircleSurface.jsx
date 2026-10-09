import { useLayoutEffect, useRef, useState } from 'react'
import { gsap } from '../../lib/gsap.js'
import { FADE, prefersReducedMotion } from '../../lib/motion.js'
import { CORNER_SMOOTHING, squirclePath } from '../../lib/squircle.js'
import './SquircleSurface.css'

// Figma corner smoothing (default CORNER_SMOOTHING = 100%) for a box with a fill and a
// border. CSS border-radius can't smooth corners and clip-path would cut through the border,
// so the fill and a 1px stroke are drawn as an SVG squircle behind the content, sized to the
// parent with a ResizeObserver. Style it from CSS through these custom properties:
//   --surface-fill, --surface-stroke   colours (transition like normal colours)
// The radius follows the parent's CSS border-radius (re-read on focus changes and animated
// on PP Fade), so per-context and per-state overrides carry over.
// The parent must be positioned; content above it paints normally.
export default function SquircleSurface({ radius, smoothing = CORNER_SMOOTHING, strokeWidth = 1 }) {
  const ref = useRef(null)
  const [size, setSize] = useState(null)

  useLayoutEffect(() => {
    const parent = ref.current?.parentElement
    if (!parent) return
    const shape = { r: null }
    let tween = null

    // Layout size, never the painted one: getBoundingClientRect() includes transforms, so a
    // parent caught mid-animation (e.g. a page row rising in from scale .95) would get a
    // shrunken path that no resize ever corrects. ResizeObserver's border box is fractional and
    // transform-free; offsetWidth (also transform-free) covers the first, pre-observer read.
    const read = (entry) => {
      const cs = getComputedStyle(parent)
      const bb = entry?.borderBoxSize?.[0]
      return {
        // border-box size; absolute children start inside the border, so offset by it
        w: bb ? bb.inlineSize : parent.offsetWidth,
        h: bb ? bb.blockSize : parent.offsetHeight,
        x: -(parseFloat(cs.borderLeftWidth) || 0),
        y: -(parseFloat(cs.borderTopWidth) || 0),
        r: radius ?? (parseFloat(cs.borderTopLeftRadius) || 0),
      }
    }

    let last = null // latest ResizeObserver entry, so focus re-reads keep the fractional size
    const measure = (entry) => {
      const next = read(entry ?? last)
      if (shape.r === null || shape.r === next.r || prefersReducedMotion()) {
        tween?.kill()
        shape.r = next.r
        setSize(next)
        return
      }
      // Radius changed (e.g. 12 → 16 when selected): ease it so the corners morph
      tween?.kill()
      tween = gsap.to(shape, {
        r: next.r,
        ...FADE,
        onUpdate: () => setSize({ ...next, r: shape.r }),
      })
    }

    measure()
    const ro = new ResizeObserver(([entry]) => {
      last = entry
      measure(entry)
    })
    ro.observe(parent)
    // :focus-within can change the radius without changing size; re-read after styles apply
    const onFocusChange = () => requestAnimationFrame(() => measure())
    parent.addEventListener('focusin', onFocusChange)
    parent.addEventListener('focusout', onFocusChange)
    return () => {
      ro.disconnect()
      tween?.kill()
      parent.removeEventListener('focusin', onFocusChange)
      parent.removeEventListener('focusout', onFocusChange)
    }
  }, [radius])

  const fill = size ? squirclePath({ width: size.w, height: size.h, radius: size.r, smoothing }) : ''
  // Stroke centred half a stroke inside, so its outer edge sits exactly on the box
  const stroke = size
    ? squirclePath({ width: size.w, height: size.h, radius: size.r, smoothing, inset: strokeWidth / 2 })
    : ''

  return (
    <svg
      ref={ref}
      className="squircle-surface"
      style={size ? { left: size.x, top: size.y } : undefined}
      width={size?.w ?? 0}
      height={size?.h ?? 0}
      viewBox={size ? `0 0 ${size.w} ${size.h}` : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <path className="squircle-surface__fill" d={fill} />
      <path className="squircle-surface__stroke" d={stroke} strokeWidth={strokeWidth} />
    </svg>
  )
}

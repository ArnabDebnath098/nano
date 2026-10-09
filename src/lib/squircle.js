// Figma-style smoothed corners ("corner smoothing"), ported from Figma's squircle geometry.
// Returns SVG path strings: use with `clip-path: path(...)` or as an SVG <path d>.

const rad = (deg) => (deg * Math.PI) / 180

// The app's corner smoothing (Figma's slider, 0–1). 1 = fully smoothed — every smoothed shape
// (SquircleSurface, useSquircleClip, sheets, the top bar) uses this unless told otherwise.
export const CORNER_SMOOTHING = 1

function cornerParams(radiusIn, smoothingIn, maxP) {
  // Smoothing extends the curve to (1 + smoothing)·radius along each edge. When that doesn't fit
  // (short sides, pill-like radii — common at smoothing 1), do what Figma does: keep the radius
  // and give up smoothing until it fits, rather than squashing the curve (which kinks it)
  const radius = Math.min(radiusIn, maxP)
  let smoothing = smoothingIn
  if ((1 + smoothing) * radius > maxP) smoothing = Math.max(0, maxP / radius - 1)
  const p = Math.min((1 + smoothing) * radius, maxP) // min: float rounding only
  const arcMeasure = 90 * (1 - smoothing)
  const arcSectionLength = Math.sin(rad(arcMeasure / 2)) * radius * Math.SQRT2
  const angleAlpha = (90 - arcMeasure) / 2
  const p3ToP4Distance = radius * Math.tan(rad(angleAlpha / 2))
  const angleBeta = 45 * smoothing
  const c = p3ToP4Distance * Math.cos(rad(angleBeta))
  const d = c * Math.tan(rad(angleBeta))
  const b = (p - arcSectionLength - c - d) / 3
  const a = 2 * b
  return { p, a, b, c, d, arcSectionLength, radius }
}

const n = (v) => Math.round(v * 1000) / 1000

// Relative segments for each corner, drawn clockwise; each starts where the straight edge
// ends and travels exactly p along both axes.
const CORNER = {
  topRight: ({ a, b, c, d, s, r }) => [
    `c${n(a)},0 ${n(a + b)},0 ${n(a + b + c)},${n(d)}`,
    `a${r},${r} 0 0 1 ${n(s)},${n(s)}`,
    `c${n(d)},${n(c)} ${n(d)},${n(b + c)} ${n(d)},${n(a + b + c)}`,
  ],
  bottomRight: ({ a, b, c, d, s, r }) => [
    `c0,${n(a)} 0,${n(a + b)} ${n(-d)},${n(a + b + c)}`,
    `a${r},${r} 0 0 1 ${n(-s)},${n(s)}`,
    `c${n(-c)},${n(d)} ${n(-(b + c))},${n(d)} ${n(-(a + b + c))},${n(d)}`,
  ],
  bottomLeft: ({ a, b, c, d, s, r }) => [
    `c${n(-a)},0 ${n(-(a + b))},0 ${n(-(a + b + c))},${n(-d)}`,
    `a${r},${r} 0 0 1 ${n(-s)},${n(-s)}`,
    `c${n(-d)},${n(-c)} ${n(-d)},${n(-(b + c))} ${n(-d)},${n(-(a + b + c))}`,
  ],
  topLeft: ({ a, b, c, d, s, r }) => [
    `c0,${n(-a)} 0,${n(-(a + b))} ${n(d)},${n(-(a + b + c))}`,
    `a${r},${r} 0 0 1 ${n(s)},${n(-s)}`,
    `c${n(c)},${n(-d)} ${n(b + c)},${n(-d)} ${n(a + b + c)},${n(-d)}`,
  ],
}

function params(radius, smoothing, w, h) {
  const { p, a, b, c, d, arcSectionLength, radius: r } = cornerParams(radius, smoothing, Math.min(w, h) / 2)
  return { p, a, b, c, d, s: arcSectionLength, r: n(r) }
}

// Bottom corners smoothed, top corners square (collapsing top bar)
export function bottomSquirclePath({ width, height, radius, smoothing = CORNER_SMOOTHING }) {
  const w = width
  const h = height
  if (radius <= 0) return `M0,0 H${n(w)} V${n(h)} H0 Z`
  const k = params(radius, smoothing, w, h)
  return [
    `M0,0 H${n(w)} V${n(h - k.p)}`,
    ...CORNER.bottomRight(k),
    `H${n(k.p)}`,
    ...CORNER.bottomLeft(k),
    'Z',
  ].join(' ')
}

// All four corners smoothed. `inset` shrinks the shape on every side (e.g. 0.5 for a
// 1px stroke whose outer edge should sit on the box), reducing the radius to match.
export function squirclePath({ width, height, radius, smoothing = CORNER_SMOOTHING, inset = 0 }) {
  const w = width - inset * 2
  const h = height - inset * 2
  const o = inset
  if (w <= 0 || h <= 0) return ''
  const rr = Math.max(0, radius - inset)
  if (rr <= 0) return `M${n(o)},${n(o)} h${n(w)} v${n(h)} h${n(-w)} Z`
  const k = params(rr, smoothing, w, h)
  return [
    `M${n(o + k.p)},${n(o)}`,
    `H${n(o + w - k.p)}`,
    ...CORNER.topRight(k),
    `V${n(o + h - k.p)}`,
    ...CORNER.bottomRight(k),
    `H${n(o + k.p)}`,
    ...CORNER.bottomLeft(k),
    `V${n(o + k.p)}`,
    ...CORNER.topLeft(k),
    'Z',
  ].join(' ')
}

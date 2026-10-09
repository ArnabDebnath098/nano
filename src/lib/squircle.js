// Figma-style smoothed corners ("corner smoothing"), ported from Figma's squircle geometry.
// Returns SVG path strings: use with `clip-path: path(...)` or as an SVG <path d>.

const rad = (deg) => (deg * Math.PI) / 180

function cornerParams(radius, smoothing, maxP) {
  // Smoothing extends the curve beyond the radius; cap it to the space available
  const p = Math.min((1 + smoothing) * radius, maxP)
  const arcMeasure = 90 * (1 - smoothing)
  const arcSectionLength = Math.sin(rad(arcMeasure / 2)) * radius * Math.SQRT2
  const angleAlpha = (90 - arcMeasure) / 2
  const p3ToP4Distance = radius * Math.tan(rad(angleAlpha / 2))
  const angleBeta = 45 * smoothing
  const c = p3ToP4Distance * Math.cos(rad(angleBeta))
  const d = c * Math.tan(rad(angleBeta))
  const b = (p - arcSectionLength - c - d) / 3
  const a = 2 * b
  return { p, a, b, c, d, arcSectionLength }
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
  const { p, a, b, c, d, arcSectionLength } = cornerParams(radius, smoothing, Math.min(w, h) / 2)
  return { p, a, b, c, d, s: arcSectionLength, r: n(radius) }
}

// Bottom corners smoothed, top corners square (collapsing top bar)
export function bottomSquirclePath({ width, height, radius, smoothing = 0.6 }) {
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
export function squirclePath({ width, height, radius, smoothing = 0.6, inset = 0 }) {
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

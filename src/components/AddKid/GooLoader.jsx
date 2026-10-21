import { useId } from 'react'
import './GooLoader.css'

// The nano button's loading animation: gooey blobs flow left to right along a moving beaded
// track, melting into the beads and each other as they pass. Drawn in currentColor, so it's
// white on the dark button and ink on the white one.

// Beads from just off the left edge to past the right, so the track can slide one pitch and loop
const TRACK = Array.from({ length: 14 }, (_, i) => i * 4 - 2)
const BLOBS = [0, 1, 2]

export default function GooLoader({ className = '' }) {
  const filterId = `goo-${useId().replace(/:/g, '')}`

  return (
    <svg className={`goo-loader ${className}`} viewBox="0 0 48 16" aria-hidden="true">
      <defs>
        {/* Gooey merge: blur the shapes together, then sharpen the alpha back to a hard edge */}
        <filter id={filterId} x="-20%" y="-60%" width="140%" height="220%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.9" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" />
        </filter>
      </defs>
      <g filter={`url(#${filterId})`}>
        <g className="goo-loader__track">
          {TRACK.map((x) => (
            <circle key={x} cx={x} cy="8" r="1.25" />
          ))}
        </g>
        {BLOBS.map((i) => (
          <circle key={i} className="goo-loader__blob" cx="0" cy="8" r="3.6" style={{ '--i': i }} />
        ))}
      </g>
    </svg>
  )
}

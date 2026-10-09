import { useMemo } from 'react'
import { create } from 'qrcode'
import './InviteQRCode.css'

const LOGO = { src: '/figma/add-kid/invite/nano-logo.svg', w: 54.8397, h: 19.5992 }
const SIZE = 164 // Figma 18:16215 — 164 × 164.77

// Figma: QR group (18:16215) — white dot modules (full-module circles), rounded-square finder
// rings with a 3-module dot, and the nano logo plate in the centre. The matrix is a real QR code
// for `value` (qrcode, error correction Q so the logo's cleared modules still scan).
// No reveal animation — the code is shown as-is.
export default function InviteQRCode({ value }) {
  const { n, dots, finders, logo } = useMemo(() => build(value), [value])

  return (
    <div className="invite-qr" style={{ width: SIZE, height: SIZE }}>
      <svg className="invite-qr__svg" viewBox={`0 0 ${n} ${n}`} width={SIZE} height={SIZE} role="img" aria-label="Invite QR code">
        {dots.map(([r, c]) => (
          <circle key={`${r}-${c}`} cx={c + 0.5} cy={r + 0.5} r={0.5} />
        ))}
        {finders.map(([r, c]) => (
          <g key={`f${r}-${c}`}>
            <path
              fillRule="evenodd"
              d={`${rounded(c, r, 7, 2.5)} ${rounded(c + 1, r + 1, 5, 1.5)}`}
            />
            <circle cx={c + 3.5} cy={r + 3.5} r={1.5} />
          </g>
        ))}
      </svg>
      <img
        className="invite-qr__logo"
        src={LOGO.src}
        width={LOGO.w}
        height={LOGO.h}
        alt=""
        style={{ left: logo.x, top: logo.y }}
      />
    </div>
  )
}

function build(value) {
  const qr = create(value, { errorCorrectionLevel: 'Q' })
  const n = qr.modules.size
  const unit = SIZE / n
  // Clear a plate behind the logo (half a module of breathing room)
  const pad = 0.5
  const lw = LOGO.w / unit / 2 + pad
  const lh = LOGO.h / unit / 2 + pad
  const mid = n / 2
  const inLogo = (r, c) => Math.abs(c + 0.5 - mid) <= lw && Math.abs(r + 0.5 - mid) <= lh
  const inFinder = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)

  const dots = []
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (qr.modules.get(r, c) && !inFinder(r, c) && !inLogo(r, c)) dots.push([r, c])
    }
  }
  return {
    n,
    dots,
    finders: [
      [0, 0],
      [0, n - 7],
      [n - 7, 0],
    ],
    logo: { x: (SIZE - LOGO.w) / 2, y: (SIZE - LOGO.h) / 2 },
  }
}

// Rounded-rect subpath (x, y, size, radius)
function rounded(x, y, s, rad) {
  return `M${x + rad} ${y}H${x + s - rad}A${rad} ${rad} 0 0 1 ${x + s} ${y + rad}V${y + s - rad}A${rad} ${rad} 0 0 1 ${x + s - rad} ${y + s}H${x + rad}A${rad} ${rad} 0 0 1 ${x} ${y + s - rad}V${y + rad}A${rad} ${rad} 0 0 1 ${x + rad} ${y}Z`
}

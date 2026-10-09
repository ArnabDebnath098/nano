import { useRef } from 'react'
import { useSquircleClip } from '../../lib/useSquircleClip.js'
import NeutralButton from '../NeutralButton/NeutralButton.jsx'
import './WalletBalance.css'

// Figma: "dhm0 · row" / "dhm1200 · row" — wallet balance with textured card background.
// `dimmed` adds the 20% black overlay used on the second card.
// The textured background is clipped to a 60%-smoothed squircle (Figma corner smoothing).
export default function WalletBalance({ amount, background, dimmed = false, onTopUp }) {
  const bg = useRef(null)
  useSquircleClip(bg)

  return (
    <div className="wallet-balance">
      <div ref={bg} className="wallet-balance__bg" aria-hidden="true">
        <img src={background} alt="" />
        {dimmed && <div className="wallet-balance__dim" />}
      </div>
      <div className="wallet-balance__text">
        {/* "dhm" renders as the dirham symbol via a Noontree ligature */}
        <p className="wallet-balance__amount">
          <span className="dirham">dhm</span>
          {amount}
        </p>
        <p className="wallet-balance__label">Balance</p>
      </div>
      <NeutralButton onClick={onTopUp}>Top up</NeutralButton>
    </div>
  )
}

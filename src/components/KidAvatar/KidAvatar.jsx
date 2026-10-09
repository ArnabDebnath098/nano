import ProfileAvatar from '../ProfileAvatar/ProfileAvatar.jsx'
import './KidAvatar.css'

const A = '/figma/kid-profile'

// Figma: Kid profile header "Top" (94:4941) — 231×80 composition:
// ring + masked portrait, a badge, and a tilted star — in Figma's layer order.
// Kids without a large portrait fall back to their list avatar, scaled to the 66px slot.
export default function KidAvatar({ portrait, fallbackAvatar }) {
  return (
    <div className="kid-avatar" aria-hidden="true">
      {/* 94:4942 — portrait */}
      <div className="kid-avatar__profile">
        <div className="kid-avatar__ring">
          <img src={`${A}/avatar-ring.png`} width="71.32" height="71.32" alt="" />
        </div>

        {portrait ? (
          <div
            className="kid-avatar__portrait"
            style={{ maskImage: `url("${A}/avatar-mask.svg")`, WebkitMaskImage: `url("${A}/avatar-mask.svg")` }}
          >
            <img src={portrait} alt="" />
          </div>
        ) : (
          <div className="kid-avatar__fallback">
            <ProfileAvatar avatar={fallbackAvatar} />
          </div>
        )}
      </div>

      {/* 94:4947 — badge */}
      <img className="kid-avatar__badge" src={`${A}/avatar-badge.png`} alt="" />

      {/* 94:4948 — tilted star (topmost layer in Figma) */}
      <div className="kid-avatar__star">
        <img src={`${A}/avatar-star.png`} alt="" />
      </div>
    </div>
  )
}

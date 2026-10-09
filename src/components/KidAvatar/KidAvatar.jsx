import NanoAvatar from '../NanoAvatar/NanoAvatar.jsx'
import './KidAvatar.css'

const A = '/figma/kid-profile'

// Figma: Kid profile header "Top" (94:4941) — 231×80 composition: the kid's nano avatar
// (Branding 18:386, Size=80, Background=On — the same avatar as their Manage Family card),
// a badge, and a tilted star — in Figma's layer order.
export default function KidAvatar({ character }) {
  return (
    <div className="kid-avatar" aria-hidden="true">
      {/* 94:4942 — avatar */}
      <div className="kid-avatar__profile">
        <NanoAvatar character={character} size={80} />
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

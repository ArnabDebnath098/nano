import NanoAvatar from '../NanoAvatar/NanoAvatar.jsx'
import './ProfileAvatar.css'

// Figma: profile "Image" groups in Switch profile (2:5539 / 2:5551 / 2:5562).
// A 44×44 avatar: coloured circle + illustration cropped from a sprite and clipped
// by a 44×44 alpha mask. All offsets come straight from Figma via `avatar` config.
// Profiles without Figma art (the kids) show their nano `character` instead.
export default function ProfileAvatar({ avatar, character }) {
  if (!avatar) return <NanoAvatar character={character} size={44} />
  const { circle, sprite, mask, frame, layer, crop, flip } = avatar

  return (
    <div className={`profile-avatar ${flip ? 'profile-avatar--flip' : ''}`} aria-hidden="true">
      <img className="profile-avatar__circle" src={circle} width="43.509" height="43.509" alt="" />

      <div
        className="profile-avatar__frame"
        style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h }}
      >
        <div
          className="profile-avatar__layer"
          style={{
            width: layer.w,
            height: layer.h,
            transform: layer.transform,
            maskImage: `url("${mask.src}")`,
            WebkitMaskImage: `url("${mask.src}")`,
            maskPosition: `${mask.x}px ${mask.y}px`,
            WebkitMaskPosition: `${mask.x}px ${mask.y}px`,
          }}
        >
          <img
            src={sprite}
            alt=""
            style={{ left: crop.left, top: crop.top, width: crop.width, height: crop.height }}
          />
        </div>
      </div>
    </div>
  )
}

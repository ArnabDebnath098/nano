import ProfileAvatar from '../ProfileAvatar/ProfileAvatar.jsx'
import './ProfileRow.css'

// Figma: "Kiaan Khalid · row" in Switch profile — avatar, name and M-IconButton chevron.
// The whole row is the tap target; the chevron button is visual only.
export default function ProfileRow({ profile, onSelect }) {
  return (
    <button type="button" className="profile-row" onClick={() => onSelect?.(profile)}>
      <span className="profile-row__identity">
        <ProfileAvatar avatar={profile.avatar} />
        <span className="profile-row__name">{profile.name}</span>
      </span>

      {/* M-IconButton (2:109) — Default emphasis */}
      <span className="profile-row__chevron" aria-hidden="true">
        <img src="/figma/switch-profile/chevron-right-bold.svg" width="12" height="12" alt="" />
      </span>
    </button>
  )
}

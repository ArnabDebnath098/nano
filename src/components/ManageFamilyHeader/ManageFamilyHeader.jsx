import GlassButton from '../GlassButton/GlassButton.jsx'
import './ManageFamilyHeader.css'

// Figma: Manage Family header (32:3571) — back, Add kid, and switch to a child's profile.
export default function ManageFamilyHeader({ onBack, onAddKid, onSwitchProfile }) {
  return (
    <header className="mf-header">
      <GlassButton icon="/figma/chevron-left.svg" ariaLabel="Back" onClick={onBack} />

      <div className="mf-header__actions">
        <GlassButton icon="/figma/plus-bold.svg" iconSize={16} label="Add kid" onClick={onAddKid} />
        <GlassButton icon="/figma/user-switch.svg" ariaLabel="Switch profile" onClick={onSwitchProfile} />
      </div>
    </header>
  )
}

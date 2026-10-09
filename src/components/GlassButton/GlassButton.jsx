import './GlassButton.css'

// Figma: "Back button" / "Trailing" — frosted pill used in the Manage Family header.
// Pass `label` for the text pill (Add kid), omit it for the 40×40 icon button.
export default function GlassButton({ icon, iconSize = 20, label, ariaLabel, onClick }) {
  return (
    <button
      type="button"
      className={`glass-button ${label ? 'glass-button--label' : 'glass-button--icon'}`}
      aria-label={label ? undefined : ariaLabel}
      onClick={onClick}
    >
      <img src={icon} width={iconSize} height={iconSize} alt="" />
      {label && <span className="glass-button__label">{label}</span>}
    </button>
  )
}

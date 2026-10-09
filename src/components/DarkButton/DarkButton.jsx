import './DarkButton.css'

// Figma: M-NeutralButton (56:42164) — dark pill with sculpted inner shadow, e.g. "Top up wallet"
export default function DarkButton({ icon, children, onClick }) {
  return (
    <button type="button" className="dark-button" onClick={onClick}>
      {icon && <img src={icon} width="20" height="20" alt="" />}
      <span className="dark-button__label">{children}</span>
    </button>
  )
}

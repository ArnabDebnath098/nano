import './NeutralButton.css'

// Figma: M-NeutralButton (2:706) — H32 size, used for "Top up"
export default function NeutralButton({ children, onClick }) {
  return (
    <button type="button" className="neutral-button" onClick={onClick}>
      <span className="neutral-button__label">{children}</span>
    </button>
  )
}

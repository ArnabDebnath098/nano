import './CreditsRow.css'

// Figma: List item — noon Credits (2:8267)
export default function CreditsRow({ amount = '320.21', onClick }) {
  return (
    <button type="button" className="credits-row accounts-press" onClick={onClick}>
      <span className="credits-row__lead">
        <span className="credits-row__icon" aria-hidden="true">
          <img src="/figma/accounts/credits-icon.svg" width="20" height="20" alt="" />
        </span>
        <span className="credits-row__label">noon Credits</span>
      </span>
      <span className="credits-row__pill">
        <span className="credits-row__amount">
          <span className="dirham">dhm</span>
          {amount}
        </span>
        <img src="/figma/accounts/chevron-right-14.svg" width="14" height="14" alt="" />
      </span>
    </button>
  )
}

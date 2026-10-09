import './FreeDeliveryRow.css'

// Figma: Get Free Delivery · row — standalone (2:8329) and compact inside the profile card (2:8187)
const ASSETS = {
  default: {
    base: '/figma/accounts/noon-one-logo-base-2.svg',
    word: '/figma/accounts/noon-one-logo-word-2.svg',
    chevron: '/figma/accounts/chevron-right-18.svg',
    chevronSize: 18,
  },
  compact: {
    base: '/figma/accounts/noon-one-logo-base.svg',
    word: '/figma/accounts/noon-one-logo-word.svg',
    chevron: '/figma/accounts/chevron-right-14.svg',
    chevronSize: 14,
  },
}

export default function FreeDeliveryRow({ compact = false, onClick }) {
  const a = ASSETS[compact ? 'compact' : 'default']
  return (
    <button
      type="button"
      className={`free-delivery accounts-press${compact ? ' free-delivery--compact' : ''}`}
      onClick={onClick}
    >
      <img className="free-delivery__lines" src="/figma/accounts/free-delivery-lines.svg" width="346" height="709" alt="" />
      <span className="free-delivery__row">
        <span className="free-delivery__lead">
          {/* noon One Logo_SG */}
          <span className="free-delivery__logo" aria-hidden="true">
            <span className="free-delivery__logo-base">
              <img src={a.base} width="38.0277" height="20.3309" alt="" />
            </span>
            <span className="free-delivery__logo-word">
              <img src={a.word} width="25.4723" height="7.53924" alt="" />
            </span>
          </span>
          <span className="free-delivery__label">Get Free Delivery</span>
        </span>
        <img className="free-delivery__chevron" src={a.chevron} width={a.chevronSize} height={a.chevronSize} alt="" />
      </span>
    </button>
  )
}

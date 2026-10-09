import './UpdatesCard.css'

// Figma: Updates for you · stack (2:8206)
export default function UpdatesCard({ onOpen }) {
  return (
    <section className="updates" aria-labelledby="updates-title">
      <div className="updates__card">
        {/* Title (2:8215) */}
        <div className="updates__title">
          <h2 id="updates-title">Updates for you</h2>
        </div>

        {/* Verify your order details · stack (2:8218) */}
        <div className="updates__body">
          <button type="button" className="updates__item accounts-press" onClick={onOpen}>
            {/* Image Container (2:8221) */}
            <span className="updates__thumb" aria-hidden="true">
              <img src="/figma/accounts/update-order-box.png" alt="" />
            </span>
            {/* Info Container (2:8223) */}
            <span className="updates__info">
              <span className="updates__heading">Verify your order details</span>
              <span className="updates__sub">to place orders securely.</span>
            </span>
            {/* Close (2:8233) */}
            <span className="updates__chevron" aria-hidden="true">
              <img src="/figma/accounts/chevron-right-14.svg" width="14" height="14" alt="" />
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}

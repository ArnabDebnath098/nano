import PriceHighlight from '../PriceHighlight/PriceHighlight.jsx'
import NanoAvatar from '../NanoAvatar/NanoAvatar.jsx'
import './RequestCard.css'

const A = '/figma/kid-profile/approvals'

// Request Status pill (Approvals · Request list 56:32549): tinted pill, bold icon chip + label
const STATUS = {
  approved: { label: 'Approved', icon: `${A}/verified-filled.svg` },
  completed: { label: 'Approved', icon: `${A}/verified-filled.svg` },
  'in-cart': { label: 'Added to cart', icon: `${A}/cart-check-filled.svg` },
  declined: { label: 'Not now', icon: `${A}/cross-circle-filled.svg` },
}

// Figma: Request Card (2:530) — a child's purchase approval request.
// `status` (kid profile Approvals tab) adds the status pill and greys the price once the request
// is done (completed / declined). `bubble="soft"` uses the tab's newer speech bubble (_Bubble
// Mask: light gradient, inner bevel, tail at the top left towards the avatar).
export default function RequestCard({ request, bubble = 'classic' }) {
  const { childName, character, date, itemCount, message, products, amount, storeLogo, status } = request
  const pill = STATUS[status]
  const done = status === 'completed' || status === 'declined'

  return (
    <article className={`request-card ${status ? `request-card--${status}` : ''}`}>
      <div className="request-card__status">
        <div className="request-card__requester">
          {/* Approval cards use the filled-background nano avatar (Branding 18:386) */}
          <NanoAvatar character={character} size={40} background="on" />
          <div className="request-card__meta">
            <p className="request-card__name">{childName}</p>
            <div className="request-card__details">
              <span>{date}</span>
              <span className="request-card__bullet">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>
          {pill && (
            <span className={`request-status request-status--${status}`}>
              <span className="request-status__icon">
                <img src={pill.icon} width="12" height="12" alt="" />
              </span>
              {pill.label}
            </span>
          )}
        </div>

        {bubble === 'soft' ? (
          <div className="request-bubble">
            <img className="request-bubble__tail" src={`${A}/bubble-tail.svg`} width="16.99" height="17.9459" alt="" />
            <p className="request-bubble__text">{message}</p>
          </div>
        ) : (
          <div className="request-card__bubble">
            <img className="request-card__bubble-shape" src="/figma/message-bubble.svg" width="281" height="65.0057" alt="" />
            <p className="request-card__message">{message}</p>
          </div>
        )}
      </div>

      <div className="request-card__divider" aria-hidden="true">
        <img src="/figma/divider.svg" width="324" height="1" alt="" />
      </div>

      <div className="request-card__footer">
        <ul className="request-card__products" aria-label={`${itemCount} requested items`}>
          {products.map((product, i) => (
            <li key={i} className={`request-card__product request-card__product--${i + 1}`}>
              <div className="request-card__product-master">
                <div className="request-card__product-image">
                  <img src={product} alt="" />
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div className="request-card__amount">
          <PriceHighlight amount={amount} variant={done ? 'muted' : 'request'} />
          <img src={storeLogo} width="60.0012" height="14" alt="supermall" />
        </div>
      </div>
    </article>
  )
}

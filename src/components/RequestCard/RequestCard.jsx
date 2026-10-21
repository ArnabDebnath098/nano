import { useId } from 'react'
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
// is done (completed / declined). The message sits in the soft speech bubble (_Bubble Mask: light
// gradient, inner bevel, tail at the top left towards the avatar).
// `onOpen` makes the whole card a tap target that opens the request detail.
export default function RequestCard({ request, onOpen }) {
  const { childName, character, date, itemCount, message, products, amount, storeLogo, status } = request
  const pill = STATUS[status]
  const done = status === 'completed' || status === 'declined'

  return (
    <article
      className={`request-card ${status ? `request-card--${status}` : ''} ${onOpen ? 'request-card--link' : ''}`}
      {...(onOpen && {
        role: 'link',
        tabIndex: 0,
        'aria-label': `${childName ? `${childName}’s request` : 'Request'}, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}, ${date}`,
        onClick: onOpen,
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen()
          }
        },
      })}
    >
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

        <div className="request-bubble">
          <BubbleTail />
          <p className="request-bubble__text">{message}</p>
        </div>
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

// The soft bubble's tail (Figma's _Bubble Mask "Mask", bubble-tail.svg), drawn inline so it can
// shade from a grey tip (a touch deeper than Figma's #f0f0f0, which vanished on the white card) to
// the bubble's white top edge at its base — a flat fill showed as a grey block over the white lip. Path coords are the tail's own:
// the tip is at the bottom until the CSS flips it.
function BubbleTail() {
  const id = useId()
  return (
    <svg className="request-bubble__tail" width="16.99" height="17.9459" viewBox="0 0 16.99 17.9459" aria-hidden="true">
      <defs>
        {/* tip (y 17.95) → where it meets the bubble's top edge (y ≈ 11.1) → white inside it */}
        <linearGradient id={id} x1="0" y1="17.95" x2="0" y2="11" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d4d4d8" />
          <stop offset="0.75" stopColor="#ebebed" />
          <stop offset="1" stopColor="#fff" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${CSS.escape(id)})`}
        d="M1.8 11C2.79 11 3.44 11.31 4.77 12.24C5.48 12.74 8.22 14.84 10.49 16.09C12.45 17.17 14.13 17.91 14.55 17.94C15.81 18.04 15.97 16.85 15.48 16.21C14.99 15.57 14.43 14.74 14.21 14.29C13.73 13.28 13.58 12.75 13.58 11.24C13.58 9.38 14.9 8 15.94 7.08C16.03 7 16.15 6.9 16.29 6.79C16.53 6.6 16.76 6.41 16.99 6.22V0H0V11H1.8Z"
      />
    </svg>
  )
}

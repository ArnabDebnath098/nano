import './OrdersWishlist.css'

// Figma: My Orders · row (2:8236) — two "Top widget" cards with a fanned stack of thumbnails.
// Each thumb: `tilt` = rotated wrapper box (null = no wrapper), `img` = image placement class.
const ORDERS = [
  { src: '/figma/accounts/order-1.png', tilt: 'a', img: 'o1' },
  { src: '/figma/accounts/order-2.png', tilt: 'b', img: 'o2' },
  { src: '/figma/accounts/order-3.png', tilt: 'c', img: 'tall-a' },
  { src: '/figma/accounts/order-4.png', tilt: 'd', img: 'full' },
  { src: '/figma/accounts/order-5.png', tilt: null, img: 'o5' },
]

const WISHLIST = [
  { src: '/figma/accounts/wishlist-1.png', tilt: 'a', img: 'w1' },
  { src: '/figma/accounts/wishlist-2.png', tilt: null, img: 'w2' },
  { src: '/figma/accounts/wishlist-3.png', tilt: 'c', img: 'w3' },
  { src: '/figma/accounts/wishlist-4.png', tilt: 'd', img: 'tall-b' },
  { src: '/figma/accounts/order-4.png', tilt: null, img: 'full' },
]

function Thumb({ src, img }) {
  return (
    <span className="ow-thumb">
      <span className={`ow-thumb__img ow-thumb__img--${img}`}>
        <img src={src} alt="" />
      </span>
    </span>
  )
}

function Widget({ title, items, onOpen }) {
  return (
    <button type="button" className="ow-widget accounts-press" onClick={onOpen}>
      <span className="ow-widget__header">{title}</span>
      <span className="ow-widget__images" aria-hidden="true">
        {items.map((item, i) => (
          <span key={i} className={`ow-widget__slot ow-widget__slot--${item.tilt ?? 'flat'}`} style={{ zIndex: 5 - i }}>
            {item.tilt ? (
              <span className="ow-widget__tilt">
                <Thumb {...item} />
              </span>
            ) : (
              <Thumb {...item} />
            )}
          </span>
        ))}
      </span>
    </button>
  )
}

export default function OrdersWishlist({ onOpenOrders, onOpenWishlist }) {
  return (
    <div className="orders-wishlist">
      <Widget title="My Orders" items={ORDERS} onOpen={onOpenOrders} />
      <Widget title="My Wishlist" items={WISHLIST} onOpen={onOpenWishlist} />
    </div>
  )
}

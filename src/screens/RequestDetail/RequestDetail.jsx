import { useLayoutEffect, useRef } from 'react'
import StatusBar from '../../components/StatusBar/StatusBar.jsx'
import NanoAvatar from '../../components/NanoAvatar/NanoAvatar.jsx'
import NanoButton from '../../components/AddKid/NanoButton.jsx'
import { getWalletSkin } from '../../data/walletSkins.js'
import './RequestDetail.css'

const A = '/figma/request-detail'

const Dhm = () => <span className="dirham">dhm</span>

// Figma: Request detail · Not within balance (Parent-Side 56:31669) — a child's purchase request
// in full: the order amount against their wallet, their note, the products, delivery address and
// payment summary, with Not now / Approve & pay pinned at the bottom.
// On scroll it collapses like the kid profile header: the header image stays put while the header
// shrinks to the top bar's height, the avatar shrinks and fades under the bar, and the order
// amount scrolls up, shrinking to 20px, to pin level with the back button.
export default function RequestDetail({ request, titleId, onBack, onDecline, onApprove }) {
  const { kid, amount, walletBalance, message, products, saved, coupon, address, summary } = request
  const shortBy = Math.max(0, amount - walletBalance)
  const skin = getWalletSkin(kid?.walletSkin)
  const { headerRef, bgRef, barRef, navRef, avatarRef, labelRef, amountRef, cardRef } = useCollapsingSummary()

  return (
    <div className="request-detail">
      {/* 71:16000 — Request summary header (the kid's wallet skin behind) */}
      <header className="request-summary" ref={headerRef}>
        <img ref={bgRef} className="request-summary__bg" src={skin.background} alt="" />

        {/* 71:2303 — Top bar, pinned (no fill of its own: the header image shows through) */}
        <div className="request-detail__top-bar" ref={barRef}>
          <StatusBar />
          {/* 71:2266 — Request nav header */}
          <nav className="request-detail__nav" ref={navRef}>
            <button type="button" className="request-detail__back" aria-label="Back" onClick={onBack}>
              <img src={`${A}/chevron-left.svg`} width="24" height="24" alt="" />
            </button>
          </nav>
        </div>

        <div className="request-summary__stack">
          <div ref={avatarRef} className="request-summary__avatar">
            <NanoAvatar character={kid?.character} size={80} background="on" />
          </div>

          {/* Label and amount sit straight in the stack so the amount's sticky box is the stack */}
          <p ref={labelRef} className="request-summary__label">
            Order amount
          </p>
          <h1 ref={amountRef} id={titleId} className="request-summary__value">
            <Dhm /> {amount}
          </h1>

          {/* 79:3217 — Wallet balance card */}
          <div ref={cardRef} className="wallet-short">
            <div className="wallet-short__row">
              <div className="wallet-short__col">
                <p className="wallet-short__caption">Wallet balance</p>
                <p className="wallet-short__value">
                  <Dhm />
                  {walletBalance}
                </p>
              </div>
              <div className="wallet-short__col wallet-short__col--end">
                <p className="wallet-short__caption">Short by</p>
                <p className="wallet-short__value wallet-short__value--short">
                  <Dhm />
                  {shortBy}
                </p>
              </div>
            </div>
            <div
              className="wallet-short__bar"
              role="img"
              aria-label={`Wallet covers dhm${walletBalance} of dhm${amount}, short by dhm${shortBy}`}
            >
              <span className="wallet-short__balance" style={{ flexGrow: walletBalance }} />
              {shortBy > 0 && <span className="wallet-short__short" style={{ flexGrow: shortBy }} />}
            </div>
          </div>
        </div>
      </header>

      {/* 56:31698 — Body */}
      <div className="request-detail__body">
        {/* 80:3057 — Message from kid */}
        <section className="request-panel request-message">
          <span className="request-icon">
            <img src={`${A}/message-filled.svg`} width="24" height="24" alt="" />
          </span>
          <p className="request-message__text">{message}</p>
        </section>

        {/* 56:31703 — Requested products */}
        <section className="request-panel request-products" aria-labelledby="request-products-title">
          <div className="request-products__list">
            <h2 id="request-products-title" className="request-products__title">
              Requested products
            </h2>
            {products.map((product, i) => (
              <div key={product.id} className="request-products__item">
                {i > 0 && <img className="request-products__divider" src={`${A}/divider.svg`} width="327" height="1" alt="" />}
                <RequestedProduct product={product} />
              </div>
            ))}
          </div>

          {/* 56:31768 — Price description */}
          <div className="request-savings">
            <div className="request-savings__inner">
              <p className="request-savings__text">
                <img src={`${A}/verified-filled.svg`} width="20" height="20" alt="" />
                <span>
                  You saved <Dhm />
                  {saved}
                </span>
              </p>
              <span className="request-coupon">
                <img src={`${A}/local-offer.svg`} width="14" height="14" alt="" />
                {coupon}
              </span>
            </div>
          </div>
        </section>

        {/* 56:31782 — Address header */}
        <section className="request-panel request-address">
          <span className="request-icon">
            <img src={`${A}/shop-filled.svg`} width="24" height="24" alt="" />
          </span>
          <div className="request-address__text">
            <p className="request-address__label">{address.label}</p>
            <p className="request-address__line">{address.line}</p>
          </div>
        </section>

        {/* 56:31790 — Payment summary */}
        <section className="request-panel request-payment" aria-labelledby="request-payment-title">
          <div className="request-payment__content">
            <h2 id="request-payment-title" className="request-payment__title">
              Payment summary
            </h2>

            <div className="request-payment__breakdown">
              <div className="request-payment__lines">
                <div className="request-payment__row">
                  <span className="request-payment__label request-payment__label--dotted">Subtotal</span>
                  <span className="request-payment__right">
                    <s className="request-payment__was">{summary.subtotalWas}</s>
                    <span className="request-payment__amount">{summary.subtotal}</span>
                  </span>
                </div>
                <div className="request-payment__row request-payment__row--fee">
                  <span className="request-payment__fee">Delivery fee</span>
                  <span className="request-payment__right">
                    <span className="request-payment__free">Free with</span>
                    <span className="request-payment__amount">
                      <Dhm />
                      {summary.deliveryFee}
                    </span>
                  </span>
                </div>
              </div>
              <img className="request-payment__divider" src={`${A}/dashed-divider.svg`} width="328" height="1" alt="" />

              <div className="request-payment__row request-payment__row--pad">
                <span className="request-payment__label request-payment__label--secondary">Coupon discount</span>
                <span className="request-payment__amount">
                  – <Dhm />
                  {summary.couponDiscount}
                </span>
              </div>
              <img className="request-payment__divider" src={`${A}/dashed-divider.svg`} width="328" height="1" alt="" />

              <div className="request-payment__total">
                <span>Total</span>
                <span>
                  <Dhm />
                  {summary.total}
                </span>
              </div>
            </div>
          </div>

          {/* 56:31855 — Savings strip */}
          <div className="request-cashback">
            <img className="request-cashback__edge" src={`${A}/savings-edge.svg`} width="351" height="5" alt="" />
            <div className="request-cashback__row">
              <span className="request-cashback__label">Coupon Cashback</span>
              <span className="request-cashback__value">
                <Dhm />
                {summary.cashback}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* 56:31861 — Bottom section */}
      <footer className="request-detail__bottom">
        {shortBy > 0 && (
          <p className="request-detail__notice">
            You need to add <Dhm />
            {shortBy} to place this order
          </p>
        )}
        <div className="request-detail__actions">
          <NanoButton variant="secondary" onClick={onDecline}>
            Not now
          </NanoButton>
          <NanoButton variant="primary" onClick={onApprove}>
            Approve &amp; pay
          </NanoButton>
        </div>
        <div className="request-detail__home-bar" aria-hidden="true">
          <span />
        </div>
      </footer>
    </div>
  )
}

// One requested product row (56:31707 / 56:31747): image tile with checkbox and quantity, then
// name, price and the delivery ETA
function RequestedProduct({ product }) {
  const { name, image, imageSize, flip, quantity, price, oldPrice, off, eta, checkbox } = product
  return (
    <div className="request-product">
      <div className="request-product__media">
        <div className="request-product__tile">
          <img
            src={image}
            width={imageSize}
            height={imageSize}
            alt=""
            style={flip ? { transform: 'scaleX(-1)' } : undefined}
          />
        </div>
        {quantity > 1 && <span className="request-product__qty">x{quantity}</span>}
        <img className="request-product__check" src={checkbox} width="20" height="20" alt="" />
      </div>

      <div className="request-product__info">
        <p className="request-product__name">{name}</p>
        <div className="request-product__secondary">
          <p className="request-product__price">
            <span className="request-product__now">
              <Dhm />
              {price}
            </span>
            <s className="request-product__was">
              <Dhm />
              {oldPrice}
            </s>
            <span className="request-product__off">{off}% OFF</span>
          </p>

          {eta.type === 'express' ? (
            <div className="request-eta request-eta--express">
              <span className="request-eta__text">
                <img src={`${A}/flash.svg`} width="14" height="14" alt="" />
                <span>
                  {eta.lead}
                  <b>{eta.time}</b>
                </span>
              </span>
              {/* 56:31731 — MarketplaceTagsPills (supermall) */}
              <span className="request-eta__tag" aria-label="supermall">
                <span className="request-eta__tag-text">
                  <img className="request-eta__tag-mall" src={`${A}/supermall-mall.svg`} width="25.432" height="7.7088" alt="" />
                  <img className="request-eta__tag-super" src={`${A}/supermall-super.svg`} width="18.0193" height="7.6477" alt="" />
                </span>
              </span>
            </div>
          ) : (
            <div className="request-eta request-eta--market">
              <img className="request-eta__shape" src={`${A}/marketplace-eta.svg`} width="157.644" height="31.6191" alt="" />
              <span className="request-eta__text">
                {eta.lead}
                <b>{eta.time}</b>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function scrollParent(el) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(node).overflowY)) return node
  }
  return null
}

const PINNED_SCALE = 20 / 40 // H40 amount → 20px title in the nav
const SHRINK_RANGE = 64 // px of scroll over which it shrinks, ending as it pins
const AVATAR_END_SCALE = 0 // the avatar shrinks away to nothing as it fades
const COLLAPSED_PADDING = 8 // collapsed, the header keeps 8px of itself below the top bar
const clamp01 = (v) => Math.min(1, Math.max(0, v))

// Collapsing header, as on the kid profile. All the movement is CSS sticky, so it tracks the
// scroll exactly (a scroll handler runs a frame behind it, which made pinned things jitter):
//  • the header is sticky with top = −collapse, so it scrolls until only the top bar's height
//    (+ COLLAPSED_PADDING) of it is left; the top bar inside it is sticky at 0
//  • the image is sticky at 0 inside the header, so it stays put. Its header box is made `collapse`
//    taller (padding, cancelled by a negative margin and cut off by the clip-path) so there's
//    room for it to stay put all the way to the collapsed state.
//  • the amount is sticky, centred in the nav
// The scroll handler only fades and scales: the avatar shrinks and fades out by the time its
// bottom reaches the bar, the label and wallet card fade before they reach it, the amount
// shrinks over the SHRINK_RANGE px before it pins.
function useCollapsingSummary() {
  const header = useRef(null)
  const bg = useRef(null)
  const bar = useRef(null)
  const nav = useRef(null)
  const avatar = useRef(null)
  const label = useRef(null)
  const amount = useRef(null)
  const card = useRef(null)

  useLayoutEffect(() => {
    const scroller = scrollParent(header.current)
    if (!scroller) return
    let pinAt = 0
    let avatarGoneAt = 1
    let labelGoneAt = 1
    let cardGoneAt = 1
    let cardFade = 1
    let height = 0

    const measure = () => {
      const el = header.current
      // Content height, without the overhang
      const h = el.offsetHeight - (parseFloat(el.style.getPropertyValue('--overhang')) || 0)
      if (Math.abs(h - height) < 0.5) return // our own overhang change re-triggers the observer
      height = h
      for (const node of [avatar.current, amount.current]) node.style.transform = ''
      const y = scroller.scrollTop
      const top = scroller.getBoundingClientRect().top
      const at = (node, edge) => node.getBoundingClientRect()[edge] - top + y // page position at rest
      const barBottom = bar.current.offsetHeight
      const collapse = h - barBottom - COLLAPSED_PADDING
      el.style.top = `${-collapse}px`
      el.style.setProperty('--overhang', `${collapse}px`)
      bg.current.style.height = `${h}px`
      bg.current.style.marginBottom = `${-h}px`

      const n = nav.current.getBoundingClientRect()
      const pinnedCenter = n.top - top + n.height / 2
      const stickyTop = pinnedCenter - amount.current.offsetHeight / 2
      amount.current.style.top = `${stickyTop}px`
      pinAt = at(amount.current, 'top') - stickyTop
      avatarGoneAt = Math.max(1, at(avatar.current, 'bottom') - barBottom)
      labelGoneAt = Math.max(1, at(label.current, 'bottom') - barBottom)
      cardGoneAt = Math.max(1, at(card.current, 'top') - barBottom)
      cardFade = Math.min(cardGoneAt, card.current.offsetHeight)
      update()
    }

    const update = () => {
      const y = scroller.scrollTop

      const gone = clamp01(y / avatarGoneAt)
      avatar.current.style.opacity = 1 - gone
      avatar.current.style.transform = gone ? `scale(${1 - gone * (1 - AVATAR_END_SCALE)})` : ''
      label.current.style.opacity = 1 - clamp01(y / labelGoneAt)
      card.current.style.opacity = 1 - clamp01((y - (cardGoneAt - cardFade)) / cardFade)

      const p = clamp01((y - (pinAt - SHRINK_RANGE)) / SHRINK_RANGE)
      amount.current.style.transform = p ? `scale(${1 - p * (1 - PINNED_SCALE)})` : ''
    }

    measure()
    scroller.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(header.current)
    return () => {
      scroller.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  return { headerRef: header, bgRef: bg, barRef: bar, navRef: nav, avatarRef: avatar, labelRef: label, amountRef: amount, cardRef: card }
}

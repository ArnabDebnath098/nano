import './PriceHighlight.css'

// Ticket-edge SVGs differ per placement in Figma, so each variant keeps its own assets
const TICKERS = {
  task: { left: '/figma/left-ticker.svg', right: '/figma/right-ticker.svg' },
  request: { left: '/figma/left-ticker-request.svg', right: '/figma/right-ticker-request.svg' },
}

// Figma: Price Highlight — blue ticket-style price tag ("dhm48").
// "dhm" renders as the dirham symbol via a Noontree ligature.
export default function PriceHighlight({ amount, variant = 'task' }) {
  const tickers = TICKERS[variant]
  return (
    <div className="price-highlight">
      <img className="price-highlight__ticker" src={tickers.left} width="3.14258" height="24" alt="" />
      <div className="price-highlight__view">
        <span className="price-highlight__amount">
          <span className="dirham">dhm</span>
          {amount}
        </span>
      </div>
      <img className="price-highlight__ticker" src={tickers.right} width="3.14258" height="24" alt="" />
    </div>
  )
}

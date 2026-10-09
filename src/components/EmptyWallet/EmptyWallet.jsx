import DarkButton from '../DarkButton/DarkButton.jsx'
import './EmptyWallet.css'

const A = '/figma/kid-profile'

// Figma: Empty wallet floor (103:9745) — perspective grid + soft shadows, behind the card
function EmptyWalletFloor() {
  return (
    <div className="ew-floor" aria-hidden="true">
      <div className="ew-floor__grid">
        <div
          className="ew-floor__grid-lines"
          style={{ maskImage: `url("${A}/grid-fade-mask.svg")`, WebkitMaskImage: `url("${A}/grid-fade-mask.svg")` }}
        >
          <img src={`${A}/grid-lines.svg`} width="375" height="164" alt="" />
        </div>
      </div>
      <div className="ew-floor__shadow ew-floor__shadow--right">
        <img src={`${A}/shadow-right.svg`} width="129.004" height="66.255" alt="" />
      </div>
      <div className="ew-floor__shadow ew-floor__shadow--left">
        <img src={`${A}/shadow-left.svg`} width="184.291" height="94.6499" alt="" />
      </div>
    </div>
  )
}

// Figma: Empty wallet props (105:4680) — chrome cacti, in front of the card
function EmptyWalletProps() {
  return (
    <div className="ew-props" aria-hidden="true">
      <div className="ew-props__cactus ew-props__cactus--left">
        <img src={`${A}/cactus.png`} alt="" />
      </div>
      <div className="ew-props__cactus ew-props__cactus--right">
        <img src={`${A}/cactus.png`} alt="" />
      </div>
    </div>
  )
}

// Figma: wallet (56:42138) — Wallet · Empty (first time)
export default function EmptyWallet({ kidName, onTopUp }) {
  return (
    <div className="empty-wallet">
      <div className="ew-header">
        <div className="ew-header__sticker">
          <img src={`${A}/empty-wallet-sticker.png`} alt="Empty wallet" />
        </div>
        <p className="ew-header__text">Add funds so {kidName} can start ordering</p>
      </div>

      <EmptyWalletFloor />

      <div className="ew-card" aria-hidden="true">
        <img src={`${A}/wallet-card.png`} alt="" />
      </div>

      <EmptyWalletProps />

      <div className="ew-cta">
        <DarkButton icon={`${A}/plus-icon.svg`} onClick={onTopUp}>
          Top up wallet
        </DarkButton>
      </div>
    </div>
  )
}

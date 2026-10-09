import SquircleSurface from '../SquircleSurface/SquircleSurface.jsx'
import NanoAvatar from '../NanoAvatar/NanoAvatar.jsx'
import WalletBalance from '../WalletBalance/WalletBalance.jsx'
import { getWalletSkin } from '../../data/walletSkins.js'
import './ChildCard.css'

// Figma: Child card (2:3286) — avatar, name, status line and wallet balance.
// The white card is drawn as a 60%-smoothed squircle behind the content (SquircleSurface), not
// clipped — the avatar deliberately overhangs the card's top edge.
// The wallet strip shows the background of the skin the kid chose (Branding · Wallet Skins).
export default function ChildCard({ child, onOpen, onTopUp }) {
  return (
    <article className="child-card">
      <SquircleSurface />
      <div className="child-card__identity">
        {/* Profile cards use the transparent-background nano avatar (Branding 18:386) */}
        <NanoAvatar character={child.character} size={64} background="off" className="child-card__avatar" />

        <div className="child-card__name-block">
          <button type="button" className="child-card__name-row" onClick={onOpen}>
            <span className="child-card__name">{child.name}</span>
            <img src="/figma/caret-right.svg" width="12" height="12" alt="" />
          </button>
          <p className="child-card__status">{child.status}</p>
        </div>
      </div>

      <WalletBalance
        amount={child.balance}
        background={getWalletSkin(child.walletSkin).background}
        dimmed={child.walletDimmed}
        onTopUp={onTopUp}
      />
    </article>
  )
}

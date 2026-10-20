import { useState } from 'react'
import KidProfileHeader from '../components/KidProfileHeader/KidProfileHeader.jsx'
import KidProfileTabs from '../components/KidProfileTabs/KidProfileTabs.jsx'
import EmptyWallet from '../components/EmptyWallet/EmptyWallet.jsx'
import ApprovalsTab from '../components/ApprovalsTab/ApprovalsTab.jsx'
import { kidTabs } from '../data/manageFamily.js'
import { getWalletSkin } from '../data/walletSkins.js'
import './KidProfile.css'

// Figma: Wallet · Empty (first time) (56:42126)
export default function KidProfile({ kid, titleId, onBack }) {
  const [tab, setTab] = useState('wallet')
  // The kid's wallet skin: its background behind the header, its card in the wallet
  const skin = getWalletSkin(kid.walletSkin)

  return (
    <div className="kid-profile">
      {/* Header background — the kid's wallet-skin background (Branding · Wallet Skins, the same
          image as their wallet strip in Manage Family) */}
      <div className="kid-profile__bg" aria-hidden="true">
        <img className="kid-profile__bg-skin" src={skin.background} alt="" />
      </div>

      <KidProfileHeader kid={kid} titleId={titleId} onBack={onBack} />
      <KidProfileTabs tabs={kidTabs} selected={tab} onSelect={setTab} idPrefix={`kid-${kid.id}`} />

      {/* 56:42137 — Body */}
      <div
        className="kid-profile__body"
        role="tabpanel"
        id={`kid-${kid.id}-panel`}
        aria-labelledby={`kid-${kid.id}-tab-${tab}`}
      >
        {tab === 'wallet' && <EmptyWallet kidName={kid.firstName} skin={skin} />}
        {tab === 'approvals' && <ApprovalsTab kid={kid} />}
      </div>
    </div>
  )
}

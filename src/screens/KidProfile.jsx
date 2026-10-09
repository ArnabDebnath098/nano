import { useState } from 'react'
import KidProfileHeader from '../components/KidProfileHeader/KidProfileHeader.jsx'
import KidProfileTabs from '../components/KidProfileTabs/KidProfileTabs.jsx'
import EmptyWallet from '../components/EmptyWallet/EmptyWallet.jsx'
import { kidTabs } from '../data/manageFamily.js'
import './KidProfile.css'

// Figma: Wallet · Empty (first time) (56:42126)
export default function KidProfile({ kid, titleId, onBack }) {
  const [tab, setTab] = useState('wallet')

  return (
    <div className="kid-profile">
      {/* 56:42127 — Header background */}
      <div className="kid-profile__bg" aria-hidden="true">
        <div className="kid-profile__bg-gradient" />
        <img className="kid-profile__bg-skin" src="/figma/kid-profile/skin-pattern.png" alt="" />
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
        {tab === 'wallet' && <EmptyWallet kidName={kid.firstName} />}
      </div>
    </div>
  )
}

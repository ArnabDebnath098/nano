import { useLayoutEffect, useRef, useState } from 'react'
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
  const root = useRef(null)
  useStickyStack(root)

  return (
    <div ref={root} className="kid-profile">
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

function scrollParent(el) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(node).overflowY)) return node
  }
  return null
}

// Header bar → tabs → (the tab's own sticky toolbar, e.g. Approvals' filter chips) stack at the top
// on scroll. Publishes their heights as --kid-bar-h / --kid-tabs-h for the sticky offsets, and
// clips the body at the tabs' bottom edge so the body (and anything scrolling in it) never paints
// up behind the see-through tab notch and header.
function useStickyStack(rootRef) {
  useLayoutEffect(() => {
    const root = rootRef.current
    const bar = root.querySelector('.kid-header__bar')
    const tabs = root.querySelector('.kid-tabs')
    const body = root.querySelector('.kid-profile__body')
    const scroller = scrollParent(root)
    if (!scroller) return

    // Exact (fractional) heights — the tabs scale to the width — less 1px so the body tucks under
    // the tabs, as it does at rest, instead of leaving a hairline of the header image between them
    const h = (el) => el.getBoundingClientRect().height
    const update = () => {
      const line = scroller.getBoundingClientRect().top + h(bar) + h(tabs) - 1
      const cut = Math.max(0, line - body.getBoundingClientRect().top)
      body.style.clipPath = cut > 0 ? `inset(${cut}px 0 0 0)` : ''
    }
    const measure = () => {
      root.style.setProperty('--kid-bar-h', `${h(bar)}px`)
      root.style.setProperty('--kid-tabs-h', `${h(tabs) - 1}px`)
      update()
    }

    measure()
    scroller.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(bar)
    ro.observe(tabs)
    return () => {
      scroller.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [rootRef])
}

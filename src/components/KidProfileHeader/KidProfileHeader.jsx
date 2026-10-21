import { useLayoutEffect, useRef } from 'react'
import StatusBar from '../StatusBar/StatusBar.jsx'
import GlassButton from '../GlassButton/GlassButton.jsx'
import KidAvatar from '../KidAvatar/KidAvatar.jsx'
import StickerText from '../StickerText/StickerText.jsx'
import './KidProfileHeader.css'

const A = '/figma/kid-profile'

// Figma: Kid profile header (94:5047), state=Expanded —
// status bar 62 + nav header 56 + profile block 148 (Figma 128 + 20px more under the name) = 266px
// On scroll the status bar + nav stay pinned (no fill of their own — the page's header image stays
// put behind them), the avatar shrinks and fades away under them, and the name scrolls up,
// shrinking, until it pins centred between the buttons.
export default function KidProfileHeader({ kid, titleId, showStatusBar = true, onBack, onMenu }) {
  const barRef = useRef(null)
  const navRef = useRef(null)
  const nameRef = useRef(null)
  const profileRef = useRef(null)
  usePinnedTitle(barRef, navRef, nameRef, profileRef)

  return (
    <div className={`kid-header ${showStatusBar ? '' : 'kid-header--native'}`}>
      <div ref={barRef} className="kid-header__bar">
        {showStatusBar && <StatusBar />}

        <nav ref={navRef} className="kid-header__nav">
          <GlassButton icon={`${A}/back-icon.svg`} ariaLabel="Back" onClick={onBack} />
          <GlassButton icon={`${A}/menu-icon.svg`} ariaLabel="More options" onClick={onMenu} />
        </nav>
      </div>

      <div ref={profileRef} className="kid-header__profile">
        <KidAvatar character={kid.character} />

        <div className="kid-header__identity">
          <h1 ref={nameRef} id={titleId} className="kid-header__name">
            <StickerText ring="sm">{kid.name}</StickerText>
          </h1>
          {kid.stats?.length > 0 && (
            <p data-kid-stats className="kid-header__stats">
              {kid.stats.map((stat, i) => (
                <span key={stat} className="kid-header__stat">
                  {i > 0 && <img src={`${A}/stat-dot.svg`} width="4" height="4" alt="" />}
                  {stat}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

const PINNED_SCALE = 18 / 32 // 32px name → 18px title in the nav
const SHRINK_RANGE = 64 // px of scroll over which it shrinks, ending as it reaches the nav
const AVATAR_END_SCALE = 0.6 // the avatar shrinks to this as it fades out under the bar

function scrollParent(el) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (/auto|scroll/.test(getComputedStyle(node).overflowY)) return node
  }
  return null
}

function usePinnedTitle(barRef, navRef, nameRef, profileRef) {
  useLayoutEffect(() => {
    const bar = barRef.current
    const nav = navRef.current
    const name = nameRef.current
    const avatar = profileRef.current.firstElementChild
    const stats = profileRef.current.querySelector('[data-kid-stats]')
    const scroller = scrollParent(name)
    if (!scroller) return

    // Scroll distance at which the name's centre meets the nav's centre (measured untransformed),
    // and at which the avatar's bottom has scrolled up to the bar's bottom
    let pinAt = 0
    let avatarGoneAt = 1
    const measure = () => {
      name.style.transform = ''
      avatar.style.transform = ''
      const top = scroller.getBoundingClientRect().top
      const n = name.getBoundingClientRect()
      const v = nav.getBoundingClientRect()
      pinAt = n.top + n.height / 2 - top + scroller.scrollTop - (v.top + v.height / 2 - top)
      avatarGoneAt = Math.max(1, avatar.getBoundingClientRect().bottom + scroller.scrollTop - bar.getBoundingClientRect().bottom)
      update()
    }
    const update = () => {
      const y = scroller.scrollTop
      const shift = Math.max(0, y - pinAt)
      const p = Math.min(1, Math.max(0, (y - (pinAt - SHRINK_RANGE)) / SHRINK_RANGE))
      const scale = 1 - p * (1 - PINNED_SCALE)
      name.style.transform = y > 0 ? `translateY(${shift}px) scale(${scale})` : ''
      // The avatar shrinks and fades out by the time it's slid under the bar; the stats line fades
      // as the name shrinks over it
      const gone = Math.min(1, y / avatarGoneAt)
      avatar.style.opacity = 1 - gone
      avatar.style.transform = gone > 0 ? `scale(${1 - gone * (1 - AVATAR_END_SCALE)})` : ''
      if (stats) stats.style.opacity = 1 - p
    }

    measure()
    scroller.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(measure)
    ro.observe(scroller)
    return () => {
      scroller.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [barRef, navRef, nameRef, profileRef])
}

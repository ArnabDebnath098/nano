import StatusBar from '../StatusBar/StatusBar.jsx'
import GlassButton from '../GlassButton/GlassButton.jsx'
import KidAvatar from '../KidAvatar/KidAvatar.jsx'
import StickerText from '../StickerText/StickerText.jsx'
import './KidProfileHeader.css'

const A = '/figma/kid-profile'

// Figma: Kid profile header (94:5047), state=Expanded —
// status bar 62 + nav header 56 + profile block 128 = 246px
export default function KidProfileHeader({ kid, titleId, showStatusBar = true, onBack, onMenu }) {
  return (
    <div className={`kid-header ${showStatusBar ? '' : 'kid-header--native'}`}>
      {showStatusBar && <StatusBar />}

      <nav className="kid-header__nav">
        <GlassButton icon={`${A}/back-icon.svg`} ariaLabel="Back" onClick={onBack} />
        <GlassButton icon={`${A}/menu-icon.svg`} ariaLabel="More options" onClick={onMenu} />
      </nav>

      <div className="kid-header__profile">
        <KidAvatar character={kid.character} />

        <div className="kid-header__identity">
          <h1 id={titleId} className="kid-header__name">
            <StickerText ring="sm">{kid.name}</StickerText>
          </h1>
          {kid.stats?.length > 0 && (
            <p className="kid-header__stats">
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

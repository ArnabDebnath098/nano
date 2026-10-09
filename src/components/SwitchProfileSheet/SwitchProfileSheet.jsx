import { Fragment } from 'react'
import BottomSheet from '../BottomSheet/BottomSheet.jsx'
import ProfileRow from '../ProfileRow/ProfileRow.jsx'
import SquircleSurface from '../SquircleSurface/SquircleSurface.jsx'
import './SwitchProfileSheet.css'

const A = '/figma/switch-profile'

// Figma: Sheet "Background" (2:5472) — gradient + decorative layers, each kept separate
function SheetBackground() {
  return (
    <div className="sp-bg" aria-hidden="true">
      {/* 2:5473 — illustration */}
      <div className="sp-bg__illustration">
        <img className="sp-bg__bleed" src={`${A}/sheet-illustration.svg`} width="538.825" height="565.294" alt="" />
      </div>

      {/* 2:5523 — rotated swoosh */}
      <div className="sp-bg__swoosh">
        <div className="sp-bg__swoosh-rotate">
          <div className="sp-bg__swoosh-box">
            <img className="sp-bg__bleed" src={`${A}/bg-vector.svg`} width="260.673" height="541.568" alt="" />
          </div>
        </div>
      </div>

      {/* 2:5524 / 2:5525 — glows */}
      <div className="sp-bg__glow-lg">
        <img className="sp-bg__bleed" src={`${A}/bg-vector-1.svg`} width="567.769" height="510.557" alt="" />
      </div>
      <div className="sp-bg__glow-sm">
        <img className="sp-bg__bleed" src={`${A}/bg-vector-2.svg`} width="353.602" height="307.345" alt="" />
      </div>

      {/* 2:5526 — blurred image */}
      <div className="sp-bg__blur-image">
        <div className="sp-bg__blur-image-flip">
          <div className="sp-bg__blur-image-box">
            <img src="/figma/bg-image-blur.png" alt="" />
          </div>
        </div>
      </div>

      {/* 2:5527 — small blurred image */}
      <div className="sp-bg__small-image">
        <div className="sp-bg__small-image-rotate">
          <img src="/figma/bg-image-small.png" alt="" />
        </div>
      </div>

      {/* 2:5528 – 2:5531 — sparkles */}
      <div className="sp-bg__sparkle sp-bg__sparkle--3">
        <img className="sp-bg__bleed sp-bg__sparkle-bleed" src={`${A}/sparkle-3.svg`} width="10.4693" height="10.468" alt="" />
      </div>
      <div className="sp-bg__sparkle sp-bg__sparkle--4">
        <img className="sp-bg__bleed sp-bg__sparkle-bleed" src={`${A}/sparkle-4.svg`} width="36.4771" height="36.4726" alt="" />
      </div>
      <div className="sp-bg__sparkle sp-bg__sparkle--5">
        <img src="/figma/sparkle-5.svg" width="1.67387" height="1.67338" alt="" />
      </div>
      <div className="sp-bg__sparkle sp-bg__sparkle--6">
        <img src="/figma/sparkle-6.svg" width="1.91467" height="1.91411" alt="" />
      </div>
    </div>
  )
}

// Figma: Switch profile · Pick a child (2:5334) — bottom sheet content
export default function SwitchProfileSheet({ open, onClose, profiles, onSelect }) {
  return (
    <BottomSheet open={open} onClose={onClose} labelledBy="switch-profile-title" cornerSmoothing={0.6}>
      <SheetBackground />

      {/* Switch profile · stack (2:5532) — also a drag handle */}
      <div className="sp-header" data-sheet-drag>
        <h2 id="switch-profile-title" className="sp-header__title">
          Switch profile
        </h2>
        <p className="sp-header__subtitle">Switch to manage their account</p>
      </div>

      {/* Kiaan Khalid · row (2:5535) */}
      <div className="sp-list-wrap">
        <div className="sp-list">
          <SquircleSurface />
          {profiles.map((profile, i) => (
            <Fragment key={profile.id}>
              {i > 0 && (
                <img className="sp-list__divider" src={`${A}/divider-dashed.svg`} width="351" height="1" alt="" />
              )}
              <ProfileRow profile={profile} onSelect={onSelect} />
            </Fragment>
          ))}
        </div>
      </div>
    </BottomSheet>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { gsap, useGSAP } from '../../../lib/gsap.js'
import { FADE, MOVE, POP_FROM, SETTLE, STAGGER, prefersReducedMotion } from '../../../lib/motion.js'
import { useAddKid } from '../AddKidContext.js'
import { haptic } from '../../../lib/haptics.js'
import { usePress } from '../../../lib/usePress.js'
import StatusBar from '../../../components/StatusBar/StatusBar.jsx'
import ActionBar from '../../../components/AddKid/ActionBar.jsx'
import NanoButton from '../../../components/AddKid/NanoButton.jsx'
import { INVITE_TTL_DAYS, makeInvite } from '../../../data/addKid.js'
import InviteQRCode from './address/InviteQRCode.jsx'
import { useGyroTilt } from './address/useGyroTilt.js'
import '../../../components/AddKid/OnboardingHero.css' // shared sticker title
import '../../../components/AddKid/AddKidHeader.css' // shared close button
import StickerText from '../../../components/StickerText/StickerText.jsx'
import './InviteQR.css'

const ASSETS = '/figma/add-kid/invite'
const COPIED_MS = 1800
const SENT_HOLD_MS = 900 // "Invite sent" reads before the flow hands over to Manage Family

// Figma: Invite · Share QR (18:16204) — full screen with its own BG (900:47847, Figma's render),
// a plain top bar (✕ only — no progress), "Share Invite" (H40 gradient with the white sticker
// outline, like every step title) + subtitle, the holographic card with a real QR
// for a single-use link (valid for 7 days) and the child's name, then "OR" + the link field
// (tap to copy) and "Share invite". Share invite opens the share sheet (or copies the link when
// the Web Share API isn't available), then takes the parent to Manage Family: after a beat on
// "Invite sent" / "Link copied" if it went out, straight away if the sheet was dismissed. No
// Done button. ✕ also exits straight away — the child is already created, so there is nothing
// to discard and no close confirmation.
//
// Motion: on arrival the title settles up 8px (blur 4 → 0, no overshoot), the card lifts and
// settles from .96 with the sparkles popping after it. Then the gyro (useGyroTilt) leans the card
// in 3D with the phone, slides a holo sheen across it and drifts the sparkles for parallax; the QR then reveals behind a scan line (≤ 600ms,
// see InviteQRCode). Copy success morphs the field label "invite.noon.com/…" → "Link copied"
// (and the copy glyph → a check) through a 2px blur on PP Fade; Share runs the same morph on its
// own label — "Invite sent" once the share sheet completes, or "Link copied" when the Web Share
// API isn't available. Reduced motion: fades only.
export default function InviteQR() {
  const { data, exit, complete, requestClose } = useAddKid()
  const root = useRef(null)
  const name = data.firstName?.trim() || 'Kiaan'
  const invite = useMemo(() => makeInvite(name), [name])
  const [copied, setCopied] = useState(null) // 'field' | 'share' | 'shared' | null
  const timer = useRef(null)
  const closePress = usePress(0.94) // same press as the flow's close button

  useEffect(() => () => clearTimeout(timer.current), [])
  useGyroTilt(root, { card: '.invite__tilt', sheen: '.invite__sheen-band', sparkles: '.invite__spark-drift' })

  const finish = () => (exit ? exit() : requestClose?.())
  // On to Manage Family, where the new child now lives — after a beat on the "Invite sent" /
  // "Link copied" morph when the invite went out
  const toFamily = (hold = SENT_HOLD_MS) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => (complete ? complete() : finish()), hold)
  }

  const flash = (where) => {
    setCopied(where)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), COPIED_MS)
  }

  const copy = async (where) => {
    try {
      await navigator.clipboard.writeText(invite.url)
    } catch {
      // Clipboard can be blocked (insecure origin / permissions) — the feedback still shows
    }
    flash(where)
  }

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name}’s nano invite`,
          text: `Download the nano app and use this link to sign in. It works once and expires in ${INVITE_TTL_DAYS} days.`,
          url: invite.url,
        })
        flash('shared')
        toFamily()
      } catch {
        toFamily(0) // dismissed — still on to Manage Family
      }
      return
    }
    copy('share').then(toFamily)
  }

  // Arrival
  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.fromTo('[data-invite-in]', { autoAlpha: 0 }, { autoAlpha: 1, ...FADE })
        return
      }
      const { y, ...settle } = SETTLE
      gsap.fromTo(
        '[data-invite-text]',
        { y, autoAlpha: 0, filter: 'blur(4px)' },
        { y: 0, autoAlpha: 1, filter: 'blur(0px)', ...settle, stagger: STAGGER, clearProps: 'filter' },
      )
      gsap.fromTo('.invite__card', { y: 12, scale: 0.96 }, { y: 0, scale: 1, ...settle, delay: 0.04 })
      gsap.fromTo('.invite__card', { autoAlpha: 0 }, { autoAlpha: 1, ...FADE, delay: 0.04 })
      gsap.fromTo(
        '.invite__sparkle',
        { scale: POP_FROM, rotate: -12, autoAlpha: 0 },
        { scale: 1, rotate: 0, autoAlpha: 1, ...MOVE, stagger: STAGGER, delay: 0.22 },
      )
      gsap.fromTo('[data-invite-rise]', { y }, { y: 0, ...settle, stagger: STAGGER, delay: 0.12 })
      gsap.fromTo('[data-invite-rise]', { autoAlpha: 0 }, { autoAlpha: 1, ...FADE, stagger: STAGGER, delay: 0.12 })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="invite">
      {/* BG (900:47847) — Figma's render; its blurred rays don't survive as SVG filters */}
      <div className="invite__bg" aria-hidden="true">
        <img src={`${ASSETS}/bg-900-47847.png`} width="375" height="803" alt="" />
      </div>

      <header className="invite__top">
        <StatusBar tone="dark" />
        <div className="invite__header">
          {/* Same close button as the earlier steps (AddKidHeader) */}
          <button
            type="button"
            className="add-kid-header__close"
            aria-label="Close"
            {...closePress}
            onClick={() => {
              haptic.light()
              finish()
            }}
          >
            <img src="/figma/add-kid/cross.svg" width="20" height="20" alt="" />
          </button>
        </div>
      </header>

      <div className="invite__texts">
        <h1 className="invite__title onboarding-hero__title" data-invite-text>
          <StickerText>Share Invite</StickerText>
        </h1>
        <p className="invite__subtitle" data-invite-text>
          Download the app, then scan to get started
        </p>
      </div>

      <div className="invite__stage">
        <div className="invite__tilt">
        <div className="invite__card" data-invite-in>
          <img className="invite__card-frame" src={`${ASSETS}/card-frame.webp`} width="290" height="409.19" alt="" />
          <div className="invite__card-screen">
            <img src={`${ASSETS}/card-screen.webp`} alt="" />
          </div>
          <div className="invite__qr">
            <InviteQRCode value={invite.url} />
          </div>
          <p className="invite__name">{name}</p>
          <span className="invite__sheen" aria-hidden="true">
            <span className="invite__sheen-band" />
          </span>
        </div>
        </div>
        <span className="invite__spark-drift invite__spark-drift--left">
        <img
          className="invite__sparkle invite__sparkle--left"
          src={`${ASSETS}/sparkle-left.webp`}
          width="86.82"
          height="90.75"
          alt=""
          aria-hidden="true"
        />
        </span>
        <span className="invite__spark-drift invite__spark-drift--right">
        <img
          className="invite__sparkle invite__sparkle--right"
          src={`${ASSETS}/sparkle-right.png`}
          width="218"
          height="260"
          alt=""
          aria-hidden="true"
        />
        </span>
      </div>

      <div className="invite__footer">
        <div className="invite__link-area">
          <div className="invite__or" data-invite-rise>
            <img src={`${ASSETS}/separator.svg`} alt="" />
            <span>OR</span>
            <img src={`${ASSETS}/separator.svg`} alt="" />
          </div>
          <button
            type="button"
            className={`invite__link ${copied === 'field' ? 'is-copied' : ''}`}
            onClick={() => copy('field')}
            aria-label={`Copy invite link ${invite.display}`}
            data-invite-rise
          >
            <Morph on={copied === 'field'} off={invite.display} onLabel="Link copied" className="invite__link-text" />
            <span className="invite__link-icon" aria-hidden="true">
              <img className="invite__morph-off" src={`${ASSETS}/copy.svg`} width="14.5833" height="16.249" alt="" />
              <Check className="invite__morph-on" />
            </span>
          </button>
          <span className="visually-hidden" role="status">
            {copied === 'shared' ? 'Invite sent' : copied ? 'Invite link copied' : ''}
          </span>
        </div>

        <div data-invite-rise>
          <ActionBar layout="row">
            <NanoButton variant="primary" onClick={share}>
              <span className={`invite__share ${copied === 'share' || copied === 'shared' ? 'is-copied' : ''}`}>
                <span className="invite__share-icon" aria-hidden="true">
                  <img className="invite__morph-off" src={`${ASSETS}/upload.svg`} width="20" height="20" alt="" />
                  <Check className="invite__morph-on" light />
                </span>
                <Morph
                  on={copied === 'share' || copied === 'shared'}
                  off="Share invite"
                  onLabel={copied === 'shared' ? 'Invite sent' : 'Link copied'}
                />
              </span>
            </NanoButton>
          </ActionBar>
        </div>
      </div>
    </div>
  )
}

// Two labels in one grid cell; the swap crossfades through a 2px blur (Emil: blur masks the
// double image of a crossfade). The cell sizes to the wider label so nothing reflows.
function Morph({ on, off, onLabel, className = '' }) {
  return (
    <span className={`invite-morph ${on ? 'is-on' : ''} ${className}`}>
      <span className="invite-morph__off" aria-hidden={on}>
        {off}
      </span>
      <span className="invite-morph__on" aria-hidden={!on}>
        {onLabel}
      </span>
    </span>
  )
}

function Check({ className, light = false }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 10.5l3.2 3.2L15 6.8"
        stroke={light ? '#fff' : '#1d2539'}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

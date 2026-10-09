import './StickerText.css'

// Gradient display text over a round white sticker outline: a white copy of the text ringed
// with text-shadows (--sticker-outline / -sm), with the gradient-filled text stacked on top.
// The parent heading must be `display: grid` (both spans share its one cell) and sets the
// fill with `--sticker-fill`.
//   ring — 'lg' ≈ 8px (onboarding / invite titles) | 'sm' 3px (kid profile name)
export default function StickerText({ children, ring = 'lg' }) {
  return (
    <>
      <span className={`sticker-text__outline sticker-text__outline--${ring}`} aria-hidden="true">
        {children}
      </span>
      <span className="sticker-text__fill">{children}</span>
    </>
  )
}

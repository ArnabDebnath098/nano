import './AddressCard.css'

const ASSETS = '/figma/add-kid/address'
// M-Checkbox H24 (18:14774) — the smoothed rounded square (squircle) from Figma's checkbox
const BOX = 'M21.0337 6.22225C20.8212 4.5185 19.4812 3.17975 17.7775 2.966C13.9437 2.48725 10.0562 2.48725 6.22249 2.966C4.51874 3.1785 3.17999 4.5185 2.96624 6.22225C2.48749 10.056 2.48749 13.9435 2.96624 17.7773C3.17874 19.481 4.51874 20.8198 6.22249 21.0335C8.13874 21.2735 10.07 21.3935 12 21.3935C13.93 21.3935 15.8612 21.2735 17.7775 21.0335C19.4812 20.821 20.82 19.481 21.0337 17.7773C21.5125 13.9435 21.5125 10.056 21.0337 6.22225Z'

// Figma: Address card (69:3286) — State Default / Selected: identical layout, only colours and the
// checkbox change. Top unit (icon tile, label, distance chip, M-Checkbox H24) over a white bottom
// unit (address, dashed divider, contact + verified badge).
// The checkbox is Figma's M-Checkbox squircle (drawn in SVG so it can animate): unchecked, a white
// box with a 1px #D0D4DD outline (the same as Set rules' options); checked, filled #9B3DFF with a
// white tick (Address card · Work, 69:15479).
// Motion: the whole card is the hit target (press → scale .98). Selecting crossfades the top unit
// and border to lilac and the grey briefcase to purple on PP Fade; at the same moment the disc
// pops .9 → 1 on PP Move and, 80ms in, the tick DRAWS itself left → right (stroke-dashoffset,
// 320ms ease-out cubic) — the check is something that happens, not a swap. Unchecking is
// quicker: tick and disc fade out together (exit faster than enter).
// Reduced motion: the disc and tick just fade — no pop, no draw.
export default function AddressCard({ address, selected, onToggle }) {
  const { label, distance, lines, contact, phone, verified } = address
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      className={`address-card ${selected ? 'is-selected' : ''}`}
      onClick={onToggle}
    >
      <span className="address-card__top">
        <span className="address-card__info">
          <span className="address-card__icon" aria-hidden="true">
            <img className="address-card__glyph" src={`${ASSETS}/briefcase.svg`} width="20" height="20" alt="" />
            <img
              className="address-card__glyph address-card__glyph--on"
              src={`${ASSETS}/briefcase-selected.svg`}
              width="20"
              height="20"
              alt=""
            />
          </span>
          <span className="address-card__label">{label}</span>
          <span className="address-card__distance">{distance}</span>
        </span>
        <span className="address-card__check" aria-hidden="true">
          <svg className="address-check" width="24" height="24" viewBox="0 0 24 24">
            <path className="address-check__ring" d={BOX} />
            <path className="address-check__disc" d={BOX} />
            <path className="address-check__tick" d="M8.5 12.5l2 1.94 5-4.94" pathLength="1" />
          </svg>
        </span>
      </span>
      <span className="address-card__bottom">
        <span className="address-card__lines">{lines}</span>
        <img className="address-card__divider" src={`${ASSETS}/divider.svg`} width="319" height="1" alt="" />
        <span className="address-card__contact">
          <span>{contact}</span>
          <span>{phone}</span>
          {verified && <img src={`${ASSETS}/verified.svg`} width="14" height="14" alt="Verified" />}
        </span>
      </span>
    </button>
  )
}

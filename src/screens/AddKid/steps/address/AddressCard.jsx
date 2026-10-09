import './AddressCard.css'

const ASSETS = '/figma/add-kid/address'

// Figma: Address card (69:3286) — State Default / Selected: identical layout, only colours and the
// checkbox change. Top unit (icon tile, label, distance chip, M-Checkbox H24) over a white bottom
// unit (address, dashed divider, contact + verified badge).
// The checkbox is circular (drawn in SVG so it can animate): a 1.5px #666D85 ring → a #9B3DFF disc
// with a white tick.
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
            <circle className="address-check__ring" cx="12" cy="12" r="9.25" />
            <circle className="address-check__disc" cx="12" cy="12" r="10" />
            <path className="address-check__tick" d="M8 12.4l2.7 2.7L16.1 9.6" pathLength="1" />
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

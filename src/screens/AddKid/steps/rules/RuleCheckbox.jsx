import './RuleCheckbox.css'

const ASSETS = '/figma/add-kid/child'

// Round checkbox — the same M-Radio check as the Boy / Girl cards (20px: empty ring → filled
// purple circle with a tick). The off ring is always drawn; the checked circle crossfades in on
// PP Fade and pops 0.6 → 1 on PP Move, exactly like the gender cards; unchecking is quicker.
// Visual only — the card it sits in carries the role / state.
export default function RuleCheckbox({ checked }) {
  return (
    <span className={`rule-checkbox ${checked ? 'is-checked' : ''}`} aria-hidden="true">
      <img className="rule-checkbox__off" src={`${ASSETS}/radio-off.svg`} width="20" height="20" alt="" />
      <img className="rule-checkbox__on" src={`${ASSETS}/radio-on.svg`} width="20" height="20" alt="" />
    </span>
  )
}

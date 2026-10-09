import './RuleRadio.css'

// Figma: Radio (2:2397) — 20px, 1px ring #D0D4DD → #9B3DFF, 12px dot (same geometry as the Figma
// radio SVGs). Drawn in CSS so the dot can pop on selection:
// ring colour crossfades on PP Fade, the dot scales 0.9 → 1 on PP Move (never from 0);
// deselect shrinks back quicker, on the strong ease-out.
export default function RuleRadio({ checked }) {
  return <span className={`rule-radio ${checked ? 'is-checked' : ''}`} aria-hidden="true" />
}

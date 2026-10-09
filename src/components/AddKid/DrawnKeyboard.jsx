import './DrawnKeyboard.css'

// The iOS keyboard drawn into the prototype (noon NANO keyboard@3x / numpad@3x), shown on
// desktop only — touch devices bring up their real keyboard. Rises on PP Move (NANO --kb-ease).
export const KEYBOARD_HEIGHT = { text: 342, numpad: 318 }

export const hasDrawnKeyboard = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

export default function DrawnKeyboard({ kind }) {
  return (
    <div className="drawn-keyboard" aria-hidden="true">
      <img
        className={`drawn-keyboard__img ${kind === 'text' ? 'is-up' : ''}`}
        src="/figma/add-kid/nano/keyboard@3x.png"
        width="375"
        height="342"
        alt=""
      />
      <img
        className={`drawn-keyboard__img ${kind === 'numpad' ? 'is-up' : ''}`}
        src="/figma/add-kid/nano/numpad@3x.png"
        width="375"
        height="318"
        alt=""
      />
    </div>
  )
}

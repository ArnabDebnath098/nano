import './DrawnKeyboard.css'

// The iOS keyboard drawn into the prototype (noon NANO keyboard@3x / numpad@3x), shown on
// desktop only — touch devices bring up their real keyboard. Rises on PP Move (NANO --kb-ease).
export const KEYBOARD_HEIGHT = { text: 342, numpad: 318 }

export const hasDrawnKeyboard = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches

// The exported images have their glyphs baked in off-centre (letters, numpad 0 and delete), so
// those keys are redrawn on top with centred labels. Geometry in pt on the 375-wide image,
// measured from the @3x renders.
// `strip` is the span (and the keyboard's background colour there) wiped clean first, as the
// old glyphs spill past their keys
const ROWS = [
  { keys: 'qwertyuiop', left: 8.5, pitch: 36.4, width: 31, top: 49, strip: [2, 373, 'rgb(217 204 237)'] },
  { keys: 'asdfghjkl', left: 28.3, pitch: 36, width: 30.8, top: 105, strip: [20, 355, 'rgb(218 206 237)'] },
  { keys: 'zxcvbnm', left: 67.7, pitch: 35.1, width: 29.8, top: 161, strip: [54, 321, 'rgb(219 208 237)'] },
]
const KEY_H = 45

const pct = (v, of) => `${(v / of) * 100}%`
const box = (left, top, width, height, W, H) => ({
  left: pct(left, W),
  top: pct(top, H),
  width: pct(width, W),
  height: pct(height, H),
})

function TextKeys() {
  return ROWS.flatMap((row) => [
    <span
      key={`strip-${row.keys}`}
      className="drawn-keyboard__strip"
      style={{ ...box(row.strip[0], row.top - 1, row.strip[1] - row.strip[0], KEY_H + 2, 375, 342), background: row.strip[2] }}
    />,
    ...[...row.keys].map((k, i) => (
      <span key={k} className="drawn-keyboard__key" style={box(row.left + i * row.pitch, row.top, row.width, KEY_H, 375, 342)}>
        {k}
      </span>
    )),
  ])
}

// Numpad: 3 columns × 4 rows of 116 × 49.7 keys (the image has a hole in its "1" key, so the
// whole key area is wiped and redrawn)
const NUM_COLS = [7, 129.6, 252]
const NUM_ROWS = [24, 80, 136, 192]
const NUM_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', null, '0', 'delete']

function NumpadKeys() {
  return (
    <>
      <span className="drawn-keyboard__strip drawn-keyboard__strip--numpad" style={box(5, 22, 365, 222, 375, 318)} />
      {NUM_KEYS.map((k, i) => {
        if (!k) return null
        const style = box(NUM_COLS[i % 3], NUM_ROWS[Math.floor(i / 3)], 116, 49.7, 375, 318)
        if (k !== 'delete')
          return (
            <span key={k} className="drawn-keyboard__key drawn-keyboard__key--num" style={style}>
              {k}
            </span>
          )
        // Delete has no key cap: the glyph sits on the pad, centred in its column
        return (
          <span key={k} className="drawn-keyboard__key drawn-keyboard__key--bare" style={style}>
            <svg width="23" height="17" viewBox="0 0 23 17" fill="none" aria-hidden="true">
              <path
                d="M7.2 1h13.3A1.5 1.5 0 0 1 22 2.5v12a1.5 1.5 0 0 1-1.5 1.5H7.2a1.5 1.5 0 0 1-1.1-.5L1.4 9.5a1.5 1.5 0 0 1 0-2l4.7-6A1.5 1.5 0 0 1 7.2 1Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="m10.5 5 6 7m0-7-6 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
        )
      })}
    </>
  )
}

export default function DrawnKeyboard({ kind }) {
  return (
    <div className="drawn-keyboard" aria-hidden="true">
      <div className={`drawn-keyboard__pad ${kind === 'text' ? 'is-up' : ''}`}>
        <img src="/figma/add-kid/nano/keyboard@3x.png" width="375" height="342" alt="" />
        <TextKeys />
      </div>
      <div className={`drawn-keyboard__pad drawn-keyboard__pad--numpad ${kind === 'numpad' ? 'is-up' : ''}`}>
        <img src="/figma/add-kid/nano/numpad@3x.png" width="375" height="318" alt="" />
        <NumpadKeys />
      </div>
    </div>
  )
}

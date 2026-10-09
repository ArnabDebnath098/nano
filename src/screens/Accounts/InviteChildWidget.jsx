import { useRef } from 'react'
import NanoBannerBackground from './NanoBannerBackground.jsx'
import { useSquircleClip } from '../../lib/useSquircleClip.js'
import './InviteChildWidget.css'

// Figma: Widget (2:8276) — "Kids can now shop, save & earn" + M-NeutralButton "Invite your child".
// Every decorative layer is its own element at its exact Figma geometry (see the CSS);
// `box` is the layer's rotated bounding box, `shape` the un-rotated vector, `img` the export.
const A = '/figma/accounts/'

// Behind the copy (over NanoBannerBackground): yellow ribbon 2:8297, nano logo 2:8298, sparkle marks 2:8317/2:8318
const BACK = [
  { id: 'ribbon', src: 'widget-yellow-ribbon.svg', w: 155.544, h: 163.931 },
  { id: 'nano', src: 'widget-nano-logo.svg', w: 116.235, h: 49.2125 },
  { id: 'sparkle', src: 'widget-sparkle.svg', w: 18.6299, h: 19.0592 },
  { id: 'sparkle-line', src: 'widget-sparkle-line.svg', w: 5.01427, h: 2 },
]

// Above the copy: 3D product renders
const FRONT = [
  { id: 'disco', src: 'widget-disco-ball.png' },
  { id: 'music', src: 'widget-music-note.png' },
  { id: 'camera', src: 'widget-camera.png' },
]

function Layer({ id, src, w, h }) {
  return (
    <div className={`icw__box icw__box--${id}`}>
      <div className="icw__shape">
        <img src={A + src} width={w} height={h} alt="" />
      </div>
    </div>
  )
}

export default function InviteChildWidget({ onInviteChild }) {
  // Radius 16 with Figma's 60% corner smoothing
  const ref = useRef(null)
  useSquircleClip(ref)

  return (
    <section ref={ref} className="icw" aria-labelledby="icw-title">
      {/* Background art: nano banner · background (2:10508) replaces 2:8277's illustration group */}
      <NanoBannerBackground />

      <div className="icw__art" aria-hidden="true">
        {BACK.map((layer) => (
          <Layer key={layer.id} {...layer} />
        ))}
      </div>

      {/* Kids can now shop, · stack (2:8319) */}
      <div className="icw__copy">
        <h2 id="icw-title" className="icw__title">
          Kids can now
          <br aria-hidden="true" />
          shop, save &amp; earn
        </h2>
        {/* M-NeutralButton (2:8322) — H36 */}
        <button type="button" className="icw__button" onClick={onInviteChild}>
          Invite your child
        </button>
      </div>

      <div className="icw__art icw__art--front" aria-hidden="true">
        {FRONT.map((layer) => (
          <Layer key={layer.id} {...layer} />
        ))}
        {/* 2:8326 — clipped, rotated frame holding the blurred cup */}
        <div className="icw__box icw__box--cup-frame">
          <div className="icw__shape">
            <div className="icw__box icw__box--cup">
              <div className="icw__shape">
                <img src={A + 'widget-cup.png'} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

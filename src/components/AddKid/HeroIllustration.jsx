import Lottie from './Lottie.jsx'
import './HeroIllustration.css'

const A = '/figma/add-kid/hero'

// Figma: Onboarding illustration (60:2289), Size=Default — 235 × 125 slot.
// Each part is placed exactly as in Figma (left/top/size in the 235 × 125 box).
// `swoosh` parts sit in a box that is rotated/flipped like the Figma wrapper;
// `inset` is the img's overflow inset (top right bottom left, in %).
const STATIC = {
  child: [
    { kind: 'swoosh', src: `${A}/child-swoosh.svg`, box: [-105.53, -164.04, 445.193, 454.076], inner: [330.088, 348.145], rotate: 24.64, inset: '-0.92% -0.28% -0.41% -0.91%' },
    { src: `${A}/star.png`, rect: [136.88, 8.98, 96.768, 96.768] },
    { kind: 'mascot', src: `${A}/child-mascot.webp`, rect: [60.78, -9.01, 113.442, 108.895] },
    { src: `${A}/star.png`, rect: [16.82, 0, 43.956, 43.956] },
  ],
  email: [
    { kind: 'swoosh', src: `${A}/email-swoosh.svg`, box: [-1.07, -15.1, 241.023, 123.112], inner: [232.831, 62.051], rotate: -15.81, skew: 0.09, inset: '-4.91% -0.53% -11.58% -0.5%' },
    { src: `${A}/email-back.svg`, rect: [90.03, 23.51, 58.728, 44.188], center: 1.94 },
    { kind: 'crop', src: `${A}/email-envelope.webp`, rect: [49.67, -0.21, 139.527, 101.212], center: 1.94, crop: { h: '120.39%', w: '100.03%', left: '-0.02%' } },
    { src: `${A}/email-front.svg`, rect: [84.8, 19.58, 69.185, 52.056], center: 1.94 },
    { src: `${A}/email-badge.svg`, rect: [52.27, 27.82, 41.208, 41.208], inset: '-2.11%' },
    { src: `${A}/email-check.webp`, rect: [61.48, 39.65, 22.782, 18.304] },
    { src: `${A}/email-spark.svg`, rect: [80.18, 42.79, 26.541, 27.96], inset: '-6.52% -6.86%' },
    { src: `${A}/star.png`, rect: [126.98, -13.09, 78.293, 78.293] },
  ],
  login: [
    { kind: 'swoosh', src: `${A}/login-swoosh.svg`, box: [8.21, -23.58, 218.577, 134.811], inner: [213.152, 56.879], rotate: 22.73, flipY: true, inset: '-5.36% -0.58% -12.64% -0.54%' },
    { src: `${A}/login-at.webp`, rect: [57.32, -2.91, 112, 112], center: -4.18 },
    { src: `${A}/login-spark.svg`, rect: [126.41, -6.39, 37.485, 39.57], inset: '-7.74% -8.17%' },
    { kind: 'rotated', src: `${A}/clover.webp`, box: [145.15, 25.31, 66.138, 60.043], inner: [55.074, 36.716], rotate: 148.58, flipY: true },
    { src: `${A}/green-spark.webp`, rect: [45.07, -6.39, 46.87, 46.87] },
  ],
  rules: [
    { kind: 'swoosh', src: `${A}/rules-swoosh.svg`, box: [18.08, 3.26, 210.424, 95.817], inner: [203.559, 54.319], rotate: -12.11, inset: '-5.61% -0.61% -13.24% -0.57%' },
    { src: `${A}/rules-shield.webp`, rect: [74.36, -2.97, 89.883, 101.162], fit: 'stretch' },
    { src: `${A}/green-spark.webp`, rect: [53.75, 32.16, 60.677, 60.677] },
    { src: `${A}/rules-spark.svg`, rect: [136.06, 5.9, 46.004, 48.562], inset: '-7.49% -7.91% -7.49% -7.9%' },
  ],
  address: [
    { kind: 'swoosh', src: `${A}/login-swoosh.svg`, box: [8.21, -23.58, 218.577, 134.811], inner: [213.152, 56.879], rotate: 22.73, flipY: true, inset: '-5.36% -0.58% -12.64% -0.54%' },
    { src: `${A}/address-pin.webp`, rect: [81.77, -1.65, 71.453, 113.96] },
    { src: `${A}/address-spark.svg`, rect: [131.48, 13.02, 37.485, 39.57], inset: '-7.74% -8.17%' },
    { kind: 'rotated', src: `${A}/clover.webp`, box: [50.3, 27.4, 66.138, 60.043], inner: [55.074, 36.716], rotate: 31.42 },
    { src: `${A}/green-spark.webp`, rect: [45.07, -6.39, 46.87, 46.87] },
  ],
}

// Lottie heroes (480 × 280 comps). Placed so the last frame registers on the Figma artwork:
// left/top in the 235 × 125 slot, uniform scale from the top-left corner.
// Solved by matching the main metal layer's final transform (ENVELOPE / AT_SIGN / SHIELD,
// 50% layer scale) against the same object in the static composition above, then checked
// with difference overlays: the envelope body, @ and shield sit on the Figma ones to < 1px.
// The swoosh, sparks and badges are the Lottie's own and differ slightly from Figma.
//
// child ("Bot Asset", 910 × 390 comp, 2.5s @ 60fps): a different character from the Figma
// mascot, so it is fitted by footprint instead — on the last frame the bot body (comp
// y 50 → 272.5, centred on x 455) spans the Figma mascot's height (~109px), stands on the
// same horizon (y 98.89 in the slot, where the mascot's haze begins) and is centred.
export const LOTTIE_FIT = {
  child: { name: 'child', left: -116.29, top: -37.46, scale: 0.5076, width: 910, height: 390 },
  email: { name: 'email', left: 2.88, top: -10.55, scale: 0.4774 },
  login: { name: 'login', left: -2.72, top: -11.21, scale: 0.4992 },
  rules: { name: 'rules', left: -7.38, top: -10.78, scale: 0.5208 },
  // "Address-Pin" (480 × 280, 2.5s @ 60fps): same pin artwork as the Figma composition —
  // registered on the pin's visible bounds (comp 176,25 128×213 → slot 85.65,2.23 63.82×106.33)
  address: { name: 'address', left: -2.16, top: -10.25, scale: 0.4989 },
}

const px = (n) => `${n}px`

function Part({ part }) {
  if (part.kind === 'swoosh' || part.kind === 'rotated') {
    const [l, t, w, h] = part.box
    const [iw, ih] = part.inner
    return (
      <div className="hero-illo__box" data-hero-part={part.kind} style={{ left: px(l), top: px(t), width: px(w), height: px(h) }}>
        <div
          className="hero-illo__inner"
          style={{
            width: px(iw),
            height: px(ih),
            rotate: `${part.rotate}deg`,
            scale: part.flipY ? '1 -1' : undefined,
            transform: part.skew ? `skewX(${part.skew}deg)` : undefined,
          }}
        >
          {part.inset ? (
            <div className="hero-illo__overflow" style={{ inset: part.inset }}>
              <img src={part.src} alt="" />
            </div>
          ) : (
            <img className="hero-illo__fill" src={part.src} alt="" />
          )}
        </div>
      </div>
    )
  }

  const [l, t, w, h] = part.rect
  const style = { left: px(l), top: px(t), width: px(w), height: px(h) }
  if (part.center !== undefined) {
    // Figma centres these at calc(50% + n px) with translateX(-50%)
    style.left = `calc(50% + ${part.center}px)`
    style.translate = '-50% 0'
  }

  if (part.kind === 'mascot') {
    // Figma: rotate(180) + flipY = mirrored; the box crops the figure at the waist and a
    // progressive blur (50px at the bottom) melts the legs into a soft haze below the horizon.
    // Approximated with a sharp copy masked off at the horizon over a blurred, masked copy.
    return (
      <div className="hero-illo__part hero-illo__mascot" data-hero-part="figure" style={{ ...style, left: '50%', top: 'auto', bottom: '26.11px', translate: '-50% 0' }}>
        <div className="hero-illo__mascot-haze">
          <div className="hero-illo__mascot-crop">
            <img src={part.src} alt="" />
          </div>
        </div>
        <div className="hero-illo__mascot-crop is-sharp">
          <img src={part.src} alt="" />
        </div>
      </div>
    )
  }

  if (part.kind === 'crop') {
    return (
      <div className="hero-illo__part hero-illo__crop" data-hero-part="figure" style={style}>
        <img src={part.src} alt="" style={{ height: part.crop.h, width: part.crop.w, left: part.crop.left }} />
      </div>
    )
  }

  return (
    <div className="hero-illo__part" data-hero-part="figure" style={style}>
      {part.inset ? (
        <div className="hero-illo__overflow" style={{ inset: part.inset }}>
          <img src={part.src} alt="" />
        </div>
      ) : (
        <img className={`hero-illo__fill ${part.fit === 'stretch' ? 'is-stretch' : ''}`} src={part.src} alt="" />
      )}
    </div>
  )
}

// type: 'child' | 'email' | 'login' | 'rules' | 'address'
// mode: 'auto' uses the Lottie when the step has one, 'static' forces the Figma composition.
export default function HeroIllustration({ type, mode = 'auto', playing = true }) {
  const fit = mode === 'auto' ? LOTTIE_FIT[type] : null
  return (
    <div className="hero-illo" data-hero-illo={type}>
      {fit ? (
        <Lottie
          name={fit.name}
          playing={playing}
          className="hero-illo__lottie"
          style={{
            left: px(fit.left),
            top: px(fit.top),
            // comp size; defaults to the 480 × 280 heroes in CSS
            width: fit.width ? px(fit.width) : undefined,
            height: fit.height ? px(fit.height) : undefined,
            transform: `scale(${fit.scale})`,
          }}
        />
      ) : (
        STATIC[type]?.map((part, i) => <Part key={i} part={part} />)
      )}
    </div>
  )
}

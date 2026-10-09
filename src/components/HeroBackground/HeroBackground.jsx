import './HeroBackground.css'

// Figma: Background (2:2859) — brand gradient with decorative layers.
// Every Figma layer is kept as its own element so geometry maps 1:1.
// Also rendered inside TopBar as the collapsed bar's background.
export default function HeroBackground() {
  return (
    <div className="hero-bg" aria-hidden="true">
      <div className="hero-bg__art">
        {/* 2:2860 — rotated swoosh */}
        <div className="hero-bg__swoosh">
          <div className="hero-bg__swoosh-rotate">
            <div className="hero-bg__swoosh-box">
              <img className="hero-bg__fill hero-bg__swoosh-img" src="/figma/bg-vector.svg" width="260.673" height="541.568" alt="" />
            </div>
          </div>
        </div>

        {/* 2:2861 — glow */}
        <div className="hero-bg__glow-lg">
          <img className="hero-bg__fill" src="/figma/bg-vector-1.svg" width="567.769" height="510.557" alt="" />
        </div>

        {/* 2:2862 — glow */}
        <div className="hero-bg__glow-sm">
          <img className="hero-bg__fill" src="/figma/bg-vector-2.svg" width="353.602" height="307.345" alt="" />
        </div>

        {/* 2:2863 — illustration */}
        <div className="hero-bg__illustration">
          <img className="hero-bg__fill" src="/figma/bg-illustration.svg" width="538.825" height="565.292" alt="" />
        </div>

        {/* 2:2913 — blurred image */}
        <div className="hero-bg__blur-image">
          <div className="hero-bg__blur-image-flip">
            <div className="hero-bg__blur-image-box">
              <img src="/figma/bg-image-blur.png" alt="" />
            </div>
          </div>
        </div>

        {/* 2:2914 — small blurred image */}
        <div className="hero-bg__small-image">
          <div className="hero-bg__small-image-rotate">
            <img src="/figma/bg-image-small.png" alt="" />
          </div>
        </div>

        {/* 2:2915 – 2:2918 — sparkles */}
        <div className="hero-bg__sparkle hero-bg__sparkle--3">
          <img className="hero-bg__fill hero-bg__sparkle-bleed" src="/figma/sparkle-3.svg" width="10.4693" height="10.468" alt="" />
        </div>
        <div className="hero-bg__sparkle hero-bg__sparkle--4">
          <img className="hero-bg__fill hero-bg__sparkle-bleed" src="/figma/sparkle-4.svg" width="36.4771" height="36.4726" alt="" />
        </div>
        <div className="hero-bg__sparkle hero-bg__sparkle--5">
          <img src="/figma/sparkle-5.svg" width="1.67387" height="1.67338" alt="" />
        </div>
        <div className="hero-bg__sparkle hero-bg__sparkle--6">
          <img src="/figma/sparkle-6.svg" width="1.91467" height="1.91411" alt="" />
        </div>
      </div>
    </div>
  )
}

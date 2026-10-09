import './PoliciesBlock.css'

// Figma: Policies · block (2:8350) — links, social icons, copyright + app version
export default function PoliciesBlock() {
  return (
    <footer className="policies">
      {/* Social icons + Links (2:8351) */}
      <div className="policies__card">
        <div className="policies__row">
          <a className="policies__link" href="#policies" onClick={(e) => e.preventDefault()}>
            Policies
          </a>
          <a className="policies__link policies__link--sell" href="#sell" onClick={(e) => e.preventDefault()}>
            Sell on noon
            <span className="policies__arrow" aria-hidden="true">
              <img src="/figma/accounts/arrow-up-right.svg" width="12" height="12" alt="" />
            </span>
          </a>
        </div>

        <div className="policies__divider" aria-hidden="true">
          <img src="/figma/accounts/list-divider.png" width="328" height="1" alt="" />
        </div>

        <div className="policies__social">
          <a className="policies__social-btn" href="#social-1" aria-label="noon on social media" onClick={(e) => e.preventDefault()}>
            <img src="/figma/accounts/social-1.svg" width="40" height="40" alt="" />
          </a>
          <a className="policies__social-btn" href="#x" aria-label="noon on X" onClick={(e) => e.preventDefault()}>
            <img src="/figma/accounts/social-2-bg.svg" width="40" height="40" alt="" />
            <span className="policies__x">
              <span className="policies__x-mask">
                <img src="/figma/accounts/social-x.svg" width="14" height="12.688" alt="" />
              </span>
            </span>
          </a>
          <a className="policies__social-btn" href="#social-3" aria-label="noon on social media" onClick={(e) => e.preventDefault()}>
            <img src="/figma/accounts/social-3.svg" width="40" height="40" alt="" />
          </a>
          <a className="policies__social-btn" href="#social-4" aria-label="noon on social media" onClick={(e) => e.preventDefault()}>
            <img src="/figma/accounts/social-4.svg" width="40" height="40" alt="" />
          </a>
        </div>

        <p className="policies__rights">© 2025 noon. All Rights Reserved</p>
      </div>

      {/* Copyright info (2:8390) */}
      <div className="policies__version">
        <p>You joined the noon app in June 2022.</p>
        <p>Version 4.63.0 designed with care in every detail.</p>
      </div>
    </footer>
  )
}

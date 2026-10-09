import { Fragment } from 'react'
import './SupportList.css'

// Figma: App & Settings (2:8348, Preferences / Notifications) and Support (2:7817 via 2:8349)
const ICONS = {
  preferences: { src: '/figma/accounts/icon-preferences.svg', w: 12.9167, h: 14.5833 },
  notifications: { src: '/figma/accounts/icon-notifications.svg', w: 12.9167, h: 14.7907 },
  shield: { src: '/figma/accounts/icon-shield.svg', w: 20, h: 20 },
  'sign-out': { src: '/figma/accounts/icon-sign-out.svg', w: 13.9521, h: 14.0125 },
}

export default function SupportList({ items, variant = 'support', label, onSelect }) {
  return (
    <nav className={`support-list support-list--${variant}`} aria-label={label}>
      <ul className="support-list__list">
        {items.map((item, i) => {
          const icon = ICONS[item.icon]
          return (
            <Fragment key={item.id}>
              {i > 0 && (
                <li className="support-list__divider" aria-hidden="true">
                  <img src="/figma/accounts/list-divider.png" width="328" height="1" alt="" />
                </li>
              )}
              <li>
                <button type="button" className="support-list__item accounts-press" onClick={() => onSelect?.(item.id)}>
                  <span className="support-list__icon" aria-hidden="true">
                    <span className={`support-list__glyph support-list__glyph--${item.icon}`}>
                      <img src={icon.src} width={icon.w} height={icon.h} alt="" />
                    </span>
                  </span>
                  <span className="support-list__label">{item.label}</span>
                  {/* 14px chevron: circle + line */}
                  <span className="support-list__chevron" aria-hidden="true">
                    <img src="/figma/accounts/chevron-circle.svg" width="14" height="14" alt="" />
                    <img className="support-list__chevron-line" src={item.chevronLine} width="5" height="8.5" alt="" />
                  </span>
                </button>
              </li>
            </Fragment>
          )
        })}
      </ul>
    </nav>
  )
}

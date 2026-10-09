import { Fragment } from 'react'
import './SettingsList.css'

// Figma: App & Settings (2:8328) — Addresses, Manage Cards, Returns, Warranty claims, Language, Country
const ROWS = [
  { id: 'addresses', label: 'Addresses', icon: { name: 'address', src: '/figma/accounts/icon-address.svg', w: 20, h: 20 } },
  { id: 'cards', label: 'Manage Cards', icon: { name: 'card', src: '/figma/accounts/icon-card.svg', w: 15.7206, h: 12.312 } },
  { id: 'returns', label: 'Returns', icon: { name: 'card', src: '/figma/accounts/icon-card.svg', w: 15.7206, h: 12.312 } },
  { id: 'warranty', label: 'Warranty claims', icon: { name: 'warranty', src: '/figma/accounts/icon-warranty.svg', w: 15.1563, h: 17.2974 } },
  { id: 'language', label: 'Language', icon: { name: 'language', src: '/figma/accounts/icon-language.svg', w: 16.3405, h: 15 }, trailing: 'language' },
  { id: 'country', label: 'Country', icon: { name: 'country', src: '/figma/accounts/icon-country.svg', w: 16, h: 16 }, trailing: 'country' },
]

function Trailing({ type }) {
  if (type === 'language') {
    // Component 1 — segmented language toggle (English selected)
    return (
      <span className="settings-list__lang" aria-hidden="true">
        <span className="settings-list__lang-handle settings-list__lang-handle--on">English</span>
        <span className="settings-list__lang-handle" dir="rtl" lang="ar">
          العربية
        </span>
      </span>
    )
  }
  if (type === 'country') {
    return (
      <span className="settings-list__country" aria-hidden="true">
        <span className="settings-list__flag">
          <img src="/figma/accounts/flag-ae.svg" width="24" height="18" alt="" />
          <span className="settings-list__flag-overlay" />
        </span>
        <img src="/figma/accounts/settings-chevron.svg" width="14" height="14" alt="" />
      </span>
    )
  }
  return (
    <span className="settings-list__chevron" aria-hidden="true">
      <img src="/figma/accounts/settings-chevron.svg" width="14" height="14" alt="" />
    </span>
  )
}

export default function SettingsList({ onSelect }) {
  return (
    <nav className="settings-list" aria-label="App and settings">
      <ul className="settings-list__list">
        {ROWS.map((row, i) => (
          <Fragment key={row.id}>
            {i > 0 && (
              <li className="settings-list__divider" aria-hidden="true">
                <img src="/figma/accounts/list-divider.png" width="328" height="1" alt="" />
              </li>
            )}
            <li>
              <button type="button" className="settings-list__item accounts-press" onClick={() => onSelect?.(row.id)}>
                <span className="settings-list__lead">
                  <span className="settings-list__icon" aria-hidden="true">
                    <span className={`settings-list__glyph settings-list__glyph--${row.icon.name}`}>
                      <img src={row.icon.src} width={row.icon.w} height={row.icon.h} alt="" />
                    </span>
                  </span>
                  <span className="settings-list__label">{row.label}</span>
                </span>
                <Trailing type={row.trailing} />
              </button>
            </li>
          </Fragment>
        ))}
      </ul>
    </nav>
  )
}

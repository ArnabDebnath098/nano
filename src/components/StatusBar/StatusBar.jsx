import './StatusBar.css'

// Figma: Status bar (I38:4205) — device mock, shown in prototypes only
// tone="dark" for light backgrounds (Add a child flow)
export default function StatusBar({ time = '9:41', tone = 'light' }) {
  return (
    <div className={`status-bar status-bar--${tone}`} aria-hidden="true">
      <div className="status-bar__time">
        <span>{time}</span>
      </div>
      <div className="status-bar__levels">
        <img src="/figma/cellular.svg" width="19.2" height="12.2264" alt="" />
        <img src="/figma/wifi.svg" width="17.1417" height="12.3283" alt="" />
        <img src="/figma/battery.svg" width="27.328" height="13" alt="" />
      </div>
    </div>
  )
}

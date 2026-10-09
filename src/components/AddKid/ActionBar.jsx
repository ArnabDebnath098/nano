import './ActionBar.css'

// Figma: M-StackedActionBar (63:7394) / M-RowActionBar (63:7422) + Home bar.
// `layout="stacked"` stacks buttons (one Continue); `layout="row"` puts Back · Continue side by side.
// `top` is an optional slot above the buttons (e.g. a hint line).
export default function ActionBar({ layout = 'row', top, children, homeBar = true }) {
  return (
    <div className="action-bar">
      <div className={`action-bar__bar action-bar__bar--${layout}`}>
        {top && <div className="action-bar__top">{top}</div>}
        <div className="action-bar__buttons">{children}</div>
      </div>
      {homeBar && (
        <div className="action-bar__home" aria-hidden="true">
          <span />
        </div>
      )}
    </div>
  )
}

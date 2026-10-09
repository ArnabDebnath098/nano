import BottomSheet from '../../components/BottomSheet/BottomSheet.jsx'
import NanoButton from '../../components/AddKid/NanoButton.jsx'
import './CloseConfirm.css'

const A = '/figma/add-kid/child'

// Figma: Child details · Close confirmation (18:15149) — M-BottomSheet (18:15315) over the
// flow: toggle-card asset, H20 title, B14 body, stacked nano buttons.
// "Continue setup" closes the sheet and keeps the parent where they were; "Set up later"
// leaves the flow. Motion: the shared sheet (PP Move travel, NANO scrim curves, drag to
// dismiss); the asset and copy rise 8px + fade in a 40ms stagger once the panel lands.
// Reduced motion: the sheet fades, the contents don't move.
export default function CloseConfirm({ open, onCancel, onConfirm }) {
  return (
    <BottomSheet open={open} onClose={onCancel} labelledBy="close-confirm-title" cornerSmoothing={0.6}>
      <div className="close-confirm">
        <div className="close-confirm__asset-row">
          <div className="close-confirm__asset" aria-hidden="true">
            <div className="close-confirm__swoosh">
              <div className="close-confirm__swoosh-inner">
                <img src={`${A}/close-swoosh.svg`} alt="" />
              </div>
            </div>
            <img className="close-confirm__shadow" src={`${A}/close-shadow.svg`} alt="" />
            <img className="close-confirm__card" src={`${A}/close-card.webp`} alt="" />
            <span className="close-confirm__check-ring">
              <img src={`${A}/close-check-ring.svg`} alt="" />
            </span>
            <img className="close-confirm__check" src={`${A}/close-check.webp`} alt="" />
            <span className="close-confirm__spark">
              <img src={`${A}/close-spark.svg`} alt="" />
            </span>
            <img className="close-confirm__star" src={`${A}/close-star.png`} alt="" />
          </div>
        </div>

        <div className="close-confirm__texts">
          <h2 id="close-confirm-title" className="close-confirm__title">
            Child’s account is nearly ready.
          </h2>
          <p className="close-confirm__body">
            Only 2 more steps and then your child can get <br />
            access to noon nano and shop their way.
          </p>
        </div>

        <div className="close-confirm__actions">
          <NanoButton variant="primary" onClick={onCancel}>
            Continue setup
          </NanoButton>
          <NanoButton variant="secondary" onClick={onConfirm}>
            Set up later
          </NanoButton>
        </div>
      </div>
    </BottomSheet>
  )
}

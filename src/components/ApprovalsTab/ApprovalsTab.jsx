import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../../lib/gsap.js'
import { RISE, RISE_FADE, STAGGER } from '../../lib/motion.js'
import RequestCard from '../RequestCard/RequestCard.jsx'
import { navigate } from '../../lib/router.js'
import { kidRequests, requestFilters } from '../../data/manageFamily.js'
import './ApprovalsTab.css'

// Figma: Approvals · Request list (56:32549) — kid profile Approvals tab. A row of filter chips
// (All · Active · Completed · Not now; M-NeutralRoundButton, the selected one lilac) over the
// kid's requests as Request Cards with their status pill (Approved / Added to cart / Not now)
// and the soft speech bubble; done requests show a grey price.
// Motion: picking a chip re-lists the cards with the NANO home rise (10px, staggered 40ms);
// the chip's fill and border crossfade on PP Fade. Reduced motion: cards just appear.
export default function ApprovalsTab({ kid }) {
  const root = useRef(null)
  const [filter, setFilter] = useState('all')
  const match = requestFilters.find((f) => f.id === filter)?.match ?? (() => true)
  const requests = kidRequests
    .filter(match)
    .map((r) => ({ ...r, childName: kid.firstName, character: kid.character }))

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const { y, ...rise } = RISE
        gsap.from('[data-request]', { y, ...rise, stagger: STAGGER })
        gsap.from('[data-request]', { autoAlpha: 0, ...RISE_FADE, stagger: STAGGER })
      })
    },
    { scope: root, dependencies: [filter] },
  )

  return (
    <div ref={root} className="approvals-tab">
      <div className="approvals-tab__filters" role="radiogroup" aria-label="Filter requests">
        {requestFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            role="radio"
            aria-checked={filter === f.id}
            className={`approvals-chip ${filter === f.id ? 'is-selected' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="approvals-tab__list">
        {requests.map((r) => (
          <div key={r.id} data-request>
            <RequestCard request={r} onOpen={() => navigate(`/request/${r.id}?kid=${kid.id}`)} />
          </div>
        ))}
        {requests.length === 0 && <p className="approvals-tab__empty">No requests here yet</p>}
      </div>
    </div>
  )
}

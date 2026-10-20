import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../lib/gsap.js'
import { RISE, RISE_FADE, STAGGER } from '../lib/motion.js'
import TopBar from '../components/TopBar/TopBar.jsx'
import HeroBackground from '../components/HeroBackground/HeroBackground.jsx'
import Greeting from '../components/Greeting/Greeting.jsx'
import ChildCard from '../components/ChildCard/ChildCard.jsx'
import ApprovalRequests from '../components/ApprovalRequests/ApprovalRequests.jsx'
import ActiveTasks from '../components/ActiveTasks/ActiveTasks.jsx'
import SwitchProfileSheet from '../components/SwitchProfileSheet/SwitchProfileSheet.jsx'
import { parent, children, approvalRequests, tasks, profiles } from '../data/manageFamily.js'
import './ManageFamily.css'

// Figma: Manage Family · Tasks added (2:2858)
export default function ManageFamily({ onBack, onOpenKid, onAddKid, focus }) {
  const root = useRef(null)
  const [switchOpen, setSwitchOpen] = useState(false)
  const closeSwitch = useCallback(() => setSwitchOpen(false), [])

  // Entrance (noon NANO homeBuild rise): 10px on iOS ease-out 560ms + 280ms fade, 40ms stagger
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const { y, ...rise } = RISE
        gsap.from('[data-enter]', { y, ...rise, stagger: STAGGER })
        gsap.from('[data-enter]', { autoAlpha: 0, ...RISE_FADE, stagger: STAGGER })
      })

      // Collapse: the greeting fades out before it slides under the top bar
      gsap.to('.greeting', {
        autoAlpha: 0,
        y: -8,
        ease: 'none',
        scrollTrigger: { start: 0, end: 56, scrub: true },
      })
    },
    { scope: root },
  )

  // ?focus=approvals (Approval request flow from the flow list) → bring the requests into view
  useEffect(() => {
    if (focus !== 'approvals') return
    const t = setTimeout(() => {
      root.current?.querySelector('.approval-requests')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 400)
    return () => clearTimeout(t)
  }, [focus])

  return (
    <div ref={root} className="manage-family">
      <HeroBackground />
      <TopBar onBack={onBack} onSwitchProfile={() => setSwitchOpen(true)} onAddKid={onAddKid} />

      <main className="manage-family__content">
        {/* Hi, Anmol · stack (2:2945) */}
        <section className="manage-family__hero" aria-label="Your family">
          <div data-enter>
            <Greeting name={parent.name} subtitle={parent.subtitle} />
          </div>

          {/* Kiaan Khalid · row (2:2950) — horizontally scrollable */}
          <div className="manage-family__children" data-enter>
            {children.map((child) => (
              <ChildCard key={child.id} child={child} onOpen={() => onOpenKid?.({ id: child.profileId })} />
            ))}
          </div>
        </section>

        {/* Body (2:2919) */}
        <div className="manage-family__body">
          <div data-enter>
            <ApprovalRequests requests={approvalRequests} />
          </div>
          <div data-enter>
            <ActiveTasks tasks={tasks} />
          </div>
        </div>
      </main>

      <SwitchProfileSheet
        open={switchOpen}
        onClose={closeSwitch}
        profiles={profiles}
        onSelect={(profile) => {
          closeSwitch()
          onOpenKid?.(profile)
        }}
      />
    </div>
  )
}

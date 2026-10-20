import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap.js'
import { RISE, RISE_FADE, STAGGER } from '../../lib/motion.js'
import StatusBar from '../../components/StatusBar/StatusBar.jsx'
import { navigate } from '../../lib/router.js'
import './FlowPicker.css'

// Prototype landing — pick a flow to test. Each flow opens at its entry screen; Back (or the
// "All flows" pill) returns here.
//   status 'ready' = clickable end to end · 'entry' = opens the start screen, the rest isn't built yet
const FLOWS = [
  {
    id: 'onboarding',
    title: 'Invite your child',
    steps: ['noon Accounts', 'Intro video', 'Add a kid'],
    path: '/accounts',
    status: 'ready',
  },
  {
    id: 'family',
    title: 'Manage family',
    steps: ['Kids', 'Approval requests', 'Tasks', 'Switch profile'],
    path: '/family',
    status: 'ready',
  },
  {
    id: 'add-kid',
    title: 'Add a kid',
    steps: ['Child details', 'Email', 'Login', 'Rules', 'Address', 'Invite QR'],
    path: '/add-kid',
    status: 'ready',
  },
  {
    id: 'child',
    title: 'Child details',
    steps: ['Kiaan’s profile', 'Wallet', 'Tabs'],
    path: '/kid/kiaan',
    status: 'ready',
  },
  {
    id: 'approvals',
    title: 'Approval request',
    steps: ['Request card', 'Review items', 'Approve or decline'],
    path: '/family?focus=approvals',
    status: 'entry',
  },
  {
    id: 'top-up',
    title: 'Add wallet balance',
    steps: ['Empty wallet', 'Top up amount', 'Pay'],
    path: '/kid/kiaan',
    status: 'entry',
  },
]

export default function FlowPicker() {
  const root = useRef(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const { y, ...rise } = RISE
        gsap.from('[data-enter]', { y, ...rise, stagger: STAGGER })
        gsap.from('[data-enter]', { autoAlpha: 0, ...RISE_FADE, stagger: STAGGER })
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="flow-picker">
      <StatusBar tone="dark" />

      <header className="flow-picker__header" data-enter>
        <img className="flow-picker__logo" src="/figma/flows/nano-logo.png" width="1015" height="361" alt="nano" />
        <h1 className="flow-picker__title">Pick a flow to test</h1>
      </header>

      <ol className="flow-picker__list">
        {FLOWS.map((flow, i) => (
          <li key={flow.id} data-enter>
            <button type="button" className="flow-card" onClick={() => navigate(flow.path)}>
              <span className="flow-card__index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="flow-card__text">
                <span className="flow-card__title">
                  {flow.title}
                  {flow.status === 'entry' && <span className="flow-card__tag">Entry screen only</span>}
                </span>
                <span className="flow-card__steps">{flow.steps.join(' → ')}</span>
              </span>
              <svg className="flow-card__chevron" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

// Floating pill shown inside every flow — jumps back to this landing
export function FlowsHomeButton() {
  return (
    <button type="button" className="flows-home" onClick={() => navigate('/')} aria-label="All flows">
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        <rect x="0.5" y="0.5" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
        <rect x="7" y="0.5" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
        <rect x="0.5" y="7" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
        <rect x="7" y="7" width="4.5" height="4.5" rx="1.2" fill="currentColor" />
      </svg>
      Flows
    </button>
  )
}

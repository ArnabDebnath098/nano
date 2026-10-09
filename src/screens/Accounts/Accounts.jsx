import StatusBar from '../../components/StatusBar/StatusBar.jsx'
import ProfileCard from './ProfileCard.jsx'
import UpdatesCard from './UpdatesCard.jsx'
import OrdersWishlist from './OrdersWishlist.jsx'
import CreditsRow from './CreditsRow.jsx'
import InviteChildWidget from './InviteChildWidget.jsx'
import SettingsList from './SettingsList.jsx'
import FreeDeliveryRow from './FreeDeliveryRow.jsx'
import SupportList from './SupportList.jsx'
import PoliciesBlock from './PoliciesBlock.jsx'
import './Accounts.css'

const PREFERENCES = [
  { id: 'preferences', label: 'Preferences', icon: 'preferences', chevronLine: '/figma/accounts/chevron-line.svg' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications', chevronLine: '/figma/accounts/chevron-line-alt.svg' },
]

const SUPPORT = [
  { id: 'security', label: 'Account Security', icon: 'shield', chevronLine: '/figma/accounts/chevron-line.svg' },
  { id: 'sign-out', label: 'Sign out', icon: 'sign-out', chevronLine: '/figma/accounts/chevron-line.svg' },
]

// Figma: Accounts · 1 No child · Option B (2:8167)
export default function Accounts({ onInviteChild }) {
  return (
    <div className="accounts">
      {/* Top bar (38:4094) — pinned over the scrolling stack */}
      <header className="accounts__top-bar">
        <StatusBar tone="dark" />
      </header>

      {/* A · stack (2:8170) */}
      <main className="accounts__stack">
        <ProfileCard />
        <UpdatesCard />
        <OrdersWishlist />
        <CreditsRow />
        <InviteChildWidget onInviteChild={onInviteChild} />
        <SettingsList />
        <FreeDeliveryRow />
        {/* App & Settings (2:8348) */}
        <SupportList items={PREFERENCES} variant="preferences" label="Preferences" />
        {/* Support (2:8349) */}
        <SupportList items={SUPPORT} variant="support" label="Support" />
        <PoliciesBlock />
      </main>

      {/* M-Home bar (2:8169) — device mock */}
      <div className="accounts__home-bar" aria-hidden="true">
        <span />
      </div>
    </div>
  )
}

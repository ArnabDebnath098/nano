import { useState } from 'react'
import Accounts from './screens/Accounts/Accounts.jsx'
import ManageFamily from './screens/ManageFamily.jsx'
import KidProfile from './screens/KidProfile.jsx'
import PushPage from './components/PushPage/PushPage.jsx'
import IntroVideo from './components/IntroVideo/IntroVideo.jsx'
import { ONBOARDING_CUES } from './components/IntroVideo/onboardingCues.js'
import AddKidFlow from './screens/AddKid/AddKidFlow.jsx'
import { getKid } from './data/manageFamily.js'
import { goBack, navigate, replace, useRoute } from './lib/router.js'

// Which base screen each route sits on; overlay routes (invite, add-kid) keep the current one
const BASE = { accounts: 'accounts', family: 'family', kid: 'family' }

function App() {
  const route = useRoute()
  const kid = route.name === 'kid' ? getKid(route.id) : null

  const [base, setBase] = useState(BASE[route.name] ?? 'accounts')
  if (BASE[route.name] && BASE[route.name] !== base) setBase(BASE[route.name])

  // Keep the last kid rendered while the page animates out
  const [shownKid, setShownKid] = useState(kid)
  if (kid && kid.id !== shownKid?.id) setShownKid(kid)

  return (
    <div className="app">
      {base === 'accounts' ? (
        // First screen: noon Accounts, no child yet → "Invite your child" plays the intro
        <Accounts onInviteChild={() => navigate('/invite')} />
      ) : (
        <ManageFamily onOpenKid={(profile) => navigate(`/kid/${profile.id}`)} onAddKid={() => navigate('/add-kid')} />
      )}

      <PushPage open={Boolean(kid)} labelledBy="kid-profile-title">
        {shownKid && (
          <KidProfile key={shownKid.id} kid={shownKid} titleId="kid-profile-title" onBack={() => goBack('/family')} />
        )}
      </PushPage>

      {/* From the intro the flow is revealed in place under the dissolving video (no slide-up) */}
      <PushPage open={route.name === 'add-kid'} from="bottom" enter={route.intro ? 'none' : 'slide'} labelledBy="add-kid-title">
        <AddKidFlow initialStep={route.step} onExit={() => goBack('/')} onComplete={() => replace('/family')} />
      </PushPage>

      {/* Parent onboarding intro → replaces itself with the Add a child flow when it ends */}
      <IntroVideo
        open={route.name === 'invite'}
        src="/video/parent-onboarding.mp4"
        cues={ONBOARDING_CUES}
        onDone={() => replace('/add-kid?intro=1')}
      />
    </div>
  )
}

export default App

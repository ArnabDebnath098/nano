import { useState } from 'react'
import FlowPicker, { FlowsHomeButton } from './screens/FlowPicker/FlowPicker.jsx'
import Accounts from './screens/Accounts/Accounts.jsx'
import ManageFamily from './screens/ManageFamily.jsx'
import KidProfile from './screens/KidProfile.jsx'
import PushPage from './components/PushPage/PushPage.jsx'
import IntroVideo from './components/IntroVideo/IntroVideo.jsx'
import { ONBOARDING_CUES } from './components/IntroVideo/onboardingCues.js'
import AddKidFlow from './screens/AddKid/AddKidFlow.jsx'
import RequestDetail from './screens/RequestDetail/RequestDetail.jsx'
import ButtonLab from './screens/ButtonLab.jsx'
import { getKid, getRequest } from './data/manageFamily.js'
import { goBack, navigate, replace, useRoute } from './lib/router.js'

// Which base screen each route sits on; overlay routes (invite, add-kid, button-lab) keep the current one
const BASE = { flows: 'flows', accounts: 'accounts', family: 'family', kid: 'family', request: 'family' }

function App() {
  const route = useRoute()
  // A request opened from a kid's profile keeps that profile open underneath it
  const kidId = route.name === 'kid' ? route.id : route.name === 'request' ? route.kid : null
  const kid = kidId ? getKid(kidId) : null
  const request = route.name === 'request' ? getRequest(route.id, route.kid) : null

  const [base, setBase] = useState(BASE[route.name] ?? 'flows')
  if (BASE[route.name] && BASE[route.name] !== base) setBase(BASE[route.name])

  // Keep the last kid rendered while the page animates out
  const [shownKid, setShownKid] = useState(kid)
  if (kid && kid.id !== shownKid?.id) setShownKid(kid)
  const [shownRequest, setShownRequest] = useState(request)
  if (request && request.id !== shownRequest?.id) setShownRequest(request)

  return (
    <div className="app">
      {base === 'flows' ? (
        // Prototype landing — pick a flow to test
        <FlowPicker />
      ) : base === 'accounts' ? (
        // First screen: noon Accounts, no child yet → "Invite your child" plays the intro
        <Accounts onInviteChild={() => navigate('/invite')} />
      ) : (
        <ManageFamily
          onBack={() => goBack('/')} // back to where it was opened from (Accounts or the flow list)
          focus={route.name === 'family' ? route.focus : null}
          onOpenKid={(profile) => navigate(`/kid/${profile.id}`)}
          onAddKid={() => navigate('/add-kid')}
        />
      )}

      <PushPage open={Boolean(kid)} labelledBy="kid-profile-title">
        {shownKid && (
          <KidProfile key={shownKid.id} kid={shownKid} titleId="kid-profile-title" onBack={() => goBack('/family')} />
        )}
      </PushPage>

      <PushPage open={Boolean(request)} labelledBy="request-detail-title">
        {shownRequest && (
          <RequestDetail
            key={shownRequest.id}
            request={shownRequest}
            titleId="request-detail-title"
            onBack={() => goBack(route.kid ? `/kid/${route.kid}` : '/family')}
            // Prototype: either answer just closes the request
            onDecline={() => goBack(route.kid ? `/kid/${route.kid}` : '/family')}
            onApprove={() => goBack(route.kid ? `/kid/${route.kid}` : '/family')}
          />
        )}
      </PushPage>

      {/* From the intro the flow is revealed in place under the dissolving video (no slide-up) */}
      <PushPage open={route.name === 'add-kid'} from="bottom" enter={route.intro ? 'none' : 'slide'} labelledBy="add-kid-title">
        <AddKidFlow initialStep={route.step} onExit={() => goBack('/')} onComplete={() => replace('/family')} />
      </PushPage>

      {/* Button lab — try the nano button's loading state */}
      <PushPage open={route.name === 'button-lab'} labelledBy="button-lab-title">
        <ButtonLab titleId="button-lab-title" onBack={() => goBack('/')} />
      </PushPage>

      {/* Parent onboarding intro → replaces itself with the Add a child flow when it ends */}
      <IntroVideo
        open={route.name === 'invite'}
        src="/video/parent-onboarding.mp4"
        cues={ONBOARDING_CUES}
        onDone={() => replace('/add-kid?intro=1')}
      />

      {/* Jump back to the flow list from anywhere in a flow (hidden during the intro video, and on
          the button lab, which has its own back button) */}
      {!['flows', 'invite', 'button-lab'].includes(route.name) && <FlowsHomeButton />}
    </div>
  )
}

export default App

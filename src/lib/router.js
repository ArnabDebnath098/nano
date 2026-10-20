// Minimal hash router — keeps browser/hardware back working without a dependency.
//   #/              → { name: 'flows' }      prototype landing — pick a flow to test
//   #/accounts      → { name: 'accounts' }   noon Accounts (no child yet)
//   #/family        → { name: 'family', focus }  Manage Family home (?focus=approvals scrolls to them)
//   #/kid/:id       → { name: 'kid', id }
//   #/invite        → { name: 'invite' }     parent-onboarding intro video
//   #/add-kid       → { name: 'add-kid', step, intro }
import { useSyncExternalStore } from 'react'

function parse(hash) {
  const [path, query = ''] = hash.replace(/^#/, '').split('?')
  const [, section, id] = path.split('/')
  const params = new URLSearchParams(query)
  if (section === 'accounts') return { name: 'accounts' }
  if (section === 'family') return { name: 'family', focus: params.get('focus') }
  if (section === 'kid' && id) return { name: 'kid', id }
  if (section === 'invite') return { name: 'invite' }
  // ?step=<id> deep-links a step (prototype review / screenshots);
  // ?intro=1 = arrived from the intro video (the page is revealed under it, no slide-up)
  if (section === 'add-kid') return { name: 'add-kid', step: params.get('step'), intro: params.get('intro') === '1' }
  return { name: 'flows' }
}

const subscribe = (cb) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return parse(hash)
}

const notify = () => window.dispatchEvent(new HashChangeEvent('hashchange'))

// Push a new entry and mark it as in-app so goBack() knows it's safe to pop
export function navigate(path) {
  window.history.pushState({ inApp: true }, '', `#${path}`)
  notify()
}

// Swap the current entry (keeps its in-app marker) — e.g. intro video → Add a child, so Back
// returns to where the video was opened from rather than replaying it
export function replace(path) {
  window.history.replaceState(window.history.state, '', `#${path}`)
  notify()
}

// Pop if we got here in-app; otherwise (deep link) replace with the fallback
// rather than leaving the site
export function goBack(fallback = '/') {
  if (window.history.state?.inApp) {
    window.history.back()
  } else {
    window.history.replaceState(null, '', `#${fallback}`)
    notify()
  }
}

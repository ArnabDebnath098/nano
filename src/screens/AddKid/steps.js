import ChildDetails from './steps/ChildDetails.jsx'
import AgeReveal from './steps/AgeReveal.jsx'
import EmailId from './steps/EmailId.jsx'
import CreateLogin from './steps/CreateLogin.jsx'
import LetsGo from './steps/LetsGo.jsx'
import Education from './steps/Education.jsx'
import SetRules from './steps/SetRules.jsx'
import AddAddress from './steps/AddAddress.jsx'
import InviteQR from './steps/InviteQR.jsx'

// Figma 02 · Add a Child — flow A (18:14866) in order. `progress` drives the header (1–5).
// `fullscreen` steps take the whole screen (no background / top bar / hero / footer).
// `{name}` in copy is replaced with the child's first name (falls back to Figma's "Kiaan" when deep-linking a step).
export const STEPS = [
  {
    id: 'child',
    progress: 1,
    hero: { illustration: 'child', title: 'Child Details', subtitle: 'We’ll use these details to create their nano profile' },
    Body: ChildDetails,
  },
  { id: 'age-reveal', fullscreen: true, Body: AgeReveal },
  {
    id: 'email',
    progress: 2,
    hero: { illustration: 'email', title: 'Email ID', subtitle: 'We’ll send the login code here' },
    Body: EmailId,
  },
  {
    id: 'login',
    progress: 2,
    hero: { illustration: 'login', title: 'Create login', subtitle: 'Choose a username and password for {name}' },
    Body: CreateLogin,
  },
  // Parent education: the nano wallet intro that hands over to Set rules
  { id: 'education', fullscreen: true, Body: Education },
  {
    id: 'rules',
    progress: 3,
    hero: { illustration: 'rules', title: 'Set Rules', subtitle: 'Set up approval rules for shopping' },
    Body: SetRules,
  },
  {
    id: 'address',
    progress: 4,
    hero: { illustration: 'address', title: 'Add Address', subtitle: 'Select a saved address. {name} can add more later' },
    Body: AddAddress,
  },
  // `overlay`: the beat plays over the screen just left (Figma 18:15748 shows the chrome beneath)
  { id: 'lets-go', fullscreen: true, overlay: true, Body: LetsGo },
  { id: 'invite', progress: 5, fullscreen: true, Body: InviteQR },
]

// The linear "Continue" order. `login` is the no-email branch, reached with goTo('login');
// Continue from either email or login plays the parent-education beat, then Set rules.
// Let's go celebrates the end of setup: it plays over Add address, then the invite.
export const NEXT = {
  child: 'age-reveal',
  'age-reveal': 'email',
  email: 'education',
  login: 'education',
  education: 'rules',
  rules: 'address',
  address: 'lets-go',
  'lets-go': 'invite',
  invite: null,
}

export const INITIAL_DATA = {
  firstName: '',
  lastName: '',
  birthday: null, // 'YYYY-MM-DD'
  gender: null, // 'boy' | 'girl'
  email: '',
  emailConfirmed: false,
  username: '',
  password: '',
  loginMethod: null, // 'email' | 'username'
  rules: { mode: null, limit: '' }, // mode: 'auto' | 'manual'
  addressIds: [],
}

export const getStep = (id) => STEPS.find((s) => s.id === id)

export const fillName = (text, data) => text?.replaceAll('{name}', data.firstName?.trim() || 'Kiaan')

// Whole years between an ISO date and today
export function ageFrom(iso, today = new Date()) {
  if (!iso) return null
  const [y, m, d] = iso.split('-').map(Number)
  let age = today.getFullYear() - y
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1
  return age
}

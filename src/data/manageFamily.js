// Mock content for the "Manage Family · Tasks added" screen (Figma 2:2858)

export const parent = {
  name: 'Anmol',
  subtitle: 'manage your nano family',
}

export const children = [
  {
    id: 'kiaan-1',
    profileId: 'kiaan',
    name: 'Kiaan Khalid',
    status: 'Add Kiaan’s first wallet balance',
    balance: 0,
    character: '11-headphones', // nano avatar (src/data/avatars.js) — boy
    walletSkin: '14-purple-neon', // the skin the kid chose (src/data/walletSkins.js)
    walletDimmed: false,
  },
  {
    id: 'aisha-1',
    profileId: 'aisha',
    name: 'Aisha Khalid', // Kiaan's sister — same surname
    status: '3 active tasks',
    balance: 1200,
    character: '20-curly-hair-2', // girl
    walletSkin: '01-blue-pixel',
    walletDimmed: true,
  },
]

const request = {
  childName: 'Kiaan',
  character: '11-headphones',
  date: '16 April 26',
  itemCount: 3,
  message: 'Could I please have these? I really need them for my upcoming school trip.',
  products: ['/figma/product-1.png', '/figma/product-2.png', '/figma/product-1.png'],
  amount: 48,
  storeLogo: '/figma/supermall-logo.svg',
}

export const approvalRequests = [
  { id: 'req-1', ...request },
  { id: 'req-2', ...request, childName: 'Aisha', character: '20-curly-hair-2' },
  { id: 'req-3', ...request },
]

const task = {
  title: 'Clean up your bedroom and organise your desk',
  image: '/figma/task-image.png',
  reward: 48,
  assignee: { name: 'Kiaan', avatar: '/figma/task-profile.png' },
  dueLabel: 'due by 6 Sep',
}

export const tasks = [
  { id: 'task-1', ...task, state: 'default' },
  { id: 'task-2', ...task, state: 'marked-as-done' },
]

// Switch profile sheet (Figma 2:5466). Avatar geometry is copied from each Figma "Image" group.
const SP = '/figma/switch-profile'

export const profiles = [
  {
    id: 'kiaan',
    name: 'Kiaan Khalid',
    avatar: {
      flip: true,
      circle: `${SP}/avatar-circle-kiaan.png`,
      sprite: `${SP}/avatar-sprite-a.png`,
      mask: { src: `${SP}/avatar-mask-kiaan.svg`, x: 12.022, y: 1.222 },
      frame: { x: -6.21, y: -1.22, w: 62.235, h: 126.463 },
      layer: { w: 50.869, h: 122.187, transform: 'rotate(-174.55deg) scaleY(-1)' },
      crop: { left: '-204.87%', top: '-16.57%', width: '526.57%', height: '119.48%' },
    },
  },
  // Kiaan's sister (same surname); the switch sheet has no Figma art for her yet, so it reuses Kiaan's
  {
    id: 'aisha',
    name: 'Aisha Khalid',
    avatar: {
      flip: true,
      circle: `${SP}/avatar-circle-kiaan.png`,
      sprite: `${SP}/avatar-sprite-a.png`,
      mask: { src: `${SP}/avatar-mask-kiaan.svg`, x: 12.022, y: 1.222 },
      frame: { x: -6.21, y: -1.22, w: 62.235, h: 126.463 },
      layer: { w: 50.869, h: 122.187, transform: 'rotate(-174.55deg) scaleY(-1)' },
      crop: { left: '-204.87%', top: '-16.57%', width: '526.57%', height: '119.48%' },
    },
  },
  {
    id: 'arnab',
    name: 'Arnab Debnath',
    avatar: {
      circle: `${SP}/avatar-circle-arnab.png`,
      sprite: `${SP}/avatar-sprite-arnab.png`,
      mask: { src: `${SP}/avatar-mask-arnab.svg`, x: 6.967, y: 13.934 },
      frame: { x: -6.97, y: -13.93, w: 70.268, h: 155.608 },
      layer: { w: 70.268, h: 155.608 },
      crop: { left: '-115.3%', top: '0%', width: '442.9%', height: '100%' },
    },
  },
  {
    id: 'vishal',
    name: 'Vishal Birla',
    avatar: {
      circle: `${SP}/avatar-circle-vishal.png`,
      sprite: `${SP}/avatar-sprite-a.png`,
      mask: { src: `${SP}/avatar-mask-vishal.svg`, x: 3.23, y: 2.287 },
      frame: { x: -3.23, y: -2.29, w: 60.279, h: 135.963 },
      layer: { w: 60.279, h: 135.963 },
      crop: { left: '-297.87%', top: '-16.57%', width: '494.47%', height: '119.48%' },
    },
  },
]

// Kid profile page (Figma 56:42126). Only Kiaan has a large portrait and stats in the design;
// other kids fall back to their list avatar and show no stats line.
const KID_DETAILS = {
  kiaan: {
    portrait: '/figma/kid-profile/avatar-kiaan.png',
    stats: ['13 yrs', 'Joined Jun 17, 2026'],
  },
}

export function getKid(id) {
  const profile = profiles.find((p) => p.id === id)
  if (!profile) return null
  return { ...profile, firstName: profile.name.split(' ')[0], ...KID_DETAILS[id] }
}

// Tab widths from Figma (97:4660)
export const kidTabs = [
  { id: 'wallet', label: 'Wallet', width: 72 },
  { id: 'approvals', label: 'Approvals', width: 96 },
  { id: 'tasks', label: 'Tasks', width: 67 },
  { id: 'orders', label: 'Orders', width: 84 },
]

// Mock data for the Add a child flow (prototype only).

// Figma: Address card instances 69:15164 "Work", 69:15199 / 69:15234 "Ayush’s Dubai Place"
export const SAVED_ADDRESSES = [
  {
    id: 'work',
    label: 'Work',
    distance: '24 m',
    lines: 'Burj Khalifa, 1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
    contact: 'Ahmed Ali,',
    phone: '+971-50 789 3456',
    verified: true,
  },
  {
    id: 'ayush-1',
    label: 'Ayush’s Dubai Place',
    distance: '24 m',
    lines: 'Burj Khalifa, 1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
    contact: 'Ahmed Ali,',
    phone: '+971-50 789 3456',
    verified: true,
  },
  {
    id: 'ayush-2',
    label: 'Ayush’s Dubai Place',
    distance: '24 m',
    lines: 'Burj Khalifa, 1 Sheikh Mohammed bin Rashid Blvd, Downtown Dubai',
    contact: 'Ahmed Ali,',
    phone: '+971-50 789 3456',
    verified: true,
  },
]

// The address "Add new address" hands back in the empty state (stand-in for the address form)
export const NEW_ADDRESS = { ...SAVED_ADDRESSES[0], id: 'home', label: 'Home' }

// Prototype flag: `#/add-kid?step=address&addresses=none` shows the "No saved addresses" state
// (Figma 18:15856). Anything else shows the saved list.
export function savedAddresses() {
  const query = window.location.hash.split('?')[1] ?? ''
  return new URLSearchParams(query).get('addresses') === 'none' ? [] : SAVED_ADDRESSES
}

// Single-use invite link (valid for 7 days). The QR encodes the full URL; the field shows the
// short form from Figma (invite.noon.com/<name>).
export const INVITE_TTL_DAYS = 7

export function makeInvite(name) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
  const slug = encodeURIComponent((name || 'kid').trim().split(/\s+/)[0])
  return {
    code,
    display: `invite.noon.com/${decodeURIComponent(slug)}`,
    url: `https://invite.noon.com/${slug}?code=${code}`,
    expires: Date.now() + INVITE_TTL_DAYS * 864e5,
  }
}

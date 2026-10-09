// Wallet skins — Figma Branding · Wallet Skins (156:2). Each skin is a card design plus its
// matching background (the `wallet-bg-*` frames above the cards, 375 × 580). Whatever skin the
// kid picks, that background is what shows inside their wallet strip on the parent's side.
const BG = '/figma/wallet-skins'

export const WALLET_SKINS = [
  { id: '01-blue-pixel', name: 'Blue pixel', node: '156:27' },
  { id: '02-green-leather', name: 'Green leather', node: '156:31' },
  { id: '03-green-stitched', name: 'Green stitched', node: '156:36' },
  { id: '04-pink', name: 'Pink', node: '156:41' },
  { id: '05-red-orange', name: 'Red orange', node: '156:46' },
  { id: '06-orange', name: 'Orange', node: '156:53' },
  { id: '07-sky-blue', name: 'Sky blue', node: '156:58' },
  { id: '08-lime-glass', name: 'Lime glass', node: '156:63' },
  { id: '09-silver-stickers', name: 'Silver stickers', node: '156:67' },
  { id: '10-gold', name: 'Gold', node: '156:22' },
  { id: '11-black-stickers', name: 'Black stickers', node: '156:71' },
  { id: '12-copper', name: 'Copper', node: '156:76' },
  { id: '13-navy-leather', name: 'Navy leather', node: '156:17' },
  { id: '14-purple-neon', name: 'Purple neon', node: '156:81' },
  { id: '15-yellow', name: 'Yellow', node: '156:86' },
  { id: '16-holographic', name: 'Holographic', node: '156:91' },
].map((skin) => ({ ...skin, background: `${BG}/${skin.id}.webp` }))

const BY_ID = Object.fromEntries(WALLET_SKINS.map((s) => [s.id, s]))

// Falls back to the first skin for an unknown id
export const getWalletSkin = (id) => BY_ID[id] ?? WALLET_SKINS[0]

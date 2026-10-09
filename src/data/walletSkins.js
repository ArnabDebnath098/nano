// Wallet skins — Figma Branding · Wallet Skins (156:2). Each skin is a card design (the
// `wallet-*` rectangles, 404 × 286 — `cardNode`) plus its matching background (the `wallet-bg-*`
// frames above them, 375 × 580 — `node`). Whatever skin the kid picks, that background shows in
// their wallet strip and behind their profile header, and that card is their wallet.
// cardCrop: how Figma places the card image in its 404 × 286 frame — a crop box in % of the frame
// ({ w, h, left, top }), or 'cover' / 'fill'.
const BG = '/figma/wallet-skins'

export const WALLET_SKINS = [
  { id: '01-blue-pixel', name: 'Blue pixel', node: '156:27', cardNode: '156:16', cardCrop: { w: 102.39, h: 109.48, left: -1.2, top: -5.57 } },
  { id: '02-green-leather', name: 'Green leather', node: '156:31', cardNode: '156:15', cardCrop: { w: 103.91, h: 109, left: -1.74, top: -3.61 } },
  { id: '03-green-stitched', name: 'Green stitched', node: '156:36', cardNode: '156:14', cardCrop: 'cover' },
  { id: '04-pink', name: 'Pink', node: '156:41', cardNode: '156:13', cardCrop: 'cover' },
  { id: '05-red-orange', name: 'Red orange', node: '156:46', cardNode: '156:12', cardCrop: { w: 100.95, h: 104.48, left: -0.51, top: -1.12 } },
  { id: '06-orange', name: 'Orange', node: '156:53', cardNode: '156:11', cardCrop: 'cover' },
  { id: '07-sky-blue', name: 'Sky blue', node: '156:58', cardNode: '156:10', cardCrop: { w: 100, h: 104.87, left: 0, top: -1.05 } },
  { id: '08-lime-glass', name: 'Lime glass', node: '156:63', cardNode: '156:9', cardCrop: { w: 104.52, h: 113.69, left: -2.16, top: -6.36 } },
  { id: '09-silver-stickers', name: 'Silver stickers', node: '156:67', cardNode: '156:8', cardCrop: { w: 105.24, h: 109.28, left: -2.64, top: -4.38 } },
  { id: '10-gold', name: 'Gold', node: '156:22', cardNode: '156:7', cardCrop: { w: 100, h: 105.22, left: 0, top: 0 } },
  { id: '11-black-stickers', name: 'Black stickers', node: '156:71', cardNode: '156:6', cardCrop: { w: 100.33, h: 104.51, left: 0, top: -3.11 } },
  { id: '12-copper', name: 'Copper', node: '156:76', cardNode: '156:5', cardCrop: { w: 104.1, h: 109.35, left: -2.12, top: -4.43 } },
  { id: '13-navy-leather', name: 'Navy leather', node: '156:17', cardNode: '156:4', cardCrop: 'cover' },
  { id: '14-purple-neon', name: 'Purple neon', node: '156:81', cardNode: '156:3', cardCrop: { w: 100, h: 101.62, left: 0, top: 0 } },
  { id: '15-yellow', name: 'Yellow', node: '156:86', cardNode: '156:89', cardCrop: { w: 100, h: 100.85, left: 0, top: 0 } },
  { id: '16-holographic', name: 'Holographic', node: '156:91', cardNode: '156:90', cardCrop: 'fill' },
].map((skin) => ({ ...skin, background: `${BG}/${skin.id}.webp`, card: `${BG}/cards/${skin.id}.webp` }))

const BY_ID = Object.fromEntries(WALLET_SKINS.map((s) => [s.id, s]))

// Falls back to the first skin for an unknown id
export const getWalletSkin = (id) => BY_ID[id] ?? WALLET_SKINS[0]

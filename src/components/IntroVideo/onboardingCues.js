// Haptic cues for /video/parent-onboarding.mp4 (8.03s, 30fps). Times are the frames where
// each element lands, found by measuring per-frame motion inside each element's region:
// a peak while it travels, then a sharp drop on the frame it hits.
export const ONBOARDING_CUES = [
  { t: 0.43, kind: 'light' }, //   "noon nano" logo pops in
  { t: 1.07, kind: 'heavy' }, //   nano wallet card lands on the phone
  { t: 1.2, kind: 'selection' }, // …and settles
  { t: 2.8, kind: 'medium' }, //   "Parents approve" sticker lands
  { t: 3.07, kind: 'heavy' }, //   "Approved" stamp hits
  { t: 4.63, kind: 'medium' }, //  gift pile lands
  { t: 5.23, kind: 'heavy' }, //   task card lands
  { t: 6.6, kind: 'light' }, //    next task card settles
]

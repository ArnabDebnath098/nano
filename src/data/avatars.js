// nano character avatars — Figma Branding · Avatar (18:386). Each character image is pre-cropped
// to exactly the window Figma shows inside the circle (from the component's Background=Off insets
// at Size=112),
// so it just fills the circle at any size. `gradient` is the Background=On fill (a soft gradient
// tinted from the character's main colour).
const A = '/figma/avatars'

export const AVATARS = {
  '06-purple-puffer': { name: 'Purple puffer', image: `${A}/06-purple-puffer.webp`, gradient: ['#f0e6ff', '#c9a8ff'] },
  '18-cap-cargo': { name: 'Cap & cargo', image: `${A}/18-cap-cargo.webp`, gradient: ['#f3edff', '#d6c7ff'] },
  '11-headphones': { name: 'Headphones', image: `${A}/11-headphones.webp`, gradient: ['#f4f5f8', '#d7dbe3'] },
  '20-curly-hair-2': { name: 'Curly hair 2', image: `${A}/20-curly-hair-2.webp`, gradient: ['#ecf4e0', '#c0d89e'] },
}

export const getAvatar = (id) => AVATARS[id] ?? AVATARS['06-purple-puffer']

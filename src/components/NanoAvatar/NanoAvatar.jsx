import { getAvatar } from '../../data/avatars.js'
import './NanoAvatar.css'

// Figma: Avatar (Branding 18:386) — character cropped in a circle.
//   background="on"  — soft gradient fill + white ring (2px at 112, scaled down at small sizes)
//                       — approval cards, lists
//   background="off" — no fill and no ring: the character on whatever is behind — profile cards
export default function NanoAvatar({ character, size = 40, background = 'on', className = '' }) {
  const avatar = getAvatar(character)
  const style = { width: size, height: size }
  if (background === 'on') {
    style.borderWidth = Math.max(1, Math.round((2 * size) / 112))
    style.backgroundImage = `linear-gradient(to bottom, ${avatar.gradient[0]}, ${avatar.gradient[1]})`
  }
  return (
    <span className={`nano-avatar nano-avatar--bg-${background} ${className}`} style={style}>
      <img src={avatar.image} alt="" />
    </span>
  )
}

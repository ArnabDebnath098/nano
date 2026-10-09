// Ref-counted page scroll lock, so overlapping layers (sheet + pushed page)
// don't release each other's lock.
let locks = 0
let previous = ''

export function lockScroll() {
  if (locks === 0) {
    previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  locks += 1

  let released = false
  return () => {
    if (released) return
    released = true
    locks -= 1
    if (locks === 0) document.body.style.overflow = previous
  }
}

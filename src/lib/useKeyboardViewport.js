import { useEffect, useRef } from 'react'

// Phone keyboards and a full-height app screen. iOS Safari never shrinks the layout viewport for
// the keyboard — it pans the page so the focused field shows, carrying a pinned header off-screen
// with it (Android Chrome does the same unless the viewport meta says `resizes-content`, which
// index.html now does). So while a text field is focused, glue `el` to the visible area: its
// height follows the visual viewport and it moves with any pan. The pinned head stays at the top,
// content scrolls under it, and anything at the bottom (the footer) rides on the keyboard.
// Sets --vv-height / --vv-top on `el` (CSS: height: var(--vv-height, 100dvh); translate: 0
// var(--vv-top, 0px)) and clears them when no field is focused.
// onKeyboard(up, field) runs after each change while the keyboard is up (to keep the field in
// view) and once with up = false when it goes down.
const KEYBOARD_MIN = 120 // px of visual viewport lost before we call it a keyboard (not a toolbar)
const TEXT_ENTRY = 'input:not([readonly]):not([type=checkbox]):not([type=radio]), textarea, [contenteditable="true"]'

export function useKeyboardViewport(ref, onKeyboard) {
  const cb = useRef(onKeyboard)
  cb.current = onKeyboard

  useEffect(() => {
    const vv = window.visualViewport
    const el = ref.current
    if (!vv || !el) return
    let raf = 0
    let wasUp = false
    const sync = () => {
      raf = 0
      const field = document.activeElement
      const typing = el.contains(field) && field.matches(TEXT_ENTRY)
      if (typing) {
        el.style.setProperty('--vv-height', `${vv.height}px`)
        el.style.setProperty('--vv-top', `${vv.offsetTop}px`)
      } else {
        el.style.removeProperty('--vv-height')
        el.style.removeProperty('--vv-top')
      }
      // A keyboard is up when the visible area is well short of the layout viewport
      const up = typing && window.innerHeight - vv.height > KEYBOARD_MIN
      if (up || wasUp) cb.current?.(up, up ? field : null)
      wasUp = up
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(sync)
    }
    vv.addEventListener('resize', schedule)
    vv.addEventListener('scroll', schedule)
    el.addEventListener('focusin', schedule)
    el.addEventListener('focusout', schedule)
    return () => {
      cancelAnimationFrame(raf)
      vv.removeEventListener('resize', schedule)
      vv.removeEventListener('scroll', schedule)
      el.removeEventListener('focusin', schedule)
      el.removeEventListener('focusout', schedule)
      el.style.removeProperty('--vv-height')
      el.style.removeProperty('--vv-top')
    }
  }, [ref])
}

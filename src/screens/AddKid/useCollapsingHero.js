import { useLayoutEffect, useRef } from 'react'
import { HDR_SPRING, stepSpring } from '../../../animation-reference/noon-nano/motion.js'

// Figma: Onboarding hero Size=Default (55:1173) → Size=Compact (65:2667), "Add address · Scrolled"
// (57:2431). The head (background, top bar, hero) is pinned; as the page scrolls, the hero morphs
// from Default to Compact over exactly the height it loses, so the content stays tucked under it:
//   illustration / Lottie 235 → 145 wide (×0.617), overlap under the title −48 → −30
//   title  H40 → H24 (×0.6), line box 48 → 32
//   subtitle B14 → B13 (×0.929)
// and the Scroll fade (66:2550: eased white gradient, layer-blurred) fades in at the compact bottom.
// Motion: NANO's collapsing-header spring (HDR_SPRING — K (2π/0.34)², ζ 0.86, semi-implicit
// Euler, keeps its velocity when the direction reverses). The scroll sets a target on an
// ease-out (so the morph leads the finger — fast at the start, slow into Compact) and the
// spring chases it: quick to react, then settles with no wobble, and a fling or a wheel notch
// glides instead of jumping. Uses the individual CSS `scale` / `translate` properties so it
// composes with the GSAP step-transition tweens.
// Typing: a tap into a text field collapses the hero the same way — the page scrolls up by exactly
// the height the hero gives up, so the field stays just under the Compact head and the keyboard
// has room, instead of the browser shoving the fields up under the head. Only a tap does it, so an
// auto-focus on arrival (Email) leaves the hero alone.
// Reduced motion: snaps between Default and Compact instead of morphing.
const ILLO_SCALE = 145 / 235
const ILLO_OVERLAP_COMPACT = 30
const TITLE_SCALE = 24 / 40
const TITLE_LINE_COMPACT = 32
const SUB_SCALE = 13 / 14
const GAP = 2 // title → subtitle
const PAD_BOTTOM = 8
const P_MAX = 1.02 // NANO lets the header overshoot Compact by 2% as it settles
const TAP_TO_FOCUS_MS = 800 // a focus this soon after a pointerdown came from a tap
export const COLLAPSE_EVENT = 'hero:collapse' // dispatch on the scroller to collapse for typing ({ detail: { minTop } })
const GLIDE_MS = 320

const easeOutQuad = (t) => 1 - (1 - t) * (1 - t)

// Layout position relative to `root` (offsets ignore transforms, so tweens can't skew it)
function offsetTopWithin(el, root) {
  let y = 0
  let node = el
  while (node && node !== root) {
    y += node.offsetTop
    node = node.offsetParent
  }
  return y
}

// deps[0] is the step: a new step lands on its scroll position; any other re-run (a hero text
// change, every keystroke of the name) carries on from where the spring was
export function useCollapsingHero(scrollerRef, headRef, deps) {
  const spring = useRef({ p: 0, v: 0, step: undefined, glide: 0 })

  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    const head = headRef.current
    if (!scroller || !head) return
    const saved = spring.current // our own state object, not a DOM node
    const sameStep = saved.step === deps[0]
    saved.step = deps[0]
    let geo = null
    let raf = 0
    let p = sameStep ? saved.p : 0 // drawn progress, Default 0 → Compact 1
    let v = sameStep ? saved.v : 0 // its velocity (per second)
    let last = 0
    let els = {} // hero parts, looked up in measure() — off the per-frame path
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')

    const target = () => {
      const y = scroller.scrollTop
      if (reduced.matches) return y > 4 ? 1 : 0
      return easeOutQuad(Math.min(1, Math.max(0, y / geo.distance)))
    }

    const draw = () => {
      const { illo, title, sub, fade } = els
      if (!illo || !title) return
      const lerp = (from, to) => from + (to - from) * p
      illo.style.scale = String(lerp(1, ILLO_SCALE))
      title.style.scale = String(lerp(1, TITLE_SCALE))
      title.style.translate = `0 ${(geo.titleY * p).toFixed(2)}px`
      if (sub) {
        sub.style.scale = String(lerp(1, SUB_SCALE))
        sub.style.translate = `0 ${(geo.subY * p).toFixed(2)}px`
      }
      // Content slips under the head as soon as it moves, so the fade is at full strength within
      // the first quarter of the collapse (it sits on plain white at rest, so it can't show early)
      if (fade) fade.style.opacity = String(Math.min(1, Math.max(0, p * 4)))
    }

    // One spring frame; keeps running until the hero is at rest on the scroll's target
    const tick = (now) => {
      raf = 0
      if (!geo) return
      const to = target()
      const dt = last ? Math.min(HDR_SPRING.maxDt, (now - last) / 1000) : 1 / 60
      last = now
      ;({ x: p, v } = stepSpring(HDR_SPRING, p, v, to, dt))
      p = Math.min(P_MAX, Math.max(0, p))
      if (Math.abs(p - to) < HDR_SPRING.eps && Math.abs(v) < HDR_SPRING.vEps) {
        p = to
        v = 0
        last = 0
      } else {
        raf = requestAnimationFrame(tick)
      }
      draw()
    }

    // New geometry (step change, resize): land on the target with no animation
    const snap = () => {
      if (!geo) return
      cancelAnimationFrame(raf)
      raf = 0
      last = 0
      v = 0
      p = target()
      draw()
    }

    const measure = () => {
      els = {
        illo: head.querySelector('.onboarding-hero__illustration'),
        title: head.querySelector('.onboarding-hero__title'),
        sub: head.querySelector('.onboarding-hero__subtitle'),
        fade: head.querySelector('[data-scroll-fade]'),
      }
      const { illo, title, sub, fade } = els
      if (!illo || !title) return
      const illoTop = offsetTopWithin(illo, head)
      const illoH = illo.offsetHeight
      const titleTop = offsetTopWithin(title, head)
      const titleH = title.offsetHeight
      const subTop = sub ? offsetTopWithin(sub, head) : 0
      const subH = sub ? sub.offsetHeight : 0

      const compactTitleTop = illoTop + illoH * ILLO_SCALE - ILLO_OVERLAP_COMPACT
      const compactSubTop = compactTitleTop + TITLE_LINE_COMPACT + GAP
      const defaultBottom = (sub ? subTop + subH : titleTop + titleH) + PAD_BOTTOM
      const compactBottom = (sub ? compactSubTop + subH * SUB_SCALE : compactTitleTop + TITLE_LINE_COMPACT) + PAD_BOTTOM

      const prev = geo
      geo = {
        // scaled from the top edge; centre the shrunk title in its 32px compact line box
        titleY: compactTitleTop + (TITLE_LINE_COMPACT - titleH * TITLE_SCALE) / 2 - titleTop,
        subY: compactSubTop - subTop,
        distance: Math.max(1, defaultBottom - compactBottom),
      }
      if (fade) fade.style.top = `${compactBottom.toFixed(2)}px`
      // Land on the target only when the geometry really changed (new step, resize). A re-run on
      // the same step, or the ResizeObserver's first call, keeps springing from where it was.
      const moved = prev ? Math.abs(prev.distance - geo.distance) > 1 || Math.abs(prev.titleY - geo.titleY) > 1 : !sameStep
      if (moved || reduced.matches) return snap()
      draw()
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      if (reduced.matches) return snap()
      if (!raf) raf = requestAnimationFrame(tick)
    }

    const isTextEntry = (el) =>
      el?.matches?.('input:not([readonly]):not([type=checkbox]):not([type=radio]), textarea')
    // Scroll to `to` on our own frame loop rather than scrollTo({ behavior: 'smooth' }): the
    // browser's smooth scroll is cancelled by the caret-into-view scrolls typing makes, which left
    // the hero half-collapsed and then jumping. A finger on the page takes over. The frame id
    // lives in `saved` so a re-run (each keystroke of the name) neither stops nor doubles it.
    const glideTo = (to) => {
      cancelAnimationFrame(saved.glide)
      const from = scroller.scrollTop
      if (reduced.matches || Math.abs(to - from) < 1) {
        scroller.scrollTop = to
        return
      }
      const t0 = performance.now()
      const step = (now) => {
        const t = Math.min(1, (now - t0) / GLIDE_MS)
        scroller.scrollTop = from + (to - from) * (1 - (1 - t) ** 3) // ease-out cubic
        saved.glide = t < 1 ? requestAnimationFrame(step) : 0
      }
      saved.glide = requestAnimationFrame(step)
    }
    // Collapse the hero for typing, scrolling at least to `minTop` (the flow passes how far the
    // focused field needs to go to clear the footer above a phone keyboard)
    const collapseForTyping = (minTop = 0) => {
      if (!geo) return
      const to = Math.max(geo.distance, minTop)
      if (scroller.scrollTop >= to - 1) return
      // A short page may not scroll that far — pad its bottom until it can (kept for the step;
      // AddKidFlow clears it on the next step).
      // Re-measured after padding: a page shorter than the screen reports scrollHeight = height.
      let room = 0
      for (let i = 0; i < 3; i++) {
        const short = to - (scroller.scrollHeight - scroller.clientHeight)
        if (short <= 0) break
        room += Math.ceil(short)
        scroller.style.setProperty('--typing-room', `${room}px`)
      }
      glideTo(to)
    }
    const onCollapseEvent = (e) => collapseForTyping(e.detail?.minTop)
    // Tapping into a field (focusin right after a pointerdown), or tapping one that's already
    // focused (Email's auto-focused field — that tap is when a phone raises its keyboard; on
    // release, as a scroll started while the finger is down gets cancelled by the touch)
    let tappedAt = -Infinity
    let downOnFocused = false
    const onPointerDown = (e) => {
      tappedAt = performance.now()
      cancelAnimationFrame(saved.glide)
      saved.glide = 0
      downOnFocused = isTextEntry(e.target) && e.target === document.activeElement
    }
    const onPointerUp = () => {
      if (downOnFocused) collapseForTyping()
      downOnFocused = false
    }
    const onFocusIn = (e) => {
      // after the pointerup, so the finger lifting doesn't cancel the glide
      if (performance.now() - tappedAt <= TAP_TO_FOCUS_MS && isTextEntry(e.target))
        requestAnimationFrame(() => collapseForTyping())
    }

    measure()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    scroller.addEventListener('pointerdown', onPointerDown, { passive: true })
    scroller.addEventListener('pointerup', onPointerUp, { passive: true })
    scroller.addEventListener('focusin', onFocusIn)
    // The flow also asks once a phone keyboard has actually come up (iOS can cancel the
    // tap-time scroll while it reveals the field)
    scroller.addEventListener(COLLAPSE_EVENT, onCollapseEvent)
    const ro = new ResizeObserver(measure) // transforms don't change layout size, so no loop
    ro.observe(head)
    return () => {
      cancelAnimationFrame(raf)
      saved.p = p
      saved.v = v
      scroller.removeEventListener('scroll', onScroll)
      scroller.removeEventListener('pointerdown', onPointerDown)
      scroller.removeEventListener('pointerup', onPointerUp)
      scroller.removeEventListener('focusin', onFocusIn)
      scroller.removeEventListener(COLLAPSE_EVENT, onCollapseEvent)
      // --typing-room stays: this effect re-runs on every keystroke of the name (deps), and
      // dropping the room would clamp the scroll and spring the hero back open. The flow clears
      // it when the step changes.
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

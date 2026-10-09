import { useLayoutEffect } from 'react'
import { prefersReducedMotion } from '../../lib/motion.js'

// Figma: Onboarding hero Size=Default (55:1173) → Size=Compact (65:2667), "Add address · Scrolled"
// (57:2431). The head (background, top bar, hero) is pinned; as the page scrolls, the hero morphs
// from Default to Compact over exactly the height it loses, so the content stays tucked under it:
//   illustration / Lottie 235 → 145 wide (×0.617), overlap under the title −48 → −30
//   title  H40 → H24 (×0.6), line box 48 → 32
//   subtitle B14 → B13 (×0.929)
// and the Scroll fade (66:2550: eased white gradient, layer-blurred) fades in at the compact bottom.
// Scrubbed 1:1 with the scroll (no easing — it follows the finger). Uses the individual CSS
// `scale` / `translate` properties so it composes with the GSAP step-transition tweens.
// Reduced motion: snaps between Default and Compact instead of morphing.
const ILLO_SCALE = 145 / 235
const ILLO_OVERLAP_COMPACT = 30
const TITLE_SCALE = 24 / 40
const TITLE_LINE_COMPACT = 32
const SUB_SCALE = 13 / 14
const GAP = 2 // title → subtitle
const PAD_BOTTOM = 8

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

export function useCollapsingHero(scrollerRef, headRef, deps) {
  useLayoutEffect(() => {
    const scroller = scrollerRef.current
    const head = headRef.current
    if (!scroller || !head) return
    let geo = null
    let raf = 0

    const parts = () => ({
      illo: head.querySelector('.onboarding-hero__illustration'),
      title: head.querySelector('.onboarding-hero__title'),
      sub: head.querySelector('.onboarding-hero__subtitle'),
      fade: head.querySelector('[data-scroll-fade]'),
    })

    const apply = () => {
      raf = 0
      if (!geo) return
      const { illo, title, sub, fade } = parts()
      if (!illo || !title) return
      const y = scroller.scrollTop
      const p = prefersReducedMotion() ? (y > 4 ? 1 : 0) : Math.min(1, Math.max(0, y / geo.distance))
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
      if (fade) fade.style.opacity = String(Math.min(1, p * 4))
    }

    const measure = () => {
      const { illo, title, sub, fade } = parts()
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

      geo = {
        // scaled from the top edge; centre the shrunk title in its 32px compact line box
        titleY: compactTitleTop + (TITLE_LINE_COMPACT - titleH * TITLE_SCALE) / 2 - titleTop,
        subY: compactSubTop - subTop,
        distance: Math.max(1, defaultBottom - compactBottom),
      }
      if (fade) fade.style.top = `${compactBottom.toFixed(2)}px`
      apply()
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply)
    }

    measure()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(measure) // transforms don't change layout size, so no loop
    ro.observe(head)
    return () => {
      cancelAnimationFrame(raf)
      scroller.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

import { useRef, useState } from 'react'
import { gsap, useGSAP } from '../../lib/gsap.js'
import { FADE, MOVE, PAGE_IN, POP_FROM, STAGGER, prefersReducedMotion } from '../../lib/motion.js'
import HeroIllustration from './HeroIllustration.jsx'
import './OnboardingHero.css'

// Figma: Onboarding hero (55:1173) — illustration slot (overlapped −48 by the title),
// H40 gradient title and B14 subtitle.
//
// Motion when the step changes (Emil: one object that changes, not two swapping):
//  • the shell fades the outgoing text; the outgoing illustration stays mounted as a
//    "leaving" layer and shrinks to .9 with blur(4px) while fading on a quick 160ms PP Fade;
//  • the incoming illustration overlaps it: the layer unblurs/fades in on PP Fade, static
//    parts pop .9 → 1 on PP Move (staggered within 40ms total), the swoosh draws left → right;
//    Lottie illustrations play their own entrance (Lottie.jsx starts once its DOM has loaded);
//  • the incoming text rises as in noon NANO's page change: title 16px out of blur(6px), subtitle
//    10px 20ms later, on PP Move (540ms), the blur hiding the crossfade.
// Whole swap ≈ 600ms. Interruptible: exits tween from wherever they are, and an illustration
// that comes back mid-exit is tweened back instead of being re-created.
// Reduced motion: no scale, blur or travel — layers and text cross-fade on PP Fade.
// Outgoing illustration: quicker than the 200ms PP Fade entrance, same curve
const EXIT = { ...FADE, duration: 0.16 }

export default function OnboardingHero({ illustration, title, subtitle, children }) {
  const root = useRef(null)
  const first = useRef(true)

  // Illustration layers: the current one plus any still leaving (adjusted during render so
  // the outgoing artwork never disappears for a frame)
  const [layers, setLayers] = useState(() => [{ key: illustration, leaving: false }])
  if (layers.at(-1).key !== illustration) {
    setLayers((ls) => [
      ...ls.filter((l) => l.key !== illustration).map((l) => ({ ...l, leaving: true })),
      { key: illustration, leaving: false },
    ])
  }

  const drop = (key) => setLayers((ls) => ls.filter((l) => !(l.key === key && l.leaving)))

  // Illustration swap
  useGSAP(
    () => {
      const isFirst = first.current
      const reduced = prefersReducedMotion()
      const scope = root.current
      const current = scope.querySelector('[data-hero-layer]:not([data-leaving])')

      scope.querySelectorAll('[data-hero-layer][data-leaving]').forEach((el) => {
        if (el.dataset.exiting) return
        el.dataset.exiting = '1'
        gsap.killTweensOf(el)
        gsap.to(el, {
          autoAlpha: 0,
          ...(reduced ? {} : { scale: 0.9, filter: 'blur(4px)' }),
          ...(reduced ? FADE : EXIT),
          onComplete: () => drop(el.dataset.heroLayer),
        })
      })

      if (!current) return
      const parts = current.querySelectorAll('[data-hero-part="figure"], [data-hero-part="rotated"]')
      const swoosh = current.querySelectorAll('[data-hero-part="swoosh"]')

      // Came back while leaving: retarget from where it is
      if (current.dataset.exiting) {
        delete current.dataset.exiting
        gsap.killTweensOf([current, ...parts, ...swoosh])
        gsap.to(current, { autoAlpha: 1, scale: 1, filter: 'blur(0px)', ...FADE, clearProps: 'filter,scale' })
        gsap.to(parts, { autoAlpha: 1, scale: 1, ...FADE })
        gsap.to(swoosh, { clipPath: 'inset(0 0% 0 0)', ...FADE, clearProps: 'clipPath' })
        return
      }

      if (reduced) {
        if (!isFirst) gsap.fromTo(current, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE })
        return
      }
      const tl = gsap.timeline({ delay: isFirst ? 0.08 : 0 })
      tl.fromTo(
        current,
        { autoAlpha: 0, filter: 'blur(4px)' },
        { autoAlpha: 1, filter: 'blur(0px)', ...FADE, clearProps: 'filter' },
        0,
      )
      tl.fromTo(
        swoosh,
        { clipPath: 'inset(0 100% 0 0)' },
        { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'nano.iosOut', clearProps: 'clipPath' },
        0,
      )
      tl.fromTo(parts, { scale: POP_FROM, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, ...MOVE, stagger: { amount: STAGGER } }, 0.02)
    },
    { scope: root, dependencies: [illustration] },
  )

  // Text re-rise (the shell faded the old text out before the step committed)
  useGSAP(
    () => {
      const isFirst = first.current
      first.current = false
      if (prefersReducedMotion()) {
        gsap.fromTo('[data-hero-text]', { autoAlpha: 0 }, { autoAlpha: 1, ...FADE, clearProps: 'filter,x,y' })
        return
      }
      // NANO showInterests() fadeUp: title rises 16 out of blur(6px), subtitle 10 just after, on PP Move
      const { titleY, subY, subAt, blur } = PAGE_IN
      const at = isFirst ? 0.08 : 0
      gsap.utils.toArray('[data-hero-text]', root.current).forEach((el, i) =>
        gsap.fromTo(
          el,
          { x: 0, y: i ? subY : titleY, autoAlpha: 0, filter: `blur(${blur}px)` },
          { y: 0, autoAlpha: 1, filter: 'blur(0px)', ...MOVE, delay: at + (i ? subAt : 0), clearProps: 'filter' },
        ),
      )
    },
    { scope: root, dependencies: [illustration, title, subtitle] },
  )

  return (
    <div ref={root} className="onboarding-hero">
      <div className="onboarding-hero__illustration">
        {layers.map((l) => (
          <div
            key={l.key}
            className={`onboarding-hero__layer${l.leaving ? ' is-leaving' : ''}`}
            data-hero-layer={l.key}
            data-leaving={l.leaving || undefined}
            aria-hidden={l.leaving || undefined}
          >
            {!l.leaving && children ? children : <HeroIllustration type={l.key} />}
          </div>
        ))}
      </div>
      <div className="onboarding-hero__texts" key={title}>
        <h1 className="onboarding-hero__title" data-hero-text>
          <span className="onboarding-hero__title-outline" aria-hidden="true">
            {title}
          </span>
          <span className="onboarding-hero__title-fill">{title}</span>
        </h1>
        {subtitle && (
          <p className="onboarding-hero__subtitle" data-hero-text>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}

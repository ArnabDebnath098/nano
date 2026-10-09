import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap, useGSAP } from '../../lib/gsap.js'
import { haptic } from '../../lib/haptics.js'
import { BLEND_IN, BLEND_OUT, FADE, MOVE, PAGE_BACK_OUT, PAGE_IN, PAGE_OUT, STAGGER, prefersReducedMotion } from '../../lib/motion.js'
import OnboardingBackground from '../../components/AddKid/OnboardingBackground.jsx'
import AddKidHeader from '../../components/AddKid/AddKidHeader.jsx'
import OnboardingHero from '../../components/AddKid/OnboardingHero.jsx'
import ActionBar from '../../components/AddKid/ActionBar.jsx'
import NanoButton from '../../components/AddKid/NanoButton.jsx'
import Toast from '../../components/AddKid/Toast.jsx'
import DrawnKeyboard, { KEYBOARD_HEIGHT, hasDrawnKeyboard } from '../../components/AddKid/DrawnKeyboard.jsx'
import CloseConfirm from './CloseConfirm.jsx'
import { AddKidContext } from './AddKidContext.js'
import { useCollapsingHero } from './useCollapsingHero.js'
import { INITIAL_DATA, NEXT, fillName, getStep } from './steps.js'
import './AddKidFlow.css'

// Figma 02 · Add a Child — the flow shell. Every step screen is:
//   header  = Onboarding background + Top bar (status bar, ✕, progress) + Onboarding hero
//   body    = the step's own content (steps/*.jsx)
//   footer  = M-StackedActionBar / M-RowActionBar with nano buttons + Home bar
// The chrome persists across steps so motion stays continuous (Emil: one object that
// changes, not screens swapping):
//   • page change follows noon NANO (lib/motion.js PAGE_*): leaving forward, the hero title lifts
//     8px and the content rows shrink to .96 (220ms soft ease-in); going back, the title lifts 10
//     and the rows drop 14, last row first. Arriving, the title rises 16 out of blur(6px), then
//     each [data-rise] row rises 16 from .95 on PP Move, 40ms apart;
//   • the action bar is shared, as NANO hands its button over: buttons that persist never fade,
//     only ones the new step adds rise in 8px after the rows; the progress fill grows as you tap;
//   • full-screen beats (age reveal, education, Let's go, invite) BLEND with the chrome rather
//     than dipping through white: entering, the beat fades in from blur(8px) over the live
//     screen (hidden only once covered); leaving, the next step is mounted beneath at once and
//     the beat — still mounted on its last frame — dissolves on top (fade + blur(8px) + 1.04,
//     600ms in-out) while the step's hero and content settle in under it.
// Reduced motion: no travel or blur, PP Fade only.
export default function AddKidFlow({ onExit, initialStep }) {
  const root = useRef(null)
  const scroller = useRef(null)
  const [history, setHistory] = useState(() =>
    initialStep && initialStep !== 'child' && getStep(initialStep) ? ['child', initialStep] : ['child'],
  )
  const [data, setData] = useState(INITIAL_DATA)
  const [footer, setFooter] = useState(null)
  const [heroOverride, setHeroOverride] = useState(null)
  const [keyboard, setKeyboardState] = useState(null)
  const [toast, setToast] = useState(null)
  const [closeOpen, setCloseOpen] = useState(false)
  // A full-screen beat that is dissolving over the step that replaced it
  const [leavingFull, setLeavingFull] = useState(null)
  const head = useRef(null)
  // The progress fill starts moving on the tap, not after the outgoing step has faded
  const [pendingProgress, setPendingProgress] = useState(null)

  const id = history.at(-1)
  const step = getStep(id)
  // The chrome keeps showing the last regular step underneath a full-screen beat
  const lastChromeId = [...history].reverse().find((h) => !getStep(h).fullscreen) ?? 'child'
  const chromeStep = getStep(lastChromeId)

  const busy = useRef(false)
  // Set when a step commits; the footer settles once the new step has declared its footer
  const footerSettle = useRef(false)

  const update = useCallback((patch) => setData((d) => ({ ...d, ...(typeof patch === 'function' ? patch(d) : patch) })), [])

  const setKeyboard = useCallback((kind) => setKeyboardState(hasDrawnKeyboard() ? kind : null), [])

  // Animate the current screen out, then commit the new history
  const transition = useCallback(
    (nextHistory) => {
      if (busy.current) return
      busy.current = true
      document.activeElement?.blur?.()
      setKeyboardState(null)
      const fromFull = getStep(history.at(-1)).fullscreen
      const nextStep = getStep(nextHistory.at(-1))
      const reduced = prefersReducedMotion()
      const scope = root.current
      const back = nextHistory.length < history.length

      if (!nextStep.fullscreen) setPendingProgress(nextStep.progress)

      const commit = () => {
        setHistory(nextHistory)
        setPendingProgress(null)
        busy.current = false
      }
      // Into a full-screen beat: mount it straight away; it fades in over the live screen
      // (arrival below), so there's no dip between the two
      if (!fromFull && nextStep.fullscreen) {
        commit()
        return
      }
      // Out of a full-screen beat into a step: mount the step beneath now and keep the beat
      // on top (on its last frame) to dissolve over it
      if (fromFull && !nextStep.fullscreen) {
        haptic.light() // the beat hands over (also answers a tap-to-skip, so the tap listener stays quiet)
        setLeavingFull(history.at(-1))
        commit()
        return
      }
      if (fromFull) {
        gsap.to(scope.querySelector('[data-full-layer]:not([data-full-leaving])'), { autoAlpha: 0, ...FADE, onComplete: commit })
        return
      }
      // Step → step: the page clears (NANO showHome / backToAvatar); the action bar stays
      const body = scope.querySelector('[data-step-body]')
      const [title, ...subs] = scope.querySelectorAll('[data-hero-text]')
      if (reduced) {
        gsap.to([body, title, ...subs].filter(Boolean), { autoAlpha: 0, ...FADE, onComplete: commit })
        return
      }
      const rows = body.querySelectorAll('[data-rise]')
      const content = rows.length ? rows : body
      const tl = gsap.timeline({ onComplete: commit })
      if (back) {
        const { duration, titleDuration, ease, titleY, subY, rowY, rowStagger } = PAGE_BACK_OUT
        if (title) tl.to(title, { autoAlpha: 0, y: titleY, duration: titleDuration, ease }, 0)
        if (subs.length) tl.to(subs, { autoAlpha: 0, y: subY, duration, ease }, 0)
        tl.to(content, { autoAlpha: 0, y: rowY, duration, ease, stagger: { each: rowStagger, from: 'end' } }, 0)
      } else {
        const { duration, ease, titleY, subY, rowScale, rowStagger } = PAGE_OUT
        if (title) tl.to(title, { autoAlpha: 0, y: titleY, duration, ease }, 0)
        if (subs.length) tl.to(subs, { autoAlpha: 0, y: subY, duration, ease }, 0)
        tl.to(content, { autoAlpha: 0, scale: rowScale, duration, ease, stagger: rowStagger }, 0)
      }
    },
    [history],
  )

  const goTo = useCallback((nextId) => nextId && transition([...history, nextId]), [history, transition])
  const goNext = useCallback(() => goTo(NEXT[id]), [goTo, id])
  const goBack = useCallback(() => {
    // Skip back over full-screen beats (they're moments, not places)
    let h = history.slice(0, -1)
    while (h.length > 1 && getStep(h.at(-1)).fullscreen) h = h.slice(0, -1)
    if (h.length === 0) setCloseOpen(true)
    else transition(h)
  }, [history, transition])

  const showToast = useCallback((message) => setToast({ id: Date.now(), message }), [])
  const requestClose = useCallback(() => setCloseOpen(true), [])

  const ctx = useMemo(
    () => ({
      data,
      update,
      step: id,
      goNext,
      goBack,
      goTo,
      showToast,
      setKeyboard,
      keyboard,
      requestClose,
      exit: onExit, // finish the flow without the close confirmation (invite → Done)
      setFooter,
      setHeroOverride,
      fillName: (text) => fillName(text, data),
    }),
    [data, update, id, goNext, goBack, goTo, showToast, setKeyboard, keyboard, requestClose, onExit],
  )

  // Arrival
  useGSAP(
    () => {
      const scope = root.current
      const reduced = prefersReducedMotion()
      scroller.current.scrollTop = 0

      const chrome = scope.querySelector('[data-chrome]')
      if (step.fullscreen) {
        // A firm bump as the beat lands — kept within ~1s of the tap that opened it, the window
        // iOS Safari allows a web haptic in
        const bump = setTimeout(() => haptic.medium(), 280)
        const layer = scope.querySelector('[data-full-layer]:not([data-full-leaving])')
        // Hide the screen beneath only once the beat covers it (`overlay` beats keep it)
        const cover = () => !step.overlay && gsap.set(chrome, { autoAlpha: 0 })
        // Overlay beats build themselves in; fading/blurring the layer would also stop their
        // backdrop-filter from seeing the screen beneath
        if (step.overlay) gsap.set(layer, { autoAlpha: 1, clearProps: 'filter' })
        else if (reduced) gsap.fromTo(layer, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE, onComplete: cover })
        else
          gsap.fromTo(
            layer,
            { autoAlpha: 0, filter: 'blur(8px)' },
            { autoAlpha: 1, filter: 'blur(0px)', ...BLEND_IN, clearProps: 'filter', onComplete: cover },
          )
        return () => clearTimeout(bump)
      }

      const leaving = scope.querySelector('[data-full-leaving]')
      if (leaving) {
        // The step is already beneath; dissolve the beat over it
        gsap.set(chrome, { autoAlpha: 1 })
        const drop = () => setLeavingFull(null)
        if (reduced) gsap.to(leaving, { autoAlpha: 0, ...FADE, onComplete: drop })
        else gsap.to(leaving, { autoAlpha: 0, scale: 1.04, filter: 'blur(8px)', ...BLEND_OUT, onComplete: drop })
      } else {
        gsap.to(chrome, { autoAlpha: 1, ...FADE })
      }
      const body = scope.querySelector('[data-step-body]')
      gsap.set(body, { clearProps: 'filter' })
      if (reduced) {
        gsap.fromTo(body, { autoAlpha: 0, x: 0 }, { autoAlpha: 1, ...FADE })
        return
      }
      // NANO showInterests(): each row rises 16 from .95 on PP Move, 40ms apart, just after the title
      const { rowY, rowScale, rowAt } = PAGE_IN
      gsap.fromTo(body, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE })
      const rows = body.querySelectorAll('[data-rise]')
      const content = rows.length ? rows : body
      gsap.fromTo(content, { y: rowY, scale: rowScale }, { y: 0, scale: 1, ...MOVE, delay: rowAt, stagger: STAGGER, clearProps: 'scale' })
      if (rows.length) gsap.fromTo(rows, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE, delay: rowAt, stagger: STAGGER })
    },
    { scope: root, dependencies: [id] },
  )

  // Footer settle: once the arriving step has declared its footer (its stepId matches), the
  // buttons fade + rise 8px exactly like the page content, starting just after the rows.
  // Both commits happen before paint, so a button that mounts with the new footer never flashes.
  useLayoutEffect(() => {
    footerSettle.current = true
  }, [id])
  useLayoutEffect(() => {
    if (!footerSettle.current || footer?.stepId !== id || step.fullscreen) return
    footerSettle.current = false
    // Shared action bar (NANO hands its button over in place): buttons already on screen stay;
    // only ones this page adds rise in, after its rows
    const btns = [...root.current.querySelectorAll('[data-footer-btn]')].filter((b) => !b.dataset.shown)
    btns.forEach((b) => (b.dataset.shown = '1'))
    if (!btns.length) return
    gsap.killTweensOf(btns)
    if (prefersReducedMotion()) {
      gsap.fromTo(btns, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE })
      return
    }
    const rows = root.current.querySelectorAll('[data-step-body] [data-rise]').length
    const delay = PAGE_IN.rowAt + Math.min(rows, 4) * STAGGER
    gsap.fromTo(btns, { y: PAGE_IN.footerY }, { y: 0, ...MOVE, delay })
    gsap.fromTo(btns, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE, delay })
  })

  // Footer rides above the drawn keyboard
  const kbHeight = keyboard ? KEYBOARD_HEIGHT[keyboard] : 0

  const hero = { ...chromeStep.hero, ...(heroOverride ?? {}) }
  // Read the step's footer handlers at click time: the step refreshes its handler ref when it
  // re-renders, which happens *after* this component renders — a value captured here would be
  // one render stale (e.g. Continue still seeing the previous selection).
  const footerHandlers = () => footer?.handlers?.current ?? footer
  const Body = chromeStep.Body
  // Full-screen layers: the current beat plus one still dissolving away (keyed by id, so a
  // leaving beat keeps its instance — its Lottie stays on its last frame, nothing restarts)
  const fullIds = [leavingFull, step.fullscreen ? id : null].filter((f, i, a) => f && a.indexOf(f) === i)

  // Scrolled state: hero Default → Compact, scrubbed with the scroll
  useCollapsingHero(scroller, head, [lastChromeId, hero.illustration, hero.title, hero.subtitle, data.firstName])

  return (
    <AddKidContext.Provider value={ctx}>
      <div ref={root} className="add-kid">
        <div className="add-kid__chrome" data-chrome>
          <div
            ref={scroller}
            className="add-kid__scroll"
            style={{ '--kb-height': `${kbHeight}px` }}
          >
            {/* Pinned head: background + top bar + hero; the hero collapses to Compact as the page
                scrolls and the Scroll fade (layer-blurred white gradient) appears under it (Figma 57:2431) */}
            <div ref={head} className="add-kid__head">
              {/* First, so it paints beneath the background image and the hero: it only ever
                  fades the content scrolling up underneath, never the background */}
              <div className="add-kid__fade" data-scroll-fade aria-hidden="true" />
              <OnboardingBackground />
              <div className="add-kid__top">
                <AddKidHeader step={pendingProgress ?? chromeStep.progress} onClose={requestClose} />
              </div>
              <OnboardingHero illustration={hero.illustration} title={fillName(hero.title, data)} subtitle={fillName(hero.subtitle, data)} />
            </div>
            <main className="add-kid__body" data-step-body key={lastChromeId}>
              <Body />
            </main>
          </div>

          {footer && !footer.hidden && (
            <div className={`add-kid__footer ${keyboard ? 'has-keyboard' : ''}`} style={{ '--kb-height': `${kbHeight}px` }}>
              <ActionBar layout={footer.layout ?? 'row'} top={footer.top} homeBar={!keyboard}>
                {footer.secondary && (
                  <NanoButton
                    variant="secondary"
                    data-footer-btn="secondary"
                    disabled={footer.secondary.disabled}
                    onClick={() => footerHandlers()?.secondary?.onClick?.()}
                  >
                    {footer.secondary.label}
                  </NanoButton>
                )}
                {footer.primary && (
                  <NanoButton
                    variant="primary"
                    data-footer-btn="primary"
                    disabled={footer.primary.disabled}
                    onClick={() => footerHandlers()?.primary?.onClick?.()}
                  >
                    {footer.primary.label}
                  </NanoButton>
                )}
              </ActionBar>
            </div>
          )}

          <DrawnKeyboard kind={keyboard} />
        </div>

        {fullIds.map((fid) => {
          const Full = getStep(fid).Body
          const isLeaving = fid === leavingFull && fid !== id
          return (
            <div
              className={`add-kid__full${isLeaving ? ' is-leaving' : ''}`}
              data-full-layer={fid}
              data-full-leaving={isLeaving || undefined}
              aria-hidden={isLeaving || undefined}
              key={fid}
            >
              <Full />
            </div>
          )
        })}

        <Toast toast={toast} onDone={() => setToast(null)} />

        <CloseConfirm
          open={closeOpen}
          onCancel={() => setCloseOpen(false)}
          onConfirm={() => {
            setCloseOpen(false)
            onExit?.()
          }}
        />
      </div>
    </AddKidContext.Provider>
  )
}

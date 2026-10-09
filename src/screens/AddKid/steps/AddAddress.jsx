import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '../../../lib/gsap.js'
import { FADE, MOVE, STAGGER, prefersReducedMotion } from '../../../lib/motion.js'
import { useAddKid, useStepFooter } from '../AddKidContext.js'
import { preloadLottie } from '../../../lib/preloadLottie.js'
import NanoButton from '../../../components/AddKid/NanoButton.jsx'
import { NEW_ADDRESS, savedAddresses } from '../../../data/addKid.js'
import AddressCard from './address/AddressCard.jsx'
import './AddAddress.css'

const ASSETS = '/figma/add-kid/address'

// Figma: Add address — Nothing selected (57:1690), Pick saved (18:15679), No saved addresses
// (18:15856), scroll states (57:2378 / 57:2431 / 57:2488 — the shell's sticky top bar).
// Saved addresses are a multi-select list of Address cards (69:3286); Continue stays disabled
// until at least one is ticked. With no saved addresses (prototype flag `&addresses=none`, see
// src/data/addKid.js) the body shows the empty state and the footer is hidden, as in Figma;
// "Add new address" stands in for the address form — it hands back a "Home" address and the
// list rises in (cards stagger 40ms on PP Move, the empty state blurs out on PP Fade); the new
// card mounts unticked and is ticked once it has landed, so its checkbox pop marks the success.
// Selection motion lives in AddressCard.
// Arrival (noon NANO's page build — showInterests(), and preloadHome() so the next page is ready
// before Continue): no loading state — the saved addresses are already here, so the cards build
// straight in with the page, each rising 16px from .95 on PP Move, 40ms apart (the shell's
// [data-rise] rows), just after the hero title rises out of blur. Set rules preloads this step's
// pin Lottie so the hero never lands empty. Reduced motion: plain fades.
export default function AddAddress() {
  const { data, update, goNext, goBack, fillName } = useAddKid()

  // The lets-go beat comes next — warm its comp + images so its first frames don't hitch
  useEffect(() => preloadLottie('lets-go'), [])
  const root = useRef(null)
  const [addresses, setAddresses] = useState(savedAddresses)
  const [added, setAdded] = useState(false)
  const ids = data.addressIds ?? []
  const empty = addresses.length === 0

  const toggle = (id) =>
    update((d) => {
      const cur = d.addressIds ?? []
      return { addressIds: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] }
    })

  const addNew = () => {
    const finish = () => {
      setAddresses([NEW_ADDRESS])
      setAdded(true)
    }
    const el = root.current?.querySelector('.add-address__empty')
    if (!el || prefersReducedMotion()) return finish()
    gsap.to(el, { autoAlpha: 0, y: -8, filter: 'blur(2px)', ...FADE, onComplete: finish })
  }

  useStepFooter({
    layout: 'row',
    hidden: empty,
    secondary: { label: 'Back', onClick: goBack },
    primary: { label: 'Continue', disabled: ids.length === 0, onClick: goNext },
  })

  // The list arriving after "Add new address" — then tick the new address once it has landed
  useGSAP(
    () => {
      if (!added) return
      const cards = root.current.querySelectorAll('.address-card')
      const tick = () =>
        update((d) => {
          const cur = d.addressIds ?? []
          return { addressIds: cur.includes(NEW_ADDRESS.id) ? cur : [...cur, NEW_ADDRESS.id] }
        })
      if (prefersReducedMotion()) {
        gsap.fromTo(cards, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE })
        gsap.delayedCall(FADE.duration, tick)
        return
      }
      gsap.fromTo(cards, { y: 12 }, { y: 0, ...MOVE, stagger: STAGGER })
      gsap.fromTo(cards, { autoAlpha: 0 }, { autoAlpha: 1, ...FADE, stagger: STAGGER })
      gsap.delayedCall(MOVE.duration, tick)
    },
    { scope: root, dependencies: [added] },
  )

  return (
    <div ref={root} className="add-address">
      {empty ? (
        <div className="add-address__empty" key="empty">
          <div className="add-address__art" aria-hidden="true" data-rise>
            <img className="add-address__arc" src={`${ASSETS}/empty-arc.svg`} width="149.265" height="52.7368" alt="" />
            <img className="add-address__grid" src={`${ASSETS}/empty-grid.svg`} width="232.566" height="27.0703" alt="" />
            <img className="add-address__sparkle" src={`${ASSETS}/empty-sparkle.png`} width="28.53" height="28.53" alt="" />
            <img className="add-address__cactus" src={`${ASSETS}/empty-cactus.webp`} width="124.012" height="124.012" alt="" />
          </div>
          <div className="add-address__copy" data-rise>
            <h2 className="add-address__title">No saved addresses yet</h2>
            <p className="add-address__text">
              Add an address so {fillName('{name}')} knows
              <br />
              where orders can be delivered.
            </p>
          </div>
          <div className="add-address__cta" data-rise>
            <NanoButton onClick={addNew}>Add new address</NanoButton>
          </div>
        </div>
      ) : (
        <div className="add-address__list" key="list" role="group" aria-label="Saved addresses">
          {addresses.map((a) => (
            <div key={a.id} data-rise>
              <AddressCard address={a} selected={ids.includes(a.id)} onToggle={() => toggle(a.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

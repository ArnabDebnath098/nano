import { useEffect } from 'react'
import { prefersReducedMotion } from '../../../../lib/motion.js'

// Gyro tilt for the invite card — the phone's tilt (DeviceOrientation β / γ, relative to how it
// was held when the screen opened) leans the card in 3D, slides its holographic sheen and drifts
// the sparkles the other way for parallax. On desktop the pointer stands in for the gyro.
// Smoothed with a critically-damped follow (no overshoot, no jitter from sensor noise) on rAF,
// writing transforms straight onto the elements (never via a parent CSS variable).
// iOS asks for motion permission, which needs a gesture — requested on the first tap.
// Reduced motion: off.
const MAX_TILT = 9 // deg
const RANGE = 22 // deg of phone tilt for full lean
const FOLLOW = 0.1 // per-frame approach factor

const clamp = (v) => Math.max(-1, Math.min(1, v))

export function useGyroTilt(rootRef, { card, sheen, sparkles }) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || prefersReducedMotion()) return
    const cardEl = root.querySelector(card)
    const sheenEl = root.querySelector(sheen)
    const sparkEls = [...root.querySelectorAll(sparkles)]
    if (!cardEl) return

    const target = { x: 0, y: 0 }
    const cur = { x: 0, y: 0 }
    let base = null
    let raf = 0

    const render = () => {
      raf = 0
      cur.x += (target.x - cur.x) * FOLLOW
      cur.y += (target.y - cur.y) * FOLLOW
      cardEl.style.transform = `rotateY(${(cur.x * MAX_TILT).toFixed(2)}deg) rotateX(${(-cur.y * MAX_TILT).toFixed(2)}deg)`
      if (sheenEl) {
        sheenEl.style.transform = `translate(${(cur.x * 34).toFixed(1)}%, ${(cur.y * 22).toFixed(1)}%)`
        sheenEl.style.opacity = String(0.35 + Math.min(0.45, Math.hypot(cur.x, cur.y) * 0.6))
      }
      sparkEls.forEach((el, i) => {
        const depth = i === 0 ? -1 : 1.3 // left sparkle sits behind, right one in front
        el.style.translate = `${(-cur.x * 10 * depth).toFixed(2)}px ${(-cur.y * 8 * depth).toFixed(2)}px`
      })
      if (Math.abs(target.x - cur.x) > 0.001 || Math.abs(target.y - cur.y) > 0.001) raf = requestAnimationFrame(render)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(render)
    }

    const onOrientation = (e) => {
      if (e.beta == null || e.gamma == null) return
      if (!base) base = { b: e.beta, g: e.gamma }
      target.x = clamp((e.gamma - base.g) / RANGE)
      target.y = clamp((e.beta - base.b) / RANGE)
      kick()
    }

    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    const onPointer = (e) => {
      const r = root.getBoundingClientRect()
      target.x = clamp(((e.clientX - r.left) / r.width - 0.5) * 2)
      target.y = clamp(((e.clientY - r.top) / r.height - 0.5) * 2)
      kick()
    }
    const onLeave = () => {
      target.x = 0
      target.y = 0
      kick()
    }

    const listenOrientation = () => window.addEventListener('deviceorientation', onOrientation)
    const needsPermission = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'
    const askOnce = () => {
      DeviceOrientationEvent.requestPermission()
        .then((state) => state === 'granted' && listenOrientation())
        .catch(() => {})
    }

    if (fine) {
      root.addEventListener('pointermove', onPointer)
      root.addEventListener('pointerleave', onLeave)
    } else if (needsPermission) {
      root.addEventListener('pointerdown', askOnce, { once: true })
    } else {
      listenOrientation()
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('deviceorientation', onOrientation)
      root.removeEventListener('pointermove', onPointer)
      root.removeEventListener('pointerleave', onLeave)
      root.removeEventListener('pointerdown', askOnce)
    }
  }, [rootRef, card, sheen, sparkles])
}

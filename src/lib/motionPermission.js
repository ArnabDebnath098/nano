// iOS motion permission (DeviceOrientationEvent.requestPermission, iOS 13+).
// iOS only grants it from inside a user activation — a click / touchend, NOT pointerdown — and
// a request outside one is silently rejected. So call requestMotionPermission() synchronously
// from the tap that leads to a gyro screen (as noon NANO does on "Confirm skin"), not when that
// screen mounts. Once granted it lasts for the page session; elsewhere this is a no-op.
let state = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'
  ? 'prompt'
  : 'granted'

export function requestMotionPermission() {
  if (state !== 'prompt') return Promise.resolve(state)
  state = 'pending'
  return DeviceOrientationEvent.requestPermission()
    .then((result) => {
      state = result === 'granted' ? 'granted' : 'denied'
      return state
    })
    .catch(() => {
      state = 'prompt' // no activation (or the host refused) — a later tap can try again
      return state
    })
}

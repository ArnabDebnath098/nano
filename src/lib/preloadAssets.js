import { files, lotties } from 'virtual:preload-manifest'
import { preloadLottie } from './preloadLottie.js'

// Warm every asset the app uses once the first screen is up, so later screens, sheets and
// Lotties don't pop in or hitch. Runs after `load` when the main thread is idle, a few requests
// at a time at low priority so it never competes with what's on screen. Images load through
// <img> (kept referenced, so they stay in the page's memory cache and show instantly — no
// revalidation round trip); everything else is fetched into the HTTP cache. Skipped when the
// visitor has Data Saver on or is on a 2G connection.
const CONCURRENCY = 4
const IMAGE = /\.(png|jpe?g|webp|gif|svg|avif)$/i
const keep = []

function load(url) {
  if (IMAGE.test(url)) {
    return new Promise((resolve) => {
      const img = new Image()
      img.decoding = 'async'
      img.fetchPriority = 'low'
      img.onload = img.onerror = resolve
      img.src = url
      keep.push(img)
    })
  }
  return fetch(url, { priority: 'low' })
    .then((r) => r.arrayBuffer())
    .catch(() => {})
}

async function run() {
  lotties.forEach(preloadLottie) // small comps; the flow plays them back to back
  const queue = [...files]
  const worker = async () => {
    while (queue.length) await load(queue.shift())
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))
}

export function preloadAssets() {
  const conn = navigator.connection
  if (conn?.saveData || /2g/.test(conn?.effectiveType ?? '')) return
  const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 200))
  const start = () => idle(run, { timeout: 2000 })
  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
}

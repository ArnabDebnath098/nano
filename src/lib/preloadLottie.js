// Warm the browser cache for a Lottie the next step will play (lottie-web loads by URL),
// JSON and its images both, so a heavy comp never shows a blank first frame — the canvas
// renderer draws nothing for an image that hasn't decoded yet. Safe to call repeatedly.
const warmed = new Set()

export function preloadLottie(name) {
  if (warmed.has(name)) return
  warmed.add(name)
  const base = `/lottie/add-kid/${name}/`
  fetch(`${base}animation.json`)
    .then((r) => r.json())
    .then((data) => {
      for (const a of data.assets ?? []) {
        if (!a.p || a.e === 1 || a.layers) continue
        const img = new Image()
        img.src = `${base}${a.u ?? ''}${a.p}`
        img.decode?.().catch(() => {})
      }
    })
    .catch(() => warmed.delete(name))
}

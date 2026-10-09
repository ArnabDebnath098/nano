// Warm the browser cache for a Lottie the next step will play (lottie-web loads by URL),
// so a heavy comp never shows a blank first frame. Safe to call repeatedly.
const warmed = new Set()

export function preloadLottie(name) {
  if (warmed.has(name)) return
  warmed.add(name)
  fetch(`/lottie/add-kid/${name}/animation.json`).catch(() => warmed.delete(name))
}

// Prototype screenshot helper (dev only).
//   node scripts/shot.mjs <out.png> [hash] [--wait ms] [--js "<code run in page before shot>"] [--full]
// Viewport is an iPhone-sized 375 × 812 at 2x. The dev server must be on http://localhost:5173.
import { chromium } from 'playwright'

const args = process.argv.slice(2)
const out = args[0]
const hash = args[1] && !args[1].startsWith('--') ? args[1] : '/'
const opt = (name, def) => {
  const i = args.indexOf(name)
  return i >= 0 ? args[i + 1] : def
}
const wait = Number(opt('--wait', 1500))
const js = opt('--js', null)

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 })
page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message))
page.on('console', (m) => m.type() === 'error' && console.error('CONSOLE:', m.text()))
await page.goto(`http://localhost:5173/#${hash}`)
await page.waitForTimeout(wait)
if (js) {
  await page.evaluate(js)
  await page.waitForTimeout(Number(opt('--after', 1200)))
}
await page.screenshot({ path: out, fullPage: args.includes('--full') })
await browser.close()
console.log('saved', out)

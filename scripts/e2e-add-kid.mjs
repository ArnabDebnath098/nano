// End-to-end walk of the Add a child flow (dev only): node scripts/e2e-add-kid.mjs <out-dir>
// Needs the dev server on :5173. Fails on any 4xx, asset served as HTML, page or console error.
import { chromium } from 'playwright'
const out = process.argv[2]
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 2 })
const bad = []
p.on('response', async (r) => {
  const ct = r.headers()['content-type'] || ''
  const u = r.url()
  if (r.status() >= 400) bad.push(r.status() + ' ' + u)
  else if (/\.(png|webp|svg|json|mp4)(\?|$)/.test(u) && ct.includes('text/html')) bad.push('HTML-FOR-ASSET ' + u)
})
p.on('pageerror', (e) => bad.push('PAGEERR ' + e.message))
p.on('console', (m) => m.type() === 'error' && bad.push('CONSOLE ' + m.text()))
let n = 0
const shot = async (name) => p.screenshot({ path: `${out}/${String(++n).padStart(2, '0')}-${name}.png` })
const wait = (ms) => p.waitForTimeout(ms)
const step = async (name, fn) => {
  try {
    await fn()
  } catch (e) {
    bad.push(`STEP ${name}: ${e.message.split('\n')[0]}`)
    await shot('FAIL-' + name)
    console.log(bad.join('\n'))
    await b.close()
    process.exit(1)
  }
}
const cont = () => p.getByRole('button', { name: 'Continue', exact: true }).click({ timeout: 4000 })

await p.goto('http://localhost:5173/#/')
await wait(1500)
await step('open', async () => {
  await p.getByRole('button', { name: /add kid/i }).first().click()
  await wait(1200)
  await shot('child-empty')
})
await step('child', async () => {
  const inputs = p.locator('.add-kid__body input')
  await inputs.nth(0).click()
  await p.keyboard.type('Kiaan')
  await inputs.nth(1).click()
  await p.keyboard.type('Khalid')
  // Birthday: native date input if present, else the wheel sheet
  const native = p.locator('.child-birthday__native')
  if (await native.count()) {
    await native.fill('2016-05-10')
  } else {
    await p.locator('.child-birthday__field').click()
    await wait(900)
    await shot('birthday-sheet')
    await p.getByRole('button', { name: /^done$/i }).first().click()
  }
  await wait(800)
  await p.getByText('Boy', { exact: true }).first().click()
  await wait(600)
  await shot('child-filled')
  await cont()
})
await step('age', async () => {
  await wait(900)
  await shot('age-reveal')
  await wait(2600)
  await shot('email-arrive')
})
await step('email', async () => {
  await p.locator('.add-kid__body input').first().click()
  await p.keyboard.type('kiaan.khalid@noon.com', { delay: 10 })
  await wait(300)
  await shot('email-filled')
  await cont()
  await wait(700)
  await shot('email-checking')
  await wait(1600)
  await shot('email-confirm')
  await p.getByRole('button', { name: /yes, use this email/i }).click({ timeout: 4000 })
})
await step('education', async () => {
  await wait(900)
  await shot('education-1')
  await wait(1400)
  await shot('education-2')
  await wait(1900)
  await shot('rules')
})
await step('rules', async () => {
  await p.getByText('Auto-approve orders').first().click()
  await wait(600)
  await shot('rules-auto')
  await cont()
  await wait(1400)
  await shot('address')
})
await step('address', async () => {
  await p.getByText('Work', { exact: true }).first().click()
  await wait(600)
  await shot('address-picked')
  await cont()
  await wait(700)
  await shot('lets-go')
  await wait(1600)
  await shot('invite')
})
console.log('URL', p.url())
console.log(bad.length ? [...new Set(bad)].join('\n') : 'NO ERRORS')
await b.close()

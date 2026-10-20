import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, relative, sep } from 'node:path'

// Vite plugin: `virtual:preload-manifest` lists the public/ assets the app actually uses, so
// src/lib/preloadAssets.js can warm them after the first screen. A file counts as used when its
// file name appears anywhere in src/ (paths there are often built from a folder constant plus a
// name, so the name is the reliable part); unused Figma exports are left out. Lotties are listed
// by folder — preloadLottie fetches each comp and the images its JSON points at.
const ID = 'virtual:preload-manifest'
const RESOLVED = '\0' + ID
const SKIP = /\.(html|map|DS_Store)$/

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

export default function preloadManifest() {
  let root = process.cwd()
  return {
    name: 'preload-manifest',
    configResolved(config) {
      root = config.root
    },
    resolveId(id) {
      if (id === ID) return RESOLVED
    },
    load(id) {
      if (id !== RESOLVED) return
      const pub = join(root, 'public')
      const src = walk(join(root, 'src'))
        .filter((p) => /\.(jsx?|tsx?|css)$/.test(p))
        .map((p) => readFileSync(p, 'utf8'))
        .join('\n')
      const lottieDir = join(pub, 'lottie', 'add-kid')
      const lotties = readdirSync(lottieDir).filter((n) => statSync(join(lottieDir, n)).isDirectory() && src.includes(n))
      const files = walk(pub)
        .filter((p) => !p.startsWith(join(pub, 'lottie') + sep) && !SKIP.test(p))
        .filter((p) => src.includes(basename(p)))
        .map((p) => ({ url: '/' + relative(pub, p).split(sep).join('/'), size: statSync(p).size }))
        .sort((a, b) => a.size - b.size) // small first: more of the UI is ready sooner
        .map((f) => f.url)
      return `export const lotties = ${JSON.stringify(lotties)}\nexport const files = ${JSON.stringify(files)}\n`
    },
  }
}

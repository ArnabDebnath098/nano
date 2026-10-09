# noon NANO motion reference

This folder records every animation value in the noon NANO parent-onboarding prototype. The values were extracted from the source and are kept exactly as written; nothing was invented or rounded. Each value cites its source line (`L123` means `index.html` line 123).

- **Source:** github.com/saswata2002/noon-NANO @ `f137e63` (2026-10-08, "Spec sheet: audited against the live prototype (measure.mjs) and brought fully up to date").
- **Files read:** `index.html` (4,463 lines: CSS L21–1446, app JS L1863–4449, chrome JS L4450–4461), `spec/index.html` (1,848 lines; `window.SPEC` L424–1125), and `assets/lottie/*.json`.
- **Not done:** the prototype was not run, and nothing was installed.

## Files

| File | Contents |
|---|---|
| `README.md` | This overview, the core system and how to use it with GSAP |
| `motion-tokens.json` | Machine-readable tokens: 37 easings, 43 spring entries, 60 durations, delays and staggers, 4 keyframes, 13 velocity formulas, reduced-motion behaviour, 4 Lottie files |
| `animations.md` | Every animation, grouped by the spec's 32 scenes plus shared components. Each row has the element, the property values from → to, the authored timing, the **effective** timing, delay, fill and source line. A discrepancy list is at the end. |
| `motion.css` | CSS custom properties (`--nn-*`) for every easing and duration, including `DROP_SPRING` and the PP `linear()` strings verbatim, plus the 4 @keyframes copied verbatim |
| `motion.js` | A pure ES module: tokens, faithful ports of `spring()` and `springImpact()`, `ppMove`, `powerCurve`, the rAF spring constants, gesture and velocity formulas, `effectiveTiming()` (the global retiming rule), and `registerNanoEases(CustomEase)` |
| `lottie/` | The 4 Lottie JSON files, unchanged, and a `README.md` covering size, fps, frames, duration, layers and triggers |

## The most important fact: one global motion layer

The prototype wraps `Element.prototype.animate` (L1889–1910). Any WAAPI call that meets all of these conditions:

- passes 2 or more keyframes,
- runs a single iteration,
- has `duration > 1`,
- and does not pass `{ pp: false }`,

is re-timed in one of two ways:

- **Move** (any of translate, transform, scale, rotate, width, height, top/left/right/bottom, clipPath, borderRadius, strokeDashoffset, letterSpacing, or `--spin`): **540 ms on `PP.MOVE`**
- **Fade** (only opacity, filter, color or backgroundColor): **200 ms on `PP.FADE`**

In both cases the keyframe-level easings are removed, and delays are kept.

As a result, many springs and curves that appear in the JS never run. The `pp:false` sections do keep their own timing:

- skin reveal
- avatar swap and sparkle spin
- Selected Wallet → Home
- the PLP cards
- bell badge
- the notification deck, throw and close

`animations.md` gives the authored and effective timing side by side. The spec sheet documents the effective values (spec L427–430).

## Core motion system

| Token | Value | Source | Notes |
|---|---|---|---|
| **PP Move** | 540 ms, `linear(0.0000 0.00%, 0.0771 1.64%, … 1.0133 54.55% … 1.0000 100.00%)` (34 stops) | L33–34, L1875 | Recorded ProtoPie spring: 50% at 75 ms, 90% by 165 ms, 1.3% overshoot at ~300 ms. The spec fits it as ω 16.75, ζ 0.81. It is the keyboard curve (`--kb-ease`) and drives every CSS move. |
| **PP Fade** | 200 ms, `linear(0.0000 0.00%, 0.1160 4.00%, … 1.0000 100.00%)` (24 stops) | L35–36, L1876 | "a fast ease-out" |
| Stagger | 40 ms (`PP.STAGGER`) | L1877 | Lists: OTP boxes, chips, logo, avatar row |
| Follow | 100 ms (`PP.FOLLOW`) | L1877 | Follow-up elements |
| iOS ease-out | `cubic-bezier(0.32, 0.72, 0, 1)` | 14 sites | Effective in CSS (450 ms touch keyboard lift) and in pp:false calls |
| Fade (CSS `ease`) | `cubic-bezier(0.25, 0.1, 0.25, 1)` | 10 sites | |
| Ease-out quint | `cubic-bezier(0.22, 1, 0.36, 1)` | L3629 … | Home settle `CLOSE` 820 ms; notification UI |
| DROP_SPRING | `linear(0, 0.039, … 1.038 …, 1)` (31 values) | L2279 | ζ 0.72, response 0.42 s. Equal to `spring(0.72, 0.42, 600, 30)` at 3 decimals. Overridden at runtime. |
| Shake | `field-shake 340ms cubic-bezier(.36,.07,.19,.97)`, 0 → −4 → 3 → −2 → 1 → 0 px | L309–316 | |
| Digit pop | `digit-in 260ms cubic-bezier(0.34, 1.4, 0.64, 1)` | L1367 | |

**Spring model** (`spring(zeta, response, durMs, steps = 48)`, L2284–2294):

- Step response `x(t) = 1 − e^(−ζωt)(cos ωd·t + (ζω/ωd) sin ωd·t)`, where `ω = 2π/response` and `ωd = ω√(1−ζ²)`.
- It is sampled at `steps + 1` even points with `toFixed(4)`, the last point is forced to 1, and the result is emitted as a CSS `linear()`.
- It only works underdamped (ζ < 1).
- `springImpact(ζ, r)` (L2296) is the first time the curve crosses 1: `(π − atan(√(1−ζ²)/ζ)) / ωd`.

The springs that actually run (all pp:false):

| Use | ζ | Response (s) | Duration (ms) |
|---|---|---|---|
| Skin text | 0.88 | 0.6 | 1000 |
| Wallet land | 0.8 | 0.58 | 1100 |
| Fan | 0.78 | 0.5 | 900 |
| Avatar rise | 0.84 | 0.56 | 760 |
| Sparkle spin | 0.84 | 0.78 | 900 |
| Wallet present | 0.74 | 0.44 | 700 |
| Badge | 0.55 | 0.36 | 560 |
| Header glide | 0.9 | 0.55 | 820 |
| Deck | 0.97 | 0.6 | 900 |
| Peek | 0.95 | 0.55 | 850 |
| Settle | 0.92 | 0.5 | 760 |
| Spring-back | 0.55 | 0.42 | 720 |

Two rAF springs run by semi-implicit Euler integration:

- **Avatar row:** K 260, ζ 0.86.
- **Collapsing header:** K (2π/0.34)², ζ 0.86. It keeps its velocity when the direction reverses.

**Standard durations:**

| Duration | Use |
|---|---|
| 540 | Move |
| 200 | Fade |
| 450 | Touch keyboard lift |
| 340 | Shake |
| 260 / 420 | Digit keyframes |
| 90 | Press |
| 820 | Home settle |
| 1700 | Toast on screen (900 entry + 800 hold) |
| 1300 | Email check |
| 1500 | OTP verify |
| 1867 | Shimmer period |

The throw velocity duration is `max(260, min(460, 520 − |vx|·140))`.

## Using these tokens in our React + GSAP project

`src/lib/gsap.js` already registers:

```js
CustomEase.create('sheetOpen',  'M0,0 C0.32,0.72 0,1 1,1')   // 420 ms in our components
CustomEase.create('sheetClose', 'M0,0 C0.4,0 1,1 1,1')
```

How these overlap with noon NANO:

- **`sheetOpen` is the same curve as NANO's iOS ease-out** (`IOS` / `EASE` / `GLIDE_EASE` / `KB_EASE`, `cubic-bezier(0.32, 0.72, 0, 1)`). NANO uses it at 450 ms for the touch keyboard lift (L224), 640 ms for the skin background, 1400 ms for the background push-in, 700 ms for the hint, and 560 ms in the home `rise()`. It never uses it at 420 ms. Note that NANO's main "sheet" motion is **PP Move at 540 ms**, not this cubic.
- **`sheetClose` (`0.4, 0, 1, 1`) has no equivalent in NANO.** NANO's closest exits are:
  - `cubic-bezier(0.4, 0, 0.6, 1)` (OUT)
  - `cubic-bezier(0.4, 0, 0.7, 0.4)` (showHome EXIT, 220 ms)
  - `cubic-bezier(0.4, 0, 0.75, 0.3)` (closeNotif EXIT, 160–260 ms)
  - `cubic-bezier(0.4, 0, 0.7, 0.2)` (toast EXIT_EASE)
  - `cubic-bezier(0.45, 0, 0.75, 0.3)` (sink, 380 ms)

Usage:

```js
import { gsap, CustomEase } from '@/lib/gsap'
import { registerNanoEases, ppMove, ppFade, springEase, DUR } from '../animation-reference/noon-nano/motion.js'

registerNanoEases(CustomEase)            // 'nano.iosOut', 'nano.outQuint', 'nano.softIn', … (cubic-beziers only)

// The NANO system Move / Fade (linear() curves → GSAP accepts an ease function)
gsap.to(el, { y: 0, duration: DUR.MOVE / 1000, ease: ppMove })
gsap.to(el, { opacity: 1, duration: DUR.FADE / 1000, ease: ppFade })

// A NANO spring (exact closed form, same maths as spring())
gsap.to(card, { y: 0, duration: 0.9, ease: springEase(0.97, 0.6, 900) })   // notification deck
```

Notes:

- `CustomEase` takes only a single cubic for these curves. The `linear()` curves (PP Move/Fade, springs, DROP_SPRING, CARD_FADE/RISE) should be used as functions, as shown above. In CSS or WAAPI, use the strings from `motion.css` / `motion.js` directly.
- To reproduce NANO's behaviour, time moves at 540 ms PP Move and fades at 200 ms PP Fade. Use the pp:false choreography (see `animations.md`) only where NANO itself does.
- `effectiveTiming(keyframes, options)` in `motion.js` tells you what a given NANO `animate()` call really ran at.

## Discrepancies found (details in `animations.md` §Discrepancies)

1. Most authored JS springs and curves are overridden at runtime. This includes `DROP_SPRING`, `KB_EASE` 450 ms, OTP `GLIDE` 340 ms and the toast springs.
2. `springImpact(0.52, 0.45)` = 177.559… ms, but the comment says ≈150.
3. `OTP_LAND_MS` is commented "800 + 560", while the rise is 540 (the spec repeats 560).
4. The back-to-email comment says "380 ms"; the CSS fade is 200.
5. Spec scenes 5 and 9 give the shake curve as `cubic-bezier(0.45, 0, 0.55, 1)`; the code uses `(.36,.07,.19,.97)`.
6. The spec's `TICK_MS` is 2300 vs 2266.67 ms from the Lottie (2.27 s video).
7. The spec says the edit-email lift is "450 ms on phones", but only the frame lift is 450; the card and bar still use 540.
8. Spec-only curves: `hdr` and `scroll`.
9. `animSheet` ignores its spring arguments.
10. Some spring locals are unused.
11. The reduced-motion gaps are listed in `motion-tokens.json`.
12. There is no device-motion parallax; DeviceMotion is only used for shake-to-change-avatar.

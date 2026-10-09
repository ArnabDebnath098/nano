# noon NANO: animation catalogue

Source: `index.html` at commit f137e63. `Lnnnn` refers to a line in that file. Scene names and numbers come from `spec/index.html` (`window.SPEC.SCENES`, L509–944).

## How to read the "Effective" column

The prototype wraps `Element.prototype.animate` (L1889–1910). A WAAPI call is **re-timed** when all of these hold:

- `options` is an object
- `options.pp !== false`
- `keyframes` is an array of 2 or more frames
- `iterations` is unset or 1
- `duration > 1`

When it is re-timed:

- **M**: at least one keyframe property is in `MOVE_PROPS` (translate, transform, scale, rotate, top/left/right/bottom, width, height, clipPath, borderRadius, strokeDashoffset, letterSpacing, `--spin`). The call runs at **540 ms on `PP.MOVE`**. The Move curve applies to every property in that call, opacity and filter included.
- **F**: every property is in `FADE_PROPS` (opacity, filter, color, backgroundColor). The call runs at **200 ms on `PP.FADE`**.
- In both cases any per-keyframe `easing` is **removed**, so the segments between keyframes interpolate linearly inside the overall curve. `offset`, `delay`, `fill` and `composite` are kept.
- **own**: the call is not re-timed (`pp:false`, infinite loops, 1 ms steps, or properties outside both sets, such as `backgroundPosition`). The authored timing runs.

CSS transitions and @keyframes are not affected by the wrapper. Most of them already use `var(--pp-move-ms) var(--pp-move)` (540 ms) or `var(--pp-fade-ms) var(--pp-fade)` (200 ms).

Notation: `PPM` = 540 ms on `PP.MOVE`, `PPF` = 200 ms on `PP.FADE`. `spring(ζ, r, ms)` is the sampled-spring `linear()` generator (L2284, ported in `motion.js`). All coordinates are in the 375 × 812 frame.

---

## Global systems

| System | Detail | Lines |
|---|---|---|
| Motion layer | the re-timing rule above | L1889–1910 |
| `ppMove(x)` | piecewise-linear evaluation of the `PP.MOVE` stops. Drives the rAF pocket sheet | L1880–1888 |
| Frame scale | `.ui { transform: scale(var(--s)) }`, where `--s = screenWidth / 375` from a ResizeObserver. Not animated | L104, L2057–2060 |
| Haptics | selection `['rigid',0.75]`, iOS ticks `[0,28]`, Android `26`; light `['medium',0.85]`, `[0,28,56]`, `38`; medium `['heavy',0.85]`, `[0,26,52,78]`, `58`; heavy `['heavy',1]`, `[0,25,50,75,100]`, `85`; success `[[0,'success'],[150,'heavy',0.9]]`, `[0,28,56,150,178,206]`, `[45,60,70]`; error `[[0,'error'],[220,'heavy',1]]`, `[0,28,56,110,138,166,220,248,276]`, `[60,40,60,40,70]` | L1964–1969 |
| Global tap haptic | `light()` on any TAPPABLE click unless a handler already played one (`setTimeout 0`) | L1975–1983 |
| Gesture haptic queue | played on the next `touchend`, or after 40 ms | L3985–3993 |

---

## Shared components

### Drop-in pill toast (`makeDropToast`, L2317–2396)

Used by the error toast (270×50, r14), the success toast (242×48, r14) and the OTP error toast (270×50, r14) (L2398–2400). `dot = 0.66·H`, which gives 33 px for H 50 and 31.68 px for H 48. The helper `run()` defaults to `fill: 'both'` (L2322).

Entry (L2337–2360):

| Element | Props from → to | Authored | Effective | Delay | Line |
|---|---|---|---|---|---|
| `.toast` | transform `translateY(-100px)` → `translateY(0px)` | 600 ms, kf easing `TOAST_FALL = spring(0.52,0.45,600)` | M | 0 | L2344 |
| `.toast__blob` | scale track at offsets `ms/600`: [0 `0.9 1.12`] [hit−30 `0.9 1.12`] [hit+40 `1.22 0.8`] [hit+130 `0.94 1.07`] [hit+210 `1.03 0.98`] [hit+290 `1 1`] [600 `1 1`]. `hit = springImpact(0.52,0.45)` = 177.559… ms (the comment at L2302 says ≈150). Segment easing `SQ = cubic-bezier(0.45, 0, 0.55, 1)` | 600 ms | M (offsets kept, SQ removed) | 0 | L2346–2349 |
| `.toast__blob` | width `dot px` → `W px` | 640, kf `spring(0.6,0.5,640)` | M | 260 | L2351 |
| `.toast__blob` | height `dot` → `H` | 560, kf `spring(0.6,0.45,560)` | M | 260 | L2352 |
| `.toast__blob` | borderRadius `dot/2` → `R` (16.5 or 15.84 → 14) | 300, `EASE_OUT_CUBIC` | M | 260 | L2353 |
| `.toast__content` | opacity 0 → 1 | 200, `EASE_OUT_CUBIC` | F | 430 | L2355 |
| `.toast__content` | transform `translate(-50%,-50%) scale(0.8)` → `scale(1)` | 470, kf `spring(0.55,0.4,470)` | M | 430 | L2356–2359 |
| reduced motion: `.toast` | opacity 0 → 1 | 200 | F | 0 | L2338 |

Hold: `TOAST_HOLD_MS = ENTRY_MS (900) + 800` = 1700 ms, measured from show to hide (L2282, L2363). If `show()` is called while the toast is already up, the timer is re-armed at `hold − 900` (L2331).

Exit (L2366–2394). The current transform is committed first if the entry is still running.

| Element | Keyframes | Authored | Effective | Line |
|---|---|---|---|---|
| `.toast` | current transform (`EASE_OUT_CUBIC`) → `translateY(7px)` @0.27 (`EXIT_EASE`) → `translateY(-140px)` | `EXIT_MS` 440 | M | L2376–2380 |
| `.toast__blob` | scale `1 1` (`EASE_OUT_CUBIC`) → `1.05 0.9` @0.27 (`cubic-bezier(0.3, 0, 0.4, 1)`) → `0.93 1.12` | 440 | M | L2381–2385 |
| reduced motion: `.toast` | opacity 1 → 0 | 160 | F (200) | L2372 |

### Buttons and press states (CSS)

| Selector | Motion | Lines |
|---|---|---|
| `.nano-btn` | transitions on transform, height and padding at `--pp-move-ms` / `--pp-move`; background-color and color at `--pp-fade-ms` / `--pp-fade` | L471–476 |
| `.nano-btn::before`, `::after` | opacity at PPF (stroke and inner shadow; opacity 0 when disabled) | L489, L500, L516–517 |
| `.nano-btn:active` | `transform: scale(.98)` | L507 |
| `.nano-btn:disabled` | height 56 → 52, padding 16 → 14, transform none | L508–515 |
| `.nano-btn.is-instant` (and its ::before / ::after) | `transition: none !important` | L1002 |
| `.av__cta .nano-btn__label` | `transition: none` | L958 |
| `.ich` | `transition: scale` PPM. `:active { scale: .965; transition-duration: 90ms }` | L984–985 |
| `.ich__sel`, `.ich__lbl` | opacity PPF (selected cross-fade) | L988, L992, L996–997 |
| `.hm__topup` | scale PPM. `:active` .96 at 90 ms | L1063, L1068 |
| `.hm__tile` | scale PPM. `:active` .96 at 90 ms | L1090, L1094 |
| `.av__back:active` | `scale: .94` (instant, no transition declared) | L946 |
| `.numpad__key` | `background-color 90ms ease`. `:active` / `.is-pressed` bg `rgba(0,0,0,.12)` with `transition-duration: 0ms` | L1399–1401 |
| `.skin__different:active`, `.int__skip:active` | opacity .6 (instant) | L894, L1005 |
| `.otp__resend:active` | background `rgba(29,37,57,.06)` (instant) | L713 |

---

## 1 · Splash → login (trigger: app open)

Videos:

- `splash.mp4` (750×1624, 4.6 s) plays once (L1450–1466, L1986–2001).
- `splash-loop.mp4` (3.15 s) is primed by play → pause at 0, starting 1200 ms after `playing` (L2026–2030).
- On `ended` the loop starts. It is shown on the first of `requestVideoFrameCallback`, `playing`, or `setTimeout 300` (L2012–2022). The swap is an instant opacity class change (`.screen__loop.is-on`, L92–93).

The login UI waits under `.ui.is-pre-intro` with opacity 0 (L185–190).

`enterIntroUI()` (L2068–2112) fires on the first of these:

- `mediaTime >= 3.97 s` via rVFC (L2065, L2115–2120)
- a `playing`-based setTimeout (L2122–2124)
- `error` or `ended` events
- 2500 ms if paused or stalled (L2128)
- a 9000 ms hard cap (L2129)
- immediately when there is no video (L2113)

Haptic `medium` at 380 ms (0 when reduced) (L2075). Reduced motion stops here, with no animation (L2076).

| Element | Props | Authored | Effective | Delay | Fill | Line |
|---|---|---|---|---|---|---|
| `.card` | translate `0 56px` → `0 0` | 1200, kf `RISE = spring(0.66,0.62,1200)` | M | 0 | backwards | L2082 |
| `.card` | scale `0.96` → `1` | 1100, kf `POP = spring(0.62,0.5,1100)` | M | 0 | backwards | L2083 |
| `.card` | opacity 0 → 1 | 380, `FADE` | F | 0 | backwards | L2084 |
| `.dock` | opacity 0 → 1 | 480, `FADE` | F | 100 (`PP.FOLLOW`) | backwards | L2085 |
| `.nano-btn` | translate `0 44px` → `0 0` | 1200, RISE | M | 100 | backwards | L2086 |
| `.nano-btn` | scale `0.95` → `1` | 1100, POP | M | 100 | backwards | L2087 |
| `.logo__welcome` | letterSpacing `9.6322px` → `4.6322px` + translate `-22.5px 8px` → `0 0` | 900, `OUT_EXPO cubic-bezier(0.16, 1, 0.3, 1)` | M | 0 | backwards | L2099–2100 |
| `.logo__welcome` | opacity 0 → 1 + filter `blur(6px)` → `blur(0px)` | 520, FADE | F | 0 | backwards | L2096, L2101 |
| `.logo__noon` | translate `0 14px` → `0 0` | 1200, RISE | M | 40 (`PP.STAGGER`) | backwards | L2102 |
| `.logo__noon` | unblur (as above) | 520 | F | 40 | backwards | L2103 |
| `.logo__nano` | scale `0.86` → `1` + rotate `-4deg` → `0deg` | 1100, POP | M | 80 | backwards | L2104–2105 |
| `.logo__nano` | unblur | 520 | F | 80 | backwards | L2106 |
| `.logo__shadow--mark` | scale `0.86` → `1` + rotate `-4deg` → `0deg` | 1100, POP | M | 80 | backwards | L2109–2110 |
| `.logo__shadow--mark` | opacity 0 → 1 | 520, FADE | F | 40 | backwards | L2111 |

## 2 · Edit email (tap the email field) and 3 · Leave the email field (blur)

`setEditing(on)` toggles `.ui.is-editing` (L2235–2238). `--bar-dy = 389.23 − (dock.offsetTop + actionBar.offsetTop)` (L2231–2234). Every row below is a CSS transition, so reversing it on blur plays the same motion backwards.

| Selector | Rest → edit | Transition | Lines |
|---|---|---|---|
| `.overlay` (lilac wash) | opacity 0 → 1 | PPF | L118–125 |
| `.logo__welcome` | opacity 1 → 0, transform → `translateY(-16px)` | opacity PPF (delay 100ms on the return to rest; no delay going into edit), transform `--kb-dur --kb-ease` (PPM) | L157–163 |
| `.logo__mark` | → `translateY(-54.38px) scale(0.6256)`, origin `184px 111.5px` | `--kb-dur --kb-ease` | L165–172 |
| `.main` | → `translateY(var(--bar-dy, -322.77px))` | kb curve | L179–180 |
| `.action-bar` | → `translateY(var(--bar-dy, -318px))` | transform kb curve, opacity PPF | L193–194 |
| `.keyboard` (drawn, desktop only) | `translateY(100%)` → `0`. Visibility flips instantly when shown and after `--kb-dur` when hidden | kb curve | L197–214 |
| `.field__label` (rest) | `.is-floated`: opacity 0, `translateY(-4px)` | transform PPM, opacity PPF | L325–334, L356 |
| `.field__input::placeholder` | transparent → `--text-muted` | color PPF | L379–380 |
| `.field__input` | opacity transition | PPF | L377 |
| `.field` | border-color, background-color | PPF | L303 |

Touch devices:

- The drawn keyboard is hidden (L221).
- `.is-touch .screen` uses `transform: translateY(calc(-1 * var(--kb-lift)))` with a **450ms cubic-bezier(0.32, 0.72, 0, 1)** transition. `.is-touch .toast` translate uses the same curve (L222–226).
- `--kb-lift` comes from `avoidKeyboard()`: 12 px clearance below, 8 px above. It is re-measured at 520 ms and 1000 ms after viewport, focus or blur changes (L4358–4400).

Reduced motion: `.ui { --kb-dur: 1ms }` (L228–230).

The Send OTP button: when it goes from Disabled to Primary, `cta.animate([{transform:'scale(0.98)'},{transform:'scale(1)'}], {duration:520, easing: DROP_SPRING})` runs. Effective: **M**, so `DROP_SPRING` never runs (L2163–2165).

## 4 · Incomplete email (Continue with "sdutta")

| Element | Motion | Line |
|---|---|---|
| `.field.is-error` | border-color → `#d92626`, PPF transition | L303, L306 |
| `.field.is-shaking` | `field-shake 340ms cubic-bezier(.36,.07,.19,.97) both`. Restarted by removing the class, forcing a reflow and re-adding it. Removed on `animationend` | L309–316, L2258–2263 |
| haptic | `error` | L2432 |

## 5 · Wrong email (any other complete email)

Same red state and shake as scene 4, plus the error toast (shared component), shown with `show(null)` (L2170–2179). `autoClearEmail` runs at `TOAST_HOLD_MS` 1700 (L2177).

| Element | Props | Authored | Effective | Line |
|---|---|---|---|---|
| error toast | exit (shared) | — | — | L2186 |
| `.field` | remove `.is-error`, so red → normal through the CSS transition (PPF) | — | — | L2189 |
| `#email` input | opacity 1 → 0, then the value is cleared | 220 `ease-out` (1 when reduced), fill forwards | F (reduced: own, 1 ms) | L2190–2197 |

## 6 · Retype the right email

Input cancels the fade and clears `rejected`. `hideToast()` runs when the value is accepted (L2245–2251). The toast exit is the shared one.

## 7 · Send OTP (right email + Continue)

Haptic `light` (L2421). `checkEmail()` (L2438–2456):

| Element | Props | Authored | Effective | Delay | Line |
|---|---|---|---|---|---|
| `.field__shimmer` | opacity 0 → 1 | 200 `ease-out`, fill forwards | F | 0 | L2447 |
| `.field__shimmer` | backgroundPosition `100% 0` → `0% 0`. The gradient is `#e7e9ee 0/34%, #fff 50%, #e7e9ee 66/100%` at size 300% | 1000, `cubic-bezier(0.45, 0, 0.55, 1)`, iterations Infinity | own | 0 | L2448, L383–385 |
| `.field__shimmer` | at 1300 ms (`EMAIL_CHECK_MS`, 300 when reduced): cancel, then opacity 1 → 0 | 220 `ease-out` | F | 1300 | L2450–2452 |

Then `showOtpScreen()` (L2477–2505). `.ui.is-leaving` makes the drawn keyboard drop with `translateY(100%)` at PPM (L728–731).

| Element | Motion | Line |
|---|---|---|
| `.otp` | opacity 0 → 1 at PPF. Visibility goes visible at once on show, and after 200 ms on hide | L577–593 |
| `.otp [data-rise]` | opacity 0 → 1 (PPF) and `translateY(14px)` → none (PPM), each with `var(--d)` delay | L716–726 |
| `.otp__title` | `--d: 300ms` | L1557 |
| `.otp__subtitle` | `--d: 380ms` | L1559 |
| `#otpEmailChip` | `--d: 440ms` | L1560 |
| `.otp__digit` ×6 | `--d: 520, 560, 600, 640, 680, 720ms` (40 ms steps), `--i: 0…5` | L1568–1573 |
| `.otp__resend-row` | `--d: 800ms` | L1578 |
| email-pop Lottie | `goToAndPlay(0, true)` after 120 ms. Reduced motion: `goToAndStop(totalFrames-1)` | L2492–2496 |
| auto number pad | at `OTP_LAND_MS 1360 + 200` = 1560 ms (200 when reduced) → `setOtpTyping(true)` | L2475, L2500–2504 |

`.otp.is-typing` (number pad up) is all CSS on the kb curve (PPM):

| Selector | → | Lines |
|---|---|---|
| `.numpad` | `translateY(100%)` → `0` | L1377–1387 |
| `.otp__art` | `scale(0.7)`, origin `187.885px -15.577px` | L1314–1322 |
| `.otp__fade` | `translateY(-80px)` | L1321–1323 |
| `.otp__stack` | `translateY(-110.52px)` | L1321, L1324 |

Typing digits:

| Element | Motion | Line |
|---|---|---|
| `.otp__num.is-new` | `digit-in 260ms cubic-bezier(0.34, 1.4, 0.64, 1) both`: opacity 0 → 1, `translateX(-50%) translateY(6px) scale(0.6)` → `translateY(0) scale(1)` | L1367–1371, L2531 |
| `.otp__ring` | `translateX(var(--ring-x))` with `--ring-x = max(len−1,0)·52px`. Transform PPM, opacity PPF, `.is-on` opacity 1 | L1336–1351, L2535–2537 |
| `.otp__digit` | border-color and background-color at PPF | L1332 |
| reduced motion | `.otp` and `[data-rise]` at 1ms with 0 delay | L732–734 |

## 8 · Back to email (tap the email chip)

Listener at L4415–4446. The work happens inside one rAF (L4427).

| Element | Props | Authored | Effective | Line |
|---|---|---|---|---|
| `.otp.is-exiting` | opacity → 0 | CSS PPF (the comment at L4411 says "380 ms") | 200 | L739–742 |
| `.otp.is-exiting .numpad` | `translateY(100%)` | CSS PPM | 540 | L743 |
| drawn keyboard | `.is-leaving` removed, so it rises on the kb curve | CSS | 540 | L4429 |
| `.logo` | transform `translateY(8px)` → `translateY(0)` | 450 `KB_EASE cubic-bezier(0.32, 0.72, 0, 1)`, backwards | M | L4431–4434 |
| `.card` | `translateY(12px)` → 0 | 450 KB_EASE | M | L4435 |
| `#continueBtn` | `translateY(12px)` → 0 | 450 KB_EASE | M | L4436 |
| tidy | reset at 460 ms (0 when reduced). Lottie `goToAndStop(0)` | — | — | L4440–4445 |

## 9 · Wrong code, 10 · Retype after a wrong code, and 11 · Verify code

`checkOtp()` (L4176–4188) adds `.is-checking` and `.is-loading`. The number pad slides down (`.otp.is-typing.is-checking .numpad { translateY(100%) }`, PPM, L750). The digit background goes to `#fff` (L761).

| Element | Props | Timing | Effective | Line |
|---|---|---|---|---|
| `.otp__wave` ×6 | opacity 0 (`cubic-bezier(0.45, 0, 0.55, 1)`) → 1 @0.72 (`cubic-bezier(0.5, 0, 0.75, 0)`) → 0 | 1000, delay `i·100`, Infinity, backwards | own | L4159–4167 |
| at `LOADING_MS` 1500: stopWave | opacity current → 0 | 220 `ease-out` | F | L4168–4174, L4182–4186 |

Wrong code (`showOtpError`, L4192–4202):

- `.otp__digit.is-error` turns `#d92626` / `#fff5f5` through the PPF transition (L1353).
- `.otp__digits.is-shaking` runs `field-shake 340ms cubic-bezier(.36,.07,.19,.97) both` (L1372, L4196).
- Haptic `error`.
- The number pad comes back up (PPM).
- The OTP error toast shows (shared).
- `autoClearOtpError` runs at 1700 ms. Each `.otp__num` fades opacity 1 → 0 at 220 `ease-out` (effective F; 1 ms when reduced), then re-renders after 220 ms (L4206–4212).
- Scene 10: any key cancels the fade and clears the error (L2544–2554).

Verify (`playOtpSuccess`, L4226–4281). `T(ms)` is 1 when reduced.

| Step | Element | Props | Authored | Effective | Delay / at | Line |
|---|---|---|---|---|---|---|
| 1 | `.otp__digit.is-verified` | border `#0f8857`, bg `#f6fefb` (PPF transition, `transition-delay: calc(var(--i)*40ms)`) and `digit-ok 420ms cubic-bezier(0.34, 1.4, 0.64, 1) both`: scale 1 → 1.06 @40% → 1, `animation-delay i·40ms` | CSS | — | i·40 | L763, L1352, L1373–1374, L4229 |
| 1 | success toast | drop-in (shared) + haptic `success` | — | — | 0 | L4231–4232 |
| 2 | success toast hide + `.otp.is-done` | everything except the boxes fades: `[data-rise]:not(.otp__digit)` and `.otp__header` go to opacity 0 at PPF, delay 0 | CSS | 200 | 1700 | L765–770, L4234–4237 |
| 3 | each `.otp__digit` | transform `translate(0, 0)` → `translate(dx, dy)` with dx = `187.5 − cx + (i−5)·2`, dy = `406 − cy` | `GLIDE` 340, `cubic-bezier(0.32, 0.72, 0, 1)`, forwards | M (reduced: 1 ms own) | 1760 | L4241–4253 |
| 3 | `.otp__num` for i < 5 | opacity 1 → 0 | 160 `ease-out`, delay 80 | F | 1760 + 80 | L4255–4256 |
| 4 | each `.otp__digit` | `translate(dx,dy) scale(1,1)` r12 op1 → `translate(dx−fan, dy) scale(0.7,0.54)` r50% op1 @0.55 → `scale(0.42,0.32)` r50% op0 | 260, `cubic-bezier(0.32, 0.72, 0, 1)`, forwards | M | at `GLIDE − 120` = 220 ms after step 3 | L4260–4270 |
| 4 | last `.otp__num` | opacity 1 → 0 | 110 `ease-out` | F | same | L4271–4272 |
| 5 | `#otpTick` video (tick_OTP render, 1126×2438 @60, 2.27 s) | `.is-playing` on `playing`. Haptic `medium` 160 ms later | — | — | +60 | L1584–1588, L2568–2575, L4275–4277 |
| 6 | `#walletIntro` video (2 s) | starts on tick `ended`. Revealed on `playing` | — | — | — | L2582–2599 |

Note: step 4 is scheduled 220 ms into a glide that actually runs for 540 ms, so it overrides the glide mid-flight. The authored 340 ms glide no longer applies.

## 12 · Pick your wallet skin (Wallet Intro reaches 1.5 s)

`revealSkin()` (L2725–2770) is triggered by rVFC `mediaTime >= 1.5` (`SKIN_AT`), with a setTimeout or `ended` as fallbacks (L4141–4155). It is **all pp:false (own)** and uses `fill: 'backwards'`. Reduced motion skips it.

| Element | Props | Duration / easing | Delay | Line |
|---|---|---|---|---|
| `.skin__bg` (first) | opacity 0 → 1 | 640, `FADE cubic-bezier(0.25, 0.1, 0.25, 1)` | 0 | L2743 |
| same | scale `1.08` → `1` | 1400, `IOS cubic-bezier(0.32, 0.72, 0, 1)` | 0 | L2744 |
| `.skin__steps` | translate `0 -8px` → `0 0` | 1000, `SOFT spring(0.88,0.6,1000)` | 180 | L2746 |
| `.skin__steps` | opacity 0 → 1 | 500 FADE | 180 | L2747 |
| `.skin__title` | translate `0 14px` → 0 | 1000 SOFT | 220 | L2750, L2753 |
| `.skin__title` | opacity 0 → 1, filter `blur(10px) drop-shadow(0 1px 7px rgba(0,0,0,.15))` → `blur(0px) drop-shadow(…)` | 700 FADE | 220 | L2751, L2753 |
| `.skin__sub` | translate `0 10px` → 0, plus opacity and `blur(10px)` → 0 | 1000 SOFT / 700 FADE | 300 | L2754 |
| front `.wcard` | transform `translateY(64px) scale(0.9)` → `none` | 1100, `CARD spring(0.8,0.58,1100)` | 360 (`FRONT_AT`) | L2759 |
| front | opacity 0 → 1 | 300 FADE | 360 | L2760 |
| mid `.wcard` | transform `rotate(-8deg) translate(-8.1px, 2.26px)` → none | 900, `FAN spring(0.78,0.5,900)` | 620 | L2761–2763 |
| mid | opacity 0 → 1 | 160 FADE | 620 | L2764 |
| back `.wcard` | `rotate(-18deg) translate(-1.17px, -4.91px)` → none | 900 FAN | 680 | same |
| back | opacity 0 → 1 | 160 FADE | 680 | same |
| `.skin__hint.is-on` | opacity 0 → 1 + translate `0 8px` → 0 | 700 IOS | 1000 | L2768 |
| haptic `medium` | — | — | 740 | L2766 |
| wallet intro pause | — | — | 900 | L2769 |
| hint cycle | toggle `.is-on` every 2600 ms (`setInterval`). CSS opacity PPF | — | — | L2716–2722, L857, L862 |

The stack poses are offsets from the front slot (L2622–2632):

| Pose | x | y | r | s | o |
|---|---|---|---|---|---|
| front | 0 | 0 | 0 | 1 | 1 |
| mid | 8.1 | −2.26 | 8° | 1 | 1 |
| back | 1.17 | 4.91 | 18° | 1 | 1 |
| dFront | −4.77 | 76.39 | 3° | 1 | 1 |
| dMid | 30.1 | −30.29 | 8° | 1 | .35 |
| dBack | −20.83 | −13.09 | 18° | 1 | .35 |
| confirm | −6.05 | 35.11 | 3° | 315.66/248.97 | 1 |
| keep | 0 | −101.5 | 0 | 300/248.97 | 1 |
| SPARE | = back, y + 14 | | | 0.9 | 0 |

## Skin-stack gestures (drag, live, not timed)

Pointer handlers at L2810–2849. Mode is locked after 6 px of travel.

- `dragUp`: rubber band `lift = -160·(1−e^(−d/190))`; `pu = clamp01(d/160)`; front r `−3·pu`°, s `1−0.04·pu`; mid mixes toward `{0,−8,0,1.05,1}` by `easeOut(pu)·0.7`; back mixes toward mid by `·0.55` (L2780–2788).
- `dragDown`: `DOWN_TRAVEL 220`, `COMMIT_AT 0.8`; `y = 120·(1−e^(−d/200))` (when dy < 0, y = dy·0.15); front r `3·sp`°, s `1+0.03·sp`; mid and back tuck toward `{0, y·0.9, 0, 0.86, 1}` by `easeOut(sp)` (back ×1.08); sheet `Y = 860 + (590−860)·easeOut(sp)`; `--hint-fade = clamp01(1 − sp·2.5)`; `.skin__keepgoing` opacity `clamp01(sp·2.5 − 0.4)`. Reaching 80% calls `confirmSkin()` immediately (L2793–2834).
- Release: an up-swipe commits if `−dy ≥ 70` or `v < −0.45` px/ms, measured over the last 6 samples (L2839–2844). Otherwise `springBackStack()` runs (L2850–2859):
  - front, mid and back are `tweenTo`'d their pose. Authored: `{1000, spring(0.62,0.48,1000)}` after an up-swipe, otherwise `{700, spring(0.86,0.45,700)}`. Effective: **M**.
  - `animSheet(860, 1, 0.9, 0.45, 700)`. The arguments are ignored; it runs a rAF over 540 ms on `ppMove` (L2678–2693).
  - `.skin__keepgoing` opacity → 0 at 200 `ease-out`. Effective: F.
- `.skin.is-dragging .skin__hint { transition: none }` (L863).

## 13 · Change skin (swipe up)

`changeSkin(v)` (L2882–2945). Haptic `medium`.

| Element | Props | Authored | Effective | Delay | Line |
|---|---|---|---|---|---|
| mid → front (`nf`) | tweenTo front pose without scale | 800, `STEP spring(0.72,0.44,800)` | M | 0 | L2894–2899 |
| `nf` | scale `current` → `1.07` @0.32 → `1` | 620, `cubic-bezier(0.3, 0.7, 0.4, 1)` | M | 0 | L2901–2902 |
| back → mid (`nm`) | tweenTo mid | 800 STEP | M | 30 | L2903 |
| thrown wallet (`fly`) | `from` (current translate/rotate/scale, op 1) → `{translate 0 peakY, rotate -3deg, scale 0.95, op 1}`, `peakY = min(y0−24, −200)` | 540, fill forwards | M | 0 | L2914–2924 |
| `fly` (at `RISE_AT` 200) | current → `{mid pose, s 0.9, o 1}` @0.86 → SPARE with opacity 0. z-index goes to 3 | 540 | M | 200 | L2925–2933 |
| haptic `light` | — | — | — | 360 | L2934 |
| new back (`nb`) | from `{mid, s 0.9, o 0}` tweenTo back pose | 700, `spring(0.76,0.46,700)` | M | 400, after image decode (fallback +300) | L2907–2911, L2937–2940 |
| `.skin__bg` (off layer) | opacity 0 → 1 + scale `1.06` → `1` | 640, `cubic-bezier(0.32, 0.72, 0, 1)` | M | after decode; old layer removed at 660 | L2862–2874 |
| unbusy | — | — | — | 580 | L2944 |

## 14 · Keep this skin (drag down past 80%)

`confirmSkin()` (L2953–2974). Haptic `medium`.

| Element | Props | Authored | Effective | Delay | Line |
|---|---|---|---|---|---|
| mid, back `.wcard` | tweenTo `{front pose, s 0.86, opacity 0}` | 300 `ease-out` | M | 0 | L2958–2959 |
| `.skin__keepgoing` | opacity → 0 | 200 `ease-out` | F | 0 | L2960 |
| pocket sheet | `animSheet(-24, flattenAbove, 0.9, 0.6, 820)`: Y from current → −24, with notch k = `clamp01(Y/500)` | rAF on `ppMove` | 540 | 0 | L2952, L2962 |
| front `.wcard` | tweenTo keep pose (y −101.5, s 300/248.97) | 900, `spring(0.84,0.54,900)` | M | 0 | L2963 |
| `.skin__keep-head` | opacity 0 → 1 + translate `0 -20px` → 0 | 620 IOS | M | 240 | L2968 |
| `.skin__ksteps` (`display:none`, L877) | opacity + `0 -8px` | 480 IOS | M | 290 | L2969 |
| `.skin__keep-copy` | opacity + `0 16px` | 600 IOS | M | 260 | L2970 |
| `.skin__keep-bar` | opacity + `0 32px` | 640 IOS | M | 320 | L2971 |
| haptic `light` / unbusy | — | — | — | 380 / 650 | L2972–2973 |

## 15 · Pick a different skin

`pickDifferentSkin()` (L2979–3017). Haptic `light`.

| Element | Props | Authored | Effective | Delay | Line |
|---|---|---|---|---|---|
| `.skin__keep-bar` | opacity 1 → 0, translate 0 → `0 24px` | 220, `OUT cubic-bezier(0.4, 0, 0.6, 1)`, forwards | M | 0 | L2987–2989 |
| `.skin__keep-copy` | same, 12px | 220 OUT | M | 30 | L2990 |
| `.skin__ksteps` | same, −6px | 220 OUT | M | 40 | L2991 |
| `.skin__keep-head` | same, −16px | 220 OUT | M | 40 | L2992 |
| sheet | `animSheet(860, flattenAbove, 0.96, 0.78, 950)` | rAF ppMove | 540 | 60 (setTimeout) | L3000 |
| front | tweenTo front pose | 900, `spring(0.88,0.56,900)` | M | 60 | L3001 |
| `.skin__bg.is-on` | scale `1.04` → `1` | 1000 IOS | M | 60 | L3004 |
| mid / back | from `{front, s 0.9}` (kf `spring(0.76,0.46,760)`) → own pose | 760 | M | 420 / 470 | L3006–3009 |
| mid / back | opacity 0 → 1 | 160 `ease-out` | F | 420 / 470 | L3011 |
| haptic `light` / unbusy | — | — | — | 600 / 820 | L3015–3016 |

## 16 · Choose an avatar (tap "Confirm skin")

`showAvatar()` (L3031–3069). The same tap also asks for DeviceMotion permission (L3391). Haptic `success`. Note: the locals `POP spring(0.62,0.55,1000)`, `SOFT spring(0.86,0.55,900)` and `fadeUp` at L3038–3064 are defined but never used.

| Element | Props | Authored | Effective | Delay | Line |
|---|---|---|---|---|---|
| wallet (front) | tweenTo translate `0px -128px`, scale `0.86`, opacity 0 | 340 OUT | M | 0 | L3043 |
| wallet | filter `blur(0px)` → `blur(6px)` | 340 OUT | F | 0 | L3044 |
| `.skin__keep-head` | opacity 1 → 0, translate → `0 -10px` | 300 OUT, forwards | M | 0 | L3045–3046 |
| `.skin__keep-copy` | → `0 -14px` | 300 OUT | M | 40 | same |
| `.skin__different` | opacity 1 → 0 | 180 OUT | F | 0 | L3047 |
| `.av__page` | opacity 0 → 1 | 360 FADE | F | 140 | L3054 |
| `.av__cta` (shared button) | translate `-0.4px -51.2px` → `0 0`, scale `335/343 1` → `1 1` | 820, kf `spring(0.86,0.6,820)` | M | 0 | L3056–3057 |
| `.av__cta-from` | opacity 1 → 0 | 260 FADE | F | 120 | L3058 |
| `.av__cta-to` | opacity 0 → 1 | 260 FADE | F | 220 | L3059 |
| `.av__bg` | opacity 0 → 1, translate `0 -12px` → 0 | 700 IOS | M | 180 | L3065 |
| `.av__back` | opacity 0 → 1, scale `0.8` → `1` | 600 IOS | M | 420 | L3066 |
| `avatarBuild(0)` | see below | | | | L3067 |
| unbusy | — | — | — | 1000 | L3068 |

`avatarBuild(t, titleAt)` (L3072–3121), where `D(ms) = max(0, ms − t)`:

| Element | Props | Authored | Effective | Delay | Line |
|---|---|---|---|---|---|
| `.av__title-in` | opacity 0 → 1, translate `0 18px` → 0, filter `blur(6px)` → `blur(0px)` | 700 IOS | M | `titleAt ?? D(240)` | L3077–3081 |
| `.av__glow` | opacity 0 → 1, scale `0.6` → `1`, rotate `-60deg` → `-15deg` | 1000 IOS | M | D(300) | L3083 |
| current `.av__big-img` | translate `0 300px` → `0 0` | 860, kf `spring(0.7,0.52,860)` | M | D(420) | L3085–3086 |
| `.av__swoosh-path` | strokeDashoffset `len` → `0` (dasharray = len) | 900, `cubic-bezier(0.65, 0, 0.35, 1)` | M | D(460) | L3088–3090 |
| `.av__sparkle--l` / `--s` | opacity 0 → 1, scale `0.2` → `1`, rotate `-120deg` → `0deg` | 1000, kf `POP spring(0.62,0.55,1000)` | M | D(640) / D(760) | L3092–3093 |
| twinkle (l / s) | scale 1 → .9 / .82 → 1 and rotate 0 → −8deg / 12deg → 0 | 2800 / 2200, `ease-in-out`, Infinity | own | starts at delay + 1000 | L3094–3097 |
| centre `.av__item-in` | scale `0.2` → `1` (kf POP) | 900 | M | `ROW_POP` = D(560) | L3106–3107 |
| centre | opacity 0 → 1 | 160 FADE | F | D(560) | L3108 |
| other `.av__item-in` | translate `dx px 0` → 0 and scale `0.7` → `1`, with `dx = (slotX(0) − slotX(s))/sc`, kf `FAN spring(0.74,0.5,900)` | 900 | M | `ROW_POP + 100 + (min(|round(s)|,3) − 1)·40` | L3111–3115 |
| other | opacity 0 → 1 | 220 FADE | F | same | L3116 |
| `.av__ring` | scale `0.2` → `1` (POP) | 900 | M | ROW_POP | L3118 |
| `.av__ring` | opacity 0 → 1 | 160 FADE | F | ROW_POP | L3119 |
| haptic `light` | — | — | — | D(700) | L3120 |

## 17 · Back to Keep this skin

`backToKeep()` (L3123–3156). Twinkles are cancelled.

| Element | Props | Authored | Effective | Delay | Line |
|---|---|---|---|---|---|
| every avatar child except `.av__bar` | opacity 1 → 0 | 320 OUT, forwards | F | 0 | L3133–3134 |
| `.av__cta` | translate `0 0` → `-0.4px -51.2px`, scale `1 1` → `335/343 1` | 680, kf `spring(0.88,0.55,680)`, forwards | M | 0 | L3135–3136 |
| `.av__cta-to` | opacity 1 → 0 | 220 FADE | F | 60 | L3137 |
| `.av__cta-from` | opacity 0 → 1 | 240 FADE | F | 160 | L3138 |
| wallet | from `{keep, s keep·0.9, o 0}` tweenTo keep pose | 900, `spring(0.8,0.55,900)` | M | 120 | L3150–3151 |
| `.skin__keep-head` | opacity 0 → 1, `0 -16px` → 0 | 600 IOS | M | 160 | L3152 |
| `.skin__keep-copy` | `0 14px` | 600 IOS | M | 200 | L3153 |
| `.skin__different` | `0 12px` | 560 IOS | M | 260 | L3155 |

## 18 · Change avatar (swipe the row, tap, or shake)

Row: a rAF spring (L3220–3233) with `K 260`, `C = 2√K·0.86`, `dt ≤ 1/30`. It rests at `|Δ| < 0.0008` and `|v| < 0.01`.

- Drag maps `rowPos = pos0 − dx/78` after a 5 px slop (L3247–3255).
- Release: `rowVel` is measured over 6 samples in items per second. A flick faster than 1.6 targets `round(pos + v·0.09)`: at least one item and at most ±2 (L3264–3275).
- `renderRow`: slot curve `SLOT_X = [-32.18, 35.82, 103.82, 188, 271.82, 339.82, 407.82]`, with 68 px spacing beyond the ends. Scale is `1 + (72/59.633 − 1)·max(0, 1−|s|)`. Items with |s| > 3.6 are hidden (L3184–3218).

`swapBig(i)` (L3298–3320). All of these are effective timings (`pp:false`):

| Element | Props | Duration / easing | Delay | Line |
|---|---|---|---|---|
| outgoing `.av__big-img` | translate `0 yOut` → `0 340px` | 380, `cubic-bezier(0.45, 0, 0.75, 0.3)` | 0 | L3307 |
| incoming | translate `0 300px` → `0 0` | 760, `spring(0.84,0.56,760)`, backwards | 130 | L3312 |
| new `.av__glow-l` | opacity 0 → 1 (old layers removed once it finishes) | 560, `cubic-bezier(0.4, 0, 0.2, 1)`, backwards | 100 | L3286–3297 |
| `.av__ring` | scale 1 → 1.06 @0.4 → 1 | 520, `cubic-bezier(0.37, 0, 0.3, 1)` | 70 | L3314 |
| `.av__sparkle--l` | `--spin` now → accumulated `+180deg` (registered `@property --spin <angle>`, L953–954) | 900, `spring(0.84,0.78,900)`, backwards | 70 | L3318, L3322–3330 |
| `.av__sparkle--s` | `--spin` → `−180deg` | same | 70 | L3319 |

Haptic `light` on touchend or click when the selected avatar changed (L3280–3281).

Shake: DeviceMotion with jolts ≥ 14 m/s², 3 of them within 700 ms (hits more than 80 ms apart), cooldown 1100 ms, random offset from [−2, −1, 1, 2], and `navigator.vibrate(18)` (L3339–3379). **There is no device-motion parallax anywhere in the file.** DeviceMotion is only used for shake detection.

## 19 · Your interests (Continue on the avatar page)

`showInterests()` (L3434–3491). Haptic `success`. The local `POP spring(0.6,0.5,900)` (L3442) is unused. All exits use `fill: 'forwards'` through `ex()`.

| Element | Props | Authored | Effective | Delay | Line |
|---|---|---|---|---|---|
| `.av__title-in` | opacity 1 → 0, translate 0 → `0 -12px`, `blur(0px)` → `blur(6px)` | 260 OUT | M | 0 | L3447 |
| big avatar | translate `0 0` → `0 340px` | 320, `cubic-bezier(0.5, 0, 0.75, 0.15)` | M | 0 | L3449 |
| `.av__glow` | opacity 1 → 0, scale 1 → `0.82` | 320 OUT | M | 90 | L3450 |
| `.av__swoosh` | opacity 1 → 0 | 220 OUT | F | 0 | L3451 |
| sparkles | opacity → 0, scale → `0.3` | 260 OUT | M | 0 | L3452 |
| row items | opacity → 0, translate → `dx px 0`, scale → `0.7` | 280 OUT | M | 0 | L3453–3458 |
| `.av__ring` | opacity → 0, scale → `0.6` | 240 OUT | M | 0 | L3459 |
| `.int__page`, `.int__dock`, `.int__bg`, `.int__back` | opacity 0 → 1 | 300 FADE | F | 140 | L3470–3471 |
| `.int__title-in` | opacity, `0 16px`, `blur(6px)` → clear | 680 IOS | M | 260 | L3472–3475 |
| `.int__sub` | same with 10px | 680 IOS | M | 280 | L3476 |
| each `.ich` | opacity 0 → 1, translate `0 16px` → 0, scale `0.95` → `1` (kf `spring(0.8,0.5,800)`) | 800 | M | `300 + (r·2 + c)·40` | L3477–3479 |
| each `.ich` | opacity 0 → 1 | 220 FADE | F | same | L3480 |
| `.int__cta` | `.is-instant` toggled for a snap start; translate `0 31.2px` → `0 0` (kf `spring(0.86,0.55,760)`) | 760 | M | 0 | L3483–3487 |
| `.int__cta` | goes Disabled at 240 ms (CSS cross-fade) | — | — | 240 | L3488 |
| `.int__skip` | opacity 0 → 1, `0 8px` → 0 | 520 IOS | M | 560 | L3489 |

## 20 · Back to avatar

`backToAvatar()` (L3493–3526), then `avatarBuild(160, 240)`.

| Element | Props | Authored | Effective | Delay | Line |
|---|---|---|---|---|---|
| `.int__title` | opacity 1 → 0, `0 0` → `0 -10px` | 160 OUT | M | 0 | L3500 |
| `.int__sub` | fadeOut to −8 | 220 OUT | M | 0 | L3498, L3501 |
| `.ich` | fadeOut to 14px | 220 OUT | M | `(4 − r)·25` | L3502 |
| `.int__skip` | fadeOut to 8px | 220 | M | 0 | L3503 |
| `.int__cta` | translate 0 → `0 31.2px` (kf `spring(0.88,0.5,620)`) | 620, forwards | M | 0 | L3508 |
| `.int__page` | opacity 1 → 0 | 280 OUT | F | 120 | L3509 |
| `.int__dock` | opacity 1 → 0 | 240 OUT | F | 80 | L3511 |
| `.int__bg`, `.int__back` | opacity 1 → 0 | 280 OUT | F | 120 | L3514–3515 |
| avatar page | `avatarBuild(160, 240)`, so every delay is `max(0, ms − 160)` and the title delay is 240 | (see 16) | | | L3525 |

## 21 · Pick interests (tap chips)

| Element | Props | Authored | Effective | Line |
|---|---|---|---|---|
| `.ich` | scale `0.965` → `1.02` (picked) or `1` (dropped) @0.4 → `1` | 420, `cubic-bezier(0.3, 0.7, 0.4, 1)` | M | L3424 |
| `.ich__ico` when picked | translate 0 → `0 -7px` @0.35 → 0, rotate 0 → `-8deg` → 0, scale 1 → `1.08` → 1 | 620, same curve | M | L3427–3428 |
| `.ich__ico` when dropped | scale `0.94` → `1` | 320, same curve | M | L3429 |
| `.int__cta` on enable (3 picks, `INT_MIN`) | transform `scale(0.96)` → `scale(1.015)` @0.45 → `scale(1)` | 560, same curve | M | L3405–3414 |
| `.ich__sel` / labels | CSS opacity PPF | — | 200 | L988–997 |

## 22 · Selected wallet → Home (Continue on Interests)

`showHome()` (L3577–3623) is **all pp:false**. Haptic `success`.

| Element | Props | Duration / easing | Delay | Line |
|---|---|---|---|---|
| `.int__title` | opacity 1 → 0, translate → `0 -8px` (scale 1 → 1 implied) | 220, `EXIT cubic-bezier(0.4, 0, 0.7, 0.4)`, forwards | 0 | L3595–3597 |
| `.int__sub` | → `0 -6px` | 220 EXIT | 0 | L3598 |
| `.ich` | opacity → 0, scale → `0.96` | 220 EXIT | `r·12` | L3599 |
| `.int__bar` | → `0 8px` | 220 EXIT | 30 | L3600 |
| `.int__skip` | → `0 6px` | 220 EXIT | 30 | L3601 |
| `.int__back` | opacity → 0 | 220 EXIT | 0 | L3602 |
| `.hm__selbg` | opacity 0 → 1 | 260 FADE | 60 | L3609 |
| `.hm__card` | opacity 0 → 1 | 200 FADE (240 reduced) | `POP_AT` 220 (120 reduced) | L3612–3614 |
| `.hm__card` | transform `translate(0, 176px) scale(320/272·0.86)` → `translate(0, 140px) scale(320/272)` | 700, `spring(0.74,0.44,700)` (skipped when reduced) | 220 | L3557–3558, L3615–3618 |
| haptic `heavy` | — | — | 480 | L3621 |
| `homeBuild` | — | — | 840 (620 reduced) | L3622 |

`homeBuild(rm)` (L3624–3676) is pp:false through `go()`:

| Element | Props | Duration / easing | Delay | Line |
|---|---|---|---|---|
| `.hm__selbg` | opacity 1 → 0 | 460 FADE (300 reduced) | 220 (0 reduced) | L3637 |
| `.hm__card` | transform `translate(0px, 140px) scale(320/272)` → `translate(0px, 0px) scale(1)` | 820, `CLOSE cubic-bezier(0.22, 1, 0.36, 1)` | 0 | L3629, L3655 |
| `.hm__wbg`, `.hm__veil`, `.hm__bar` | translate `0 -577px` → `0 0` | 820 CLOSE | 0 | L3657 |
| `.hm__market`, `.hm__tasks` | translate `0 342px` → `0 0` | 820 CLOSE | 60 | L3659 |
| `.hm__switcher` | rise: translate `0 -10px` → 0 at 560 `EASE` (= iOS curve) plus opacity 0 → 1 at 280 FADE | — | 260 | L3649–3652, L3661 |
| `.hm__nav` | rise 24px | same | 300 | L3662 |
| `.hm__ask` | rise 10px | same | 300 | L3663 |
| `.hm__ready` | rise 10px | same | 340 | L3664 |
| `.hm__topup` | rise 10px | same | 380 | L3665 |
| `.hm__tag`, `.hm__cactus--l`, `.hm__cactus--r` | scale `0.94` → `1` at 600 EASE, plus opacity at 300 FADE | — | `400 + i·30` | L3666–3669 |
| haptic `medium` | — | — | 520 | L3656 |
| shimmer | `--shimmer-at: 0.3s`; `.is-loading` turns on `hmShimmer 1.867s linear 0.3s infinite both` on `.hm__skel::after` (a 195px band skewed −17°) | — | — | L1109–1126, L3672–3673 |
| reduced: `.hm__content`, `.hm__nav` | opacity 0 → 1 at 240, **not pp:false** | effective F (200) | 0 | L3642–3646 |
| `homeDone` | — | — | 900 (360 reduced) | L3675 |

`revealMarketCards()` runs at 1100 ms (L3674, L3681–3698). It is pp:false with `fill: 'both'`, and the delay is `col·45 + row·140`.

| Element | Props | Duration / easing | Line |
|---|---|---|---|
| `.hm__mkcard` | translate `0 17.5px` → `0 0` | 260, `CARD_RISE` = linear() of `1−(1−t)^2.5` (25 samples) | L3687 |
| `.hm__mkcard` | opacity 0 → 1 | 180, `CARD_FADE` = `1−(1−t)^2.8` | L3688 |
| `.hm__skel` | opacity 1 → 0 | 353, `cubic-bezier(0.25, 0.1, 0.25, 1)` | L3689 |
| haptic `selection` | at 140 and 280 ms | — | L3692 |

## 23 · Scroll, header collapses, and 24 · Back to top, header expands

A rAF spring (L3706–3756). The scroll only picks the target: 1 when `scrollTop > 12`, 0 when `< 4`.

- `K = (2π/0.34)²`, `C = 2·0.86·√K`, semi-implicit Euler with dt ≤ 0.032 s. It rests at `|Δ| < 0.0005` and `|v| < 0.005`.
- Velocity is kept when the target reverses.
- Reduced motion jumps straight to the target.

`paintHdr` (L3715–3723) writes these properties, with p clamped to [0, 1.02] and q = min(1, p):

- `--p = p`
- `--big = 1 − smooth01(.2, .6, q)`
- `--bs = 1 − 0.1·smooth01(.1, .6, q)`
- `--mini = smooth01(.25, .7, q)`
- `--ms = 0.8 + 0.2·smooth01(.2, .85, q)`

The CSS reads them (L1081–1098):

| Selector | Property driven by `--p` |
|---|---|
| `.hm__switcher` | top `45px + 1.5px·p`, height `92px − 32px·p`, gap `6px + 2px·p` |
| `.hm__tile` | width `73px + 5px·p` (sm: `+15px·p`), height `76px − 32px·p`, radius `15px − 1px·p`, bg alpha `.95 + .05·p` (min tile: `.95·(1−p)`), shadow alpha `.1·p` |
| `.hm__tbig` | `translate(-50%,-50%) scale((1 − 0.4211·p)·--bs)`, opacity `--big` |
| `.hm__tmini` | `scale(--ms)`, opacity `--mini` |
| `.hm__veil` mask | `#000 calc(97px + 22px·p)`, transparent `calc(137px + 32px·p)` (L1044–1045) |

The backdrop, veil and bar are CSS sticky, with no script.

## 25 · End of page, footer reveal

`clipFoot()` (L3742–3747) runs on every scroll rAF: `t = clamp(0, 390, game.offsetTop + game.offsetHeight − 30 − scrollTop − 422)`, then `clip-path: inset(t px 0 0 0)`.

## 26 · Double-tap nano, the bell

A second tap within 320 ms and 24 px (L3782–3786) calls `ringBell()` (L3768–3781): haptic `medium` and `home-notification` Lottie `goToAndPlay(0, true)`.

| Element | Props | Duration / easing | Delay | Line |
|---|---|---|---|---|
| `.hm__bdg` | scale 0 → 1 (origin `10.9px 9.9px`) | 560, `spring(0.55,0.36,560)`, fill both, pp:false | 420 (0 reduced) | L1186–1187, L3779–3780 |

## 27 · Tap the bell, Updates Today

`openNotif()` (L3882–3938) is pp:false. With reduced motion, `go()` uses duration `min(dur, 200)` and delay 0.

| Element | Props | Duration / easing | Delay | Fill | Line |
|---|---|---|---|---|---|
| `.hm__notif` (origin `327.69px 600.68px`) | scale 1 op 1 → `.86` op 1 @.35 → `.4` op 0 | 300, `cubic-bezier(.4,0,.2,1)` | 0 | forwards | L3899–3901 |
| `.nt__scrim` | opacity 0 → 1 | 480, `cubic-bezier(0.3, 0, 0.2, 1)` | 0 | both | L3903 |
| notification-cards Lottie | `goToAndStop(0)` then `play()` | — | 90 (0 reduced) | — | L3904 |
| `.nt__head` | translate `0 226px` → `0 0`, scale `1.12` → `1` (skipped when reduced) | 820, `GLIDE spring(0.9,0.55,820)` | `MOVE_AT` 1250 | both | L3907–3908 |
| front `.nt__card` | translate `0 560px` → `0 0` (reduced: opacity 0 → 1 at 200 OUT) | 900, `DEAL spring(0.97,0.6,900)` | 1250 | both | L3914–3916 |
| behind 1 / 2 | same deal rise **plus** an additive layer: translate `0 -26px` / `0 -40px` → 0 and scale `.985` → `1` | 850, `PEEK spring(0.95,0.55,850)`, `composite: 'add'` | 1550 / 1630 | both | L3923–3931 |
| haptic `heavy` ×3 | — | — | 1630, 1830, 1910 | — | L3934 |
| `.nt__foot` | opacity 0 → 1, translate `0 12px` → 0 | 520, `cubic-bezier(0.22, 1, 0.36, 1)` | 1890 | both | L3936 |
| `.nt__line` | opacity 0 → 1 | 800, same | 1550 | both | L3937 |

Card slots (L3815–3825). Transform `translateY(ty) scale(sx, sy)` with origin `50% 0`; veil tint per slot:

| Slot | ty | sx | sy | veil | tint |
|---|---|---|---|---|---|
| 0 | 0 | 1 | 1 | 0 | `#f2f2fa` |
| 1 | 34 | 311/335 | 380/400 | 1 | `#f2f2fa` |
| 2 | 66.04 | 287/335 | 360/400 | 1 | `#e5e5f2` |
| 3 (hidden) | 84 | 263/335 | 340/400 | 1 | `#e5e5f2` |

## 28 · Drag a card, springs back; 29 · Swipe; 30 · Flick; 31 · Last card

Live drag (L4001–4027):

- The front card gets `translate(dx, dy·0.22) rotate(dx·0.06deg)` with origin `50% 125%`.
- The rest of the stack moves `min(1, |dx|/160)·0.4` of the way toward the next slot.
- Haptic `selection` when the drag crosses 110 px in either direction.

Release (L4028–4036) throws the card if `|dx| > 110` or if `|vx| > 0.55 px/ms` in the drag direction with `|dx| > 24`. Otherwise it springs back.

`springBack` (L4039–4050), pp:false:

| Element | Props | Duration / easing |
|---|---|---|
| front | transform `from` → `translate(0px, 0px) rotate(0deg)` | 720, `BACK spring(0.55,0.42,720)` |
| behind | transform → slot | 760, `SETTLE spring(0.92,0.5,760)` |
| veil | opacity → slot value | 380, `cubic-bezier(.22,1,.36,1)` |
| haptic `selection` | queued, if `|dx| > 12` | — |

`throwCard` (L4051–4082), pp:false:

| Element | Props | Duration / easing | Delay | Line |
|---|---|---|---|---|
| front | `{transform: from, opacity 1}` → `{endT, op 1, offset .7}` → `{endT, op 0}`, with `endT = translate(dir·(420 + |dx|·0.4)px, (dy·0.22 + 40)px) rotate(dir·(16 + min(14, |vx|·8))deg)` | `dur = max(260, min(460, 520 − |vx|·140))`, `cubic-bezier(.25,.6,.35,1)` | 0 | L4055–4061 |
| `.nt__pager` (last card only) | opacity 1 → 0, scale 1 → `.9` | 220, `cubic-bezier(.4, 0, .2, 1)`, forwards | `round(dur·0.2)` | L4064–4067 |
| pager number (other cards) | old `<b>`: translate 0 → `0 -12px`, opacity → 0 at 200. New: `0 12px` → 0, opacity 0 → 1 at 260. Both `cubic-bezier(.22, 1, .36, 1)` | — | 0 | L3861–3875 |
| `.nt__foot p` hint | `.is-gone` sets opacity 0 and `translate 0 4px` with the CSS `.26s cubic-bezier(.4,0,.2,1)` transition | 260 | 0 | L1254–1255, L4069 |
| each remaining card k | transform → slot k | 760 SETTLE, backwards | `k·60` | L4076 |
| its veil | opacity → slot | 380 (k = 0) or 480, `cubic-bezier(.22,1,.36,1)` | `k·60` | L4077 |
| newly visible card or k = 2 | opacity 0 → 1 | 480, same | 140 | L4078 |
| haptics | `heavy` (queued), then `light` at 300; when the last card goes, `success` at 260 and `closeNotif` at 380 | — | — | L4053, L4080–4081 |

Keyboard: ArrowLeft and ArrowRight throw the card with `vx = 0.8` (L4088–4091).

## 32 · Tap outside, close

`closeNotif()` (L3944–3980). pp:false with forwards fill. With reduced motion, `go()` uses `min(dur, 160)` and delay 0. Running animations are committed and cancelled first.

| Element | Props | Duration / easing | Delay | Line |
|---|---|---|---|---|
| `#ntStack` (origin `50% 35%`) | opacity 1 → 0, translate → `0 48px`, scale → `.94` | 260, `EXIT cubic-bezier(0.4, 0, 0.75, 0.3)` | 0 | L3955–3958 |
| `.nt__foot` | → opacity 0, `0 10px` | 160 EXIT | 0 | L3959 |
| `.nt__line` | → opacity 0 | 200 EXIT | 0 | L3960 |
| `.nt__head` | → opacity 0, `0 -14px` | 220 EXIT | 0 | L3961 |
| `.nt__scrim` | → opacity 0 | 440, `LIFT cubic-bezier(0.45, 0, 0.2, 1)` | 150 | L3963 |
| bell | `ringBell()` again if any cards are unread, otherwise `has-bell` is removed | — | 330 (0 reduced) | L3973–3979 |

---

## Phone keyboard avoidance

See scene 2. The CSS transition is 450 ms `cubic-bezier(0.32, 0.72, 0, 1)` on `.is-touch .screen` (transform) and `.is-touch .toast` (translate). The values come from `avoidKeyboard()` (L4352–4400). `sizeApp` re-measures 300 ms after `orientationchange` and 600 ms after `focusout` (L2050–2051).

## Prototype chrome (not app UI)

| Selector | Motion | Line |
|---|---|---|
| `.vswitch__b` | bg, color and transform at 160ms `cubic-bezier(.23, 1, .32, 1)`. `:active` scale(.97) | L1424, L1428 |
| `.vswitch__reset svg` | transform .45s `cubic-bezier(.2, .9, .3, 1)`. Hover rotate(−35deg). `.is-spinning` rotate(−360deg) at .5s; reloads after 260 ms | L1435–1437, L4457 |
| `.vswitch__spec::after` tooltip | opacity and transform at 125ms `cubic-bezier(.23, 1, .32, 1)`, `translate(4px,-50%)` → `translate(0,-50%)` | L1440–1445 |

The spec sheet's own UI (`spec/index.html` L61–63, L288–302) uses `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`, `--d-press 160ms`, `--d-swap 180ms` and `--d-popover 150ms`. Its toast takes 200ms in and 120ms out. Reduced motion forces animations to 1ms and transitions to 80ms. These belong to the spec tool, not the app.

---

## Discrepancies and uncertainties

1. **Authored vs effective timing.** Every WAAPI call without `pp:false` is re-timed (see the top of this file). Springs written into those calls never run: intro RISE and POP, all toast springs, STEP, surface, the keep and pick fronts, avatar build, interests chips, and others. The same goes for `DROP_SPRING` (L2164), `KB_EASE` 450 ms (L4433) and the OTP `GLIDE` 340 ms (L4253). `spec/index.html` uses the effective values (L427–430), so the spec and the code agree at runtime.
2. `springImpact(0.52, 0.45)` evaluates to 177.559… ms. The comment at L2302 says "≈ 150 ms".
3. `OTP_LAND_MS = 1360` is commented "800 + rise 560" (L2475), and spec L605 repeats that. The CSS rise is `--pp-move-ms` = 540, so the last item actually lands at 1340.
4. The back-to-email comment (L4411) says the sheet "fades (380 ms)". The CSS fade is 200 ms (L741).
5. The spec labels the email and OTP shake easing as `C('io')` = `cubic-bezier(0.45, 0, 0.55, 1)` in scenes 5 and 9 (spec L567, L630). The actual keyframe animation uses `cubic-bezier(.36,.07,.19,.97)`; spec scene 4 (L561) has it right.
6. The spec sets `TICK_MS = 2300` (spec L497). The tick video comment says 2.27 s (L1584), and success-tick.json is 136 frames at 60 fps = 2266.67 ms.
7. Spec scenes 2 and 3 say the lift is "450 ms on phones". On touch devices `.main`, `.action-bar`, `.logo__mark` and `.otp__*` still transition on `--kb-dur` (540 PP). Only the whole-frame `.screen` keyboard lift and the toast offset use 450 ms.
8. The spec's `CURVE.hdr` ("1 − (1 − t)^1.8") and `CURVE.scroll` exist only in the spec. Neither is in index.html, and `hdr` is never used in a spec row. The header uses the rAF spring.
9. The spec's `SPR.pp` (w 16.75, ζ 0.81) is a fit of `PP.MOVE`. index.html has only the sampled stops.
10. `animSheet(toY, toK, zeta, response, ms)` ignores its last three arguments (L2678–2681).
11. Unused locals: `showAvatar` POP, SOFT and fadeUp (L3038–3064), and `showInterests` POP (L3442).
12. `.skin__ksteps` is `display:none` (L877) but is still animated (L2969, L2991).
13. Reduced motion is not applied by the motion layer. Many flows have no reduced-motion branch (see motion-tokens.json `reduced_motion.gaps`). The reduced-motion toast hide (160) and the home content fade (240) get re-timed to 200.
14. Spec scene 13's "next skin" delay of 417 is a measurement. In the code it is `RISE_AT + 200` = 400 plus the image decode time, with a 300 ms fallback, so it varies at runtime.
15. The brief mentioned "device-motion parallax". None exists; DeviceMotion is only used for shake-to-change-avatar.
16. Per-keyframe easings inside re-timed calls (the toast squash `SQ`, the toast exit segments, the spring easings on intro keyframes) are removed, so the segment shapes differ from what the code reads as.

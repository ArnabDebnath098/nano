# noon NANO: Lottie files

These four files are copied unchanged from `assets/lottie/` at commit f137e63; the SHA-1 checksums match the source. Line numbers refer to `index.html`. Every animation is loaded with `lottie.loadAnimation({ renderer: 'svg', loop: false, autoplay: false, path })`, using `vendor/lottie.min.js` (L1862). The prototype never calls `setSpeed`, `playSegments` or `setDirection`.

| File | w × h | fr | ip → op | Duration | Layers (top-level / inside precomps) | Bodymovin |
|---|---|---|---|---|---|---|
| email-pop.json | 480 × 280 | 60 | 0 → 150 | 150/60 s = **2500 ms** | 6 / 0 (SPARK_BIG, SPARK_SM, CHECK_BADGE, ENVELOPE, SWOOSH_TRIM, SWOOSH); 5 image assets | 5.7.0 |
| home-notification.json | 512 × 512 | 60 | 0 → 90 | 90/60 s = **1500 ms** | 1 / 5 (one precomp layer, "Bell artwork - native Lottie motion", layer op 180, clipped by the comp's op 90); 2 image assets | 5.7.0 |
| notification-cards.json | 512 × 512 | 60 | 0 → 115 | 115/60 s = **1916.666… ms** | 1 / 16 (precomp layer "Bell big", layer ip −5); 3 image assets | 5.7.0 |
| success-tick.json | 750 × 1624 | 60 | 0 → 136 | 136/60 s = **2266.666… ms** | 5 / 25 (Vector 2, Vector, Null 113, Coin, Pre-comp 2_LOTTIE; 4 precomps); 1 image asset | 5.9.0 |

## How index.html triggers each one

### email-pop.json: OTP "Check your mail" header
- **Loaded:** `ensureOtpLottie()` (L2462–2472) into `#otpLottie`. It is preloaded at startup (L2473).
- **Placement:** `.otp__lottie` sits at left −36.13px, top 83.32px, 480×280, with `transform: scale(0.9183)` and origin 0 0 (L605–615). It is inside `.otp__art`, which scales to 0.7 when the number pad opens (L1322).
- **Play:** in `showOtpScreen()`, once the animation is loaded (`isLoaded`, otherwise on `DOMLoaded`), `setTimeout(() => anim.goToAndPlay(0, true), 120)` runs (L2490–2497). It plays once at normal speed with no loop.
- **Reduced motion:** `anim.goToAndStop(anim.totalFrames - 1, true)`, which shows the last frame (L2493).
- **Reset:** back-to-email calls `otpAnim.goToAndStop(0, true)` after 460 ms (L4444).

### home-notification.json: home "bell (fixed)"
- **Loaded:** `ensureBell()` (L3760–3765) into `#homeBell`. `preloadHome()` preloads it when Interests opens (L3563).
- **Placement:** `.hm__notif-bell` is at 279.19px, 553.68px, 512×512, `scale(0.199)`, origin 0 0 (L1183–1185). It is visible while `.hm.has-bell` is set (L1182).
- **Play:** `ringBell()` calls `a.goToAndPlay(0, true)` (L3776). The CSS comment says it "pops from 0 with an overshoot, swings, rests by frame 72" (L1177–1178). The JS comment says it "lands ~0.53 s" (L3776). The spec says 112% at f13, settles f32, ±14° swing, rests by f72 (spec L861).
  - **Triggers:** a double-tap on the nano tile, i.e. a second click within 320 ms and 24 px (L3782–3786). It also plays from `closeNotif()` 330 ms after close (0 with reduced motion) when unread updates remain (L3973–3979).
  - **Paired motion:** the badge `.hm__bdg` scales 0 → 1 over 560 ms with `spring(0.55, 0.36, 560)`, delayed 420 ms (0 with reduced motion) (L3779–3780).
- **Reset:** `goToAndStop(0, true)` in `hideHome()` (L4100).

### notification-cards.json: "Updates Today!" header
- **Loaded:** `ensureNt()` (L3876–3881) into `#notifHead`. It is preloaded by `preloadHome()` (L3564).
- **Placement:** `.nt__head` is at −69px, −80px, 512×512, `transform: scale(.5)`, origin 50% 50% (L1201–1203). The CSS comment says the lottie-web matte layer order was fixed in the JSON (L1196).
- **Play:** in `openNotif()` it runs `a.goToAndStop(0, true); setTimeout(() => ntOpen && a.play(), rm ? 0 : 90)` (L3904). While it plays, the header holds at `translate 0 226px, scale 1.12`. At `MOVE_AT` = 1250 ms it glides to rest over 820 ms on `spring(0.9, 0.55, 820)` (L3907–3908). The spec gives the words sweeping in at f50–67 (spec L869).
- **Close / reset:** `ntAnim.pause()` on close (L3954) and `goToAndStop(0, true)` once the scrim has faded (L3970). The same reset runs in `hideHome()` (L4111).

### success-tick.json: OTP verified tick
- **index.html never loads this JSON.** The HTML comment says it is "tick_OTP.lottie pre-rendered to video (1126 × 2438 @60, 2.27 s) — smooth on phones, where the Lottie's 6 track mattes + 12 full-size gradient ripples stuttered" (L1584–1585). The video is `assets/tick-otp.mp4`, played in `<video id="otpTick">` (L1588).
- **Play:** `playTick()` (L2568–2575) sets `currentTime = 0` and calls `.play()`. On `playing` it adds `.is-playing` and fires a `haptic.medium()` 160 ms later ("as the coin pops out (frame ~10)"). It starts 60 ms after the boxes start rounding into a disc (L4275–4277). The coin centre is (187.5, 406) (L2558).
- **Hand-off:** when the tick ends, the Wallet Intro video takes over (`assets/wallet-intro.mp4`, 2 s) (L2582–2584). If playback fails, the Wallet Intro starts directly. With reduced motion the tick is skipped and the Wallet Intro plays (L4276).
- **Discrepancy:** `spec/index.html` uses `TICK_MS = 2300` (spec L497). 136 frames at 60 fps is 2266.666… ms.

## Related videos (not Lottie)
| Asset | Spec | Behaviour |
|---|---|---|
| assets/splash.mp4 | 750×1624, 4.6 s (L1451) | Plays once. The login UI enters at mediaTime 3.97 s (L2065). |
| assets/splash-loop.mp4 | 3.15 s (L1452) | Loops after the intro ends. It is primed 1200 ms after the intro starts playing (L2026–2030). |
| assets/tick-otp.mp4 | 1126×2438 @60, 2.27 s (L1584) | See above. |
| assets/wallet-intro.mp4 | 750×1624, 2 s (L1589) | The skin picker reveals at mediaTime 1.5 s (L2141–2152). The video pauses 900 ms after the reveal (L2769). |

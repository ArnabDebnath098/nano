/**
 * noon NANO — motion tokens + faithful ports of the prototype's motion maths.
 * Source: github.com/saswata2002/noon-NANO @ f137e63, index.html (line numbers as "L123").
 *
 * Pure module: no DOM access and no side effects on import. GSAP is only touched when you
 * call registerNanoEases(CustomEase) yourself.
 *
 * IMPORTANT (index.html L1889–1910): the prototype monkey-patches Element.prototype.animate so
 * every call with >= 2 keyframes, iterations 1, duration > 1 and no { pp: false } is re-timed:
 *   - any MOVE_PROPS key present  -> duration 540, easing PP.MOVE (keyframe easings stripped)
 *   - only FADE_PROPS keys        -> duration 200, easing PP.FADE (keyframe easings stripped)
 *   - anything else (e.g. backgroundPosition) is left alone. Delays are always kept.
 * effectiveTiming() below reproduces that rule.
 */

// ---------------------------------------------------------------------------
// System curves (L1874–1878; CSS mirror L33–36)
// ---------------------------------------------------------------------------
export const PP = Object.freeze({
  MOVE_MS: 540,
  MOVE: 'linear(0.0000 0.00%, 0.0771 1.64%, 0.1684 4.55%, 0.2831 7.64%, 0.3949 10.55%, 0.5091 13.64%, 0.6130 16.73%, 0.6986 19.64%, 0.7758 22.73%, 0.8731 27.82%, 0.9136 30.73%, 0.9418 33.27%, 0.9673 36.36%, 0.9855 39.45%, 0.9979 42.55%, 1.0055 45.45%, 1.0101 48.36%, 1.0126 51.45%, 1.0133 54.55%, 1.0129 57.64%, 1.0119 60.55%, 1.0105 63.64%, 1.0089 66.73%, 1.0074 69.64%, 1.0059 72.73%, 1.0046 75.82%, 1.0035 78.73%, 1.0026 81.82%, 1.0019 84.73%, 1.0013 87.82%, 1.0008 90.91%, 1.0005 94.00%, 1.0002 96.91%, 1.0000 100.00%)',
  FADE_MS: 200,
  FADE: 'linear(0.0000 0.00%, 0.1160 4.00%, 0.2350 8.50%, 0.3310 12.50%, 0.5070 21.00%, 0.6020 26.50%, 0.6630 30.50%, 0.7170 34.50%, 0.7530 37.50%, 0.7970 41.50%, 0.8440 46.50%, 0.8720 50.00%, 0.9000 54.00%, 0.9260 58.50%, 0.9490 63.50%, 0.9620 67.00%, 0.9730 70.50%, 0.9830 75.00%, 0.9900 79.00%, 0.9950 83.00%, 0.9980 88.00%, 0.9990 91.50%, 1.0000 95.50%, 1.0000 100.00%)',
  STAGGER: 40,
  FOLLOW: 100,
});

// L1890–1892
export const MOVE_PROPS = Object.freeze(['translate', 'transform', 'scale', 'rotate', 'top', 'left', 'right', 'bottom', 'width', 'height',
  'clipPath', 'borderRadius', 'strokeDashoffset', 'letterSpacing', '--spin']);
export const FADE_PROPS = Object.freeze(['opacity', 'filter', 'color', 'backgroundColor']);

// L2279–2281 — "Sampled damped spring (ζ 0.72, response 0.42 s): peaks at 1.038, settled by 600 ms"
export const DROP_SPRING = 'linear(0, 0.039, 0.133, 0.257, 0.391, 0.523, 0.642, 0.746, 0.832, 0.9, 0.951, ' +
  '0.988, 1.013, 1.028, 1.036, 1.038, 1.037, 1.034, 1.029, 1.024, 1.019, 1.014, 1.01, 1.007, 1.004, ' +
  '1.002, 1.001, 1, 0.999, 0.999, 1)';

// ---------------------------------------------------------------------------
// Cubic-bezier easings (every distinct curve in index.html). [x1, y1, x2, y2] + source lines.
// ---------------------------------------------------------------------------
export const BEZIERS = Object.freeze({
  iosOut:        { p: [0.32, 0.72, 0, 1],   lines: 'L224 L226 L2737 L2870 L2957 L2986 L3035 L3074 L3127 L3439 L3625 L4241 L4269 L4413', names: 'IOS / EASE / GLIDE_EASE / KB_EASE' },
  fade:          { p: [0.25, 0.1, 0.25, 1], lines: 'L2081 L2738 L3037 L3075 L3137 L3138 L3441 L3582 L3626 L3689', names: 'FADE (= CSS ease)' },
  outExit:       { p: [0.4, 0, 0.6, 1],     lines: 'L2985 L3036 L3128 L3440 L3497', names: 'OUT' },
  bump:          { p: [0.3, 0.7, 0.4, 1],   lines: 'L2902 L3413 L3424 L3428 L3429', names: '(inline)' },
  standard:      { p: [0.4, 0, 0.2, 1],     lines: 'L1254 L3295 L3901 L4067', names: '(inline)' },
  outQuint:      { p: [0.22, 1, 0.36, 1],   lines: 'L3629 L3871 L3887 L4048 L4077 L4078', names: 'CLOSE / OUT / E' },
  inOutSine:     { p: [0.45, 0, 0.55, 1],   lines: 'L2342 L2448 L4162', names: 'SQ' },
  waveDrop:      { p: [0.5, 0, 0.75, 0],    lines: 'L4163', names: '(inline)' },
  outCubic:      { p: [0.33, 1, 0.68, 1],   lines: 'L2306', names: 'EASE_OUT_CUBIC' },
  toastExit:     { p: [0.4, 0, 0.7, 0.2],   lines: 'L2307', names: 'EXIT_EASE' },
  toastStretch:  { p: [0.3, 0, 0.4, 1],     lines: 'L2383', names: '(inline)' },
  outExpo:       { p: [0.16, 1, 0.3, 1],    lines: 'L2095', names: 'OUT_EXPO' },
  softIn:        { p: [0.4, 0, 0.7, 0.4],   lines: 'L3581', names: 'EXIT (showHome)' },
  notifExit:     { p: [0.4, 0, 0.75, 0.3],  lines: 'L3949', names: 'EXIT (closeNotif)' },
  scrimLift:     { p: [0.45, 0, 0.2, 1],    lines: 'L3949', names: 'LIFT' },
  scrimIn:       { p: [0.3, 0, 0.2, 1],     lines: 'L3903', names: '(inline)' },
  sink:          { p: [0.45, 0, 0.75, 0.3], lines: 'L3307', names: '(inline)' },
  sinkFast:      { p: [0.5, 0, 0.75, 0.15], lines: 'L3449', names: '(inline)' },
  draw:          { p: [0.65, 0, 0.35, 1],   lines: 'L3090', names: '(inline)' },
  ringPulse:     { p: [0.37, 0, 0.3, 1],    lines: 'L3314', names: '(inline)' },
  throw:         { p: [0.25, 0.6, 0.35, 1], lines: 'L4061', names: '(inline, written .25,.6,.35,1)' },
  shake:         { p: [0.36, 0.07, 0.19, 0.97], lines: 'L309 L1372', names: 'field-shake (written .36,.07,.19,.97)' },
  backOut:       { p: [0.34, 1.4, 0.64, 1], lines: 'L1367 L1373', names: 'digit-in / digit-ok' },
  chrome:        { p: [0.23, 1, 0.32, 1],   lines: 'L1424 L1443', names: 'prototype chrome (written .23, 1, .32, 1)' },
  chromeSpin:    { p: [0.2, 0.9, 0.3, 1],   lines: 'L1435', names: 'prototype chrome (written .2, .9, .3, 1)' },
});

/** CSS string for a BEZIERS entry. */
export const bezierCss = (key) => `cubic-bezier(${BEZIERS[key].p.join(', ')})`;
/** GSAP CustomEase path string: 'M0,0 C x1,y1 x2,y2 1,1'. */
export const bezierPath = ([x1, y1, x2, y2]) => `M0,0 C${x1},${y1} ${x2},${y2} 1,1`;

// ---------------------------------------------------------------------------
// Durations / timeline constants (ms) — values exactly as in the source
// ---------------------------------------------------------------------------
export const DUR = Object.freeze({
  MOVE: 540,              // PP.MOVE_MS L1875
  FADE: 200,              // PP.FADE_MS L1876
  KB_LIFT_TOUCH: 450,     // .is-touch .screen / .toast (L224, L226)
  SHAKE: 340,             // L309, L1372
  DIGIT_IN: 260,          // L1367
  DIGIT_OK: 420,          // L1373
  PRESS: 90,              // :active transition-duration L985 L1068 L1094; numpad bg L1399
  TOAST_ENTRY: 900,       // ENTRY_MS L2274
  TOAST_EXIT: 440,        // EXIT_MS L2275 (authored; re-timed to 540 at runtime)
  TOAST_HOLD: 1700,       // TOAST_HOLD_MS = ENTRY_MS + 800 (L2282)
  TOAST_DROP: 600,        // DROP_MS L2300 (authored; re-timed to 540 at runtime)
  EMAIL_CHECK: 1300,      // EMAIL_CHECK_MS L2438
  OTP_LAND: 1360,         // OTP_LAND_MS L2475 (comment: "Resend row delay 800 + rise 560")
  OTP_LOADING: 1500,      // LOADING_MS L2556
  OTP_WAVE: 1000,         // WAVE_MS L2557
  OTP_WAVE_STAGGER: 100,  // WAVE_STAGGER L2557
  OTP_GLIDE: 340,         // GLIDE L4241 (authored; re-timed to 540 at runtime)
  HINT_CYCLE: 2600,       // setInterval L2721
  SKIN_FRONT_AT: 360,     // FRONT_AT L2758
  SKIN_RISE_AT: 200,      // RISE_AT L2920
  HOME_POP_AT: 220,       // POP_AT L3612 (120 reduced)
  HOME_BUILD_AT: 840,     // setTimeout(homeBuild) L3622 (620 reduced)
  HOME_CLOSE: 820,        // CLOSE_MS L3629
  HOME_CARDS_AT: 1100,    // revealMarketCards L3674 (after homeBuild)
  SHIMMER: 1867,          // hmShimmer 1.867s L1122
  NOTIF_MOVE_AT: 1250,    // MOVE_AT L3907
  NOTIF_CLOSE_BELL: 330,  // ntCloseT L3979
  DOUBLE_TAP: 320,        // L3784
  INTRO_UI_AT_S: 3.97,    // seconds into splash, L2065
  SKIN_AT_S: 1.5,         // seconds into wallet intro, L2141
});

// ---------------------------------------------------------------------------
// spring() — faithful port of index.html L2284–2294
// Underdamped (0 < ζ < 1) mass-spring step response x(t) = 1 − e^(−ζωt)(cos ωd t + (ζω/ωd) sin ωd t),
// ω = 2π / response (response = undamped period in seconds), ωd = ω√(1−ζ²).
// Sampled at steps+1 evenly spaced points over durMs, each rounded with toFixed(4); the last
// sample is forced to exactly 1. Returned as a CSS linear() string (even spacing, no % stops).
// NOTE: ζ >= 1 yields NaN (sqrt of a negative) — the source's own comment at L3914 says
// "the helper is underdamped-only: ζ < 1"; DEAL uses ζ 0.97.
// ---------------------------------------------------------------------------
export function spring(zeta, response, durMs, steps = 48) {
  const w = (2 * Math.PI) / response, wd = w * Math.sqrt(1 - zeta * zeta);
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = ((i / steps) * durMs) / 1000;
    const x = i === steps ? 1
      : 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
    pts.push(+x.toFixed(4));
  }
  return `linear(${pts.join(', ')})`;
}

// springImpact() — port of L2296–2299: first time (ms) the spring reaches its rest value (x = 1),
// t = (π − atan(√(1−ζ²)/ζ)) / ωd. For the toast drop (ζ 0.52, response 0.45) this evaluates to
// 177.559… ms (the source comment at L2302 says "≈ 150 ms").
export function springImpact(zeta, response) {
  const w = (2 * Math.PI) / response, wd = w * Math.sqrt(1 - zeta * zeta);
  return (1000 * (Math.PI - Math.atan(Math.sqrt(1 - zeta * zeta) / zeta))) / wd;
}

/** Closed-form spring as an easing function of progress p ∈ [0,1] over durMs (for GSAP: ease: springEase(...)). */
export function springEase(zeta, response, durMs) {
  const w = (2 * Math.PI) / response, wd = w * Math.sqrt(1 - zeta * zeta);
  return (p) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    const t = (p * durMs) / 1000;
    return 1 - Math.exp(-zeta * w * t) * (Math.cos(wd * t) + ((zeta * w) / wd) * Math.sin(wd * t));
  };
}

// ---------------------------------------------------------------------------
// linear() helpers
// ---------------------------------------------------------------------------
/** Parse a CSS linear() string into [[t, v], …] (t in 0..1). Handles "v p%" stops and bare evenly spaced values. */
export function parseLinear(css) {
  const parts = css.trim().replace(/^linear\(/, '').replace(/\)$/, '').split(',').map((s) => s.trim());
  const n = parts.length;
  return parts.map((p, i) => {
    const [v, pct] = p.split(/\s+/);
    return [pct != null ? parseFloat(pct) / 100 : i / (n - 1), +v];
  });
}

/** Piecewise-linear easing function from a linear() string — same interpolation as ppMove() (L1880–1888). */
export function linearEase(css) {
  const pts = parseLinear(css);
  return (x) => {
    if (x <= 0) return 0; if (x >= 1) return 1;
    for (let i = 1; i < pts.length; i++) {
      const [t1, v1] = pts[i];
      if (x <= t1) { const [t0, v0] = pts[i - 1]; return v0 + (v1 - v0) * ((x - t0) / (t1 - t0)); }
    }
    return 1;
  };
}

/** ppMove(x) — the PP Move curve as a function, as used by the rAF sheet (L1880–1888, L2685). */
export const ppMove = linearEase(PP.MOVE);
export const ppFade = linearEase(PP.FADE);

/** curve(f, n = 24) — port of L3678 (generates CARD_FADE / CARD_RISE). */
export const powerCurve = (f, n = 24) => `linear(${Array.from({ length: n + 1 }, (_, i) => f(i / n).toFixed(4)).join(', ')})`;
export const CARD_FADE = powerCurve((t) => 1 - Math.pow(1 - t, 2.8));   // L3679
export const CARD_RISE = powerCurve((t) => 1 - Math.pow(1 - t, 2.5));   // L3680

/** smooth01 (smoothstep) — L3714, used by the collapsing-header cross-scale. */
export const smooth01 = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
/** easeOut cubic used by the skin drag mapping — L2794. */
export const easeOutCubicFn = (t) => 1 - Math.pow(1 - t, 3);

// ---------------------------------------------------------------------------
// rAF springs (semi-implicit Euler, as in the source)
// ---------------------------------------------------------------------------
/** Avatar row (L3223–3228): K 260, C = 2√K·0.86, dt clamped to 1/30 s, rest when |x−target|<0.0008 && |v|<0.01. */
export const ROW_SPRING = Object.freeze({ K: 260, C: 2 * Math.sqrt(260) * 0.86, maxDt: 1 / 30, eps: 0.0008, vEps: 0.01 });
/** Collapsing header (L3713, L3725–3731): K = (2π/0.34)², C = 2·0.86·√K, dt ≤ 0.032 s (first frame 1/60), rest when |p−to|<0.0005 && |v|<0.005. */
export const HDR_SPRING = Object.freeze({ K: Math.pow(2 * Math.PI / 0.34, 2), C: 2 * 0.86 * Math.sqrt(Math.pow(2 * Math.PI / 0.34, 2)), maxDt: 0.032, eps: 0.0005, vEps: 0.005 });

/** One integration step: returns { x, v }. */
export function stepSpring({ K, C }, x, v, target, dt) {
  const nv = v + (-K * (x - target) - C * v) * dt;
  return { x: x + nv * dt, v: nv };
}

// ---------------------------------------------------------------------------
// Velocity / gesture formulas (pure ports)
// ---------------------------------------------------------------------------
/** throwCard (L4055–4057): vx px/ms, dx px. */
export function notifThrow(dx, dy, vx, dir) {
  const dist = 420 + Math.abs(dx) * 0.4;
  const rot = dir * (16 + Math.min(14, Math.abs(vx) * 8));
  const dur = Math.max(260, Math.min(460, 520 - Math.abs(vx) * 140));
  return { dist, rot, dur, endTransform: `translate(${dir * dist}px, ${(dy * 0.22 + 40).toFixed(1)}px) rotate(${rot}deg)` };
}
/** Notification drag paint (L4003): follow + tilt. */
export const notifDragTransform = (dx, dy) => `translate(${dx.toFixed(1)}px, ${(dy * 0.22).toFixed(1)}px) rotate(${(dx * 0.06).toFixed(2)}deg)`;
/** Throw decision (L4033–4034): THROW_PX 110, FLICK 0.55 px/ms, min |dx| 24 for a flick. */
export const shouldThrow = (dx, vx) => {
  const dir = Math.abs(dx) > 4 ? Math.sign(dx) : Math.sign(vx);
  return Math.abs(dx) > 110 || (Math.abs(vx) > 0.55 && Math.sign(vx) === dir && Math.abs(dx) > 24);
};
/** Skin swipe-up rubber band (L2781–2784). d = finger travel up (px, ≥ 0). */
export const skinLift = (d) => -160 * (1 - Math.exp(-d / 190));
/** Skin drag-down rubber band (L2799). */
export const skinDown = (dy) => (dy >= 0 ? 120 * (1 - Math.exp(-Math.max(dy, 0) / 200)) : dy * 0.15);
/** Skin swipe-up commit (L2844): −dy ≥ 70 or v < −0.45 px/ms. */
export const skinSwipeCommits = (dy, v) => -dy >= 70 || v < -0.45;
/** Avatar row flick target (L3268–3273). rowVel in items/s. */
export function rowTarget(rowPos, rowVel, pos0) {
  let target = Math.round(rowPos);
  if (Math.abs(rowVel) > 1.6) {
    const dir = Math.sign(rowVel);
    target = Math.round(rowPos + rowVel * 0.09);
    if ((target - pos0) * dir < 1) target = Math.round(pos0) + dir;
    target = Math.max(Math.round(rowPos) - 2, Math.min(Math.round(rowPos) + 2, target));
  }
  return target;
}

// ---------------------------------------------------------------------------
// The global motion layer, as a pure function (L1894–1909)
// ---------------------------------------------------------------------------
/**
 * Given the keyframes + options that index.html passes to el.animate(), return the timing that
 * actually runs: { duration, easing, retimed: 'move' | 'fade' | false }.
 */
export function effectiveTiming(keyframes, options) {
  const o = options || {};
  if (!(o && typeof o === 'object' && o.pp !== false && Array.isArray(keyframes) && keyframes.length >= 2
      && (o.iterations == null || o.iterations === 1) && (o.duration || 0) > 1)) {
    return { duration: o.duration, easing: o.easing, retimed: false };
  }
  const props = new Set();
  keyframes.forEach((k) => Object.keys(k).forEach((p) => { if (p !== 'offset' && p !== 'easing' && p !== 'composite') props.add(p); }));
  const all = [...props];
  const move = all.some((p) => MOVE_PROPS.includes(p));
  const fade = !move && all.length > 0 && all.every((p) => FADE_PROPS.includes(p));
  if (move) return { duration: PP.MOVE_MS, easing: PP.MOVE, retimed: 'move' };
  if (fade) return { duration: PP.FADE_MS, easing: PP.FADE, retimed: 'fade' };
  return { duration: o.duration, easing: o.easing, retimed: false };
}

// ---------------------------------------------------------------------------
// Springs used in the prototype (ζ, response s, duration ms) — "effective" says whether the
// authored spring actually runs (pp:false) or is replaced by PP Move at runtime.
// ---------------------------------------------------------------------------
export const SPRINGS = Object.freeze({
  introRise:        { zeta: 0.66, response: 0.62, ms: 1200, line: 2079, effective: false },
  introPop:         { zeta: 0.62, response: 0.5,  ms: 1100, line: 2080, effective: false },
  toastFall:        { zeta: 0.52, response: 0.45, ms: 600,  line: 2301, effective: false },
  toastWidth:       { zeta: 0.6,  response: 0.5,  ms: 640,  line: 2303, effective: false },
  toastHeight:      { zeta: 0.6,  response: 0.45, ms: 560,  line: 2304, effective: false },
  toastPop:         { zeta: 0.55, response: 0.4,  ms: 470,  line: 2305, effective: false },
  skinSoft:         { zeta: 0.88, response: 0.6,  ms: 1000, line: 2739, effective: true },
  skinCard:         { zeta: 0.8,  response: 0.58, ms: 1100, line: 2740, effective: true },
  skinFan:          { zeta: 0.78, response: 0.5,  ms: 900,  line: 2761, effective: true },
  stackBackElastic: { zeta: 0.62, response: 0.48, ms: 1000, line: 2852, effective: false },
  stackBack:        { zeta: 0.86, response: 0.45, ms: 700,  line: 2852, effective: false },
  skinStep:         { zeta: 0.72, response: 0.44, ms: 800,  line: 2894, effective: false },
  skinSurface:      { zeta: 0.76, response: 0.46, ms: 700,  line: 2911, effective: false },
  keepFront:        { zeta: 0.84, response: 0.54, ms: 900,  line: 2963, effective: false },
  pickFront:        { zeta: 0.88, response: 0.56, ms: 900,  line: 3001, effective: false },
  pickFan:          { zeta: 0.76, response: 0.46, ms: 760,  line: 3008, effective: false },
  avCta:            { zeta: 0.86, response: 0.6,  ms: 820,  line: 3056, effective: false },
  avPop:            { zeta: 0.62, response: 0.55, ms: 1000, line: 3076, effective: false },
  avBigRise:        { zeta: 0.7,  response: 0.52, ms: 860,  line: 3086, effective: false },
  avRowFan:         { zeta: 0.74, response: 0.5,  ms: 900,  line: 3103, effective: false },
  avCtaHome:        { zeta: 0.88, response: 0.55, ms: 680,  line: 3135, effective: false },
  keepWalletBack:   { zeta: 0.8,  response: 0.55, ms: 900,  line: 3151, effective: false },
  avSwapIn:         { zeta: 0.84, response: 0.56, ms: 760,  line: 3312, effective: true },
  sparkleSpin:      { zeta: 0.84, response: 0.78, ms: 900,  line: 3328, effective: true },
  intChip:          { zeta: 0.8,  response: 0.5,  ms: 800,  line: 3479, effective: false },
  intCta:           { zeta: 0.86, response: 0.55, ms: 760,  line: 3487, effective: false },
  intCtaHome:       { zeta: 0.88, response: 0.5,  ms: 620,  line: 3508, effective: false },
  homePresent:      { zeta: 0.74, response: 0.44, ms: 700,  line: 3618, effective: true },
  bellBadge:        { zeta: 0.55, response: 0.36, ms: 560,  line: 3780, effective: true },
  notifGlide:       { zeta: 0.9,  response: 0.55, ms: 820,  line: 3907, effective: true },
  notifDeal:        { zeta: 0.97, response: 0.6,  ms: 900,  line: 3914, effective: true },
  notifPeek:        { zeta: 0.95, response: 0.55, ms: 850,  line: 3923, effective: true },
  notifSettle:      { zeta: 0.92, response: 0.5,  ms: 760,  line: 3996, effective: true },
  notifBack:        { zeta: 0.55, response: 0.42, ms: 720,  line: 3996, effective: true },
});

// ---------------------------------------------------------------------------
// GSAP
// ---------------------------------------------------------------------------
/**
 * Register CustomEase curves for every cubic-bezier above, named 'nano.<key>' (e.g. 'nano.iosOut').
 * Pass the CustomEase class (already registered with gsap). Returns the created names.
 * Note: our project already has 'sheetOpen' = cubic-bezier(0.32,0.72,0,1) (identical to nano.iosOut)
 * and 'sheetClose' = cubic-bezier(0.4,0,1,1) (no equivalent in noon NANO).
 * linear() curves (PP Move/Fade, springs) cannot be expressed as one cubic — use the function
 * forms instead: gsap.to(el, { ease: ppMove, duration: 0.54 }).
 */
export function registerNanoEases(CustomEase, prefix = 'nano.') {
  return Object.entries(BEZIERS).map(([key, { p }]) => {
    const name = prefix + key;
    CustomEase.create(name, bezierPath(p));
    return name;
  });
}

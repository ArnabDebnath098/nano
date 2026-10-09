// Platform detection (evaluated once).
//
// "Native" means a real phone / tablet, not a desktop browser emulating one (e.g. Chrome
// DevTools device mode, which swaps the user agent but not the engine):
//  • iOS — every iOS browser is WebKit, so it reports navigator.vendor "Apple Computer, Inc.";
//    desktop Chrome pretending to be an iPhone still reports "Google Inc.". iPadOS reports
//    itself as a Mac, so a Mac with a touch screen counts as iOS too.
//  • Android — an Android user agent on a non-desktop platform (an emulated Pixel on a Mac /
//    Windows / x86 Linux machine keeps its desktop navigator.platform).
const ua = navigator.userAgent
const platform = navigator.platform || ''
const appleWebKit = navigator.vendor === 'Apple Computer, Inc.'

export const isIOS =
  (/iP(hone|ad|od)/.test(ua) && appleWebKit) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
export const isAndroid = /Android/i.test(ua) && !/Win|Mac|Linux x86|Linux i[3-6]86/.test(platform)

// Phones / tablets that should use system-native chrome (e.g. the intro video's header);
// everything else — desktop browsers, including phone emulation — gets the web components.
export const isNativeMobile = isIOS || isAndroid

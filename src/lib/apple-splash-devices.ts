export type SplashDevice = { widthCss: number; heightCss: number; dpr: number };

/**
 * Common iPhone portrait screen sizes (CSS px + device pixel ratio), covering
 * roughly 2016-onward. Android gets a splash screen automatically from the
 * manifest; iOS Safari doesn't — without explicit apple-touch-startup-image
 * tags for these it just shows a blank flash while the app boots.
 */
export const APPLE_SPLASH_DEVICES: SplashDevice[] = [
  { widthCss: 430, heightCss: 932, dpr: 3 }, // 16/15/14 Pro Max
  { widthCss: 393, heightCss: 852, dpr: 3 }, // 16/15/14/13/12 Pro
  { widthCss: 428, heightCss: 926, dpr: 3 }, // 11 Pro Max / XS Max / older Plus/Max
  { widthCss: 390, heightCss: 844, dpr: 3 }, // 16/15/14/13/12
  { widthCss: 375, heightCss: 812, dpr: 3 }, // 13/12 mini, 11 Pro, XS, X
  { widthCss: 414, heightCss: 896, dpr: 2 }, // 11, XR
  { widthCss: 414, heightCss: 736, dpr: 3 }, // 8/7/6s Plus
  { widthCss: 375, heightCss: 667, dpr: 2 }, // SE 2nd/3rd gen, 8, 7, 6s
  { widthCss: 320, heightCss: 568, dpr: 2 }, // SE 1st gen, 5s
];

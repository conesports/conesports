export const MOBILE_PRELOAD_QUERY = "(max-width: 1023px)";

export function isMobilePreloadViewport() {
  return window.matchMedia(MOBILE_PRELOAD_QUERY).matches;
}

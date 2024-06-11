export function isInIframe() {
  return typeof window !== "undefined" && window !== window.parent
}

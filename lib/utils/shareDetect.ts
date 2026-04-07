export function canNativeShare(): boolean {
  if (typeof navigator === "undefined") return false
  if (!("share" in navigator)) return false
  if (typeof navigator.canShare !== "function") return false

  try {
    return navigator.canShare({
      files: [new File([], "x.png", { type: "image/png" })],
    })
  } catch {
    return false
  }
}

export function isIOS(): boolean {
  return typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent)
}

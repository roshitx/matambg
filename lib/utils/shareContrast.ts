const DEFAULT_DARK_COLOR = "#FFFFFF"
const DEFAULT_LIGHT_COLOR = "#F59E0B"
const LUMINANCE_THRESHOLD = 0.5

function normalizeHexColor(hexColor: string): string | null {
  const value = hexColor.trim().replace(/^#/, "")

  if (!value) return null

  if (/^[0-9a-fA-F]{3}$/.test(value)) {
    return value
      .split("")
      .map((char) => `${char}${char}`)
      .join("")
  }

  if (/^[0-9a-fA-F]{6}$/.test(value)) {
    return value
  }

  return null
}

export function calculateLuminance(hexColor: string): number {
  const normalized = normalizeHexColor(hexColor)
  if (!normalized) return 0

  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)

  const luminance255 = 0.299 * red + 0.587 * green + 0.114 * blue
  return luminance255 / 255
}

export function getContrastColor(
  backgroundHex: string,
  darkColor: string = DEFAULT_DARK_COLOR,
  lightColor: string = DEFAULT_LIGHT_COLOR,
): string {
  const luminance = calculateLuminance(backgroundHex)
  return luminance < LUMINANCE_THRESHOLD ? lightColor : darkColor
}

import type { ComparisonItem } from "@/lib/constants/comparisons"

type SharePlatform = "twitter" | "whatsapp" | "native"

function formatThousand(value: number): string {
  const digits = Math.floor(value).toString()
  let result = ""

  for (let i = 0; i < digits.length; i += 1) {
    const fromEnd = digits.length - i
    result += digits[i]
    if (fromEnd > 1 && fromEnd % 3 === 1) {
      result += "."
    }
  }

  return result
}

function formatOneDecimal(value: number): string {
  const rounded = Math.round(value * 10)
  const whole = Math.floor(rounded / 10)
  const fraction = rounded % 10

  if (fraction === 0) {
    return whole.toString()
  }

  return `${whole},${fraction}`
}

export function formatCompact(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "< 1"
  if (n === 0) return "0"
  if (n < 1) return "< 1"
  if (n < 1_000) return Math.floor(n).toString()
  if (n < 1_000_000) return formatThousand(n)

  if (n < 1_000_000_000) {
    const juta = n / 1_000_000
    return `${formatOneDecimal(juta)} Juta`
  }

  const miliar = n / 1_000_000_000
  return `${formatOneDecimal(miliar)} Miliar`
}

function trimTwitterText(text: string): string {
  const LIMIT = 257

  if (text.length <= LIMIT) {
    return text
  }

  return `${text.slice(0, LIMIT - 3)}...`
}

export function buildShareText(
  item: ComparisonItem,
  units: number,
  platform: SharePlatform
): string {
  const compactUnits = formatCompact(units)

  if (platform === "twitter") {
    const tweetText = `1 hari anggaran #MBG = ${compactUnits} ${item.unit} ${item.name}!\nRp 1,2T/hari · APBN 2026 🇮🇩\n#mataMBG`
    return trimTwitterText(tweetText)
  }

  if (platform === "whatsapp") {
    return `1 hari anggaran MBG setara ${compactUnits} ${item.unit} ${item.name}!\n\nData: Rp 1,2 Triliun per hari dari APBN Indonesia 2026.\nCek perbandingan lain:`
  }

  return `1 hari anggaran MBG setara ${compactUnits} ${item.unit} ${item.name}!\n\nData: Rp 1,2 Triliun per hari dari APBN Indonesia 2026.\nCek perbandingan lain:`
}

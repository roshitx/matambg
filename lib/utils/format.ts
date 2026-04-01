/** Format angka ke Rupiah Indonesia: Rp 1.200.000.000.000 */
export function formatIDR(value: number, compact = false): string {
  if (compact) {
    if (value >= 1e12) return `Rp ${(value / 1e12).toFixed(1)} T`
    if (value >= 1e9) return `Rp ${(value / 1e9).toFixed(1)} M`
    if (value >= 1e6) return `Rp ${(value / 1e6).toFixed(1)} Jt`
    return `Rp ${value.toLocaleString("id-ID")}`
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

/** Format angka besar ke bahasa Indonesia */
export function formatNumber(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)} Triliun`
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)} Miliar`
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)} Juta`
  return value.toLocaleString("id-ID")
}

/** "2 jam lalu", "kemarin", "3 hari lalu" */
export function timeAgo(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60) return "Baru saja"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`
  if (diffSec < 172800) return "Kemarin"
  return `${Math.floor(diffSec / 86400)} hari lalu`
}

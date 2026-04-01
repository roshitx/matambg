import { MBG } from "@/lib/constants/mbg"
import type { ComparisonItem } from "@/lib/constants/comparisons"

/** Hitung berapa unit item yang bisa dibeli dengan X hari anggaran MBG */
export function calcUnitsForDays(days: number, item: ComparisonItem): number {
  const budget = days * MBG.DAILY_BUDGET
  return Math.floor(budget / item.unitPrice)
}

/** Hitung berapa hari MBG setara dengan nominal tertentu */
export function calcDaysFromAmount(amount: number): number {
  return amount / MBG.DAILY_BUDGET
}

/** Hitung berapa unit item dari nominal */
export function calcUnitsFromAmount(amount: number, unitPrice: number): number {
  return Math.floor(amount / unitPrice)
}

/** Hitung detik yang sudah berlalu sejak 00:00 WIB hari ini */
export function getElapsedSecondsToday(): number {
  const now = new Date()
  const wibOffset = 7 * 60 * 60 * 1000
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const wib = new Date(utc + wibOffset)
  return wib.getHours() * 3600 + wib.getMinutes() * 60 + wib.getSeconds()
}

/** Hitung uang yang sudah terpakai hari ini sejak 00:00 WIB */
export function getTodaySpent(): number {
  return Math.floor(getElapsedSecondsToday() * MBG.PER_SECOND)
}

"use client"

import { useState, useRef, useId } from "react"
import { toPng } from "html-to-image"
import { motion } from "framer-motion"
import { COMPARISONS, type ComparisonCategory } from "@/lib/constants/comparisons"
import { CATEGORY_LABELS } from "@/lib/constants/ui"
import { MBG } from "@/lib/constants/mbg"
import { formatIDR, formatNumber } from "@/lib/utils/format"
import { calcUnitsFromAmount } from "@/lib/utils/calculate"
import { cn } from "@/lib/utils"
import { ComparisonCard } from "./ComparisonCard"

const MAX_DAYS = 365
const MAX_AMOUNT = MBG.ANNUAL_BUDGET

const PRESETS_DAYS = [
  { label: "1 Hari", days: 1 },
  { label: "1 Minggu", days: 7 },
  { label: "1 Bulan", days: 30 },
  { label: "1 Tahun", days: 365 },
]

const PRESETS_AMOUNT = [
  { label: "1 Juta", value: 1_000_000 },
  { label: "1 Miliar", value: 1_000_000_000 },
  { label: "1 Triliun", value: 1_000_000_000_000 },
]

function formatInputValue(n: number): string {
  return n > 0 ? n.toLocaleString("id-ID") : ""
}

function parseInputValue(raw: string): number {
  return parseInt(raw.replace(/\./g, "").replace(/[^0-9]/g, "") || "0", 10)
}

export function Calculator() {
  const [amount, setAmount] = useState<number>(MBG.DAILY_BUDGET)
  const [inputDisplay, setInputDisplay] = useState(formatInputValue(MBG.DAILY_BUDGET))
  const [activeCategory, setActiveCategory] = useState<ComparisonCategory | "all">("all")
  const shareCardRef = useRef<HTMLDivElement>(null)
  const sliderId = useId()

  const days = Math.round(amount / MBG.DAILY_BUDGET)
  const clampedDays = Math.min(Math.max(1, days), MAX_DAYS)

  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = Number(e.target.value)
    const newAmount = d * MBG.DAILY_BUDGET
    setAmount(newAmount)
    setInputDisplay(formatInputValue(newAmount))
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputDisplay(e.target.value)
    const parsed = parseInputValue(e.target.value)
    setAmount(Math.min(Math.max(0, parsed), MAX_AMOUNT))
  }

  const handleAmountBlur = () => {
    setInputDisplay(formatInputValue(amount))
  }

  const setPresetDays = (d: number) => {
    const newAmount = d * MBG.DAILY_BUDGET
    setAmount(newAmount)
    setInputDisplay(formatInputValue(newAmount))
  }

  const setPresetAmount = (v: number) => {
    setAmount(v)
    setInputDisplay(formatInputValue(v))
  }

  const handleShare = async () => {
    if (!shareCardRef.current) return
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        width: 1200,
        height: 630,
        pixelRatio: 1,
        style: { display: "flex" },
      })
      const link = document.createElement("a")
      link.download = `mbgmata-${clampedDays}hari.png`
      link.href = dataUrl
      link.click()
    } catch {
      // silently fail
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://matambg.id"
  const tweetText = `Dengan anggaran MBG ${clampedDays} hari (${formatIDR(amount, true)}), kita bisa beli ${formatNumber(calcUnitsFromAmount(amount, COMPARISONS.find(c => c.id === "indomie-goreng")?.unitPrice ?? 3500))} bungkus Indomie!\nCek selengkapnya: ${appUrl}/kalkulator #MBG #mataMBG`
  const waText = `Tau gak? Dengan anggaran MBG ${clampedDays} hari (${formatIDR(amount, true)}), kita bisa beli banyak banget! Cek: ${appUrl}/kalkulator`
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`
  const waUrl = `https://wa.me/?text=${encodeURIComponent(waText)}`

  const filtered =
    activeCategory === "all"
      ? COMPARISONS
      : COMPARISONS.filter((c) => c.category === activeCategory)

  const categories = (["all", ...new Set(COMPARISONS.map((c) => c.category))] as (ComparisonCategory | "all")[])

  return (
    <>
      {/* Two-panel controls */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">

        {/* Left panel — Jumlah Hari */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Jumlah Hari
          </p>

          {/* Big day number */}
          <div className="mb-3 flex items-baseline gap-2">
            <span className="font-display text-6xl font-extrabold leading-none text-foreground">
              {clampedDays}
            </span>
            <span className="text-lg font-medium text-muted-foreground">hari</span>
          </div>

          {/* Rupiah pill */}
          <div className="mb-4">
            <span className="inline-flex items-center rounded-sm bg-primary/10 px-3 py-1 font-mono text-sm font-medium text-primary">
              = {formatIDR(amount, true)}
            </span>
          </div>

          {/* Slider */}
          <input
            id={sliderId}
            type="range"
            min={1}
            max={MAX_DAYS}
            value={clampedDays}
            onChange={handleDayChange}
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-border accent-primary"
          />
          <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>1 hari</span>
            <span>365 hari</span>
          </div>

          {/* Day presets */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {PRESETS_DAYS.map(({ label, days: d }) => (
              <button
                key={label}
                type="button"
                onClick={() => setPresetDays(d)}
                className={cn(
                  "cursor-pointer rounded-sm px-2.5 py-1 text-[10px] font-semibold transition-all duration-150",
                  clampedDays === d
                    ? "bg-primary text-white"
                    : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right panel — Nominal Rupiah */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Atau Masukkan Nominal (IDR)
          </p>

          {/* Amount input */}
          <div className="mb-3 flex items-center rounded-lg border border-border bg-background px-4 py-3 focus-within:border-primary/50">
            <span className="mr-2 font-mono text-sm text-muted-foreground">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={inputDisplay}
              onChange={handleAmountChange}
              onBlur={handleAmountBlur}
              placeholder="1.200.000.000.000"
              className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>

          {/* Days equivalent pill */}
          <div className="mb-4">
            <span className="inline-flex items-center rounded-sm bg-amber-500/10 px-3 py-1 font-mono text-xs font-medium text-amber-600">
              = {clampedDays} hari anggaran MBG
            </span>
          </div>

          {/* Amount presets */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {PRESETS_AMOUNT.map(({ label, value }) => (
              <button
                key={label}
                type="button"
                onClick={() => setPresetAmount(value)}
                className="cursor-pointer rounded-sm border border-border px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition-all duration-150 hover:border-foreground/30 hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground/60">
            Semua perhitungan berdasarkan Rp {(MBG.DAILY_BUDGET / 1e12).toFixed(1)}T/hari · APBN 2026
          </p>
        </div>
      </div>

      {/* Divider "Setara Dengan" */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1 border-t border-dashed border-border" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Setara Dengan
        </p>
        <div className="flex-1 border-t border-dashed border-border" />
      </div>

      {/* Daftar Belanja section */}
      <div>
        <div className="mb-4 border-b border-border pb-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            Daftar Belanja
          </p>
          <h2 className="font-display text-xl font-extrabold text-foreground">
            Ini yang bisa dibeli:
          </h2>
        </div>

        {/* Category filter pills */}
        <div className="mb-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "shrink-0 cursor-pointer whitespace-nowrap rounded-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-150",
                  activeCategory === cat
                    ? "bg-primary text-white"
                    : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                )}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, i) => {
            const units = calcUnitsFromAmount(amount, item.unitPrice)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.22 }}
              >
                <ComparisonCard item={item} units={units} />
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Share section */}
      <div className="mt-10 rounded-xl border border-dashed border-primary/20 bg-primary/[0.02] p-6 text-center">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          Bagikan
        </p>
        <h3 className="mb-4 font-display text-xl font-bold text-foreground">
          Bagikan hasil kalkulator ini
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#1DA1F2] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
          >
            ↗ Share ke X
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#22c25e]"
          >
            ↗ Share ke WhatsApp
          </a>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            ⬇ Download Gambar
          </button>
        </div>
      </div>

      {/* Hidden share card 1200×630 */}
      <div
        ref={shareCardRef}
        aria-hidden
        style={{
          position: "fixed",
          left: "-99999px",
          top: 0,
          width: "1200px",
          height: "630px",
          background: "#FAF8F5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "32px",
          padding: "60px",
          fontFamily: "sans-serif",
          border: "1px solid #E5E0D8",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#DC2626", fontSize: 11, fontWeight: 700, letterSpacing: 4, marginBottom: 8, textTransform: "uppercase" }}>
            MBGMATA · APBN 2026
          </p>
          <p style={{ color: "#171717", fontSize: 22, fontWeight: 400 }}>
            Dengan anggaran MBG selama{" "}
            <span style={{ color: "#D97706", fontWeight: 700 }}>{clampedDays} hari</span>
            {" "}({formatIDR(amount, true)}), kita bisa beli:
          </p>
        </div>

        <div style={{ display: "flex", gap: 24, width: "100%", justifyContent: "center" }}>
          {COMPARISONS.filter((c) => c.featured)
            .slice(0, 3)
            .map((item) => {
              const units = calcUnitsFromAmount(amount, item.unitPrice)
              return (
                <div
                  key={item.id}
                  style={{
                    flex: 1,
                    background: "#FFFFFF",
                    border: "1px solid #E5E0D8",
                    borderRadius: "12px",
                    padding: 24,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 8 }}>{item.emoji}</div>
                  <div style={{ color: "#D97706", fontSize: 28, fontWeight: 700 }}>
                    {formatNumber(units)}
                  </div>
                  <div style={{ color: "#737373", fontSize: 13, marginTop: 4 }}>
                    {item.unit} {item.name}
                  </div>
                </div>
              )
            })}
        </div>

        <p style={{ color: "#A3A3A3", fontSize: 12 }}>matambg.id</p>
      </div>
    </>
  )
}

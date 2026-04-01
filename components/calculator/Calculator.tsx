"use client"

import { useState, useRef, useId } from "react"
import { toPng } from "html-to-image"
import { Share2 } from "lucide-react"
import { motion } from "framer-motion"
import { COMPARISONS, type ComparisonCategory } from "@/lib/constants/comparisons"
import { MBG } from "@/lib/constants/mbg"
import { formatIDR, formatNumber } from "@/lib/utils/format"
import { calcUnitsFromAmount } from "@/lib/utils/calculate"
import { ComparisonCard } from "./ComparisonCard"

const MAX_DAYS = 365
const MAX_AMOUNT = MBG.ANNUAL_BUDGET

const CATEGORY_LABELS: Record<ComparisonCategory | "all", string> = {
  all: "Semua",
  makanan: "Makanan",
  wisata: "Wisata",
  militer: "Militer",
  teknologi: "Teknologi",
  infrastruktur: "Infrastruktur",
  global: "Global",
  "luar-angkasa": "Luar Angkasa",
  olahraga: "Olahraga",
  hiburan: "Hiburan",
  kesehatan: "Kesehatan",
}

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

  const filtered =
    activeCategory === "all"
      ? COMPARISONS
      : COMPARISONS.filter((c) => c.category === activeCategory)

  const categories = (["all", ...new Set(COMPARISONS.map((c) => c.category))] as (ComparisonCategory | "all")[])

  return (
    <>
      {/* Controls — Lembar Kerja */}
      <div className="mb-10 border border-border bg-card">
        {/* Panel header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            Lembar Kerja
          </p>
          <p className="font-mono text-[10px] text-muted-foreground">
            APBN 2026 · BGN
          </p>
        </div>

        <div className="px-5 py-6">
          {/* Day readout */}
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Jumlah Hari
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-extrabold leading-none text-foreground md:text-6xl">
                  {clampedDays}
                </span>
                <span className="text-lg font-medium text-muted-foreground">hari</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Total Anggaran
              </p>
              <p className="font-mono text-lg font-bold text-amber-600 md:text-xl">
                {formatIDR(amount, true)}
              </p>
            </div>
          </div>

          {/* Slider */}
          <div className="mb-6">
            <input
              id={sliderId}
              type="range"
              min={1}
              max={MAX_DAYS}
              value={clampedDays}
              onChange={handleDayChange}
              className="h-1 w-full cursor-pointer appearance-none rounded-none bg-border accent-primary"
            />
            <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>1 hari</span>
              <span>365 hari</span>
            </div>
          </div>

          {/* Dashed divider */}
          <div className="mb-5 border-t border-dashed border-border" />

          {/* Amount input */}
          <div>
            <label
              htmlFor="amount-input"
              className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Atau masukkan nominal (IDR)
            </label>
            <div className="flex items-center border border-border bg-background px-4 py-2.5 focus-within:border-primary/50">
              <span className="mr-2 font-mono text-sm text-muted-foreground">Rp</span>
              <input
                id="amount-input"
                type="text"
                inputMode="numeric"
                value={inputDisplay}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                placeholder="1.200.000.000.000"
                className="flex-1 bg-transparent font-mono text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              />
            </div>
          </div>

          {/* Dashed divider */}
          <div className="my-5 border-t border-dashed border-border" />

          {/* Footer row */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-xs text-muted-foreground">
                {clampedDays}× anggaran harian MBG
              </p>
              <p className="font-mono text-xs text-muted-foreground/60">
                @ {formatIDR(MBG.DAILY_BUDGET, true)}/hari
              </p>
            </div>
            <button
              onClick={handleShare}
              className="flex cursor-pointer items-center gap-2 border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <Share2 size={12} />
              Bagikan
            </button>
          </div>
        </div>
      </div>

      {/* Output — Daftar Belanja */}
      <div>
        {/* Section header */}
        <div className="mb-5 border-b border-border pb-4">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
            Daftar Belanja
          </p>
          <h2 className="font-display text-xl font-extrabold text-foreground">
            Ini yang bisa dibeli:
          </h2>
        </div>

        {/* Category tabs — horizontally scrollable */}
        <div className="relative mb-6">
          <div className="flex gap-px overflow-x-auto bg-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 cursor-pointer whitespace-nowrap px-4 py-2 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-white"
                    : "bg-card text-muted-foreground hover:bg-secondary"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
          {/* Right fade — scroll hint */}
          <div className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background to-transparent" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((item, i) => {
            const units = calcUnitsFromAmount(amount, item.unitPrice)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ComparisonCard item={item} units={units} />
              </motion.div>
            )
          })}
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

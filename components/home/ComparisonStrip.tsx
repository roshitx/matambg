"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { COMPARISONS, type ComparisonItem } from "@/lib/constants/comparisons"
import { MBG } from "@/lib/constants/mbg"
import { formatNumber } from "@/lib/utils/format"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Items ordered by unit count (desc) — sorted dynamically below
const BAR_IDS = [
  "gorengan",
  "indomie-goreng",
  "nasi-padang",
  "guru-gaji",
  "tiket-bali",
  "motor-listrik",
  "rumah-subsidi",
  "puskesmas",
  "iphone-16-pro",
  "jalan-tol",
]

// Log scale: maps [1, maxUnits] → [0, 100] using log10
function logPct(units: number, maxUnits: number): number {
  if (units <= 0) return 0
  return (Math.log10(units) / Math.log10(maxUnits)) * 100
}

// RAF-based cubic ease-out animation — same approach as useLiveCounter.ts
function useAnimatedBudget(target: number): number {
  const [current, setCurrent] = useState(target)
  const prevRef = useRef(target)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const startTime = performance.now()
    const startVal = prevRef.current
    const DURATION = 650

    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / DURATION, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // cubic ease-out
      setCurrent(Math.round(startVal + (target - startVal) * eased))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        prevRef.current = target
        setCurrent(target)
      }
    }

    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [target])

  return current
}

function BarRow({
  item,
  budget,
  maxUnits,
  index,
}: {
  item: ComparisonItem
  budget: number
  maxUnits: number
  index: number
}) {
  const units = Math.floor(budget / item.unitPrice)
  const pct = logPct(units, maxUnits)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.28, delay: index * 0.04, ease: "easeOut" }}
      className="group -mx-3 cursor-default rounded-lg border-b border-dashed border-border/50 px-3 py-3 transition-colors last:border-0 hover:bg-muted/40"
    >
      {/* Emoji · name · number */}
      <div className="mb-2 flex items-center gap-2">
        <span className="w-6 flex-shrink-0 text-lg leading-none">{item.emoji}</span>
        <span className="flex-1 truncate text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
          {item.name}
        </span>
        <div className="flex-shrink-0 text-right">
          <span className="font-display text-lg font-extrabold tabular-nums text-foreground transition-colors group-hover:text-primary">
            {formatNumber(units)}
          </span>
          <span className="ml-1 text-[9px] uppercase tracking-widest text-muted-foreground/60">
            {item.unit}
          </span>
        </div>
      </div>

      {/* Bar — CSS transition handles mode-switch animation */}
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-border/40">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary/80"
          style={{
            width: `${pct}%`,
            transition: "width 0.65s cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        />
      </div>
    </motion.div>
  )
}

export function ComparisonStrip() {
  const [mode, setMode] = useState<"tahun" | "hari">("tahun")
  const targetBudget = mode === "tahun" ? MBG.ANNUAL_BUDGET : MBG.DAILY_BUDGET
  const budget = useAnimatedBudget(targetBudget)

  const itemById = Object.fromEntries(COMPARISONS.map((c) => [c.id, c]))
  const items = BAR_IDS.map((id) => itemById[id]).filter((item): item is ComparisonItem => !!item)

  // maxUnits based on target (not animated) to keep scale stable during animation
  const maxUnits = Math.max(...items.map((item) => Math.floor(targetBudget / item.unitPrice)))

  return (
    <section className="w-full border-t border-border py-14">
      <div className="mx-auto max-w-2xl px-4">
        {/* Section header */}
        <div className="mb-8">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Uang Rakyat · APBN 2026
          </p>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-foreground">
              <span className="text-primary">
                {mode === "tahun" ? "335T" : "1,2T"}
              </span>{" "}
              bisa buat apa?
            </h2>

            {/* Toggle pill — shadcn Tabs for smooth indicator animation */}
            <Tabs value={mode} onValueChange={(v) => setMode(v as "tahun" | "hari")}>
              <TabsList className="h-7">
                <TabsTrigger value="tahun" className="px-2.5 text-[11px]">Per Tahun</TabsTrigger>
                <TabsTrigger value="hari" className="px-2.5 text-[11px]">Per Hari</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "tahun"
              ? "Skala logaritmik — setiap langkah = 10× lebih kecil"
              : "Skala logaritmik — anggaran Rp 1,2 triliun per hari"}
          </p>
        </div>

        {/* Bar rows */}
        <div>
          {items.map((item, i) => (
            <BarRow
              key={item.id}
              item={item}
              budget={budget}
              maxUnits={maxUnits}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Download } from "lucide-react"
import { toPng } from "html-to-image"
import { useRef } from "react"
import type { ComparisonItem } from "@/lib/constants/comparisons"
import { CATEGORY_BORDER, CATEGORY_LABELS } from "@/lib/constants/ui"
import { formatNumber, formatIDR } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

interface Props {
  item: ComparisonItem
  units: number
}

export function ComparisonCard({ item, units }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!cardRef.current) return
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 })
      const link = document.createElement("a")
      link.download = `mbgmata-${item.id}.png`
      link.href = dataUrl
      link.click()
    } catch {
      // silently fail
    }
  }

  return (
    <div
      ref={cardRef}
      className={cn(
        "group relative rounded-xl border border-border bg-card p-5",
        "border-l-2 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-sm hover:border-border/60 cursor-default",
        CATEGORY_BORDER[item.category] ?? "border-l-border"
      )}
    >
      {/* Top row: category badge + download */}
      <div className="mb-3 flex items-start justify-between">
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
          {CATEGORY_LABELS[item.category] ?? item.category}
        </span>
        <button
          type="button"
          onClick={handleDownload}
          aria-label="Download sebagai PNG"
          className="cursor-pointer rounded-sm p-0.5 text-muted-foreground/40 opacity-0 transition-all hover:text-foreground group-hover:opacity-100"
        >
          <Download size={11} />
        </button>
      </div>

      {/* Emoji */}
      <div className="mb-2 text-3xl leading-none">{item.emoji}</div>

      {/* Animated number */}
      <AnimatePresence mode="wait">
        <motion.p
          key={units}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.18 }}
          className="font-display text-2xl font-extrabold leading-none text-amber-600"
        >
          {units > 0 ? formatNumber(units) : "0"}
        </motion.p>
      </AnimatePresence>

      <p className="mt-1 text-xs font-medium text-foreground line-clamp-2">
        {item.unit} {item.name}
      </p>

      <p className="mt-1 font-mono text-[10px] text-muted-foreground/60">
        @ {formatIDR(item.unitPrice, true)}/{item.unit}
      </p>

      {item.source && (
        <p className="mt-0.5 truncate font-mono text-[9px] text-primary/40">
          {item.source}
        </p>
      )}
    </div>
  )
}

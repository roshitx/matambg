"use client"

import { useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toPng } from "html-to-image"
import { Download } from "lucide-react"
import type { ComparisonItem } from "@/lib/constants/comparisons"
import { formatNumber, formatIDR } from "@/lib/utils/format"

interface Props {
  item: ComparisonItem
  units: number
}

const CATEGORY_LABELS: Record<string, string> = {
  makanan: "Makanan",
  wisata: "Wisata",
  militer: "Militer",
  teknologi: "Teknologi",
  infrastruktur: "Infrastruktur",
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
      // silently fail — user can screenshot manually
    }
  }

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col border border-border bg-card transition-colors hover:bg-secondary/40"
    >
      {/* Card header: category + download */}
      <div className="flex items-center justify-between border-b border-dashed border-border px-3 py-2">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
          {CATEGORY_LABELS[item.category] ?? item.category}
        </span>
        <button
          onClick={handleDownload}
          className="cursor-pointer rounded-sm p-0.5 text-muted-foreground/40 opacity-0 transition-all hover:bg-border hover:text-foreground group-hover:opacity-100"
          aria-label="Download sebagai PNG"
        >
          <Download size={11} />
        </button>
      </div>

      {/* Card body */}
      <div className="flex flex-1 flex-col px-3 py-3">
        {/* Emoji + name */}
        <div className="mb-2 flex items-start gap-2">
          <span className="text-2xl leading-none">{item.emoji}</span>
          <p className="text-xs font-medium leading-snug text-foreground">{item.name}</p>
        </div>

        {/* Animated number */}
        <AnimatePresence mode="wait">
          <motion.p
            key={units}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="font-display text-2xl font-extrabold leading-none text-amber-600"
          >
            {units > 0 ? formatNumber(units) : "0"}
          </motion.p>
        </AnimatePresence>

        <p className="mt-0.5 text-xs text-muted-foreground">{item.unit}</p>
      </div>

      {/* Card footer: price */}
      <div className="border-t border-border px-3 py-2">
        <p className="font-mono text-[10px] text-muted-foreground">
          @ {formatIDR(item.unitPrice, true)}/{item.unit}
        </p>
        {item.source && (
          <p className="mt-0.5 truncate font-mono text-[9px] text-primary/50">
            sumber: {item.source}
          </p>
        )}
      </div>
    </div>
  )
}

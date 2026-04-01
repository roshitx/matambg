"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Share2 } from "lucide-react"
import { COMPARISONS, type ComparisonCategory } from "@/lib/constants/comparisons"
import { MBG } from "@/lib/constants/mbg"
import { formatNumber, formatIDR } from "@/lib/utils/format"
import { ShareModal } from "./ShareModal"
import { AICardGenerator } from "./AICardGenerator"

type FilterCategory = ComparisonCategory | "all"

const CATEGORIES: { value: FilterCategory; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "makanan", label: "🍛 Makanan" },
  { value: "wisata", label: "✈️ Wisata" },
  { value: "militer", label: "⚓ Militer" },
  { value: "teknologi", label: "📱 Teknologi" },
  { value: "infrastruktur", label: "🏗️ Infrastruktur" },
]

export function ComparisonGrid() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all")
  const [shareItem, setShareItem] = useState<(typeof COMPARISONS)[number] | null>(null)

  const filtered =
    activeCategory === "all"
      ? COMPARISONS
      : COMPARISONS.filter((c) => c.category === activeCategory)

  return (
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-14 z-40 -mx-4 mb-6 px-4 py-3 backdrop-blur-md">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setActiveCategory(value)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === value
                  ? "bg-primary text-white"
                  : "border border-white/10 bg-white/5 text-[#A3A3A3] hover:bg-white/10 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison cards grid */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => {
            const units = Math.floor(MBG.ANNUAL_BUDGET / item.unitPrice)
            const isFeatured = item.featured === true

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className={`group relative flex flex-col rounded-2xl border border-white/08 bg-card p-5 transition-colors hover:border-white/15 ${
                  isFeatured ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                {isFeatured && (
                  <span className="absolute right-3 top-3 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    Featured
                  </span>
                )}

                <div className="mb-4 flex items-start justify-between">
                  <span className={isFeatured ? "text-4xl" : "text-3xl"}>{item.emoji}</span>
                  <button
                    onClick={() => setShareItem(item)}
                    className="rounded-md p-1.5 text-[#525252] opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
                    aria-label={`Bagikan ${item.name}`}
                  >
                    <Share2 size={14} />
                  </button>
                </div>

                <p className="mb-1 text-sm font-semibold text-white">{item.name}</p>
                <p className="mb-3 text-xs text-[#525252]">{item.description}</p>

                <div className="mt-auto">
                  <p className="text-xs uppercase tracking-widest text-[#525252]">
                    Rp 335T bisa beli
                  </p>
                  <p className={`font-heading font-bold text-accent ${isFeatured ? "text-3xl" : "text-2xl"}`}>
                    {units > 0 ? formatNumber(units) : "< 1"}
                  </p>
                  <p className="text-xs text-[#A3A3A3]">{item.unit}</p>
                  <p className="mt-2 text-xs text-[#525252]">
                    @ {formatIDR(item.unitPrice, true)}/{item.unit}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* AI Card Generator */}
      <AICardGenerator days={1} />

      {/* Share modal */}
      {shareItem && (
        <ShareModal item={shareItem} onClose={() => setShareItem(null)} />
      )}
    </>
  )
}

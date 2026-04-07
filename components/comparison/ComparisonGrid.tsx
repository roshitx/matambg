"use client"

import { useState, useRef, useEffect } from "react"
import { Share2, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { COMPARISONS, type ComparisonCategory, type ComparisonItem } from "@/lib/constants/comparisons"
import { CATEGORY_BORDER, CATEGORY_LABELS } from "@/lib/constants/ui"
import { MBG } from "@/lib/constants/mbg"
import { formatNumber, formatIDR } from "@/lib/utils/format"
import { canNativeShare } from "@/lib/utils/shareDetect"
import { getBlobCache, prefetchBlob, setBlobCache } from "@/lib/utils/blobCache"
import { formatCompact, buildShareText } from "@/lib/utils/shareFormat"
import { cn } from "@/lib/utils"
import { ShareModal } from "./ShareModal"

type FilterCategory = ComparisonCategory | "all"

// Count-up animation triggered when element enters viewport
function CountUp({ target, itemId }: { target: number; itemId: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [value, setValue] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()

        // PREFETCH: fire-and-forget when card enters viewport
        prefetchBlob(itemId, `/api/share-image/${itemId}`)

        let start: number | null = null
        const step = (ts: number) => {
          if (!start) start = ts
          const p = Math.min((ts - start) / 1200, 1)
          const ease = 1 - Math.pow(1 - p, 3) // easeOutCubic
          setValue(Math.floor(ease * target))
          if (p < 1) requestAnimationFrame(step)
          else setValue(target)
        }
        requestAnimationFrame(step)
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, itemId])

  return <span ref={ref}>{formatNumber(value)}</span>
}

interface CardProps {
  item: ComparisonItem
  onShare: (item: ComparisonItem) => void
  isShareLoading: boolean
}

function ComparisonCard({ item, onShare, isShareLoading }: CardProps) {
  const units = Math.floor(MBG.DAILY_BUDGET / item.unitPrice)
  const isFeatured = item.featured === true

  return (
    <article
      className={cn(
        "group relative rounded-xl border border-border bg-card p-5",
        "border-l-2 transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-sm hover:border-border/60 cursor-pointer",
        isFeatured && "bg-primary/[0.02]",
        CATEGORY_BORDER[item.category]
      )}
    >
      {/* Top row: category badge + share button */}
      <div className="mb-3 flex items-start justify-between">
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary">
          {CATEGORY_LABELS[item.category]}
        </span>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onShare(item) }}
          aria-label={`Bagikan ${item.name}`}
          disabled={isShareLoading}
          className={cn(
            "cursor-pointer rounded-sm p-0.5 text-muted-foreground/40 opacity-0 transition-all hover:text-foreground group-hover:opacity-100",
            isShareLoading && "opacity-100 cursor-not-allowed"
          )}
        >
          {isShareLoading ? (
            <Loader2 size={11} className="animate-spin" />
          ) : (
            <Share2 size={11} />
          )}
        </button>
      </div>

      {/* Emoji */}
      <div
        className={cn(
          "mb-3 leading-none",
          isFeatured ? "text-5xl" : "text-4xl"
        )}
      >
        {item.emoji}
      </div>

      {/* Count-up number */}
      <p
        className={cn(
          "font-display font-extrabold leading-none text-amber-600",
          isFeatured ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"
        )}
      >
        {units > 0 ? <CountUp target={units} itemId={item.id} /> : "< 1"}
      </p>

      <p className="mt-1.5 text-[11px] font-medium text-foreground line-clamp-2">
        {item.unit} {item.name}
      </p>

      <p className="mt-0.5 font-mono text-[9px] text-muted-foreground/60">
        @ {formatIDR(item.unitPrice, true)}/{item.unit}
      </p>
    </article>
  )
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.33, 1, 0.68, 1] as [number, number, number, number] } },
}

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

export function ComparisonGrid() {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all")
  const [shareItem, setShareItem] = useState<ComparisonItem | null>(null)
  const [shareLoadingId, setShareLoadingId] = useState<string | null>(null)

  const filtered =
    activeCategory === "all"
      ? COMPARISONS
      : COMPARISONS.filter((c) => c.category === activeCategory)

  const categories = [
    "all",
    ...new Set(COMPARISONS.map((c) => c.category)),
  ] as FilterCategory[]

  async function handleShare(item: ComparisonItem) {
    const nativeSupported = canNativeShare()

    if (!nativeSupported) {
      // Desktop: open modal
      setShareItem(item)
      return
    }

    // Mobile: native share with prefetch
    setShareLoadingId(item.id)

    try {
      // Get blob from cache or fetch
      const blob = getBlobCache(item.id) ?? await (async () => {
        const r = await fetch(`/api/share-image/${item.id}`)
        if (!r.ok) throw new Error("Image fetch failed")
        const b = await r.blob()
        setBlobCache(item.id, b)
        return b
      })()

      const units = Math.floor(MBG.DAILY_BUDGET / item.unitPrice)
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://matambg.web.id"
      const compactUnits = formatCompact(units)

      await navigator.share({
        files: [
          new File([blob], `matambg-${item.id}.png`, { type: "image/png" })
        ],
        title: `1 hari MBG = ${compactUnits} ${item.unit} ${item.name}`,
        text: buildShareText(item, units, "native"),
        url: `${appUrl}/perbandingan`,
      })
    } catch (err) {
      // Silent cancel
      if (err instanceof Error && err.name === "AbortError") return

      // Fallback to desktop modal on error
      setShareItem(item)
    } finally {
      setShareLoadingId(null)
    }
  }

  return (
    <>
      {/* Sticky filter bar */}
      <div className="sticky top-14 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
              {filtered.length} item
            </span>
            <div className="relative min-w-0 flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial="hidden"
            animate="visible"
            variants={gridVariants}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3"
          >
            {filtered.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                className={cn(item.featured && "sm:col-span-2")}
              >
                <ComparisonCard
                  item={item}
                  onShare={handleShare}
                  isShareLoading={shareLoadingId === item.id}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Share modal */}
      {shareItem && (
        <ShareModal item={shareItem} onClose={() => setShareItem(null)} />
      )}
    </>
  )
}

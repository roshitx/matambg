"use client"

import type { Sentiment } from "@/types/news"
import { cn } from "@/lib/utils"

const SENTIMENTS: { value: Sentiment | "semua"; label: string; dot: string }[] = [
  { value: "semua", label: "Semua", dot: "" },
  { value: "kontroversi", label: "Kontroversi", dot: "bg-primary" },
  { value: "anggaran", label: "Anggaran", dot: "bg-amber-500" },
  { value: "positif", label: "Positif", dot: "bg-green-500" },
  { value: "kebijakan", label: "Kebijakan", dot: "bg-muted-foreground" },
]

const ACTIVE_SENTIMENT: Record<string, string> = {
  semua: "bg-foreground text-background",
  kontroversi: "bg-primary text-white",
  anggaran: "bg-amber-500 text-white",
  positif: "bg-green-500 text-white",
  kebijakan: "bg-secondary text-foreground",
}

const SOURCES = ["Semua Sumber", "Kompas", "Tempo", "CNN Indonesia", "BBC Indonesia", "Detik"]

interface FilterBarProps {
  activeSentiment: Sentiment | "semua"
  activeSource: string
  onSentimentChange: (s: Sentiment | "semua") => void
  onSourceChange: (s: string) => void
}

export function FilterBar({
  activeSentiment,
  activeSource,
  onSentimentChange,
  onSourceChange,
}: FilterBarProps) {
  return (
    <div className="mb-5 space-y-2">
      {/* Row 1: Sentiment */}
      <div className="flex flex-wrap gap-1.5">
        {SENTIMENTS.map(({ value, label, dot }) => {
          const active = activeSentiment === value
          return (
            <button
              key={value}
              type="button"
              onClick={() => onSentimentChange(value)}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-sm px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] transition-all duration-150",
                active
                  ? ACTIVE_SENTIMENT[value]
                  : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {dot && (
                <span className={cn("inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full", dot)} />
              )}
              {label}
            </button>
          )
        })}
      </div>

      {/* Row 2: Source */}
      <div className="flex flex-wrap gap-1.5">
        {SOURCES.map((source) => {
          const active = activeSource === source
          return (
            <button
              key={source}
              type="button"
              onClick={() => onSourceChange(source)}
              className={cn(
                "cursor-pointer rounded-sm px-2.5 py-0.5 text-[10px] font-medium transition-all duration-150",
                active
                  ? "bg-secondary text-foreground"
                  : "border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {source}
            </button>
          )
        })}
      </div>
    </div>
  )
}

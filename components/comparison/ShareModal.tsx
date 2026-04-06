"use client"

import { useState } from "react"
import { X, Copy, Check } from "lucide-react"
import type { ComparisonItem } from "@/lib/constants/comparisons"
import { formatNumber } from "@/lib/utils/format"
import { MBG } from "@/lib/constants/mbg"

interface Props {
  item: ComparisonItem
  onClose: () => void
}

export function ShareModal({ item, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const units = Math.floor(MBG.DAILY_BUDGET / item.unitPrice)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://matambg.id"
  const url = `${appUrl}/perbandingan`

  const tweetText = `1 hari anggaran #MBG = ${formatNumber(units)} ${item.unit} ${item.name}!\nData: Rp 1,2 Triliun/hari dari APBN 2026 🇮🇩\nCek lebih banyak: ${url} #mataMBG`
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Tutup"
        >
          <X size={16} />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <span className="text-3xl">{item.emoji}</span>
          <div>
            <p className="font-medium text-foreground">{item.name}</p>
            <p className="text-sm text-muted-foreground">Bagikan perbandingan ini</p>
          </div>
        </div>

        {/* Tweet preview */}
        <div className="mb-4 rounded-xl border border-border bg-secondary/50 p-4 text-sm">
          <p className="whitespace-pre-line text-foreground">{tweetText}</p>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-[#1DA1F2] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
          >
            𝕏 Tweet Ini
          </a>

          <button
            type="button"
            onClick={handleCopy}
            className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/80"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? "Link tersalin!" : "Salin Link"}
          </button>
        </div>
      </div>
    </div>
  )
}

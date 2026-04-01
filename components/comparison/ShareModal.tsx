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

  const units = Math.floor(MBG.ANNUAL_BUDGET / item.unitPrice)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://matambg.id"
  const url = `${appUrl}/perbandingan`

  const tweetText = `1 tahun anggaran #MBG = ${formatNumber(units)} ${item.unit} ${item.name}!\nData: Rp 335 Triliun/tahun dari APBN 2026 🇮🇩\nCek lebih banyak: ${url} #mataMBG`
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-card p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-[#525252] hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>

        <div className="mb-4 flex items-center gap-3">
          <span className="text-3xl">{item.emoji}</span>
          <div>
            <p className="font-semibold text-white">{item.name}</p>
            <p className="text-sm text-[#A3A3A3]">
              Bagikan perbandingan ini
            </p>
          </div>
        </div>

        {/* Tweet preview */}
        <div className="mb-4 rounded-xl border border-white/08 bg-card p-4 text-sm text-[#A3A3A3]">
          <p className="whitespace-pre-line text-white">{tweetText}</p>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#1DA1F2] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1a8cd8]"
          >
            𝕏 Tweet Ini
          </a>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            {copied ? <Check size={16} className="text-[#22C55E]" /> : <Copy size={16} />}
            {copied ? "Link tersalin!" : "Salin Link"}
          </button>
        </div>
      </div>
    </div>
  )
}

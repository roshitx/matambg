"use client"

import { useState, useEffect } from "react"
import { X, Download, Copy, Check } from "lucide-react"
import { SiWhatsapp, SiX, SiApple } from "react-icons/si"
import type { ComparisonItem } from "@/lib/constants/comparisons"
import { MBG } from "@/lib/constants/mbg"
import { buildShareText } from "@/lib/utils/shareFormat"
import { cn } from "@/lib/utils"

interface Props {
  item: ComparisonItem
  onClose: () => void
}

export function ShareModal({ item, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent))
    }
  }, [])

  const units = Math.floor(MBG.DAILY_BUDGET / item.unitPrice)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://matambg.web.id"
  const url = `${appUrl}/perbandingan`

  const tweetText = buildShareText(item, units, "twitter")
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`

  const whatsappText = buildShareText(item, units, "whatsapp")
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText + " " + url)}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{item.emoji}</span>
            <div>
              <p className="font-medium text-foreground">{item.name}</p>
              <p className="text-sm text-muted-foreground">Bagikan perbandingan ini</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Tutup"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-6">
          <div className="w-[140px] shrink-0">
            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-secondary">
              {!imageLoaded && !imageError && (
                <div className="absolute inset-0 animate-pulse bg-secondary" />
              )}
              {imageError ? (
                <div className="flex h-full items-center justify-center p-2 text-center text-xs text-muted-foreground">
                  Gambar tidak tersedia
                </div>
              ) : (
                <img
                  src={`/api/share-image/${item.id}`}
                  alt={`Share card untuk ${item.name}`}
                  className={cn(
                    "h-full w-full object-cover",
                    !imageLoaded && "invisible"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2">
            <a
              href={tweetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-[#000000] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#333333] dark:bg-[#ffffff] dark:text-[#000000] dark:hover:bg-[#e6e6e6]"
            >
              <SiX size={14} />
              Post di X
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#20bd5a]"
            >
              <SiWhatsapp size={14} />
              WhatsApp
            </a>

            <a
              href={`/api/share-image/${item.id}`}
              download={`matambg-${item.id}.png`}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/80"
            >
              <Download size={14} />
              Download Gambar
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/80"
            >
              {copied ? (
                <Check size={14} className="text-green-500" />
              ) : (
                <Copy size={14} />
              )}
              {copied ? "Tersalin!" : "Salin Link"}
            </button>

            {isIOS && (
              <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <SiApple size={10} />
                Di iOS: tahan gambar → Simpan ke Foto, lalu upload ke Instagram
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

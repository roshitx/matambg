"use client"

import { useState } from "react"
import { Sparkles, Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type { AIComparisonItem } from "@/types/comparison"
import { formatNumber, formatIDR } from "@/lib/utils/format"
import { MBG } from "@/lib/constants/mbg"

interface Props {
  days?: number
}

export function AICardGenerator({ days = 365 }: Props) {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AIComparisonItem | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (query.trim().length < 3 || loading) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/comparison", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), days }),
      })
      if (!res.ok) throw new Error("Gagal menghasilkan perbandingan")
      const data = (await res.json()) as AIComparisonItem
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const budget = days * MBG.DAILY_BUDGET

  return (
    <div className="rounded-2xl border border-white/08 bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={16} className="text-accent" />
        <h3 className="font-semibold text-white">Generator AI</h3>
        <span className="ml-auto text-xs text-[#525252]">
          Budget: {formatIDR(budget, true)}
        </span>
      </div>

      <p className="mb-4 text-sm text-[#A3A3A3]">
        Ketik nama barang apa saja, AI akan hitung berapa bisa dibeli dengan anggaran MBG.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="cth: mobil listrik, helikopter, satelit..."
          className="flex-1 rounded-xl border border-white/08 bg-background px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || query.trim().length < 3}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? "..." : "Hitung"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-4 rounded-xl border border-accent/20 bg-accent/5 p-4"
          >
            <span className="text-4xl">{result.emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-white">{result.name}</p>
              <p className="font-heading text-2xl font-bold text-accent">
                {formatNumber(result.units)}{" "}
                <span className="text-sm font-normal text-[#A3A3A3]">{result.unit}</span>
              </p>
              <p className="text-xs text-[#525252]">{result.description}</p>
              <p className="mt-1 text-xs text-[#525252]">
                Harga satuan: {formatIDR(result.unitPrice, true)} · {result.priceSource}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

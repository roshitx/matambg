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
    <div className="rounded-xl border border-dashed border-primary/20 bg-primary/[0.02] p-6">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles size={16} className="text-amber-600" />
        <h3 className="font-display text-xl font-bold text-foreground">Buat Perbandingan Sendiri</h3>
        <span className="ml-auto text-[10px] text-muted-foreground">
          Budget: {formatIDR(budget, true)}
        </span>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        Ketik nama barang apa saja — AI akan hitung berapa bisa dibeli dengan anggaran MBG.
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="cth: Ferrari Roma, helikopter, satelit..."
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || query.trim().length < 3}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {loading ? "..." : "Generate →"}
        </button>
      </div>

      <p className="mt-2 text-[10px] text-muted-foreground/60">
        Perhitungan menggunakan data publik, hasil perkiraan
      </p>

      {error && (
        <p className="mt-3 text-sm text-destructive">{error}</p>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
          >
            <span className="text-4xl">{result.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{result.name}</p>
              <p className="font-display text-3xl font-extrabold text-amber-600">
                {formatNumber(result.units)}{" "}
                <span className="text-sm font-normal text-muted-foreground">{result.unit}</span>
              </p>
              <p className="text-xs text-muted-foreground">{result.description}</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground/60">
                Harga satuan: {formatIDR(result.unitPrice, true)} · {result.priceSource}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

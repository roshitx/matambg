import type { Metadata } from "next"
import { ComparisonGrid } from "@/components/comparison/ComparisonGrid"
import { AICardGenerator } from "@/components/comparison/AICardGenerator"
import { PageHero } from "@/components/layout/PageHero"
import { MBG } from "@/lib/constants/mbg"
import { COMPARISONS } from "@/lib/constants/comparisons"

export const metadata: Metadata = {
  title: "1 Hari MBG = | mataMBG",
  description:
    "Dalam 1 hari, anggaran MBG mencapai Rp 1,2 Triliun. Setara dengan apa? Scroll untuk lihat perbandingannya.",
}

export default function PerbandinganPage() {
  return (
    <main className="w-full">
      <PageHero
        kicker="Simulasi Anggaran · APBN 2026"
        title={<>1 Hari <span className="text-primary">MBG</span>&nbsp;=</>}
      >
        <p className="font-mono text-3xl font-bold text-amber-600 md:text-4xl">
          Rp {(MBG.DAILY_BUDGET / 1e12).toFixed(1)} Triliun
        </p>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Scroll ke bawah untuk melihat perbandingan 1 hari anggaran MBG
          dengan berbagai barang dan jasa — lalu bagikan.
        </p>

        {/* Stat pill */}
        <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-[11px]">
          <span className="font-mono text-muted-foreground">
            Rp {(MBG.DAILY_BUDGET / 1e12).toFixed(1)}T/hari
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="font-semibold text-amber-600">
            {COMPARISONS.length} perbandingan
          </span>
        </div>
      </PageHero>

      <ComparisonGrid />

      {/* AI Card Generator */}
      <div className="mx-auto max-w-6xl px-4 pb-14">
        <AICardGenerator />
      </div>
    </main>
  )
}

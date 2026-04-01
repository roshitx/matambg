import type { Metadata } from "next"
import { Calculator } from "@/components/calculator/Calculator"

export const metadata: Metadata = {
  title: "Kalkulator MBG",
  description:
    "Hitung berapa unit item yang bisa dibeli dengan anggaran MBG. Dari Indomie hingga kapal induk.",
}

export default function KalkulatorPage() {
  return (
    <main className="relative w-full overflow-hidden">
      {/* Lined paper texture — same as HeroSection */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 31px, hsl(30 15% 86% / 0.55) 31px, hsl(30 15% 86% / 0.55) 32px)",
          backgroundPosition: "0 18px",
        }}
      />

      {/* Masthead */}
      <div className="relative border-b border-border">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 md:pt-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Simulasi Anggaran · APBN 2026
          </p>
          <h1 className="mb-4 font-display text-4xl font-extrabold leading-none tracking-tight text-foreground md:text-5xl">
            Kalkulator MBG
          </h1>
          <div className="mb-5 h-px w-14 bg-primary" />
          <p className="max-w-md text-base leading-relaxed text-muted-foreground">
            Pilih berapa hari anggaran MBG, lihat bisa beli apa saja dengan uang pajak rakyat.
          </p>
        </div>
      </div>

      {/* Calculator */}
      <div className="relative mx-auto max-w-6xl px-4 py-10">
        <Calculator />
      </div>
    </main>
  )
}

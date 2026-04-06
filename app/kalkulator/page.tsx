import type { Metadata } from "next"
import { Calculator } from "@/components/calculator/Calculator"
import { PageHero } from "@/components/layout/PageHero"

export const metadata: Metadata = {
  title: "Kalkulator MBG",
  description:
    "Hitung berapa unit item yang bisa dibeli dengan anggaran MBG. Dari Indomie hingga kapal induk.",
}

export default function KalkulatorPage() {
  return (
    <main className="w-full">
      <PageHero
        kicker="Simulasi Anggaran · APBN 2026"
        title={<>Kalkulator <span className="text-primary">MBG</span></>}
        subtitle="Pilih berapa hari anggaran MBG, lihat bisa beli apa saja dengan uang pajak rakyat."
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <Calculator />
      </div>
    </main>
  )
}

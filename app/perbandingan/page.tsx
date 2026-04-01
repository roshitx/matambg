import type { Metadata } from "next"
import { ComparisonGrid } from "@/components/comparison/ComparisonGrid"

export const metadata: Metadata = {
  title: "Perbandingan MBG",
  description:
    "Bandingkan anggaran MBG Rp 335 Triliun dengan berbagai barang dan layanan. Dari Indomie, iPhone, kapal induk, hingga rumah subsidi.",
}

export default function PerbandinganPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="mb-2 font-heading text-3xl font-extrabold text-white md:text-4xl">
          Perbandingan MBG
        </h1>
        <p className="text-[#A3A3A3]">
          Rp 335 Triliun per tahun setara dengan berapa banyak hal di bawah ini?
        </p>
      </div>
      <ComparisonGrid />
    </main>
  )
}

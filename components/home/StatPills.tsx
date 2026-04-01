"use client"

import { motion } from "framer-motion"
import { MBG } from "@/lib/constants/mbg"
import { formatIDR } from "@/lib/utils/format"

const STATS = [
  {
    label: "Per hari",
    value: formatIDR(MBG.DAILY_BUDGET, true),
    sub: "365 hari setahun tanpa libur",
  },
  {
    label: "Per bulan",
    value: formatIDR(MBG.MONTHLY_BUDGET, true),
    sub: "rata-rata 28 hari aktif",
  },
  {
    label: "Total 2026",
    value: formatIDR(MBG.ANNUAL_BUDGET, true),
    sub: "pagu APBN resmi",
  },
]

export function StatPills() {
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-10">
      {/* Ruled editorial grid — border shows through gap-px */}
      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-3">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.42 + i * 0.07 }}
            className="bg-card px-6 py-7"
          >
            <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {stat.label}
            </p>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {stat.value}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {stat.sub}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

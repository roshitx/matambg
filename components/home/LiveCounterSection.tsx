"use client"

import { motion } from "framer-motion"
import NumberFlow from "@number-flow/react"
import { useLiveCounter } from "@/hooks/useLiveCounter"

export function LiveCounterSection() {
  const { amount } = useLiveCounter()

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full bg-foreground py-16 md:py-24"
    >
      <div className="mx-auto max-w-3xl px-4">
        <p className="mb-5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-primary pulse" />
          Sudah terpakai hari ini
        </p>

        <NumberFlow
          value={amount}
          format={{ style: "currency", currency: "IDR", maximumFractionDigits: 0 }}
          locales="id-ID"
          className="font-display text-5xl font-extrabold text-white md:text-7xl lg:text-[5.5rem]"
        />

        <p className="mt-6 text-sm text-white/30">
          Dihitung sejak 00:00 WIB · diperbarui setiap detik
        </p>
      </div>
    </motion.section>
  )
}

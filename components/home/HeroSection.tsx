"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { MBG } from "@/lib/constants/mbg"
import { formatIDR } from "@/lib/utils/format"

const BUDGET_VARIANTS = [
  { number: "335",  period: "per tahun" },
  { number: "1,2",  period: "per hari" },
  { number: "25",   period: "per bulan" },
] as const

// Stagger chars left-to-right on enter, right-to-left on exit
const numContainerVariants = {
  animate: { transition: { staggerChildren: 0.08 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
}
const numCharVariants = {
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.33, 1, 0.68, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -26, transition: { duration: 0.2, ease: [0.32, 0, 0.67, 0] as [number, number, number, number] } },
}

const LINE_ITEMS = [
  { label: "Total APBN", value: formatIDR(MBG.ANNUAL_BUDGET, true) },
  { label: "Per hari", value: formatIDR(MBG.DAILY_BUDGET, true) },
  { label: "Per porsi", value: `Rp ${MBG.PRICE_PER_MEAL.toLocaleString("id-ID")}` },
] as const

function ReceiptIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, rotate: -6, y: 28 }}
      animate={{ opacity: 1, rotate: -3, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: "easeOut" }}
      className="relative hidden select-none md:block"
      aria-hidden
    >
      {/* Stacked paper shadow */}
      <div className="absolute -bottom-2 -right-2 h-full w-52 rounded-sm bg-border" />
      <div className="absolute -bottom-1 -right-1 h-full w-52 rounded-sm bg-border/50" />

      {/* Receipt */}
      <div className="relative w-52 overflow-hidden rounded-sm border border-border/70 bg-card text-[11px] shadow-sm">
        {/* Header */}
        <div className="bg-primary px-4 pb-3 pt-3">
          <p className="text-[8px] font-semibold uppercase tracking-[0.22em] text-white/55">
            Dokumen Negara
          </p>
          <p className="mt-0.5 font-mono text-[12px] font-bold tracking-tight text-white">
            ANGGARAN MBG 2026
          </p>
        </div>

        {/* Line items */}
        <div className="px-4 py-3 font-mono">
          <div className="mb-2.5 border-t border-dashed border-border" />

          <div className="space-y-1.5">
            {LINE_ITEMS.map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-bold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="my-2.5 border-t border-dashed border-border" />

          {/* Realisasi */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Realisasi</span>
              <span className="font-bold text-primary">
                {formatIDR(MBG.REALIZATION_MAR9_2026, true)}
              </span>
            </div>
            <div className="flex justify-between text-[9.5px]">
              <span className="text-muted-foreground">per 9 Mar 2026</span>
              <span className="text-muted-foreground">{MBG.REALIZATION_PCT_MAR9}%</span>
            </div>
          </div>

          <div className="my-2.5 border-t border-dashed border-border" />

          {/* Redacted section — transparency gap */}
          <div className="space-y-1.5">
            <p className="text-muted-foreground">Laporan publik:</p>
            <div className="h-2.5 w-full rounded-[1px] bg-foreground/80" />
            <div className="h-2.5 w-4/5 rounded-[1px] bg-foreground/80" />
            <div className="h-2.5 w-11/12 rounded-[1px] bg-foreground/80" />
          </div>
        </div>

        {/* Rubber stamp */}
        <div className="flex justify-center pb-4 pt-1">
          <div className="rotate-[9deg] rounded border-2 border-primary/25 px-3 py-1 text-center">
            <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-primary/35">
              Uang Rakyat
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function HeroSection() {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIdx(i => (i + 1) % BUDGET_VARIANTS.length), 4500)
    return () => clearInterval(id)
  }, [])

  const variant = BUDGET_VARIANTS[idx]

  return (
    <section className="relative w-full overflow-hidden border-b border-border">
      {/* Lined paper background — editorial texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(transparent, transparent 31px, hsl(30 15% 86% / 0.55) 31px, hsl(30 15% 86% / 0.55) 32px)",
          backgroundPosition: "0 18px",
        }}
      />

      <div className="relative mx-auto flex max-w-6xl items-center gap-12 px-4 pb-14 pt-16 md:gap-20 md:pb-20 md:pt-28">
        {/* Left — copy */}
        <div className="min-w-0 flex-1">
          {/* Kicker — whose money this is */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-primary"
          >
            Pajak Kamu · APBN 2026
          </motion.p>

          {/* Big number */}
          <LayoutGroup>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="mb-16 font-display text-6xl font-extrabold leading-none tracking-tight text-foreground md:text-8xl"
            >
              Rp{" "}
              {/*
               * Wrapper: relative so SVG + label can be positioned inside.
               * inline-flex + items-baseline so "Triliun" sits at same baseline.
               */}
              <span className="relative inline-flex items-baseline gap-[0.15em]">

                {/* Animated number — chars slide up one by one, front-first */}
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={variant.number}
                    className="inline-flex"
                    variants={numContainerVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {variant.number.split("").map((char, i) => (
                      <motion.span
                        key={i}
                        variants={numCharVariants}
                        className="inline-block"
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.span>
                </AnimatePresence>

                {/* "Triliun" — shifts left/right via layout animation as number width changes */}
                <motion.span layout transition={{ type: "spring", stiffness: 380, damping: 32 }}>
                  Triliun
                </motion.span>

                {/* Wavy pen-stroke — absolute, drawn once on mount, z-0 */}
                <svg
                  viewBox="0 0 520 32"
                  className="pointer-events-none absolute left-0 h-7 w-full text-primary"
                  style={{ bottom: "-10px" }}
                  fill="none"
                  aria-hidden
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M3,24 C18,6 38,30 62,18 C82,7 102,28 128,16 C150,5 172,27 200,17 C220,7 244,28 272,18 C294,8 318,26 346,16 C368,5 392,28 420,18 C442,7 464,26 490,16 C504,8 514,20 518,14"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 0.95, delay: 0.45, ease: "easeInOut" }}
                  />
                </svg>

                {/* "per tahun/hari/bulan" — sits below wavy SVG, z above it */}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={variant.period}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute right-0 font-jakarta text-sm font-normal tracking-wide text-muted-foreground md:text-base"
                    style={{ bottom: "-36px" }}
                  >
                    {variant.period}
                  </motion.span>
                </AnimatePresence>

              </span>
            </motion.h1>
          </LayoutGroup>

          {/* Animated rule */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.22, ease: "easeOut" }}
            className="mb-6 h-px w-14 origin-left bg-primary"
          />

          {/* Headline — critical civic framing */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="mb-5 max-w-sm text-2xl font-bold leading-snug tracking-tight text-foreground md:text-3xl"
          >
            Uang pajakmu.
            <br />
            Program mereka.
          </motion.h2>

          {/* Subcopy — specific, direct, no fluff */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.38 }}
            className="max-w-md text-base leading-relaxed text-muted-foreground"
          >
            Rp 1,2 triliun setiap hari keluar dari APBN — yang diisi pajak yang
            kamu bayar. Tidak ada laporan publik yang bisa kamu akses secara
            real-time. Ini datanya.
          </motion.p>

          {/* Issue stats — watchdog data points, semua bersumber dari lembaga resmi */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-5 flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
              <span>
                <strong className="text-foreground">21.254 anak</strong> jadi korban keracunan MBG sejak Januari 2025{" "}
                <span className="text-muted-foreground/60">— BBC Indonesia, Jan 2026</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
              <span>Dugaan korupsi pengadaan pangan di 6 daerah</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span>
                <strong className="text-foreground">12.658 korban</strong> tercatat resmi oleh KPAI di 38 provinsi — hanya sepanjang 2025{" "}
                <span className="text-muted-foreground/60">— KPAI LAT 2025</span>
              </span>
            </div>
          </motion.div>
        </div>

        {/* Right — receipt illustration */}
        <div className="flex flex-shrink-0 items-center justify-center">
          <ReceiptIllustration />
        </div>
      </div>
    </section>
  )
}

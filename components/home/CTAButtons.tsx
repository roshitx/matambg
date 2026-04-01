"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Calculator } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CTAButtons() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="mx-auto w-full max-w-3xl px-4 pb-12"
    >
      <div className="flex w-full flex-wrap items-center gap-3">
        <Link
          href="/kalkulator"
          className={cn(
            buttonVariants({ variant: "default" }),
            "gap-2 rounded-lg px-6 py-3 text-sm font-medium"
          )}
        >
          <Calculator size={14} />
          Buka Kalkulator
        </Link>
        <Link
          href="/tanya-ai"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "gap-1 rounded-lg px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground"
          )}
        >
          Tanya AI tentang MBG →
        </Link>
      </div>
    </motion.section>
  )
}

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Brain } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/kalkulator", label: "Kalkulator" },
  { href: "/perbandingan", label: "1 Hari MBG =" },
  { href: "/berita", label: "Berita" },
]

// Hand-drawn wobbly circle — spidol merah mengelilingi tombol X
function MarkerCircle() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="pointer-events-none absolute inset-0 h-full w-full text-primary"
      fill="none"
      aria-hidden
    >
      <motion.path
        d="M24,5 C35,4 44,10 45,20 C46.5,31 39,43 27,45 C15,47 3,39 2,28 C0.5,17 8,6 24,5 Z"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      />
    </svg>
  )
}

const LINED_PAPER = {
  backgroundImage:
    "repeating-linear-gradient(transparent, transparent 31px, hsl(30 15% 86% / 0.6) 31px, hsl(30 15% 86% / 0.6) 32px)",
  backgroundPosition: "0 18px",
}

export function Navbar() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close drawer on route change
  useEffect(() => {
    if (pathname) setMenuOpen(false)
  }, [pathname])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [menuOpen])

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300",
          scrolled
            ? "border-b border-border bg-background/90 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary pulse" />
            <span className="font-display text-lg font-bold tracking-tight text-foreground">
              MBG<span className="text-primary">mata</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            <ul className="flex items-center gap-6">
              {NAV_LINKS.map(({ href, label }) => {
                const active = pathname === href
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "relative pb-0.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors",
                        active
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {label}
                      {active && (
                        <span className="absolute -bottom-px left-0 h-px w-full bg-primary" />
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Tanya AI — editorial outline CTA */}
            <Link
              href="/tanya-ai"
              className="flex items-center gap-1.5 rounded-sm border border-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <Brain size={12} />
              Tanya AI
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            className="relative flex h-10 w-10 cursor-pointer items-center justify-center text-foreground transition-colors hover:text-primary md:hidden"
          >
            <AnimatePresence mode="wait" initial={false}>
              {menuOpen ? (
                <motion.span
                  key="close"
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.18 }}
                  className="relative flex h-10 w-10 items-center justify-center"
                >
                  <MarkerCircle />
                  {/* X drawn manually as two crossing lines */}
                  <svg
                    viewBox="0 0 16 16"
                    width={16}
                    height={16}
                    className="relative z-10 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="2" y1="2" x2="14" y2="14" />
                    <line x1="14" y1="2" x2="2" y2="14" />
                  </svg>
                </motion.span>
              ) : (
                <motion.span
                  key="open"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-[2px] md:hidden"
              onClick={() => setMenuOpen(false)}
              aria-hidden
            />

            {/* Drawer panel — kertas */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.32, 0, 0.67, 0] }}
              className="fixed inset-y-0 right-0 z-50 flex w-1/2 min-w-[260px] flex-col border-l border-border bg-card shadow-2xl md:hidden"
              style={LINED_PAPER}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-dashed border-border px-5 py-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-primary">
                    Navigasi
                  </p>
                  <p className="font-display text-sm font-bold text-foreground">
                    MBG<span className="text-primary">mata</span>
                  </p>
                </div>
                {/* X button with marker circle — mirrors hamburger */}
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Tutup menu"
                  className="relative flex h-10 w-10 cursor-pointer items-center justify-center text-primary"
                >
                  <MarkerCircle />
                  <svg
                    viewBox="0 0 16 16"
                    width={14}
                    height={14}
                    className="relative z-10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <line x1="2" y1="2" x2="14" y2="14" />
                    <line x1="14" y1="2" x2="2" y2="14" />
                  </svg>
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-1 flex-col px-5 py-6">
                <ul className="flex flex-col gap-1">
                  {NAV_LINKS.map(({ href, label }, i) => {
                    const active = pathname === href
                    return (
                      <motion.li
                        key={href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + i * 0.07, duration: 0.28, ease: [0.33, 1, 0.68, 1] }}
                      >
                        <Link
                          href={href}
                          className={cn(
                            "group flex items-center gap-3 border-b border-dashed border-border py-4 transition-colors",
                            active ? "text-primary" : "text-foreground hover:text-primary"
                          )}
                        >
                          {/* Left indicator */}
                          <span
                            className={cn(
                              "h-3.5 w-0.5 flex-shrink-0 transition-colors",
                              active ? "bg-primary" : "bg-border group-hover:bg-primary/40"
                            )}
                          />
                          <span className="font-display text-xl font-extrabold leading-none">
                            {label}
                          </span>
                        </Link>
                      </motion.li>
                    )
                  })}
                </ul>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.28 }}
                  className="mt-6"
                >
                  <Link
                    href="/tanya-ai"
                    className="flex w-full items-center justify-center gap-2 rounded-sm border border-primary py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-white"
                  >
                    <Brain size={13} />
                    Tanya AI
                  </Link>
                </motion.div>
              </nav>

              {/* Drawer footer */}
              <div className="border-t border-border px-5 py-4">
                <p className="font-mono text-[10px] text-muted-foreground">
                  matambg.id · APBN 2026
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

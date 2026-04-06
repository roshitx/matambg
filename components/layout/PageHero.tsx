import type React from "react"
import { LINED_PAPER } from "@/lib/constants/ui"

interface PageHeroProps {
  breadcrumb?: string
  kicker: string
  title: React.ReactNode
  titleClassName?: string
  subtitle?: string
  children?: React.ReactNode
}

export function PageHero({ breadcrumb, kicker, title, titleClassName, subtitle, children }: PageHeroProps) {
  return (
    <div className="relative border-b border-border" style={LINED_PAPER}>
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 md:pt-20">
        {breadcrumb && (
          <p className="mb-1 font-mono text-[10px] text-muted-foreground/60">{breadcrumb}</p>
        )}
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          {kicker}
        </p>
        <h1 className={titleClassName ?? "font-display text-4xl font-extrabold leading-none tracking-tight text-foreground md:text-5xl"}>
          {title}
        </h1>
        <div className="mb-5 mt-4 h-px w-14 bg-primary" />
        {subtitle && (
          <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
        )}
        {children}
      </div>
    </div>
  )
}

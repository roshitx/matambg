import type React from "react"

export const LINED_PAPER: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(transparent, transparent 31px, hsl(30 15% 86% / 0.55) 31px, hsl(30 15% 86% / 0.55) 32px)",
  backgroundPosition: "0 18px",
}

export const CATEGORY_BORDER: Record<string, string> = {
  makanan: "border-l-amber-500",
  wisata: "border-l-border",
  militer: "border-l-primary",
  teknologi: "border-l-foreground/30",
  infrastruktur: "border-l-green-500",
  global: "border-l-amber-600",
  "luar-angkasa": "border-l-amber-600",
  olahraga: "border-l-border",
  hiburan: "border-l-border",
  kesehatan: "border-l-green-500",
}

export const CATEGORY_LABELS: Record<string, string> = {
  all: "Semua",
  makanan: "Makanan",
  wisata: "Wisata",
  militer: "Militer",
  teknologi: "Teknologi",
  infrastruktur: "Infrastruktur",
  global: "Global",
  "luar-angkasa": "Luar Angkasa",
  olahraga: "Olahraga",
  hiburan: "Hiburan",
  kesehatan: "Kesehatan",
}

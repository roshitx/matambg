## PHASE 1: Project Bootstrap + Foundation + Homepage

### TASK 1.1 — Scaffold Project

# Install core dependencies
bun add framer-motion zustand @tanstack/react-query zod \
  @anthropic-ai/sdk numeral date-fns clsx tailwind-merge \
  html-to-image recharts @radix-ui/react-dialog \
  @radix-ui/react-slot class-variance-authority \
  lucide-react

# Install dev dependencies
bun add -d @types/numeral vitest @vitejs/plugin-react \
  @testing-library/react

# Init shadcn
bunx shadcn@latest init
```

Konfigurasi shadcn:
- Style: Default
- Base color: Neutral
- CSS variables: Yes

Tambah shadcn components yang dibutuhkan:
```bash
bunx shadcn@latest add button card badge skeleton dialog \
  input textarea separator tabs scroll-area
```

### TASK 1.2 — Environment & Validation
Buat file berikut:

FILE: .env.example
```
ANTHROPIC_API_KEY=
EXA_API_KEY=
TAVILY_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MBGmata
CRON_SECRET=
```

FILE: src/lib/validations/env.ts
```typescript
import { z } from "zod"

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, "Anthropic API key required"),
  EXA_API_KEY: z.string().min(1, "Exa API key required"),
  TAVILY_API_KEY: z.string().min(1, "Tavily API key required"),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string().default("MBGmata"),
  CRON_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

export const env = envSchema.parse(process.env)
export type Env = z.infer
```

### TASK 1.3 — MBG Constants (Source of Truth)
FILE: src/lib/constants/mbg.ts
```typescript
export const MBG = {
  // Anggaran (dalam Rupiah)
  DAILY_BUDGET: 1_200_000_000_000,
  MONTHLY_BUDGET: 25_000_000_000_000,
  ANNUAL_BUDGET: 335_000_000_000_000,
  BGN_DIRECT: 268_000_000_000_000,
  RESERVE: 67_000_000_000_000,

  // Realisasi
  REALIZATION_MAR9_2026: 44_000_000_000_000,
  REALIZATION_PCT_MAR9: 13.1,

  // Penerima
  TARGET_BENEFICIARIES: 82_900_000,
  ACTIVE_BENEFICIARIES_MAR9: 61_620_000,
  ACTIVE_SPPG: 25_082,

  // Rate per detik (untuk counter)
  PER_SECOND: 1_200_000_000_000 / 86_400,

  // Meta
  BUDGET_YEAR: 2026,
  PREVIOUS_YEAR_BUDGET: 71_000_000_000_000,
  PRICE_PER_MEAL: 15_000, // estimasi per porsi
} as const

export type MbgKey = keyof typeof MBG
```

FILE: src/lib/constants/comparisons.ts
```typescript
export type ComparisonCategory = 
  | "makanan" | "wisata" | "militer" 
  | "teknologi" | "infrastruktur" | "global"

export interface ComparisonItem {
  id: string
  emoji: string
  name: string
  description: string
  unitPrice: number        // dalam IDR
  unit: string             // "porsi" | "unit" | "trip" | etc
  category: ComparisonCategory
  featured?: boolean
  source?: string
}

export const COMPARISONS: ComparisonItem[] = [
  {
    id: "nasi-padang",
    emoji: "🍛",
    name: "Nasi Padang",
    description: "Porsi nasi padang standard warung",
    unitPrice: 15_000,
    unit: "porsi",
    category: "makanan",
  },
  {
    id: "gudeg-jogja",
    emoji: "🍚",
    name: "Gudeg Jogja",
    description: "Porsi gudeg komplit",
    unitPrice: 25_000,
    unit: "porsi",
    category: "makanan",
  },
  {
    id: "indomie-goreng",
    emoji: "🫙",
    name: "Indomie Goreng",
    description: "Per bungkus indomie goreng",
    unitPrice: 3_500,
    unit: "bungkus",
    category: "makanan",
    featured: true,
  },
  {
    id: "tiket-bali",
    emoji: "✈️",
    name: "Tiket PP ke Bali",
    description: "Tiket pesawat pergi-pulang dari Jakarta",
    unitPrice: 500_000,
    unit: "tiket",
    category: "wisata",
  },
  {
    id: "trip-lombok",
    emoji: "🏝️",
    name: "Liburan Lombok 3D2N",
    description: "Estimasi all-in budget trip",
    unitPrice: 1_500_000,
    unit: "trip",
    category: "wisata",
  },
  {
    id: "gerald-ford",
    emoji: "⚓",
    name: "Kapal Induk USS Gerald Ford",
    description: "Kapal induk terbesar AS senilai ~USD 13.3M",
    unitPrice: 213_000_000_000_000,
    unit: "kapal",
    category: "militer",
    featured: true,
  },
  {
    id: "iphone-16-pro",
    emoji: "📱",
    name: "iPhone 16 Pro Max",
    description: "Varian 256GB",
    unitPrice: 23_999_000,
    unit: "unit",
    category: "teknologi",
    featured: true,
  },
  {
    id: "puskesmas",
    emoji: "🏥",
    name: "Puskesmas Baru",
    description: "Estimasi biaya bangun 1 Puskesmas",
    unitPrice: 2_000_000_000,
    unit: "puskesmas",
    category: "infrastruktur",
  },
  {
    id: "guru-gaji",
    emoji: "🎓",
    name: "Gaji Guru 1 Bulan",
    description: "UMR guru non-PNS rata-rata",
    unitPrice: 500_000,
    unit: "guru",
    category: "infrastruktur",
  },
  {
    id: "rumah-subsidi",
    emoji: "🏠",
    name: "Rumah Subsidi",
    description: "Rumah subsidi FLPP",
    unitPrice: 185_000_000,
    unit: "unit",
    category: "infrastruktur",
  },
  {
    id: "macbook-pro",
    emoji: "💻",
    name: "MacBook Pro M4",
    description: "Base model 14-inch M4",
    unitPrice: 28_999_000,
    unit: "unit",
    category: "teknologi",
  },
  {
    id: "jalan-tol",
    emoji: "🛣️",
    name: "Jalan Tol 1 KM",
    description: "Estimasi biaya konstruksi per KM",
    unitPrice: 100_000_000_000,
    unit: "km",
    category: "infrastruktur",
  },
]
```

### TASK 1.4 — Utility Functions
FILE: src/lib/utils/format.ts
```typescript
import { MBG } from "@/lib/constants/mbg"

/** Format angka ke Rupiah Indonesia: Rp 1.200.000.000.000 */
export function formatIDR(value: number, compact = false): string {
  if (compact) {
    if (value >= 1e12) return `Rp ${(value / 1e12).toFixed(1)} T`
    if (value >= 1e9)  return `Rp ${(value / 1e9).toFixed(1)} M`
    if (value >= 1e6)  return `Rp ${(value / 1e6).toFixed(1)} Jt`
    return `Rp ${value.toLocaleString("id-ID")}`
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value)
}

/** Format angka besar ke bahasa Indonesia */
export function formatNumber(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)} Triliun`
  if (value >= 1e9)  return `${(value / 1e9).toFixed(2)} Miliar`
  if (value >= 1e6)  return `${(value / 1e6).toFixed(2)} Juta`
  return value.toLocaleString("id-ID")
}

/** "2 jam lalu", "kemarin", "3 hari lalu" */
export function timeAgo(date: Date | string): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  if (diffSec < 60)   return "Baru saja"
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`
  if (diffSec < 172800) return "Kemarin"
  return `${Math.floor(diffSec / 86400)} hari lalu`
}
```

FILE: src/lib/utils/calculate.ts
```typescript
import { MBG } from "@/lib/constants/mbg"
import type { ComparisonItem } from "@/lib/constants/comparisons"

/** Hitung berapa unit item yang bisa dibeli dengan X hari anggaran MBG */
export function calcUnitsForDays(days: number, item: ComparisonItem): number {
  const budget = days * MBG.DAILY_BUDGET
  return Math.floor(budget / item.unitPrice)
}

/** Hitung berapa hari MBG setara dengan nominal tertentu */
export function calcDaysFromAmount(amount: number): number {
  return amount / MBG.DAILY_BUDGET
}

/** Hitung berapa unit item dari nominal */
export function calcUnitsFromAmount(amount: number, unitPrice: number): number {
  return Math.floor(amount / unitPrice)
}

/** Hitung detik yang sudah berlalu sejak 00:00 WIB hari ini */
export function getElapsedSecondsToday(): number {
  const now = new Date()
  const wibOffset = 7 * 60 * 60 * 1000
  const utc = now.getTime() + now.getTimezoneOffset() * 60000
  const wib = new Date(utc + wibOffset)
  return wib.getHours() * 3600 + wib.getMinutes() * 60 + wib.getSeconds()
}

/** Hitung uang yang sudah terpakai hari ini sejak 00:00 WIB */
export function getTodaySpent(): number {
  return Math.floor(getElapsedSecondsToday() * MBG.PER_SECOND)
}
```

FILE: src/lib/utils/cn.ts
```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### TASK 1.5 — Global Styles & Fonts
FILE: src/app/globals.css
```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Space+Grotesk:wght@400;500;700&display=swap');

:root {
  --font-display: 'Syne', sans-serif;
  --font-body: 'Space Grotesk', sans-serif;
  
  /* Dark theme (default) */
  --bg-primary: #0C0C0C;
  --bg-surface: #161616;
  --bg-card: #1F1F1F;
  --bg-hover: #2A2A2A;
  
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.15);
  
  --text-primary: #F5F5F5;
  --text-secondary: #A3A3A3;
  --text-muted: #525252;
  
  --red: #DC2626;
  --red-dim: #991B1B;
  --red-glow: rgba(220, 38, 38, 0.15);
  --gold: #F59E0B;
  --gold-glow: rgba(245, 158, 11, 0.12);
  --green: #22C55E;
}

* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}

/* Custom scrollbar */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

/* Counter number animation */
@keyframes countUp {
  from { opacity: 0.6; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.counter-animate { animation: countUp 0.2s ease-out; }

/* Shimmer skeleton */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, 
    rgba(255,255,255,0.04) 25%, 
    rgba(255,255,255,0.08) 50%, 
    rgba(255,255,255,0.04) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

/* Pulse dot for live indicator */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.pulse { animation: pulse-dot 2s ease-in-out infinite; }
```

### TASK 1.6 — Root Layout
FILE: src/app/layout.tsx
```typescript
import type { Metadata } from "next"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Providers } from "@/components/layout/Providers"

export const metadata: Metadata = {
  title: {
    default: "MBGmata — Visualisasi Anggaran MBG 2026",
    template: "%s | MBGmata",
  },
  description: "Rp 335 Triliun anggaran Makan Bergizi Gratis 2026 dalam perspektif nyata. Kalkulator, perbandingan, berita, dan AI chatbot tentang MBG Indonesia.",
  keywords: ["MBG", "Makan Bergizi Gratis", "APBN 2026", "anggaran MBG", "kalkulator MBG"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "MBGmata",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    
      
        
          
          {children}
          
        
      
    
  )
}
```

### TASK 1.7 — Navbar Component
FILE: src/components/layout/Navbar.tsx
Buat navbar dengan:
- Logo: dot merah + "MBG" + "mata" (mata dalam warna merah)
- Nav links: Kalkulator | 1 Hari MBG = | Berita | Tanya AI
- Sticky, backdrop-blur, border-bottom
- Mobile: hamburger menu
- Active state berdasarkan current route (usePathname)
- Smooth transition opacity saat scroll (useScrollY)

### TASK 1.8 — Live Counter Hook
FILE: src/hooks/useLiveCounter.ts
```typescript
"use client"
import { useState, useEffect, useRef } from "react"
import { getTodaySpent, getElapsedSecondsToday } from "@/lib/utils/calculate"
import { MBG } from "@/lib/constants/mbg"

export function useLiveCounter() {
  const [amount, setAmount] = useState(() => getTodaySpent())
  const rafRef = useRef(0)
  const lastSecRef = useRef(0)

  useEffect(() => {
    const tick = () => {
      const nowSec = Math.floor(getElapsedSecondsToday())
      if (nowSec !== lastSecRef.current) {
        lastSecRef.current = nowSec
        setAmount(Math.floor(nowSec * MBG.PER_SECOND))
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return { amount }
}
```

### TASK 1.9 — Homepage (Hero + Counter + Strip)
FILE: src/app/page.tsx
Buat homepage lengkap dengan sections:
1. HeroSection — headline, sub, eyebrow
2. LiveCounter — pakai useLiveCounter hook
3. StatPills — 3 kolom (hari/bulan/tahun)
4. CTA buttons
5. ComparisonStrip — horizontal scroll 6 mini cards
Semua animasi pakai Framer Motion (fade-in, slide-up stagger).

Setelah Phase 1 selesai, konfirmasi ke gue dengan:
✅ Project runs di localhost:3000
✅ Navbar visible
✅ Live counter berjalan real-time
✅ Halaman homepage complete
✅ No TypeScript errors (`bun run type-check`)

import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Syne } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Providers } from "@/components/layout/Providers"

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
})

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "mataMBG — Visualisasi Anggaran MBG 2026",
    template: "%s | mataMBG",
  },
  description:
    "Rp 335 Triliun anggaran Makan Bergizi Gratis 2026 dalam perspektif nyata. Kalkulator, perbandingan, berita, dan AI chatbot tentang MBG Indonesia.",
  keywords: ["MBG", "Makan Bergizi Gratis", "APBN 2026", "anggaran MBG", "kalkulator MBG"],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "mataMBG",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${syne.variable} ${jakarta.variable}`}>
      <body>
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  )
}

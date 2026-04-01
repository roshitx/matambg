## PHASE 2: Kalkulator + Comparison Cards + API Routes

### TASK 2.1 — Calculator Page
FILE: src/app/kalkulator/page.tsx + components

Buat halaman kalkulator dengan:
- Dual input: slider hari (1-365) OR input nominal IDR
- Keduanya sync bidirectional
- Output grid 12 cards (dari COMPARISONS constant)
- Setiap card animate angka saat input berubah (framer motion)
- Share button → download PNG via html-to-image

State logic:
```typescript
// Satu source of truth: amount dalam IDR
const [amount, setAmount] = useState(MBG.DAILY_BUDGET)
const days = amount / MBG.DAILY_BUDGET  // derived
// Saat slider hari berubah: setAmount(days * MBG.DAILY_BUDGET)
// Saat input nominal berubah: setAmount(parsed)
```

Format input nominal:
- Saat typing: format dengan titik separator otomatis
- Parse: hilangkan titik, convert ke number
- Validasi: min 0, max 335T

Output card hitung:
```typescript
const units = Math.floor(amount / item.unitPrice)
// Tampilkan dengan formatNumber() dari utils
```

Share card:
- Snapshot div dengan id="share-card"
- Background dark, tampilkan: emoji + angka + nama item
- Download sebagai PNG 1200x630

### TASK 2.2 — Comparison Page
FILE: src/app/perbandingan/page.tsx + components

Buat halaman dengan:
- Filter bar (sticky) dengan kategori pills
- Masonry-ish grid: 3 col desktop, 2 tablet, 1 mobile
- Featured cards: 2x ukuran, lebih besar angka
- Filter: filter COMPARISONS array by category
- Smooth animation filter: AnimatePresence + layout
- Share modal: copy link + download + tweet template
- AI Card Generator section (call /api/comparison)

Filter logic:
```typescript
const [activeCategory, setActiveCategory] = useState("all")
const filtered = activeCategory === "all" 
  ? COMPARISONS 
  : COMPARISONS.filter(c => c.category === activeCategory)
```

Share Modal content:
```
Pre-filled tweet:
"1 hari anggaran #MBG = {units} {unit} {nama}! 
Data: Rp 1,2 Triliun/hari dari APBN 2026 🇮🇩
Cek lebih banyak: {url} #MBGmata"
```

### TASK 2.3 — API Route: Comparison AI Generator
FILE: src/app/api/comparison/route.ts
```typescript
import { anthropic } from "@/lib/api/claude"
import { MBG } from "@/lib/constants/mbg"
import { z } from "zod"

const RequestSchema = z.object({
  query: z.string().min(3).max(200),
  days: z.number().min(1).max(365).default(1),
})

export async function POST(req: Request) {
  const body = await req.json()
  const { query, days } = RequestSchema.parse(body)
  const budget = days * MBG.DAILY_BUDGET

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: `Kamu adalah kalkulator konversi anggaran MBG Indonesia.
Budget MBG yang digunakan: ${budget.toLocaleString("id-ID")} IDR (${days} hari).
Tugas: cari harga item yang diminta user, lalu hitung berapa unit yang bisa dibeli.
Response HANYA dalam JSON, format:
{
  "emoji": "🚗",
  "name": "Nama Item",
  "unitPrice": 500000000,
  "unit": "unit",
  "units": 2400,
  "category": "teknologi",
  "description": "Deskripsi singkat 1 kalimat",
  "priceSource": "Harga estimasi dari sumber publik"
}
Gunakan harga pasar Indonesia (IDR). Kalau item asing, konversi ke IDR.
JANGAN tulis apapun selain JSON.`,
    messages: [{ role: "user", content: query }],
  })

  const text = message.content[0].type === "text" ? message.content[0].text : ""
  const result = JSON.parse(text)
  return Response.json(result)
}
```

FILE: src/lib/api/claude.ts
```typescript
import Anthropic from "@anthropic-ai/sdk"
import { env } from "@/lib/validations/env"

export const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
})
```

### TASK 2.4 — News API Route
FILE: src/app/api/news/route.ts

Pakai Exa API untuk search berita MBG terbaru:
```typescript
import Exa from "exa-js" // bun add exa-js
import { anthropic } from "@/lib/api/claude"
import { env } from "@/lib/validations/env"

const exa = new Exa(env.EXA_API_KEY)

export const revalidate = 21600 // 6 jam

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category") || "all"
  
  const queries: Record = {
    all: "Makan Bergizi Gratis MBG 2026 Indonesia",
    kontroversi: "kontroversi masalah MBG Makan Bergizi Gratis keracunan",
    anggaran: "anggaran MBG 335 triliun APBN 2026",
    kebijakan: "kebijakan BGN MBG Prabowo 2026",
  }

  const results = await exa.searchAndContents(
    queries[category] ?? queries.all,
    {
      numResults: 10,
      startPublishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString().split("T")[0],
      includeDomains: [
        "kompas.com", "tempo.co", "detik.com", 
        "cnnindonesia.com", "bbc.com", "republika.co.id",
        "tribunnews.com", "antaranews.com"
      ],
      text: { maxCharacters: 500 },
    }
  )

  // AI Summarize setiap artikel
  const newsWithSummary = await Promise.all(
    results.results.map(async (article) => {
      const summary = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001", // pakai haiku biar hemat
        max_tokens: 150,
        messages: [{
          role: "user",
          content: `Ringkas artikel ini dalam 2 kalimat bahasa Indonesia yang netral dan faktual. 
Artikel: ${article.text?.slice(0, 800)}
Judul: ${article.title}
HANYA tulis ringkasannya, tanpa awalan apapun.`
        }]
      })
      
      const summaryText = summary.content[0].type === "text" 
        ? summary.content[0].text : ""
      
      // Detect sentiment dari judul
      const lowerTitle = article.title?.toLowerCase() ?? ""
      let sentiment: "kontroversi" | "anggaran" | "positif" | "kebijakan" = "kebijakan"
      if (lowerTitle.includes("keracunan") || lowerTitle.includes("masalah") || 
          lowerTitle.includes("kontroversi") || lowerTitle.includes("kritik")) {
        sentiment = "kontroversi"
      } else if (lowerTitle.includes("triliun") || lowerTitle.includes("anggaran") || 
                 lowerTitle.includes("realisasi")) {
        sentiment = "anggaran"
      } else if (lowerTitle.includes("sukses") || lowerTitle.includes("berhasil") || 
                 lowerTitle.includes("manfaat")) {
        sentiment = "positif"
      }
      
      return {
        id: article.id,
        title: article.title,
        url: article.url,
        publishedDate: article.publishedDate,
        domain: new URL(article.url).hostname.replace("www.", ""),
        summary: summaryText,
        sentiment,
      }
    })
  )

  return Response.json({ 
    news: newsWithSummary, 
    fetchedAt: new Date().toISOString() 
  })
}
```

### TASK 2.5 — Types
FILE: src/types/comparison.ts
FILE: src/types/news.ts
Definisikan interface lengkap untuk semua data types.

Milestone Phase 2:
✅ /kalkulator berjalan, hitung akurat
✅ /perbandingan semua card tampil, filter bekerja
✅ /api/comparison return valid JSON
✅ /api/news return artikel dengan AI summary
✅ Share card bisa di-download

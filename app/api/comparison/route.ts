import { anthropic } from "@/lib/api/claude"
import { MBG } from "@/lib/constants/mbg"
import { z } from "zod"
import type { AIComparisonItem } from "@/types/comparison"

const RequestSchema = z.object({
  query: z.string().min(3).max(200),
  days: z.number().min(1).max(365).default(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { query, days } = RequestSchema.parse(body)
    const budget = days * MBG.DAILY_BUDGET

    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
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
    const result = JSON.parse(text) as AIComparisonItem
    return Response.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", details: error.issues }, { status: 400 })
    }
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}

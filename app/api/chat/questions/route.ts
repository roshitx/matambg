import { openrouter } from "@/lib/api/openrouter"
import { CHAT_MODEL_ID } from "@/lib/constants/chat"

// Lightweight model for question generation — decoupled from chat model
// to avoid rate-limiting on the main chat model
const QUESTIONS_MODEL = "google/gemma-3-4b-it:free"

const FALLBACK_QUESTIONS = [
  "Kalau anggaran MBG dipakai bangun RS, bisa berapa?",
  "Bandingkan MBG Indonesia vs school lunch USA",
  "Kenapa banyak kasus keracunan di MBG?",
  "Apa kata ICW soal konflik kepentingan MBG?",
  "Berapa persen GDP Indonesia yang terpakai untuk MBG?",
  "Apakah MBG lebih mahal dari negara lain?",
]

const fallback = () =>
  Response.json({ questions: FALLBACK_QUESTIONS, model: CHAT_MODEL_ID })

export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15_000)

  try {
    const completion = await openrouter.chat.completions.create(
      {
        model: QUESTIONS_MODEL,
        stream: false,
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content:
              "Buat 6 pertanyaan pendek dan tajam tentang program Makan Bergizi Gratis (MBG) Indonesia dari sudut pandang warga yang kritis. Variasikan topik: anggaran, skandal, kesehatan, perbandingan global, kebijakan, transparansi. Setiap pertanyaan max 12 kata. Kembalikan HANYA array JSON berisi 6 string. Tidak ada penjelasan, tidak ada teks lain.",
          },
        ],
      },
      { signal: controller.signal },
    )

    clearTimeout(timeout)

    const raw = completion.choices[0]?.message?.content?.trim() ?? ""

    // Qwen3 thinking models wrap reasoning in <think>...</think> — strip before parsing
    const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/g, "").trim()

    const match = cleaned.match(/\[[\s\S]*?\]/)
    if (!match) return fallback()

    const parsed: unknown = JSON.parse(match[0])
    if (
      !Array.isArray(parsed) ||
      parsed.length < 3 ||
      !parsed.every((q) => typeof q === "string")
    ) {
      return fallback()
    }

    return Response.json({ questions: parsed.slice(0, 6), model: CHAT_MODEL_ID })
  } catch {
    clearTimeout(timeout)
    return fallback()
  }
}

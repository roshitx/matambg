import type { NewsArticle } from "@/types/news"

const TOPIC_PATTERNS: { label: string; keywords: string[]; dot: string }[] = [
  { label: "Keracunan", keywords: ["keracunan", "sakit", "diare", "mual", "racun"], dot: "bg-primary" },
  { label: "Korupsi / Dugaan", keywords: ["korupsi", "icw", "kpk", "dugaan", "gratifikasi", "penyimpangan"], dot: "bg-primary/60" },
  { label: "Anggaran", keywords: ["anggaran", "triliun", "apbn", "dana", "efisiensi", "pemangkasan", "alokasi"], dot: "bg-amber-500" },
  { label: "TNI / Polri SPPG", keywords: ["tni", "polri", "sppg", "militer", "tentara"], dot: "bg-amber-500/60" },
  { label: "Distribusi", keywords: ["distribusi", "penerima", "sekolah", "anak", "siswa", "murid", "penyaluran"], dot: "bg-muted-foreground" },
  { label: "Kebijakan", keywords: ["menteri", "prabowo", "regulasi", "kebijakan", "presiden", "peraturan", "juknis"], dot: "bg-muted-foreground/60" },
]

export interface DerivedTopic {
  label: string
  count: number
  dot: string
}

export function deriveTopics(articles: NewsArticle[]): DerivedTopic[] {
  const counts = TOPIC_PATTERNS.map((pattern) => {
    const count = articles.filter((a) => {
      const text = (a.title + " " + a.aiSummary).toLowerCase()
      return pattern.keywords.some((kw) => text.includes(kw))
    }).length
    return { label: pattern.label, count, dot: pattern.dot }
  })

  return counts
    .filter((t) => t.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
}

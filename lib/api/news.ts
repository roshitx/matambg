import { unstable_cache } from "next/cache"
import type { NewsArticle, Sentiment } from "@/types/news"

const SENTIMENT_KEYWORDS: Record<Sentiment, string[]> = {
  kontroversi: ["keracunan", "korupsi", "masalah", "gagal", "kontroversi", "kritik", "protes", "kasus", "dugaan", "darurat", "sengketa"],
  anggaran: ["anggaran", "triliun", "apbn", "dana", "realisasi", "efisiensi", "pemangkasan", "alokasi", "keuangan"],
  positif: ["berhasil", "sukses", "manfaat", "gizi", "sehat", "penerima", "distribusi", "meningkat", "prestasi"],
  kebijakan: ["kebijakan", "regulasi", "peraturan", "menteri", "pemerintah", "sppg", "bkn", "presiden", "tni", "polri"],
}

function classifySentiment(title: string): Sentiment {
  const lower = title.toLowerCase()
  for (const [sentiment, keywords] of Object.entries(SENTIMENT_KEYWORDS) as [Sentiment, string[]][]) {
    if (keywords.some((kw) => lower.includes(kw))) return sentiment
  }
  return "kebijakan"
}

function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "")
    return hostname
  } catch {
    return url
  }
}

function sourceFromDomain(domain: string): string {
  const map: Record<string, string> = {
    "kompas.com": "Kompas",
    "tempo.co": "Tempo",
    "cnnindonesia.com": "CNN Indonesia",
    "bbc.com": "BBC Indonesia",
    "detik.com": "Detik",
    "tribunnews.com": "Tribun",
    "republika.co.id": "Republika",
    "antaranews.com": "Antara",
    "mediaindonesia.com": "Media Indonesia",
    "kumparan.com": "Kumparan",
  }
  return map[domain] ?? domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1)
}

async function fetchFromExa(): Promise<NewsArticle[]> {
  const apiKey = process.env.EXA_API_KEY
  if (!apiKey) return []

  const res = await fetch("https://api.exa.ai/search", {
    method: "POST",
    headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: "Makan Bergizi Gratis MBG Indonesia 2026",
      numResults: 15,
      type: "neural",
      contents: { summary: { query: "Ringkasan berita tentang program MBG Indonesia" } },
      startPublishedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    }),
    next: { revalidate: 21600 },
  })

  if (!res.ok) return []

  const data = await res.json()
  const results = data.results ?? []

  return results.map((r: Record<string, unknown>, i: number) => {
    const domain = extractDomain(r.url as string)
    return {
      id: `exa-${i}-${Date.now()}`,
      title: r.title as string,
      url: r.url as string,
      domain,
      source: sourceFromDomain(domain),
      publishedAt: (r.publishedDate as string) ?? new Date().toISOString(),
      aiSummary: ((r.summary as Record<string, string>)?.summary ?? r.text ?? "") as string,
      sentiment: classifySentiment(r.title as string),
      isBreaking: i === 0,
    } satisfies NewsArticle
  })
}

async function fetchFromTavily(): Promise<NewsArticle[]> {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) return []

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query: "Makan Bergizi Gratis MBG Indonesia 2026",
      search_depth: "advanced",
      max_results: 15,
      include_answer: false,
    }),
    next: { revalidate: 21600 },
  })

  if (!res.ok) return []

  const data = await res.json()
  const results = data.results ?? []

  return results.map((r: Record<string, unknown>, i: number) => {
    const domain = extractDomain(r.url as string)
    return {
      id: `tavily-${i}-${Date.now()}`,
      title: r.title as string,
      url: r.url as string,
      domain,
      source: sourceFromDomain(domain),
      publishedAt: (r.published_date as string) ?? new Date().toISOString(),
      aiSummary: (r.content as string) ?? "",
      sentiment: classifySentiment(r.title as string),
      isBreaking: i === 0,
    } satisfies NewsArticle
  })
}

export const fetchBerita = unstable_cache(
  async (): Promise<NewsArticle[]> => {
    try {
      const exa = await fetchFromExa()
      if (exa.length > 0) return exa

      const tavily = await fetchFromTavily()
      return tavily
    } catch {
      return []
    }
  },
  ["berita-mbg"],
  { revalidate: 21600, tags: ["berita"] }
)

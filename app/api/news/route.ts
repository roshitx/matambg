import Exa from "exa-js"
import { anthropic } from "@/lib/api/claude"
import type { NewsArticle, NewsResponse } from "@/types/news"

export const revalidate = 21600 // 6 jam

const QUERIES: Record<string, string> = {
  all: "Makan Bergizi Gratis MBG 2026 Indonesia",
  kontroversi: "kontroversi masalah MBG Makan Bergizi Gratis keracunan",
  anggaran: "anggaran MBG 335 triliun APBN 2026",
  kebijakan: "kebijakan BGN MBG Prabowo 2026",
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category") ?? "all"

    const apiKey = process.env.EXA_API_KEY
    if (!apiKey) return Response.json({ error: "EXA_API_KEY not configured" }, { status: 500 })
    const exa = new Exa(apiKey)

    const results = await exa.search(QUERIES[category] ?? QUERIES.all, {
      numResults: 10,
      startPublishedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      includeDomains: [
        "kompas.com",
        "tempo.co",
        "detik.com",
        "cnnindonesia.com",
        "bbc.com",
        "republika.co.id",
        "tribunnews.com",
        "antaranews.com",
      ],
      contents: { text: { maxCharacters: 500 } },
    })

    const newsWithSummary = await Promise.all(
      results.results.map(async (article): Promise<NewsArticle> => {
        const text = "text" in article ? (article.text as string | undefined) : undefined

        const summary = await anthropic.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 150,
          messages: [
            {
              role: "user",
              content: `Ringkas artikel ini dalam 2 kalimat bahasa Indonesia yang netral dan faktual.
Artikel: ${text?.slice(0, 800) ?? ""}
Judul: ${article.title ?? ""}
HANYA tulis ringkasannya, tanpa awalan apapun.`,
            },
          ],
        })

        const summaryText =
          summary.content[0].type === "text" ? summary.content[0].text : ""

        const lowerTitle = article.title?.toLowerCase() ?? ""
        let sentiment: NewsArticle["sentiment"] = "kebijakan"
        if (
          lowerTitle.includes("keracunan") ||
          lowerTitle.includes("masalah") ||
          lowerTitle.includes("kontroversi") ||
          lowerTitle.includes("kritik")
        ) {
          sentiment = "kontroversi"
        } else if (
          lowerTitle.includes("triliun") ||
          lowerTitle.includes("anggaran") ||
          lowerTitle.includes("realisasi")
        ) {
          sentiment = "anggaran"
        } else if (
          lowerTitle.includes("sukses") ||
          lowerTitle.includes("berhasil") ||
          lowerTitle.includes("manfaat")
        ) {
          sentiment = "positif"
        }

        return {
          id: article.id,
          title: article.title ?? "",
          url: article.url,
          publishedDate: article.publishedDate ?? "",
          domain: new URL(article.url).hostname.replace("www.", ""),
          summary: summaryText,
          sentiment,
        }
      })
    )

    const response: NewsResponse = {
      news: newsWithSummary,
      fetchedAt: new Date().toISOString(),
    }

    return Response.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error"
    return Response.json({ error: message }, { status: 500 })
  }
}

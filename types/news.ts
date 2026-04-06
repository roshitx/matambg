export type Sentiment = "kontroversi" | "anggaran" | "positif" | "kebijakan"

export interface NewsArticle {
  id: string
  title: string
  url: string
  domain: string
  source: string
  publishedAt: string
  aiSummary: string
  sentiment: Sentiment
  isBreaking: boolean
}

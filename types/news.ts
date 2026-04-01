export type NewsSentiment = "kontroversi" | "anggaran" | "positif" | "kebijakan"

export interface NewsArticle {
  id: string
  title: string
  url: string
  publishedDate: string
  domain: string
  summary: string
  sentiment: NewsSentiment
}

export interface NewsResponse {
  news: NewsArticle[]
  fetchedAt: string
}

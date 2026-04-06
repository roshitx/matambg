import type { NewsArticle } from "@/types/news"
import { TrendingTopics } from "./TrendingTopics"
import { StatsSnapshot } from "./StatsSnapshot"
import { SentimentChart } from "./SentimentChart"

interface BeritaSidebarProps {
  articles: NewsArticle[]
}

export function BeritaSidebar({ articles }: BeritaSidebarProps) {
  return (
    <div className="sticky top-20 flex flex-col gap-4">
      <TrendingTopics articles={articles} />
      <StatsSnapshot />
      <SentimentChart articles={articles} />
    </div>
  )
}

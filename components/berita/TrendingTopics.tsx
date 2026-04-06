import type { NewsArticle } from "@/types/news"
import { deriveTopics } from "@/lib/utils/trends"

interface TrendingTopicsProps {
  articles: NewsArticle[]
}

export function TrendingTopics({ articles }: TrendingTopicsProps) {
  const topics = deriveTopics(articles)

  if (topics.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 font-display text-base font-bold text-foreground">Topik Trending</h2>
      <ul className="space-y-1.5">
        {topics.map(({ label, count, dot }) => (
          <li key={label}>
            <div className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dot}`} />
                <span className="truncate text-xs text-foreground">{label}</span>
              </div>
              <span className="flex-shrink-0 text-[10px] text-muted-foreground">
                {count} artikel
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

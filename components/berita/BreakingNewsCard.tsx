import Link from "next/link"
import type { NewsArticle } from "@/types/news"
import { timeAgo } from "@/lib/utils/format"

interface BreakingNewsCardProps {
  article: NewsArticle
  onOpenDrawer?: (article: NewsArticle) => void
}

export function BreakingNewsCard({ article, onOpenDrawer }: BreakingNewsCardProps) {
  return (
    <article
      onClick={() => onOpenDrawer?.(article)}
      className={`rounded-xl border border-border border-l-4 border-l-primary bg-card p-5 ${onOpenDrawer ? "cursor-pointer" : ""} transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-sm bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
          <span className="inline-block h-1 w-1 rounded-full bg-white pulse" />
          Terbaru
        </span>
        <span className="text-[11px] text-muted-foreground">{timeAgo(article.publishedAt)}</span>
      </div>

      <h2 className="mb-3 font-display text-xl font-bold leading-snug tracking-tight text-foreground">
        {article.title}
      </h2>

      {article.aiSummary && (
        <div className="mb-3">
          <span className="mb-1.5 inline-flex items-center gap-1 rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600">
            ✦ Ringkasan AI
          </span>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {article.aiSummary}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 text-[11px]">
        <span className="font-medium text-muted-foreground">{article.source}</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="text-muted-foreground/60">{article.domain}</span>
        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="ml-auto text-primary transition-colors hover:text-primary/80"
        >
          Baca selengkapnya →
        </Link>
      </div>
    </article>
  )
}

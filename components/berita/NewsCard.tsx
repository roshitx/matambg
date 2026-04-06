import Link from "next/link"
import type { NewsArticle, Sentiment } from "@/types/news"
import { timeAgo } from "@/lib/utils/format"
import { cn } from "@/lib/utils"

const SENTIMENT_LABEL: Record<Sentiment, string> = {
  kontroversi: "Kontroversi",
  anggaran: "Anggaran",
  positif: "Positif",
  kebijakan: "Kebijakan",
}

const SENTIMENT_BADGE: Record<Sentiment, string> = {
  kontroversi: "bg-primary/10 text-primary",
  anggaran: "bg-amber-500/10 text-amber-600",
  positif: "bg-green-500/10 text-green-600",
  kebijakan: "bg-border text-muted-foreground",
}

const SENTIMENT_BORDER: Record<Sentiment, string> = {
  kontroversi: "border-l-primary",
  anggaran: "border-l-amber-500",
  positif: "border-l-green-500",
  kebijakan: "border-l-border",
}

interface NewsCardProps {
  article: NewsArticle
  onOpenDrawer?: (article: NewsArticle) => void
}

export function NewsCard({ article, onOpenDrawer }: NewsCardProps) {
  return (
    <article
      onClick={() => onOpenDrawer?.(article)}
      className={cn(
        "group rounded-xl border border-border bg-card p-[18px]",
        "border-l-2 transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-border/80 hover:shadow-sm",
        onOpenDrawer ? "cursor-pointer" : "",
        SENTIMENT_BORDER[article.sentiment]
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={cn(
            "rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
            SENTIMENT_BADGE[article.sentiment]
          )}
        >
          {SENTIMENT_LABEL[article.sentiment]}
        </span>
        <span className="text-[11px] text-muted-foreground">{timeAgo(article.publishedAt)}</span>
      </div>

      <h3 className="mb-2 text-sm font-medium leading-snug text-foreground line-clamp-2">
        {article.title}
      </h3>

      {article.aiSummary && (
        <div className="mb-3">
          <span className="mb-1 inline-flex items-center gap-1 rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600">
            ✦ Ringkasan AI
          </span>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground line-clamp-3">
            {article.aiSummary}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 text-[11px]">
        <span className="italic text-muted-foreground/60">{article.source}</span>
        <span className="text-muted-foreground/30">·</span>
        <span className="text-muted-foreground/50">{article.domain}</span>
        <Link
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="ml-auto text-primary transition-colors hover:text-primary/80"
        >
          Baca →
        </Link>
      </div>
    </article>
  )
}

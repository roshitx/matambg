"use client"

import Link from "next/link"
import type { NewsArticle, Sentiment } from "@/types/news"
import { timeAgo } from "@/lib/utils/format"
import { cn } from "@/lib/utils"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

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

interface ArticleDrawerProps {
  article: NewsArticle | null
  onClose: () => void
}

export function ArticleDrawer({ article, onClose }: ArticleDrawerProps) {
  return (
    <Sheet open={!!article} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {article && (
          <>
            <SheetHeader className="pb-0">
              <div className="mb-3 flex items-center justify-between pr-8">
                <span
                  className={cn(
                    "rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
                    SENTIMENT_BADGE[article.sentiment]
                  )}
                >
                  {SENTIMENT_LABEL[article.sentiment]}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {timeAgo(article.publishedAt)}
                </span>
              </div>
              <SheetTitle className="font-display text-lg font-bold leading-snug text-foreground">
                {article.title}
              </SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-5 px-4 pb-6">
              {article.aiSummary && (
                <div>
                  <span className="mb-2 inline-flex items-center gap-1 rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-amber-600">
                    ✦ Ringkasan AI
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {article.aiSummary}
                  </p>
                </div>
              )}

              <div className="h-px w-full bg-border" />

              <div className="flex items-center gap-2 text-[11px]">
                <span className="font-medium text-foreground">{article.source}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground/60">{article.domain}</span>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground/60">
                  {new Date(article.publishedAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Baca Artikel Asli →
                </Link>
                <Link
                  href="/tanya-ai"
                  className="flex items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
                >
                  Tanya AI tentang ini
                </Link>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

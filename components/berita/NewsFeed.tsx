"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { NewsArticle, Sentiment } from "@/types/news"
import { FilterBar } from "./FilterBar"
import { BreakingNewsCard } from "./BreakingNewsCard"
import { NewsCard } from "./NewsCard"
import { NewsSkeletons } from "./NewsSkeletons"
import { ArticleDrawer } from "./ArticleDrawer"

const SOURCE_TO_FILTER: Record<string, string[]> = {
  Kompas: ["kompas.com"],
  Tempo: ["tempo.co"],
  "CNN Indonesia": ["cnnindonesia.com"],
  "BBC Indonesia": ["bbc.com", "bbc.co.uk"],
  Detik: ["detik.com"],
}

interface NewsFeedProps {
  initialArticles: NewsArticle[]
}

export function NewsFeed({ initialArticles }: NewsFeedProps) {
  const [activeSentiment, setActiveSentiment] = useState<Sentiment | "semua">("semua")
  const [activeSource, setActiveSource] = useState("Semua Sumber")
  const [displayCount, setDisplayCount] = useState(10)
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)

  if (initialArticles.length === 0) {
    return (
      <div>
        <FilterBar
          activeSentiment={activeSentiment}
          activeSource={activeSource}
          onSentimentChange={(s) => { setActiveSentiment(s); setDisplayCount(10) }}
          onSourceChange={(s) => { setActiveSource(s); setDisplayCount(10) }}
        />
        <NewsSkeletons />
      </div>
    )
  }

  const filtered = initialArticles.filter((a) => {
    const sentimentMatch = activeSentiment === "semua" || a.sentiment === activeSentiment
    const sourceMatch =
      activeSource === "Semua Sumber" ||
      (SOURCE_TO_FILTER[activeSource]?.some((d) => a.domain.includes(d)) ?? false)
    return sentimentMatch && sourceMatch
  })

  const showBreaking = activeSentiment === "semua" && activeSource === "Semua Sumber"
  const breakingArticle = showBreaking ? filtered[0] : null
  const restArticles = showBreaking ? filtered.slice(1, displayCount) : filtered.slice(0, displayCount)
  const hasMore = filtered.length > (showBreaking ? displayCount : displayCount)

  return (
    <div>
      <FilterBar
        activeSentiment={activeSentiment}
        activeSource={activeSource}
        onSentimentChange={(s) => { setActiveSentiment(s); setDisplayCount(10) }}
        onSourceChange={(s) => { setActiveSource(s); setDisplayCount(10) }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeSentiment}-${activeSource}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-3"
        >
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-5 py-12 text-center">
              <p className="text-sm text-muted-foreground">Tidak ada berita untuk filter ini.</p>
              <button
                type="button"
                onClick={() => { setActiveSentiment("semua"); setActiveSource("Semua Sumber") }}
                className="mt-3 cursor-pointer text-xs text-primary hover:underline"
              >
                Reset filter
              </button>
            </div>
          ) : (
            <>
              {breakingArticle && (
                <BreakingNewsCard
                  article={breakingArticle}
                  onOpenDrawer={setSelectedArticle}
                />
              )}
              {restArticles.map((article) => (
                <NewsCard
                  key={article.id}
                  article={article}
                  onOpenDrawer={setSelectedArticle}
                />
              ))}
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {hasMore && (
        <div className="mt-6">
          <button
            type="button"
            onClick={() => setDisplayCount((c) => c + 10)}
            className="w-full cursor-pointer rounded-lg border border-border py-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            Muat Lebih Banyak
          </button>
        </div>
      )}

      <ArticleDrawer
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  )
}

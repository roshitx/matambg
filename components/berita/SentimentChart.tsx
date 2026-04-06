import type { NewsArticle, Sentiment } from "@/types/news"

const SENTIMENT_CONFIG: Record<Sentiment, { label: string; color: string; dot: string }> = {
  kontroversi: { label: "Kontroversi", color: "hsl(0 72% 42%)", dot: "bg-primary" },
  kebijakan: { label: "Netral/Kebijakan", color: "hsl(0 0% 55%)", dot: "bg-muted-foreground" },
  anggaran: { label: "Anggaran/Faktual", color: "hsl(38 92% 50%)", dot: "bg-amber-500" },
  positif: { label: "Positif", color: "hsl(142 71% 45%)", dot: "bg-green-500" },
}

const R = 30
const CIRC = 2 * Math.PI * R

interface SentimentChartProps {
  articles: NewsArticle[]
}

export function SentimentChart({ articles }: SentimentChartProps) {
  if (articles.length === 0) return null

  const counts = articles.reduce<Record<Sentiment, number>>(
    (acc, a) => ({ ...acc, [a.sentiment]: (acc[a.sentiment] ?? 0) + 1 }),
    { kontroversi: 0, kebijakan: 0, anggaran: 0, positif: 0 }
  )

  const total = articles.length
  const segments = (Object.entries(SENTIMENT_CONFIG) as [Sentiment, typeof SENTIMENT_CONFIG[Sentiment]][])
    .map(([key, cfg]) => ({
      ...cfg,
      pct: Math.round((counts[key] / total) * 100),
    }))
    .filter((s) => s.pct > 0)

  let offset = 0
  const arcs = segments.map((s) => {
    const dash = (s.pct / 100) * CIRC
    const gap = CIRC - dash
    const result = { ...s, dash, gap, offset }
    offset += dash
    return result
  })

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-1 font-display text-base font-bold text-foreground">Sentimen Berita</h2>
      <p className="mb-3 text-[10px] text-muted-foreground">{total} artikel terkini</p>

      <div className="flex items-center gap-4">
        <svg width={80} height={80} viewBox="0 0 80 80" className="flex-shrink-0 -rotate-90">
          <circle cx="40" cy="40" r={R} fill="none" stroke="hsl(30 15% 88%)" strokeWidth="10" />
          {arcs.map((s) => (
            <circle
              key={s.label}
              cx="40"
              cy="40"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="10"
              strokeDasharray={`${s.dash} ${s.gap}`}
              strokeDashoffset={-s.offset}
            />
          ))}
        </svg>

        <ul className="flex-1 space-y-1.5">
          {segments.map(({ label, pct, dot }) => (
            <li key={label} className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-1.5">
                <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${dot}`} />
                <span className="truncate text-[10px] text-muted-foreground">{label}</span>
              </div>
              <span className="flex-shrink-0 font-mono text-[10px] font-semibold text-foreground">
                {pct}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

import { LINED_PAPER } from "@/lib/constants/ui"

interface BeritaHeaderProps {
  articleCount: number
  fetchedAt?: string
}

export function BeritaHeader({ articleCount, fetchedAt }: BeritaHeaderProps) {
  const ts = fetchedAt
    ? new Date(fetchedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="relative border-b border-border" style={LINED_PAPER}>
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-14 md:pt-20">
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
          Berita &amp; Kontroversi · MBG 2026
        </p>

        <h1 className="font-display text-4xl font-extrabold leading-none tracking-tight text-foreground md:text-5xl">
          Berita{" "}
          <span className="text-primary">Kontroversi MBG</span>
        </h1>

        <div className="mb-5 mt-4 h-px w-14 bg-primary" />

        <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-foreground">
          Diperbarui otomatis · Diringkas AI · Dari berbagai sumber
        </p>

        {/* Status bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500 pulse" />
            <span>
              <span className="font-semibold text-foreground">LIVE</span>
              {" — "}Terakhir diperbarui: {ts}
            </span>
          </div>
          {articleCount > 0 && (
            <span className="text-[11px] text-muted-foreground/60">
              {articleCount} berita dikumpulkan
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

import { MBG } from "@/lib/constants/mbg"
import { formatIDR } from "@/lib/utils/format"

const stats = [
  {
    label: "Total Anggaran 2026",
    value: formatIDR(MBG.ANNUAL_BUDGET, true),
    pct: 100,
    bar: "bg-primary",
  },
  {
    label: "Realisasi per Maret 2026",
    value: formatIDR(MBG.REALIZATION_MAR9_2026, true),
    pct: Math.round((MBG.REALIZATION_MAR9_2026 / MBG.ANNUAL_BUDGET) * 100),
    bar: "bg-amber-500",
  },
  {
    label: "Penerima aktif",
    value: `${(MBG.ACTIVE_BENEFICIARIES_MAR9 / 1e6).toFixed(1)} Juta`,
    pct: Math.round((MBG.ACTIVE_BENEFICIARIES_MAR9 / MBG.TARGET_BENEFICIARIES) * 100),
    bar: "bg-foreground/60",
  },
  {
    label: "Dapur SPPG aktif",
    value: MBG.ACTIVE_SPPG.toLocaleString("id-ID"),
    pct: 72,
    bar: "bg-foreground/40",
  },
]

export function StatsSnapshot() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h2 className="mb-3 font-display text-base font-bold text-foreground">Data Terkini</h2>
      <ul className="space-y-3">
        {stats.map(({ label, value, pct, bar }) => (
          <li key={label}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">{label}</span>
              <span className="flex-shrink-0 font-mono text-[11px] font-semibold text-foreground">
                {value}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full transition-all duration-700 ${bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-background py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-sm font-bold text-foreground">
              MBG<span className="text-primary">mata</span>
            </span>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Data berdasarkan dokumen resmi pemerintah. Bukan afiliasi pemerintah.
          </p>

          <nav className="flex items-center gap-5">
            {[
              { href: "/kalkulator", label: "Kalkulator" },
              { href: "/berita", label: "Berita" },
              { href: "/tanya-ai", label: "Tanya AI" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-foreground/85 transition-colors hover:text-foreground"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}

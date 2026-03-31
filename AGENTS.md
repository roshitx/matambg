<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CLAUDE.md — mataMBG Project

## Project Identity
Name: mataMBG (matambg.id)
Description: Civic data website tentang anggaran program Makan Bergizi 
Gratis (MBG) Indonesia. Dark-themed, edu-viral, AI-powered.
Stack: Next.js 16 App Router, TypeScript, Tailwind CSS v4, Shadcn/ui, 
Framer Motion, Anthropic Claude API or OpenRouter API, Exa API, Tavily API.

## Core Rules — WAJIB DIIKUTI
- NEVER hallucinate library APIs. Kalau ga tau, bilang dan tanya. Atau gunakan Context7 MCP
- ALWAYS gunakan TypeScript strict mode. No `any` type kecuali terpaksa.
- ALWAYS gunakan App Router (Next.js 15), bukan Pages Router.
- ALWAYS buat komponen dalam folder src/components/[domain]/
- NEVER hardcode angka MBG — selalu dari src/lib/constants/mbg.ts
- ALWAYS handle error states dan loading states di setiap fetch.
- ALWAYS validasi environment variables saat startup dengan Zod.
- Format angka Indonesia: gunakan utils/format.ts, bukan inline Intl.

## MBG Constants (Source of Truth)
File: src/lib/constants/mbg.ts
- DAILY_BUDGET_IDR = 1_200_000_000_000 (Rp 1.2T/hari)
- ANNUAL_BUDGET_IDR = 335_000_000_000_000 (Rp 335T/tahun 2026)
- BGN_DIRECT_BUDGET = 268_000_000_000_000 (pagu BGN langsung)
- RESERVE_BUDGET = 67_000_000_000_000 (dana cadangan)
- TOTAL_BENEFICIARIES = 82_900_000
- ACTIVE_SPPG = 25_082
- REALIZATION_MAR_2026 = 44_000_000_000_000 (per 9 Maret 2026)

## Design System
Lihat: src/styles/design-system.ts
- Font Display: Syne (800) — headlines
- Font Body: Space Grotesk (400/500/700) — UI
- Primary: #DC2626 (Indonesia red)
- Gold: #F59E0B (accent numbers)
- Background: #0C0C0C, Surface: #161616, Card: #1F1F1F

## Architecture Decisions
- Server Components untuk data fetching (Exa/Tavily news)
- Client Components untuk interaktif (counter, kalkulator, chat)
- API Routes untuk Claude AI proxy (jangan expose key di client)
- Revalidation: berita setiap 6 jam (ISR), data statis setiap hari
- News fetching: pakai Exa API search + Tavily untuk fallback
- AI Chat: streaming response via /api/chat route handler

## File Naming Convention
- Pages: src/app/[route]/page.tsx
- Components: PascalCase.tsx
- Hooks: use[Name].ts
- Utils: camelCase.ts
- Types: src/types/[domain].ts
- Constants: src/lib/constants/[name].ts

## API Keys (semua dari .env.local)
ANTHROPIC_API_KEY — Claude API (AI chat + comparison generator)
EXA_API_KEY — Exa search (news crawling)
TAVILY_API_KEY — Tavily fallback search
NEXT_PUBLIC_APP_URL — base URL

## Performance Rules
- Images: pakai next/image SELALU
- Fonts: next/font/google, preload: true
- Comparison cards: lazy load dengan intersection observer
- Counter: requestAnimationFrame, bukan setInterval
- News list: virtualisasi kalau > 50 item (pakai @tanstack/virtual)

## Commit Convention
feat: fitur baru
fix: bug fix
perf: performance improvement
style: UI/styling
docs: documentation
chore: config/deps

## Testing
- Unit: Vitest untuk utils dan calculations
- Integration: Playwright untuk user flows kritis
- Minimal coverage: calculation functions 100%

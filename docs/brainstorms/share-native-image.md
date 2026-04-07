# Brainstorm: Native Share Sheet + Image Card

**Tanggal:** 2026-04-06
**Halaman:** `/perbandingan`
**Status:** Final — siap implementasi

---

## Problem

`ShareModal` saat ini hanya punya:
- Tweet button (teks saja, tanpa gambar)
- Copy link

Tidak ada gambar, tidak ada WhatsApp, tidak ada native share sheet di mobile.

---

## Keputusan Inti

| Aspek | Keputusan |
|---|---|
| Image generation | Server-side via `ImageResponse` dari `next/og` |
| Image ratio | 9:16 portrait (IG Story-first) |
| URL di image | Dari `NEXT_PUBLIC_APP_URL` env var |
| Mobile UX | Native share sheet (`navigator.share` + file blob) |
| Desktop UX | Split modal — kiri preview image, kanan buttons |
| Prefetch strategy | Blob di-prefetch saat card masuk viewport (fix iOS gesture) |

---

## Arsitektur

### 1. Detection Logic (SSR-safe)

```ts
function canNativeShare(): boolean {
  if (typeof navigator === "undefined") return false
  if (!("share" in navigator)) return false
  // navigator.canShare mungkin tidak ada di beberapa browser
  if (typeof navigator.canShare !== "function") return false
  try {
    return navigator.canShare({
      files: [new File([], "x.png", { type: "image/png" })]
    })
  } catch {
    return false
  }
}
```

- `true` → mobile native share sheet
- `false` → desktop modal

**SSR note:** Semua `navigator` checks harus di dalam `useEffect` atau lazy-evaluated di event handler — tidak boleh di render body karena Next.js SSR tidak punya `window`.

### 2. Image Generation — API Route

**Endpoint:** `GET /api/share-image/[id]`

**Import:** `import { ImageResponse } from "next/og"` — sudah include di Next.js 16, tidak perlu install paket tambahan.

**Runtime:** Edge (`export const runtime = "edge"`) — `ImageResponse` membutuhkan Edge runtime, tidak bisa Node.js runtime.

**Input:** `id` path param (e.g. `puskesmas`)

**Output:** PNG 1080×1920 (9:16), `Content-Type: image/png`

**Caching:** `Cache-Control: public, max-age=86400, s-maxage=86400` — cache 24 jam di CDN.

**Lookup:** Import `COMPARISONS` array, cari by `id`. Jika tidak ketemu → return `new Response("Not found", { status: 404 })`.

### 3. Font Loading di Edge Runtime

Edge runtime tidak bisa `fs.readFileSync`. Opsi yang tersedia:

**Rekomendasi: Download font files ke `/public/fonts/`, fetch via same-origin URL.**

```ts
const fontSyne = await fetch(
  new URL("/fonts/Syne-ExtraBold.ttf", process.env.NEXT_PUBLIC_APP_URL)
).then(r => r.arrayBuffer())
```

Font yang dibutuhkan:
- `Syne-ExtraBold.ttf` (weight 800) — untuk number
- `SpaceGrotesk-Medium.ttf` (weight 500) — untuk teks
- `SpaceGrotesk-Bold.ttf` (weight 700) — untuk label emphasis

Download dari Google Fonts (subset latin + latin-ext saja untuk file size kecil).

### 4. Emoji Rendering di Satori

Satori tidak render emoji native dengan benar di semua platform. Solusi yang sudah teruji: gunakan `twemoji` approach — render emoji sebagai text node dengan font `NotoColorEmoji` atau gunakan `img` tag dengan twemoji CDN URL.

**Pilihan yang lebih simpel:** render emoji sebagai `<span>` dengan font fallback. `ImageResponse` dari Next.js 16 sudah handle emoji cukup baik via built-in emoji support — **test dulu tanpa extra config, tambah font jika hasilnya jelek**.

### 5. Number Overflow di Image

Beberapa item punya units sangat besar (contoh: Nasi Padang = 80 juta porsi). Angka `80.000.000` tidak muat di 1 baris dengan font 220px.

**Solusi: format compact dengan suffix:**
- < 1.000 → `980`
- 1.000 – 999.999 → `12.340`
- ≥ 1.000.000 → `80 Juta`
- ≥ 1.000.000.000 → `1,2 Miliar`

Buat helper `formatCompact(n: number): string` di route handler (atau import dari `lib/utils/format.ts` jika ada).

---

## Desain Share Image (9:16, 1080×1920)

```
┌────────────────────────────┐  ← bg: #0C0C0C
│                            │
│  mataMBG          🇮🇩      │  ← logo kiri, flag kanan; Space Grotesk 500, #71717A
│                            │
│  ─────────────────────     │  ← divider tipis #1F1F1F
│                            │
│                            │
│                            │
│         🍛                 │  ← emoji, ~180px, centered
│                            │
│                            │
│   1 HARI MBG SETARA        │  ← uppercase label, Space Grotesk 500, #71717A, 28px
│                            │
│         80 Juta            │  ← number, Syne 800, #F59E0B, responsive size
│                            │
│   porsi Nasi Padang        │  ← unit + name, Space Grotesk 700, #FAFAFA, 48px
│                            │
│                            │
│  ─────────────────────     │  ← divider
│                            │
│  Rp 1,2 Triliun/hari       │  ← Space Grotesk 500, #71717A, 30px
│  APBN Indonesia 2026       │
│                            │
│   matambg.web.id           │  ← #DC2626, Space Grotesk 700, 32px
│                            │
└────────────────────────────┘
```

**Number font size adaptive** (agar tidak overflow):
- ≤ 6 karakter → 200px
- 7–9 karakter → 160px
- 10–12 karakter → 120px
- > 12 karakter → 90px (tidak akan terjadi kalau pakai compact format)

**Token visual:**
- Background: `#0C0C0C`
- Number: `#F59E0B` (amber-600), Syne 800
- Name: `#FAFAFA`
- Label/muted: `#71717A`
- Accent URL: `#DC2626`
- Divider: `#1F1F1F`

---

## Mobile Flow (Web Share API)

### Critical: iOS Safari User Gesture Problem

**Bug risk:** iOS Safari membutuhkan `navigator.share()` dipanggil synchronously dari user gesture. Jika ada `await` sebelumnya (misal fetch image), Safari kadang reject dengan `NotAllowedError`.

**Solusinya: Prefetch blob saat card masuk viewport.**

```
Card masuk viewport (IntersectionObserver)
  ↓
fetch("/api/share-image/[id]") → blob
  ↓
simpan di blobCache Map<string, Blob>
  ↓

[Nanti saat user klik Share:]
  ↓
ambil blob dari cache (sudah ready, SYNC)
  ↓
navigator.share({ files: [imageFile], ... })  ← dipanggil sync dari gesture
  ↓
Native share sheet terbuka
```

**Fallback jika blob belum ready** (user klik sebelum prefetch selesai):
- Tampilkan spinner
- Tunggu fetch selesai
- Kemudian call `navigator.share` — ini masih dalam async chain dari user gesture, iOS 15+ handle ini dengan baik

### Share Text

Platform-specific text (Twitter limit 280 chars, WhatsApp bebas):

```ts
// Twitter (harus ≤ 280 chars total termasuk URL yang di-count 23 chars)
const tweetText = `1 hari anggaran #MBG = ${formatCompact(units)} ${item.unit} ${item.name}!\nRp 1,2T/hari dari APBN 2026 🇮🇩\n#mataMBG`

// WhatsApp / native share (bisa lebih panjang)
const shareText = `1 hari anggaran MBG = ${formatCompact(units)} ${item.unit} ${item.name}!\n\nData: Rp 1,2 Triliun per hari dari APBN Indonesia 2026.\nCek perbandingan lain:`
```

### Flow Lengkap Mobile

```
User klik Share button
  ↓
ambil blob dari blobCache[item.id]
  ├── ada → langsung share
  └── tidak ada → fetch() → simpan cache → share
  ↓
navigator.share({
  files: [new File([blob], `matambg-${item.id}.png`, { type: "image/png" })],
  title: `1 hari MBG = ${formatCompact(units)} ${item.unit} ${item.name}`,
  text: shareText,
  url: `${appUrl}/perbandingan`
})
  ↓
Catch errors:
  - AbortError → user cancel, diam saja
  - NotAllowedError → gesture timeout, fallback ke desktop modal
  - lainnya → fallback ke desktop modal
```

---

## Desktop Flow (Split Modal)

```
┌───────────────────────────────────────────────────┐
│  Bagikan perbandingan                    ×         │
│                                                   │
│  ┌─────────────────┐  ┌────────────────────────┐  │
│  │                 │  │ 🍛 Nasi Padang          │  │
│  │  [image 9:16    │  │ Bagikan fakta ini       │  │
│  │   preview       │  │                        │  │
│  │   ~200×356px    │  │ [𝕏] Tweet Ini          │  │
│  │   with skeleton │  │                        │  │
│  │   loader]       │  │ [💬] WhatsApp           │  │
│  │                 │  │                        │  │
│  │                 │  │ [⬇] Download Gambar    │  │
│  │                 │  │                        │  │
│  │                 │  │ [🔗] Salin Link         │  │
│  └─────────────────┘  │                        │  │
│                        │ ℹ️ Untuk IG Story:     │  │
│                        │ Download → upload       │  │
│                        └────────────────────────┘  │
└───────────────────────────────────────────────────┘
```

**Image preview:** `<img src="/api/share-image/[id]" alt="Share card untuk [name]" />` — browser fetch otomatis, pakai skeleton (Tailwind `animate-pulse`) sampai `onLoad`.

**Image preview error state:** Jika `onError`, hide image preview, tampilkan fallback (emoji besar + teks).

**`<a download>` di iOS Safari:** Attribute `download` tidak berfungsi di iOS Safari — browser buka gambar di tab baru, bukan download. Tambah hint kecil: *"Di iOS: tahan gambar → Simpan ke Foto"* (tampil hanya jika iOS detected via `userAgent`).

**Buttons:**

| Button | Action | Platform Text |
|---|---|---|
| 𝕏 Tweet Ini | `https://twitter.com/intent/tweet?text=...` | Maks 257 chars (280 - 23 URL) |
| WhatsApp | `https://wa.me/?text=...` — opens WhatsApp Web di desktop | Teks panjang ok |
| Download Gambar | `<a href="/api/share-image/[id]" download="matambg-[id].png">` | — |
| Salin Link | `navigator.clipboard.writeText(url)` + `copied` state 2 detik | — |

---

## OG Tags (Bonus — Tidak Wajib Sprint Ini)

Saat user share URL `/perbandingan` ke WhatsApp/Telegram, platform crawl OG tags. Saat ini OG image mungkin generic.

**Opportunity:** Kalau kita buat `/perbandingan/[id]` individual pages, bisa set `og:image` ke `/api/share-image/[id]` → link preview WhatsApp/Telegram otomatis dapat gambar card yang indah.

Catat sebagai improvement berikutnya, bukan scope sprint ini.

---

## File yang Perlu Dibuat/Dimodifikasi

```
public/
  fonts/
    Syne-ExtraBold.ttf         ← NEW: download dari Google Fonts
    SpaceGrotesk-Medium.ttf    ← NEW
    SpaceGrotesk-Bold.ttf      ← NEW

app/
  api/
    share-image/
      [id]/
        route.ts               ← NEW: ImageResponse generator (Edge runtime)

lib/
  utils/
    shareFormat.ts             ← NEW: formatCompact(), buildShareText()
    blobCache.ts               ← NEW: Map<string, Blob> singleton

components/
  comparison/
    ShareModal.tsx             ← MODIFY: split view, image preview, skeleton
    ComparisonGrid.tsx         ← MODIFY: prefetch logic, mobile/desktop detection
```

---

## Dependencies

- `next/og` — sudah bundled di Next.js 16, `import { ImageResponse } from "next/og"`
- Font files — download manual dari Google Fonts (tidak perlu npm package)
- `react-icons` — untuk brand logos di share modal buttons via SimpleIcons (`si` subset)

### SimpleIcons via react-icons

Gunakan `react-icons/si` untuk logo brand yang akurat di tombol share modal desktop. Jauh lebih baik dari emoji/unicode atau teks `𝕏`.

```ts
import { SiWhatsapp, SiX, SiInstagram } from "react-icons/si"
```

| Platform | Icon | Warna brand |
|---|---|---|
| X (Twitter) | `SiX` | `#000000` (dark bg: `#FFFFFF`) |
| WhatsApp | `SiWhatsapp` | `#25D366` |
| Instagram | `SiInstagram` | `#E1306C` (atau gradient, tapi flat lebih clean) |

**Install:**
```bash
npm install react-icons
```

**Note:** `react-icons/si` tree-shakeable — hanya icon yang di-import yang masuk bundle. Tidak perlu khawatir bundle size selama tidak import `* from "react-icons/si"`.

**iOS hint icon:** Gunakan `SiApple` (`react-icons/si`) untuk tanda iOS hint di modal desktop.

---

## Edge Cases (Lengkap)

| Case | Handling |
|---|---|
| `navigator` undefined (SSR) | Semua navigator checks dalam event handler/useEffect, bukan render body |
| `navigator.canShare` tidak ada (browser lama) | `typeof navigator.canShare === "function"` check sebelum call |
| iOS Safari gesture context timeout | Prefetch blob saat card masuk viewport → share sync dari cache |
| `NotAllowedError` dari `navigator.share` | Fallback ke desktop modal |
| `AbortError` (user cancel) | Silent — tidak perlu alert |
| Network error saat fetch blob | Try share tanpa file (teks+url saja), atau fallback modal |
| Item ID tidak ditemukan di API | Return 404, client show error toast |
| Emoji tidak render di Satori | Test dulu, jika jelek tambah NotoColorEmoji font |
| Number sangat besar (> 1 juta) | `formatCompact()` → "80 Juta", tidak overflow layout |
| Number font overflow | Adaptive font size berdasarkan panjang string compact |
| `<a download>` tidak kerja di iOS | Tampilkan hint "tahan gambar → Simpan ke Foto" jika `iOS` detected |
| Image gagal load di desktop modal | `onError` → hide img, tampilkan fallback emoji+teks |
| Blob cache memory leak | Gunakan `WeakRef` atau batasi cache 20 entries, delete oldest |
| Twitter teks > 280 chars | `buildShareText("twitter")` hard limit 257 chars + URL |
| WhatsApp link tidak buka (desktop tanpa WA) | Opsi fallback: WhatsApp QR atau salin teks |
| `NEXT_PUBLIC_APP_URL` tidak di-set | Fallback ke `https://matambg.web.id` as hardcoded default |
| User klik share sebelum prefetch selesai | Show spinner, tunggu fetch done, lalu share — iOS 15+ handle async chain dari gesture |

---

## Urutan Implementasi

1. Download font files → simpan ke `public/fonts/`
2. Buat `lib/utils/shareFormat.ts` — `formatCompact()`, `buildShareText()`
3. Buat `app/api/share-image/[id]/route.ts` — ImageResponse dengan design 9:16
4. Test API route langsung di browser: `localhost:3000/api/share-image/nasi-padang`
5. Buat `lib/utils/blobCache.ts` — singleton Map untuk prefetch
6. Modifikasi `ComparisonGrid.tsx` — tambah prefetch di IntersectionObserver, mobile/desktop detection, share handler
7. Modifikasi `ShareModal.tsx` — split view, image preview dengan skeleton, platform-specific texts, iOS hint
8. Test mobile di DevTools (Chrome Device Mode) — simulasi Android
9. Test iOS behavior (butuh device fisik atau BrowserStack untuk gesture test)

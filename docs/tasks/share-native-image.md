# Tasks: Native Share Sheet + Image Card

**Brainstorm ref:** `docs/brainstorms/share-native-image.md`
**Tanggal dibuat:** 2026-04-06
**Estimasi:** 8 tasks, urutan wajib diikuti (ada dependencies antar task)

---

## TASK 1 — Download & Setup Font Files

**Goal:** Sediakan font files untuk `ImageResponse` (Edge runtime tidak bisa Google Fonts CDN saat render, harus dari same-origin).

**Steps:**
1. Download font subset Latin dari Google Fonts:
   - Syne ExtraBold (weight 800): `https://fonts.google.com/specimen/Syne`
   - Space Grotesk Medium (weight 500): `https://fonts.google.com/specimen/Space+Grotesk`
   - Space Grotesk Bold (weight 700): same
2. Simpan ke `public/fonts/`:
   - `public/fonts/Syne-ExtraBold.ttf`
   - `public/fonts/SpaceGrotesk-Medium.ttf`
   - `public/fonts/SpaceGrotesk-Bold.ttf`
3. Verifikasi file bisa diakses via browser: `localhost:3000/fonts/Syne-ExtraBold.ttf`

**Notes:**
- Gunakan Google Fonts API download atau `@fontsource` untuk extract TTF
- Hanya perlu subset Latin + Latin-Extended untuk ukuran file kecil
- Alternatif: gunakan `fetch` dari Google Fonts CDN di dalam route handler (lebih mudah, tapi tambah ~100ms latency per request sebelum cache)

---

## TASK 2 — Buat `lib/utils/shareFormat.ts`

**Goal:** Utility functions untuk format number compact dan build share text per platform.

**File:** `lib/utils/shareFormat.ts`

**Functions yang harus dibuat:**

```ts
// Format angka besar ke compact readable
// 80_000_000 → "80 Juta"
// 1_200_000_000 → "1,2 Miliar"
// 12_340 → "12.340"
// < 1 → "< 1"
export function formatCompact(n: number): string

// Build share text per platform, harus strictly typed
// platform: "twitter" | "whatsapp" | "native"
// Twitter: maks 257 chars (280 - 23 reserved for URL)
// WhatsApp/native: bebas
export function buildShareText(
  item: ComparisonItem,
  units: number,
  platform: "twitter" | "whatsapp" | "native"
): string
```

**Contoh output `buildShareText`:**

```
// twitter
"1 hari anggaran #MBG = 80 Juta porsi Nasi Padang!\nRp 1,2T/hari · APBN 2026 🇮🇩\n#mataMBG"

// whatsapp / native
"1 hari anggaran MBG setara 80 Juta porsi Nasi Padang!\n\nData: Rp 1,2 Triliun per hari dari APBN Indonesia 2026.\nCek perbandingan lain:"
```

**Notes:**
- Import `ComparisonItem` dari `@/lib/constants/comparisons`
- Import `MBG` dari `@/lib/constants/mbg` untuk `DAILY_BUDGET`
- `formatCompact` berbeda dari `formatNumber` yang sudah ada — ini untuk share image dan text, bukan UI
- Tambah unit test untuk `formatCompact` (edge cases: 0, negatif, < 1, tepat 1 juta, dst)

---

## TASK 3 — Buat API Route `/api/share-image/[id]/route.ts`

**Goal:** Generate PNG 9:16 (1080×1920) per comparison item via `ImageResponse`.

**File:** `app/api/share-image/[id]/route.ts`

**Spec:**

```ts
export const runtime = "edge"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response>
```

**Logic:**
1. `await params` — Next.js 16 params adalah Promise
2. Lookup item dari `COMPARISONS` array by `id`
3. Jika tidak ditemukan → `return new Response("Not found", { status: 404 })`
4. Load font files via `fetch(new URL("/fonts/...", process.env.NEXT_PUBLIC_APP_URL)).then(r => r.arrayBuffer())`
5. Hitung `units = Math.floor(MBG.DAILY_BUDGET / item.unitPrice)`
6. Format: `formatCompact(units)` dari Task 2
7. Adaptive font size untuk number berdasarkan `formatCompact(units).length`
8. Return `new ImageResponse(jsx, { width: 1080, height: 1920, fonts: [...] })`

**Cache headers:**
```ts
// Set di ImageResponse options atau via Response wrapper
headers: {
  "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600"
}
```

**Design JSX (layout 1080×1920):**
- Background: `#0C0C0C`
- Top bar: "mataMBG" kiri + "🇮🇩" kanan, `color: #71717A`, `fontSize: 32`
- Divider: thin line `#1F1F1F`
- Center area: emoji `fontSize: 180`, centered
- Label: "1 HARI MBG SETARA", `color: #71717A`, `fontSize: 28`, uppercase
- Number: `formatCompact(units)`, `color: #F59E0B`, Syne font, adaptive size
- Item label: `${item.unit} ${item.name}`, `color: #FAFAFA`, Space Grotesk Bold
- Bottom divider + "Rp 1,2 Triliun/hari · APBN 2026", `color: #71717A`
- URL: value dari `process.env.NEXT_PUBLIC_APP_URL ?? "matambg.web.id"`, `color: #DC2626`

**Adaptive font size rule:**
```ts
const compactStr = formatCompact(units)
const numberFontSize =
  compactStr.length <= 6 ? 200 :
  compactStr.length <= 9 ? 160 :
  compactStr.length <= 12 ? 120 : 90
```

**Test:** Setelah deploy/dev, buka `localhost:3000/api/share-image/nasi-padang` di browser — harus render PNG.

**Notes:**
- Import `ImageResponse` dari `"next/og"` (bukan `@vercel/og`)
- Jangan gunakan Tailwind CSS di dalam ImageResponse JSX — hanya inline styles
- Emoji mungkin tidak render dengan baik di Satori. Jika hasilnya kotak/missing, tambahkan NotoColorEmoji font atau render emoji sebagai text dengan explicit fontFamily fallback

---

## TASK 4 — Buat `lib/utils/blobCache.ts`

**Goal:** Singleton Map untuk cache image blob hasil prefetch. Mencegah iOS Safari gesture timeout.

**File:** `lib/utils/blobCache.ts`

**Spec:**

```ts
// Max 30 entries — hapus oldest jika melebihi
const MAX_ENTRIES = 30

// Key: comparison item id, Value: Blob
const cache = new Map<string, Blob>()
const insertOrder: string[] = []

export function getBlobCache(id: string): Blob | undefined

export function setBlobCache(id: string, blob: Blob): void

export async function prefetchBlob(id: string, apiUrl: string): Promise<void>
// - skip jika sudah ada di cache
// - fetch URL → response.blob() → setBlobCache
// - catch error silently (prefetch bukan critical path)
```

**Notes:**
- Module-level Map (singleton karena module cached oleh bundler)
- `insertOrder` array untuk track LRU — jika `cache.size > MAX_ENTRIES`, hapus `insertOrder.shift()`
- Jangan export raw `cache` Map — hanya expose functions

---

## TASK 5 — Modifikasi `components/comparison/ComparisonGrid.tsx`

**Goal:** Tambah prefetch saat card masuk viewport dan handle mobile/desktop share flow.

**Changes:**

### 5a. Prefetch di IntersectionObserver

`ComparisonCard` sudah pakai `IntersectionObserver` untuk `CountUp`. Tambah prefetch di observer yang sama atau buat observer baru di `ComparisonCard`.

Saat card intersect:
```ts
import { prefetchBlob } from "@/lib/utils/blobCache"

// di dalam IntersectionObserver callback
prefetchBlob(item.id, `/api/share-image/${item.id}`)
// fire-and-forget, tidak perlu await
```

### 5b. Share Handler

Ganti `onShare(item: ComparisonItem)` di `ComparisonGrid` dari sekadar `setShareItem(item)` menjadi smart handler:

```ts
async function handleShare(item: ComparisonItem) {
  // Cek apakah mobile native share support
  const nativeSupported = canNativeShare() // dari lib/utils/shareDetect.ts

  if (!nativeSupported) {
    // Desktop: buka modal seperti biasa
    setShareItem(item)
    return
  }

  // Mobile: ambil blob dari cache atau fetch
  setShareLoadingId(item.id) // untuk loading state di button

  try {
    const blob = getBlobCache(item.id) ?? await (async () => {
      const r = await fetch(`/api/share-image/${item.id}`)
      if (!r.ok) throw new Error("Image fetch failed")
      const b = await r.blob()
      setBlobCache(item.id, b)
      return b
    })()

    const units = Math.floor(MBG.DAILY_BUDGET / item.unitPrice)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://matambg.web.id"

    await navigator.share({
      files: [new File([blob], `matambg-${item.id}.png`, { type: "image/png" })],
      title: `1 hari MBG = ${formatCompact(units)} ${item.unit} ${item.name}`,
      text: buildShareText(item, units, "native"),
      url: `${appUrl}/perbandingan`,
    })
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") return // user cancel
    // Fallback ke desktop modal jika error lain (NotAllowedError, network, dll)
    setShareItem(item)
  } finally {
    setShareLoadingId(null)
  }
}
```

### 5c. State Baru di ComparisonGrid

```ts
const [shareLoadingId, setShareLoadingId] = useState<string | null>(null)
```

Pass ke `ComparisonCard` sebagai `isShareLoading={shareLoadingId === item.id}`.

### 5d. Share Button Loading State di ComparisonCard

Jika `isShareLoading`, tampilkan spinner kecil menggantikan `Share2` icon:

```tsx
{isShareLoading ? (
  <Loader2 size={11} className="animate-spin" />
) : (
  <Share2 size={11} />
)}
```

### 5e. Buat `lib/utils/shareDetect.ts`

```ts
export function canNativeShare(): boolean {
  if (typeof navigator === "undefined") return false
  if (!("share" in navigator)) return false
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

---

## TASK 5b — Install `react-icons` untuk SimpleIcons

**Goal:** Sediakan brand logos yang akurat untuk tombol share di desktop modal.

**Steps:**
```bash
npm install react-icons
```

**Icons yang digunakan:**
```ts
import { SiWhatsapp, SiX, SiInstagram, SiApple } from "react-icons/si"
```

| Import | Platform | Warna brand | Dipakai di |
|---|---|---|---|
| `SiX` | X / Twitter | `#000` (light) / `#FFF` (dark bg) | Tweet button |
| `SiWhatsapp` | WhatsApp | `#25D366` | WhatsApp button |
| `SiInstagram` | Instagram | `#E1306C` | Hint teks di desktop (icon dekoratif) |
| `SiApple` | iOS | `#555555` | iOS hint label |

**Note:** Jangan import `* from "react-icons/si"` — import named saja yang dipakai. Tree-shaking hanya bekerja dengan named imports.

---

## TASK 6 — Modifikasi `components/comparison/ShareModal.tsx`

**Goal:** Upgrade ke split view — kiri image preview, kanan buttons. Sudah handle desktop-only (mobile pakai native share sheet).

**New layout:**

```tsx
<div className="relative w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-xl">
  {/* Header */}
  <div className="mb-5 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{item.emoji}</span>
      <div>
        <p className="font-medium text-foreground">{item.name}</p>
        <p className="text-sm text-muted-foreground">Bagikan perbandingan ini</p>
      </div>
    </div>
    <CloseButton />
  </div>

  {/* Split layout */}
  <div className="flex gap-6">
    {/* Left: image preview */}
    <div className="shrink-0 w-[140px]">
      <ImagePreview id={item.id} />
    </div>

    {/* Right: buttons */}
    <div className="flex flex-1 flex-col gap-2">
      <TweetButton item={item} units={units} />
      <WhatsAppButton item={item} units={units} />
      <DownloadButton id={item.id} />
      <CopyLinkButton url={url} />
      <IOSHint /> {/* tampil hanya jika iOS userAgent */}
    </div>
  </div>
</div>
```

**ImagePreview component (dalam file yang sama):**
```tsx
function ImagePreview({ id }: { id: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error) {
    return <div className="...fallback...">Gambar tidak tersedia</div>
  }

  return (
    <div className="relative aspect-[9/16] w-full overflow-hidden rounded-lg bg-secondary">
      {!loaded && <Skeleton />}
      <img
        src={`/api/share-image/${id}`}
        alt={`Share card`}
        className={cn("w-full h-full object-cover", !loaded && "invisible")}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}
```

**IOSHint:**
```tsx
function IOSHint() {
  const isIOS = typeof navigator !== "undefined"
    && /iPad|iPhone|iPod/.test(navigator.userAgent)
  if (!isIOS) return null
  return (
    <p className="text-[10px] text-muted-foreground">
      💡 Di iOS: tahan gambar → Simpan ke Foto, lalu upload ke Instagram
    </p>
  )
}
```

**Buttons dengan SimpleIcons:**
```tsx
import { SiWhatsapp, SiX, SiInstagram, SiApple } from "react-icons/si"
import { Download, Copy, Check } from "lucide-react"

// Tweet button
<a href={tweetUrl} target="_blank" rel="noopener noreferrer" className="...">
  <SiX size={14} />
  Post di X
</a>

// WhatsApp button
<a href={waUrl} target="_blank" rel="noopener noreferrer" className="...">
  <SiWhatsapp size={14} className="text-[#25D366]" />
  WhatsApp
</a>

// Download button
<a href={`/api/share-image/${id}`} download={`matambg-${id}.png`} className="...">
  <Download size={14} />
  Download Gambar
</a>

// Copy link button
<button onClick={handleCopy} className="...">
  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
  {copied ? "Tersalin!" : "Salin Link"}
</button>
```

**IOSHint dengan SiApple:**
```tsx
function IOSHint() {
  const isIOS = typeof navigator !== "undefined"
    && /iPad|iPhone|iPod/.test(navigator.userAgent)
  if (!isIOS) return null
  return (
    <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
      <SiApple size={10} />
      Di iOS: tahan gambar → Simpan ke Foto, lalu upload ke Instagram
    </p>
  )
}
```

**Share texts:**
- Tweet: gunakan `buildShareText(item, units, "twitter")` dari Task 2
- WhatsApp: gunakan `buildShareText(item, units, "whatsapp")` dari Task 2
- `wa.me` URL: `https://wa.me/?text=${encodeURIComponent(whatsappText + " " + url)}`

---

## TASK 7 — Testing Manual

**Goal:** Verifikasi semua flow bekerja sebelum merge.

**Checklist:**

### API Route
- [ ] `localhost:3000/api/share-image/nasi-padang` render PNG yang benar
- [ ] `localhost:3000/api/share-image/invalid-id` return 404
- [ ] Coba beberapa item dengan angka besar (cek number tidak overflow)
- [ ] Emoji terlihat dengan benar di gambar
- [ ] Font Syne dan Space Grotesk render dengan benar

### Desktop Modal
- [ ] Klik share di card → split modal muncul
- [ ] Image preview tampil dengan skeleton loader saat loading
- [ ] Tweet button buka Twitter dengan teks yang benar
- [ ] WhatsApp button buka wa.me
- [ ] Download button download file PNG
- [ ] Copy link button copy URL + tampil "Tersalin!"
- [ ] Error state image: jika gambar gagal load, tampil fallback

### Mobile (Chrome DevTools Device Mode)
- [ ] Toggle ke mobile device → klik share → native share sheet muncul (di DevTools mungkin tidak 100% accurate)
- [ ] Loading spinner muncul di share button selama fetch
- [ ] Blob cache: klik share kedua kali di item yang sama → instant (tidak fetch lagi)

### iOS (jika ada device)
- [ ] Share sheet muncul
- [ ] Gambar ada di share sheet (bisa dikirim ke Instagram, WhatsApp, dll)
- [ ] Download hint muncul di desktop modal jika buka di iOS
- [ ] Cancel sheet tidak menampilkan error

---

## TASK 8 — Code Cleanup & Consistency Check

**Goal:** Pastikan semua code mengikuti project standards.

**Checklist:**
- [ ] Tidak ada `any` type — semua strict typed
- [ ] Tidak ada `console.log` statement
- [ ] Semua navigator checks SSR-safe (tidak di render body)
- [ ] `NEXT_PUBLIC_APP_URL` fallback ke `"https://matambg.web.id"` bukan undefined
- [ ] Download filename: `matambg-${item.id}.png` (descriptive, bukan generic)
- [ ] Tweet text ≤ 257 chars — tambah assertion atau runtime truncate jika perlu
- [ ] `blobCache` max 30 entries — tidak memory leak
- [ ] `ImageResponse` JSX tidak pakai Tailwind — semua inline styles
- [ ] Route handler export `runtime = "edge"` di baris paling atas
- [ ] Semua `params` di-await (Next.js 16: params adalah Promise)
- [ ] Error boundary — jika share route throw, user tidak lihat crash page

---

## File Summary

| File | Status | Notes |
|---|---|---|
| `public/fonts/Syne-ExtraBold.ttf` | NEW | Download dari Google Fonts |
| `public/fonts/SpaceGrotesk-Medium.ttf` | NEW | Download dari Google Fonts |
| `public/fonts/SpaceGrotesk-Bold.ttf` | NEW | Download dari Google Fonts |
| `app/api/share-image/[id]/route.ts` | NEW | Edge runtime, ImageResponse |
| `lib/utils/shareFormat.ts` | NEW | formatCompact, buildShareText |
| `lib/utils/shareDetect.ts` | NEW | canNativeShare() |
| `lib/utils/blobCache.ts` | NEW | prefetch blob cache |
| `components/comparison/ShareModal.tsx` | MODIFY | Split view, image preview |
| `components/comparison/ComparisonGrid.tsx` | MODIFY | Prefetch, native share handler |

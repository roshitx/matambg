import type { ComparisonCategory } from "./constants/comparisons"

// ─── Unsplash Photo ID Mapping ────────────────────────────────────
// Curated high-quality Unsplash photo IDs for each comparison item.
// Format: images.unsplash.com/photo-{ID}?w=1080&h=1920&fit=crop

const UNSPLASH_BASE = "https://images.unsplash.com"
const DEFAULT_PARAMS = "w=1080&h=1920&fit=crop&q=80&auto=format"

// ─── Item → Photo ID (43 items) ──────────────────────────────────

export const itemPhotoMap: Record<string, string> = {
  // MAKANAN (4)
  "nasi-padang": "1504674900247-0877df9cc836",
  "gudeg-jogja": "1540189549336-e6e99c3679fe",
  "indomie-goreng": "1552611052-33e04de081de",
  "gorengan": "1563245372-f21724e3856d",

  // WISATA (2)
  "tiket-bali": "1537996194471-e657df975ab4",
  "trip-lombok": "1507525428034-b723cf961d3e",

  // MILITER (5)
  "gerald-ford": "1544552866-d3ed42536cfd",
  "jet-f35": "1500382017468-9049fed747ef",
  "tank-leopard": "1595590424283-b8f17842773f",
  "kapal-selam": "1559827260-dc66d52bef19",
  "rudal-tomahawk": "1544552866-d3ed42536cfd",

  // TEKNOLOGI (3)
  "iphone-16-pro": "1511707171634-5f897ff02aa9",
  "macbook-pro": "1517336714731-489689fd1ca4",
  "motor-listrik": "1558618666-fcd25c85cd64",

  // INFRASTRUKTUR (6)
  "puskesmas": "1486406146926-c627a92ad1ab",
  "guru-gaji": "1523050854058-8df90110c7f1",
  "rumah-subsidi": "1564013799919-ab600027ffc6",
  "jalan-tol": "1519501028154-47d2b3e5a9a2",
  "ambulans": "1587351021759-3e566b6af7cc",
  "beasiswa-kuliah": "1523050854058-8df90110c7f1",

  // GLOBAL (2)
  "gdp-timor-leste": "1451187580459-43490279c0fa",
  "anggaran-who": "1486406146926-c627a92ad1ab",

  // LUAR ANGKASA (6)
  "anggaran-nasa": "1516849841032-87cbac4d88f7",
  "roket-falcon9": "1516849841032-87cbac4d88f7",
  "roket-starship": "1516849841032-87cbac4d88f7",
  "teleskop-webb": "1462331940025-496dfbfc7564",
  "satelit-komunikasi": "1451187580459-43490279c0fa",
  "iss-biaya": "1451187580459-43490279c0fa",

  // OLAHRAGA (5)
  "transfer-neymar": "1508098682722-e99c43a406b2",
  "gaji-mbappe": "1508098682722-e99c43a406b2",
  "formula1-mobil": "1568605117036-5fe5e7bab0b7",
  "stadion-gbk": "1489944440615-453fc2b6e37a",
  "tiket-final-worldcup": "1508098682722-e99c43a406b2",

  // HIBURAN (5)
  "konser-taylorswift": "1470229722913-7c0e2dbbafd3",
  "budget-gta6": "1542751371-adc38448a05e",
  "film-endgame": "1489599849927-2ee91cede3ba",
  "netflix-bulan": "1489599849927-2ee91cede3ba",
  "spotify-tahun": "1470229722913-7c0e2dbbafd3",

  // KESEHATAN (5)
  "vaksin-covid": "1576091160399-112ba8d25d1d",
  "operasi-jantung": "1576091160399-112ba8d25d1d",
  "obat-kanker": "1576091160399-112ba8d25d1d",
  "rsud-baru": "1587351021759-3e566b6af7cc",
  "dialisis-setahun": "1576091160399-112ba8d25d1d",
}

// ─── Category Fallbacks (2–3 per category) ────────────────────────

const categoryFallbacks: Record<ComparisonCategory, string[]> = {
  makanan: [
    "1504674900247-0877df9cc836",
    "1540189549336-e6e99c3679fe",
    "1563245372-f21724e3856d",
  ],
  wisata: [
    "1537996194471-e657df975ab4",
    "1507525428034-b723cf961d3e",
  ],
  militer: [
    "1544552866-d3ed42536cfd",
    "1500382017468-9049fed747ef",
    "1559827260-dc66d52bef19",
  ],
  teknologi: [
    "1511707171634-5f897ff02aa9",
    "1517336714731-489689fd1ca4",
    "1558618666-fcd25c85cd64",
  ],
  infrastruktur: [
    "1486406146926-c627a92ad1ab",
    "1519501028154-47d2b3e5a9a2",
    "1564013799919-ab600027ffc6",
  ],
  global: [
    "1451187580459-43490279c0fa",
    "1486406146926-c627a92ad1ab",
  ],
  "luar-angkasa": [
    "1516849841032-87cbac4d88f7",
    "1462331940025-496dfbfc7564",
    "1451187580459-43490279c0fa",
  ],
  olahraga: [
    "1508098682722-e99c43a406b2",
    "1568605117036-5fe5e7bab0b7",
    "1489944440615-453fc2b6e37a",
  ],
  hiburan: [
    "1470229722913-7c0e2dbbafd3",
    "1542751371-adc38448a05e",
    "1489599849927-2ee91cede3ba",
  ],
  kesehatan: [
    "1587351021759-3e566b6af7cc",
    "1576091160399-112ba8d25d1d",
  ],
}

// ─── Gradient Fallbacks ───────────────────────────────────────────

export interface GradientFallback {
  from: string
  via?: string
  to: string
  angle: number
}

const gradientFallbacks: Record<ComparisonCategory, GradientFallback> = {
  makanan: { from: "#92400e", via: "#b45309", to: "#1c1917", angle: 135 },
  wisata: { from: "#0369a1", via: "#0ea5e9", to: "#0c0c0c", angle: 150 },
  militer: { from: "#374151", via: "#6b7280", to: "#0c0c0c", angle: 135 },
  teknologi: { from: "#4c1d95", via: "#7c3aed", to: "#0c0c0c", angle: 135 },
  infrastruktur: { from: "#065f46", via: "#10b981", to: "#0c0c0c", angle: 150 },
  global: { from: "#1e3a5f", via: "#3b82f6", to: "#0c0c0c", angle: 135 },
  "luar-angkasa": { from: "#0f172a", via: "#1e1b4b", to: "#0c0c0c", angle: 180 },
  olahraga: { from: "#991b1b", via: "#dc2626", to: "#0c0c0c", angle: 135 },
  hiburan: { from: "#7c2d12", via: "#ea580c", to: "#0c0c0c", angle: 150 },
  kesehatan: { from: "#065f46", via: "#059669", to: "#0c0c0c", angle: 135 },
}

// ─── Helper: Build full URL ───────────────────────────────────────

function buildUnsplashUrl(photoId: string, params?: string): string {
  const p = params ?? DEFAULT_PARAMS
  return `${UNSPLASH_BASE}/photo-${photoId}?${p}`
}

// ─── Exported Functions ────────────────────────────────────────────

export function getPhotoForItem(itemId: string): string {
  const photoId = itemPhotoMap[itemId]
  if (photoId) return buildUnsplashUrl(photoId)

  return ""
}

export function getCategoryFallback(category: ComparisonCategory): string {
  const ids = categoryFallbacks[category]
  const randomIdx = Math.floor(Math.random() * ids.length)
  return buildUnsplashUrl(ids[randomIdx])
}

export function getGradientFallback(category: ComparisonCategory): GradientFallback {
  return gradientFallbacks[category]
}

/**
 * Best-effort: returns item photo, or random category fallback, or gradient.
 * Returns the photo URL or empty string (caller should use gradient).
 */
export function getBestPhoto(itemId: string, category: ComparisonCategory): string {
  const itemUrl = getPhotoForItem(itemId)
  if (itemUrl) return itemUrl

  return getCategoryFallback(category)
}

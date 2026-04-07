#!/usr/bin/env tsx

// Build-time script: fetches Unsplash images for share cards.
// Run: npm run fetch-share-images
// Safe to re-run — skips existing files.

import { itemPhotoMap } from "../lib/unsplash-photos"
import { mkdir, writeFile } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

const PUBLIC_DIR = path.join(process.cwd(), "public")
const CACHE_DIR = path.join(PUBLIC_DIR, "share-bg")
const UNSPLASH_BASE = "https://images.unsplash.com"
const IMAGE_PARAMS = "w=1080&h=1920&fit=crop&q=80"
const DELAY_MS = 100

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchImage(photoId: string, itemId: string): Promise<boolean> {
  const url = `${UNSPLASH_BASE}/photo-${photoId}?${IMAGE_PARAMS}`
  const filePath = path.join(CACHE_DIR, `${itemId}.jpg`)

  if (existsSync(filePath)) {
    console.log(`→ ${itemId} (cached)`)
    return true
  }

  try {
    const res = await fetch(url)
    if (!res.ok) {
      console.log(`✗ ${itemId} — HTTP ${res.status}`)
      return false
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    await writeFile(filePath, buffer)
    console.log(`✓ ${itemId} (${photoId})`)
    return true
  } catch (err) {
    console.log(`✗ ${itemId} — ${(err as Error).message}`)
    return false
  }
}

async function main(): Promise<void> {
  const entries = Object.entries(itemPhotoMap)
  console.log(`Fetching ${entries.length} Unsplash images...\n`)

  if (!existsSync(CACHE_DIR)) {
    await mkdir(CACHE_DIR, { recursive: true })
  }

  let succeeded = 0
  let failed = 0

  for (const [itemId, photoId] of entries) {
    const ok = await fetchImage(photoId, itemId)
    if (ok) succeeded++
    else failed++
    await delay(DELAY_MS)
  }

  console.log(`\nResults: ${succeeded} succeeded, ${failed} failed`)

  if (failed > 0) {
    console.log("Some images failed to fetch. Re-run to retry.")
  }
}

main().catch(() => {
  // Never exit with non-zero — build must not fail
  console.log("Script error occurred but exiting gracefully.")
})

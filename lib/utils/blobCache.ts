const MAX_ENTRIES = 30

const cache = new Map<string, Blob>()
const insertOrder: string[] = []

export function getBlobCache(id: string): Blob | undefined {
  return cache.get(id)
}

export function setBlobCache(id: string, blob: Blob): void {
  const isNew = !cache.has(id)

  cache.set(id, blob)

  if (isNew) {
    insertOrder.push(id)
  }

  while (cache.size > MAX_ENTRIES) {
    const oldestId = insertOrder.shift()

    if (!oldestId) {
      break
    }

    cache.delete(oldestId)
  }
}

export async function prefetchBlob(id: string, apiUrl: string): Promise<void> {
  if (cache.has(id)) {
    return
  }

  try {
    const response = await fetch(apiUrl)

    if (!response.ok) {
      return
    }

    const blob = await response.blob()
    setBlobCache(id, blob)
  } catch {}
}

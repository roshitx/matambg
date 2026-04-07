import {
  getGradientFallback,
  getPhotoForItem,
  type GradientFallback,
} from "../unsplash-photos"

type ComparisonCategory = Parameters<typeof getGradientFallback>[0]

export interface BackgroundData {
  type: "image" | "gradient"
  value: string
  isLocal: boolean
}

const UNSPLASH_BASE = "https://images.unsplash.com"
const DEFAULT_UNSPLASH_PARAMS = "w=1080&h=1920&fit=crop&q=80&auto=format"

const LOCAL_IMAGE_IDS = new Set<string>()

export function getGradientCss(gradient: GradientFallback): string {
  if (gradient.via) {
    return `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.via}, ${gradient.to})`
  }

  return `linear-gradient(${gradient.angle}deg, ${gradient.from}, ${gradient.to})`
}

export function buildUnsplashUrl(photoId: string, params?: string): string {
  const finalParams = params?.replace(/^\?/, "") || DEFAULT_UNSPLASH_PARAMS
  return `${UNSPLASH_BASE}/photo-${photoId}?${finalParams}`
}

export function getLocalImagePath(itemId: string): string {
  return `/share-bg/${itemId}.jpg`
}

export function getBackgroundData(
  itemId: string,
  category: ComparisonCategory,
): BackgroundData {
  if (LOCAL_IMAGE_IDS.has(itemId)) {
    return {
      type: "image",
      value: getLocalImagePath(itemId),
      isLocal: true,
    }
  }

  const unsplashPhoto = getPhotoForItem(itemId)
  if (unsplashPhoto) {
    return {
      type: "image",
      value: unsplashPhoto,
      isLocal: false,
    }
  }

  const gradient = getGradientFallback(category)

  return {
    type: "gradient",
    value: getGradientCss(gradient),
    isLocal: false,
  }
}

import { HttpTypes } from "@medusajs/types"

const POSTHOG_DISTINCT_ID_COOKIE = "ph_distinct_id"
export const POSTHOG_DISTINCT_ID_METADATA_KEY = "posthog_distinct_id"

const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/+$/, "") ||
  "https://eu.i.posthog.com"

const POSTHOG_PROJECT_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

export const isPostHogEnabled = () => Boolean(POSTHOG_PROJECT_TOKEN)

export const postHogEndpoint = () => `${POSTHOG_HOST}/capture`
export const postHogProjectToken = () => POSTHOG_PROJECT_TOKEN

export const getCartMetadataDistinctId = (
  cart: HttpTypes.StoreCart | null
): string | null => {
  if (!cart?.metadata) {
    return null
  }
  const value = (cart.metadata as Record<string, unknown>)[
    POSTHOG_DISTINCT_ID_METADATA_KEY
  ]
  return typeof value === "string" && value.length > 0 ? value : null
}

export const newPostHogDistinctId = () => {
  // Stable, sortable, opaque enough for the funnel. posthog-node accepts
  // any non-empty string, so we don't need to match posthog-js's own
  // generation strategy (ulid/uuid) — this is just our own proxy.
  const random = Math.random().toString(36).slice(2, 10)
  return `ph_${Date.now().toString(36)}_${random}`
}

export const POSTHOG_DISTINCT_ID_COOKIE_NAME = POSTHOG_DISTINCT_ID_COOKIE

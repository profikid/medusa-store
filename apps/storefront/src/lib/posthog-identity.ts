"use server"

import { cookies, headers as nextHeaders } from "next/headers"
import { getCartId } from "@lib/data/cookies"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"

const POSTHOG_DISTINCT_ID_COOKIE = "ph_distinct_id"
export const POSTHOG_DISTINCT_ID_METADATA_KEY = "posthog_distinct_id"

const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST?.replace(/\/+$/, "") ||
  "https://eu.i.posthog.com"

const POSTHOG_PROJECT_TOKEN = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

export const isPostHogEnabled = () => Boolean(POSTHOG_PROJECT_TOKEN)

const newDistinctId = () => {
  // Stable, sortable, opaque enough for the funnel. posthog-node accepts
  // any non-empty string, so we don't need to match posthog-js's own
  // generation strategy (ulid/uuid) — this is just our own proxy.
  const random = Math.random().toString(36).slice(2, 10)
  return `ph_${Date.now().toString(36)}_${random}`
}

const getCartMetadataDistinctId = (
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

const setCartMetadataDistinctId = async (
  cartId: string,
  distinctId: string
) => {
  await sdk.store.cart.update(
    cartId,
    {
      metadata: { [POSTHOG_DISTINCT_ID_METADATA_KEY]: distinctId },
    },
    {},
    {}
  )
}

/**
 * Resolve the PostHog distinct ID for the current request, creating
 * and persisting one if necessary. The cart's metadata is the source
 * of truth; the cookie is a fast path and a way for posthog-js on the
 * client to pick up the same ID across navigations.
 *
 * Returns null if PostHog isn't configured.
 */
export const resolvePostHogDistinctId = async (): Promise<string | null> => {
  if (!isPostHogEnabled()) {
    return null
  }

  const cookieJar = await cookies()
  const cookieId = cookieJar.get(POSTHOG_DISTINCT_ID_COOKIE)?.value ?? null
  const cartId = await getCartId()

  // Fast path: cookie present, nothing to do.
  if (cookieId) {
    if (cartId) {
      const cart = await sdk.store.cart
        .retrieve(cartId, { fields: "id,metadata" })
        .then(({ cart }) => cart as HttpTypes.StoreCart)
        .catch(() => null)

      if (cart && !getCartMetadataDistinctId(cart)) {
        // Persist on the cart so a server-side order event can use it
        // even when the cookie is gone (e.g. mobile, expired session).
        try {
          await setCartMetadataDistinctId(cartId, cookieId)
        } catch {
          /* swallow — non-fatal, the order.placed subscriber will retry */
        }
      }
    }
    return cookieId
  }

  // Cookie missing: fall back to cart metadata (e.g. the user
  // accepted cookies before but cleared them, or a server action set
  // it directly).
  let cart: HttpTypes.StoreCart | null = null
  if (cartId) {
    cart = await sdk.store.cart
      .retrieve(cartId, { fields: "id,metadata" })
      .then(({ cart }) => cart as HttpTypes.StoreCart)
      .catch(() => null)
  }

  const cartMetaId = getCartMetadataDistinctId(cart)
  if (cartMetaId) {
    cookieJar.set(POSTHOG_DISTINCT_ID_COOKIE, cartMetaId, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
    return cartMetaId
  }

  // Fresh visitor: generate, persist on the cart if we have one, then
  // set the cookie. The cookie is set on the response, so this works
  // from server actions as well as RSC.
  const fresh = newDistinctId()
  cookieJar.set(POSTHOG_DISTINCT_ID_COOKIE, fresh, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
  if (cartId) {
    try {
      await setCartMetadataDistinctId(cartId, fresh)
    } catch {
      /* best-effort */
    }
  }
  return fresh
}

/**
 * Read PostHog identity-forwarding headers. The PostHog docs describe
 * this for tying browser sessions to server actions; we keep the
 * helper but don't trust the values for commerce events.
 */
export const readForwardedPostHogHeaders = async () => {
  const h = await nextHeaders()
  return {
    distinctId: h.get("x-posthog-distinct-id"),
    sessionId: h.get("x-posthog-session-id"),
  }
}

export const postHogEndpoint = () => `${POSTHOG_HOST}/capture`
export const postHogProjectToken = () => POSTHOG_PROJECT_TOKEN

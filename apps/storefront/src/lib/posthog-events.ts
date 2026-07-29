"use server"

import { cookies } from "next/headers"
import { captureServer, identifyServer } from "./posthog-server"
import { isPostHogEnabled } from "./posthog-identity"
import { resolvePostHogDistinctId } from "./posthog-identity-server"
import { retrieveCustomer } from "./data/customer"
import { getCartId } from "./data/cookies"
import { sdk } from "./config"
import { HttpTypes } from "@medusajs/types"

const PROFILE_DISTINCT_ID_COOKIE = "ph_profile_distinct_id"

type EventProps = Record<string, unknown>

/**
 * Resolve a PostHog distinct ID. Priority:
 *   1. The persistent `ph_profile_distinct_id` cookie (set on first identify).
 *   2. The cart metadata distinct ID.
 *   3. A freshly generated one (also written to the cart metadata and cookie).
 *
 * The fallback chain is the one place where cart <-> identity bridging
 * happens, so every event coming out of the storefront uses the same ID
 * for the same shopper.
 */
const getOrCreateDistinctId = async () => {
  if (!isPostHogEnabled()) {
    return null
  }
  const cookieJar = await cookies()
  const profileId = cookieJar.get(PROFILE_DISTINCT_ID_COOKIE)?.value
  if (profileId) {
    return profileId
  }
  const resolved = await resolvePostHogDistinctId()
  if (resolved) {
    cookieJar.set(PROFILE_DISTINCT_ID_COOKIE, resolved, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    })
  }
  return resolved
}

const safeCartLookup = async (cartId: string) =>
  sdk.store.cart
    .retrieve(cartId, { fields: "id,total,item_count,currency_code,items.id" })
    .then(({ cart }) => cart as HttpTypes.StoreCart)
    .catch(() => null)

/**
 * Capture a storefront-side event using the resolved distinct ID.
 * The actor is the distinct ID — we do not pass email or any other PII
 * as the actor_id. Customer-specific properties go in `properties`.
 */
export const trackStorefrontEvent = async (
  event: string,
  extra: EventProps = {}
) => {
  if (!isPostHogEnabled()) {
    return
  }
  const distinctId = await getOrCreateDistinctId()
  if (!distinctId) {
    return
  }
  const cartId = await getCartId().catch(() => null)
  const cart = cartId ? await safeCartLookup(cartId) : null

  await captureServer({
    event,
    distinctId,
    properties: {
      source: "storefront",
      ...(cart?.id ? { cart_id: cart.id } : {}),
      ...(typeof cart?.items?.length === "number"
        ? { cart_item_count: cart.items.length }
        : {}),
      ...(typeof cart?.total === "number" ? { cart_total: cart.total } : {}),
      ...(cart?.currency_code
        ? { cart_currency_code: cart.currency_code }
        : {}),
      ...extra,
    },
  })
}

/**
 * Identify the current customer in PostHog. Only called when the
 * customer is known (post-login / signup). The distinct ID is the
 * profile ID, NOT the customer id — customer.id is a Medusa internal
 * and using it as the actor would split identity if the same person
 * re-registers. We use a single, stable profile ID across the funnel.
 */
export const identifyStorefrontCustomer = async (
  distinctId?: string
) => {
  if (!isPostHogEnabled()) {
    return
  }
  const id = distinctId ?? (await getOrCreateDistinctId())
  if (!id) {
    return
  }
  const customer = await retrieveCustomer().catch(() => null)
  if (!customer) {
    return
  }
  await identifyServer({
    distinctId: id,
    properties: {
      email: customer.email,
      first_name: customer.first_name ?? undefined,
      last_name: customer.last_name ?? undefined,
      medusa_customer_id: customer.id,
    },
  })
}

export async function resetStorefrontIdentity() {
  if (!isPostHogEnabled()) {
    return
  }
  const cookieJar = await cookies()
  cookieJar.delete(PROFILE_DISTINCT_ID_COOKIE)
}

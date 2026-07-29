/**
 * Centralised actor_id resolution for backend analytics events. The
 * storefront persists a PostHog distinct ID on every cart via
 * `posthog_distinct_id` metadata; the `completeCartWorkflow` copies
 * cart metadata to the order, so subsequent order/cancel/refund
 * events all resolve to the same PostHog person.
 *
 * If the cart-level ID is missing (e.g. a manual admin order or a
 * pre-existing order from before this integration), we fall back to
 * the customer's email, which is unique per user. The actor_id never
 * carries PII beyond the email and the customer ID; the PostHog
 * dashboard can join on `$email` and `medusa_customer_id` properties
 * we attach separately.
 */
export const POSTHOG_DISTINCT_ID_METADATA_KEY = "posthog_distinct_id"

const readMetadata = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object") {
    return null
  }
  return value as Record<string, unknown>
}

type ActorSource = {
  metadata?: unknown
  customer_id?: string | null
  email?: string | null
}

export const resolvePostHogActorId = (source: ActorSource): string | null => {
  const fromMetadata = readMetadata(source.metadata)?.[
    POSTHOG_DISTINCT_ID_METADATA_KEY
  ]
  if (typeof fromMetadata === "string" && fromMetadata.length > 0) {
    return fromMetadata
  }
  if (source.customer_id) {
    return `customer:${source.customer_id}`
  }
  if (source.email) {
    return `email:${source.email}`
  }
  return null
}

type IdentifyPayload = {
  actor_id: string
  properties?: Record<string, unknown>
}

/**
 * Build a PostHog `identify` payload from a Medusa customer. The
 * actor_id must match the same distinct ID we use for the order
 * events, so we apply the same priority chain.
 */
export const buildIdentifyPayloadFromCustomer = (customer: {
  id: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  metadata?: unknown
}): IdentifyPayload | null => {
  const actorId = resolvePostHogActorId({
    metadata: customer.metadata,
    customer_id: customer.id,
    email: customer.email,
  })
  if (!actorId) {
    return null
  }
  return {
    actor_id: actorId,
    properties: {
      email: customer.email ?? undefined,
      first_name: customer.first_name ?? undefined,
      last_name: customer.last_name ?? undefined,
      medusa_customer_id: customer.id,
    },
  }
}

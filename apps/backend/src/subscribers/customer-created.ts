import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { buildIdentifyPayloadFromCustomer } from "../lib/posthog-actor"

// `customer.created` fires after a Medusa customer record is created.
// We call `analytics.identify()` so the storefront's already-collected
// anonymous events (from before login) merge into the new person in
// PostHog. This is what the PostHog docs call "stitching".
//
// Note: the storefront calls `identify` server-side too (in
// `lib/posthog-events.ts`), so the actor_id must match what the
// storefront uses. We resolve it through the same helper used for
// order events.
type CustomerPayload = {
  id: string
  email?: string | null
  first_name?: string | null
  last_name?: string | null
  metadata?: Record<string, unknown> | null
}

export default async function customerCreatedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as {
    error: (msg: string, meta?: unknown) => void
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (config: unknown) => Promise<{ data: CustomerPayload[] }>
  }
  const { data } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name", "metadata"],
    filters: { id: event.data.id },
  })

  const customer = data?.[0]
  if (!customer) {
    logger.error(
      `[customer-created] customer ${event.data.id} not found, skipping analytics`
    )
    return
  }

  const identifyPayload = buildIdentifyPayloadFromCustomer(customer)
  if (!identifyPayload) {
    return
  }

  try {
    const analytics = container.resolve(Modules.ANALYTICS) as {
      identify: (data: {
        actor_id: string
        properties?: Record<string, unknown>
      }) => Promise<void> | void
    }
    await analytics.identify(identifyPayload)
  } catch (err) {
    logger.error(`[customer-created] analytics identify failed`, err)
  }
}

export const config: SubscriberConfig = {
  event: "customer.created",
  context: {
    subscriberId: "customer-created-analytics",
  },
}

import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { resolvePostHogActorId } from "../lib/posthog-actor"

// `order.canceled` carries only the order id. We resolve the full order
// to get the metadata, email, and currency, then forward an analytics
// event to the configured provider (PostHog in prod, Local in dev).
//
// We use the cart-derived `posthog_distinct_id` metadata so this server
// event ends up in the same PostHog person as the storefront funnel —
// even if the customer never logs in. See `lib/posthog-actor.ts`.

type OrderSummary = {
  id: string
  email?: string | null
  display_id?: string | null
  currency_code?: string | null
  total?: number | null
  metadata?: Record<string, unknown> | null
}

export default async function orderCanceledHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as {
    error: (msg: string, meta?: unknown) => void
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (config: unknown) => Promise<{ data: OrderSummary[] }>
  }
  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "email",
      "display_id",
      "currency_code",
      "total",
      "metadata",
    ],
    filters: { id: event.data.id },
  })

  const order = data?.[0]
  if (!order) {
    logger.error(
      `[order-canceled] order ${event.data.id} not found, skipping analytics`
    )
    return
  }

  try {
    const analytics = container.resolve(Modules.ANALYTICS) as {
      track: (data: {
        event: string
        actor_id?: string
        properties?: Record<string, unknown>
      }) => Promise<void> | void
    }
    const actorId = resolvePostHogActorId({
      metadata: order.metadata,
      email: order.email,
    })
    await analytics.track({
      event: "order.canceled",
      actor_id: actorId ?? undefined,
      properties: {
        order_id: order.id,
        display_id: order.display_id,
        currency: order.currency_code,
        total: order.total,
      },
    })
  } catch (err) {
    logger.error(`[order-canceled] analytics track failed`, err)
  }
}

export const config: SubscriberConfig = {
  event: "order.canceled",
  context: {
    subscriberId: "order-canceled-analytics",
  },
}

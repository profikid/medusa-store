import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { resolvePostHogActorId } from "../lib/posthog-actor"

type OrderSummary = {
  id: string
  email?: string | null
  currency_code?: string | null
  total?: number | null
  metadata?: Record<string, unknown> | null
}

export default async function paymentRefundedHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as {
    error: (msg: string, meta?: unknown) => void
  }

  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (config: unknown) => Promise<{ data: unknown[] }>
  }

  const paymentRes = await query.graph({
    entity: "payment",
    fields: ["id", "payment_collection_id"],
    filters: { id: event.data.id },
  })
  const payment = paymentRes.data?.[0] as
    | { id: string; payment_collection_id?: string }
    | undefined
  const paymentCollectionId = payment?.payment_collection_id
  if (!paymentCollectionId) {
    logger.error(
      `[payment-refunded] payment ${event.data.id} has no payment_collection_id; skipping analytics`
    )
    return
  }

  const linkRes = await query.graph({
    entity: "order_payment_collection",
    fields: ["order.id", "order.email", "order.metadata"],
    filters: { payment_collection_id: paymentCollectionId },
  })
  const link = linkRes.data?.[0] as
    | { order: OrderSummary }
    | undefined
  const order = link?.order
  if (!order) {
    logger.error(
      `[payment-refunded] payment ${event.data.id} not linked to an order; skipping analytics`
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
      event: "payment_refunded",
      actor_id: actorId ?? undefined,
      properties: {
        payment_id: event.data.id,
        order_id: order.id,
        currency: order.currency_code,
        total: order.total,
      },
    })
  } catch (err) {
    logger.error(`[payment-refunded] analytics track failed`, err)
  }
}

export const config: SubscriberConfig = {
  event: "payment.refunded",
  context: {
    subscriberId: "payment-refunded-analytics",
  },
}

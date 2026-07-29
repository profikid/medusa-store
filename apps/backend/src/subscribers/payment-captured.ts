import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { resolvePostHogActorId } from "../lib/posthog-actor"

// `payment.captured` fires after a payment is successfully captured.
// We forward it as the `payment_captured` event so the storefront and
// backend agree on the conversion-truth stream.
type OrderSummary = {
  id: string
  email?: string | null
  currency_code?: string | null
  total?: number | null
  metadata?: Record<string, unknown> | null
}

type PaymentEventPayload = {
  id: string
}

export default async function paymentCapturedHandler({
  event,
  container,
}: SubscriberArgs<PaymentEventPayload>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as {
    error: (msg: string, meta?: unknown) => void
  }

  // Resolve the payment → payment_collection → order path via
  // Medusa's link tables. Two queries keep the type simple.
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (config: unknown) => Promise<{ data: unknown[] }>
  }

  // Step 1: payment → payment_collection_id
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
      `[payment-captured] payment ${event.data.id} has no payment_collection_id; skipping analytics`
    )
    return
  }

  // Step 2: order_payment_collection.order
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
      `[payment-captured] payment ${event.data.id} not linked to an order; skipping analytics`
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
      event: "payment_captured",
      actor_id: actorId ?? undefined,
      properties: {
        payment_id: event.data.id,
        order_id: order.id,
        currency: order.currency_code,
        total: order.total,
      },
    })
  } catch (err) {
    logger.error(`[payment-captured] analytics track failed`, err)
  }
}

export const config: SubscriberConfig = {
  event: "payment.captured",
  context: {
    subscriberId: "payment-captured-analytics",
  },
}

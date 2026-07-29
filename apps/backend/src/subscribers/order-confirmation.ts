import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

// Order payload shape as emitted on `order.created`. We only declare the
// fields we actually read; the full type is `OrderDTO` from `@medusajs/types`
// but we keep this minimal and avoid an extra type import for a single use.
type OrderEventPayload = {
  id: string
  email?: string | null
  display_id?: string | null
  currency_code?: string | null
  total?: number | null
  items?: Array<{ title?: string; quantity?: number }> | null
}

// Build a minimal HTML confirmation email. If `SENDGRID_ORDER_TEMPLATE_ID`
// is configured, the SendGrid provider sends a dynamic template instead
// (and `data` from the notification becomes the template variables).
function buildOrderHtml(order: OrderEventPayload): string {
  const orderId = order.display_id ?? order.id ?? "?"
  const email = order.email ?? "your email"
  const items = (order.items ?? [])
    .map((it) => {
      const title = it.title ?? "Item"
      const qty = it.quantity ?? 1
      return `<li>${title} &times; ${qty}</li>`
    })
    .join("")

  // Deliberately plain HTML — no inline CSS frameworks, no template engines.
  // The storefront can be updated to render a richer version later; the
  // production goal here is to validate that SendGrid delivery works.
  const itemsHtml = items
    ? `<ul style="padding-left:1.25rem;">${items}</ul>`
    : "<p>Your order details are available in your account.</p>"

  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#111;">
      <h1 style="font-size:20px;margin-bottom:8px;">Bedankt voor je bestelling</h1>
      <p>Hé, we hebben je bestelling #${orderId} binnen. We gaan ermee aan de slag.</p>
      ${itemsHtml}
      <p style="margin-top:24px;font-size:13px;color:#666;">
        Je krijgt weer een mail zodra je bestelling is verzonden.
      </p>
    </div>
  `
}

export default async function orderConfirmationHandler({
  event,
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER) as {
    info: (msg: string, meta?: unknown) => void
    error: (msg: string, meta?: unknown) => void
  }

  // `order.placed` payloads carry only the order id in the event itself.
  // We resolve the order service to fetch the full order so we can render
  // an email with the items, totals, and customer email.
  const query = container.resolve(ContainerRegistrationKeys.QUERY) as {
    graph: (config: unknown) => Promise<{ data: OrderEventPayload[] }>
  }

  const { data } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "email",
      "display_id",
      "currency_code",
      "total",
      "items.title",
      "items.quantity",
    ],
    filters: { id: event.data.id },
  })

  const order = data?.[0]
  if (!order) {
    logger.error(`[order-confirmation] order ${event.data.id} not found, skipping email`)
    return
  }

  if (!order.email) {
    logger.error(
      `[order-confirmation] order ${order.id} has no email; cannot send confirmation`
    )
    return
  }

  // Analytics — track the event so we can chart conversions later.
  // The Local provider logs this at debug level; PostHog/Segment can be
  // swapped in without touching this code.
  try {
    const analytics = container.resolve(Modules.ANALYTICS) as {
      track: (event: {
        event: string
        user_id?: string
        properties?: Record<string, unknown>
      }) => Promise<void> | void
    }
    await analytics.track({
      event: "order.placed",
      user_id: order.email,
      properties: {
        order_id: order.id,
        display_id: order.display_id,
        currency: order.currency_code,
        total: order.total,
        item_count: order.items?.length ?? 0,
      },
    })
  } catch (err) {
    // Don't fail the email just because analytics is down.
    logger.error(`[order-confirmation] analytics track failed`, err)
  }

  // Notification — resolve the Notification module and queue a SendGrid email.
  // The provider id `sendgrid` matches the configured id in medusa-config.ts.
  const notificationModule = container.resolve(Modules.NOTIFICATION) as {
    createNotifications: (data: unknown) => Promise<unknown>
  }

  const templateId = process.env.SENDGRID_ORDER_TEMPLATE_ID
  const payload = {
    to: order.email,
    channel: "email",
    trigger_type: "order.placed",
    resource_id: order.id,
    data: {
      order_id: order.id,
      display_id: order.display_id,
      currency: order.currency_code,
      total: order.total,
      items: order.items ?? [],
    },
    ...(templateId
      ? { template: templateId }
      : {
          content: {
            subject: `Order #${order.display_id ?? order.id} confirmed`,
            html: buildOrderHtml(order),
          },
        }),
  }

  try {
    await notificationModule.createNotifications(payload)
    logger.info(`[order-confirmation] sent email for order ${order.id}`)
  } catch (err) {
    // We caught the error so the order.placed event isn't retried forever.
    // The operator finds this in the backend logs and can re-send manually.
    logger.error(
      `[order-confirmation] failed to send email for order ${order.id}`,
      err
    )
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
  context: {
    subscriberId: "order-confirmation",
  },
}

import "server-only"
import { PostHog } from "posthog-node"
import { postHogEndpoint, postHogProjectToken } from "./posthog-identity"

type CaptureEvent = {
  event: string
  distinctId: string
  properties?: Record<string, unknown>
}

type IdentifyEvent = {
  distinctId: string
  properties?: Record<string, unknown>
}

let client: PostHog | null = null
let initFailed = false

const getClient = (): PostHog | null => {
  if (initFailed) {
    return null
  }
  if (client) {
    return client
  }
  const token = postHogProjectToken()
  if (!token) {
    initFailed = true
    return null
  }
  client = new PostHog(token, {
    host: postHogEndpoint(),
    // Server actions are short-lived. We flush per event instead of
    // waiting for the in-memory queue to fill up or the interval to
    // fire — otherwise the request can return before the event is sent.
    flushAt: 1,
    flushInterval: 0,
  })
  return client
}

const safeFlush = async (c: PostHog) => {
  try {
    await c.flush()
  } catch (err) {
    // We never want analytics errors to fail a server action — the user
    // has a working cart, that's the priority.
    if (process.env.NODE_ENV === "development") {
      console.error("[posthog] flush failed", err)
    }
  }
}

export const captureServer = async (event: CaptureEvent) => {
  const c = getClient()
  if (!c) {
    return
  }
  try {
    c.capture({
      event: event.event,
      distinctId: event.distinctId,
      properties: event.properties,
    })
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[posthog] capture failed", err)
    }
    return
  }
  await safeFlush(c)
}

export const identifyServer = async (event: IdentifyEvent) => {
  const c = getClient()
  if (!c) {
    return
  }
  try {
    c.identify({
      distinctId: event.distinctId,
      properties: event.properties,
    })
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[posthog] identify failed", err)
    }
    return
  }
  await safeFlush(c)
}

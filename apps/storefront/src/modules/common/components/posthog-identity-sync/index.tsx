"use client"

import { useEffect } from "react"
import posthog from "posthog-js"

/**
 * Reads the server-issued PostHog distinct ID cookie and calls
 * `posthog.identify()` so the browser-side event stream lines up
 * with the server-action event stream. We never reset on this
 * component — explicit sign-out calls `posthog.reset()` from the
 * account-nav button.
 *
 * The cookie is the same one `lib/posthog-identity.ts` writes from
 * server actions and the same one posthog-js itself uses (because
 * of the `cookie_name: "ph_distinct_id"` in instrumentation-client).
 * That keeps the ID consistent across both sides without manual sync.
 */
export default function PostHogIdentitySync() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) {
      return
    }
    const match = document.cookie
      .split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("ph_distinct_id="))
    if (!match) {
      return
    }
    const distinctId = match.substring("ph_distinct_id=".length)
    if (!distinctId) {
      return
    }
    // posthog-js may already have a stored ID; align them.
    const current = posthog.get_distinct_id?.()
    if (current && current !== distinctId) {
      posthog.identify(distinctId)
    } else if (!current) {
      posthog.identify(distinctId)
    }
  }, [])

  return null
}

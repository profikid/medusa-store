// Next.js calls this once per page load to bootstrap client-side
// analytics. We initialise posthog-js with the same project token that
// the server-side posthog-node client uses, so storefront-side events
// and server-action events all land in the same PostHog project.
import posthog from "posthog-js"

const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN

if (!token) {
  if (process.env.NODE_ENV === "development") {
    console.error(
      "[posthog] NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is not set; client-side analytics will be a no-op"
    )
  }
} else {
  posthog.init(token, {
    // Route through the storefront so the request is first-party and
    // does not get blocked by ad-blockers. The rewrites in
    // next.config.js forward `/ingest/*` to PostHog.
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-01-30",
    // Cookie-based persistence so the distinct ID survives across
    // navigations. The cookie name is the same one the server uses
    // when generating a fresh ID.
    cookie_name: "ph_distinct_id",
    // Identify is called explicitly when the customer logs in; we
    // never want the browser to mint its own auto-ID that drifts
    // from the server-side one.
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
    debug: process.env.NODE_ENV === "development",
  })
}

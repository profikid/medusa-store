import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import PostHogIdentitySync from "@modules/common/components/posthog-identity-sync"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <PostHogIdentitySync />
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}

"use client"

import { useEffect } from "react"
import posthog from "posthog-js"

type PostHogIdentifierProps = {
  customerId: string
  email?: string
  firstName?: string
  lastName?: string
}

export default function PostHogIdentifier({
  customerId,
  email,
  firstName,
  lastName,
}: PostHogIdentifierProps) {
  useEffect(() => {
    posthog.identify(customerId, {
      email,
      first_name: firstName,
      last_name: lastName,
    })
  }, [customerId, email, firstName, lastName])

  return null
}

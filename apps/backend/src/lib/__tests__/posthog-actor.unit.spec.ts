import {
  POSTHOG_DISTINCT_ID_METADATA_KEY,
  resolvePostHogActorId,
  buildIdentifyPayloadFromCustomer,
} from "../posthog-actor"

describe("posthog-actor", () => {
  describe("POSTHOG_DISTINCT_ID_METADATA_KEY", () => {
    it("is the storefront-side metadata key", () => {
      // Frozen into the order metadata by the storefront. Don't rename
      // without also updating apps/storefront/src/lib/posthog-identity.ts.
      expect(POSTHOG_DISTINCT_ID_METADATA_KEY).toBe("posthog_distinct_id")
    })
  })

  describe("resolvePostHogActorId", () => {
    it("returns the metadata ID when present", () => {
      const id = resolvePostHogActorId({
        metadata: { [POSTHOG_DISTINCT_ID_METADATA_KEY]: "ph_abc123" },
        customer_id: "cus_1",
        email: "a@b.com",
      })
      expect(id).toBe("ph_abc123")
    })

    it("falls back to customer:<id> when metadata is missing", () => {
      const id = resolvePostHogActorId({
        metadata: {},
        customer_id: "cus_42",
        email: "a@b.com",
      })
      expect(id).toBe("customer:cus_42")
    })

    it("falls back to email:<addr> when no customer ID is set", () => {
      const id = resolvePostHogActorId({
        metadata: null,
        customer_id: null,
        email: "user@example.com",
      })
      expect(id).toBe("email:user@example.com")
    })

    it("returns null when no source is available", () => {
      const id = resolvePostHogActorId({
        metadata: null,
        customer_id: null,
        email: null,
      })
      expect(id).toBeNull()
    })

    it("skips empty-string metadata IDs", () => {
      const id = resolvePostHogActorId({
        metadata: { [POSTHOG_DISTINCT_ID_METADATA_KEY]: "" },
        customer_id: "cus_1",
        email: "a@b.com",
      })
      expect(id).toBe("customer:cus_1")
    })

    it("ignores non-string metadata IDs", () => {
      const id = resolvePostHogActorId({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        metadata: { [POSTHOG_DISTINCT_ID_METADATA_KEY]: 42 as any },
        customer_id: "cus_1",
        email: "a@b.com",
      })
      expect(id).toBe("customer:cus_1")
    })

    it("handles non-object metadata", () => {
      expect(
        resolvePostHogActorId({
          metadata: "not-an-object",
          customer_id: "cus_1",
          email: null,
        })
      ).toBe("customer:cus_1")
      expect(
        resolvePostHogActorId({
          metadata: undefined,
          customer_id: null,
          email: "x@y.com",
        })
      ).toBe("email:x@y.com")
    })

    it("prefers metadata over customer_id, even when email is set", () => {
      // The whole point of this helper is to keep the same actor_id
      // across guest and logged-in shoppers. Switching to the email
      // once a customer signs in would split identity in PostHog.
      const id = resolvePostHogActorId({
        metadata: { [POSTHOG_DISTINCT_ID_METADATA_KEY]: "ph_xyz" },
        customer_id: "cus_99",
        email: "a@b.com",
      })
      expect(id).toBe("ph_xyz")
    })
  })

  describe("buildIdentifyPayloadFromCustomer", () => {
    it("returns null when no actor ID is available", () => {
      const payload = buildIdentifyPayloadFromCustomer({
        id: "",
        email: null,
        first_name: null,
        last_name: null,
        metadata: null,
      })
      expect(payload).toBeNull()
    })

    it("builds a payload with metadata ID as actor_id", () => {
      const payload = buildIdentifyPayloadFromCustomer({
        id: "cus_1",
        email: "a@b.com",
        first_name: "Ann",
        last_name: "Bakker",
        metadata: { [POSTHOG_DISTINCT_ID_METADATA_KEY]: "ph_aaa" },
      })
      expect(payload).toEqual({
        actor_id: "ph_aaa",
        properties: {
          email: "a@b.com",
          first_name: "Ann",
          last_name: "Bakker",
          medusa_customer_id: "cus_1",
        },
      })
    })

    it("emits undefined for missing optional fields (not null)", () => {
      const payload = buildIdentifyPayloadFromCustomer({
        id: "cus_2",
        email: null,
        first_name: null,
        last_name: null,
        metadata: null,
      })
      expect(payload).toEqual({
        actor_id: "customer:cus_2",
        properties: {
          email: undefined,
          first_name: undefined,
          last_name: undefined,
          medusa_customer_id: "cus_2",
        },
      })
    })
  })
})

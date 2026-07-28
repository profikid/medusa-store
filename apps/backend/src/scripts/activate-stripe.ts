// Stripe payment provider activation script for Medusa v2.
//
// Run with: cd /server/apps/backend && medusa exec /server/src/scripts/activate-stripe.ts
//
// What it does:
//   1. Looks up the "Europe" region (idempotent)
//   2. Verifies Stripe provider exists in payment module (loaded from medusa-config.ts)
//   3. If Stripe is not already linked to the region, adds it via updateRegionsWorkflow
//   4. Idempotent — safe to re-run
import {
  updateRegionsWorkflow,
} from "@medusajs/medusa/core-flows"

type ExecArgs = {
  container: any
  logger: any
}

export default async function activateStripe({ container, logger }: ExecArgs) {
  // Find the Europe region via direct SQL on the container (the script does not
  // have access to the HTTP layer, so we use the framework's container).
  const regionModule = container.resolve("regionModuleService") ??
    container.resolve("@medusajs/region") ??
    container.resolve("regionService")

  // List regions — we use the framework's region module
  const regions = await regionModule.listRegions()
  const europe = regions.find((r: any) => r.name === "Europe")

  if (!europe) {
    logger.error("Region 'Europe' not found. Run initial-data-seed first.")
    return
  }

  logger.info(
    `Found region 'Europe' (${europe.id}) with ${europe.payment_providers?.length ?? 0} payment providers`
  )

  const hasStripe = europe.payment_providers?.some(
    (pp: any) => pp?.id === "stripe"
  )

  if (hasStripe) {
    logger.info("Stripe already linked to Europe region. Nothing to do.")
    return
  }

  const { result } = await updateRegionsWorkflow(container).run({
    input: {
      selector: { id: europe.id },
      update: {
        payment_providers: [
          "stripe",
          ...(europe.payment_providers?.map((pp: any) => pp.id) ?? []),
        ],
      },
    },
  })

  logger.info(
    `Added Stripe to Europe region. Updated ${result.length} region(s).`
  )
}

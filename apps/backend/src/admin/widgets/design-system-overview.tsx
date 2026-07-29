import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Text } from "@medusajs/ui"
import { KPICard } from "../design-system/components"

const DesignSystemOverviewWidget = () => {
  // Display data shown on mount (no conditional enabled).
  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h2">District X</Heading>
          <Text className="text-ui-fg-subtle" size="small">
            Design system & brand — building intelligent spaces.
          </Text>
        </div>
        <a
          href="/app/design-system"
          className="text-ui-fg-interactive text-sm font-medium"
        >
          Open design system →
        </a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-6 py-4">
        <KPICard label="Tokens" value="48" sub="color · type · spacing" />
        <KPICard label="Components" value="8" sub="button · card · badge…" />
        <KPICard label="Pillars" value="3" sub="design · systems · future" />
        <KPICard label="Status" value="v1.0" sub="shipped" />
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.after",
})

export default DesignSystemOverviewWidget

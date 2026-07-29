import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { useEffect } from "react"
import { injectDXStyles } from "../design-system/inject"
import "../design-system/globals.css"

/**
 * Ship the District X stylesheet into the admin bundle.
 *
 * The `import "../design-system/globals.css"` side-effect import is the
 * mechanism. Vite/Rollup picks the CSS up and emits it as part of the
 * admin bundle, so the stylesheet loads wherever the topbar widget
 * mounts — which is on every admin page.
 *
 * `injectDXStyles` is a no-op marker today; it stays in place so future
 * invariants (e.g. applying attributes to <html> after the CSS is
 * available) can be added without re-plumbing widget signatures.
 *
 * Renders nothing visible.
 */
const DistrictXInstall = () => {
  useEffect(() => {
    injectDXStyles()
  }, [])

  return null
}

export const config = defineWidgetConfig({
  zone: "topbar",
})

export default DistrictXInstall

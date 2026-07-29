/**
 * Inject the District X runtime override sheet into the document head.
 *
 * The static globals.css (with the .dx-* component classes) is bundled
 * into the admin CSS via Vite's side-effect import in
 * widgets/district-x-install.tsx. The override sheet, however, has to
 * load AFTER Medusa's bundled CSS. We can't reorder Vite's chunk order
 * without a custom plugin, so we inject it as a runtime <style> tag
 * once the topbar widget mounts.
 *
 * Idempotent: tagged with data-dx-override so we don't re-apply.
 *
 * The override sheet handles:
 *   - Re-pointing every Medusa UI variable (--bg-*, --fg-*, --border-*,
 *     --button-*, --tag-*, etc.) to a --dx-* source-of-truth token.
 *   - Patching Medusa-internal selectors that don't go through the
 *     variable plumbing (sidebar, page header, tables, inputs, badges,
 *     hardcoded tailwind colors).
 *   - Painting over Medusa's :root { background-color: ... } default.
 */
import css from "./override.css?raw"

const MARKER = "data-dx-override"

export const injectDXStyles = () => {
  if (typeof document === "undefined") {
    return
  }
  if (document.head.querySelector(`style[${MARKER}]`)) {
    return
  }
  const style = document.createElement("style")
  style.setAttribute(MARKER, "")
  style.appendChild(document.createTextNode(css))
  document.head.appendChild(style)
}

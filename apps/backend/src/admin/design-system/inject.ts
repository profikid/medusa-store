/**
 * Inject the District X stylesheet into the document head.
 * Idempotent — checks for an existing marker so multiple widgets/routes
 * calling inject don't double-apply.
 *
 * The CSS is loaded via the side-effect import in
 * widgets/district-x-install.tsx (`import "../globals.css"`). Vite/Rollup
 * picks that up and emits a CSS chunk for the admin bundle, so the
 * stylesheet rides along wherever the topbar widget mounts. This file
 * no longer needs to import the CSS as a string — it's already part of
 * the bundle the moment the topbar widget is loaded.
 */

const MARKER = "data-dx-installed"

export const injectDXStyles = () => {
  if (typeof document === "undefined") {
    return
  }
  if (document.documentElement.hasAttribute(MARKER)) {
    return
  }
  document.documentElement.setAttribute(MARKER, "")
}

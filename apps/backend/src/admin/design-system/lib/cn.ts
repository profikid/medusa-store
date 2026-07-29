/**
 * District X — className utility.
 * Tiny conditional joiner that drops falsy values; keeps DX components
 * composable without pulling in clsx/classnames.
 */
export type ClassValue = string | number | false | null | undefined

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ")
}

// Cross-references Panel A (internal historical matches, from src/lib/internal-matcher.ts)
// against Panel B (external Gemini trend matches, from api/agent-recommend.ts) WITHOUT
// merging them into one ranked list — the two panels stay independent; this only computes
// which specific products both agree on, so each panel can show a small "confirmed by
// both" badge on its own cards. Internal history is never re-sorted by external trend,
// and vice versa.
import type { InternalMatch } from './internal-matcher'
import type { Recommendation } from '../pages/client-form/types'

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

// A single Set holds both name-level and category-level match keys so both panels can
// query it the same way, independent of which path found the match:
// "name:{normalized}" for an exact (case-insensitive) product name match, or
// "category:{normalized}" as the fallback when names don't align but categories do.
export function computeAgreement(internal: InternalMatch[], external: Recommendation[]): Set<string> {
  const externalNameKeys = new Set(external.map((r) => `name:${normalize(r.product.name)}`))
  const externalCategoryKeys = new Set(external.map((r) => `category:${normalize(r.product.category)}`))

  const agreed = new Set<string>()
  for (const match of internal) {
    const nameKey = `name:${normalize(match.product_name)}`
    if (externalNameKeys.has(nameKey)) {
      agreed.add(nameKey)
      continue
    }
    const categoryKey = `category:${normalize(match.category)}`
    if (externalCategoryKeys.has(categoryKey)) {
      agreed.add(categoryKey)
    }
  }

  // Both catalogs are independently designed (internal = historical BrandBoost order
  // data, external = this app's own mock product catalog) — verified empirically that
  // their product names and categories don't align as exact strings today. Surface that
  // during a demo instead of silently showing "no agreement" with no explanation why.
  if (internal.length > 0 && external.length > 0 && agreed.size === 0) {
    console.warn(
      '[computeAgreement] Zero overlap between internal and external product names/categories.',
      { internalNames: internal.map((m) => m.product_name), externalNames: external.map((r) => r.product.name) },
    )
  }

  return agreed
}

export function isInternalAgreed(match: InternalMatch, agreement: Set<string>): boolean {
  return agreement.has(`name:${normalize(match.product_name)}`) || agreement.has(`category:${normalize(match.category)}`)
}

export function isExternalAgreed(rec: Recommendation, agreement: Set<string>): boolean {
  return (
    agreement.has(`name:${normalize(rec.product.name)}`) || agreement.has(`category:${normalize(rec.product.category)}`)
  )
}

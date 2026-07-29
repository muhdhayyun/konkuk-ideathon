// Shape of the cleaned JSON produced by scripts/parse-order-history.ts from
// data/BrandBoost_Order_History_2022-2026.xlsx. Shared between that script and
// internal-matcher.ts so the two never drift apart.

export type OrderOutcome = 'accepted' | 'accepted_after_revision' | 'rejected_first_round'

export interface OrderHistoryRow {
  order_id: string
  client_id: string
  industry: string
  order_date: string // "YYYY-MM-DD"
  occasion: string
  product_name: string
  category: string
  qty: number
  unit_price_krw: number
  trend_tags: string[]
  outcome: OrderOutcome
}

export interface ProductCatalogRow {
  product_name: string
  category: string
  unit_price_krw: number
  trend_tags: string[]
  peak_season: string
}

export interface ClientRow {
  client_id: string
  industry: string
  brand_tone: string
  size: string
  region: string
}

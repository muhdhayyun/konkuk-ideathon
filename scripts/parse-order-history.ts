// One-time (re-run-when-source-changes) conversion of
// data/BrandBoost_Order_History_2022-2026.xlsx into clean, static JSON that
// internal-matcher.ts reads at runtime. Never parse the xlsx at request time —
// run `npm run parse:data` manually whenever the source spreadsheet is updated.
import XLSX from 'xlsx'
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { OrderHistoryRow, ProductCatalogRow, ClientRow, OrderOutcome } from '../src/types/orderHistory.ts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const SOURCE_XLSX = join(DATA_DIR, 'BrandBoost_Order_History_2022-2026.xlsx')

const VALID_OUTCOMES: OrderOutcome[] = ['accepted', 'accepted_after_revision', 'rejected_first_round']

function splitTags(value: unknown): string[] {
  if (typeof value !== 'string' || value.trim() === '') return []
  return value.split(',').map((tag) => tag.trim()).filter(Boolean)
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim()
}

function asNumber(value: unknown, context: string): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) throw new Error(`Expected a number for ${context}, got: ${value}`)
  return n
}

function parseOrderHistory(rows: Record<string, unknown>[]): OrderHistoryRow[] {
  return rows.map((row, i) => {
    const outcome = asString(row.outcome)
    if (!VALID_OUTCOMES.includes(outcome as OrderOutcome)) {
      throw new Error(`Order_History row ${i}: unrecognized outcome "${outcome}"`)
    }
    return {
      order_id: asString(row.order_id),
      client_id: asString(row.client_id),
      industry: asString(row.industry),
      order_date: asString(row.order_date),
      occasion: asString(row.occasion),
      product_name: asString(row.product_name),
      category: asString(row.category),
      qty: asNumber(row.qty, `Order_History row ${i} qty`),
      unit_price_krw: asNumber(row.unit_price_krw, `Order_History row ${i} unit_price_krw`),
      trend_tags: splitTags(row.trend_tag),
      outcome: outcome as OrderOutcome,
    }
  })
}

function parseProductCatalog(rows: Record<string, unknown>[]): ProductCatalogRow[] {
  return rows.map((row, i) => ({
    product_name: asString(row.product_name),
    category: asString(row.category),
    unit_price_krw: asNumber(row.unit_price_krw, `Product_Catalog row ${i} unit_price_krw`),
    trend_tags: splitTags(row.trend_tags),
    peak_season: asString(row.peak_season),
  }))
}

function parseClients(rows: Record<string, unknown>[]): ClientRow[] {
  return rows.map((row) => ({
    client_id: asString(row.client_id),
    industry: asString(row.industry),
    brand_tone: asString(row.brand_tone),
    size: asString(row.size),
    region: asString(row.region),
  }))
}

function main() {
  const wb = XLSX.readFile(SOURCE_XLSX)

  const requiredSheets = ['Order_History', 'Product_Catalog', 'Clients']
  for (const name of requiredSheets) {
    if (!wb.SheetNames.includes(name)) throw new Error(`Missing expected sheet: ${name}`)
  }

  const orderHistory = parseOrderHistory(
    XLSX.utils.sheet_to_json(wb.Sheets['Order_History'], { defval: null }),
  )
  const productCatalog = parseProductCatalog(
    XLSX.utils.sheet_to_json(wb.Sheets['Product_Catalog'], { defval: null }),
  )
  const clients = parseClients(XLSX.utils.sheet_to_json(wb.Sheets['Clients'], { defval: null }))

  // Guard against discontinued items lingering in old order history: every product
  // referenced in Order_History should still exist in Product_Catalog. Warn (don't
  // fail) since internal-matcher.ts will cross-check and exclude these itself anyway.
  const catalogNames = new Set(productCatalog.map((p) => p.product_name))
  const orphaned = [...new Set(orderHistory.map((o) => o.product_name))].filter((n) => !catalogNames.has(n))
  if (orphaned.length > 0) {
    console.warn(`Warning: ${orphaned.length} product(s) in Order_History are not in Product_Catalog:`, orphaned)
  }

  writeFileSync(join(DATA_DIR, 'order-history.json'), JSON.stringify(orderHistory, null, 2))
  writeFileSync(join(DATA_DIR, 'product-catalog.json'), JSON.stringify(productCatalog, null, 2))
  writeFileSync(join(DATA_DIR, 'clients.json'), JSON.stringify(clients, null, 2))

  console.log(
    `Parsed ${orderHistory.length} orders, ${productCatalog.length} catalog items, ${clients.length} clients -> data/*.json`,
  )
}

main()

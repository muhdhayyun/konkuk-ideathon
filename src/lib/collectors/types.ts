// Shared input every collector receives. Kept intentionally small — collectors derive
// their own search terms from this, they never see the full ClientBrief or catalog.
export interface CollectorInput {
  industry: string
  occasion: string
  /** Candidate tags to probe for trend signal, derived from the client's emotional outcomes. */
  tags: string[]
}

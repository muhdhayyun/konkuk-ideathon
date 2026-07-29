// Must match the tag vocabulary actually used in src/pages/client-form/data/products.ts.
// Shared by every collector so extracted/derived tags stay comparable across sources.
export const TAG_VOCABULARY = [
  'apparel',
  'customizable',
  'eco-friendly',
  'engravable',
  'everyday',
  'experiential',
  'giftset',
  'luxury',
  'minimalist',
  'playful',
  'premium',
  'professional',
  'sustainable',
  'tech-forward',
  'wellness',
] as const

export type VocabularyTag = (typeof TAG_VOCABULARY)[number]

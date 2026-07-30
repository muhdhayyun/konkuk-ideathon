import type { Recommendation } from '../client-form/types'
import {
  STAINLESS_TUMBLER_IMAGE,
  RECYCLED_FABRIC_POUCH_IMAGE,
  SILICONE_PHONE_GRIP_IMAGE,
  DAILY_CALENDAR_SET_IMAGE,
} from './demoProductArt'

export interface DemoAgentResponse {
  recommendations: Recommendation[]
  trendSummary: string
  searchQueriesUsed: string[]
  sourcesUsed: string[]
  usedFallback: boolean
}

// Captured from a real production run of /api/agent-recommend (live Gemini + Google
// Search grounding, validated against the real product catalog) against the exact
// Instant Fill brief — not hand-written placeholder content. Used on /inquiry/recommend
// so the presenter never depends on live network/API latency during a demo; Panel A
// (getInternalMatches) stays live/real regardless, since it's local and instant.
export const DEMO_AGENT_RESPONSE: Record<'en' | 'ko', DemoAgentResponse> = {
  en: {
    recommendations: [
      {
        product: {
          id: 'Stainless Tumbler',
          name: 'Stainless Tumbler',
          category: 'Tumbler',
          basePrice: 67,
          tags: ['practical', 'minimalist'],
          trendScore: 80,
          industryFit: [],
          toneFit: [],
          minQuantity: 1,
          imageUrl: STAINLESS_TUMBLER_IMAGE,
        },
        matchScore: 95,
        reasonWhy:
          'Stainless tumblers align perfectly with the strong trend of practical, reusable drinkware that is both sustainable and useful for daily life, making them a thoughtful and modern choice for a tech conference.',
        sourceUrls: [
          'https://www.thewayo.com/blog/trending-swag-ideas',
          'https://corporategift.com/blog/corporate-gifting-trends-2026/',
        ],
      },
      {
        product: {
          id: 'Recycled Fabric Pouch',
          name: 'Recycled Fabric Pouch',
          category: 'Sustainable Goods',
          basePrice: 78,
          tags: ['sustainable', 'minimalist'],
          trendScore: 80,
          industryFit: [],
          toneFit: [],
          minQuantity: 1,
          imageUrl: RECYCLED_FABRIC_POUCH_IMAGE,
        },
        matchScore: 90,
        reasonWhy:
          'This product strongly aligns with the predominant trend of sustainable and eco-friendly merchandise, reflecting environmental stewardship and offering a practical, reusable item that tech attendees can use to organize their accessories.',
        sourceUrls: [
          'https://swag.com/blog/must-have-swag-for-techies',
          'https://www.ecologicdesigns.com/upcycled-corporate-branded-merchandise-trends-with-purpose/',
          'https://makersgarments.com/blogs/event-swag/eco-friendly-trade-show-giveaways',
        ],
      },
      {
        product: {
          id: 'Silicone Phone Grip',
          name: 'Silicone Phone Grip',
          category: 'Character Goods',
          basePrice: 34,
          tags: ['playful', 'trendy'],
          trendScore: 80,
          industryFit: [],
          toneFit: [],
          minQuantity: 1,
          imageUrl: SILICONE_PHONE_GRIP_IMAGE,
        },
        matchScore: 88,
        reasonWhy:
          "Silicone Phone Grips are a modern, playful, and tech-forward accessory that aligns with the trend of 'micro moments' and useful daily tech items, offering a fun and reusable way for attendees to engage with the brand.",
        sourceUrls: [
          'https://swag.com/blog/must-have-swag-for-techies',
          'https://corporategift.com/blog/corporate-gifting-trends-2026/',
          'https://swag.com/blog/company-swag-ideas-for-2021',
        ],
      },
    ],
    trendSummary:
      "Current corporate gifting and merch trends for tech conferences highlight a strong demand for sustainable, useful, and high-quality items that offer longevity and reduce waste. Attendees seek practical tech accessories, reusable everyday products like drinkware, and fun, modern 'micro moments' gifts that promote personal expression and engagement.",
    searchQueriesUsed: [
      'corporate gifting trends tech conference 2026',
      'merch trends sustainable tech events 2026',
      'fun energetic tech conference swag trends 2026',
      'reusable modern corporate merch trends',
      'Q2 Q3 2026 corporate gifting trends',
      'tech event giveaway ideas 2026 sustainable',
      'best corporate swag for tech companies 2026',
    ],
    sourcesUsed: [
      'https://www.thewayo.com/blog/trending-swag-ideas',
      'https://corporategift.com/blog/corporate-gifting-trends-2026/',
      'https://swag.com/blog/company-swag-ideas-for-2021',
      'https://brandmerch.com/guides/best-corporate-gifts-2026',
      'https://swag.com/blog/must-have-swag-for-techies',
      'https://foodstampsneed.com/trends-in-merchandise-what-corporate-clients-are-looking-for-this-year/',
      'https://www.ecologicdesigns.com/upcycled-corporate-branded-merchandise-trends-with-purpose/',
      'https://makersgarments.com/blogs/event-swag/eco-friendly-trade-show-giveaways',
      'https://fairware.com/2026-branded-merchandise-trends-9-corporate-merch-ideas-to-elevate-your-brand/',
    ],
    usedFallback: false,
  },
  ko: {
    recommendations: [
      {
        product: {
          id: 'Stainless Tumbler',
          name: 'Stainless Tumbler',
          category: 'Tumbler',
          basePrice: 67,
          tags: ['practical', 'minimalist'],
          trendScore: 80,
          industryFit: [],
          toneFit: [],
          minQuantity: 1,
          imageUrl: STAINLESS_TUMBLER_IMAGE,
        },
        matchScore: 95,
        reasonWhy:
          '2026년 굿즈 트렌드의 핵심 키워드인 지속가능성과 재사용성에 완벽하게 부합합니다. 스테인리스 텀블러는 환경 보호에 기여하며, 컨퍼런스 참가자들이 일상에서 유용하게 활용할 수 있어 사려 깊고 현대적인 인상을 줍니다.',
        sourceUrls: [
          'https://www.ohprint.me/blog/environment-day-eco-friendly-goods-guide-2026',
          'https://www.brandboost.kr/blog/2026-summer-goods-trend',
        ],
      },
      {
        product: {
          id: 'Recycled Fabric Pouch',
          name: 'Recycled Fabric Pouch',
          category: 'Sustainable Goods',
          basePrice: 78,
          tags: ['sustainable', 'minimalist'],
          trendScore: 80,
          industryFit: [],
          toneFit: [],
          minQuantity: 1,
          imageUrl: RECYCLED_FABRIC_POUCH_IMAGE,
        },
        matchScore: 90,
        reasonWhy:
          'ESG 경영을 중시하는 최신 기업 굿즈 트렌드에 따라, 재활용 패브릭 파우치는 기업의 친환경 가치를 전달하는 데 매우 효과적입니다. 실용적이고 재사용 가능하며 사려 깊은 선물을 찾는 고객의 요구에 부합합니다.',
        sourceUrls: [
          'http://www.plastics.kr/news/articleView.html?idxno=1689',
          'https://www.sumthing.co.kr/magazine/?bmode=view&idx=168840017',
          'https://www.sumthing.co.kr/magazine/?bmode=view&idx=168659921',
        ],
      },
      {
        product: {
          id: 'Daily Calendar Set',
          name: 'Daily Calendar Set',
          category: 'Office Goods',
          basePrice: 56,
          tags: ['classic', 'practical'],
          trendScore: 80,
          industryFit: [],
          toneFit: [],
          minQuantity: 1,
          imageUrl: DAILY_CALENDAR_SET_IMAGE,
        },
        matchScore: 80,
        reasonWhy:
          "오래 사용할 수 있는 실용적인 굿즈가 선호되는 트렌드와 잘 맞으며, '사려 깊음'을 강조하는 선물로 자리매김할 수 있습니다. 현대적인 디자인이 가미된다면 tech 클라이언트의 이미지와도 조화를 이룰 수 있습니다.",
        sourceUrls: [
          'https://www.sumthing.co.kr/magazine/?bmode=view&idx=168840017',
          'https://www.careet.net/1767',
          'https://www.sumthing.co.kr/magazine/?bmode=view&idx=167462688',
        ],
      },
    ],
    trendSummary:
      '2026년 기업 굿즈 트렌드는 지속가능성과 재사용성에 초점을 맞추고 있습니다. 친환경 소재를 사용하고 일상생활에서 반복적으로 사용할 수 있는 실용적인 제품이 선호되며, 이를 통해 기업의 ESG 가치를 전달하고 긍정적인 브랜드 이미지를 구축하는 것이 중요합니다. 또한, 단순한 기념품을 넘어 브랜드의 스토리를 담아 수령인과의 깊은 유대감을 형성하고, 현대적이고 세심한 디자인을 통해 지속적인 인상을 남기는 굿즈가 주목받고 있습니다.',
    searchQueriesUsed: [
      '최신 기업 선물 트렌드 2026',
      '친환경 기업 굿즈 트렌드 2026',
      '테크 컨퍼런스 기념품 트렌드',
      '재사용 가능 기업 선물 아이디어',
      '지속가능성 기업 굿즈',
      '재미있고 에너지 넘치는 기업 선물',
    ],
    sourcesUsed: [
      'https://www.ohprint.me/blog/environment-day-eco-friendly-goods-guide-2026',
      'https://www.brandboost.kr/blog/2026-summer-goods-trend',
      'http://www.plastics.kr/news/articleView.html?idxno=1689',
      'https://www.sumthing.co.kr/magazine/?bmode=view&idx=168840017',
      'https://www.sumthing.co.kr/magazine/?bmode=view&idx=168659921',
      'https://www.careet.net/1767',
      'https://www.sumthing.co.kr/magazine/?bmode=view&idx=167462688',
    ],
    usedFallback: false,
  },
}

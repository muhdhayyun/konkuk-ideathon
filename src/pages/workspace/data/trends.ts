// 내부 주문 데이터 기반 소셜 프루프 목데이터.
// 실제로는 백엔드에서 주문 테이블을 집계해 내려줄 값이며,
// API 연동 시 이 인터페이스 형태 그대로 응답을 받도록 설계한다.
// (아직 실데이터 스키마가 미정이므로, 집계 결과물 관점에서만 구조를 고정)

import { PORTFOLIO, type PortfolioItem } from './portfolio'

// 개인화 기준이 되는 회사 프로필. 실서비스에서는 로그인 회사 정보에서 온다.
export interface CompanyProfile {
  industry: string // 업종 (예: 'F&B · 카페')
  sizeBand: string // 규모 밴드 (예: '11~50인')
}

// 집계 기간 내 특정 품목의 주문 트렌드 한 건.
export interface OrderTrendItem {
  portfolioId: number // PORTFOLIO 품목 참조
  orderCount: number // 집계 기간 내 주문 건수
  deltaPct: number // 직전 동일 기간 대비 증감률(%)
  orderedBy: string // 마스킹된 주문 회사 요약 (예: '주식회사 D** 외 5곳')
}

export interface InternalTrends {
  periodLabel: string // 집계 기간 라벨 (예: '최근 2주')
  viewer: CompanyProfile // 현재 보고 있는 회사의 프로필 (개인화 키)
  peerPicks: OrderTrendItem[] // 비슷한 규모·업종 회사들이 주문한 품목
  popularNow: OrderTrendItem[] // 전체 주문량 상위 품목
}

export const INTERNAL_TRENDS: InternalTrends = {
  periodLabel: '최근 2주',
  viewer: { industry: 'F&B · 카페', sizeBand: '11~50인' },
  peerPicks: [
    { portfolioId: 1205, orderCount: 14, deltaPct: 40, orderedBy: '주식회사 D** 외 5곳' },
    { portfolioId: 1204, orderCount: 11, deltaPct: 22, orderedBy: '카페 브** 외 4곳' },
    { portfolioId: 1209, orderCount: 8, deltaPct: 60, orderedBy: '주식회사 M** 외 2곳' },
  ],
  popularNow: [
    { portfolioId: 1208, orderCount: 32, deltaPct: 12, orderedBy: '주식회사 K** 외 12곳' },
    { portfolioId: 1211, orderCount: 21, deltaPct: 75, orderedBy: '주식회사 S** 외 7곳' },
    { portfolioId: 1210, orderCount: 17, deltaPct: 8, orderedBy: '주식회사 H** 외 6곳' },
  ],
}

// 트렌드 항목에 품목 정보를 붙인 조회 결과.
export interface ResolvedTrendItem extends OrderTrendItem {
  item: PortfolioItem
}

export function resolveTrendItems(items: OrderTrendItem[]): ResolvedTrendItem[] {
  return items.flatMap((t) => {
    const item = PORTFOLIO.find((p) => p.id === t.portfolioId)
    return item ? [{ ...t, item }] : []
  })
}

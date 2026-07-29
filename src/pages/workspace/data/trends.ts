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

// ─── 발주 근거 리포트 ───────────────────────────────────────────
// 문의 완료 후 "왜 이 선택이 좋은가"를 정리해주는 리포트용 근거 데이터.
// 외부(유튜브/네이버) 수치는 목데이터이며, 팀의 외부 트렌드 API 연동 시
// source별로 실값을 채워 넣는 구조.

export type EvidenceSource = '내부 주문 데이터' | '유튜브' | '네이버 데이터랩'

export interface TrendEvidence {
  source: EvidenceSource
  headline: string // 예: '동종업계 주문 1위'
  detail: string // 예: '최근 2주 F&B · 카페 업종 주문 14건'
  deltaPct?: number // 직전 동일 기간 대비 증감률(%)
}

export interface ProductTrendReport {
  productName: string // 문의서에 입력된 제품명 (자유 입력)
  item?: PortfolioItem // 포트폴리오 매칭 결과. 없으면 일반 근거로 대체
  evidence: TrendEvidence[]
  verdict: string // 한 줄 결론
}

// 카테고리별 외부 트렌드 신호 목데이터.
const EXTERNAL_BY_CATEGORY: Record<
  string,
  { youtube: TrendEvidence; naver: TrendEvidence }
> = {
  의류: {
    youtube: {
      source: '유튜브',
      headline: "'단체티 제작' 콘텐츠 조회수 상승",
      detail: '최근 4주 관련 영상 업로드 128건, 평균 조회수 상승세',
      deltaPct: 34,
    },
    naver: {
      source: '네이버 데이터랩',
      headline: "'커스텀 티셔츠' 검색량 상승",
      detail: '패션의류 분야 클릭 트렌드 상위권 유지',
      deltaPct: 21,
    },
  },
  '패키지 · 인쇄': {
    youtube: {
      source: '유튜브',
      headline: '언박싱 · 브랜딩 콘텐츠 수요 지속',
      detail: "'브랜드 패키지' 관련 영상 노출 증가",
      deltaPct: 18,
    },
    naver: {
      source: '네이버 데이터랩',
      headline: "'굿즈 스티커' 검색량 상승",
      detail: '생활/건강 분야 클릭 트렌드 상승세',
      deltaPct: 27,
    },
  },
  '액세서리 · 굿즈': {
    youtube: {
      source: '유튜브',
      headline: '행사 · 콘서트 굿즈 콘텐츠 급상승',
      detail: "'응원봉' 관련 쇼츠 조회수 급증",
      deltaPct: 52,
    },
    naver: {
      source: '네이버 데이터랩',
      headline: "'커스텀 굿즈' 검색량 상승",
      detail: '취미/문구 분야 클릭 트렌드 상위권',
      deltaPct: 30,
    },
  },
  패브릭: {
    youtube: {
      source: '유튜브',
      headline: '에코백 스타일링 콘텐츠 증가',
      detail: "'에코백 커스텀' 관련 영상 꾸준한 업로드",
      deltaPct: 15,
    },
    naver: {
      source: '네이버 데이터랩',
      headline: "'캔버스백' 검색량 완만한 상승",
      detail: '패션잡화 분야 클릭 트렌드 상승세',
      deltaPct: 12,
    },
  },
}

// 카테고리 매핑이 없을 때 쓰는 일반 외부 신호.
const EXTERNAL_FALLBACK: TrendEvidence[] = [
  {
    source: '유튜브',
    headline: '기업 굿즈 · 웰컴키트 콘텐츠 수요 지속',
    detail: "'회사 굿즈' 관련 영상 업로드 꾸준히 증가",
    deltaPct: 14,
  },
  {
    source: '네이버 데이터랩',
    headline: "'판촉물 제작' 검색량 안정적 유지",
    detail: '비즈니스 분야 클릭 트렌드 상위권',
    deltaPct: 9,
  },
]

// 자유 입력 제품명을 포트폴리오 품목과 느슨하게 매칭한다 (공백 무시, 부분 일치).
function matchPortfolioItem(productName: string): PortfolioItem | undefined {
  const key = productName.replace(/\s/g, '')
  if (key === '') return undefined
  return PORTFOLIO.find((p) => {
    const name = p.name.replace(/\s/g, '')
    return name.includes(key) || key.includes(name)
  })
}

export function buildTrendReport(productName: string): ProductTrendReport {
  const item = matchPortfolioItem(productName)
  const { viewer, periodLabel, peerPicks, popularNow } = INTERNAL_TRENDS
  const evidence: TrendEvidence[] = []

  // 내부 근거: 전체 인기 순위 → 피어 주문 → 일반 폴백 순으로 쌓는다.
  const popularRank = item ? popularNow.findIndex((t) => t.portfolioId === item.id) : -1
  if (item && popularRank >= 0) {
    const t = popularNow[popularRank]
    evidence.push({
      source: '내부 주문 데이터',
      headline: `전체 주문 인기 ${popularRank + 1}위`,
      detail: `${periodLabel} 전체 주문 ${t.orderCount}건 (${t.orderedBy})`,
      deltaPct: t.deltaPct,
    })
  }
  const peer = item ? peerPicks.find((t) => t.portfolioId === item.id) : undefined
  if (item && peer) {
    evidence.push({
      source: '내부 주문 데이터',
      headline: `${viewer.industry} · ${viewer.sizeBand} 규모 기업이 선택`,
      detail: `${periodLabel} 비슷한 프로필 기업 주문 ${peer.orderCount}건 (${peer.orderedBy})`,
      deltaPct: peer.deltaPct,
    })
  }
  if (evidence.length === 0) {
    evidence.push({
      source: '내부 주문 데이터',
      headline: '꾸준한 수요가 확인되는 품목군',
      detail: `최근 90일 주문 데이터 기준, 유사 품목군의 재주문율이 안정적입니다`,
    })
  }

  // 외부 근거: 카테고리 매핑 → 일반 폴백.
  const external = item ? EXTERNAL_BY_CATEGORY[item.category] : undefined
  if (external) {
    evidence.push(external.youtube, external.naver)
  } else {
    evidence.push(...EXTERNAL_FALLBACK)
  }

  const strongest = evidence.reduce((a, b) =>
    (b.deltaPct ?? 0) > (a.deltaPct ?? 0) ? b : a,
  )
  const verdict = item
    ? `'${item.name}'은(는) ${periodLabel} 내부 주문과 외부 검색 트렌드가 함께 상승 중인 품목으로, 현 시점 발주 근거가 충분합니다.`
    : `'${productName}'은(는) 관련 품목군의 수요와 외부 트렌드(${strongest.headline})를 고려할 때 무리 없는 선택입니다.`

  return { productName, item, evidence, verdict }
}

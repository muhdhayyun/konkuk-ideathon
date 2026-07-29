// 브랜드부스트 워크스페이스 클론용 목데이터.
// 실제 서비스의 이미지/문구 원본 대신 플레이스홀더(그라데이션+이모지)를 사용한다.

export const CATEGORIES = [
  '전체',
  '의류',
  '패브릭',
  '가전 · 디지털',
  '패키지 · 인쇄',
  '액세서리 · 굿즈',
  '사무 · 리빙',
  '공간 · 설치',
] as const

export type Category = (typeof CATEGORIES)[number]

export interface ProcessStep {
  name: string
  partner: string
  duration: string
  days: string
}

export interface SpecItem {
  label: string
  value: string
}

export interface PortfolioItem {
  id: number
  name: string
  category: Exclude<Category, '전체'>
  emoji: string
  gradient: string
  tall: boolean
  description: string[]
  unitPrice: number
  priceBasis: string
  leadTime: string
  process: ProcessStep[]
  draftSpecs: SpecItem[]
  editableSpecs: SpecItem[]
}

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: 1136,
    name: '벽걸이 캘린더',
    category: '사무 · 리빙',
    emoji: '📅',
    gradient: 'from-indigo-100 to-sky-100',
    tall: true,
    description: [
      '고평량 백색 용지에 양면 컬러로 제작된 벽걸이형 캘린더입니다.',
      '12개월 달력과 표지로 구성되며, 상단 고리 가공으로 벽걸이 사용이 가능합니다.',
      '4도 디지털인쇄 방식으로 표지 디자인 자유 변경 및 브랜드 컬러 반영이 가능합니다.',
    ],
    unitPrice: 6500,
    priceBasis: '100개 기준',
    leadTime: '5~7일',
    process: [
      { name: '표지 및 내지 인쇄', partner: '인쇄 파트너', duration: '2~3 days', days: '3일' },
      { name: '고리 천공 및 제본', partner: '인쇄 파트너', duration: '2~3 days', days: '3일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '표지 디자인', value: '인쇄 디자인.png' },
      { label: '고리 색상', value: '실버' },
    ],
    editableSpecs: [
      { label: '내지 용지', value: '모조지 120g' },
      { label: '사이즈', value: '210 x 420mm' },
    ],
  },
  {
    id: 1201,
    name: '스프링 노트',
    category: '사무 · 리빙',
    emoji: '📒',
    gradient: 'from-orange-100 to-rose-100',
    tall: true,
    description: [
      '트윈 스프링 제본으로 제작된 A5 스프링 노트입니다.',
      '표지 4도 인쇄, 내지 1도 인쇄로 브랜드 아이덴티티를 반영할 수 있습니다.',
      '내지 구성(유선/무선/도트)을 자유롭게 선택할 수 있습니다.',
    ],
    unitPrice: 3200,
    priceBasis: '300개 기준',
    leadTime: '6~8일',
    process: [
      { name: '표지 및 내지 인쇄', partner: '인쇄 파트너', duration: '2~3 days', days: '3일' },
      { name: '스프링 제본', partner: '제본 파트너', duration: '2~3 days', days: '3일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '표지 디자인', value: '표지 시안.ai' },
      { label: '스프링 색상', value: '블랙' },
    ],
    editableSpecs: [
      { label: '내지 타입', value: '유선 / 무선 / 도트' },
      { label: '페이지 수', value: '80p ~ 160p' },
    ],
  },
  {
    id: 1202,
    name: '중철 노트',
    category: '사무 · 리빙',
    emoji: '📔',
    gradient: 'from-teal-100 to-emerald-100',
    tall: false,
    description: [
      '중철(스테이플) 제본 방식의 슬림한 노트입니다.',
      '가볍고 단가가 낮아 대량 배포용 굿즈로 적합합니다.',
    ],
    unitPrice: 1800,
    priceBasis: '500개 기준',
    leadTime: '4~6일',
    process: [
      { name: '표지 및 내지 인쇄', partner: '인쇄 파트너', duration: '2 days', days: '2일' },
      { name: '중철 제본 및 재단', partner: '인쇄 파트너', duration: '2 days', days: '2일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '표지 디자인', value: '표지 시안.png' },
    ],
    editableSpecs: [
      { label: '사이즈', value: 'A5 / B6' },
      { label: '표지 용지', value: '아트지 250g' },
    ],
  },
  {
    id: 1203,
    name: '아크릴 응원봉(평면)',
    category: '액세서리 · 굿즈',
    emoji: '🪄',
    gradient: 'from-violet-200 to-fuchsia-100',
    tall: true,
    description: [
      '투명 아크릴에 UV 인쇄를 적용한 평면형 응원봉입니다.',
      'LED 손잡이 결합으로 콘서트/행사용 응원 굿즈로 활용됩니다.',
    ],
    unitPrice: 8900,
    priceBasis: '200개 기준',
    leadTime: '7~10일',
    process: [
      { name: '아크릴 재단 및 UV 인쇄', partner: '아크릴 파트너', duration: '3~4 days', days: '4일' },
      { name: 'LED 손잡이 조립', partner: '조립 파트너', duration: '2~3 days', days: '3일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '아크릴 디자인', value: '응원봉 시안.ai' },
      { label: 'LED 색상', value: '웜화이트' },
    ],
    editableSpecs: [
      { label: '아크릴 두께', value: '3T / 5T' },
      { label: '손잡이 타입', value: '기본형 / 버튼형' },
    ],
  },
  {
    id: 1204,
    name: '종이 스티커',
    category: '패키지 · 인쇄',
    emoji: '🌸',
    gradient: 'from-amber-50 to-lime-100',
    tall: true,
    description: [
      '유광/무광 코팅 선택이 가능한 도무송 종이 스티커입니다.',
      '자유형 칼선으로 원하는 모양대로 제작할 수 있습니다.',
    ],
    unitPrice: 450,
    priceBasis: '1,000매 기준',
    leadTime: '3~5일',
    process: [
      { name: '인쇄 및 코팅', partner: '인쇄 파트너', duration: '2 days', days: '2일' },
      { name: '도무송 재단', partner: '인쇄 파트너', duration: '1~2 days', days: '2일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '스티커 디자인', value: '스티커 시안.pdf' },
      { label: '코팅', value: '무광' },
    ],
    editableSpecs: [
      { label: '용지', value: '아트지 / 모조지 / 크라프트' },
      { label: '사이즈', value: '최대 A4' },
    ],
  },
  {
    id: 1205,
    name: '스탬프 적립 카드',
    category: '패키지 · 인쇄',
    emoji: '☕',
    gradient: 'from-stone-100 to-emerald-50',
    tall: false,
    description: [
      '카페/매장용 스탬프 적립 카드입니다.',
      '양면 4도 인쇄, 명함 사이즈 기본 규격으로 제작됩니다.',
    ],
    unitPrice: 120,
    priceBasis: '2,000매 기준',
    leadTime: '2~4일',
    process: [
      { name: '양면 인쇄', partner: '인쇄 파트너', duration: '1~2 days', days: '2일' },
      { name: '재단', partner: '인쇄 파트너', duration: '1 day', days: '1일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '카드 디자인', value: '카드 시안.png' },
    ],
    editableSpecs: [
      { label: '용지', value: '스노우지 300g' },
      { label: '사이즈', value: '90 x 54mm' },
    ],
  },
  {
    id: 1206,
    name: '일반 쿠폰',
    category: '패키지 · 인쇄',
    emoji: '🎟️',
    gradient: 'from-sky-50 to-indigo-100',
    tall: false,
    description: [
      '행사/프로모션용 쿠폰입니다.',
      '절취선(미싱) 가공 및 넘버링 옵션을 지원합니다.',
    ],
    unitPrice: 90,
    priceBasis: '3,000매 기준',
    leadTime: '2~4일',
    process: [
      { name: '인쇄', partner: '인쇄 파트너', duration: '1~2 days', days: '2일' },
      { name: '미싱 및 넘버링', partner: '인쇄 파트너', duration: '1 day', days: '1일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '쿠폰 디자인', value: '쿠폰 시안.pdf' },
    ],
    editableSpecs: [
      { label: '넘버링', value: '적용 / 미적용' },
      { label: '사이즈', value: '180 x 60mm' },
    ],
  },
  {
    id: 1207,
    name: '상장 및 내지',
    category: '패키지 · 인쇄',
    emoji: '🏆',
    gradient: 'from-yellow-50 to-amber-100',
    tall: false,
    description: [
      '시상식/행사용 상장과 내지 세트입니다.',
      '금박/은박 후가공으로 고급스러운 마감이 가능합니다.',
    ],
    unitPrice: 2500,
    priceBasis: '100매 기준',
    leadTime: '4~6일',
    process: [
      { name: '인쇄', partner: '인쇄 파트너', duration: '2 days', days: '2일' },
      { name: '박 후가공', partner: '후가공 파트너', duration: '1~2 days', days: '2일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '상장 디자인', value: '상장 시안.ai' },
      { label: '박 색상', value: '금박' },
    ],
    editableSpecs: [
      { label: '용지', value: '몽블랑 210g' },
      { label: '사이즈', value: 'A4' },
    ],
  },
  {
    id: 1208,
    name: '반팔 티셔츠',
    category: '의류',
    emoji: '👕',
    gradient: 'from-slate-100 to-blue-100',
    tall: true,
    description: [
      '20수 면 원단의 기본핏 반팔 티셔츠입니다.',
      '실크스크린/DTF 인쇄로 로고 및 그래픽을 반영할 수 있습니다.',
      '단체복, 행사복, 굿즈용으로 가장 수요가 많은 품목입니다.',
    ],
    unitPrice: 7800,
    priceBasis: '100장 기준',
    leadTime: '5~7일',
    process: [
      { name: '원단 발주 및 검수', partner: '원단 파트너', duration: '1~2 days', days: '2일' },
      { name: '나염 인쇄', partner: '나염 파트너', duration: '2~3 days', days: '3일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '프린트 디자인', value: '로고 시안.ai' },
      { label: '원단 색상', value: '화이트' },
    ],
    editableSpecs: [
      { label: '원단', value: '20수 / 30수' },
      { label: '인쇄 방식', value: '실크스크린 / DTF' },
    ],
  },
  {
    id: 1209,
    name: '캔버스 에코백',
    category: '패브릭',
    emoji: '👜',
    gradient: 'from-lime-50 to-teal-100',
    tall: false,
    description: [
      '10수 캔버스 원단의 에코백입니다.',
      '실크스크린 1~2도 인쇄로 브랜드 로고를 반영합니다.',
    ],
    unitPrice: 4200,
    priceBasis: '200개 기준',
    leadTime: '6~8일',
    process: [
      { name: '원단 재단 및 봉제', partner: '봉제 파트너', duration: '3 days', days: '3일' },
      { name: '실크스크린 인쇄', partner: '나염 파트너', duration: '2 days', days: '2일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '프린트 디자인', value: '로고 시안.png' },
    ],
    editableSpecs: [
      { label: '원단 색상', value: '네추럴 / 블랙' },
      { label: '사이즈', value: '350 x 400mm' },
    ],
  },
  {
    id: 1210,
    name: '보조배터리',
    category: '가전 · 디지털',
    emoji: '🔋',
    gradient: 'from-zinc-100 to-slate-200',
    tall: false,
    description: [
      '10,000mAh 보조배터리에 UV 인쇄로 로고를 새기는 커스텀 굿즈입니다.',
      'KC 인증 완제품 기반으로 안전하게 제작됩니다.',
    ],
    unitPrice: 15500,
    priceBasis: '100개 기준',
    leadTime: '7~10일',
    process: [
      { name: '완제품 수급', partner: '수입 파트너', duration: '3~4 days', days: '4일' },
      { name: 'UV 로고 인쇄', partner: '인쇄 파트너', duration: '2~3 days', days: '3일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '로고 디자인', value: '로고.ai' },
      { label: '본체 색상', value: '화이트' },
    ],
    editableSpecs: [
      { label: '용량', value: '5,000 / 10,000mAh' },
      { label: '패키지', value: '기본 박스 / 커스텀 박스' },
    ],
  },
  {
    id: 1211,
    name: '기프트 패키지 박스',
    category: '패키지 · 인쇄',
    emoji: '🎁',
    gradient: 'from-rose-50 to-orange-100',
    tall: true,
    description: [
      '선물 구성용 싸바리(합지) 박스입니다.',
      '내부 트레이 커스텀으로 구성품에 딱 맞는 패키지를 제작합니다.',
    ],
    unitPrice: 5400,
    priceBasis: '300개 기준',
    leadTime: '8~12일',
    process: [
      { name: '목형 제작', partner: '패키지 파트너', duration: '2~3 days', days: '3일' },
      { name: '인쇄 및 합지', partner: '패키지 파트너', duration: '3~4 days', days: '4일' },
      { name: '조립 및 검수', partner: '패키지 파트너', duration: '2~3 days', days: '3일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '박스 디자인', value: '패키지 시안.ai' },
      { label: '내부 트레이', value: 'EVA 폼' },
    ],
    editableSpecs: [
      { label: '사이즈', value: '자유 규격' },
      { label: '후가공', value: '무광 코팅 / 박' },
    ],
  },
  {
    id: 1212,
    name: '현수막 및 배너',
    category: '공간 · 설치',
    emoji: '🪧',
    gradient: 'from-cyan-50 to-blue-100',
    tall: false,
    description: [
      '행사장/매장용 현수막과 X배너입니다.',
      '실사 출력 후 거치대 포함 구성으로 배송됩니다.',
    ],
    unitPrice: 18000,
    priceBasis: '10개 기준',
    leadTime: '2~3일',
    process: [
      { name: '실사 출력', partner: '출력 파트너', duration: '1 day', days: '1일' },
      { name: '마감 가공', partner: '출력 파트너', duration: '1 day', days: '1일' },
      { name: '출고 및 패킹', partner: '브랜드부스트', duration: '1 day', days: '1일' },
    ],
    draftSpecs: [
      { label: '출력 디자인', value: '배너 시안.pdf' },
    ],
    editableSpecs: [
      { label: '사이즈', value: '600 x 1800mm 외' },
      { label: '거치대', value: '포함 / 미포함' },
    ],
  },
]

export const USER_NAME = '김병진'

export const COMPANY_INFO = {
  name: '주식회사 OOO',
  ceo: '대표자명',
  address: '서울특별시 광진구 능동로 120',
  tel: '02-0000-0000',
  hours: '평일 10:00 ~ 19:00',
  email: 'business@example.com',
  bizNo: '000-00-00000',
  mailOrderNo: '제 0000-서울광진-0000호',
}

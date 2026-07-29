export type Language = 'en' | 'ko'

export const translations = {
  en: {
    // Home
    'home.subtitle': 'Prototype pages',
    'home.local': 'BrandBoost Product Matcher — fast local version (/client-form)',
    'home.live': 'BrandBoost Product Matcher — live AI agent version (/ai-agent)',

    // Headers / nav
    'header.local': 'BrandBoost Product Matcher',
    'header.live': 'BrandBoost Product Matcher — Live Agent',
    'nav.switchToLive': 'Try the live AI agent version',
    'nav.switchToLocal': 'Switch to fast local version',

    // Wizard chrome
    'wizard.stepOf': 'Step {current} of {total}',
    'wizard.instantFill': 'Instant fill (testing)',
    'wizard.back': 'Back',
    'wizard.next': 'Next',
    'wizard.review': 'Review',
    'wizard.step1.title': 'Client profile',
    'wizard.step1.industry': 'Industry',
    'wizard.step1.brandTone': 'Brand tone',
    'wizard.step1.companySize': 'Company size',
    'wizard.step2.title': 'Occasion',
    'wizard.step3.title': 'Recipient',
    'wizard.step4.title': 'Budget',
    'wizard.step4.perUnit': 'Per-unit budget',
    'wizard.step4.quantity': 'Quantity',
    'wizard.step5.title': 'Desired emotional outcome',
    'wizard.step5.subtitle': 'Select all that apply — this drives the recommendation logic.',
    'wizard.step5.notes': 'Anything else? (optional)',

    // Summary
    'summary.title': 'Review your answers',
    'summary.clientProfile': 'Client profile',
    'summary.occasion': 'Occasion',
    'summary.recipient': 'Recipient',
    'summary.budget': 'Budget',
    'summary.emotionalOutcome': 'Emotional outcome',
    'summary.notes': 'Notes',
    'summary.qty': 'Qty',
    'summary.perUnit': 'per unit',
    'summary.findProducts': 'Find my products',

    // Results
    'results.title': 'Recommended products',
    'results.startOver': 'Start over',
    'results.empty': 'No eligible products left for this brief — try adjusting the budget or quantity.',
    'results.matchScore': 'Match score',
    'results.requestSample': 'Request sample',
    'results.sampleRequested': 'Sample requested',
    'results.notQuite': 'Not quite — show me more like this',
    'results.reject': 'Reject',
    'results.trending': 'Trending',
    'results.sourcedFrom': 'Sourced from:',

    // Insights
    'insights.title': 'Insights (accepted vs. rejected by tag)',
    'insights.accepted': 'accepted',
    'insights.rejected': 'rejected',

    // Agent
    'agent.trendSummary': 'Trend summary',
    'agent.searchedFor': 'What the agent actually searched',
    'agent.sourcesCited': 'Sources cited ({count})',
    'agent.hideSources': 'Hide sources',
    'agent.usingCached': 'Using cached matching (live search unavailable)',
    'agent.loading1': 'Searching for current trends...',
    'agent.loading2': 'Matching against catalog...',
    'agent.loading3': 'Still working — live search can take up to a minute...',
    'agent.elapsed': '{seconds}s elapsed',
    'agent.somethingWentWrong': 'Something went wrong reaching the agent.',
    'agent.radarTitle': 'Trend Radar',
    'agent.liveBadge': 'LIVE',
    'agent.cachedBadge': 'CACHED',
    'agent.searchedLive': 'Searched live',

    // Options — industries
    'option.Finance/Asset Management': 'Finance/Asset Management',
    'option.Tech': 'Tech',
    'option.Healthcare': 'Healthcare',
    'option.Retail': 'Retail',
    'option.Professional Services': 'Professional Services',
    'option.Manufacturing': 'Manufacturing',
    'option.Other': 'Other',
    // brand tones
    'option.Formal/Corporate': 'Formal/Corporate',
    'option.Modern/Minimal': 'Modern/Minimal',
    'option.Playful/Energetic': 'Playful/Energetic',
    'option.Luxury/Premium': 'Luxury/Premium',
    // company sizes
    'option.Startup (<50)': 'Startup (<50)',
    'option.Mid-size (50-500)': 'Mid-size (50-500)',
    'option.Enterprise (500+)': 'Enterprise (500+)',
    // occasions
    'option.Welcome/Onboarding kit': 'Welcome/Onboarding kit',
    'option.VIP/Client gift': 'VIP/Client gift',
    'option.Conference/Event swag': 'Conference/Event swag',
    'option.Uniform/Apparel program': 'Uniform/Apparel program',
    'option.Holiday gift': 'Holiday gift',
    'option.Employee recognition': 'Employee recognition',
    // recipients
    'option.Internal employees': 'Internal employees',
    'option.External VIP clients': 'External VIP clients',
    'option.General public/attendees': 'General public/attendees',
    'option.Executive leadership': 'Executive leadership',
    // budget tiers
    'option.Under $20': 'Under $20',
    'option.$20-50': '$20-50',
    'option.$50-100': '$50-100',
    'option.$100-250': '$100-250',
    'option.$250+': '$250+',
    // emotional outcomes
    'option.Feels personalized': 'Feels personalized',
    'option.Feels premium/prestigious': 'Feels premium/prestigious',
    'option.Feels fun/energetic': 'Feels fun/energetic',
    'option.Feels sustainable/thoughtful': 'Feels sustainable/thoughtful',
    'option.Feels professional/polished': 'Feels professional/polished',

    // Product categories (used in matcher.ts fallback reasonWhy)
    'category.Apparel': 'Apparel',
    'category.Drinkware': 'Drinkware',
    'category.Event Swag': 'Event Swag',
    'category.Premium Gift Set': 'Premium Gift Set',
    'category.Sustainable': 'Sustainable',
    'category.Tech Accessories': 'Tech Accessories',
    'category.Welcome Kit': 'Welcome Kit',
    'category.Wellness': 'Wellness',
  },
  ko: {
    // Home
    'home.subtitle': '프로토타입 페이지',
    'home.local': 'BrandBoost 제품 매칭 — 빠른 로컬 버전 (/client-form)',
    'home.live': 'BrandBoost 제품 매칭 — 실시간 AI 에이전트 버전 (/ai-agent)',

    // Headers / nav
    'header.local': 'BrandBoost 제품 매칭',
    'header.live': 'BrandBoost 제품 매칭 — 실시간 에이전트',
    'nav.switchToLive': '실시간 AI 에이전트 버전 사용해보기',
    'nav.switchToLocal': '빠른 로컬 버전으로 전환',

    // Wizard chrome
    'wizard.stepOf': '{total}단계 중 {current}단계',
    'wizard.instantFill': '즉시 채우기 (테스트용)',
    'wizard.back': '이전',
    'wizard.next': '다음',
    'wizard.review': '검토',
    'wizard.step1.title': '고객 프로필',
    'wizard.step1.industry': '업종',
    'wizard.step1.brandTone': '브랜드 톤',
    'wizard.step1.companySize': '회사 규모',
    'wizard.step2.title': '행사 종류',
    'wizard.step3.title': '수령 대상',
    'wizard.step4.title': '예산',
    'wizard.step4.perUnit': '단가 예산',
    'wizard.step4.quantity': '수량',
    'wizard.step5.title': '원하는 감정적 효과',
    'wizard.step5.subtitle': '해당하는 항목을 모두 선택하세요 — 추천 로직에 반영됩니다.',
    'wizard.step5.notes': '추가로 전달할 내용이 있나요? (선택 사항)',

    // Summary
    'summary.title': '답변 검토',
    'summary.clientProfile': '고객 프로필',
    'summary.occasion': '행사 종류',
    'summary.recipient': '수령 대상',
    'summary.budget': '예산',
    'summary.emotionalOutcome': '감정적 효과',
    'summary.notes': '메모',
    'summary.qty': '수량',
    'summary.perUnit': '개당',
    'summary.findProducts': '제품 찾기',

    // Results
    'results.title': '추천 제품',
    'results.startOver': '처음부터 다시',
    'results.empty': '이 조건에 맞는 제품이 없습니다 — 예산이나 수량을 조정해보세요.',
    'results.matchScore': '적합도 점수',
    'results.requestSample': '샘플 요청',
    'results.sampleRequested': '샘플 요청됨',
    'results.notQuite': '조금 다른 느낌으로 — 비슷한 다른 제품 보기',
    'results.reject': '거절',
    'results.trending': '인기 상승 중',
    'results.sourcedFrom': '출처:',

    // Insights
    'insights.title': '인사이트 (태그별 수락 대 거절)',
    'insights.accepted': '수락',
    'insights.rejected': '거절',

    // Agent
    'agent.trendSummary': '트렌드 요약',
    'agent.searchedFor': '에이전트가 실제로 검색한 내용',
    'agent.sourcesCited': '인용된 출처 ({count})',
    'agent.hideSources': '출처 숨기기',
    'agent.usingCached': '캐시된 매칭 사용 중 (실시간 검색 불가)',
    'agent.loading1': '최신 트렌드 검색 중...',
    'agent.loading2': '카탈로그와 매칭 중...',
    'agent.loading3': '아직 진행 중입니다 — 실시간 검색은 최대 1분까지 걸릴 수 있어요...',
    'agent.elapsed': '{seconds}초 경과',
    'agent.somethingWentWrong': '에이전트에 연결하는 중 문제가 발생했습니다.',
    'agent.radarTitle': '트렌드 레이더',
    'agent.liveBadge': '실시간',
    'agent.cachedBadge': '캐시됨',
    'agent.searchedLive': '실시간 검색됨',

    // Options — industries
    'option.Finance/Asset Management': '금융/자산 운용',
    'option.Tech': '테크',
    'option.Healthcare': '헬스케어',
    'option.Retail': '리테일',
    'option.Professional Services': '전문 서비스',
    'option.Manufacturing': '제조업',
    'option.Other': '기타',
    // brand tones
    'option.Formal/Corporate': '포멀/기업형',
    'option.Modern/Minimal': '모던/미니멀',
    'option.Playful/Energetic': '경쾌/활기참',
    'option.Luxury/Premium': '럭셔리/프리미엄',
    // company sizes
    'option.Startup (<50)': '스타트업 (50명 미만)',
    'option.Mid-size (50-500)': '중견기업 (50-500명)',
    'option.Enterprise (500+)': '대기업 (500명 이상)',
    // occasions
    'option.Welcome/Onboarding kit': '웰컴/온보딩 키트',
    'option.VIP/Client gift': 'VIP/고객 선물',
    'option.Conference/Event swag': '컨퍼런스/이벤트 굿즈',
    'option.Uniform/Apparel program': '유니폼/의류 프로그램',
    'option.Holiday gift': '명절/연말 선물',
    'option.Employee recognition': '직원 포상',
    // recipients
    'option.Internal employees': '내부 직원',
    'option.External VIP clients': '외부 VIP 고객',
    'option.General public/attendees': '일반 참가자',
    'option.Executive leadership': '경영진',
    // budget tiers
    'option.Under $20': '$20 미만',
    'option.$20-50': '$20-50',
    'option.$50-100': '$50-100',
    'option.$100-250': '$100-250',
    'option.$250+': '$250 이상',
    // emotional outcomes
    'option.Feels personalized': '개인화된 느낌',
    'option.Feels premium/prestigious': '프리미엄/고급스러운 느낌',
    'option.Feels fun/energetic': '재미있고 활기찬 느낌',
    'option.Feels sustainable/thoughtful': '지속가능하고 세심한 느낌',
    'option.Feels professional/polished': '전문적이고 세련된 느낌',

    // Product categories (used in matcher.ts fallback reasonWhy)
    'category.Apparel': '의류',
    'category.Drinkware': '드링크웨어',
    'category.Event Swag': '이벤트 굿즈',
    'category.Premium Gift Set': '프리미엄 선물 세트',
    'category.Sustainable': '친환경 제품',
    'category.Tech Accessories': '테크 액세서리',
    'category.Welcome Kit': '웰컴 키트',
    'category.Wellness': '웰니스',
  },
} as const satisfies Record<Language, Record<string, string>>

export type TranslationKey = keyof (typeof translations)['en']

// Plain (non-hook) lookup for use outside React components, e.g. matcher.ts.
export function translateOption(value: string, language: Language): string {
  const key = `option.${value}` as TranslationKey
  return translations[language][key] ?? value
}

export function translateCategory(value: string, language: Language): string {
  const key = `category.${value}` as TranslationKey
  return translations[language][key] ?? value
}

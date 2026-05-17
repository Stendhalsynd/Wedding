export const planningCollections = {
  budgetRows: 'planningBudgetRows',
  vendors: 'planningVendors',
  apartments: 'planningApartments',
  policies: 'planningPolicies',
  timeline: 'planningTimeline',
  metadata: 'planningMetadata',
} as const;

export type PlanningCollectionName = typeof planningCollections[keyof typeof planningCollections];

export interface PlanningBaseRecord {
  id: string;
  coupleId: string;
  authorId: string;
  sourceSeedId?: string;
  sortOrder: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface BudgetRowSeed {
  id: string;
  group: string;
  item: string;
  planned: number;
  actual: number;
  due: string;
  owner: string;
  status: string;
  sortOrder: number;
}

export interface VendorSeed {
  id: string;
  title: string;
  decision: string;
  target: string;
  marketRange: string;
  sourceHint: string;
  options: Array<{
    name: string;
    price: string;
    strengths: string;
    risks: string;
    fit: number;
  }>;
  sortOrder: number;
}

export interface ApartmentSeed {
  id: string;
  name: string;
  year: string;
  households: number;
  size: string;
  price: string;
  verdict: string;
  risk: string;
  sortOrder: number;
}

export interface PolicySeed {
  id: string;
  name: string;
  verdict: string;
  reason: string;
  action: string;
  sortOrder: number;
}

export interface TimelineSeed {
  id: string;
  date: string;
  title: string;
  type: string;
  detail: string;
  sortOrder: number;
}

export type BudgetRow = PlanningBaseRecord & BudgetRowSeed;
export type VendorCategory = PlanningBaseRecord & VendorSeed;
export type ApartmentCandidate = PlanningBaseRecord & ApartmentSeed;
export type PolicyCheck = PlanningBaseRecord & PolicySeed;
export type TimelineItem = PlanningBaseRecord & TimelineSeed;

export interface PlanningState {
  budgetRows: BudgetRow[];
  vendors: VendorCategory[];
  apartments: ApartmentCandidate[];
  policies: PolicyCheck[];
  timeline: TimelineItem[];
}

export const emptyPlanningState: PlanningState = {
  budgetRows: [],
  vendors: [],
  apartments: [],
  policies: [],
  timeline: [],
};

const withSortOrder = <T extends { id: string }>(items: T[]) =>
  items.map((item, index) => ({ ...item, sortOrder: index }));

export const planningSeed = {
  weddingDate: '2027-06-27',
  budgetCap: 35000000,
  venue: '보타닉파크 웨딩 카라홀',
  budgetRows: withSortOrder<BudgetRowSeed>([
    { id: 'venue', group: '예식', item: '대관/식대/DVD/본식 포함', planned: 20200000, actual: 20200000, due: '계약 완료', owner: '공동', status: '계약완료', sortOrder: 0 },
    { id: 'sdm', group: '준비', item: '스드메', planned: 2800000, actual: 0, due: '2026 Q4~2027 Q1', owner: '공동', status: '조사중', sortOrder: 1 },
    { id: 'makeup', group: '준비', item: '메이크업', planned: 800000, actual: 0, due: '2027 Q2', owner: '공동', status: '조사중', sortOrder: 2 },
    { id: 'hanbok', group: '준비', item: '한복', planned: 700000, actual: 0, due: '2027 Q1', owner: '협의', status: '유력', sortOrder: 3 },
    { id: 'suit', group: '준비', item: '예복/양복', planned: 1200000, actual: 0, due: '2027 Q1', owner: '본인', status: '비교필요', sortOrder: 4 },
    { id: 'rings', group: '예물', item: '반지', planned: 3000000, actual: 0, due: '2027 Q1', owner: '공동', status: '미정', sortOrder: 5 },
    { id: 'invitation', group: '운영', item: '청첩장/답례품', planned: 500000, actual: 0, due: '2027 Q2', owner: '공동', status: '미정', sortOrder: 6 },
    { id: 'honeymoon', group: '여행', item: '신혼여행', planned: 4300000, actual: 0, due: '2027 Q2', owner: '공동', status: '미정', sortOrder: 7 },
    { id: 'reserve', group: '예비', item: '기타/예비비', planned: 1500000, actual: 0, due: '수시', owner: '공동', status: '보류', sortOrder: 8 },
  ]),
  vendors: withSortOrder<VendorSeed>([
    {
      id: 'studio',
      title: '스튜디오',
      decision: '후보 조사 필요',
      target: '스튜디오 촬영 총액 150~250만원 안에서 원본/수정본 포함 여부 비교',
      marketRange: '150~250만원',
      sourceHint: '참가격 공개항목 + 후기 견적 + 상담가 분리',
      options: [{ name: '미정', price: '150~250만원 예상', strengths: '스타일 우선 선정 가능', risks: '원본/수정본/앨범 추가금 확인 필요', fit: 62 }],
      sortOrder: 0,
    },
    {
      id: 'dress',
      title: '드레스',
      decision: '베일드블랑 기록, 대안 비교',
      target: '본식+촬영+피팅비+헬퍼비를 분리해서 비교',
      marketRange: '130~280만원',
      sourceHint: '베일드블랑 기록: 기본 176만, 본식 156만, 촬영 150만',
      options: [
        { name: '베일드블랑', price: '150~176만원대 기록', strengths: '시트에 상세 기록 있음', risks: '피팅비/헬퍼/추가 드레스 별도', fit: 76 },
        { name: '대안 드레스샵', price: '130~230만원 목표', strengths: '상담 후 예산형 선택 가능', risks: '라인업별 추가금 편차', fit: 69 },
      ],
      sortOrder: 1,
    },
    {
      id: 'makeup',
      title: '메이크업',
      decision: '본식 포함 여부 확인',
      target: '신랑/혼주 메이크업 포함 총액 확인',
      marketRange: '70~150만원',
      sourceHint: '베일드블랑 기록: 본식 96만, 신랑 10만, 남성 혼주 9만, 여성 혼주 30만',
      options: [{ name: '베일드블랑 메이크업', price: '본식 96만원 기록', strengths: '드레스와 동선 통합 가능', risks: '혼주/가족 추가 비용 커질 수 있음', fit: 72 }],
      sortOrder: 2,
    },
    {
      id: 'hanbok',
      title: '한복',
      decision: '테힐라한복 유력',
      target: '양가 어머님 2벌 70~90만원 안에서 피팅비 포함 확인',
      marketRange: '2인 70~90만원',
      sourceHint: '테힐라한복 기록: 1벌 35~45만, 피팅비 10만, 추가피팅 벌당 2만',
      options: [{ name: '테힐라한복', price: '2인 70~90만원 + 피팅비', strengths: '예산표에 구체 기록 있음', risks: '피팅비와 추가피팅 정책 확인', fit: 84 }],
      sortOrder: 3,
    },
    {
      id: 'suit',
      title: '양복/예복',
      decision: '상담 비교 필요',
      target: '신랑 렌탈 선호, 혼주복은 맞춤/기성+수선 비교',
      marketRange: '52~120만원',
      sourceHint: '포튼가먼트 90만 기록, 루쏘소 혼주복 52만 기록',
      options: [
        { name: '루쏘소 목동점', price: '혼주복 패키지 52만원 기록', strengths: '혼주복 예산 효율', risks: '촬영용 렌탈 불가 기록', fit: 78 },
        { name: '포튼가먼트 합정점', price: '웨딩패키지 90만원 기록', strengths: '맞춤 MTM+대여 패키지', risks: '예약/피팅비 5.5만원, 구성 상담 필요', fit: 74 },
        { name: 'BON', price: '기성/렌탈 확인 필요', strengths: '신부 남동생 양복 후보', risks: '웨딩 패키지 정보 부족', fit: 58 },
      ],
      sortOrder: 4,
    },
  ]),
  apartments: withSortOrder<ApartmentSeed>([
    { id: 'bandal-donga', name: '반달마을(동아)', year: '1993년', households: 915, size: '20~23평', price: '2.95~4.18억권', verdict: '1차후보', risk: '구축·주차 리스크, 개별 호가 확인', sortOrder: 0 },
    { id: 'bandal-sunkyung', name: '반달마을(선경)', year: '1993년', households: 915, size: '20~23평', price: '3.99~4.28억권', verdict: '1차후보', risk: '4.2억 이하 매물 선별 필요', sortOrder: 1 },
    { id: 'bandal-kunyoung', name: '반달마을(건영)', year: '1993년', households: 912, size: '21~22평', price: '3.50~4.15억권', verdict: '1차후보', risk: '24평형 일부 조건 초과', sortOrder: 2 },
    { id: 'bandal-samik', name: '반달마을(삼익)', year: '1993년', households: 828, size: '22평', price: '3.95~4.25억권', verdict: '1차후보', risk: '상단 호가 리스크', sortOrder: 3 },
    { id: 'hanareum-hyundai-life', name: '한아름마을(현대,라이프)', year: '1993년', households: 1236, size: '23평', price: '3.18~3.94억권', verdict: '1차후보', risk: '송내역 생활권에 가까움', sortOrder: 4 },
    { id: 'hanareum-samhwan', name: '한아름마을(삼환,동아,동성)', year: '1994년', households: 1428, size: '24평', price: '3.50~3.95억권', verdict: '1차후보', risk: '실제 동선 확인 필요', sortOrder: 5 },
    { id: 'hanareum-korea4', name: '한아름마을(4차한국)', year: '1996년', households: 500, size: '19~24평', price: '4.03~4.25억권', verdict: '가격상단', risk: '평균 호가 조건 초과 가능', sortOrder: 6 },
    { id: 'halla-jugong3', name: '한라마을(주공3단지)', year: '1996년', households: 1201, size: '23~24평', price: '3.70~4.27억권', verdict: '가격상단', risk: '4.2억 안팎 네고 필요', sortOrder: 7 },
  ]),
  policies: withSortOrder<PolicySeed>([
    { id: 'newlywed-didimdol', name: '신혼부부 디딤돌 구입', verdict: '불가 가능성 높음', reason: '부부합산 1.16억원으로 소득 초과 가능성', action: '정책대출 주력 제외, 은행 예외만 확인', sortOrder: 0 },
    { id: 'first-home-didimdol', name: '내집마련 디딤돌 생애최초', verdict: '불가 가능성 높음', reason: '본인 세전 7,600만원으로 단독 소득 초과 가능성', action: '주택도시기금 계산기로 확인', sortOrder: 1 },
    { id: 'bank-mortgage', name: '시중은행 생애최초 주담대', verdict: '추가확인', reason: 'DSR/LTV/담보평가가 핵심', action: '은행 2~3곳 사전심사', sortOrder: 2 },
    { id: 'sh-mirinae', name: 'SH 미리내집 장기전세', verdict: '조건부', reason: '소득은 근접하나 분양권/무주택세대 리스크', action: '공고별 배우자 분양권 기준 확인', sortOrder: 3 },
    { id: 'marriage-registration', name: '혼인신고 시점', verdict: '전략변수', reason: '주택수·생초·청약 판단 변화', action: '계약 전 기준표 작성', sortOrder: 4 },
  ]),
  timeline: withSortOrder<TimelineSeed>([
    { id: 'sdm-research', date: '2026-06', title: '스드메 조사 착수', type: 'vendor', detail: '참가격/공식가/후기 견적을 같은 형식으로 수집', sortOrder: 0 },
    { id: 'suit-hanbok-reserve', date: '2026-08', title: '예복·한복 상담 예약', type: 'vendor', detail: '테힐라, 루쏘소, 포튼가먼트 상담 비교', sortOrder: 1 },
    { id: 'bank-precheck', date: '2026-10', title: '은행 1차 사전심사', type: 'housing', detail: '4.2억 이하 매수 시 필요 현금과 월상환 확인', sortOrder: 2 },
    { id: 'rings-sdm-contract', date: '2027-01', title: '반지·스드메 계약 마감', type: 'budget', detail: '총상한 3,500만원 초과 여부 점검', sortOrder: 3 },
    { id: 'invitation-family-makeup', date: '2027-04', title: '청첩장/혼주 메이크업 확정', type: 'ops', detail: '가족 인원 기준 추가금 확정', sortOrder: 4 },
    { id: 'wedding-day', date: '2027-06-27', title: '본식', type: 'wedding', detail: '보타닉파크 웨딩 카라홀 12:10', sortOrder: 5 },
  ]),
} as const;

export const getPlanningOwnerKey = (uid: string, coupleId: string | null | undefined) => coupleId || uid;

export const getPlanningMergeKey = (record: { id: string; sourceSeedId?: string }) =>
  record.sourceSeedId || record.id;

export const normalizeCurrencyInput = (value: string | number) =>
  Number(String(value).replace(/[^\d]/g, '') || 0);

export const money = (value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`;

export const sortPlanningRecords = <T extends { sortOrder?: number; createdAt?: any }>(records: T[]) =>
  [...records].sort((a, b) => {
    if (typeof a.sortOrder === 'number' && typeof b.sortOrder === 'number') {
      return a.sortOrder - b.sortOrder;
    }
    const aTime = typeof a.createdAt?.toMillis === 'function' ? a.createdAt.toMillis() : 0;
    const bTime = typeof b.createdAt?.toMillis === 'function' ? b.createdAt.toMillis() : 0;
    return aTime - bTime;
  });

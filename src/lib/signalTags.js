// 오늘의 공시 — 구체적 시그널 태그 (룰북 CLAUDE.md 기반)
// report_nm → 짧은 시그널명 + 색. 행 배지(주인공) + 상단 필터 탭이 공유한다.
// 색은 시그널 성격으로 묶되, 텍스트는 항상 공시에서 나온 구체적 시그널명.

// 우선순위 순서대로 먼저 매칭되는 것이 그 공시의 대표 시그널.
const RULES = [
  { key: '소수계좌', test: /소수계좌|소수지점/, color: '#DC2626' },      // 수급·매집 강신호
  { key: '거래정지', test: /투자위험|매매거래정지|거래정지/, color: '#991B1B' }, // 경보(강)
  { key: '투자경고', test: /투자경고/, color: '#C2410C' },             // 경보
  { key: '투자주의', test: /투자주의/, color: '#D97706' },             // 경보(약)
  { key: '대량보유', test: /대량보유/, color: '#DC2626' },             // 매집
  { key: '내부자',   test: /특정증권|임원.*소유/, color: '#DC2626' },   // 매집
  { key: '최대주주', test: /최대주주/, color: '#DC2626' },             // 매집
  { key: '공급계약', test: /단일판매|공급계약/, color: '#0D9488' },     // 실적·계약
  { key: '시설투자', test: /시설투자/, color: '#0D9488' },             // 실적·계약
  { key: '실적',     test: /영업.*실적|매출액|잠정실적|손익구조/, color: '#0D9488' },
  { key: '무상증자', test: /무상증자/, color: '#2563EB' },             // 주주환원
  { key: '자사주',   test: /자기주식|자사주/, color: '#2563EB' },       // 주주환원
  { key: '배당',     test: /배당/, color: '#2563EB' },                 // 주주환원
  { key: '유상증자', test: /유상증자/, color: '#475569' },             // 자본조달
  { key: 'CB/BW',    test: /전환사채|신주인수권부?사채/, color: '#475569' },
  { key: '합병',     test: /합병|분할/, color: '#475569' },
  { key: '풍문',     test: /풍문|조회공시/, color: '#6B7280' },         // 기타
]

const ETC = { key: '기타', color: '#6B7280' }

// 필터 탭 표시 우선순위
export const SIGNAL_ORDER = [
  '소수계좌', '공급계약', '실적', '투자경고', '대량보유', '내부자', '최대주주',
  '시설투자', '무상증자', '자사주', '배당', '유상증자', 'CB/BW', '합병',
  '투자주의', '거래정지', '풍문', '기타',
]

// key → 색 (탭 활성 배경용)
export const SIGNAL_COLORS = RULES.reduce(
  (m, r) => { m[r.key] = r.color; return m },
  { [ETC.key]: ETC.color }
)

// 공시 한 건 → { key, label, color }
export function getSignalTag(d) {
  const rn = (d && d.report_nm) || ''
  const m = RULES.find(r => r.test.test(rn))
  const t = m || ETC
  return { key: t.key, label: t.key, color: t.color }
}

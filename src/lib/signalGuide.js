// 공시 → 고객 언어 변환 (룰북 CLAUDE.md 기반)
// 데이터 추가 없이 grade + report_nm 만으로 "의미 라벨 + 한 줄 해석"을 생성한다.
// 오늘의 공시 화면(인라인 라벨)과 상단 공시 가이드 패널이 모두 이 모듈을 공유한다.

// 등급 → 의미 라벨 (고객 언어). key(S/A/D)는 필터링용으로 유지하고, 표시만 바꾼다.
export const GRADE_LABELS = {
  S: { label: '호재', color: '#16A34A', desc: '강한 긍정공시' },
  A: { label: '실적', color: '#0D9488', desc: '실적 개선' },
  D: { label: '경보', color: '#DC2626', desc: '거래소 경보 · 반등 주목' },
}

// 표시 순서 (전체 탭 제외)
export const GRADE_ORDER = ['S', 'A', 'D']

// report_nm 패턴 → 공시 유형 + "그래서 어떻게" 한 줄 (우선순위 순서대로 먼저 잡히는 게 우선)
const SIGNAL_RULES = [
  { test: /소수계좌|소수지점/, type: '소수계좌 집중매수', read: '급등 선행신호. 당일 하락은 정상, T+10일 관점' },
  { test: /투자경고/, type: '투자경고 지정', read: '거래소 경보지만 실증상 단기 반등 잦음(평균 +5.5%)' },
  { test: /투자위험|매매거래정지|거래정지/, type: '거래정지·위험', read: '변동성 극대 구간. 신중히 관찰' },
  { test: /투자주의/, type: '투자주의 지정', read: '이상 매수 포착 초기. 후속 공시 주목' },
  { test: /단일판매|공급계약/, type: '공급계약 체결', read: '대형 수주면 실적 모멘텀 (매출 비중 확인)' },
  { test: /무상증자/, type: '무상증자', read: '주주환원·유동성 확대 신호' },
  { test: /유상증자/, type: '유상증자', read: '자금조달. 대기업 배정이면 전략적 제휴 가능성' },
  { test: /전환사채|신주인수권부?사채/, type: 'CB/BW 발행', read: '희석 주의. 단 무이자 조건이면 투자자에 유리' },
  { test: /자기주식|자사주/, type: '자사주 취득', read: '주가 방어·주주환원 신호' },
  { test: /대량보유/, type: '대량보유 신고', read: '큰손 매집. 경영참가 목적이면 강한 신호' },
  { test: /최대주주/, type: '최대주주 변동', read: '지분 증가면 양성 신호' },
  { test: /특정증권|임원.*소유/, type: '내부자 지분변동', read: '임원 장내매수면 내부 확신' },
  { test: /영업.*실적|매출액|손익구조|잠정실적/, type: '실적 공시', read: '흑자전환·이익 모멘텀 확인' },
  { test: /풍문|조회공시/, type: '풍문·조회공시', read: '시장 관심 집중. 해명 내용 확인' },
]

// 공시 한 건 → { grade(라벨/색), type(유형), howToRead(한 줄 해석) }
export function getSignalGuide(d) {
  const rn = (d && d.report_nm) || ''
  const grade = d && d.grade
  const matched = SIGNAL_RULES.find(r => r.test.test(rn))
  return {
    grade: GRADE_LABELS[grade] || null,
    type: matched ? matched.type : null,
    howToRead: matched ? matched.read : null,
  }
}

// ── 상단 공시 가이드 패널 콘텐츠 ──
// 섹션 2: 핵심 시그널 빠른 해석 (룰북 HARD RULE 요약)
export const GUIDE_SIGNALS = [
  { name: '소수계좌 집중매수', desc: '급등 선행지표. 당일 하락은 정상, 진짜 반등은 T+10~25일' },
  { name: '투자경고', desc: '실증 평균 +5.5% 초과수익. "과열"로 거르지 않습니다' },
  { name: '공급계약(매출 비중 큼)', desc: '대형 수주 = 실적 모멘텀' },
  { name: '대량보유 · 내부자 매수', desc: '큰손·임원의 매집 신호' },
  { name: 'CB/BW 발행', desc: '희석 주의. 단 무이자 조건이면 투자자에 유리' },
]

// 면책 (유료 서비스 법적 의무 동시 충족)
export const GUIDE_DISCLAIMER =
  '본 정보는 공시 기반 참고 자료이며 투자 권유가 아닙니다. 투자 판단과 책임은 본인에게 있으며, 반드시 공시 원문을 확인하세요.'

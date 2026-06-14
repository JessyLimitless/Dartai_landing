// S 등급 내 '강도' 판정. 'strong' | 'mid' | 'weak'
// 기준: config.py SIGNAL_TIER(price_tracks 12,706건 실증) 의 tier + 룰북 보정.
//  - 강 = 실증 TIER 1 (투자경고·CB발행·자사주취득) + 룰북 보정(소수계좌: 5일론 약하나 T+10~25d 알파 → 강)
//  - 중 = 실증 TIER 2 (대량보유·무상증자·유상증자·공급계약·풍문) + 데이터 없는 주요 기업이벤트(대표이사·M&A·최대주주)
//  - 약 = 임원 단순 보고, 시장경보 단발(단일계좌거래량·매매관여과다·종가급변) 등
// SIGNAL_TIER가 바뀌면 이 매핑도 함께 갱신할 것.
// A/D 등급엔 적용하지 않는다.

// 강 — 실증 TIER 1 + 소수계좌(룰북 보정)
const STRONG = [
  /투자경고/,                       // T1: 5일 +11.25%, 역발상 매수
  /소수계좌|소수지점/,              // 룰북 보정: 진짜 알파는 T+10~25d
  /전환사채|신주인수권부?사채/,     // T1(CB발행): 상한가 최다, 5일 +6.42%
  /자기주식취득|주식소각|자사주/,   // T1(자사주): 승률 72% 1위
]

// 중 — 실증 TIER 2 + 데이터 없는 주요 기업이벤트
const MID = [
  /대량보유/,                       // T2: 승률 52%, 안정적
  /무상증자/,                       // T2: 5일 +8.79%
  /유상증자/,                       // T2: 5일 +14.44%(반등형) — S확정분(제3자배정 등)
  /단일판매|공급계약/,              // T2: 평균 중립(규모 따라)
  /풍문|조회공시/,                  // T2: 승률 54%, 루머 소멸
  /타법인주식.*취득/,               // M&A/전략투자 (실증 없음)
  /대표이사/,                       // 경영진 교체 (실증 없음)
  /최대주주/,                       // 지배구조 (실증 없음)
]

// 그 외(임원 단순 보고, 단일계좌거래량·매매관여과다·종가급변 등) = weak

export function getSignalStrength(d) {
  const rn = (d && d.report_nm) || ''
  // 임원·주요주주 특정증권 보고: 장내매수만 중(내부자 매수 = 상승 시그널), 매도/불명은 약
  if (/특정증권등소유/.test(rn)) {
    const t = d && d.parsed_data && d.parsed_data['거래유형']
    return t === '장내매수' ? 'mid' : 'weak'
  }
  if (STRONG.some(re => re.test(rn))) return 'strong'
  if (MID.some(re => re.test(rn))) return 'mid'
  return 'weak'
}

// 강도별 배지 색 — 피드 배지 + 가이드 범례가 공유
export function strengthBadgeStyle(strength, dark) {
  if (strength === 'strong') return { bg: '#DC2626', fg: '#fff' }
  if (strength === 'mid') return { bg: '#EC6A72', fg: '#fff' }
  return { bg: dark ? 'rgba(220,38,38,0.22)' : '#FBE0E2', fg: dark ? '#F87171' : '#C0303A' }
}

// 가이드 범례용 설명 (실증 근거 반영)
export const STRENGTH_INFO = [
  { key: 'strong', label: '강', desc: '투자경고·소수계좌·CB·자사주 (실증 TIER1 + 룰북)' },
  { key: 'mid', label: '중', desc: '대량보유·무상/유상증자·공급계약·내부자 매수 (TIER2)' },
  { key: 'weak', label: '약', desc: '임원 매도·단순보고·시장경보 단발' },
]

// S 등급 내 '강도' 판정 (공시 유형 기반, report_nm). 'strong' | 'mid' | 'weak'
// S 바구니가 넓어서(임원 보고서 등 고볼륨) 같은 S라도 강도를 색 농도로 구분하기 위함.
// A/D 등급엔 적용하지 않는다.
// 한계: 임원 보고서는 매수/매도 구분이 parsed_data에 있어 report_nm만으론 못 가름 → v1은 일괄 weak.

// 강 — 룰북 최상위 시그널 (이미 S로 확정 = 대형/유효로 간주)
const STRONG = [
  /소수계좌|소수지점/,        // TIER2 매집 선행
  /투자경고/,                 // TIER1 역발상 (통합라벨 "투자주의/경고/위험"엔 "투자경고" 부분문자열 없음)
  /단일판매|공급계약/,        // S 확정 = 매출비중 큰 대형 수주
  /무상증자/,                 // S 확정 = 배정비율 1.0+
  /주식소각|자기주식취득/,    // 주가 직접 영향
  /제3자배정/,                // 대기업 배정 전략 제휴
  /대표이사/,                 // 경영진 교체
]

// 중 — 의미 있으나 보조
const MID = [
  /전환사채|신주인수권부?사채/,
  /대량보유/,
  /타법인주식.*취득/,
  /풍문|조회공시/,
  /최대주주/,
  /유상증자/,
]

// 그 외(임원 단순 보고, 단일계좌거래량·매매관여과다·종가급변 등 시장경보 단발) = weak

export function getSignalStrength(d) {
  const rn = (d && d.report_nm) || ''
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

// 가이드 범례용 설명
export const STRENGTH_INFO = [
  { key: 'strong', label: '강', desc: '소수계좌·투자경고·대형 수주·소각' },
  { key: 'mid', label: '중', desc: 'CB·대량보유·내부자·풍문' },
  { key: 'weak', label: '약', desc: '임원 단순보고·시장경보 단발' },
]

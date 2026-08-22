/**
 * 🎭 매매 화면 데모 데이터 — __화면 확인용__.
 *
 * 8/24 픽 3종(서울바이오시스·오킨스전자·씨이랩)을 다 샀고 2거래일 지난 상황을 가정한다.
 * 진입가·수량은 __실제 dry-run 이 계산한 값__이고, 현재가만 그럴듯하게 넣었다.
 *
 * ⚠️ 이 데이터는 __브라우저 안에서만 산다.__ 서버·원장·주문 어디에도 닿지 않는다.
 *    켜는 방법도 URL 파라미터 하나뿐이라 실수로 켜질 수 없고, 켜지면 화면 전체에
 *    __빨간 데모 배너__가 뜬다. 진짜 성과와 헷갈리면 안 되는 종류의 데이터다.
 */

export function isTradeDemo() {
  try {
    return new URLSearchParams(window.location.search).get('demo') === '1'
  } catch {
    return false
  }
}

export function toggleTradeDemo(on) {
  const u = new URL(window.location.href)
  if (on) u.searchParams.set('demo', '1')
  else u.searchParams.delete('demo')
  window.location.href = u.toString()
}

const POSITIONS = [
  {
    corp_name: '서울바이오시스', stock_code: '092190', status: 'open',
    date: '2026-08-24', entry_price: 8510, shares: 1175, peak: 9150,
    last_price: 8920, hold_days: 2,
    warn: ['관측 범위 밖 — 진입 전 급등폭 104.8% > 관측 최댓값 55.6%'],
  },
  {
    corp_name: '오킨스전자', stock_code: '080580', status: 'open',
    date: '2026-08-24', entry_price: 16700, shares: 598, peak: 17240,
    last_price: 15980, hold_days: 2, warn: [],
  },
  {
    corp_name: '씨이랩', stock_code: '189330', status: 'open',
    date: '2026-08-24', entry_price: 16600, shares: 602, peak: 20400,
    last_price: 19850, hold_days: 2, warn: [], shadow_tp_hit_dt: '2026-08-26',
  },
]

const ORDERS = [
  { ts: '2026-08-26T15:20', kind: 'order', side: 'sell', corp_name: '씨이랩',
    qty: 602, sent: false, reason: '(그림자) 익절 +20% 도달 — 집행 안 함' },
  { ts: '2026-08-24T09:00', kind: 'order', side: 'buy', corp_name: '씨이랩',
    qty: 602, ref_price: 16600, sent: true, ord_no: '00147' },
  { ts: '2026-08-24T09:00', kind: 'order', side: 'buy', corp_name: '오킨스전자',
    qty: 598, ref_price: 16700, sent: true, ord_no: '00146' },
  { ts: '2026-08-24T09:00', kind: 'order', side: 'buy', corp_name: '서울바이오시스',
    qty: 1175, ref_price: 8510, sent: true, ord_no: '00145' },
  { ts: '2026-08-24T09:00', kind: 'skip', side: 'buy', corp_name: '대성하이텍',
    sent: false, reason: '유동성 부족 — 20일 평균 거래대금 1.8억/일 < 하한 3억' },
]

const LOG = [
  '[2026-08-24 09:00:03] 진입 시작 · 모의투자',
  '  → BUY 서울바이오시스 1175주 @8,510 = 9,999,250원',
  '  ⚠️ 서울바이오시스(092190) — 관측 범위 밖 — 진입 전 급등폭 104.8%',
  '  → BUY 오킨스전자 598주 @16,700 = 9,986,600원',
  '  → BUY 씨이랩 602주 @16,600 = 9,993,200원',
  '  · SKIP 대성하이텍(129160) — 유동성 부족 — 20일 평균 거래대금 1.8억/일 < 하한 3억',
  '실행 · 모의투자 · 전송 3건',
  '[2026-08-24 09:10:02] ✅ 원장 ↔ 잔고 일치 (보유 3종)',
  '[2026-08-26 15:20:01] 청산 판정',
  '  · 서울바이오시스(092190) 현재 8,920 / 고점 9,150 (-2.5%) · 보유 2일',
  '  · 오킨스전자(080580) 현재 15,980 / 고점 17,240 (-7.3%) · 보유 2일',
  '  · 씨이랩(189330) 현재 19,850 / 고점 20,400 (-2.7%) · 보유 2일',
  '    [그림자] 익절 +20% 도달 (보유 2일) — 집행 안 함',
  'DRY-RUN · 매도 전송 0건',
]

/** 관리자 패널용 — 실제 응답 위에 데모를 얹는다(준비 상태는 실제 값 유지). */
export function demoAdminStatus(real) {
  const r = JSON.parse(JSON.stringify(real || {}))
  r.positions = POSITIONS
  r.orders = ORDERS
  r.log_tail = LOG
  r.updated_at = '2026-08-26T15:22:01'
  r.last_reconcile = '2026-08-26T15:45:03'
  r.reconcile_ok = true
  r.demo = true
  return r
}

/** 전광판용 — 종목은 마스킹된 채로 같은 시나리오를 만든다. */
export function demoBoard() {
  const unreal = POSITIONS.reduce(
    (a, p) => a + (p.last_price - p.entry_price) * p.shares, 0)
  const invested = POSITIONS.reduce((a, p) => a + p.entry_price * p.shares, 0)
  return {
    demo: true, mode: '모의투자', updated_at: '2026-08-26T15:22:01',
    last_reconcile: '2026-08-26T15:45:03', reconcile_ok: true, halted: null,
    live: {
      n: 3, closed: 0, open: 3, total_pnl: 0, avg_ret: null, med_ret: null,
      unrealized_pnl: unreal,
      unrealized_avg: +((unreal / invested) * 100).toFixed(2),
      win: null, worst: null, best: null, slots_used: 3, slots_max: 20,
    },
    positions: POSITIONS.map((p, i) => ({
      idx: i + 1, status: p.status, hold_days: p.hold_days, cap_days: 10,
      ret_pct: +(((p.last_price / p.entry_price) - 1) * 100).toFixed(2),
      peak_pct: +(((p.peak / p.entry_price) - 1) * 100).toFixed(2),
      trail_room_pct: +(((p.last_price / (p.peak * 0.88)) - 1) * 100).toFixed(2),
      warn: p.warn, shadow_tp_hit: !!p.shadow_tp_hit_dt,
    })),
    calc: {
      n: 66, avg: 6.46, med: -0.13, win: 48.5, worst: -22.57,
      note: '일봉 위에서 룰을 사후 계산한 값 — 실체결 아님',
    },
  }
}

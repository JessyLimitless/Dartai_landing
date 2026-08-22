import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM_GOLD } from '../constants/theme'
import { API, secretHeaders } from '../lib/api'
import { isTradeDemo, demoBoard } from '../lib/tradeDemo'

/**
 * 📊 매매 전광판 — 실체결 성과.
 *
 * 설계 원칙 셋 (전부 협상 대상 아님):
 *
 * 1. **실체결과 계산값을 한 숫자에 섞지 않는다.**
 *    큰 숫자는 __실제로 주문이 나가고 체결된 것__만. 백테스트 계산값은
 *    아래 별도 칸에 "계산값" 라벨을 달고 따로 둔다. 합치면 소설이 된다.
 *
 * 2. **평균 옆에 중앙값을 같은 크기로 놓는다** (원장 불변식 #4).
 *    픽 성적표에서 평균 +6.46% / 중앙 −0.13% 로 갈렸다. 평균만 크게 띄우면
 *    상위 몇 건이 만든 숫자를 성과로 파는 것이 된다.
 *
 * 3. 🔒 **종목은 나오지 않는다.** 순번뿐이다. 이 화면은 피치·데모에서 띄우는
 *    용도라, 토큰이 있어도 종목이 안 나오게 __서버가 아예 안 보낸다.__
 */
export default function TradeBoard() {
  const { colors, dark } = useTheme()
  const [d, setD] = useState(null)
  const [err, setErr] = useState(false)

  const demo = isTradeDemo()

  useEffect(() => {
    if (demo) { setD(demoBoard()); setErr(false); return }
    let alive = true
    const load = () => fetch(`${API}/api/trade/board`, { headers: secretHeaders() })
      .then(r => r.json())
      .then(x => { if (alive) { setD(x); setErr(false) } })
      .catch(() => { if (alive) setErr(true) })
    load()
    const t = setInterval(load, 60000)   // 장중 1분 갱신
    return () => { alive = false; clearInterval(t) }
  }, [demo])

  if (err) return null
  const line = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const live = d?.live
  const hasFills = !!(live && live.n > 0)
  const isMock = (d?.mode || '').includes('모의')

  return (
    <div style={{
      margin: '16px 0 24px', borderRadius: 16, overflow: 'hidden',
      border: `1px solid ${line}`, fontFamily: FONTS.body,
      background: dark ? '#0E0E11' : '#FBFBFC',
    }}>
      {/* ── 헤더: 모드 배지 + 정지 상태 ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        padding: '12px 16px', borderBottom: `1px solid ${line}`,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 900, letterSpacing: '0.06em', padding: '3px 8px',
          borderRadius: 5, color: isMock ? '#0D9488' : '#fff',
          background: isMock ? 'rgba(13,148,136,0.12)' : '#DC2626',
        }}>{isMock ? '모의투자' : '실계좌'}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: colors.textPrimary }}>매매 전광판</span>
        {d?.demo && (
          <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.06em',
                         color: '#fff', background: '#DC2626', padding: '3px 8px', borderRadius: 5 }}>
            데모 · 가상 데이터
          </span>
        )}
        {d?.halted && (
          <span style={{
            fontSize: 10.5, fontWeight: 700, color: '#DC2626', padding: '3px 8px',
            borderRadius: 5, background: 'rgba(220,38,38,0.10)',
          }}>정지 · {d.halted}</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
          {d?.updated_at ? d.updated_at.slice(5, 16).replace('T', ' ') : '—'}
        </span>
      </div>

      {/* ── 큰 숫자: 실체결만 ── */}
      {!hasFills ? (
        <div style={{ padding: '28px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
            체결 대기 중
          </div>
          <div style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.6 }}>
            아직 실제로 나간 주문이 없습니다.<br />
            첫 체결이 생기면 여기에 실측 성과가 표시됩니다.
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${line}` }}>
          {/* 보유 중일 때도 __화면이 살아 있어야 한다.__ 청산 전엔 실현이 0이라
              실현만 크게 두면 3종을 들고 있어도 전부 '—' 로 보인다. */}
          <Big label="평가손익 (보유)" value={fmtWon(live.unrealized_pnl)}
               tone={toneOf(live.unrealized_pnl)} colors={colors} line={line} />
          <Big label="평가수익률" value={fmtPct(live.unrealized_avg)}
               tone={toneOf(live.unrealized_avg)} colors={colors} line={line} />
          <Big label="실현손익" value={fmtWon(live.total_pnl)}
               tone={toneOf(live.total_pnl)} colors={colors} line={line} />
          {/* ⚠️ 실현 평균 옆에 중앙값을 __같은 크기__로 — 원장 불변식 #4 */}
          <Big label={`실현 평균 / 중앙 (${live.closed}건)`}
               value={live.closed ? `${fmtPct(live.avg_ret)} / ${fmtPct(live.med_ret)}` : '—'}
               tone={toneOf(live.med_ret)} colors={colors} line={line} small />
        </div>
      )}

      {/* ── 하단 스트립 ── */}
      <div style={{
        display: 'flex', gap: 14, flexWrap: 'wrap', padding: '10px 16px',
        borderBottom: `1px solid ${line}`, fontSize: 11.5, color: colors.textMuted,
        fontFamily: FONTS.mono,
      }}>
        <span>체결 {live?.n ?? 0}건</span>
        <span>청산 {live?.closed ?? 0}</span>
        <span>보유 {live?.open ?? 0}</span>
        <span>슬롯 {live?.slots_used ?? 0}/{live?.slots_max ?? 0}</span>
        {live?.win != null && <span>승률 {live.win}%</span>}
        {live?.worst != null && <span>최악 {fmtPct(live.worst)}</span>}
        {d?.reconcile_ok === false && (
          <span style={{ color: '#DC2626', fontWeight: 700 }}>원장/잔고 불일치</span>
        )}
      </div>

      {/* ── 포지션 (🔒 종목 비공개) ── */}
      {d?.positions?.length > 0 && (
        <div>
          {d.positions.map(p => (
            <div key={p.idx} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
              borderBottom: `1px solid ${line}`, fontSize: 12.5,
            }}>
              <span style={{
                fontFamily: FONTS.mono, color: colors.textMuted, letterSpacing: '0.1em',
                minWidth: 42,
              }}>●●●</span>
              <span style={{
                fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                color: colors.textMuted,
                background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              }}>{statusLabel(p.status)}</span>
              <span style={{
                fontFamily: FONTS.mono, fontWeight: 700, minWidth: 60,
                color: colorOf(p.ret_pct, colors),
              }}>{fmtPct(p.ret_pct)}</span>
              {p.trail_room_pct != null && (
                <span style={{ color: colors.textMuted, fontSize: 11.5 }}>
                  발동선까지 <b style={{ color: colors.textSecondary }}>{fmtPct(p.trail_room_pct)}</b>
                </span>
              )}
              {p.hold_days != null && (
                <span style={{ marginLeft: 'auto', fontFamily: FONTS.mono, fontSize: 11,
                               color: colors.textMuted }}>
                  {p.hold_days}/{p.cap_days}일
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── 계산값: __별도 칸, 작게__ ── */}
      {d?.calc && (
        <div style={{ padding: '11px 16px', background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
                        color: colors.textMuted, marginBottom: 5 }}>
            참고 · 계산값 (실체결 아님)
          </div>
          <div style={{ fontSize: 11.5, color: colors.textMuted, fontFamily: FONTS.mono }}>
            n={d.calc.n} · 평균 {fmtPct(d.calc.avg)} · <b style={{ color: colors.textSecondary }}>
            중앙 {fmtPct(d.calc.med)}</b> · 승률 {d.calc.win}% · 최악 {fmtPct(d.calc.worst)}
          </div>
          <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 4, lineHeight: 1.5 }}>
            일봉 위에서 룰을 사후 계산한 값입니다. 수수료·거래세·슬리피지가 반영돼 있지 않습니다.
          </div>
        </div>
      )}
    </div>
  )
}

function Big({ label, value, tone, colors, line, small }) {
  const c = tone === 'up' ? '#DC2626' : tone === 'down' ? '#2563EB' : colors.textPrimary
  return (
    <div style={{ padding: '16px', borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}` }}>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', color: colors.textMuted }}>
        {label}
      </div>
      <div style={{ fontSize: small ? 17 : 24, fontWeight: 800, fontFamily: FONTS.mono,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.02em', color: c, marginTop: 4 }}>
        {value}
      </div>
    </div>
  )
}

const toneOf = v => (v == null ? null : v > 0 ? 'up' : v < 0 ? 'down' : null)
const colorOf = (v, colors) =>
  v == null ? colors.textMuted : v > 0 ? '#DC2626' : v < 0 ? '#2563EB' : colors.textMuted

function fmtPct(v) {
  if (v == null || isNaN(v)) return '—'
  return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`
}

function fmtWon(v) {
  if (v == null || isNaN(v)) return '—'
  const sign = v > 0 ? '+' : v < 0 ? '−' : ''
  const a = Math.abs(Math.round(v))
  if (a >= 1e8) return `${sign}${(a / 1e8).toFixed(2)}억`
  if (a >= 1e4) return `${sign}${Math.round(a / 1e4).toLocaleString()}만`
  return `${sign}${a.toLocaleString()}`
}

function statusLabel(s) {
  return { open: '보유', ordered: '주문', exit_ordered: '청산주문',
           closed: '청산', skipped: '스킵' }[s] || s || '—'
}

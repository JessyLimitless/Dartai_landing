import React, { useState } from 'react'
import { FONTS } from '../constants/theme'

// DART 픽 페이퍼 트레이딩 원장 — 1,000만원 가상매매(즉시매수 + 트레일링 -12%).
// sim_paper.py가 매일 갱신하는 sim_portfolio.json(/api/pick/paper)을 렌더링한다.
// 트랙레코드를 실제로 쌓아 전략 수익률을 투명하게 보여주는 게 핵심.
const UP = '#E8364E', DOWN = '#2563EB'
const STATUS = {
  open: { label: '보유', bg: 'rgba(13,148,136,0.12)', fg: '#0D9488' },
  closed: { label: '청산', bg: 'rgba(107,114,128,0.14)', fg: '#6B7280' },
  pending: { label: '대기', bg: 'rgba(217,119,6,0.12)', fg: '#D97706' },
}

const won = (v) => (typeof v !== 'number') ? '–' : `${v > 0 ? '+' : ''}${v.toLocaleString()}원`
const pct = (v, d = 1) => (typeof v !== 'number') ? '–' : `${v > 0 ? '+' : ''}${v.toFixed(d)}%`
const price = (v) => (typeof v !== 'number') ? '–' : v.toLocaleString()

export default function PaperTrading({ data, colors, dark, lineSep, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const positions = (data && Array.isArray(data.positions)) ? data.positions : []
  if (!data || data.empty || !positions.length) return null

  const s = data.summary || {}
  const colorOf = (v) => (typeof v !== 'number') ? colors.textMuted : v > 0 ? UP : v < 0 ? DOWN : colors.textMuted
  const totRet = s.total_return_pct
  const closed = s.closed || {}
  const openB = s.open || {}
  // 청산+보유 통합 승률(둘 다 있을 때만 표시)
  const winRate = closed.win != null ? closed.win : (openB.win != null ? openB.win : null)

  return (
    <div style={{ marginTop: 18 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '14px 0 8px', borderBottom: `1px solid ${lineSep}`, textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
          background: 'rgba(13,148,136,0.12)', color: '#0D9488', letterSpacing: '0.05em',
        }}>페이퍼</span>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: colors.textPrimary }}>
          가상매매 트랙레코드
        </span>
        {typeof totRet === 'number' && (
          <span style={{
            fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono, color: colorOf(totRet),
          }}>{pct(totRet)}</span>
        )}
        <span style={{
          marginLeft: 'auto', fontSize: 12, color: colors.textMuted,
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s',
        }}>▾</span>
      </button>

      {open && (
        <div style={{ paddingTop: 12 }}>
          <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6, marginBottom: 14 }}>
            선정된 픽을 종목당 <b style={{ color: colors.textSecondary }}>1,000만원</b>씩
            <b style={{ color: colors.textSecondary }}> 선정일 시가</b>에 매수(상한가 잠김이면 풀릴 때까지 대기)하고,
            <b style={{ color: colors.textSecondary }}> 고점 대비 -12%</b> 이탈 시 트레일링 청산합니다.
            픽은 장 시작 전(07:30)에 발송돼 당일 시가에 담을 수 있습니다. 실제 트랙레코드입니다.
          </div>

          {/* 요약 카드 */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 16,
          }}>
            <Stat label="누적 수익률" value={pct(totRet)} color={colorOf(totRet)} colors={colors} lineSep={lineSep} dark={dark} big />
            <Stat label="총 손익" value={won(s.total_pnl)} color={colorOf(s.total_pnl)} colors={colors} lineSep={lineSep} dark={dark} big />
            <Stat label="실현 손익" value={won(s.realized_pnl)} color={colorOf(s.realized_pnl)} colors={colors} lineSep={lineSep} dark={dark} />
            <Stat label="미실현 손익" value={won(s.unrealized_pnl)} color={colorOf(s.unrealized_pnl)} colors={colors} lineSep={lineSep} dark={dark} />
            <Stat label="포지션" value={`${s.positions ?? positions.length}건`} color={colors.textPrimary} colors={colors} lineSep={lineSep} dark={dark} />
            <Stat label="승률" value={winRate != null ? `${winRate}%` : '–'} color={colors.textPrimary} colors={colors} lineSep={lineSep} dark={dark} />
          </div>

          {/* 포지션 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {positions.map((p, i) => (
              <PositionRow key={`${p.date}-${p.stock_code}-${i}`} p={p} colors={colors} dark={dark} lineSep={lineSep} colorOf={colorOf} />
            ))}
          </div>

          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 12, lineHeight: 1.6 }}>
            {data.updated_at && <>갱신 {data.updated_at.slice(0, 10)} · </>}
            슬리피지·거래정지 갭 미반영 가상 성과입니다. 투자 판단·책임은 본인에게 있습니다.
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, color, colors, lineSep, dark, big }) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 12, border: `1px solid ${lineSep}`,
      background: dark ? '#141416' : '#FFF',
    }}>
      <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{label}</div>
      <div style={{
        fontSize: big ? 18 : 14, fontWeight: 800, fontFamily: FONTS.mono, color,
      }}>{value}</div>
    </div>
  )
}

function PositionRow({ p, colors, dark, lineSep, colorOf }) {
  const st = STATUS[p.status] || STATUS.pending
  const cur = p.status === 'closed' ? p.exit_price : p.last_price
  return (
    <div style={{
      padding: '12px 14px', borderRadius: 12, border: `1px solid ${lineSep}`,
      background: dark ? '#141416' : '#FFF',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4,
          background: st.bg, color: st.fg, flexShrink: 0,
        }}>{st.label}</span>
        {p.role === 'primary' && (
          <span style={{
            fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
            background: 'rgba(220,38,38,0.1)', color: '#DC2626', flexShrink: 0,
          }}>대표</span>
        )}
        <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>{p.corp_name}</span>
        <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>{p.stock_code}</span>
        <span style={{ marginLeft: 'auto', fontSize: 15, fontWeight: 800, fontFamily: FONTS.mono, color: colorOf(p.ret_pct) }}>
          {pct(p.ret_pct)}
        </span>
      </div>
      <div style={{
        display: 'flex', gap: 14, marginTop: 8, fontSize: 12, color: colors.textMuted,
        fontFamily: FONTS.mono, flexWrap: 'wrap',
      }}>
        <span>{p.date}</span>
        <span>진입 {price(p.entry_price)}</span>
        <span>{p.status === 'closed' ? '청산' : '현재'} {price(cur)}</span>
        {typeof p.pnl_won === 'number' && (
          <span style={{ color: colorOf(p.pnl_won) }}>{won(p.pnl_won)}</span>
        )}
      </div>
      {p.note && p.status === 'pending' && (
        <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 6 }}>{p.note}</div>
      )}
    </div>
  )
}

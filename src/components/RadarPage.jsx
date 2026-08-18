import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'

/**
 * 레이더 — 고관여 투자자용 수급·이벤트 리더보드.
 *
 * Fintel 벤치마킹의 한국판이되 __복제가 아니다__:
 *   · 13F(기관 분기 보유)  → 한국에 제도가 없다 → 시장경보로 대체
 *   · 옵션 플로우          → 개별주식옵션 유동성이 없다 → 버림
 *   · 숏스퀴즈 __점수__    → 만들 수 없다(스퀴즈는 공매도 잔고의 함수인데 그 잔고가 막혀 있다)
 *                            → 대차잔고 __급증 사실__만 랭킹
 *   · 소수계좌·투자경고    → 미국에 없는 __우리 고유 카드__
 *
 * ⚠️ 여기 있는 건 전부 __관측된 사실__이다. "확률"·"점수"·"추천"을 붙이지 않는다.
 *    표기 규칙을 어기면 없는 근거를 만드는 것이고, 규제 노출도 올라간다.
 */
export default function RadarPage() {
  const { colors, dark } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openNote, setOpenNote] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/radar/boards?limit=10`)
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const sep = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'
  const card = {
    border: `1px solid ${sep}`, borderRadius: 14,
    background: dark ? '#141416' : '#fff', overflow: 'hidden', marginBottom: 14,
  }
  const head = {
    display: 'flex', alignItems: 'baseline', gap: 8,
    padding: '14px 16px 10px', borderBottom: `1px solid ${sep}`,
  }
  const title = { fontSize: 15, fontWeight: 800, color: colors.textPrimary, margin: 0 }
  const sub = { fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }
  const row = {
    display: 'grid', gridTemplateColumns: '18px 1fr auto',
    gap: 10, alignItems: 'center', padding: '10px 16px',
    borderBottom: `1px solid ${sep}`,
  }
  const rank = { fontSize: 11, fontWeight: 700, color: colors.textMuted, fontFamily: FONTS.mono }
  const nameS = { fontSize: 13.5, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.3 }
  const codeS = { fontSize: 10.5, color: colors.textMuted, fontFamily: FONTS.mono }
  const val = { fontSize: 13, fontWeight: 700, fontFamily: FONTS.mono, textAlign: 'right' }
  const valSub = { fontSize: 10.5, color: colors.textMuted, fontFamily: FONTS.mono, textAlign: 'right' }
  const noteBtn = {
    marginLeft: 'auto', fontSize: 10.5, color: colors.textMuted,
    background: 'transparent', border: `1px solid ${sep}`, borderRadius: 6,
    padding: '2px 7px', cursor: 'pointer',
  }
  const noteBox = {
    padding: '10px 16px', fontSize: 11.5, lineHeight: 1.7,
    color: colors.textSecondary, background: dark ? '#1A1A1E' : '#FAFAFA',
    borderBottom: `1px solid ${sep}`,
  }
  const num = (n) => (n == null ? '-' : n.toLocaleString())
  const signed = (n) => (n == null ? '-' : `${n > 0 ? '+' : ''}${n.toLocaleString()}`)
  const up = '#E8364E', down = '#0D9488'

  const Board = ({ id, name, asOf, note, children }) => (
    <div style={card}>
      <div style={head}>
        <h2 style={title}>{name}</h2>
        {asOf && <span style={sub}>{asOf}</span>}
        <button style={noteBtn} onClick={() => setOpenNote(openNote === id ? null : id)}>
          {openNote === id ? '닫기' : '읽는 법'}
        </button>
      </div>
      {openNote === id && note && <div style={noteBox}>{note}</div>}
      {children}
    </div>
  )

  const fmtDate = (d) => (d && d.length === 8 ? `${d.slice(4, 6)}/${d.slice(6)}` : d || '')

  if (loading) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 16px', textAlign: 'center',
                    color: colors.textMuted, fontFamily: FONTS.body }}>
        불러오는 중…
      </div>
    )
  }

  const b = (data && data.boards) || {}
  const asOf = (data && data.as_of) || {}
  const notes = (data && data.notes) || {}

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto', padding: '20px 16px',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>
      {/* ── 헤더 ── */}
      <div style={{ marginBottom: 18 }}>
        <div style={{
          display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '3px 8px',
          borderRadius: 5, background: '#DC2626', color: '#fff', marginBottom: 8,
        }}>레이더</div>
        <h1 style={{
          fontSize: 24, fontWeight: 900, color: colors.textPrimary, margin: '0 0 6px',
          fontFamily: FONTS.serif, lineHeight: 1.3,
        }}>수급·이벤트 레이더</h1>
        <p style={{ fontSize: 13, color: colors.textMuted, margin: 0, lineHeight: 1.6 }}>
          공매도·대차·시장경보·내부자를 매일 관측해 순위로 보여줍니다.
          예측이 아니라 <b style={{ color: colors.textSecondary }}>일어난 사실</b>입니다.
        </p>
      </div>

      {/* ── 1) 대차잔고 급증 ── */}
      <Board id="lend" name="대차잔고 급증" asOf={fmtDate(asOf.lending)} note={notes.lending_surge}>
        {(b.lending_surge || []).map((x, i) => (
          <div key={x.stock_code} style={row}>
            <span style={rank}>{i + 1}</span>
            <div>
              <div style={nameS}>{x.corp_name}</div>
              <div style={codeS}>{x.stock_code} · 잔고 {x.remain_amt_bil}십억</div>
            </div>
            <div>
              <div style={{ ...val, color: up }}>{signed(x.net_qty)}</div>
              <div style={valSub}>{x.net_pct != null ? `잔고 +${x.net_pct}%` : ''}</div>
            </div>
          </div>
        ))}
        {!(b.lending_surge || []).length && <div style={noteBox}>데이터 없음</div>}
      </Board>

      {/* ── 2) 공매도 비중 ── */}
      <Board id="short" name="공매도 비중 상위" asOf={fmtDate(asOf.short)} note={notes.short_weight}>
        {(b.short_weight || []).map((x, i) => (
          <div key={x.stock_code} style={row}>
            <span style={rank}>{i + 1}</span>
            <div>
              <div style={nameS}>{x.corp_name}</div>
              <div style={codeS}>{x.stock_code} · {num(x.short_qty)} / {num(x.trade_qty)}주</div>
            </div>
            <div>
              <div style={{ ...val, color: colors.textPrimary }}>{x.weight_pct}%</div>
              <div style={{ ...valSub, color: x.chg_pct > 0 ? up : down }}>
                {x.chg_pct != null ? `${x.chg_pct > 0 ? '+' : ''}${x.chg_pct}%` : ''}
              </div>
            </div>
          </div>
        ))}
        {!(b.short_weight || []).length && <div style={noteBox}>데이터 없음</div>}
      </Board>

      {/* ── 3) 시장경보 — 한국 고유 카드 ── */}
      <Board id="alert" name="시장경보" asOf="최근 4일" note={notes.market_alerts}>
        {(b.market_alerts || []).map((x, i) => (
          <div key={x.rcept_no} style={{ ...row, gridTemplateColumns: '18px 1fr' }}>
            <span style={rank}>{i + 1}</span>
            <div>
              <div style={nameS}>{x.corp_name}</div>
              <div style={{ ...codeS, color: colors.textSecondary, marginTop: 2 }}>{x.alert}</div>
            </div>
          </div>
        ))}
        {!(b.market_alerts || []).length && (
          <div style={noteBox}>
            최근 4일 시장경보가 없습니다. 0건은 <b>“신호가 없었다”가 아니라 “수집이 멈췄다”</b>일 수
            있어 별도 점검 대상입니다.
          </div>
        )}
      </Board>

      {/* ── 4) 내부자 공시 ── */}
      <Board id="ins" name="내부자 공시" asOf="최근 7일" note={notes.insider}>
        {(b.insider || []).map((x, i) => (
          <div key={x.rcept_no} style={{ ...row, gridTemplateColumns: '18px 1fr' }}>
            <span style={rank}>{i + 1}</span>
            <div>
              <div style={nameS}>{x.corp_name}</div>
              <div style={codeS}>{x.stock_code} · {x.report_nm}</div>
            </div>
          </div>
        ))}
        {!(b.insider || []).length && <div style={noteBox}>데이터 없음</div>}
      </Board>

      {/* ── 푸터 고지 ── */}
      <p style={{
        fontSize: 11, color: colors.textMuted, lineHeight: 1.7, marginTop: 18,
        paddingTop: 14, borderTop: `1px solid ${sep}`,
      }}>
        관측된 사실만 싣습니다. 매매 권유가 아니며 목표가·확률을 제시하지 않습니다.
        대차잔고는 공매도 잔고의 대용치이고, 내부자 공시는 취득·처분 방법이 아직 판독되지
        않아 <b style={{ color: colors.textSecondary }}>장내매수로 단정할 수 없습니다.</b>
      </p>
    </div>
  )
}

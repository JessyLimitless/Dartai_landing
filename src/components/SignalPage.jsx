import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const API = import.meta.env.VITE_API_URL || ''

const TYPE_META = {
  '자사주취득': '자사주 매입 공시',
  '투자경고': '거래소 투자경고',
  'CB발행': '전환사채 발행',
  '유상증자': '유상증자 결정',
  '배당결정': '배당 결정',
  '밸류업': '밸류업 계획',
  '공급계약': '공급계약 체결',
  '실적공시': '실적 변동 공시',
  '투자주의': '투자주의 지정',
  '자사주처분': '자사주 처분',
  '무상증자': '무상증자 결정',
  '대량보유_신규': '신규 대량보유',
  '대량보유_변동': '대량보유 변동',
  '임원지분변동': '임원 지분 변동',
  '주식분할': '주식 분할',
}

// 승률 원형 게이지
function WinGauge({ rate, size = 36 }) {
  const r = (size - 4) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (rate / 100) * circ
  const color = rate >= 60 ? '#DC2626' : rate >= 50 ? '#F59E0B' : '#3B82F6'
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="currentColor" strokeWidth="3" opacity="0.06" />
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease-out' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fontSize: 9, fontWeight: 800, fontFamily: FONTS.mono, fill: color }}>
        {rate.toFixed(0)}
      </text>
    </svg>
  )
}

export default function SignalPage() {
  const { dark, colors } = useTheme()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedIdx, setExpandedIdx] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/impact`)
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const sep = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
  const totalSamples = items.reduce((a, i) => a + i.count, 0)

  // 양수/음수 분리
  const positive = items.filter(i => (i.avg_excess_close || 0) >= 0)
  const negative = items.filter(i => (i.avg_excess_close || 0) < 0)

  const RankCard = ({ item, rank, globalIdx }) => {
    const excess = item.avg_excess_close || 0
    const isPositive = excess >= 0
    const winRate = item.win_rate || 0
    const desc = TYPE_META[item.type] || ''
    const expanded = expandedIdx === globalIdx
    const isTop3 = rank <= 3 && isPositive

    return (
      <div
        className="touch-press"
        onClick={() => setExpandedIdx(expanded ? null : globalIdx)}
        style={{
          padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
          marginBottom: 8,
          background: dark
            ? (isTop3 ? 'rgba(220,38,38,0.04)' : 'rgba(255,255,255,0.02)')
            : (isTop3 ? 'rgba(220,38,38,0.02)' : '#FAFAFA'),
          border: `1px solid ${isTop3 ? (dark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.08)') : sep}`,
          transition: 'background 0.15s',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* 순위 뱃지 */}
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isTop3 ? PREMIUM.accent : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
            flexShrink: 0,
          }}>
            <span style={{
              fontSize: 12, fontWeight: 900, fontFamily: FONTS.mono,
              color: isTop3 ? '#fff' : colors.textMuted,
            }}>{rank}</span>
          </div>

          {/* 유형명 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 15, fontWeight: 800, color: colors.textPrimary,
              letterSpacing: '-0.3px',
            }}>{item.type}</div>
            <div style={{
              fontSize: 10, color: colors.textMuted, marginTop: 1,
            }}>{desc} <span style={{ fontFamily: FONTS.mono }}>{item.count}건</span></div>
          </div>

          {/* 초과수익률 */}
          <div style={{ textAlign: 'right', marginRight: 4, flexShrink: 0 }}>
            <div style={{
              fontSize: 20, fontWeight: 900, fontFamily: FONTS.mono,
              color: isPositive ? '#DC2626' : '#2563EB',
              lineHeight: 1,
            }}>{excess >= 0 ? '+' : ''}{excess.toFixed(2)}%</div>
          </div>

          {/* 승률 게이지 */}
          <WinGauge rate={winRate} />
        </div>

        {/* 확장: 주요 사례 */}
        {expanded && item.top_samples && item.top_samples.length > 0 && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 10,
            background: dark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
          }}>
            {item.top_samples.map((s, si) => (
              <div key={si} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 0',
                borderBottom: si < item.top_samples.length - 1 ? `1px solid ${sep}` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: colors.textPrimary,
                  }}>{s.corp_name}</span>
                  <span style={{
                    fontSize: 9, color: colors.textMuted, fontFamily: FONTS.mono,
                  }}>{s.date.slice(5)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontSize: 9, color: colors.textMuted, fontFamily: FONTS.mono,
                  }}>시장{s.market_ret >= 0 ? '+' : ''}{s.market_ret}%</span>
                  <span style={{
                    fontSize: 13, fontWeight: 900, fontFamily: FONTS.mono,
                    color: s.excess >= 0 ? '#DC2626' : '#2563EB',
                  }}>{s.excess >= 0 ? '+' : ''}{s.excess}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>
      {/* 헤더 */}
      <div style={{ padding: '28px 24px 0' }}>
        <h1 style={{
          fontSize: 24, fontWeight: 900, color: colors.textPrimary,
          fontFamily: FONTS.serif, margin: 0, letterSpacing: '-0.5px',
        }}>공시 시그널</h1>
        <p style={{
          fontSize: 13, color: colors.textMuted, marginTop: 4, margin: '4px 0 0',
          lineHeight: 1.5,
        }}>공시 유형별 초과수익률 순위 — 시장 수익률을 차감한 순수 공시 효과</p>
      </div>

      {/* 요약 카드 */}
      {totalSamples > 0 && (
        <div style={{
          margin: '16px 24px', padding: '14px 18px', borderRadius: 12,
          background: dark ? 'rgba(220,38,38,0.04)' : 'rgba(220,38,38,0.02)',
          borderLeft: `3px solid ${PREMIUM.accent}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontSize: 11, color: colors.textMuted }}>분석 표본</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: FONTS.mono, color: PREMIUM.accent }}>
              {totalSamples.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 600 }}>건</span>
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: colors.textMuted }}>공시 유형</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: FONTS.mono, color: colors.textPrimary }}>
              {items.length}<span style={{ fontSize: 11, fontWeight: 600 }}>개</span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: colors.textMuted }}>최고 승률</div>
            <div style={{ fontSize: 20, fontWeight: 900, fontFamily: FONTS.mono, color: '#DC2626' }}>
              {items.length > 0 ? Math.max(...items.map(i => i.win_rate || 0)).toFixed(0) : 0}%
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: colors.textMuted, fontSize: 13 }}>
          분석 중...
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: colors.textMuted, fontSize: 13 }}>
          데이터 수집 중
        </div>
      ) : (
        <>
          {/* 상승 시그널 */}
          {positive.length > 0 && (
            <div style={{ padding: '0 24px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: 10, marginTop: 8,
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1L10 7H2Z" fill="#DC2626"/></svg>
                <span style={{
                  fontSize: 12, fontWeight: 800, color: '#DC2626', letterSpacing: '-0.2px',
                }}>상승 시그널</span>
                <span style={{ fontSize: 10, color: colors.textMuted }}>공시 후 시장 대비 상승</span>
              </div>
              {positive.map((item, idx) => (
                <RankCard key={item.type} item={item} rank={idx + 1}
                  globalIdx={items.indexOf(item)} />
              ))}
            </div>
          )}

          {/* 하락 시그널 */}
          {negative.length > 0 && (
            <div style={{ padding: '0 24px', marginTop: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                marginBottom: 10,
              }}>
                <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 11L10 5H2Z" fill="#2563EB"/></svg>
                <span style={{
                  fontSize: 12, fontWeight: 800, color: '#2563EB', letterSpacing: '-0.2px',
                }}>하락 시그널</span>
                <span style={{ fontSize: 10, color: colors.textMuted }}>공시 후 시장 대비 하락</span>
              </div>
              {negative.map((item, idx) => (
                <RankCard key={item.type} item={item} rank={idx + 1}
                  globalIdx={items.indexOf(item)} />
              ))}
            </div>
          )}

          {/* 면책 */}
          <div style={{
            padding: '20px 24px 16px', fontSize: 10, color: colors.textMuted,
            lineHeight: 1.6, textAlign: 'center',
          }}>
            과거 실적 기반 통계이며 미래 수익을 보장하지 않습니다
            <br />
            초과수익률 = 종목 수익률 - 시장(전체종목 평균) 수익률
          </div>
        </>
      )}
    </div>
  )
}

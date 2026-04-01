import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const API = import.meta.env.VITE_API_URL || ''

const TYPE_META = {
  '자사주취득': '자사주 매입',
  '투자경고': '투자경고 지정',
  'CB발행': '전환사채 발행',
  '유상증자': '유상증자',
  '배당결정': '배당 결정',
  '밸류업': '밸류업 계획',
  '공급계약': '공급계약 체결',
  '실적공시': '실적 변동',
  '투자주의': '투자주의 지정',
  '자사주처분': '자사주 처분',
  '무상증자': '무상증자',
  '대량보유_신규': '신규 대량보유',
  '대량보유_변동': '대량보유 변동',
  '임원지분변동': '임원 지분 변동',
  '주식분할': '주식 분할',
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

  const totalSamples = items.reduce((a, i) => a + i.count, 0)
  const positive = items.filter(i => (i.avg_excess_close || 0) >= 0)
  const negative = items.filter(i => (i.avg_excess_close || 0) < 0)

  const cardBg = dark ? '#1C1C1E' : '#FFFFFF'
  const cardBorder = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'
  const subtleBg = dark ? 'rgba(255,255,255,0.03)' : '#F7F7F8'

  const SignalRow = ({ item, rank, globalIdx, isPositive }) => {
    const excess = item.avg_excess_close || 0
    const winRate = item.win_rate || 0
    const desc = TYPE_META[item.type] || ''
    const expanded = expandedIdx === globalIdx

    return (
      <div
        className="touch-press"
        onClick={() => setExpandedIdx(expanded ? null : globalIdx)}
        style={{
          display: 'flex', flexDirection: 'column',
          padding: '16px 18px', cursor: 'pointer',
          borderBottom: `1px solid ${cardBorder}`,
        }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* 순위 */}
          <span style={{
            fontSize: 14, fontWeight: 800, fontFamily: FONTS.mono,
            color: rank <= 3 && isPositive ? PREMIUM.accent : colors.textMuted,
            width: 22, flexShrink: 0,
          }}>{rank}</span>

          {/* 유형 + 설명 */}
          <div style={{ flex: 1, minWidth: 0, marginLeft: 8 }}>
            <span style={{
              fontSize: 15, fontWeight: 700, color: colors.textPrimary,
              letterSpacing: '-0.3px',
            }}>{item.type}</span>
            <span style={{
              fontSize: 11, color: colors.textMuted, marginLeft: 6,
            }}>{desc}</span>
          </div>

          {/* 초과수익률 */}
          <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
            <span style={{
              fontSize: 18, fontWeight: 800, fontFamily: FONTS.mono,
              color: isPositive ? '#F04452' : '#3182F6',
              letterSpacing: '-0.5px',
            }}>{excess >= 0 ? '+' : ''}{excess.toFixed(2)}%</span>
          </div>
        </div>

        {/* 하단 바 + 승률 + 표본 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, marginLeft: 30 }}>
          {/* 승률 바 */}
          <div style={{
            flex: 1, height: 4, borderRadius: 2,
            background: dark ? 'rgba(255,255,255,0.06)' : '#EEEFF1',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              width: `${Math.min(winRate, 100)}%`,
              background: isPositive
                ? (winRate >= 60 ? '#F04452' : winRate >= 50 ? '#FF8A3D' : '#B0B8C1')
                : '#3182F6',
              transition: 'width 0.6s ease-out',
            }} />
          </div>
          <span style={{
            fontSize: 11, fontWeight: 700, fontFamily: FONTS.mono, flexShrink: 0,
            color: winRate >= 60 ? '#F04452' : winRate >= 50 ? '#FF8A3D' : colors.textMuted,
          }}>{winRate.toFixed(0)}%</span>
          <span style={{
            fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono, flexShrink: 0,
          }}>{item.count}건</span>
        </div>

        {/* 확장: 사례 */}
        {expanded && item.top_samples && item.top_samples.length > 0 && (
          <div style={{
            marginTop: 12, marginLeft: 30, padding: '10px 14px', borderRadius: 10,
            background: subtleBg,
          }}>
            {item.top_samples.map((s, si) => (
              <div key={si} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '5px 0',
                borderBottom: si < item.top_samples.length - 1 ? `1px solid ${cardBorder}` : 'none',
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>
                  {s.corp_name}
                  <span style={{ fontSize: 9, color: colors.textMuted, fontFamily: FONTS.mono, marginLeft: 4 }}>{s.date.slice(5)}</span>
                </span>
                <span style={{
                  fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono,
                  color: s.excess >= 0 ? '#F04452' : '#3182F6',
                }}>{s.excess >= 0 ? '+' : ''}{s.excess}%</span>
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
      {/* 헤더 — 토스 스타일 */}
      <div style={{ padding: '32px 24px 20px' }}>
        <h1 style={{
          fontSize: 22, fontWeight: 800, color: colors.textPrimary,
          margin: 0, letterSpacing: '-0.5px',
        }}>공시 시그널</h1>
        <p style={{
          fontSize: 14, color: colors.textMuted, margin: '6px 0 0',
          lineHeight: 1.5, letterSpacing: '-0.2px',
        }}>공시 유형별 초과수익률을 분석했어요</p>
      </div>

      {/* 요약 3칸 */}
      {totalSamples > 0 && (
        <div style={{
          margin: '0 20px 20px', padding: '18px 0', borderRadius: 16,
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          display: 'flex',
        }}>
          {[
            { label: '분석 표본', value: totalSamples.toLocaleString(), unit: '건', color: colors.textPrimary },
            { label: '공시 유형', value: items.length, unit: '개', color: colors.textPrimary },
            { label: '최고 승률', value: items.length > 0 ? Math.max(...items.map(i => i.win_rate || 0)).toFixed(0) : '0', unit: '%', color: '#F04452' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, textAlign: 'center',
              borderRight: i < 2 ? `1px solid ${cardBorder}` : 'none',
            }}>
              <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: FONTS.mono, color: s.color, letterSpacing: '-0.5px' }}>
                {s.value}<span style={{ fontSize: 11, fontWeight: 500 }}>{s.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: colors.textMuted, fontSize: 14 }}>
          분석 중...
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: colors.textMuted, fontSize: 14 }}>
          데이터를 수집하고 있어요
        </div>
      ) : (
        <>
          {/* 상승 시그널 */}
          {positive.length > 0 && (
            <div style={{
              margin: '0 20px 12px', borderRadius: 16, overflow: 'hidden',
              background: cardBg, border: `1px solid ${cardBorder}`,
            }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: `1px solid ${cardBorder}`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#F04452' }}>상승 시그널</span>
                <span style={{ fontSize: 11, color: colors.textMuted }}>시장 대비 초과 상승</span>
              </div>
              {positive.map((item, idx) => (
                <SignalRow key={item.type} item={item} rank={idx + 1}
                  globalIdx={items.indexOf(item)} isPositive={true} />
              ))}
            </div>
          )}

          {/* 하락 시그널 */}
          {negative.length > 0 && (
            <div style={{
              margin: '0 20px 12px', borderRadius: 16, overflow: 'hidden',
              background: cardBg, border: `1px solid ${cardBorder}`,
            }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: `1px solid ${cardBorder}`,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#3182F6' }}>하락 시그널</span>
                <span style={{ fontSize: 11, color: colors.textMuted }}>시장 대비 초과 하락</span>
              </div>
              {negative.map((item, idx) => (
                <SignalRow key={item.type} item={item} rank={idx + 1}
                  globalIdx={items.indexOf(item)} isPositive={false} />
              ))}
            </div>
          )}

          {/* 안내 — 토스 스타일 */}
          <div style={{
            margin: '8px 20px 0', padding: '16px 18px', borderRadius: 16,
            background: subtleBg,
          }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.textSecondary, marginBottom: 6 }}>
              이렇게 분석했어요
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.7 }}>
              초과수익률은 공시 당일 종목 수익률에서 시장 전체 수익률을 뺀 값이에요. 시장이 올라도 공시 효과만 분리해서 측정해요.
            </div>
          </div>

          {/* 면책 */}
          <div style={{
            padding: '16px 24px 20px', fontSize: 11, color: colors.textMuted,
            lineHeight: 1.6, textAlign: 'center',
          }}>
            과거 실적 기반이며 미래 수익을 보장하지 않아요
          </div>
        </>
      )}
    </div>
  )
}

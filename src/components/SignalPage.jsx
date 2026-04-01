import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const API = import.meta.env.VITE_API_URL || ''

const TYPE_META = {
  '자사주취득': '회사가 자기 주식을 매입',
  '투자경고': '거래소 투자경고 지정',
  'CB발행': '전환사채 발행 결정',
  '유상증자': '신주 발행 자금 조달',
  '배당결정': '현금/현물 배당 결정',
  '밸류업': '기업가치 제고 계획',
  '공급계약': '단일판매/공급계약 체결',
  '실적공시': '매출/손익 30%+ 변동',
  '투자주의': '소수계좌 집중매수 경고',
  '자사주처분': '보유 자사주 시장 매도',
  '무상증자': '무상 신주 배정',
  '대량보유_신규': '5%+ 신규 대량보유',
  '대량보유_변동': '대량보유 지분 변동',
  '임원지분변동': '임원/주요주주 지분 변동',
  '주식분할': '주식 액면분할',
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

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>
      {/* 헤더 */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <h1 style={{
            fontSize: 22, fontWeight: 800, color: colors.textPrimary,
            fontFamily: FONTS.serif, margin: 0,
          }}>공시 시그널</h1>
          {totalSamples > 0 && (
            <span style={{
              fontSize: 11, color: PREMIUM.accent, fontWeight: 700, fontFamily: FONTS.mono,
            }}>{totalSamples.toLocaleString()}건 분석</span>
          )}
        </div>
        <p style={{
          fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 1.5, margin: '6px 0 0',
        }}>어떤 공시가 나오면 주가는 어떻게 움직이는가</p>
      </div>

      {/* 핵심 수식 */}
      <div style={{
        margin: '16px 24px', padding: '12px 16px', borderRadius: 10,
        background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
        textAlign: 'center',
      }}>
        <span style={{
          fontSize: 12, fontFamily: FONTS.mono, color: colors.textSecondary, letterSpacing: 0.5,
        }}>
          <span style={{ color: PREMIUM.accent, fontWeight: 700 }}>초과수익률</span>
          {' = 종목 수익률 - 시장 수익률'}
        </span>
      </div>

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
          {/* 순위 리스트 */}
          <div style={{ padding: '4px 24px 0' }}>
            {items.map((item, idx) => {
              const excess = item.avg_excess_close || 0
              const isPositive = excess >= 0
              const winRate = item.win_rate || 0
              const desc = TYPE_META[item.type] || ''
              const expanded = expandedIdx === idx
              const rank = idx + 1

              // 순위별 강조
              const rankStyle = rank <= 3
                ? { color: PREMIUM.accent, fontWeight: 900 }
                : { color: colors.textMuted, fontWeight: 700 }

              return (
                <div key={item.type}
                  className="touch-press"
                  onClick={() => setExpandedIdx(expanded ? null : idx)}
                  style={{
                    padding: '16px 0',
                    borderBottom: idx < items.length - 1 ? `1px solid ${sep}` : 'none',
                    cursor: 'pointer',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* 순위 */}
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: rank <= 3
                        ? (dark ? 'rgba(220,38,38,0.1)' : 'rgba(220,38,38,0.06)')
                        : (dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'),
                      flexShrink: 0,
                    }}>
                      <span style={{
                        fontSize: 13, fontFamily: FONTS.mono, ...rankStyle,
                      }}>{rank}</span>
                    </div>

                    {/* 유형명 + 설명 */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 14, fontWeight: 800, color: colors.textPrimary,
                        }}>{item.type}</span>
                        <span style={{
                          fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono,
                        }}>{item.count}건</span>
                      </div>
                      <div style={{
                        fontSize: 11, color: colors.textMuted, marginTop: 2,
                      }}>{desc}</div>
                    </div>

                    {/* 초과수익률 + 승률 */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: 18, fontWeight: 900, fontFamily: FONTS.mono,
                        color: isPositive ? '#DC2626' : '#2563EB',
                        lineHeight: 1.2,
                      }}>{excess >= 0 ? '+' : ''}{excess.toFixed(2)}%</div>
                      <div style={{
                        fontSize: 10, marginTop: 2,
                        color: winRate >= 50 ? '#DC2626' : '#2563EB',
                        fontFamily: FONTS.mono, fontWeight: 600,
                      }}>
                        {'W '}{winRate.toFixed(0)}%
                      </div>
                    </div>
                  </div>

                  {/* 바 게이지 */}
                  <div style={{
                    marginTop: 10, height: 4, borderRadius: 2,
                    background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 2,
                      width: `${Math.min(winRate, 100)}%`,
                      background: isPositive
                        ? (winRate >= 50 ? '#DC2626' : '#F87171')
                        : '#3B82F6',
                      transition: 'width 0.8s ease-out',
                    }} />
                  </div>

                  {/* 확장: 주요 사례 */}
                  {expanded && item.top_samples && item.top_samples.length > 0 && (
                    <div style={{
                      marginTop: 12, padding: '10px 12px', borderRadius: 8,
                      background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                    }}>
                      <div style={{
                        fontSize: 10, fontWeight: 700, color: colors.textMuted,
                        marginBottom: 6, letterSpacing: 0.5,
                      }}>주요 사례</div>
                      {item.top_samples.map((s, si) => (
                        <div key={si} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '5px 0',
                          borderBottom: si < item.top_samples.length - 1 ? `1px solid ${sep}` : 'none',
                        }}>
                          <div>
                            <span style={{
                              fontSize: 12, fontWeight: 700, color: colors.textPrimary,
                            }}>{s.corp_name}</span>
                            <span style={{
                              fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono, marginLeft: 6,
                            }}>{s.date.slice(5)}</span>
                          </div>
                          <span style={{
                            fontSize: 12, fontWeight: 800, fontFamily: FONTS.mono,
                            color: s.excess >= 0 ? '#DC2626' : '#2563EB',
                          }}>{s.excess >= 0 ? '+' : ''}{s.excess}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 하단 범례 */}
          <div style={{
            margin: '20px 24px', padding: '14px 16px', borderRadius: 10,
            background: dark ? '#111113' : '#FAFAFA',
            border: `1px solid ${sep}`,
          }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
              {[
                { label: '초과수익률', desc: '시장 대비 추가 수익' },
                { label: 'W(승률)', desc: '초과수익 > 0 비율' },
                { label: '게이지', desc: '승률 시각화' },
              ].map(item => (
                <div key={item.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: colors.textSecondary }}>{item.label}</div>
                  <div style={{ fontSize: 9, color: colors.textMuted, marginTop: 1 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 면책 */}
          <div style={{
            padding: '8px 24px 16px', fontSize: 10, color: colors.textMuted,
            lineHeight: 1.5, textAlign: 'center',
          }}>
            과거 실적 기반 통계이며 미래 수익을 보장하지 않습니다
            <br />
            표본이 적은 유형은 참고용 | 데이터 축적에 따라 정확도 상승
          </div>
        </>
      )}
    </div>
  )
}

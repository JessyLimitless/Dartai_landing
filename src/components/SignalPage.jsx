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
  const topItem = positive[0]

  // 토스 컬러 시스템
  const toss = {
    red: '#F04452',
    redBg: dark ? 'rgba(240,68,82,0.08)' : 'rgba(240,68,82,0.04)',
    blue: '#3182F6',
    blueBg: dark ? 'rgba(49,130,246,0.08)' : 'rgba(49,130,246,0.04)',
    orange: '#FF8A3D',
    cardBg: dark ? '#1C1C1E' : '#FFFFFF',
    cardBorder: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    sectionBg: dark ? '#141416' : '#F4F5F7',
    dimText: dark ? '#6B7280' : '#8B95A1',
    subText: dark ? '#9CA3AF' : '#6B7684',
  }

  const SignalItem = ({ item, rank, globalIdx, isPositive }) => {
    const excess = item.avg_excess_close || 0
    const winRate = item.win_rate || 0
    const expanded = expandedIdx === globalIdx
    const accent = isPositive ? toss.red : toss.blue

    return (
      <div
        className="touch-press"
        onClick={() => setExpandedIdx(expanded ? null : globalIdx)}
        style={{ cursor: 'pointer' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '18px 20px',
        }}>
          {/* 순위 */}
          <div style={{
            width: 28, textAlign: 'center', flexShrink: 0,
          }}>
            <span style={{
              fontSize: rank <= 3 && isPositive ? 16 : 14,
              fontWeight: 900,
              fontFamily: FONTS.mono,
              color: rank <= 3 && isPositive ? toss.red : toss.dimText,
            }}>{rank}</span>
          </div>

          {/* 중앙: 유형 + 승률 바 */}
          <div style={{ flex: 1, marginLeft: 12, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: 15, fontWeight: 700, color: colors.textPrimary,
                letterSpacing: '-0.3px',
              }}>{item.type}</span>
              <span style={{
                fontSize: 10, color: toss.dimText,
                fontFamily: FONTS.mono,
              }}>{item.count}건</span>
            </div>
            {/* 승률 바 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginTop: 8,
            }}>
              <div style={{
                flex: 1, height: 6, borderRadius: 3,
                background: dark ? 'rgba(255,255,255,0.04)' : '#F2F3F5',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${Math.min(winRate, 100)}%`,
                  background: winRate >= 60 ? toss.red
                    : winRate >= 50 ? toss.orange
                    : dark ? 'rgba(255,255,255,0.12)' : '#D1D5DB',
                  transition: 'width 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
                }} />
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, fontFamily: FONTS.mono,
                color: winRate >= 60 ? toss.red : winRate >= 50 ? toss.orange : toss.dimText,
                width: 32, textAlign: 'right', flexShrink: 0,
              }}>
                {winRate.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* 우측: 초과수익률 */}
          <div style={{
            marginLeft: 16, flexShrink: 0, textAlign: 'right',
            minWidth: 72,
          }}>
            <div style={{
              fontSize: 20, fontWeight: 900,
              fontFamily: FONTS.mono,
              color: accent,
              letterSpacing: '-0.8px',
              lineHeight: 1,
            }}>{excess >= 0 ? '+' : ''}{excess.toFixed(2)}<span style={{ fontSize: 13 }}>%</span></div>
            <div style={{
              fontSize: 10, color: toss.dimText, marginTop: 4,
              letterSpacing: '-0.2px',
            }}>초과수익</div>
          </div>
        </div>

        {/* 구분선 */}
        <div style={{
          height: 1,
          background: toss.cardBorder,
          marginLeft: 60, marginRight: 20,
        }} />

        {/* 확장: 사례 */}
        {expanded && item.top_samples && item.top_samples.length > 0 && (
          <div style={{
            padding: '4px 20px 14px 60px',
            background: toss.sectionBg,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: toss.subText,
              padding: '10px 0 6px',
              letterSpacing: '-0.2px',
            }}>대표 사례</div>
            {item.top_samples.map((s, si) => (
              <div key={si} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0',
                borderBottom: si < item.top_samples.length - 1 ? `1px solid ${toss.cardBorder}` : 'none',
              }}>
                <div>
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: colors.textPrimary,
                  }}>{s.corp_name}</span>
                  <span style={{
                    fontSize: 10, color: toss.dimText, fontFamily: FONTS.mono, marginLeft: 6,
                  }}>{s.date.slice(2).replace('-', '.')}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{
                    fontSize: 10, color: toss.dimText, fontFamily: FONTS.mono,
                  }}>시장 {s.market_ret >= 0 ? '+' : ''}{s.market_ret}%</span>
                  <span style={{
                    fontSize: 14, fontWeight: 800, fontFamily: FONTS.mono,
                    color: s.excess >= 0 ? toss.red : toss.blue,
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
      fontFamily: FONTS.body,
      backgroundColor: dark ? '#000000' : '#F4F5F7',
      minHeight: '100vh',
    }}>
      {/* 헤더 */}
      <div style={{ padding: '36px 24px 24px' }}>
        <h1 style={{
          fontSize: 24, fontWeight: 800, color: colors.textPrimary,
          margin: 0, letterSpacing: '-0.8px',
        }}>공시 시그널</h1>
        <p style={{
          fontSize: 14, color: toss.subText, margin: '8px 0 0',
          lineHeight: 1.5, letterSpacing: '-0.3px',
        }}>어떤 공시가 나왔을 때 주가가 시장보다<br />더 올랐는지 데이터로 확인해 보세요</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 100, color: toss.dimText, fontSize: 14 }}>
          <div style={{
            width: 32, height: 32, border: `3px solid ${toss.cardBorder}`,
            borderTopColor: toss.red, borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          분석하고 있어요
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 100, color: toss.dimText, fontSize: 14 }}>
          데이터를 모으고 있어요
        </div>
      ) : (
        <>
          {/* 하이라이트 카드 */}
          {topItem && (
            <div style={{
              margin: '0 20px 16px', padding: '24px 22px', borderRadius: 20,
              background: dark
                ? 'linear-gradient(135deg, rgba(240,68,82,0.12) 0%, rgba(240,68,82,0.04) 100%)'
                : 'linear-gradient(135deg, rgba(240,68,82,0.06) 0%, rgba(255,255,255,1) 100%)',
              border: `1px solid ${dark ? 'rgba(240,68,82,0.15)' : 'rgba(240,68,82,0.1)'}`,
            }}>
              <div style={{ fontSize: 11, color: toss.subText, letterSpacing: '-0.2px' }}>
                가장 높은 초과수익률
              </div>
              <div style={{
                display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8,
              }}>
                <span style={{
                  fontSize: 32, fontWeight: 900, fontFamily: FONTS.mono,
                  color: toss.red, letterSpacing: '-1.5px', lineHeight: 1,
                }}>+{(topItem.avg_excess_close || 0).toFixed(2)}%</span>
                <span style={{
                  fontSize: 15, fontWeight: 700, color: colors.textPrimary,
                }}>{topItem.type}</span>
              </div>
              <div style={{
                display: 'flex', gap: 16, marginTop: 14,
              }}>
                <div>
                  <span style={{ fontSize: 10, color: toss.dimText }}>승률</span>
                  <span style={{
                    fontSize: 14, fontWeight: 800, fontFamily: FONTS.mono,
                    color: toss.red, marginLeft: 4,
                  }}>{(topItem.win_rate || 0).toFixed(0)}%</span>
                </div>
                <div>
                  <span style={{ fontSize: 10, color: toss.dimText }}>표본</span>
                  <span style={{
                    fontSize: 14, fontWeight: 800, fontFamily: FONTS.mono,
                    color: colors.textPrimary, marginLeft: 4,
                  }}>{topItem.count}건</span>
                </div>
                <div>
                  <span style={{ fontSize: 10, color: toss.dimText }}>전체</span>
                  <span style={{
                    fontSize: 14, fontWeight: 800, fontFamily: FONTS.mono,
                    color: colors.textPrimary, marginLeft: 4,
                  }}>{totalSamples.toLocaleString()}건</span>
                </div>
              </div>
            </div>
          )}

          {/* 상승 시그널 */}
          {positive.length > 0 && (
            <div style={{
              margin: '0 20px 12px', borderRadius: 20, overflow: 'hidden',
              background: toss.cardBg,
              border: `1px solid ${toss.cardBorder}`,
            }}>
              <div style={{
                padding: '16px 20px 12px',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: 3, background: toss.red,
                }} />
                <span style={{
                  fontSize: 14, fontWeight: 800, color: colors.textPrimary,
                  letterSpacing: '-0.3px',
                }}>상승 시그널</span>
                <span style={{ fontSize: 11, color: toss.dimText, marginLeft: 2 }}>
                  공시 후 시장보다 올랐어요
                </span>
              </div>
              <div style={{ height: 1, background: toss.cardBorder }} />
              {positive.map((item, idx) => (
                <SignalItem key={item.type} item={item} rank={idx + 1}
                  globalIdx={items.indexOf(item)} isPositive={true} />
              ))}
            </div>
          )}

          {/* 하락 시그널 */}
          {negative.length > 0 && (
            <div style={{
              margin: '0 20px 12px', borderRadius: 20, overflow: 'hidden',
              background: toss.cardBg,
              border: `1px solid ${toss.cardBorder}`,
            }}>
              <div style={{
                padding: '16px 20px 12px',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 6, height: 6, borderRadius: 3, background: toss.blue,
                }} />
                <span style={{
                  fontSize: 14, fontWeight: 800, color: colors.textPrimary,
                  letterSpacing: '-0.3px',
                }}>하락 시그널</span>
                <span style={{ fontSize: 11, color: toss.dimText, marginLeft: 2 }}>
                  공시 후 시장보다 내렸어요
                </span>
              </div>
              <div style={{ height: 1, background: toss.cardBorder }} />
              {negative.map((item, idx) => (
                <SignalItem key={item.type} item={item} rank={idx + 1}
                  globalIdx={items.indexOf(item)} isPositive={false} />
              ))}
            </div>
          )}

          {/* 안내 */}
          <div style={{
            margin: '4px 20px', padding: '18px 20px', borderRadius: 16,
            background: toss.cardBg,
            border: `1px solid ${toss.cardBorder}`,
          }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: colors.textPrimary,
              letterSpacing: '-0.3px', marginBottom: 8,
            }}>이렇게 계산했어요</div>
            <div style={{
              fontSize: 12, color: toss.subText, lineHeight: 1.8,
              letterSpacing: '-0.2px',
            }}>
              초과수익률 = 종목 수익률 - 시장 수익률
              <br />
              승률 = 초과수익률이 0보다 큰 비율
              <br />
              시장이 올라도 공시 효과만 분리해요
            </div>
          </div>

          {/* 면책 */}
          <div style={{
            padding: '16px 24px 24px', fontSize: 11, color: toss.dimText,
            lineHeight: 1.6, textAlign: 'center', letterSpacing: '-0.2px',
          }}>
            과거 데이터 기반이며 미래 수익을 보장하지 않아요
          </div>
        </>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const API = import.meta.env.VITE_API_URL || ''

const TYPE_LABELS = {
  '자사주취득': { emoji: '', desc: '회사가 자기 주식을 되사는 공시' },
  '투자경고': { emoji: '', desc: '거래소가 투자경고를 지정한 종목' },
  'CB발행': { emoji: '', desc: '전환사채 발행 결정 공시' },
  '유상증자': { emoji: '', desc: '신주 발행으로 자금 조달' },
  '배당결정': { emoji: '', desc: '현금/현물 배당 결정 공시' },
  '밸류업': { emoji: '', desc: '기업가치 제고 계획 자율공시' },
  '공급계약': { emoji: '', desc: '단일판매/공급계약 체결 공시' },
  '실적공시': { emoji: '', desc: '매출/손익 30% 이상 변동 공시' },
  '투자주의': { emoji: '', desc: '소수계좌 집중매수 등 거래소 경고' },
  '자사주처분': { emoji: '', desc: '보유 자사주를 시장에 매도' },
  '무상증자': { emoji: '', desc: '주주에게 무상으로 신주 배정' },
  '대량보유_신규': { emoji: '', desc: '5% 이상 신규 대량보유 보고' },
  '대량보유_변동': { emoji: '', desc: '기존 대량보유 지분 변동 보고' },
  '임원지분변동': { emoji: '', desc: '임원/주요주주 지분 변동 보고' },
  '주식분할': { emoji: '', desc: '주식 액면분할 결정' },
}

export default function SignalPage() {
  const { dark, colors } = useTheme()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/impact`)
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const maxAbs = Math.max(...items.map(i => Math.abs(i.avg_excess_close || 0)), 1)

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>
      {/* 헤더 */}
      <div style={{ padding: '24px 24px 0' }}>
        <h1 style={{
          fontSize: 22, fontWeight: 800, color: colors.textPrimary,
          fontFamily: FONTS.serif, margin: 0,
        }}>공시 시그널</h1>
        <p style={{
          fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 1.5,
        }}>공시가 주가에 미치는 영향을 데이터로 측정합니다</p>
      </div>

      {/* 설명 카드 */}
      <div style={{
        margin: '16px 24px', padding: '14px 18px', borderRadius: 12,
        background: dark ? 'rgba(220,38,38,0.04)' : 'rgba(220,38,38,0.02)',
        borderLeft: `3px solid ${PREMIUM.accent}`,
      }}>
        <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.6 }}>
          <strong style={{ color: PREMIUM.accent }}>초과수익률</strong> = 공시 종목 수익률 - 시장 수익률 (같은 날)
          <br />
          시장 전체가 올라도 <strong>공시 효과만</strong> 분리해서 측정합니다
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>
          분석 중...
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>
          데이터 수집 중 (최소 1주일 필요)
        </div>
      ) : (
        <>
          {/* 메인 차트 */}
          <div style={{ padding: '8px 24px' }}>
            {items.map((item, idx) => {
              const excess = item.avg_excess_close || 0
              const isPositive = excess >= 0
              const barWidth = Math.min(Math.abs(excess) / maxAbs * 100, 100)
              const winRate = item.win_rate || 0
              const info = TYPE_LABELS[item.type] || { emoji: '', desc: '' }

              return (
                <div key={item.type} style={{
                  padding: '14px 0',
                  borderBottom: idx < items.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` : 'none',
                }}>
                  {/* 유형명 + 표본 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 14, fontWeight: 800, color: colors.textPrimary,
                      }}>{item.type}</span>
                      <span style={{
                        fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono,
                      }}>{item.count}건</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{
                        fontSize: 16, fontWeight: 800, fontFamily: FONTS.mono,
                        color: isPositive ? '#DC2626' : '#2563EB',
                      }}>{excess >= 0 ? '+' : ''}{excess.toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* 바 차트 */}
                  <div style={{
                    height: 6, borderRadius: 3,
                    background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    overflow: 'hidden', marginBottom: 6,
                  }}>
                    <div style={{
                      height: '100%', borderRadius: 3,
                      width: `${barWidth}%`,
                      background: isPositive
                        ? 'linear-gradient(90deg, #DC2626, #EF4444)'
                        : 'linear-gradient(90deg, #2563EB, #3B82F6)',
                      transition: 'width 0.6s ease-out',
                    }} />
                  </div>

                  {/* 승률 + 설명 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: colors.textMuted }}>{info.desc}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 10, color: colors.textMuted }}>승률</span>
                      <span style={{
                        fontSize: 11, fontWeight: 700, fontFamily: FONTS.mono,
                        color: winRate >= 50 ? '#DC2626' : '#2563EB',
                      }}>{winRate.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* 상위 사례 (확장) */}
                  {item.top_samples && item.top_samples.length > 0 && (
                    <div style={{ marginTop: 8 }}>
                      {item.top_samples.slice(0, 2).map((s, si) => (
                        <div key={si} style={{
                          fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono,
                          padding: '2px 0',
                        }}>
                          {s.corp_name} ({s.date.slice(5)}) 종목{s.stock_ret >= 0 ? '+' : ''}{s.stock_ret}% 시장{s.market_ret >= 0 ? '+' : ''}{s.market_ret}%
                          {' '}<span style={{ color: s.excess >= 0 ? '#DC2626' : '#2563EB', fontWeight: 700 }}>
                            초과{s.excess >= 0 ? '+' : ''}{s.excess}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 요약 카드 */}
          <div style={{
            margin: '16px 24px', padding: '16px 18px', borderRadius: 12,
            background: dark ? '#111113' : '#FAFAFA',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          }}>
            <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.7 }}>
              <strong style={{ color: colors.textPrimary }}>분석 기준</strong>
              <br />
              표본: {items.reduce((a, i) => a + i.count, 0).toLocaleString()}건
              {' | '}기간: 2026.02.23 ~ 현재
              <br />
              시장수익률: 당일 전체 추적종목 평균 (KODEX 200 ETF 전환 예정)
              <br />
              <span style={{ color: colors.textMuted, fontSize: 10 }}>
                * 표본이 적은 유형은 참고용. 데이터 축적에 따라 정확도 상승
              </span>
            </div>
          </div>

          {/* 면책 */}
          <div style={{
            padding: '12px 24px', fontSize: 10, color: colors.textMuted,
            lineHeight: 1.5, textAlign: 'center',
          }}>
            본 데이터는 과거 실적이며 미래 수익을 보장하지 않습니다
          </div>
        </>
      )}
    </div>
  )
}

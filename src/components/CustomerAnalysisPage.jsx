import React, { useState, useEffect, useCallback } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API as API_BASE } from '../lib/api'

// 순위별 배지 색상
const RANK_COLORS = ['#DC2626', '#D97706', '#059669', '#0D9488', '#2563EB', '#7C3AED', '#DB2777', '#64748B']

function PValueBadge({ p }) {
  const sig = p < 0.05
  const vSig = p < 0.01
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, fontFamily: FONTS.mono,
      padding: '2px 6px', borderRadius: 4,
      background: vSig ? '#DC2626' : sig ? '#D97706' : 'rgba(100,116,139,0.2)',
      color: vSig ? '#fff' : sig ? '#fff' : '#64748B',
    }}>
      {vSig ? 'p<0.01' : sig ? 'p<0.05' : `p=${p?.toFixed(2)}`}
    </span>
  )
}

function SectorCard({ sector, data, rank, onClick, selected, dark, colors }) {
  const rankColor = RANK_COLORS[rank] || RANK_COLORS[7]
  const retColor = data.avg_return > 0 ? '#16A34A' : data.avg_return < 0 ? '#DC2626' : colors.textMuted
  const isSignificant = data.p_value < 0.05

  return (
    <div
      onClick={() => onClick(sector)}
      style={{
        background: selected
          ? (dark ? 'rgba(13,148,136,0.15)' : 'rgba(13,148,136,0.08)')
          : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'),
        border: `1px solid ${selected ? '#0D9488' : (dark ? 'rgba(255,255,255,0.08)' : colors.border)}`,
        borderRadius: 10,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Rank bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: 3, background: rankColor, borderRadius: '10px 0 0 10px',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, fontFamily: FONTS.mono,
            color: rankColor, width: 20,
          }}>#{rank + 1}</span>
          <span style={{
            fontSize: 14, fontWeight: 600, color: colors.textPrimary,
            fontFamily: FONTS.body,
          }}>{sector}</span>
        </div>
        <span style={{
          fontSize: 18, fontWeight: 800, fontFamily: FONTS.mono,
          color: retColor, letterSpacing: '-0.02em',
        }}>
          {data.avg_return > 0 ? '+' : ''}{data.avg_return?.toFixed(2)}%
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: colors.textMuted }}>
          Sharpe <span style={{ fontFamily: FONTS.mono, color: colors.textSecondary }}>
            {data.sharpe?.toFixed(2)}
          </span>
        </span>
        <span style={{ fontSize: 11, color: colors.textMuted }}>
          σ <span style={{ fontFamily: FONTS.mono, color: colors.textSecondary }}>
            {data.std_dev?.toFixed(2)}%
          </span>
        </span>
        <span style={{ fontSize: 11, color: colors.textMuted }}>
          {data.days_count}거래일
        </span>
        <PValueBadge p={data.p_value} />
        {isSignificant && (
          <span style={{
            fontSize: 10, padding: '2px 6px', borderRadius: 4,
            background: 'rgba(13,148,136,0.15)', color: '#0D9488', fontWeight: 600,
          }}>통계적 유의</span>
        )}
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label, dark, colors }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: dark ? '#18181B' : '#FFFFFF',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : colors.border}`,
      borderRadius: 8, padding: '8px 12px',
      fontSize: 12, fontFamily: FONTS.mono,
    }}>
      <div style={{ color: colors.textMuted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value > 100 ? '+' : ''}{(p.value - 100).toFixed(2)}%
        </div>
      ))}
    </div>
  )
}

export default function CustomerAnalysisPage() {
  const { colors, dark } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null)
  const [selectedSector, setSelectedSector] = useState(null)
  const [error, setError] = useState(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/customer-analysis/after-hours/status`)
      const json = await res.json()
      setStatus(json)
    } catch {
      // ignore
    }
  }, [])

  const fetchData = useCallback(async (refresh = false) => {
    setLoading(true)
    setError(null)
    try {
      const url = `${API_BASE}/api/customer-analysis/after-hours${refresh ? '?refresh=true' : ''}`
      const res = await fetch(url)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || `HTTP ${res.status}`)
      }
      const json = await res.json()
      setData(json)
      if (json.ranking?.length > 0) {
        setSelectedSector(json.ranking[0].sector)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus().then(() => {
      fetchData()
    })
  }, [fetchData, fetchStatus])

  const selectedData = selectedSector && data?.sectors?.[selectedSector]

  // 차트 데이터 준비
  const chartData = selectedData?.curve || []

  // 모든 업종 커브를 한 차트에 표시할 때
  const allCurvesData = (() => {
    if (!data?.sectors) return []
    const timeMap = {}
    Object.entries(data.sectors).forEach(([name, sd]) => {
      (sd.curve || []).forEach(pt => {
        if (!timeMap[pt.time]) timeMap[pt.time] = { time: pt.time }
        timeMap[pt.time][name] = pt.norm
      })
    })
    return Object.values(timeMap).sort((a, b) => a.time.localeCompare(b.time))
  })()

  const accentColor = '#0D9488'

  return (
    <div style={{ minHeight: '100vh', background: colors.bgPrimary }}>

      {/* 헤더 */}
      <div style={{
        background: dark ? 'rgba(9,9,11,0.6)' : colors.bgCard,
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : colors.border}`,
        backdropFilter: dark ? 'blur(8px)' : 'none',
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontFamily: FONTS.serif, fontSize: 17, fontWeight: 700,
                  color: colors.textPrimary, letterSpacing: '-0.01em',
                }}>고객분석</span>
                <span style={{
                  background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
                  color: '#fff', fontSize: 9, fontWeight: 800,
                  padding: '2px 7px', borderRadius: 20, letterSpacing: '0.1em',
                }}>NXT</span>
                <span style={{
                  fontSize: 12, color: colors.textMuted,
                  borderLeft: `1px solid ${colors.border}`,
                  paddingLeft: 10,
                }}>
                  넥스트레이드 18:00~20:00 업종별 수익률 분석
                </span>
              </div>
              {status?.computed_at && (
                <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                  마지막 분석: {new Date(status.computed_at).toLocaleString('ko-KR')}
                  {status.age_seconds > 0 && ` (${Math.floor(status.age_seconds / 60)}분 전)`}
                </div>
              )}
            </div>

            <button
              onClick={() => fetchData(true)}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                background: loading ? 'rgba(13,148,136,0.2)' : accentColor,
                color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13, fontWeight: 600, transition: 'all 0.15s',
              }}
            >
              {loading ? (
                <>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
                  분석 중...
                </>
              ) : '↻ 새로고침'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: '0 auto', padding: '24px 20px' }}>

        {/* 안내 배너 */}
        <div style={{
          background: dark ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.06)',
          border: `1px solid ${dark ? 'rgba(124,58,237,0.3)' : 'rgba(124,58,237,0.2)'}`,
          borderRadius: 10, padding: '12px 16px', marginBottom: 24,
        }}>
          <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.6 }}>
            <strong style={{ color: '#7C3AED' }}>NXT 시간외 분석</strong>:
            넥스트레이드(NXT) 18:00~20:00 구간의 8개 업종 평균 수익률을 지난 1개월간 데이터로 분석합니다.
            p&lt;0.05이면 통계적으로 유의미한 패턴이 존재하여 해당 업종의 시간외 투자 전략을 검토할 수 있습니다.
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: 10, padding: '16px', marginBottom: 24,
            color: '#DC2626', fontSize: 13,
          }}>
            <strong>오류:</strong> {error}
            <br />
            <span style={{ fontSize: 12, color: colors.textMuted }}>
              첫 실행 시 Kiwoom API에서 분봉 데이터를 수집하므로 수 분이 소요됩니다.
            </span>
          </div>
        )}

        {loading && !data && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              fontSize: 32, marginBottom: 16,
              animation: 'spin 2s linear infinite', display: 'inline-block',
            }}>⟳</div>
            <div style={{ fontSize: 14, color: colors.textMuted }}>
              NXT 분봉 데이터 수집 중...
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>
              8개 업종 × 3~4개 종목 × 1개월치 5분봉을 조회합니다 (초최 수 분 소요)
            </div>
          </div>
        )}

        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 20, alignItems: 'start' }}>

            {/* 좌: 업종 순위 카드 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 4, letterSpacing: '0.08em' }}>
                업종 순위 (평균수익률 기준)
              </div>
              {data.ranking?.map((item, idx) => (
                <SectorCard
                  key={item.sector}
                  sector={item.sector}
                  data={item}
                  rank={idx}
                  onClick={setSelectedSector}
                  selected={selectedSector === item.sector}
                  dark={dark}
                  colors={colors}
                />
              ))}
            </div>

            {/* 우: 상세 차트 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* 전체 업종 비교 차트 */}
              <div style={{
                background: dark ? 'rgba(255,255,255,0.03)' : colors.bgCard,
                border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : colors.border}`,
                borderRadius: 12, padding: '20px',
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, marginBottom: 16 }}>
                  전체 업종 수익률 커브 비교
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={allCurvesData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: colors.textMuted }} />
                    <YAxis
                      tickFormatter={(v) => `${(v - 100).toFixed(1)}%`}
                      tick={{ fontSize: 10, fill: colors.textMuted }}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip dark={dark} colors={colors} />} />
                    <ReferenceLine y={100} stroke={dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'} strokeDasharray="4 4" />
                    {data.ranking?.map((item, idx) => (
                      <Line
                        key={item.sector}
                        type="monotone"
                        dataKey={item.sector}
                        stroke={RANK_COLORS[idx] || RANK_COLORS[7]}
                        strokeWidth={selectedSector === item.sector ? 2.5 : 1.2}
                        dot={false}
                        name={item.sector}
                        opacity={selectedSector && selectedSector !== item.sector ? 0.3 : 1}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 선택 업종 상세 */}
              {selectedData && (
                <div style={{
                  background: dark ? 'rgba(255,255,255,0.03)' : colors.bgCard,
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : colors.border}`,
                  borderRadius: 12, padding: '20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, fontFamily: FONTS.serif }}>
                      {selectedSector}
                    </span>
                    <PValueBadge p={selectedData.p_value} />
                    {selectedData.significant && (
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 4,
                        background: 'rgba(13,148,136,0.15)', color: '#0D9488', fontWeight: 600,
                      }}>
                        통계적으로 유의미한 패턴 ✓
                      </span>
                    )}
                  </div>

                  {/* 통계 요약 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    {[
                      { label: '평균 수익률', value: `${selectedData.avg_return > 0 ? '+' : ''}${selectedData.avg_return?.toFixed(2)}%`, color: selectedData.avg_return > 0 ? '#16A34A' : '#DC2626' },
                      { label: '표준편차', value: `${selectedData.std_dev?.toFixed(2)}%` },
                      { label: 'Sharpe Ratio', value: selectedData.sharpe?.toFixed(2) },
                      { label: 'T-통계량', value: selectedData.t_stat?.toFixed(2) },
                    ].map(stat => (
                      <div key={stat.label} style={{
                        background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                        borderRadius: 8, padding: '10px 12px', textAlign: 'center',
                      }}>
                        <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{stat.label}</div>
                        <div style={{
                          fontSize: 16, fontWeight: 700, fontFamily: FONTS.mono,
                          color: stat.color || colors.textPrimary,
                        }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>

                  {/* 개별 종목 */}
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, marginBottom: 10, letterSpacing: '0.08em' }}>
                      구성 종목
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {selectedData.stocks?.map(s => (
                        <div key={s.stock_code} style={{
                          background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                          borderRadius: 8, padding: '8px 12px',
                          display: 'flex', flexDirection: 'column', gap: 2, minWidth: 120,
                        }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: colors.textPrimary }}>
                            {s.stock_name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{
                              fontSize: 13, fontWeight: 700, fontFamily: FONTS.mono,
                              color: s.avg_return > 0 ? '#16A34A' : s.avg_return < 0 ? '#DC2626' : colors.textMuted,
                            }}>
                              {s.avg_return > 0 ? '+' : ''}{s.avg_return?.toFixed(2)}%
                            </span>
                            <PValueBadge p={s.p_value} />
                          </div>
                          <div style={{ fontSize: 11, color: colors.textMuted }}>
                            {s.days_count}일 / Sharpe {s.sharpe?.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 선택 업종 수익률 커브 */}
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'} />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: colors.textMuted }} />
                      <YAxis
                        tickFormatter={(v) => `${(v - 100).toFixed(1)}%`}
                        tick={{ fontSize: 10, fill: colors.textMuted }}
                        domain={['auto', 'auto']}
                      />
                      <Tooltip content={<CustomTooltip dark={dark} colors={colors} />} />
                      <ReferenceLine y={100} stroke={dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'} strokeDasharray="4 4" />
                      <Line
                        type="monotone"
                        dataKey="norm"
                        stroke={accentColor}
                        strokeWidth={2.5}
                        dot={false}
                        name={selectedSector}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  {/* 해석 */}
                  {selectedData.significant && (
                    <div style={{
                      marginTop: 16, padding: '12px 16px',
                      background: 'rgba(13,148,136,0.08)',
                      borderLeft: '3px solid #0D9488',
                      borderRadius: '0 8px 8px 0',
                      fontSize: 13, color: colors.textSecondary, lineHeight: 1.7,
                    }}>
                      <strong style={{ color: '#0D9488' }}>투자 시사점:</strong> {selectedSector} 업종은
                      NXT 18:00~20:00 구간에서 평균 {Math.abs(selectedData.avg_return).toFixed(2)}%
                      {selectedData.avg_return > 0 ? ' 상승' : ' 하락'}하는 패턴이 통계적으로 유의미합니다
                      (p={selectedData.p_value?.toFixed(3)}).
                      Sharpe Ratio {selectedData.sharpe?.toFixed(2)}
                      {selectedData.sharpe > 0.5 ? ' — 위험 대비 수익률이 양호합니다.' : '.'}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 360px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

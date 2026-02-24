import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  AreaChart, Area,
  PieChart, Pie, Cell,
  ResponsiveContainer,
} from 'recharts'
import GradeBadge from './GradeBadge'
import RadarChart from './RadarChart'
import CompanyCardSkeleton from './skeletons/CompanyCardSkeleton'
import { useCompanyCard } from '../hooks/useCompanyCard'
import { useCompanyCards } from '../hooks/useCompanyCards'
import { useVariableDetail } from '../hooks/useVariableScores'
import { useEdgeSignalDetail } from '../hooks/useEdgeSignals'
import { useSupplyDemand } from '../hooks/useSupplyDemand'
import {
  GRADE_COLORS, MARKET_LABELS,
  VARIABLE_GRADE_COLORS, PREMIUM,
  FONTS, formatKoreanNumber, formatPercent,
} from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'

export default function CompanyCard({ corpCode, onBack, onViewCard }) {
  const { colors } = useTheme()
  const { card, trend, candles, loading, error } = useCompanyCard(corpCode)
  const { detail: variableScore } = useVariableDetail(corpCode)
  const { signal: edgeSignal } = useEdgeSignalDetail(corpCode)
  const stockCode = card?.card_data?.header?.stock_code || ''
  const { instTrend, foreignTrend, loading: supplyLoading } = useSupplyDemand(stockCode)
  const navigate = useNavigate()

  if (!corpCode) {
    return <CardListView onSelectCard={onViewCard} />
  }

  if (loading) {
    return <CompanyCardSkeleton />
  }

  if (error || !card) {
    return (
      <div className="page-container" style={{ padding: '60px', textAlign: 'center', color: colors.textMuted }}>
        <div style={{ fontSize: '15px', marginBottom: '12px' }}>{error || '기업 카드를 찾을 수 없습니다'}</div>
        <button onClick={onBack} style={getLinkBtnStyle(colors)}>공시 피드로 돌아가기</button>
      </div>
    )
  }

  const cardData = card.card_data || {}
  const header = cardData.header || {}
  const market = cardData.market || {}
  const financials = cardData.financials || {}
  const shareholders = cardData.shareholders || []
  const timeline = cardData.timeline || {}
  const handleBack = () => {
    if (onViewCard) onViewCard(null)
    else if (onBack) onBack()
  }

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* 뒤로가기 */}
      <button onClick={handleBack} style={{ ...getLinkBtnStyle(colors), marginBottom: '16px', fontSize: '13px' }}>
        &larr; 목록으로 돌아가기
      </button>

      {/* 코스닥 종목 안내 */}
      {header.corp_cls && header.corp_cls !== 'Y' && (
        <div style={{
          padding: '16px 20px', borderRadius: '12px', marginBottom: '16px',
          backgroundColor: '#FFFBEB', border: '1px solid #FDE68A',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <span style={{ fontSize: '18px' }}>{'\u26A0\uFE0F'}</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#92400E', marginBottom: '2px' }}>
              코스닥 종목은 현재 지원하지 않습니다
            </div>
            <div style={{ fontSize: '12px', color: '#B45309' }}>
              현재 코스피 종목만 조회 가능합니다. 코스닥은 추후 업데이트 예정입니다.
            </div>
          </div>
        </div>
      )}

      <div className="animate-fade-in">
        {/* 1. 헤더 */}
        <CompanyHeader header={header} market={market} />

        {/* 1.5 밸류에이션 분석 */}
        <div style={{ marginTop: '16px' }}>
          <Section title="밸류에이션 분석">
            <ValuationSection cardData={cardData} />
          </Section>
        </div>

        {/* 2. 재무 현황 — 풀 와이드 (가장 중요) */}
        <div style={{ marginTop: '16px' }}>
          <Section title="재무 현황">
            <FinancialChart financials={financials} />
          </Section>
        </div>

        {/* 3-5. 주가 / 주주 / AI 요약 */}
        <div className="company-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
          {/* 3. 60일 주가 */}
          <Section title="60일 주가 추이">
            <PriceChart candles={candles} />
          </Section>

          {/* 4. 주요주주 */}
          <Section title="주요주주 현황">
            <ShareholderChart shareholders={shareholders} />
          </Section>
        </div>

        {/* 4.5 기관/외국인 수급 */}
        {(foreignTrend.length > 0 || instTrend.length > 0) && (
          <div style={{ marginTop: '16px' }}>
            <Section title="기관/외국인 수급 현황">
              <SupplyDemandSection
                foreignTrend={foreignTrend}
                instTrend={instTrend}
                market={market}
                loading={supplyLoading}
              />
            </Section>
          </div>
        )}

        {/* 5. AI 요약 — 풀 와이드 */}
        {card.ai_summary && (
          <div style={{ marginTop: '16px' }}>
            <Section title="AI 분석 요약">
              <AISummary summary={card.ai_summary} />
            </Section>
          </div>
        )}

        {/* 6. 실적 트렌드 — full width */}
        {trend && !trend.status && (
          <div style={{ marginTop: '16px' }}>
            <Section title="실적 트렌드">
              <TrendSection trend={trend} />
            </Section>
          </div>
        )}

        {/* 7. 5대 변수 분석 (Phase 11) */}
        {variableScore && (
          <div style={{ marginTop: '16px' }}>
            <Section title="7대 변수 분석">
              <VariableSection score={variableScore} />
            </Section>
          </div>
        )}

        {/* 8. Edge-Finder 시그널 (Phase 12) */}
        {edgeSignal && (
          <div style={{ marginTop: '16px' }}>
            <Section title="Edge-Finder 시그널">
              <EdgeSignalSection signal={edgeSignal} />
            </Section>
          </div>
        )}

        {/* 9. 트리거 공시 */}
        {timeline.trigger && timeline.trigger.report_nm && (
          <div style={{ marginTop: '16px' }}>
            <Section title="트리거 공시">
              <TriggerInfo trigger={timeline.trigger} />
            </Section>
          </div>
        )}

        {/* 9. 최근 공시 이력 */}
        {timeline.history && timeline.history.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <Section title="최근 주요 공시 이력">
              <div>
                {timeline.history.map((h, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '8px 0', borderBottom: i < timeline.history.length - 1 ? `1px solid ${colors.borderLight}` : 'none',
                  }}>
                    <GradeBadge grade={h.grade} size="sm" />
                    <span style={{ fontSize: '13px', color: colors.textPrimary, flex: 1 }}>{h.report_nm}</span>
                    <span style={{ fontSize: '11px', color: colors.textMuted, fontFamily: FONTS.mono }}>
                      {h.created_at ? new Date(h.created_at).toLocaleDateString('ko-KR') : ''}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}


// ── 공통 래퍼 ─────────────────────────────────────────────────────

function Section({ title, children }) {
  const { colors } = useTheme()
  return (
    <div style={getCardStyle(colors)}>
      <div style={getSectionTitleStyle(colors)}>
        <span style={{ display: 'inline-block', width: '4px', height: '18px', background: PREMIUM.accent, borderRadius: '2px' }} />
        {title}
      </div>
      {children}
    </div>
  )
}


// ── 1. 헤더 ──────────────────────────────────────────────────────

function CompanyHeader({ header, market }) {
  const { colors } = useTheme()
  const changeColor = (market.change || 0) >= 0 ? colors.positive : colors.negative
  const changeSign = (market.change || 0) >= 0 ? '+' : ''
  const marketLabel = MARKET_LABELS[header.corp_cls] || ''

  return (
    <div className="company-header-layout" style={{ ...getCardStyle(colors), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontSize: '22px', fontWeight: 700, fontFamily: FONTS.serif, color: colors.textPrimary }}>
            {header.corp_name || '기업명'}
          </span>
          {marketLabel && (
            <span style={{ fontSize: '11px', backgroundColor: colors.borderLight, padding: '2px 8px', borderRadius: '4px', color: colors.textSecondary }}>
              {marketLabel}
            </span>
          )}
        </div>
        <div style={{ fontSize: '12px', color: colors.textSecondary, display: 'flex', gap: '12px' }}>
          {header.stock_code && <span style={{ fontFamily: FONTS.mono }}>{header.stock_code}</span>}
          {header.sector && <span>{header.sector}</span>}
          {header.ceo && <span>CEO {header.ceo}</span>}
        </div>
      </div>

      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '24px', fontWeight: 700, fontFamily: FONTS.mono, color: colors.textPrimary }}>
          {market.current_price ? Number(market.current_price).toLocaleString() : '-'}
          <span style={{ fontSize: '12px', fontWeight: 400, color: colors.textMuted, marginLeft: '2px' }}>원</span>
        </div>
        <div style={{ fontSize: '13px', fontFamily: FONTS.mono, color: changeColor, fontWeight: 600 }}>
          {market.change != null ? `${changeSign}${market.change.toFixed(2)}%` : ''}
          {market.change_val != null && (
            <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 400 }}>
              ({changeSign}{Number(market.change_val).toLocaleString()})
            </span>
          )}
        </div>
        {market.volume != null && (
          <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '2px', fontFamily: FONTS.mono }}>
            거래량 {Number(market.volume).toLocaleString()}
          </div>
        )}
      </div>
    </div>
  )
}


// ── 2. 재무 현황 (연간 + 분기) ────────────────────────────────────

function FinancialChart({ financials }) {
  const { colors } = useTheme()
  const years = financials.years || []
  const items = financials.items || {}
  const quarterly = financials.quarterly || null
  const plMetrics = [
    { key: 'revenue', label: '매출액', yoyKey: 'revenue_yoy', color: '#2563EB' },
    { key: 'operating_income', label: '영업이익', yoyKey: 'operating_income_yoy', color: '#0D9488' },
    { key: 'net_income', label: '순이익', yoyKey: 'net_income_yoy', color: '#8B5CF6' },
  ]
  const bsMetrics = [
    { key: 'total_assets', label: '총자산', color: '#6366F1' },
    { key: 'total_liabilities', label: '총부채', color: '#3B82F6' },
    { key: 'total_equity', label: '자기자본', color: '#F59E0B' },
  ].filter(m => items[m.key]?.some(v => v != null))

  // 추정치 연도 식별 (xxxE 패턴)
  const isEstimate = (yr) => yr.endsWith('E')

  if (years.length === 0) {
    return <div style={getEmptyStyle(colors)}>재무 데이터가 없습니다</div>
  }

  // 손익 요약 카드: 최신 확정 실적 (2024 = index 1)
  const confirmedIdx = Math.min(1, years.length - 1)

  const chartData = years.map((yr, i) => {
    const row = { year: yr, _isEstimate: isEstimate(yr) }
    plMetrics.forEach(m => { row[m.label] = items[m.key]?.[i] ?? null })
    return row
  })

  // 커스텀 바 렌더러: 2025E 바에 opacity 0.5
  const EstimateBar = (props) => {
    const { x, y, width, height, fill, payload } = props
    const op = payload?._isEstimate ? 0.5 : 1.0
    return <rect x={x} y={y} width={width} height={Math.max(0, height)} fill={fill} opacity={op} rx={4} ry={4} />
  }

  return (
    <div>
      {/* 손익 요약 카드 (최신 확정 실적 기준) */}
      <div className="financial-chart-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {plMetrics.map(m => {
          const vals = items[m.key] || []
          const latest = vals[confirmedIdx] ?? null
          const yoy = items[m.yoyKey]
          return (
            <div key={m.key} style={{ backgroundColor: colors.bgPrimary, borderRadius: '8px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: m.color }}>{m.label}</span>
                {yoy != null && (
                  <span style={{
                    fontSize: '10px', fontWeight: 700, fontFamily: FONTS.mono,
                    padding: '1px 6px', borderRadius: '4px',
                    backgroundColor: yoy >= 0 ? '#DCFCE7' : '#DBEAFE',
                    color: yoy >= 0 ? colors.positive : colors.negative,
                  }}>
                    YoY {yoy >= 0 ? '+' : ''}{yoy.toFixed(1)}%
                  </span>
                )}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: FONTS.mono, color: colors.textPrimary }}>
                {latest != null ? formatKoreanNumber(latest) : '-'}
              </div>
              <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '2px' }}>
                {years[confirmedIdx] || ''} 확정
              </div>
            </div>
          )
        })}
      </div>

      {/* 연간 추이 바 차트 (4개년: 확정 2 + Q3 + E) */}
      <div className="chart-area-bar" style={{ width: '100%', height: 220, marginBottom: '20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} vertical={false} />
            <XAxis dataKey="year" tick={{ fontSize: 11, fill: colors.textSecondary }} axisLine={{ stroke: colors.border }} tickLine={false} />
            <YAxis tickFormatter={formatKoreanNumber} tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} width={70} />
            <Tooltip
              formatter={(value) => formatKoreanNumber(value)}
              contentStyle={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: colors.textPrimary, fontWeight: 600 }}
            />
            {plMetrics.map(m => (
              <Bar key={m.key} dataKey={m.label} fill={m.color} shape={<EstimateBar fill={m.color} />} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 재무상태 테이블 (자산/부채/자본) */}
      {/* 분기별 실적 (최신 연도) */}
      {quarterly && quarterly.quarters?.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {quarterly.year}년 분기별 실적
          </div>
          <div style={{ borderRadius: '8px', border: `1px solid ${colors.borderLight}`, overflow: 'hidden' }}>
            {/* 헤더 */}
            <div style={{
              display: 'grid', gridTemplateColumns: `100px repeat(${quarterly.quarters.length}, 1fr)`,
              backgroundColor: colors.bgPrimary, padding: '8px 12px', gap: '8px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>항목</div>
              {quarterly.quarters.map(q => (
                <div key={q} style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, textAlign: 'right' }}>{q}</div>
              ))}
            </div>
            {/* 매출액 행 */}
            <div style={{
              display: 'grid', gridTemplateColumns: `100px repeat(${quarterly.quarters.length}, 1fr)`,
              padding: '8px 12px', gap: '8px', borderTop: `1px solid ${colors.borderLight}`,
              backgroundColor: colors.bgCard,
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: '#2563EB' }} />
                매출액
              </div>
              {(quarterly.revenue || []).map((v, i) => (
                <div key={i} style={{ fontSize: '12px', fontFamily: FONTS.mono, textAlign: 'right', color: colors.textPrimary, fontWeight: 500 }}>
                  {v != null ? formatKoreanNumber(v) : '-'}
                </div>
              ))}
            </div>
            {/* 영업이익 행 */}
            <div style={{
              display: 'grid', gridTemplateColumns: `100px repeat(${quarterly.quarters.length}, 1fr)`,
              padding: '8px 12px', gap: '8px', borderTop: `1px solid ${colors.borderLight}`,
              backgroundColor: colors.bgPrimary,
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#0D9488', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: '#0D9488' }} />
                영업이익
              </div>
              {(quarterly.operating_profit || []).map((v, i) => (
                <div key={i} style={{
                  fontSize: '12px', fontFamily: FONTS.mono, textAlign: 'right', fontWeight: 500,
                  color: v != null ? (v >= 0 ? colors.positive : colors.negative) : colors.textMuted,
                }}>
                  {v != null ? formatKoreanNumber(v) : '-'}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {bsMetrics.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            재무상태
          </div>
          <div style={{ borderRadius: '8px', border: `1px solid ${colors.borderLight}`, overflow: 'hidden' }}>
            {/* 헤더 */}
            <div style={{
              display: 'grid', gridTemplateColumns: `120px repeat(${years.length}, 1fr)`,
              backgroundColor: colors.bgPrimary, padding: '8px 12px', gap: '8px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted }}>항목</div>
              {years.map(yr => (
                <div key={yr} style={{
                  fontSize: '11px', fontWeight: 600, textAlign: 'right',
                  color: colors.textMuted,
                  fontStyle: isEstimate(yr) ? 'italic' : 'normal',
                  opacity: isEstimate(yr) ? 0.7 : 1,
                }}>{yr}</div>
              ))}
            </div>
            {/* 데이터 행 */}
            {bsMetrics.map((m, mi) => {
              const values = items[m.key] || []
              return (
                <div key={m.key} style={{
                  display: 'grid', gridTemplateColumns: `120px repeat(${years.length}, 1fr)`,
                  padding: '8px 12px', gap: '8px',
                  borderTop: `1px solid ${colors.borderLight}`,
                  backgroundColor: mi % 2 === 0 ? colors.bgCard : colors.bgPrimary,
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: m.color, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: m.color }} />
                    {m.label}
                  </div>
                  {years.map((yr, i) => (
                    <div key={yr} style={{
                      fontSize: '12px', fontFamily: FONTS.mono, textAlign: 'right',
                      color: i === years.length - 1 ? colors.textPrimary : colors.textSecondary,
                      fontWeight: i === years.length - 1 ? 600 : 400,
                      fontStyle: isEstimate(yr) ? 'italic' : 'normal',
                      opacity: isEstimate(yr) ? 0.7 : 1,
                    }}>
                      {values[i] != null ? formatKoreanNumber(values[i]) : '-'}
                    </div>
                  ))}
                </div>
              )
            })}
            {/* 부채비율 행 */}
            {items.total_liabilities && items.total_equity && (() => {
              const ratios = years.map((_, i) => {
                const liab = items.total_liabilities?.[i]
                const eq = items.total_equity?.[i]
                return (liab != null && eq != null && eq !== 0) ? ((liab / eq) * 100) : null
              })
              return (
                <div style={{
                  display: 'grid', gridTemplateColumns: `120px repeat(${years.length}, 1fr)`,
                  padding: '8px 12px', gap: '8px',
                  borderTop: `1px solid ${colors.border}`,
                  backgroundColor: colors.bgPrimary,
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: colors.textSecondary }}>부채비율</div>
                  {ratios.map((r, i) => (
                    <div key={i} style={{
                      fontSize: '12px', fontFamily: FONTS.mono, textAlign: 'right',
                      fontWeight: 700,
                      color: r != null ? (r > 200 ? colors.negative : r > 100 ? '#D97706' : colors.positive) : colors.textMuted,
                      fontStyle: isEstimate(years[i]) ? 'italic' : 'normal',
                      opacity: isEstimate(years[i]) ? 0.7 : 1,
                    }}>
                      {r != null ? `${r.toFixed(1)}%` : '-'}
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}


// ── 3. 60일 주가 ─────────────────────────────────────────────────

function PriceChart({ candles }) {
  const { colors } = useTheme()
  const gradientId = React.useId()

  if (!candles || candles.length === 0) {
    return <div style={getEmptyStyle(colors)}>주가 데이터가 없습니다</div>
  }

  const closes = candles.map(c => c.close_price || 0)
  const first = closes[0]
  const last = closes[closes.length - 1]
  const totalChange = first ? ((last - first) / first * 100) : 0
  const trendColor = totalChange >= 0 ? colors.positive : colors.negative

  const chartData = candles.map(c => ({
    date: c.dt,
    price: c.close_price,
    volume: c.volume,
  }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: colors.textMuted }}>
          {candles[0]?.dt} ~ {candles[candles.length - 1]?.dt}
        </span>
        <span style={{
          fontSize: '11px', fontFamily: FONTS.mono, fontWeight: 600,
          color: trendColor,
        }}>
          {totalChange >= 0 ? '+' : ''}{totalChange.toFixed(1)}%
        </span>
      </div>
      <div className="chart-price" style={{ width: '100%', height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={trendColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={trendColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" hide />
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Tooltip
              formatter={(value) => [`${Number(value).toLocaleString()}원`, '종가']}
              contentStyle={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '12px' }}
              labelStyle={{ color: colors.textPrimary, fontWeight: 600, fontSize: '11px' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={trendColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, fill: trendColor }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}


// ── 4. 주요주주 (SVG 도넛) ──────────────────────────────────────

const DONUT_COLORS = ['#2563EB', '#0D9488', '#8B5CF6', '#E8364E', '#D97706', '#6B7B8D', '#EC4899', '#14B8A6', '#F59E0B', '#6366F1']

function ShareholderChart({ shareholders }) {
  const { colors } = useTheme()
  if (!shareholders || shareholders.length === 0) {
    return <div style={getEmptyStyle(colors)}>주주 데이터가 없습니다</div>
  }

  const top = shareholders.slice(0, 6)
  const totalRatio = top.reduce((s, h) => s + (h.ratio || 0), 0)
  const otherRatio = Math.max(0, 100 - totalRatio)

  const pieData = top.map((h, i) => ({
    name: h.name,
    value: h.ratio || 0,
    color: DONUT_COLORS[i % DONUT_COLORS.length],
  }))
  if (otherRatio > 0.5) {
    pieData.push({ name: '기타', value: otherRatio, color: '#E2E8F0' })
  }

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={28}
              outerRadius={52}
              dataKey="value"
              strokeWidth={0}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
              contentStyle={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '6px', fontSize: '11px' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '9px', color: colors.textMuted }}>주요주주</div>
          <div style={{ fontSize: '13px', fontWeight: 700, fontFamily: FONTS.mono, color: colors.textPrimary }}>
            {totalRatio.toFixed(1)}%
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {top.map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: colors.textPrimary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {h.name}
            </span>
            <span style={{ fontSize: '11px', fontFamily: FONTS.mono, color: colors.textSecondary, flexShrink: 0 }}>
              {(h.ratio || 0).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}


// ── 4.5 기관/외국인 수급 ────────────────────────────────────────

function SupplyDemandSection({ foreignTrend, instTrend, market, loading }) {
  const { colors } = useTheme()

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '13px' }}>수급 데이터 로딩 중...</div>
  }

  if (foreignTrend.length === 0 && instTrend.length === 0) {
    return <div style={getEmptyStyle(colors)}>수급 데이터가 없습니다</div>
  }

  // 합계 계산
  const foreignNetTotal = foreignTrend.reduce((s, d) => s + (d.foreign_net || 0), 0)
  const instNetTotal = instTrend.reduce((s, d) => s + (d.inst_net || 0), 0)
  const latestForeignRatio = market?.foreign_ratio || (foreignTrend.length > 0 ? foreignTrend[foreignTrend.length - 1]?.foreign_ratio : null)

  // 바 차트 데이터 (외국인 일별 순매수)
  const chartData = foreignTrend.map((d) => ({
    date: d.date?.slice(5) || '',
    net: d.foreign_net || 0,
  }))

  // 기관 누적선 데이터
  let instCumul = 0
  const instChartData = instTrend.map((d) => {
    instCumul += d.inst_net || 0
    return { date: d.date?.slice(5) || '', cumul: instCumul }
  })

  return (
    <div>
      {/* 요약 카드 3장 */}
      <div className="supply-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        <div style={{ backgroundColor: colors.bgPrimary, borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>외국인 순매수 (20일)</div>
          <div style={{
            fontSize: '18px', fontWeight: 700, fontFamily: FONTS.mono,
            color: foreignNetTotal >= 0 ? colors.positive : colors.negative,
          }}>
            {foreignNetTotal >= 0 ? '+' : ''}{formatKoreanNumber(foreignNetTotal)}
          </div>
        </div>
        <div style={{ backgroundColor: colors.bgPrimary, borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>기관 순매수 (20일)</div>
          <div style={{
            fontSize: '18px', fontWeight: 700, fontFamily: FONTS.mono,
            color: instNetTotal >= 0 ? colors.positive : colors.negative,
          }}>
            {instNetTotal >= 0 ? '+' : ''}{formatKoreanNumber(instNetTotal)}
          </div>
        </div>
        <div style={{ backgroundColor: colors.bgPrimary, borderRadius: '8px', padding: '12px' }}>
          <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>외국인 보유율</div>
          <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: FONTS.mono, color: colors.textPrimary }}>
            {latestForeignRatio != null ? `${Number(latestForeignRatio).toFixed(1)}%` : '-'}
          </div>
        </div>
      </div>

      {/* 외국인 20일 바 차트 */}
      {chartData.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            외국인 일별 순매수
          </div>
          <div className="chart-supply" style={{ width: '100%', height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={{ stroke: colors.border }} tickLine={false} />
                <YAxis tickFormatter={formatKoreanNumber} tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} width={65} />
                <Tooltip
                  formatter={(value) => [formatKoreanNumber(value), '순매수']}
                  contentStyle={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: colors.textPrimary, fontWeight: 600 }}
                />
                <Bar dataKey="net" radius={[3, 3, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.net >= 0 ? '#16A34A' : '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 기관 누적 순매수 추이 */}
      {instChartData.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            기관 누적 순매수 추이
          </div>
          <div className="chart-inst" style={{ width: '100%', height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={instChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={{ stroke: colors.border }} tickLine={false} />
                <YAxis tickFormatter={formatKoreanNumber} tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} width={65} />
                <Tooltip
                  formatter={(value) => [formatKoreanNumber(value), '누적 순매수']}
                  contentStyle={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: colors.textPrimary, fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="cumul"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fill="#6366F140"
                  dot={false}
                  activeDot={{ r: 3, fill: '#6366F1' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}


// ── 5. AI 요약 ──────────────────────────────────────────────────

function AISummary({ summary }) {
  const { colors } = useTheme()
  if (!summary) return <div style={getEmptyStyle(colors)}>AI 요약이 없습니다</div>

  const lines = summary.split('\n')
  return (
    <div style={{ fontSize: '13px', lineHeight: '1.8', color: colors.textPrimary }}>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/)
        const rendered = parts.map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) return <strong key={j}>{part.slice(2, -2)}</strong>
          return part
        })

        if (/^\d+\.\s/.test(line)) {
          return <div key={i} style={{ marginBottom: '4px', paddingLeft: '4px' }}>{rendered}</div>
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return <div key={i} style={{ marginBottom: '4px', paddingLeft: '12px' }}>• {rendered.slice(1)}</div>
        }
        return <div key={i} style={{ marginBottom: line.trim() ? '4px' : '8px' }}>{rendered}</div>
      })}
    </div>
  )
}


// ── 6. 실적 트렌드 ──────────────────────────────────────────────

function TrendSection({ trend }) {
  const { colors } = useTheme()
  if (!trend) return null

  const directionIcon = (val) => {
    if (val == null) return '—'
    return val > 0 ? '▲' : val < 0 ? '▼' : '—'
  }

  const directionColor = (val) => {
    if (val == null) return colors.textMuted
    return val > 0 ? colors.positive : val < 0 ? colors.negative : colors.textMuted
  }

  const metrics = [
    {
      label: '매출액',
      value: trend.revenue,
      yoy: trend.revenue_yoy_pct,
      consecutive: trend.consecutive_revenue_growth,
      unit: '',
    },
    {
      label: '영업이익',
      value: trend.operating_profit,
      yoy: trend.op_yoy_pct,
      consecutive: trend.consecutive_op_growth,
      unit: '',
    },
    {
      label: '영업이익률',
      value: trend.opm,
      prev: trend.opm_prev,
      isPercent: true,
    },
  ]

  return (
    <div>
      {/* 기준 분기 */}
      {trend.latest_quarter && (
        <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px', fontFamily: FONTS.mono }}>
          {trend.latest_quarter} 기준
        </div>
      )}

      {/* 핵심 수치 카드 3개 */}
      <div className="estimate-range-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ backgroundColor: colors.bgPrimary, borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '6px' }}>{m.label}</div>
            <div style={{ fontSize: '18px', fontWeight: 700, fontFamily: FONTS.mono, color: colors.textPrimary, marginBottom: '4px' }}>
              {m.isPercent ? `${(m.value ?? 0).toFixed(1)}%` : formatKoreanNumber(m.value)}
            </div>
            {/* YoY 또는 전기 비교 */}
            {m.isPercent ? (
              <div style={{ fontSize: '10px', fontFamily: FONTS.mono, color: colors.textMuted }}>
                전기 {m.prev != null ? `${m.prev.toFixed(1)}%` : '-'}
              </div>
            ) : (
              m.yoy != null && (
                <div style={{ fontSize: '10px', fontFamily: FONTS.mono, fontWeight: 600, color: directionColor(m.yoy) }}>
                  YoY {m.yoy >= 0 ? '+' : ''}{m.yoy.toFixed(1)}%
                </div>
              )
            )}
            {/* 연속 증감 */}
            {m.consecutive != null && (
              <div style={{ marginTop: '4px', fontSize: '10px', fontWeight: 600, color: directionColor(m.consecutive > 0 ? 1 : m.yoy) }}>
                {m.consecutive > 0
                  ? `${directionIcon(1)} ${m.consecutive}분기 연속 증가`
                  : m.yoy != null && m.yoy < 0
                    ? `${directionIcon(-1)} 감소세`
                    : `${directionIcon(0)} 횡보`}
              </div>
            )}
            {m.isPercent && m.prev != null && (
              <div style={{ marginTop: '4px', fontSize: '10px', fontWeight: 600, color: directionColor(m.value - m.prev) }}>
                {Math.abs(m.value - m.prev) < 0.5
                  ? `${directionIcon(0)} 횡보`
                  : m.value > m.prev
                    ? `${directionIcon(1)} 개선`
                    : `${directionIcon(-1)} 하락`}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 트렌드 요약 */}
      {trend.trend_summary && (
        <div style={{ fontSize: '13px', lineHeight: '1.7', color: colors.textPrimary, marginBottom: '12px' }}>
          {trend.trend_summary}
        </div>
      )}

      {/* 분기별 실적 테이블 */}
      {trend.quarterly_data && trend.quarterly_data.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', fontFamily: FONTS.mono }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: colors.textMuted, fontSize: '11px' }}>항목</th>
                {trend.quarterly_data.map((q) => (
                  <th key={`${q.year}${q.quarter}`} style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: colors.textMuted, fontSize: '11px' }}>
                    {q.quarter}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '6px 8px', fontWeight: 600, color: colors.textPrimary }}>매출액</td>
                {trend.quarterly_data.map((q) => (
                  <td key={`rev-${q.year}${q.quarter}`} style={{ padding: '6px 8px', textAlign: 'right', color: colors.textPrimary }}>
                    {formatKoreanNumber(q.revenue)}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ padding: '6px 8px', fontWeight: 600, color: colors.textPrimary }}>영업이익</td>
                {trend.quarterly_data.map((q) => (
                  <td key={`op-${q.year}${q.quarter}`} style={{ padding: '6px 8px', textAlign: 'right', color: colors.textPrimary }}>
                    {formatKoreanNumber(q.operating_profit)}
                  </td>
                ))}
              </tr>
              <tr style={{ borderTop: `1px solid ${colors.borderLight}` }}>
                <td style={{ padding: '6px 8px', color: colors.textMuted }}>OPM</td>
                {trend.quarterly_data.map((q) => (
                  <td key={`opm-${q.year}${q.quarter}`} style={{ padding: '6px 8px', textAlign: 'right', color: colors.textMuted }}>
                    {q.opm != null ? `${q.opm.toFixed(1)}%` : '-'}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ padding: '6px 8px', color: colors.textMuted }}>YoY</td>
                {trend.quarterly_data.map((q) => (
                  <td key={`yoy-${q.year}${q.quarter}`} style={{
                    padding: '6px 8px', textAlign: 'right', fontWeight: 600,
                    color: q.revenue_yoy_pct != null
                      ? (q.revenue_yoy_pct >= 0 ? colors.positive : colors.negative)
                      : colors.textMuted,
                  }}>
                    {q.revenue_yoy_pct != null ? `${q.revenue_yoy_pct >= 0 ? '+' : ''}${q.revenue_yoy_pct.toFixed(1)}%` : '-'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


// ── 7. 트리거 공시 ──────────────────────────────────────────────

function TriggerInfo({ trigger }) {
  const { colors } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <GradeBadge grade={trigger.grade} size="lg" />
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>{trigger.report_nm}</div>
        <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: FONTS.mono }}>접수번호 {trigger.rcept_no}</div>
      </div>
    </div>
  )
}


// ── 7. 7대 변수 분석 (Phase 11) ──────────────────────────────────

const VARIABLE_FACTORS = [
  { key: 'ccc_score', label: '① 현금흐름의 질', detailKey: 'ccc_detail' },
  { key: 'leverage_score', label: '② 비용 레버리지', detailKey: 'leverage_detail' },
  { key: 'dilution_score', label: '③ 희석 리스크', detailKey: 'dilution_detail' },
  { key: 'productivity_score', label: '④ 인당 생산성', detailKey: 'productivity_detail' },
  { key: 'pricing_score', label: '⑤ 가격 결정력', detailKey: 'pricing_detail' },
  { key: 'safety_score', label: '⑥ 재무 안전마진', detailKey: 'safety_detail' },
  { key: 'momentum_score', label: '⑦ 이익 모멘텀', detailKey: 'momentum_detail' },
]

const VARIABLE_CATEGORIES = [
  { label: '체질', desc: 'Body', indices: [0, 1, 4, 3] },
  { label: '안전', desc: 'Safety', indices: [2, 5] },
  { label: '방향', desc: 'Direction', indices: [6] },
]

function VariableSection({ score }) {
  const { colors } = useTheme()
  if (!score) return null

  const gc = VARIABLE_GRADE_COLORS[score.grade] || VARIABLE_GRADE_COLORS['보통']
  const factors = [
    score.ccc_score || 5, score.leverage_score || 5,
    score.dilution_score || 5, score.productivity_score || 5,
    score.pricing_score || 5, score.safety_score || 5,
    score.momentum_score || 5,
  ]

  return (
    <div>
      {/* 등급 배지 + 종합 점수 */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{
          padding: '4px 14px', borderRadius: '6px', fontWeight: 700,
          fontSize: '14px', backgroundColor: gc.badge, color: gc.text === '#F9FAFB' ? '#fff' : gc.text,
        }}>
          {gc.mark} {score.grade}
        </span>
        <span style={{ fontSize: '20px', fontWeight: 700, fontFamily: FONTS.mono, color: colors.textPrimary }}>
          {score.total_score?.toFixed(1)}
          <span style={{ fontSize: '12px', fontWeight: 400, color: colors.textMuted }}> / 10.0</span>
        </span>
      </div>

      <div className="variable-layout" style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
        {/* 레이더 차트 */}
        <div style={{ flexShrink: 0 }}>
          <RadarChart factors={factors} size={180} />
        </div>

        {/* 변수별 진행바 — 카테고리 그룹 */}
        <div style={{ flex: 1 }}>
          {VARIABLE_CATEGORIES.map((cat, ci) => (
            <div key={cat.label} style={{ marginTop: ci > 0 ? '14px' : 0 }}>
              <div style={{
                fontSize: '11px', fontWeight: 600, color: colors.textMuted,
                borderBottom: `1px solid ${colors.borderLight}`, paddingBottom: '4px', marginBottom: '8px',
              }}>
                {cat.label} · {cat.desc}
              </div>
              {cat.indices.map((idx) => {
                const f = VARIABLE_FACTORS[idx]
                const val = score[f.key] || 5
                const detail = score[f.detailKey] || {}
                const desc = _getFactorDesc(f.key, detail)
                const barColor = val >= 7 ? colors.positive : val >= 4 ? colors.accent : colors.negative

                return (
                  <div key={f.key} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: colors.textSecondary }}>{f.label}</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: FONTS.mono, color: barColor }}>
                        {val.toFixed(1)}
                      </span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: colors.borderLight, borderRadius: '4px' }}>
                      <div style={{
                        height: '100%', width: `${(val / 10) * 100}%`, borderRadius: '4px',
                        backgroundColor: barColor, transition: 'width 0.3s',
                      }} />
                    </div>
                    {desc && (
                      <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '2px' }}>{desc}</div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* AI 코멘트 */}
      {score.ai_comment && (
        <div style={{
          marginTop: '16px', padding: '12px', borderRadius: '8px',
          backgroundColor: colors.bgPrimary, fontSize: '13px',
          lineHeight: '1.7', color: colors.textPrimary,
        }}>
          {score.ai_comment}
        </div>
      )}
    </div>
  )
}

function _getFactorDesc(key, detail) {
  if (!detail || detail.reason) return detail?.reason || ''
  switch (key) {
    case 'ccc_score':
      if (detail.ccc_days != null) {
        let s = `CCC ${detail.ccc_days}일`
        if (detail.ccc_change != null) s += ` (전기대비 ${detail.ccc_change > 0 ? '+' : ''}${detail.ccc_change}일)`
        return s
      }
      return ''
    case 'leverage_score':
      if (detail.dol != null) return `DOL ${detail.dol}, 영업이익률 ${detail.op_margin}%`
      return ''
    case 'dilution_score':
      if (detail.overhang_pct != null) return `오버행 ${detail.overhang_pct}%`
      return detail.reason || ''
    case 'pricing_score':
      if (detail.gpm_pct != null) {
        let s = `GPM ${detail.gpm_pct}%`
        if (detail.gpm_change_pp != null) s += ` (${detail.gpm_change_pp > 0 ? '+' : ''}${detail.gpm_change_pp}%p)`
        return s
      }
      return ''
    case 'safety_score':
      return detail.reason || ''
    case 'momentum_score':
      return detail.reason || ''
    default:
      return ''
  }
}


// ── 밸류에이션 분석 (프론트엔드 계산) ──────────────────────────────

function ValuationSection({ cardData }) {
  const { colors } = useTheme()
  const market = cardData.market || {}
  const financials = cardData.financials || {}
  const items = financials.items || {}

  const per = _num(market.per)
  const pbr = _num(market.pbr)

  // 최신 연도 재무
  const netIncome = _latestVal(items.net_income)
  const totalEquity = _latestVal(items.total_equity)
  const totalAssets = _latestVal(items.total_assets)
  const totalLiabilities = _latestVal(items.total_liabilities)
  const operatingIncome = _latestVal(items.operating_income)
  const revenue = _latestVal(items.revenue)

  const roe = totalEquity > 0 ? (netIncome / totalEquity * 100) : null
  const roa = totalAssets > 0 ? (netIncome / totalAssets * 100) : null
  const opMargin = revenue ? (operatingIncome / revenue * 100) : null
  const niMargin = revenue ? (netIncome / revenue * 100) : null
  const debtRatio = totalEquity > 0 ? (totalLiabilities / totalEquity * 100) : null

  // 리스크 플래그
  const risks = []
  if (totalEquity != null && totalEquity <= 0)
    risks.push({ flag: '완전자본잠식', severity: 'CRITICAL' })
  if (debtRatio != null && debtRatio > 200)
    risks.push({ flag: '부분자본잠식', severity: 'WARNING' })
  if (operatingIncome != null && operatingIncome < 0)
    risks.push({ flag: '영업적자', severity: 'WARNING' })
  if (netIncome != null && netIncome < 0)
    risks.push({ flag: '순손실', severity: 'CAUTION' })
  if (per != null && per > 100)
    risks.push({ flag: 'PER 과열', severity: 'CAUTION' })
  if (pbr != null && pbr > 0 && pbr < 0.3)
    risks.push({ flag: '극저PBR', severity: 'WATCH' })

  const metrics = [
    { label: 'PER', value: per, fmt: (v) => v.toFixed(1), good: true },
    { label: 'PBR', value: pbr, fmt: (v) => v.toFixed(2), good: true },
    { label: 'ROE', value: roe, fmt: (v) => v.toFixed(1) + '%', good: roe != null && roe > 0 },
    { label: '영업이익률', value: opMargin, fmt: (v) => v.toFixed(1) + '%', good: opMargin != null && opMargin > 0 },
    { label: '순이익률', value: niMargin, fmt: (v) => v.toFixed(1) + '%', good: niMargin != null && niMargin > 0 },
    { label: '부채비율', value: debtRatio, fmt: (v) => v.toFixed(1) + '%', good: debtRatio != null && debtRatio <= 100 },
  ]

  const hasAny = metrics.some((m) => m.value != null)
  if (!hasAny) return <div style={getEmptyStyle(colors)}>밸류에이션 데이터가 없습니다</div>

  const _severityColor = { CRITICAL: '#1D4ED8', WARNING: '#D97706', CAUTION: '#CA8A04', WATCH: '#6B7280' }

  return (
    <div>
      <div className="val-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
        {metrics.map((m) => (
          <div key={m.label} style={{ backgroundColor: colors.bgPrimary, borderRadius: '8px', padding: '12px' }}>
            <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>{m.label}</div>
            <div style={{
              fontSize: '18px', fontWeight: 700, fontFamily: FONTS.mono,
              color: m.value != null ? (m.good ? colors.textPrimary : colors.negative) : colors.textMuted,
            }}>
              {m.value != null ? m.fmt(m.value) : '-'}
            </div>
          </div>
        ))}
      </div>

      {/* 리스크 플래그 */}
      <div style={{
        padding: '10px 14px', borderRadius: '8px',
        backgroundColor: risks.length > 0 ? '#FFFBEB' : '#F0FDF4',
        border: `1px solid ${risks.length > 0 ? '#FDE68A' : '#BBF7D0'}`,
        fontSize: '13px',
      }}>
        {risks.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#92400E' }}>{'\u26A0'} 리스크:</span>
            {risks.map((r, i) => (
              <span key={i} style={{
                padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                backgroundColor: _severityColor[r.severity] + '18',
                color: _severityColor[r.severity],
              }}>
                {r.flag}
              </span>
            ))}
          </div>
        ) : (
          <span style={{ color: colors.positive, fontWeight: 600 }}>{'\u2713'} 리스크 플래그 없음</span>
        )}
      </div>
    </div>
  )
}

function _num(v) { return v != null ? Number(v) : null }
function _latestVal(arr) { if (!arr) return null; for (let i = arr.length - 1; i >= 0; i--) { if (arr[i] != null) return arr[i] } return null }


// ── Edge-Finder 시그널 섹션 (Phase 12) ──────────────────────────

const EDGE_SIGNAL_STYLE = {
  GREEN: { bg: '#DCFCE7', color: '#16A34A', icon: '\uD83D\uDFE2', label: '\uC801\uADF9' },
  YELLOW: { bg: '#FEF9C3', color: '#CA8A04', icon: '\uD83D\uDFE1', label: '\uAD00\uB9DD' },
  ORANGE: { bg: '#FFF7ED', color: '#EA580C', icon: '\uD83D\uDFE0', label: '\uC8FC\uC758' },
  RED: { bg: '#FEE2E2', color: '#DC2626', icon: '\uD83D\uDD34', label: '\uD68C\uD53C' },
  NEUTRAL: { bg: '#F3F4F6', color: '#6B7280', icon: '\u26AA', label: '\uD310\uB2E8 \uBCF4\uB958' },
}

function EdgeSignalSection({ signal }) {
  const { colors } = useTheme()
  if (!signal) return null

  const style = EDGE_SIGNAL_STYLE[signal.overall_signal] || EDGE_SIGNAL_STYLE.NEUTRAL
  const modules = signal.modules_json || {}
  const score = signal.signal_score || 50

  const scoreColor = score >= 80 ? '#16A34A' : score >= 65 ? '#CA8A04' : score >= 50 ? '#EA580C' : '#DC2626'

  return (
    <div>
      {/* \uC2DC\uADF8\uB110 \uBC30\uC9C0 + \uC810\uC218 */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{
          padding: '6px 16px', borderRadius: '8px', fontWeight: 700,
          fontSize: '14px', backgroundColor: style.bg, color: style.color,
        }}>
          {style.icon} {style.label}
        </span>
        <div>
          <span style={{ fontSize: '24px', fontWeight: 700, fontFamily: FONTS.mono, color: scoreColor }}>
            {score}
          </span>
          <span style={{ fontSize: '12px', color: colors.textMuted }}> / 100</span>
        </div>
        <span style={{ fontSize: '13px', color: colors.textSecondary, fontWeight: 500 }}>
          {signal.signal_label}
        </span>
      </div>

      {/* 3-\uBAA8\uB4C8 \uC0C1\uC138 */}
      <div className="edge-modules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <EdgeModuleCard title="Promise" module={modules.promise} />
        <EdgeModuleCard title="Risk" module={modules.risk} />
        <EdgeModuleCard title="Insider" module={modules.insider} />
      </div>
    </div>
  )
}

function EdgeModuleCard({ title, module }) {
  const { colors } = useTheme()
  if (!module) return (
    <div style={{ padding: '12px', backgroundColor: colors.bgPrimary, borderRadius: '8px' }}>
      <div style={{ fontSize: '11px', fontWeight: 600, color: colors.textMuted, marginBottom: '4px' }}>{title}</div>
      <div style={{ fontSize: '12px', color: colors.textMuted }}>\uB370\uC774\uD130 \uC5C6\uC74C</div>
    </div>
  )

  const sig = module.signal || 'NEUTRAL'
  const style = EDGE_SIGNAL_STYLE[sig] || EDGE_SIGNAL_STYLE.NEUTRAL

  return (
    <div style={{
      padding: '12px', backgroundColor: colors.bgPrimary, borderRadius: '8px',
      borderLeft: `3px solid ${style.color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textSecondary }}>{title}</span>
        <span style={{
          padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700,
          backgroundColor: style.bg, color: style.color,
        }}>
          {style.label}
        </span>
      </div>
      <div style={{ fontSize: '12px', color: colors.textPrimary, fontWeight: 500, marginBottom: '4px' }}>
        {module.label || ''}
      </div>
      {module.detail && (
        <div style={{ fontSize: '11px', color: colors.textMuted, lineHeight: '1.5' }}>
          {module.detail}
        </div>
      )}
      {/* Insider 모듈: 외국인/기관 수치 표시 */}
      {title === 'Insider' && (module.foreign_net_total != null || module.inst_net_total != null) && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
          {module.foreign_net_total != null && (
            <span style={{
              fontSize: '10px', fontFamily: FONTS.mono, fontWeight: 600,
              padding: '2px 6px', borderRadius: '4px',
              backgroundColor: module.foreign_net_total >= 0 ? '#DCFCE7' : '#DBEAFE',
              color: module.foreign_net_total >= 0 ? '#16A34A' : '#2563EB',
            }}>
              외국인 {module.foreign_net_total >= 0 ? '+' : ''}{formatKoreanNumber(module.foreign_net_total)}
            </span>
          )}
          {module.inst_net_total != null && (
            <span style={{
              fontSize: '10px', fontFamily: FONTS.mono, fontWeight: 600,
              padding: '2px 6px', borderRadius: '4px',
              backgroundColor: module.inst_net_total >= 0 ? '#DCFCE7' : '#DBEAFE',
              color: module.inst_net_total >= 0 ? '#16A34A' : '#2563EB',
            }}>
              기관 {module.inst_net_total >= 0 ? '+' : ''}{formatKoreanNumber(module.inst_net_total)}
            </span>
          )}
        </div>
      )}
    </div>
  )
}


// ── 카드 목록 뷰 (검색 기반) ────────────────────────────────────

function CardListView({ onSelectCard }) {
  const { colors } = useTheme()
  const { companies, loading, query, search } = useCompanyCards()
  const [inputVal, setInputVal] = React.useState('')
  const debounceRef = React.useRef(null)

  const handleInput = (e) => {
    const val = e.target.value
    setInputVal(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const gradeStyle = (grade) => {
    const gc = GRADE_COLORS[grade]
    if (!gc) return { backgroundColor: colors.borderLight, color: colors.textMuted }
    return { backgroundColor: gc.lightBg, color: gc.bg, fontWeight: 700 }
  }

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* 헤더 + 검색 */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: colors.textPrimary, fontFamily: FONTS.serif, margin: 0 }}>
          기업 사계보
        </h2>
        <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px', marginBottom: '14px' }}>
          기업명 또는 종목코드로 검색하여 카드를 조회하세요
        </div>
        {/* 코스피 전용 안내 */}
        <div style={{
          padding: '10px 14px', borderRadius: '8px', marginBottom: '14px',
          backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE',
          fontSize: '12px', color: '#1E40AF',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <span style={{ fontWeight: 600 }}>KOSPI</span>
          현재 코스피 종목만 제공됩니다. 코스닥은 업데이트 예정입니다.
        </div>
        <input
          type="text"
          value={inputVal}
          onChange={handleInput}
          placeholder="기업명 또는 종목코드 검색..."
          style={{
            width: '100%',
            padding: '10px 14px',
            fontSize: '14px',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            backgroundColor: colors.bgCard,
            color: colors.textPrimary,
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: FONTS.body,
          }}
          onFocus={(e) => e.target.style.borderColor = colors.accent}
          onBlur={(e) => e.target.style.borderColor = colors.border}
        />
      </div>

      {/* 로딩 */}
      {loading && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div className="animate-pulse" style={{ color: colors.textMuted, fontSize: '14px' }}>
            검색 중...
          </div>
        </div>
      )}

      {/* 빈 결과 */}
      {!loading && companies.length === 0 && (
        <div style={{ padding: '60px', textAlign: 'center', color: colors.textMuted }}>
          <div style={{ fontSize: '15px', marginBottom: '8px' }}>
            {query ? `"${query}" 검색 결과가 없습니다` : '공시 데이터가 없습니다'}
          </div>
          <div style={{ fontSize: '13px' }}>공시 수집이 시작되면 기업 목록이 표시됩니다</div>
        </div>
      )}

      {/* 기업 그리드 (코스피만) */}
      {!loading && companies.length > 0 && (() => {
        const kospiOnly = companies.filter(c => c.corp_cls === 'Y' || !c.corp_cls)
        if (kospiOnly.length === 0) return (
          <div style={{ padding: '60px', textAlign: 'center', color: colors.textMuted }}>
            <div style={{ fontSize: '15px' }}>코스피 종목 검색 결과가 없습니다</div>
          </div>
        )
        return (
        <>
          <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px' }}>
            {query ? `"${query}" 검색 결과` : '최근 공시 기업'} {kospiOnly.length}건
          </div>
          <div className="company-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {kospiOnly.map((c) => {
              const summary = (c.card_summary || '').split('\n')[0].slice(0, 80)

              return (
                <div
                  key={c.corp_code}
                  onClick={() => onSelectCard && onSelectCard(c.corp_code)}
                  style={{
                    ...getCardStyle(colors),
                    cursor: 'pointer',
                    transition: 'box-shadow 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.accent
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = colors.border
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  {/* 기업명 + 등급 뱃지 */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: colors.textPrimary, fontFamily: FONTS.serif }}>
                          {c.corp_name}
                        </span>
                        <span style={{
                          fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                          ...gradeStyle(c.best_grade),
                        }}>
                          {c.best_grade}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: FONTS.mono, marginTop: '2px' }}>
                        {c.stock_code || ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: colors.textSecondary }}>
                        공시 {c.disclosure_count}건
                      </div>
                    </div>
                  </div>

                  {/* AI 요약 미리보기 */}
                  {summary && (
                    <div style={{
                      fontSize: '12px', color: colors.textSecondary, lineHeight: '1.5',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {summary}{summary.length >= 80 ? '...' : ''}
                    </div>
                  )}

                  {/* 최근 공시일 */}
                  <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: '8px', fontFamily: FONTS.mono }}>
                    최근 공시 {c.last_disclosure_at ? new Date(c.last_disclosure_at).toLocaleDateString('ko-KR') : ''}
                  </div>
                </div>
              )
            })}
          </div>
        </>
        )
      })()}
    </div>
  )
}


// ── 스타일 함수 ─────────────────────────────────────────────────

const getCardStyle = (colors) => ({
  backgroundColor: colors.bgCard,
  borderRadius: '16px',
  padding: '2rem',
  border: `1px solid ${colors.border}`,
  boxShadow: '0 12px 24px -8px rgba(0,0,0,0.05)',
  transition: 'transform 0.3s ease',
})

const getSectionTitleStyle = (colors) => ({
  fontSize: '1.1rem',
  fontWeight: 700,
  fontFamily: "'Noto Serif KR', 'Georgia', serif",
  color: colors.textPrimary,
  marginBottom: '1.25rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
})

const getEmptyStyle = (colors) => ({
  padding: '20px',
  textAlign: 'center',
  fontSize: '13px',
  color: colors.textMuted,
})

const getLinkBtnStyle = (colors) => ({
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: colors.accent,
  fontSize: '13px',
  fontWeight: 600,
  padding: 0,
})

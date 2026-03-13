import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  AreaChart, Area,
  PieChart, Pie, Cell,
  ResponsiveContainer,
} from 'recharts'
import GradeBadge from './GradeBadge'
import CompanyCardSkeleton from './skeletons/CompanyCardSkeleton'
import { tooltipStyle, chartGrid, chartAxis } from './ChartPrimitives'
import EmptyState from './EmptyState'
import { useCompanyCard } from '../hooks/useCompanyCard'
import { useCompanyCards } from '../hooks/useCompanyCards'
import { useEdgeSignalDetail } from '../hooks/useEdgeSignals'
import { useSupplyDemand } from '../hooks/useSupplyDemand'
import {
  GRADE_COLORS, MARKET_LABELS, PREMIUM,
  FONTS, formatKoreanNumber, formatPercent,
} from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'
import { API } from '../lib/api'

// YYYYMMDD → MM.DD 변환
const fmtDate = (dt) => {
  if (!dt || dt.length < 8) return dt || ''
  return `${dt.slice(4, 6)}.${dt.slice(6, 8)}`
}

const CARD_TABS = [
  { key: 'summary', label: '요약' },
  { key: 'financials', label: '재무' },
  { key: 'market', label: '시장' },
  { key: 'filings', label: '공시' },
]

export default function CompanyCard({ corpCode, onBack, onViewCard }) {
  const { colors, dark } = useTheme()
  const { card, trend, candles, loading, error } = useCompanyCard(corpCode)
  const { signal: edgeSignal } = useEdgeSignalDetail(corpCode)
  const stockCode = card?.card_data?.header?.stock_code || ''
  const { instTrend, foreignTrend, loading: supplyLoading } = useSupplyDemand(stockCode)
  const navigate = useNavigate()
  const [mobileTab, setMobileTab] = React.useState('summary')

  if (!corpCode) {
    return <CardListView onSelectCard={onViewCard} />
  }

  if (loading) {
    return <CompanyCardSkeleton />
  }

  if (error || !card) {
    return (
      <div style={{ padding: '40px 24px' }}>
        <EmptyState
          icon="chart"
          title={error || '기업 카드를 찾을 수 없습니다'}
          description="데이터가 아직 생성되지 않았거나 오류가 발생했습니다"
          action="목록으로 돌아가기"
          onAction={onBack}
        />
      </div>
    )
  }

  const cardData = card.card_data || {}
  const header = cardData.header || {}
  const market = cardData.market || {}
  const overview = cardData.overview || {}
  const financials = cardData.financials || {}
  const shareholders = cardData.shareholders || []
  const timeline = cardData.timeline || {}
  const dividend = cardData.dividend || null
  const handleBack = () => {
    if (onViewCard) onViewCard(null)
    else if (onBack) onBack()
  }

  return (
    <div className="page-container content-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px' }}>
      {/* 뒤로가기 */}
      <div style={{ marginBottom: '14px' }}>
        <button onClick={handleBack} style={{
          ...getLinkBtnStyle(colors), fontSize: '12px',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          목록으로
        </button>
      </div>


      {/* Mobile tab bar */}
      <div className="card-mobile-tabs">
        {CARD_TABS.map((t) => (
          <button
            key={t.key}
            className={mobileTab === t.key ? 'active' : ''}
            onClick={() => setMobileTab(t.key)}
            style={{
              flex: 1, padding: '12px 0', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: mobileTab === t.key ? 700 : 500,
              backgroundColor: 'transparent',
              color: mobileTab === t.key ? PREMIUM.accent : colors.textMuted,
              borderBottom: mobileTab === t.key ? `2px solid ${PREMIUM.accent}` : '2px solid transparent',
              transition: 'all 0.15s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* 1. 헤더 — always visible */}
        <CompanyHeader header={header} market={market} />

        {/* Tab: 요약 */}
        <div className={`card-tab-section card-tab-summary ${mobileTab === 'summary' ? 'card-tab-active' : ''}`}>
          {overview && Object.values(overview).some(v => v) && (
            <Section title="기업 개황">
              <CompanyOverview overview={overview} header={header} />
            </Section>
          )}
          <Section title="밸류에이션 분석">
            <ValuationSection cardData={cardData} />
          </Section>
        </div>

        {/* Tab: 재무 */}
        <div className={`card-tab-section card-tab-financials ${mobileTab === 'financials' ? 'card-tab-active' : ''}`}>
          <Section title="재무 현황">
            <FinancialChart financials={financials} sector={header.sector} />
          </Section>
          {dividend && (
            <Section title="배당 현황">
              <DividendSection dividend={dividend} />
            </Section>
          )}
          <div className="company-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Section title="60일 주가 추이">
              <PriceChart candles={candles} />
            </Section>
            <Section title="주요주주 현황">
              <ShareholderChart shareholders={shareholders} />
            </Section>
          </div>
        </div>

        {/* Tab: 시장 */}
        <div className={`card-tab-section card-tab-market ${mobileTab === 'market' ? 'card-tab-active' : ''}`}>
          {(foreignTrend.length > 0 || instTrend.length > 0) && (
            <Section title="기관/외국인 수급 현황">
              <SupplyDemandSection foreignTrend={foreignTrend} instTrend={instTrend} market={market} loading={supplyLoading} />
            </Section>
          )}
        </div>

        {/* Tab: 공시 */}
        <div className={`card-tab-section card-tab-filings ${mobileTab === 'filings' ? 'card-tab-active' : ''}`}>
          {timeline.trigger && timeline.trigger.report_nm && (
            <Section title="트리거 공시">
              <TriggerInfo trigger={timeline.trigger} />
            </Section>
          )}
          {timeline.history && timeline.history.length > 0 && (
            <Section title="최근 공시 이력">
              <DisclosureHistory history={timeline.history} colors={colors} dark={dark} />
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}



// ── 공통 래퍼 ─────────────────────────────────────────────────────

function Section({ title, children }) {
  const { colors, dark } = useTheme()
  return (
    <div style={{
      backgroundColor: colors.bgCard,
      borderRadius: '12px',
      padding: '14px 16px',
      border: `1px solid ${colors.border}`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '7px',
        fontSize: '11px', fontWeight: 600, color: colors.textMuted,
        marginBottom: '12px', letterSpacing: '0.01em',
      }}>
        <span style={{
          width: '2px', height: '10px', borderRadius: '1px',
          backgroundColor: PREMIUM.accent, flexShrink: 0,
        }} />
        {title}
      </div>
      {children}
    </div>
  )
}


// ── 1. 헤더 ──────────────────────────────────────────────────────

function CompanyHeader({ header, market }) {
  const { colors, dark } = useTheme()
  const changeColor = (market.change || 0) >= 0 ? colors.positive : colors.negative
  const changeSign = (market.change || 0) >= 0 ? '+' : ''
  const marketLabel = MARKET_LABELS[header.corp_cls] || ''

  const metrics = [
    market.market_cap != null && { label: '시가총액', value: formatKoreanNumber(market.market_cap * 1e8) },
    market.volume != null && { label: '거래량', value: Number(market.volume).toLocaleString() },
    market.per != null && { label: 'PER', value: market.per.toFixed(1) },
    market.pbr != null && { label: 'PBR', value: market.pbr.toFixed(2) },
    market.foreign_ratio != null && { label: '외국인', value: `${market.foreign_ratio.toFixed(1)}%` },
  ].filter(Boolean)

  return (
    <div style={{
      backgroundColor: colors.bgCard,
      borderRadius: '12px',
      padding: '16px 18px',
      border: `1px solid ${colors.border}`,
      borderBottom: `2px solid ${PREMIUM.accent}20`,
    }}>
      {/* 상단: 기업명 + 현재가 */}
      <div className="company-header-layout" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '22px', fontWeight: 700, fontFamily: FONTS.serif,
              color: colors.textPrimary, letterSpacing: '-0.02em',
            }}>
              {header.corp_name || '기업명'}
            </span>
            {marketLabel && (
              <span style={{
                fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '10px',
                backgroundColor: `${PREMIUM.accent}14`, color: PREMIUM.accent,
                letterSpacing: '0.02em',
              }}>
                {marketLabel}
              </span>
            )}
          </div>
          <div style={{
            fontSize: '12px', color: colors.textMuted, display: 'flex', gap: '8px', alignItems: 'center',
          }}>
            {header.stock_code && <span style={{ fontFamily: FONTS.mono, fontWeight: 500 }}>{header.stock_code}</span>}
            {header.ceo && <><span style={{ opacity: 0.3 }}>·</span><span>{header.ceo}</span></>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: '26px', fontWeight: 700, fontFamily: FONTS.mono,
            color: colors.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.1,
          }}>
            {market.current_price ? Number(market.current_price).toLocaleString() : '-'}
            <span style={{ fontSize: '11px', fontWeight: 400, color: colors.textMuted, marginLeft: '2px' }}>원</span>
          </div>
          <div style={{
            fontSize: '13px', fontFamily: FONTS.mono, color: changeColor,
            fontWeight: 700, marginTop: '3px',
          }}>
            {market.change != null ? `${changeSign}${market.change.toFixed(2)}%` : ''}
            {market.change_val != null && (
              <span style={{ marginLeft: '5px', fontSize: '11px', fontWeight: 500, opacity: 0.8 }}>
                ({changeSign}{Number(market.change_val).toLocaleString()})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 핵심 지표 행 */}
      {metrics.length > 0 && (
        <div style={{
          display: 'flex', marginTop: '14px', paddingTop: '12px',
          borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5'}`,
          flexWrap: 'wrap', gap: '0',
        }}>
          {metrics.map((m, i) => (
            <div key={m.label} style={{
              flex: '1 1 0', minWidth: '70px', padding: '0 10px',
              borderLeft: i > 0 ? `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5'}` : 'none',
            }}>
              <div style={{
                fontSize: '10px', fontWeight: 600, color: colors.textMuted,
                letterSpacing: '0.03em', marginBottom: '3px', textTransform: 'uppercase',
              }}>{m.label}</div>
              <div style={{
                fontSize: '14px', fontWeight: 700, fontFamily: FONTS.mono,
                color: colors.textPrimary, lineHeight: 1.3,
              }}>{m.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* 52주 레인지 */}
      {market.w52_high != null && market.w52_low != null && (
        <div style={{ marginTop: '12px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: '9px', color: colors.textMuted, marginBottom: '5px',
          }}>
            <span style={{ fontFamily: FONTS.mono }}>52W Low {Number(market.w52_low).toLocaleString()}</span>
            <span style={{ fontFamily: FONTS.mono }}>High {Number(market.w52_high).toLocaleString()}</span>
          </div>
          <div style={{
            height: '3px', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0',
            borderRadius: '1.5px', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, height: '100%',
              width: `${Math.min(100, Math.max(0, market.w52_position || 50))}%`,
              background: `linear-gradient(90deg, ${PREMIUM.accent}80, ${PREMIUM.accent})`,
              borderRadius: '1.5px',
            }} />
          </div>
        </div>
      )}
    </div>
  )
}


// ── 1.5 기업 개황 ────────────────────────────────────────────────

const INDUTY_LABELS = {
  'A': '농업, 임업 및 어업', 'B': '광업', 'C': '제조업',
  'D': '전기, 가스, 증기 및 공기조절 공급업', 'E': '수도, 하수 및 폐기물 처리',
  'F': '건설업', 'G': '도매 및 소매업', 'H': '운수 및 창고업',
  'I': '숙박 및 음식점업', 'J': '정보통신업', 'K': '금융 및 보험업',
  'L': '부동산업', 'M': '전문, 과학 및 기술 서비스업', 'N': '사업시설 관리',
  'O': '공공행정', 'P': '교육 서비스업', 'Q': '보건업 및 사회복지',
  'R': '예술, 스포츠 및 여가', 'S': '협회 및 단체',
}

function CompanyOverview({ overview, header }) {
  const { colors, dark } = useTheme()

  const formatDate = (dt) => {
    if (!dt || dt.length !== 8) return dt || '-'
    return `${dt.slice(0, 4)}.${dt.slice(4, 6)}.${dt.slice(6, 8)}`
  }

  const industryLabel = (() => {
    const code = overview.induty_code || ''
    if (!code) return ''
    const firstChar = code.charAt(0).toUpperCase()
    return INDUTY_LABELS[firstChar] || code
  })()

  const tags = [
    overview.corp_name_eng,
    industryLabel,
    overview.est_dt ? `${formatDate(overview.est_dt)} 설립` : '',
    overview.acc_mt ? `${overview.acc_mt}월 결산` : '',
  ].filter(Boolean)

  const irUrl = overview.ir_url || overview.hm_url

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
      {tags.map((tag, i) => (
        <span key={i} style={{
          fontSize: '11px', fontWeight: 500, color: colors.textSecondary,
          backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#F4F4F5',
          padding: '3px 9px', borderRadius: '6px', lineHeight: '1.4',
        }}>
          {tag}
        </span>
      ))}
      {irUrl && (
        <a
          href={irUrl.startsWith('http') ? irUrl : `https://${irUrl}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            fontSize: '11px', color: PREMIUM.accent,
            textDecoration: 'none', transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.7'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          IR/홈페이지 →
        </a>
      )}
    </div>
  )
}


// ── 2. 재무 현황 (3개년 성장 시각화) ─────────────────────────────

function FinancialChart({ financials, sector }) {
  const { colors, dark } = useTheme()
  const rawYears = financials.years || []
  const items = financials.items || {}

  const FINANCIAL_KW = ['은행', '증권', '보험', '금융', '카드', '캐피탈', '저축']
  const isFinancial = sector && FINANCIAL_KW.some(kw => sector.includes(kw))

  const plMetrics = [
    { key: 'revenue', label: isFinancial ? '영업수익' : '매출액', yoyKey: 'revenue_yoy', color: '#2563EB' },
    { key: 'operating_income', label: '영업이익', yoyKey: 'operating_income_yoy', color: '#0D9488' },
    { key: 'net_income', label: '순이익', yoyKey: 'net_income_yoy', color: '#8B5CF6' },
  ]
  const bsMetrics = [
    { key: 'total_assets', label: '총자산', color: '#6366F1' },
    { key: 'total_liabilities', label: '총부채', color: '#3B82F6' },
    { key: 'total_equity', label: '자기자본', color: '#F59E0B' },
  ].filter(m => items[m.key]?.some(v => v != null))

  if (rawYears.length === 0) {
    return <div style={getEmptyStyle(colors, dark)}>재무 데이터가 없습니다</div>
  }

  const pickIndices = []
  const displayYears = []
  rawYears.forEach((yr, i) => {
    if (yr.includes('.Q')) return
    pickIndices.push(i)
    displayYears.push(yr)
  })

  const pickValue = (key, idx) => items[key]?.[pickIndices[idx]] ?? null
  const isEstimate = (yr) => yr.endsWith('E')

  // 최신년도 (2025E 또는 마지막 연도)
  const latestIdx = displayYears.length - 1
  const latestYear = displayYears[latestIdx]

  const chartData = displayYears.map((yr, i) => {
    const row = { year: yr.replace('E', ' E'), _isEstimate: isEstimate(yr), _isLatest: i === latestIdx }
    plMetrics.forEach(m => { row[m.label] = pickValue(m.key, i) })
    return row
  })

  // 최신년도 강조 바 (full opacity), 이전년도 반투명
  const SmartBar = (props) => {
    const { x, y, width, height, fill, payload } = props
    if (!height) return null
    const absH = Math.abs(height)
    const isLatest = payload?._isLatest
    return (
      <rect
        x={x} y={y} width={width} height={absH}
        fill={fill}
        opacity={isLatest ? 1.0 : 0.38}
        rx={isLatest ? 4 : 2} ry={isLatest ? 4 : 2}
      />
    )
  }

  // 최신년도 바에만 레이블 표시
  const LatestBarLabel = (props) => {
    const { x, y, width, value, height, index } = props
    if (index !== latestIdx || value == null || isNaN(value)) return null
    const abs = Math.abs(value)
    let text = ''
    if (abs >= 1e12) text = (value / 1e12).toFixed(1) + '조'
    else if (abs >= 1e8) text = Math.round(value / 1e8) + '억'
    else if (abs >= 1e4) text = Math.round(value / 1e4) + '만'
    else text = value.toLocaleString()
    const labelY = (height < 0) ? y + Math.abs(height) + 12 : y - 5
    return (
      <text x={x + width / 2} y={labelY} textAnchor="middle" fontSize={9} fontWeight={700} fill={colors.textMuted}>
        {text}
      </text>
    )
  }

  return (
    <div>
      {/* ① 최신년도 KPI 요약 카드 */}
      <div className="fin-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
        {plMetrics.map(m => {
          const latestVal = pickValue(m.key, latestIdx)
          const yoy = items[m.yoyKey]?.[pickIndices[latestIdx]]
          return (
            <div key={m.key} style={{
              borderRadius: '10px',
              border: `1px solid ${colors.border}`,
              backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
              padding: '10px 12px',
              borderTop: `2.5px solid ${m.color}`,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: '5px',
              }}>
                <span style={{ fontSize: '10px', fontWeight: 700, color: colors.textMuted, letterSpacing: '0.04em' }}>
                  {m.label}
                </span>
                <span style={{ fontSize: '9px', color: colors.textMuted, opacity: 0.65 }}>
                  {isEstimate(latestYear) ? `${latestYear}(추정)` : latestYear}
                </span>
              </div>
              <div style={{
                fontSize: '17px', fontWeight: 700, fontFamily: FONTS.mono, lineHeight: 1,
                color: latestVal != null ? (latestVal < 0 ? colors.negative : colors.textPrimary) : colors.textMuted,
              }}>
                {latestVal != null ? formatKoreanNumber(latestVal) : '-'}
              </div>
              {yoy != null && (
                <div style={{
                  marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '2px',
                  fontSize: '10px', fontWeight: 700, fontFamily: FONTS.mono,
                  padding: '2px 7px', borderRadius: '20px',
                  backgroundColor: yoy >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                  color: yoy >= 0 ? colors.positive : colors.negative,
                }}>
                  {yoy >= 0 ? '▲' : '▼'} {Math.abs(yoy).toFixed(1)}% YoY
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* ② 연도별 추이 바 차트 (최신년도 강조) */}
      <div style={{
        borderRadius: '10px',
        border: `1px solid ${colors.border}`,
        backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
        padding: '12px 14px 8px',
        marginBottom: '12px',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '8px',
        }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: colors.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            연도별 추이
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {plMetrics.map(m => (
              <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: m.color }} />
                <span style={{ fontSize: '10px', color: colors.textSecondary }}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="22%" barGap={2}>
              <CartesianGrid {...chartGrid(dark)} />
              <XAxis
                dataKey="year"
                axisLine={false} tickLine={false}
                tick={(tickProps) => {
                  const { x, y, payload } = tickProps
                  const isEst = payload.value.includes('E')
                  const dataItem = chartData.find(d => d.year === payload.value)
                  const isLat = dataItem?._isLatest
                  return (
                    <g transform={`translate(${x},${y})`}>
                      <text textAnchor="middle" dy={14} fontSize={11}
                        fontWeight={isLat ? 800 : 600}
                        fill={isEst ? '#F59E0B' : isLat ? colors.textPrimary : colors.textMuted}>
                        {payload.value}
                      </text>
                    </g>
                  )
                }}
              />
              <YAxis
                tick={{ fontSize: 9, fill: colors.textMuted }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => {
                  if (v == null || isNaN(v)) return ''
                  const abs = Math.abs(v)
                  if (abs >= 1e12) return (v / 1e12).toFixed(1) + '조'
                  if (abs >= 1e8) return Math.round(v / 1e8) + '억'
                  return ''
                }}
                width={40}
              />
              <Tooltip
                formatter={(value, name) => [formatKoreanNumber(value), name]}
                contentStyle={tooltipStyle(colors, dark)}
              />
              {plMetrics.map(m => (
                <Bar
                  key={m.key}
                  dataKey={m.label}
                  fill={m.color}
                  shape={(props) => <SmartBar {...props} fill={m.color} />}
                  radius={[3, 3, 0, 0]}
                  label={<LatestBarLabel />}
                  animationDuration={700}
                  animationEasing="ease-out"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ③ P&L 테이블 */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{
          fontSize: '10px', fontWeight: 700, color: colors.textMuted,
          marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase',
        }}>
          P&amp;L (단위: 억원)
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '10px' }}>
        <div style={{ minWidth: `${90 + displayYears.length * 90}px`, borderRadius: '10px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
          {/* 헤더 */}
          <div style={{
            display: 'grid', gridTemplateColumns: `90px repeat(${displayYears.length}, 1fr)`,
            backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
            padding: '8px 14px', gap: '8px',
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase' }}>항목</div>
            {displayYears.map((yr, i) => (
              <div key={yr} style={{
                fontSize: '10px', fontWeight: 700, textAlign: 'right',
                color: isEstimate(yr) ? '#F59E0B' : (i === latestIdx ? colors.textPrimary : colors.textMuted),
                fontStyle: isEstimate(yr) ? 'italic' : 'normal',
                letterSpacing: '0.04em',
                opacity: i === latestIdx ? 1 : 0.65,
              }}>
                {yr}{isEstimate(yr) ? ' (추정)' : ''}
              </div>
            ))}
          </div>
          {/* P&L 행 */}
          {plMetrics.map((m, mi) => {
            const opMargins = displayYears.map((_, i) => {
              if (m.key !== 'operating_income') return null
              const rev = pickValue('revenue', i)
              const oi = pickValue('operating_income', i)
              return (rev && oi != null) ? (oi / rev * 100) : null
            })
            return (
              <React.Fragment key={m.key}>
                <div style={{
                  display: 'grid', gridTemplateColumns: `90px repeat(${displayYears.length}, 1fr)`,
                  padding: '8px 14px', gap: '8px',
                  borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'}`,
                  backgroundColor: mi % 2 === 0 ? 'transparent' : (dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA'),
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: m.color, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: m.color }} />
                    {m.label}
                  </div>
                  {displayYears.map((yr, i) => {
                    const val = pickValue(m.key, i)
                    const isLat = i === latestIdx
                    return (
                      <div key={yr} style={{
                        fontSize: isLat ? '13px' : '12px',
                        fontFamily: FONTS.mono, textAlign: 'right',
                        fontWeight: isLat ? 700 : 500,
                        color: val != null
                          ? (val < 0 ? colors.negative : isLat ? colors.textPrimary : colors.textSecondary)
                          : colors.textMuted,
                        fontStyle: isEstimate(yr) ? 'italic' : 'normal',
                        opacity: isLat ? 1 : 0.75,
                      }}>
                        {val != null ? formatKoreanNumber(val) : '-'}
                      </div>
                    )
                  })}
                </div>
                {/* 영업이익률 행 */}
                {m.key === 'operating_income' && opMargins.some(v => v != null) && (
                  <div style={{
                    display: 'grid', gridTemplateColumns: `90px repeat(${displayYears.length}, 1fr)`,
                    padding: '5px 14px 5px 28px', gap: '8px',
                    backgroundColor: dark ? 'rgba(255,255,255,0.015)' : '#F7F7F8',
                  }}>
                    <div style={{ fontSize: '11px', color: colors.textMuted }}>영업이익률</div>
                    {opMargins.map((r, i) => {
                      const isLat = i === latestIdx
                      return (
                        <div key={i} style={{
                          fontSize: '11px', fontFamily: FONTS.mono, textAlign: 'right',
                          fontWeight: isLat ? 700 : 500,
                          color: r != null ? (r < 0 ? colors.negative : colors.positive) : colors.textMuted,
                          fontStyle: isEstimate(displayYears[i]) ? 'italic' : 'normal',
                          opacity: isLat ? 1 : 0.7,
                        }}>
                          {r != null ? `${r.toFixed(1)}%` : '-'}
                        </div>
                      )
                    })}
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
        </div>
      </div>

      {/* ④ Balance Sheet */}
      {bsMetrics.length > 0 && (
        <div>
          <div style={{
            fontSize: '10px', fontWeight: 700, color: colors.textMuted,
            marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            Balance Sheet
          </div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', borderRadius: '10px' }}>
          <div style={{ minWidth: `${100 + displayYears.length * 90}px`, borderRadius: '10px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            {/* 헤더 */}
            <div style={{
              display: 'grid', gridTemplateColumns: `100px repeat(${displayYears.length}, 1fr)`,
              backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
              padding: '8px 14px', gap: '8px',
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>항목</div>
              {displayYears.map((yr, i) => (
                <div key={yr} style={{
                  fontSize: '10px', fontWeight: 700, textAlign: 'right',
                  color: isEstimate(yr) ? colors.textMuted : (i === latestIdx ? colors.textPrimary : colors.textSecondary),
                  fontStyle: isEstimate(yr) ? 'italic' : 'normal',
                  opacity: i === latestIdx ? 1 : 0.6,
                  textTransform: 'uppercase', letterSpacing: '0.04em',
                }}>{yr}</div>
              ))}
            </div>
            {/* 데이터 행 */}
            {bsMetrics.map((m, mi) => (
              <div key={m.key} style={{
                display: 'grid', gridTemplateColumns: `100px repeat(${displayYears.length}, 1fr)`,
                padding: '8px 14px', gap: '8px',
                borderTop: mi > 0 ? `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'}` : 'none',
                backgroundColor: mi % 2 === 0 ? 'transparent' : (dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA'),
              }}>
                <div style={{
                  fontSize: '12px', fontWeight: 600, color: m.color,
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: m.color }} />
                  {m.label}
                </div>
                {displayYears.map((yr, i) => {
                  const isLat = i === latestIdx
                  return (
                    <div key={yr} style={{
                      fontSize: isLat ? '13px' : '12px',
                      fontFamily: FONTS.mono, textAlign: 'right',
                      color: isLat ? colors.textPrimary : colors.textSecondary,
                      fontWeight: isLat ? 700 : 500,
                      fontStyle: isEstimate(yr) ? 'italic' : 'normal',
                      opacity: isLat ? 1 : 0.7,
                    }}>
                      {pickValue(m.key, i) != null ? formatKoreanNumber(pickValue(m.key, i)) : '-'}
                    </div>
                  )
                })}
              </div>
            ))}
            {/* 부채비율 행 */}
            {items.total_liabilities && items.total_equity && (() => {
              const ratios = displayYears.map((_, i) => {
                const liab = pickValue('total_liabilities', i)
                const eq = pickValue('total_equity', i)
                return (liab != null && eq != null && eq !== 0) ? ((liab / eq) * 100) : null
              })
              return (
                <div style={{
                  display: 'grid', gridTemplateColumns: `100px repeat(${displayYears.length}, 1fr)`,
                  padding: '8px 14px', gap: '8px',
                  borderTop: `1px solid ${colors.border}`,
                  backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#F9FAFB',
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: colors.textSecondary }}>부채비율</div>
                  {ratios.map((r, i) => {
                    const isLat = i === latestIdx
                    return (
                      <div key={i} style={{
                        fontSize: isLat ? '13px' : '12px',
                        fontFamily: FONTS.mono, textAlign: 'right', fontWeight: isLat ? 700 : 600,
                        color: r != null ? (r > 200 ? colors.negative : r > 100 ? '#D97706' : colors.positive) : colors.textMuted,
                        fontStyle: isEstimate(displayYears[i]) ? 'italic' : 'normal',
                        opacity: isLat ? 1 : 0.7,
                      }}>
                        {r != null ? `${r.toFixed(1)}%` : '-'}
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </div>
          </div>
        </div>
      )}
    </div>
  )
}


// ── 3. 60일 주가 ─────────────────────────────────────────────────

function PriceChart({ candles }) {
  const { colors, dark } = useTheme()
  const gradientId = React.useId()

  if (!candles || candles.length === 0) {
    return <div style={getEmptyStyle(colors, dark)}>주가 데이터가 없습니다</div>
  }

  const closes = candles.map(c => c.close_price || 0)
  const first = closes[0]
  const last = closes[closes.length - 1]
  const totalChange = first ? ((last - first) / first * 100) : 0
  const trendColor = totalChange >= 0 ? colors.positive : colors.negative

  const chartData = candles.map(c => ({
    date: fmtDate(c.dt),
    price: c.close_price,
    volume: c.volume,
  }))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span style={{ fontSize: '11px', color: colors.textMuted, fontFamily: FONTS.mono }}>
          {fmtDate(candles[0]?.dt)} ~ {fmtDate(candles[candles.length - 1]?.dt)}
        </span>
        <span style={{
          fontSize: '11px', fontFamily: FONTS.mono, fontWeight: 700,
          padding: '1px 8px', borderRadius: '10px',
          backgroundColor: totalChange >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
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
              contentStyle={tooltipStyle(colors, dark)}
              labelStyle={{ color: colors.textPrimary, fontWeight: 600, fontSize: '11px' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={trendColor}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 5, fill: trendColor }}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}


// ── 4-a. 배당 현황 ───────────────────────────────────────────────

function DividendSection({ dividend }) {
  const { colors, dark } = useTheme()
  if (!dividend) return null

  const { years = [], common, preferred } = dividend
  if (!common) return <div style={getEmptyStyle(colors, dark)}>배당 데이터가 없습니다</div>

  const rows = [
    { label: '주당배당금(원)', values: common.dps, fmt: v => v != null ? `${Number(v).toLocaleString()}` : '-' },
    { label: '배당수익률(%)', values: common.yield, fmt: v => v != null ? `${Number(v).toFixed(2)}%` : '-' },
    { label: '배당성향(%)', values: common.payout_ratio, fmt: v => v != null ? `${Number(v).toFixed(1)}%` : '-' },
  ]

  const cellStyle = (isHeader) => ({
    padding: '6px 10px',
    fontSize: '12px',
    fontFamily: isHeader ? FONTS.sans : FONTS.mono,
    fontWeight: isHeader ? 600 : 400,
    color: isHeader ? colors.textMuted : colors.textPrimary,
    textAlign: 'right',
    borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    whiteSpace: 'nowrap',
  })

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...cellStyle(true), textAlign: 'left' }}>구분 (보통주)</th>
            {years.map(y => (
              <th key={y} style={cellStyle(true)}>{y}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.label}>
              <td style={{ ...cellStyle(false), textAlign: 'left', color: colors.textMuted, fontFamily: FONTS.sans, fontSize: '12px' }}>
                {row.label}
              </td>
              {years.map((y, i) => (
                <td key={y} style={cellStyle(false)}>
                  {row.fmt((row.values || [])[i])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {preferred && (
        <div style={{ marginTop: '6px', fontSize: '11px', color: colors.textMuted, paddingLeft: '2px' }}>
          * 우선주 배당: {(preferred.dps || []).map((v, i) =>
            v != null ? `${years[i]} ${Number(v).toLocaleString()}원` : null
          ).filter(Boolean).join(' / ') || '-'}
        </div>
      )}
    </div>
  )
}


// ── 4. 주요주주 (SVG 도넛) ──────────────────────────────────────

const DONUT_COLORS = ['#2563EB', '#0D9488', '#8B5CF6', '#E8364E', '#D97706', '#6B7B8D', '#EC4899', '#14B8A6', '#F59E0B', '#6366F1']

function ShareholderChart({ shareholders }) {
  const { colors, dark } = useTheme()
  if (!shareholders || shareholders.length === 0) {
    return <div style={getEmptyStyle(colors, dark)}>주주 데이터가 없습니다</div>
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
    pieData.push({ name: '기타', value: otherRatio, color: dark ? 'rgba(255,255,255,0.08)' : '#E2E8F0' })
  }

  return (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%" cy="50%"
              innerRadius={30} outerRadius={56}
              dataKey="value" strokeWidth={0}
              animationDuration={800}
              animationBegin={200}
              animationEasing="ease-out"
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
              contentStyle={tooltipStyle(colors, dark)}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: '9px', color: colors.textMuted }}>주요주주</div>
          <div style={{
            fontSize: '13px', fontWeight: 700, fontFamily: FONTS.mono,
            color: colors.textPrimary,
          }}>
            {totalRatio.toFixed(1)}%
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        {top.map((h, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '2px',
              backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length], flexShrink: 0,
            }} />
            <span style={{
              fontSize: '11px', color: colors.textPrimary, flex: 1,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {h.name}
            </span>
            <span style={{
              fontSize: '11px', fontFamily: FONTS.mono, fontWeight: 600,
              color: colors.textSecondary, flexShrink: 0,
            }}>
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
  const { colors, dark } = useTheme()

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: colors.textMuted, fontSize: '13px' }}>수급 데이터 로딩 중...</div>
  }

  if (foreignTrend.length === 0 && instTrend.length === 0) {
    return <div style={getEmptyStyle(colors, dark)}>수급 데이터가 없습니다</div>
  }

  const foreignNetTotal = foreignTrend.reduce((s, d) => s + (d.foreign_net || 0), 0)
  const instNetTotal = instTrend.reduce((s, d) => s + (d.inst_net || 0), 0)
  const latestForeignRatio = market?.foreign_ratio || (foreignTrend.length > 0 ? foreignTrend[foreignTrend.length - 1]?.foreign_ratio : null)

  const chartData = foreignTrend.map((d) => ({
    date: fmtDate(d.date),
    net: d.foreign_net || 0,
  }))

  let instCumul = 0
  const instChartData = instTrend.map((d) => {
    instCumul += d.inst_net || 0
    return { date: fmtDate(d.date), cumul: instCumul }
  })

  const summaryItems = [
    { label: '외국인 순매수 (20일)', value: foreignNetTotal, colored: true },
    { label: '기관 순매수 (20일)', value: instNetTotal, colored: true },
    { label: '외국인 보유율', value: latestForeignRatio, isForeignRatio: true },
  ]

  return (
    <div>
      {/* 요약 카드 3장 */}
      <div className="supply-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
        {summaryItems.map((item) => (
          <div key={item.label} style={{
            backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
            borderRadius: '10px', padding: '10px 12px',
            borderLeft: `3px solid ${item.colored
              ? (item.value >= 0 ? colors.positive + '60' : colors.negative + '60')
              : (dark ? 'rgba(255,255,255,0.08)' : '#E4E4E7')}`,
          }}>
            <div style={{
              fontSize: '10px', color: colors.textMuted, marginBottom: '4px',
              fontWeight: 600, letterSpacing: '0.02em',
            }}>{item.label}</div>
            <div style={{
              fontSize: '14px', fontWeight: 700, fontFamily: FONTS.mono,
              color: item.isForeignRatio ? colors.textPrimary : (item.value >= 0 ? colors.positive : colors.negative),
            }}>
              {item.isForeignRatio
                ? (item.value != null ? `${Number(item.value).toFixed(1)}%` : '-')
                : `${item.value >= 0 ? '+' : ''}${formatKoreanNumber(item.value)}`
              }
            </div>
          </div>
        ))}
      </div>

      {/* 외국인 20일 바 차트 */}
      {chartData.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={{
            fontSize: '10px', fontWeight: 700, color: colors.textMuted,
            marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            Foreign Daily Net Buy
          </div>
          <div className="chart-supply" style={{ width: '100%', height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap="20%">
                <CartesianGrid {...chartGrid(dark)} />
                <XAxis dataKey="date" {...chartAxis(colors)} axisLine={{ stroke: colors.border }} />
                <YAxis tickFormatter={formatKoreanNumber} {...chartAxis(colors)} width={65} />
                <Tooltip
                  formatter={(value) => [formatKoreanNumber(value), '순매수']}
                  contentStyle={tooltipStyle(colors, dark)}
                  labelStyle={{ color: colors.textPrimary, fontWeight: 600 }}
                />
                <Bar dataKey="net" radius={[4, 4, 0, 0]} animationDuration={600} animationEasing="ease-out">
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
          <div style={{
            fontSize: '10px', fontWeight: 700, color: colors.textMuted,
            marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            Institutional Cumulative Net Buy
          </div>
          <div className="chart-inst" style={{ width: '100%', height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={instChartData}>
                <defs>
                  <linearGradient id="instGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid {...chartGrid(dark)} />
                <XAxis dataKey="date" {...chartAxis(colors)} axisLine={{ stroke: colors.border }} />
                <YAxis tickFormatter={formatKoreanNumber} {...chartAxis(colors)} width={65} />
                <Tooltip
                  formatter={(value) => [formatKoreanNumber(value), '누적 순매수']}
                  contentStyle={tooltipStyle(colors, dark)}
                  labelStyle={{ color: colors.textPrimary, fontWeight: 600 }}
                />
                <Area
                  type="monotone" dataKey="cumul"
                  stroke="#6366F1" strokeWidth={2}
                  fill="url(#instGradient)" dot={false}
                  activeDot={{ r: 4, fill: '#6366F1' }}
                  animationDuration={800}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}


// ── 7. 트리거 공시 ──────────────────────────────────────────────

function TriggerInfo({ trigger }) {
  const { colors } = useTheme()
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '4px 0',
    }}>
      <GradeBadge grade={trigger.grade} size="lg" />
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, letterSpacing: '-0.01em' }}>
          {trigger.report_nm}
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono, marginTop: '2px' }}>
          {trigger.rcept_no}
        </div>
      </div>
    </div>
  )
}


// ── 공시 이력 ──────────────────────────────────────────────────

function DisclosureHistory({ history, colors, dark }) {
  return (
    <div style={{
      borderRadius: '10px', border: `1px solid ${colors.border}`, overflow: 'hidden',
    }}>
      {history.map((h, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '8px 14px',
          borderBottom: i < history.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'}` : 'none',
          backgroundColor: i % 2 === 0 ? 'transparent' : (dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA'),
        }}>
          <GradeBadge grade={h.grade} size="sm" />
          <span style={{
            fontSize: '12px', color: colors.textPrimary, flex: 1, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{h.report_nm}</span>
          <span style={{
            fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono,
            flexShrink: 0, fontWeight: 500,
          }}>
            {h.created_at ? new Date(h.created_at).toLocaleDateString('ko-KR') : ''}
          </span>
        </div>
      ))}
    </div>
  )
}



// ── 밸류에이션 분석 (프론트엔드 계산) ──────────────────────────────

function ValuationSection({ cardData }) {
  const { colors, dark } = useTheme()
  const market = cardData.market || {}
  const financials = cardData.financials || {}
  const items = financials.items || {}

  const per = _num(market.per)
  const pbr = _num(market.pbr)

  const dividend = cardData.dividend || null
  const noDividend = dividend?.no_dividend === true
  const divCommon = dividend?.common
  const divLastIdx = (dividend?.years || []).length - 1
  // 키움 market 데이터 우선, 없으면 DART dividend 폴백
  const dps = market.dps != null ? market.dps
    : (!noDividend && divLastIdx >= 0) ? (divCommon?.dps || [])[divLastIdx] : null
  const divYield = market.dvr != null ? market.dvr
    : (!noDividend && divLastIdx >= 0) ? (divCommon?.yield || [])[divLastIdx] : null

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

  const risks = []
  if (totalEquity != null && totalEquity <= 0) risks.push({ flag: '완전자본잠식', severity: 'CRITICAL' })
  if (debtRatio != null && debtRatio > 200) risks.push({ flag: '부분자본잠식', severity: 'WARNING' })
  if (operatingIncome != null && operatingIncome < 0) risks.push({ flag: '영업적자', severity: 'WARNING' })
  if (netIncome != null && netIncome < 0) risks.push({ flag: '순손실', severity: 'CAUTION' })
  if (per != null && per > 100) risks.push({ flag: 'PER 과열', severity: 'CAUTION' })
  if (pbr != null && pbr > 0 && pbr < 0.3) risks.push({ flag: '극저PBR', severity: 'WATCH' })

  const metrics = [
    { label: 'PER', value: per, fmt: (v) => v.toFixed(1) + 'x', good: per != null && per > 0 && per < 30 },
    { label: 'PBR', value: pbr, fmt: (v) => v.toFixed(2) + 'x', good: pbr != null && pbr > 0 && pbr < 3 },
    { label: 'ROE', value: roe, fmt: (v) => v.toFixed(1) + '%', good: roe != null && roe > 8 },
    { label: 'OPM', value: opMargin, fmt: (v) => v.toFixed(1) + '%', good: opMargin != null && opMargin > 5 },
    { label: 'DPS', value: dps, noDiv: noDividend, fmt: (v) => Number(v).toLocaleString() + '원', good: dps != null && dps > 0 },
    { label: '배당수익률', value: divYield, noDiv: noDividend, fmt: (v) => v.toFixed(2) + '%', good: divYield != null && divYield > 2 },
  ]

  const hasAny = metrics.some((m) => m.value != null || m.noDiv)
  if (!hasAny) return <div style={getEmptyStyle(colors, dark)}>밸류에이션 데이터가 없습니다</div>

  const _severityColor = {
    CRITICAL: { bg: dark ? 'rgba(37,99,235,0.15)' : '#EFF6FF', text: dark ? '#93C5FD' : '#1D4ED8' },
    WARNING: { bg: dark ? 'rgba(217,119,6,0.15)' : '#FFFBEB', text: dark ? '#FCD34D' : '#D97706' },
    CAUTION: { bg: dark ? 'rgba(202,138,4,0.15)' : '#FEF9C3', text: dark ? '#FACC15' : '#CA8A04' },
    WATCH: { bg: dark ? 'rgba(255,255,255,0.06)' : '#F3F4F6', text: dark ? '#9CA3AF' : '#6B7280' },
  }

  return (
    <div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px', marginBottom: '12px',
      }}>
        {metrics.map((m) => {
          const valueColor = (m.value == null && !m.noDiv) ? colors.textMuted : m.good ? colors.positive : colors.negative
          const displayText = m.value != null ? m.fmt(m.value) : m.noDiv ? '무배당' : '—'
          const displayColor = m.noDiv && m.value == null ? colors.textMuted : valueColor
          return (
            <div key={m.label} style={{
              textAlign: 'center', padding: '8px 4px',
              borderRadius: '8px',
              backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#F8F8F8',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#EFEFEF'}`,
            }}>
              <div style={{ fontSize: '9px', color: colors.textMuted, fontWeight: 600, marginBottom: '4px', letterSpacing: '0.04em' }}>
                {m.label}
              </div>
              <div style={{ fontSize: m.noDiv && m.value == null ? '11px' : '15px', fontWeight: 700, fontFamily: FONTS.mono, color: displayColor }}>
                {displayText}
              </div>
            </div>
          )
        })}
      </div>

      {/* 리스크 플래그 */}
      {risks.length > 0 && (
        <div style={{
          padding: '10px 14px', borderRadius: '10px',
          backgroundColor: dark ? 'rgba(251,191,36,0.06)' : '#FFFBEB',
          border: `1px solid ${dark ? 'rgba(251,191,36,0.15)' : '#FDE68A'}`,
          display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center',
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, color: dark ? '#FCD34D' : '#92400E',
            letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>Risk</span>
          {risks.map((r, i) => {
            const sev = _severityColor[r.severity] || _severityColor.WATCH
            return (
              <span key={i} style={{
                padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700,
                backgroundColor: sev.bg, color: sev.text,
              }}>
                {r.flag}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}

function _num(v) { return v != null ? Number(v) : null }
function _latestVal(arr) { if (!arr) return null; for (let i = arr.length - 1; i >= 0; i--) { if (arr[i] != null) return arr[i] } return null }


// ── Edge-Finder 시그널 섹션 (Phase 12) ──────────────────────────

const EDGE_SIGNAL_STYLE = {
  GREEN: { bg: '#DCFCE7', color: '#16A34A', label: '적극' },
  YELLOW: { bg: '#FEF9C3', color: '#CA8A04', label: '관망' },
  ORANGE: { bg: '#FFF7ED', color: '#EA580C', label: '주의' },
  RED: { bg: '#FEE2E2', color: '#DC2626', label: '회피' },
  NEUTRAL: { bg: '#F3F4F6', color: '#6B7280', label: '판단 보류' },
}

const EDGE_SIGNAL_STYLE_DARK = {
  GREEN: { bg: 'rgba(34,197,94,0.15)', color: '#4ADE80' },
  YELLOW: { bg: 'rgba(234,179,8,0.15)', color: '#FACC15' },
  ORANGE: { bg: 'rgba(234,88,12,0.15)', color: '#FB923C' },
  RED: { bg: 'rgba(239,68,68,0.15)', color: '#F87171' },
  NEUTRAL: { bg: 'rgba(255,255,255,0.06)', color: '#9CA3AF' },
}

function EdgeSignalSection({ signal }) {
  const { colors, dark } = useTheme()
  if (!signal) return null

  const sig = signal.overall_signal || 'NEUTRAL'
  const lightStyle = EDGE_SIGNAL_STYLE[sig] || EDGE_SIGNAL_STYLE.NEUTRAL
  const darkStyle = EDGE_SIGNAL_STYLE_DARK[sig] || EDGE_SIGNAL_STYLE_DARK.NEUTRAL
  const style = dark ? { ...lightStyle, bg: darkStyle.bg, color: darkStyle.color } : lightStyle
  const modules = signal.modules_json || {}
  const score = signal.signal_score || 50
  const scoreColor = score >= 80 ? (dark ? '#4ADE80' : '#16A34A') : score >= 65 ? (dark ? '#FACC15' : '#CA8A04') : score >= 50 ? (dark ? '#FB923C' : '#EA580C') : (dark ? '#F87171' : '#DC2626')

  return (
    <div>
      {/* 시그널 배지 + 점수 */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{
          padding: '5px 14px', borderRadius: '20px', fontWeight: 700,
          fontSize: '12px', backgroundColor: style.bg, color: style.color,
        }}>
          {style.label}
        </span>
        <span style={{
          fontSize: '20px', fontWeight: 700, fontFamily: FONTS.mono, color: scoreColor,
        }}>
          {score}
          <span style={{ fontSize: '11px', fontWeight: 400, color: colors.textMuted }}> / 100</span>
        </span>
        {signal.signal_label && (
          <span style={{ fontSize: '12px', color: colors.textSecondary, fontWeight: 500 }}>
            {signal.signal_label}
          </span>
        )}
      </div>

      {/* 3-모듈 상세 */}
      <div className="edge-modules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <EdgeModuleCard title="Promise" module={modules.promise} />
        <EdgeModuleCard title="Risk" module={modules.risk} />
        <EdgeModuleCard title="Insider" module={modules.insider} />
      </div>
    </div>
  )
}

function EdgeModuleCard({ title, module }) {
  const { colors, dark } = useTheme()
  if (!module) return (
    <div style={{
      padding: '12px', backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
      borderRadius: '10px',
    }}>
      <div style={{
        fontSize: '10px', fontWeight: 700, color: colors.textMuted, marginBottom: '4px',
        letterSpacing: '0.04em', textTransform: 'uppercase',
      }}>{title}</div>
      <div style={{ fontSize: '12px', color: colors.textMuted }}>데이터 없음</div>
    </div>
  )

  const sig = module.signal || 'NEUTRAL'
  const lightStyle = EDGE_SIGNAL_STYLE[sig] || EDGE_SIGNAL_STYLE.NEUTRAL
  const darkStyle = EDGE_SIGNAL_STYLE_DARK[sig] || EDGE_SIGNAL_STYLE_DARK.NEUTRAL
  const style = dark ? { ...lightStyle, bg: darkStyle.bg, color: darkStyle.color } : lightStyle

  return (
    <div style={{
      padding: '12px', backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
      borderRadius: '10px', borderLeft: `3px solid ${style.color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, color: colors.textSecondary,
          letterSpacing: '0.04em', textTransform: 'uppercase',
        }}>{title}</span>
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
      {title === 'Insider' && (module.foreign_net_total != null || module.inst_net_total != null) && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
          {module.foreign_net_total != null && (
            <span style={{
              fontSize: '10px', fontFamily: FONTS.mono, fontWeight: 600,
              padding: '2px 6px', borderRadius: '6px',
              backgroundColor: module.foreign_net_total >= 0
                ? (dark ? 'rgba(34,197,94,0.15)' : '#DCFCE7')
                : (dark ? 'rgba(37,99,235,0.15)' : '#DBEAFE'),
              color: module.foreign_net_total >= 0
                ? (dark ? '#4ADE80' : '#16A34A')
                : (dark ? '#93C5FD' : '#2563EB'),
            }}>
              외국인 {module.foreign_net_total >= 0 ? '+' : ''}{formatKoreanNumber(module.foreign_net_total)}
            </span>
          )}
          {module.inst_net_total != null && (
            <span style={{
              fontSize: '10px', fontFamily: FONTS.mono, fontWeight: 600,
              padding: '2px 6px', borderRadius: '6px',
              backgroundColor: module.inst_net_total >= 0
                ? (dark ? 'rgba(34,197,94,0.15)' : '#DCFCE7')
                : (dark ? 'rgba(37,99,235,0.15)' : '#DBEAFE'),
              color: module.inst_net_total >= 0
                ? (dark ? '#4ADE80' : '#16A34A')
                : (dark ? '#93C5FD' : '#2563EB'),
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
  const { colors, dark } = useTheme()
  const { companies, loading, query, search } = useCompanyCards()
  const [inputVal, setInputVal] = React.useState('')
  const [focused, setFocused] = React.useState(false)
  const debounceRef = React.useRef(null)

  const handleInput = (e) => {
    const val = e.target.value
    setInputVal(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const gradeStyle = (grade) => {
    const gc = GRADE_COLORS[grade]
    if (!gc) return { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5', color: colors.textMuted }
    return {
      backgroundColor: dark ? `${gc.bg}25` : gc.lightBg,
      color: dark ? gc.bg : gc.bg,
      fontWeight: 700,
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
      {/* 헤더 + 검색 */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{
          fontSize: '20px', fontWeight: 700, color: colors.textPrimary,
          fontFamily: FONTS.serif, margin: 0, letterSpacing: '-0.02em',
        }}>
          Deep Dive
        </h2>
        <p style={{
          fontSize: '13px', color: colors.textMuted, margin: '4px 0 16px',
        }}>
          기업명 또는 종목코드로 검색 · 코스피·코스닥·코넥스 전종목
        </p>

        {/* 검색 입력 */}
        <div style={{
          display: 'flex', alignItems: 'center',
          borderRadius: '10px', padding: '0 14px',
          border: `1px solid ${focused ? PREMIUM.accent : colors.border}`,
          backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#FAFAFA',
          transition: 'border-color 0.15s',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={inputVal}
            onChange={handleInput}
            placeholder="기업명 또는 종목코드 검색..."
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              flex: 1, padding: '11px 10px', fontSize: '13px',
              border: 'none', backgroundColor: 'transparent',
              color: colors.textPrimary, outline: 'none',
            }}
          />
        </div>
      </div>

      {/* 로딩 */}
      {loading && (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          }}>
            <div style={{
              width: '14px', height: '14px', border: `2px solid ${colors.border}`,
              borderTopColor: PREMIUM.accent, borderRadius: '50%',
              animation: 'card-spin 0.8s linear infinite',
            }} />
            <span style={{ color: colors.textMuted, fontSize: '13px' }}>검색 중...</span>
          </div>
        </div>
      )}

      {/* 빈 결과 */}
      {!loading && companies.length === 0 && (
        <div style={{
          padding: '80px 24px', textAlign: 'center',
          borderRadius: '12px',
          backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
          border: `1px dashed ${colors.border}`,
        }}>
          <div style={{ fontSize: '14px', color: colors.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
            {query ? `"${query}" 검색 결과가 없습니다` : '공시 데이터가 없습니다'}
          </div>
          <div style={{ fontSize: '12px', color: colors.textMuted }}>
            공시 수집이 시작되면 기업 목록이 표시됩니다
          </div>
        </div>
      )}

      {/* 기업 그리드 */}
      {!loading && companies.length > 0 && (() => {
        return (
          <>
            <div style={{
              fontSize: '11px', color: colors.textMuted, marginBottom: '12px',
              fontWeight: 600, fontFamily: FONTS.mono,
            }}>
              {query ? `"${query}" 검색 결과` : '최근 공시 기업'} · {companies.length}건
            </div>
            <div className="company-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {companies.map((c) => {
                const summary = (c.card_summary || '').split('\n')[0].slice(0, 80)

                return (
                  <div
                    key={c.corp_code}
                    onClick={() => onSelectCard && onSelectCard(c.corp_code)}
                    style={{
                      backgroundColor: colors.bgCard,
                      borderRadius: '12px',
                      padding: '14px 16px',
                      border: `1px solid ${colors.border}`,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = PREMIUM.accent
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = colors.border
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {/* 기업명 + 등급 뱃지 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '14px', fontWeight: 700, color: colors.textPrimary,
                            fontFamily: FONTS.serif, letterSpacing: '-0.01em',
                          }}>
                            {c.corp_name}
                          </span>
                          <span style={{
                            fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                            ...gradeStyle(c.best_grade),
                          }}>
                            {c.best_grade}
                          </span>
                        </div>
                        <div style={{
                          fontSize: '10px', color: colors.textMuted,
                          fontFamily: FONTS.mono, marginTop: '2px',
                        }}>
                          {c.stock_code || ''}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono,
                      }}>
                        {c.disclosure_count}건
                      </div>
                    </div>

                    {/* AI 요약 미리보기 */}
                    {summary && (
                      <div style={{
                        fontSize: '11px', color: colors.textSecondary, lineHeight: '1.5',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {summary}{summary.length >= 80 ? '...' : ''}
                      </div>
                    )}

                    {/* 최근 공시일 */}
                    <div style={{
                      fontSize: '10px', color: colors.textMuted, marginTop: '8px',
                      fontFamily: FONTS.mono, opacity: 0.6,
                    }}>
                      {c.last_disclosure_at ? new Date(c.last_disclosure_at).toLocaleDateString('ko-KR') : ''}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )
      })()}

      <style>{`
        @keyframes card-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}


// ── 스타일 함수 ─────────────────────────────────────────────────

const getEmptyStyle = (colors, dark) => ({
  padding: '40px 20px',
  textAlign: 'center',
  fontSize: '13px',
  color: colors.textMuted,
  backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
  borderRadius: '10px',
  border: `1px dashed ${colors.border}`,
})

const getLinkBtnStyle = (colors) => ({
  border: 'none',
  background: 'none',
  cursor: 'pointer',
  color: PREMIUM.accent,
  fontSize: '13px',
  fontWeight: 600,
  padding: 0,
  transition: 'opacity 0.15s',
})

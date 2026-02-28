import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
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

// YYYYMMDD → MM.DD 변환
const fmtDate = (dt) => {
  if (!dt || dt.length < 8) return dt || ''
  return `${dt.slice(4, 6)}.${dt.slice(6, 8)}`
}

export default function CompanyCard({ corpCode, onBack, onViewCard }) {
  const { colors, dark } = useTheme()
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
      <div style={{ padding: '60px 24px', textAlign: 'center', color: colors.textSecondary }}>
        <div style={{ fontSize: '14px', marginBottom: '12px', fontWeight: 600 }}>
          {error || '기업 카드를 찾을 수 없습니다'}
        </div>
        <button onClick={onBack} style={getLinkBtnStyle(colors)}>공시 피드로 돌아가기</button>
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
  const handleBack = () => {
    if (onViewCard) onViewCard(null)
    else if (onBack) onBack()
  }

  return (
    <div className="page-container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 24px' }}>
      {/* 뒤로가기 */}
      <button onClick={handleBack} style={{
        ...getLinkBtnStyle(colors), marginBottom: '14px', fontSize: '12px',
        display: 'flex', alignItems: 'center', gap: '4px',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        목록으로
      </button>

      {/* 코스닥 종목 안내 */}
      {header.corp_cls && header.corp_cls !== 'Y' && (
        <div style={{
          padding: '14px 18px', borderRadius: '12px', marginBottom: '14px',
          backgroundColor: dark ? 'rgba(251,191,36,0.08)' : '#FFFBEB',
          border: `1px solid ${dark ? 'rgba(251,191,36,0.2)' : '#FDE68A'}`,
          display: 'flex', alignItems: 'center', gap: '10px',
          fontSize: '13px', color: dark ? '#FCD34D' : '#92400E',
        }}>
          <span style={{ fontSize: '14px', flexShrink: 0 }}>{'⚠'}</span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: '2px' }}>코스닥 종목은 현재 지원하지 않습니다</div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>코스피 종목만 조회 가능합니다. 코스닥은 추후 업데이트 예정입니다.</div>
          </div>
        </div>
      )}

      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* 1. 헤더 */}
        <CompanyHeader header={header} market={market} />

        {/* 1.5 기업 개황 */}
        {overview && Object.values(overview).some(v => v) && (
          <Section title="기업 개황">
            <CompanyOverview overview={overview} header={header} />
          </Section>
        )}

        {/* 2. 밸류에이션 분석 */}
        <Section title="밸류에이션 분석">
          <ValuationSection cardData={cardData} />
        </Section>

        {/* 3. 재무 현황 */}
        <Section title="재무 현황">
          <FinancialChart financials={financials} sector={header.sector} />
        </Section>

        {/* 4. 주가 / 주주 */}
        <div className="company-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <Section title="60일 주가 추이">
            <PriceChart candles={candles} />
          </Section>
          <Section title="주요주주 현황">
            <ShareholderChart shareholders={shareholders} />
          </Section>
        </div>

        {/* 5. 기관/외국인 수급 */}
        {(foreignTrend.length > 0 || instTrend.length > 0) && (
          <Section title="기관/외국인 수급 현황">
            <SupplyDemandSection foreignTrend={foreignTrend} instTrend={instTrend} market={market} loading={supplyLoading} />
          </Section>
        )}

        {/* 7. 5대 변수 분석 */}
        {variableScore && (
          <Section title="5대 변수 분석">
            <VariableSection score={variableScore} />
          </Section>
        )}

        {/* 9. 트리거 공시 */}
        {timeline.trigger && timeline.trigger.report_nm && (
          <Section title="트리거 공시">
            <TriggerInfo trigger={timeline.trigger} />
          </Section>
        )}

        {/* 10. 최근 공시 이력 */}
        {timeline.history && timeline.history.length > 0 && (
          <Section title="최근 공시 이력">
            <DisclosureHistory history={timeline.history} colors={colors} dark={dark} />
          </Section>
        )}
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
      padding: '16px 18px',
      border: `1px solid ${colors.border}`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '12px', fontWeight: 700, color: colors.textSecondary,
        marginBottom: '14px', letterSpacing: '0.03em',
        textTransform: 'uppercase',
      }}>
        <span style={{
          width: '3px', height: '12px', borderRadius: '1.5px',
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
      padding: '20px 22px',
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

  const contacts = [
    { label: '주소', value: overview.adres },
    { label: '전화', value: overview.phn_no },
    { label: '홈페이지', value: overview.hm_url, isLink: true },
    { label: 'IR', value: overview.ir_url, isLink: true },
  ].filter(item => item.value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {tags.map((tag, i) => (
            <span key={i} style={{
              fontSize: '11px', fontWeight: 500, color: colors.textSecondary,
              backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#F4F4F5',
              padding: '4px 10px', borderRadius: '6px',
              fontFamily: i === 0 ? FONTS.body : FONTS.mono,
              letterSpacing: i === 0 ? '0' : '-0.01em', lineHeight: '1.4',
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}

      {contacts.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '4px 16px',
        }}>
          {contacts.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'baseline', gap: '8px', padding: '5px 0',
            }}>
              <span style={{
                fontSize: '10px', color: colors.textMuted, minWidth: '36px', flexShrink: 0,
                fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {item.label}
              </span>
              {item.isLink ? (
                <a
                  href={item.value.startsWith('http') ? item.value : `https://${item.value}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px', color: PREMIUM.accent,
                    textDecoration: 'none', transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.7'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  {item.value.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <span style={{ fontSize: '12px', color: colors.textPrimary, lineHeight: '1.4' }}>
                  {item.value}
                </span>
              )}
            </div>
          ))}
        </div>
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

  const chartData = displayYears.map((yr, i) => {
    const row = { year: yr.replace('E', ' E'), _isEstimate: isEstimate(yr) }
    plMetrics.forEach(m => { row[m.label] = pickValue(m.key, i) })
    return row
  })

  const EstimateBar = (props) => {
    const { x, y, width, height, fill, payload } = props
    const op = payload?._isEstimate ? 0.55 : 1.0
    return <rect x={x} y={y} width={width} height={Math.max(0, height)} fill={fill} opacity={op} rx={3} ry={3} />
  }

  const confirmedIdx = displayYears.reduce((acc, yr, i) => isEstimate(yr) ? acc : i, 0)

  const BarLabel = ({ x, y, width, value }) => {
    if (value == null || isNaN(value)) return null
    const abs = Math.abs(value)
    let text = ''
    if (abs >= 1e12) text = Math.round(value / 1e12) + '조'
    else if (abs >= 1e8) text = Math.round(value / 1e8) + '억'
    else if (abs >= 1e4) text = Math.round(value / 1e4) + '만'
    else text = value.toLocaleString()
    return (
      <text x={x + width / 2} y={y - 4} textAnchor="middle" fontSize={9} fontWeight={600} fill={colors.textMuted}>
        {text}
      </text>
    )
  }

  return (
    <div>
      {/* 연도별 그룹 바 차트 */}
      <div style={{
        backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
        borderRadius: '10px', padding: '12px 14px 8px', marginBottom: '10px',
      }}>
        {/* 범례 */}
        <div style={{ display: 'flex', gap: '14px', marginBottom: '8px', flexWrap: 'wrap' }}>
          {plMetrics.map(m => {
            const latest = pickValue(m.key, confirmedIdx)
            const yoy = items[m.yoyKey]
            return (
              <div key={m.key} style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                <span style={{
                  display: 'inline-block', width: '8px', height: '8px',
                  borderRadius: '2px', backgroundColor: m.color, flexShrink: 0,
                }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: m.color }}>{m.label}</span>
                {latest != null && (
                  <span style={{
                    fontSize: '11px', fontWeight: 700, fontFamily: FONTS.mono,
                    color: colors.textPrimary,
                  }}>
                    {formatKoreanNumber(latest)}
                  </span>
                )}
                {yoy != null && (
                  <span style={{
                    fontSize: '9px', fontWeight: 700, fontFamily: FONTS.mono,
                    padding: '1px 6px', borderRadius: '10px',
                    backgroundColor: yoy >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                    color: yoy >= 0 ? colors.positive : colors.negative,
                  }}>
                    {yoy >= 0 ? '+' : ''}{yoy.toFixed(1)}%
                  </span>
                )}
              </div>
            )
          })}
        </div>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barCategoryGap="20%" barGap={3}>
              <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0'} vertical={false} />
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: colors.textMuted, fontWeight: 600 }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: colors.textMuted }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => {
                  if (v == null || isNaN(v)) return ''
                  const abs = Math.abs(v)
                  if (abs >= 1e12) return Math.round(v / 1e12) + '조'
                  if (abs >= 1e8) return Math.round(v / 1e8) + '억'
                  return ''
                }}
                width={40}
              />
              <Tooltip
                formatter={(value, name) => [formatKoreanNumber(value), name]}
                contentStyle={{
                  backgroundColor: colors.bgCard,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px', fontSize: '12px',
                }}
              />
              {plMetrics.map(m => (
                <Bar
                  key={m.key}
                  dataKey={m.label}
                  fill={m.color}
                  shape={(props) => <EstimateBar {...props} fill={m.color} />}
                  radius={[3, 3, 0, 0]}
                  label={<BarLabel />}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 재무상태 테이블 */}
      {bsMetrics.length > 0 && (
        <div>
          <div style={{
            fontSize: '10px', fontWeight: 700, color: colors.textMuted,
            marginBottom: '8px', letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            Balance Sheet
          </div>
          <div style={{
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
          }}>
            {/* 헤더 */}
            <div style={{
              display: 'grid', gridTemplateColumns: `100px repeat(${displayYears.length}, 1fr)`,
              backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
              padding: '8px 14px', gap: '8px',
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>항목</div>
              {displayYears.map(yr => (
                <div key={yr} style={{
                  fontSize: '10px', fontWeight: 700, textAlign: 'right',
                  color: isEstimate(yr) ? colors.textMuted : colors.textSecondary,
                  fontStyle: isEstimate(yr) ? 'italic' : 'normal',
                  opacity: isEstimate(yr) ? 0.7 : 1,
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
                {displayYears.map((yr, i) => (
                  <div key={yr} style={{
                    fontSize: '12px', fontFamily: FONTS.mono, textAlign: 'right',
                    color: colors.textSecondary, fontWeight: 500,
                    fontStyle: isEstimate(yr) ? 'italic' : 'normal',
                    opacity: isEstimate(yr) ? 0.7 : 1,
                  }}>
                    {pickValue(m.key, i) != null ? formatKoreanNumber(pickValue(m.key, i)) : '-'}
                  </div>
                ))}
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
                  {ratios.map((r, i) => (
                    <div key={i} style={{
                      fontSize: '12px', fontFamily: FONTS.mono, textAlign: 'right', fontWeight: 700,
                      color: r != null ? (r > 200 ? colors.negative : r > 100 ? '#D97706' : colors.positive) : colors.textMuted,
                      fontStyle: isEstimate(displayYears[i]) ? 'italic' : 'normal',
                      opacity: isEstimate(displayYears[i]) ? 0.7 : 1,
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
              contentStyle={{
                backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`,
                borderRadius: '8px', fontSize: '12px',
              }}
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
              innerRadius={28} outerRadius={52}
              dataKey="value" strokeWidth={0}
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
              contentStyle={{
                backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`,
                borderRadius: '8px', fontSize: '11px',
              }}
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
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0'} vertical={false} />
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
          <div style={{
            fontSize: '10px', fontWeight: 700, color: colors.textMuted,
            marginBottom: '6px', letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            Institutional Cumulative Net Buy
          </div>
          <div className="chart-inst" style={{ width: '100%', height: 120 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={instChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0'} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={{ stroke: colors.border }} tickLine={false} />
                <YAxis tickFormatter={formatKoreanNumber} tick={{ fontSize: 10, fill: colors.textMuted }} axisLine={false} tickLine={false} width={65} />
                <Tooltip
                  formatter={(value) => [formatKoreanNumber(value), '누적 순매수']}
                  contentStyle={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: colors.textPrimary, fontWeight: 600 }}
                />
                <Area
                  type="monotone" dataKey="cumul"
                  stroke="#6366F1" strokeWidth={2}
                  fill="#6366F140" dot={false}
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


// ── 7. 5대 변수 분석 (Phase 11) ──────────────────────────────────

const VARIABLE_FACTORS = [
  { key: 'ccc_score', label: '현금흐름의 질', detailKey: 'ccc_detail', num: '01' },
  { key: 'leverage_score', label: '비용 레버리지', detailKey: 'leverage_detail', num: '02' },
  { key: 'dilution_score', label: '희석 리스크', detailKey: 'dilution_detail', num: '03' },
  { key: 'safety_score', label: '재무 안전마진', detailKey: 'safety_detail', num: '04' },
  { key: 'momentum_score', label: '이익 모멘텀', detailKey: 'momentum_detail', num: '05' },
]

const VARIABLE_CATEGORIES = [
  { label: '체질', desc: 'Body', indices: [0, 1] },
  { label: '안전', desc: 'Safety', indices: [2, 3] },
  { label: '방향', desc: 'Direction', indices: [4] },
]

function VariableSection({ score }) {
  const { colors, dark } = useTheme()
  if (!score) return null

  const gc = VARIABLE_GRADE_COLORS[score.grade] || VARIABLE_GRADE_COLORS['보통']
  const factors = [
    score.ccc_score || 5, score.leverage_score || 5,
    score.dilution_score || 5, score.safety_score || 5,
    score.momentum_score || 5,
  ]

  // Dark mode verdict badge
  const verdictBg = dark
    ? (score.grade === '순풍' ? 'rgba(34,197,94,0.15)' : score.grade === '양호' ? 'rgba(59,130,246,0.15)'
      : score.grade === '보통' ? 'rgba(255,255,255,0.08)' : score.grade === '주의' ? 'rgba(234,179,8,0.15)' : 'rgba(239,68,68,0.15)')
    : gc.badge
  const verdictColor = dark
    ? (score.grade === '순풍' ? '#4ADE80' : score.grade === '양호' ? '#60A5FA'
      : score.grade === '보통' ? colors.textSecondary : score.grade === '주의' ? '#FACC15' : '#F87171')
    : (gc.text === '#F9FAFB' ? '#fff' : gc.text)

  return (
    <div>
      {/* 등급 배지 + 종합 점수 */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{
          padding: '5px 14px', borderRadius: '20px', fontWeight: 700,
          fontSize: '12px', backgroundColor: verdictBg, color: verdictColor,
          letterSpacing: '0.02em',
        }}>
          {gc.mark} {score.grade}
        </span>
        <span style={{
          fontSize: '20px', fontWeight: 700, fontFamily: FONTS.mono,
          color: colors.textPrimary,
        }}>
          {score.total_score?.toFixed(1)}
          <span style={{ fontSize: '11px', fontWeight: 400, color: colors.textMuted }}> / 10</span>
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
            <div key={cat.label} style={{ marginTop: ci > 0 ? '16px' : 0 }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, color: colors.textMuted,
                borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5'}`,
                paddingBottom: '4px', marginBottom: '10px',
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                {cat.label} · {cat.desc}
              </div>
              {cat.indices.map((idx) => {
                const f = VARIABLE_FACTORS[idx]
                const val = score[f.key] || 5
                const detail = score[f.detailKey] || {}
                const desc = _getFactorDesc(f.key, detail)
                const barColor = val >= 7 ? colors.positive : val >= 4 ? (PREMIUM.accent || colors.accent) : colors.negative

                return (
                  <div key={f.key} style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: colors.textSecondary }}>
                        <span style={{
                          fontSize: '9px', fontFamily: FONTS.mono, color: colors.textMuted,
                          marginRight: '4px', fontWeight: 700,
                        }}>{f.num}</span>
                        {f.label}
                      </span>
                      <span style={{
                        fontSize: '11px', fontWeight: 700, fontFamily: FONTS.mono, color: barColor,
                      }}>
                        {val.toFixed(1)}
                      </span>
                    </div>
                    <div style={{
                      height: '5px',
                      backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0',
                      borderRadius: '2.5px',
                    }}>
                      <div style={{
                        height: '100%', width: `${(val / 10) * 100}%`, borderRadius: '2.5px',
                        backgroundColor: barColor, transition: 'width 0.4s ease-out',
                      }} />
                    </div>
                    {desc && (
                      <div style={{
                        fontSize: '10px', color: colors.textMuted, marginTop: '3px', lineHeight: '1.4',
                      }}>{desc}</div>
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
          marginTop: '16px', padding: '14px 16px', borderRadius: '10px',
          backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5'}`,
          fontSize: '13px', lineHeight: '1.7', color: colors.textPrimary,
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
  const { colors, dark } = useTheme()
  const market = cardData.market || {}
  const financials = cardData.financials || {}
  const items = financials.items || {}

  const per = _num(market.per)
  const pbr = _num(market.pbr)

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
    { label: 'PER', value: per, fmt: (v) => v.toFixed(1), good: true },
    { label: 'PBR', value: pbr, fmt: (v) => v.toFixed(2), good: true },
    { label: 'ROE', value: roe, fmt: (v) => v.toFixed(1) + '%', good: roe != null && roe > 0 },
    { label: 'OPM', value: opMargin, fmt: (v) => v.toFixed(1) + '%', good: opMargin != null && opMargin > 0 },
    { label: 'NPM', value: niMargin, fmt: (v) => v.toFixed(1) + '%', good: niMargin != null && niMargin > 0 },
    { label: 'D/E', value: debtRatio, fmt: (v) => v.toFixed(1) + '%', good: debtRatio != null && debtRatio <= 100 },
  ]

  const hasAny = metrics.some((m) => m.value != null)
  if (!hasAny) return <div style={getEmptyStyle(colors, dark)}>밸류에이션 데이터가 없습니다</div>

  const _severityColor = {
    CRITICAL: { bg: dark ? 'rgba(37,99,235,0.15)' : '#EFF6FF', text: dark ? '#93C5FD' : '#1D4ED8' },
    WARNING: { bg: dark ? 'rgba(217,119,6,0.15)' : '#FFFBEB', text: dark ? '#FCD34D' : '#D97706' },
    CAUTION: { bg: dark ? 'rgba(202,138,4,0.15)' : '#FEF9C3', text: dark ? '#FACC15' : '#CA8A04' },
    WATCH: { bg: dark ? 'rgba(255,255,255,0.06)' : '#F3F4F6', text: dark ? '#9CA3AF' : '#6B7280' },
  }

  return (
    <div>
      <div className="val-metrics-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px', marginBottom: '14px',
      }}>
        {metrics.map((m) => {
          const accentColor = m.value != null
            ? (m.good ? colors.positive : colors.negative)
            : (dark ? 'rgba(255,255,255,0.08)' : '#E4E4E7')
          return (
            <div key={m.label} style={{
              backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
              borderRadius: '10px', padding: '10px 12px',
              borderLeft: `3px solid ${accentColor}60`,
            }}>
              <div style={{
                fontSize: '10px', color: colors.textMuted, marginBottom: '4px',
                fontWeight: 600, letterSpacing: '0.03em', textTransform: 'uppercase',
              }}>{m.label}</div>
              <div style={{
                fontSize: '16px', fontWeight: 700, fontFamily: FONTS.mono,
                color: m.value != null ? (m.good ? colors.textPrimary : colors.negative) : colors.textMuted,
              }}>
                {m.value != null ? m.fmt(m.value) : '-'}
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
          기업명 또는 종목코드로 검색하여 카드를 조회하세요
        </p>

        {/* 코스피 전용 안내 */}
        <div style={{
          padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
          backgroundColor: dark ? 'rgba(37,99,235,0.08)' : '#EFF6FF',
          border: `1px solid ${dark ? 'rgba(37,99,235,0.2)' : '#BFDBFE'}`,
          fontSize: '12px', color: dark ? '#93C5FD' : '#1E40AF',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, padding: '2px 7px',
            borderRadius: '4px', backgroundColor: dark ? 'rgba(37,99,235,0.2)' : '#DBEAFE',
          }}>KOSPI</span>
          현재 코스피 종목만 제공됩니다
        </div>

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

      {/* 기업 그리드 (코스피만) */}
      {!loading && companies.length > 0 && (() => {
        const kospiOnly = companies.filter(c => c.corp_cls === 'Y' || !c.corp_cls)
        if (kospiOnly.length === 0) return (
          <div style={{
            padding: '80px 24px', textAlign: 'center',
            borderRadius: '12px',
            backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
            border: `1px dashed ${colors.border}`,
          }}>
            <div style={{ fontSize: '14px', color: colors.textSecondary, fontWeight: 600 }}>
              코스피 종목 검색 결과가 없습니다
            </div>
          </div>
        )
        return (
          <>
            <div style={{
              fontSize: '11px', color: colors.textMuted, marginBottom: '12px',
              fontWeight: 600, fontFamily: FONTS.mono,
            }}>
              {query ? `"${query}" 검색 결과` : '최근 공시 기업'} · {kospiOnly.length}건
            </div>
            <div className="company-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {kospiOnly.map((c) => {
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

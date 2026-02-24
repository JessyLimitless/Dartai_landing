import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIndustries } from '../hooks/useIndustries'
import Skeleton from './Skeleton'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const CATEGORY_ICONS = {
  'IT/소프트웨어': '\uD83D\uDCBB',
  '반도체/전자': '\uD83D\uDD0C',
  '바이오/헬스케어': '\uD83E\uDDEC',
  '화학/화장품': '\uD83E\uDDEA',
  '기계/장비': '\u2699\uFE0F',
  '금속/소재': '\uD83D\uDD29',
  '자동차/조선': '\uD83D\uDE97',
  '금융': '\uD83C\uDFE6',
  '건설/에너지': '\uD83C\uDFD7\uFE0F',
  '유통/소매': '\uD83D\uDED2',
  '운송/물류': '\uD83D\uDEA2',
  'R&D/과학기술': '\uD83D\uDD2C',
  '서비스/미디어': '\uD83C\uDFAC',
  '소비재/생활': '\uD83D\uDC55',
  '기타': '\uD83D\uDCE6',
}

const SORT_COLUMNS = [
  { key: 'company_count', label: 'Companies' },
  { key: 'revenue_yoy', label: 'Revenue' },
  { key: 'op_yoy', label: 'Op. Income' },
  { key: 'ni_yoy', label: 'Net Income', hideOnMobile: true },
]

export default function IndustryDashboard({ onViewCard }) {
  const { colors, dark } = useTheme()
  const {
    categories, totalCategories, totalCompanies, loading,
    sortKey, sortOrder, activeCategory, toggleSort, selectCategory,
  } = useIndustries()
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [expandedIndustry, setExpandedIndustry] = useState(null)
  const navigate = useNavigate()

  const displayCategories = activeCategory
    ? categories.filter((c) => c.category === activeCategory)
    : categories

  const avgRevenue = calcAvg(categories, 'avg_revenue_yoy')
  const avgOp = calcAvg(categories, 'avg_op_yoy')
  const avgNi = calcAvg(categories, 'avg_ni_yoy')

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.textPrimary, fontFamily: FONTS.serif, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '4px', height: '22px', background: PREMIUM.accent, borderRadius: '2px' }} />
          Industry Financial Growth
        </h2>
        <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>
          {totalCategories} industries · {totalCompanies} companies — Revenue, Operating Income, Net Income YoY comparison
        </div>
      </div>

      {loading ? (
        <IndustrySkeleton />
      ) : (
        <>
          {/* 요약 카드 3개 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <SummaryCard label="Avg. Revenue Growth" value={avgRevenue} />
            <SummaryCard label="Avg. Op. Income Growth" value={avgOp} />
            <SummaryCard label="Avg. Net Income Growth" value={avgNi} className="industry-ni-card" />
          </div>

          {/* 카테고리 필터 칩 */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '8px',
            marginBottom: '16px', paddingBottom: '12px',
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <FilterChip
              label="All"
              active={!activeCategory}
              onClick={() => selectCategory(null)}
            />
            {categories.map((cat) => (
              <FilterChip
                key={cat.category}
                label={`${CATEGORY_ICONS[cat.category] || '\uD83D\uDCE6'} ${cat.category}`}
                count={cat.company_count}
                active={activeCategory === cat.category}
                onClick={() => selectCategory(cat.category)}
              />
            ))}
          </div>

          {displayCategories.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: colors.textMuted }}>
              <div style={{ fontSize: '15px', marginBottom: '8px' }}>No industry analysis data available</div>
              <div style={{ fontSize: '13px' }}>Data will appear after company cards are generated</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {displayCategories.map((cat) => {
                const isExpanded = expandedCategory === cat.category || activeCategory === cat.category
                return (
                  <div
                    key={cat.category}
                    style={{
                      borderRadius: '16px',
                      border: `1px solid ${colors.border}`,
                      overflow: 'hidden',
                      boxShadow: PREMIUM.shadowSm,
                    }}
                  >
                    {/* 카테고리 헤더 */}
                    <div
                      onClick={() => {
                        if (!activeCategory) {
                          setExpandedCategory(isExpanded ? null : cat.category)
                          setExpandedIndustry(null)
                        }
                      }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 65px 1fr 1fr 1fr',
                        padding: '14px 16px',
                        backgroundColor: isExpanded ? (dark ? '#09090B' : '#18181B') : colors.bgCard,
                        color: isExpanded ? '#fff' : colors.textPrimary,
                        cursor: activeCategory ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        alignItems: 'center',
                      }}
                      className="industry-table-header"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>{CATEGORY_ICONS[cat.category] || '\uD83D\uDCE6'}</span>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700 }}>{cat.category}</div>
                          <div style={{ fontSize: '11px', opacity: 0.7 }}>
                            {cat.industry_count} sectors
                          </div>
                        </div>
                        {!activeCategory && (
                          <span style={{ fontSize: '10px', marginLeft: '4px', opacity: 0.5 }}>
                            {isExpanded ? '\u25B2' : '\u25BC'}
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 700, fontFamily: FONTS.mono }}>
                        {cat.company_count}
                      </div>
                      <YoyCell value={cat.avg_revenue_yoy} light={isExpanded} />
                      <YoyCell value={cat.avg_op_yoy} light={isExpanded} />
                      <YoyCell value={cat.avg_ni_yoy} light={isExpanded} className="industry-ni-col" />
                    </div>

                    {/* 하위 업종 리스트 */}
                    {isExpanded && (
                      <div>
                        <div
                          className="industry-table-header"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 65px 1fr 1fr 1fr',
                            padding: '8px 16px 8px 44px',
                            backgroundColor: dark ? '#18181B' : '#27272A',
                            color: '#a1a1aa',
                            fontSize: '11px',
                            fontWeight: 600,
                          }}
                        >
                          <div>Sector</div>
                          {SORT_COLUMNS.map((col) => (
                            <div
                              key={col.key}
                              className={col.hideOnMobile ? 'industry-ni-col' : ''}
                              onClick={() => toggleSort(col.key)}
                              style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                            >
                              {col.label}
                              {sortKey === col.key && (
                                <span style={{ marginLeft: '2px', fontSize: '9px' }}>
                                  {sortOrder === 'desc' ? '\u25BC' : '\u25B2'}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {cat.industries.map((ind) => (
                          <React.Fragment key={ind.sector_code}>
                            <IndustryRow
                              industry={ind}
                              isExpanded={expandedIndustry === ind.sector_code}
                              onToggle={() => setExpandedIndustry(
                                expandedIndustry === ind.sector_code ? null : ind.sector_code
                              )}
                            />

                            {expandedIndustry === ind.sector_code && (
                              <CompanyList
                                companies={ind.companies}
                                onNavigate={(corpCode) => onViewCard ? onViewCard(corpCode) : navigate(`/deep-dive/${corpCode}`)}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      <style>{`
        @media (max-width: 640px) {
          .industry-ni-col, .industry-ni-card { display: none !important; }
          .industry-table-header, .industry-table-row {
            grid-template-columns: 1fr 55px 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}


function IndustryRow({ industry: ind, isExpanded, onToggle }) {
  const { colors } = useTheme()
  return (
    <div
      className="industry-table-row"
      onClick={onToggle}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 65px 1fr 1fr 1fr',
        padding: '10px 16px 10px 44px',
        backgroundColor: colors.bgCard,
        borderTop: `1px solid ${colors.border}`,
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.borderLight}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.bgCard}
    >
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>
          {ind.industry_name}
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono }}>
          KSIC {ind.sector_code} · {ind.company_count} companies
        </div>
      </div>
      <div style={{
        textAlign: 'right', fontSize: '13px', fontWeight: 600,
        fontFamily: FONTS.mono, color: colors.textPrimary,
      }}>
        {ind.company_count}
      </div>
      <YoyCell value={ind.avg_revenue_yoy} />
      <YoyCell value={ind.avg_op_yoy} />
      <YoyCell value={ind.avg_ni_yoy} className="industry-ni-col" />
    </div>
  )
}


function CompanyList({ companies, onNavigate }) {
  const { colors } = useTheme()
  return (
    <div style={{
      backgroundColor: colors.borderLight,
      borderTop: `1px solid ${colors.border}`,
      padding: '8px 16px 8px 60px',
    }}>
      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '6px', fontWeight: 600 }}>
        Companies ({companies.length})
      </div>
      {companies.map((comp) => (
        <div
          key={comp.corp_code}
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(comp.corp_code)
          }}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            padding: '6px 8px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.border}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div>
            <span style={{ fontWeight: 600, color: colors.textPrimary }}>{comp.corp_name}</span>
            {comp.stock_code && (
              <span style={{ marginLeft: '6px', color: colors.textMuted, fontFamily: FONTS.mono, fontSize: '10px' }}>
                {comp.stock_code}
              </span>
            )}
          </div>
          <YoyCell value={comp.revenue_yoy} compact />
          <YoyCell value={comp.op_yoy} compact />
          <YoyCell value={comp.ni_yoy} compact className="industry-ni-col" />
        </div>
      ))}
    </div>
  )
}


function FilterChip({ label, count, active, onClick }) {
  const { colors } = useTheme()
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '5px 12px',
        borderRadius: '16px',
        border: `1px solid ${active ? PREMIUM.accent : colors.border}`,
        backgroundColor: active ? PREMIUM.accent : colors.bgCard,
        color: active ? '#fff' : colors.textSecondary,
        fontSize: '12px',
        fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {count != null && (
        <span style={{
          fontSize: '10px',
          opacity: 0.8,
          backgroundColor: active ? 'rgba(255,255,255,0.2)' : colors.borderLight,
          borderRadius: '8px',
          padding: '1px 5px',
        }}>
          {count}
        </span>
      )}
    </button>
  )
}


function SummaryCard({ label, value, className }) {
  const { colors } = useTheme()
  const color = value == null ? colors.textMuted : value >= 0 ? colors.positive : colors.negative
  return (
    <div className={className} style={{
      padding: '16px',
      borderRadius: '16px',
      backgroundColor: colors.bgCard,
      border: `1px solid ${colors.border}`,
      boxShadow: PREMIUM.shadowSm,
    }}>
      <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: FONTS.mono, color }}>
        {value != null ? `${value >= 0 ? '+' : ''}${value.toFixed(1)}%` : '-'}
      </div>
    </div>
  )
}


function YoyCell({ value, compact, light, className }) {
  const { colors } = useTheme()

  if (value == null) {
    return (
      <div className={className} style={{ textAlign: 'right', fontSize: compact ? '11px' : '13px', color: light ? '#94a3b8' : colors.textMuted }}>
        -
      </div>
    )
  }

  const isPositive = value >= 0
  const color = light
    ? (isPositive ? '#86efac' : '#93C5FD')
    : (isPositive ? colors.positive : colors.negative)
  const barColor = isPositive ? '#BBF7D0' : '#BFDBFE'
  const fillColor = isPositive ? colors.positive : colors.negative
  const barWidth = Math.min(Math.abs(value), 200) / 200 * 100

  return (
    <div className={className} style={{ textAlign: 'right' }}>
      <div style={{
        fontSize: compact ? '11px' : '13px',
        fontWeight: 600,
        fontFamily: FONTS.mono,
        color,
      }}>
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </div>
      {!compact && !light && (
        <div style={{
          height: '4px',
          backgroundColor: barColor,
          borderRadius: '2px',
          marginTop: '3px',
          overflow: 'hidden',
          direction: isPositive ? 'ltr' : 'rtl',
        }}>
          <div style={{
            height: '100%',
            width: `${barWidth}%`,
            backgroundColor: fillColor,
            borderRadius: '2px',
            transition: 'width 0.3s',
          }} />
        </div>
      )}
    </div>
  )
}


function IndustrySkeleton() {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-card">
            <Skeleton width="80px" height="12px" style={{ marginBottom: '6px' }} />
            <Skeleton width="100px" height="20px" />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} width="90px" height="28px" style={{ borderRadius: '16px' }} />
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <Skeleton width="30px" height="30px" style={{ borderRadius: '8px' }} />
          <Skeleton width="120px" height="14px" />
          <Skeleton width="40px" height="14px" />
          <Skeleton width="80px" height="14px" />
          <Skeleton width="80px" height="14px" />
        </div>
      ))}
    </div>
  )
}


function calcAvg(categories, field) {
  const vals = categories.map((c) => c[field]).filter((v) => v != null)
  if (vals.length === 0) return null
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length * 10) / 10
}

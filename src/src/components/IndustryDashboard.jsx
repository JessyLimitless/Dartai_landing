import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIndustries } from '../hooks/useIndustries'
import Skeleton from './Skeleton'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const SORT_COLUMNS_ANNUAL = [
  { key: 'company_count', label: 'Stocks' },
  { key: 'revenue_yoy', label: 'Revenue' },
  { key: 'op_yoy', label: 'Op. Inc.' },
  { key: 'ni_yoy', label: 'Net Inc.', hideOnMobile: true },
]

const SORT_COLUMNS_QUARTERLY = [
  { key: 'company_count', label: 'Stocks' },
  { key: 'revenue_yoy', label: 'Revenue' },
  { key: 'op_yoy', label: 'Op. Inc.' },
]

export default function IndustryDashboard({ onViewCard }) {
  const { colors, dark } = useTheme()
  const {
    categories, totalCategories, totalCompanies, loading,
    sortKey, sortOrder, activeCategory, toggleSort, selectCategory,
    period, periodLabel, setPeriod,
  } = useIndustries()
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [expandedIndustry, setExpandedIndustry] = useState(null)
  const navigate = useNavigate()

  const isQuarterly = period === 'quarterly'
  const sortColumns = isQuarterly ? SORT_COLUMNS_QUARTERLY : SORT_COLUMNS_ANNUAL
  const gridCols = isQuarterly ? '1fr 60px 1fr 1fr' : '1fr 60px 1fr 1fr 1fr'

  const displayCategories = activeCategory
    ? categories.filter((c) => c.category === activeCategory)
    : categories

  const avgRevenue = calcAvg(categories, 'avg_revenue_yoy')
  const avgOp = calcAvg(categories, 'avg_op_yoy')
  const avgNi = isQuarterly ? null : calcAvg(categories, 'avg_ni_yoy')

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{
              fontSize: '20px', fontWeight: 700, color: colors.textPrimary,
              fontFamily: FONTS.serif, margin: 0, letterSpacing: '-0.02em',
            }}>
              Industry Growth
            </h2>
            <p style={{ fontSize: '13px', color: colors.textMuted, margin: '4px 0 0' }}>
              {totalCategories} industries · {totalCompanies} companies
              {periodLabel ? ` — ${periodLabel}` : ' — YoY comparison'}
            </p>
          </div>
          {/* Period toggle */}
          <div style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
            <PeriodButton
              label="최근 1년"
              active={period === 'annual'}
              onClick={() => setPeriod('annual')}
              colors={colors} dark={dark}
            />
            <PeriodButton
              label="최근 1분기"
              active={period === 'quarterly'}
              onClick={() => setPeriod('quarterly')}
              colors={colors} dark={dark}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <IndustrySkeleton colors={colors} dark={dark} isQuarterly={isQuarterly} />
      ) : (
        <>
          {/* Summary cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isQuarterly ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: '10px', marginBottom: '20px',
          }}>
            <YoySummaryCard label="Avg. Revenue" value={avgRevenue} colors={colors} dark={dark} />
            <YoySummaryCard label="Avg. Op. Income" value={avgOp} colors={colors} dark={dark} />
            {!isQuarterly && (
              <YoySummaryCard label="Avg. Net Income" value={avgNi} colors={colors} dark={dark} className="industry-ni-card" />
            )}
          </div>

          {/* Category filter chips */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '6px',
            marginBottom: '20px', paddingBottom: '16px',
            borderBottom: `1px solid ${colors.border}`,
          }}>
            <FilterChip label="All" active={!activeCategory} onClick={() => selectCategory(null)} colors={colors} dark={dark} />
            {categories.map((cat) => (
              <FilterChip
                key={cat.category}
                label={cat.category}
                count={cat.company_count}
                active={activeCategory === cat.category}
                onClick={() => selectCategory(cat.category)}
                colors={colors} dark={dark}
              />
            ))}
          </div>

          {displayCategories.length === 0 ? (
            <div style={{
              padding: '80px 20px', textAlign: 'center',
              borderRadius: '12px', backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
              border: `1px dashed ${colors.border}`,
            }}>
              <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '6px' }}>No industry data</div>
              <div style={{ fontSize: '12px', color: colors.textMuted }}>Data appears after company cards are generated</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayCategories.map((cat) => {
                const isExpanded = expandedCategory === cat.category || activeCategory === cat.category
                return (
                  <div key={cat.category} style={{
                    borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden',
                  }}>
                    {/* Category header row */}
                    <div
                      onClick={() => {
                        if (!activeCategory) {
                          setExpandedCategory(isExpanded ? null : cat.category)
                          setExpandedIndustry(null)
                        }
                      }}
                      className="industry-table-header"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: gridCols,
                        padding: '12px 16px',
                        backgroundColor: isExpanded
                          ? (dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9')
                          : (dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA'),
                        cursor: activeCategory ? 'default' : 'pointer',
                        transition: 'all 0.2s',
                        alignItems: 'center',
                        borderBottom: isExpanded ? `1px solid ${colors.border}` : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: colors.textPrimary }}>
                            {cat.category}
                          </div>
                          <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono, marginTop: '1px' }}>
                            {cat.industry_count} sectors
                          </div>
                        </div>
                        {!activeCategory && (
                          <span style={{ fontSize: '8px', color: colors.textMuted, marginLeft: '2px' }}>
                            {isExpanded ? '\u25B2' : '\u25BC'}
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: 700, fontFamily: FONTS.mono, color: colors.textPrimary }}>
                        {cat.company_count}
                      </div>
                      <YoyCell value={cat.avg_revenue_yoy} colors={colors} />
                      <YoyCell value={cat.avg_op_yoy} colors={colors} />
                      {!isQuarterly && <YoyCell value={cat.avg_ni_yoy} colors={colors} className="industry-ni-col" />}
                    </div>

                    {/* Expanded: sub-header + industry rows */}
                    {isExpanded && (
                      <div>
                        <div
                          className="industry-table-header"
                          style={{
                            display: 'grid',
                            gridTemplateColumns: gridCols,
                            padding: '8px 16px 8px 40px',
                            backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
                            borderBottom: `1px solid ${colors.border}`,
                            fontSize: '10px', fontWeight: 600, color: colors.textMuted,
                            textTransform: 'uppercase', letterSpacing: '0.04em',
                          }}
                        >
                          <div>Sector</div>
                          {sortColumns.map((col) => (
                            <div
                              key={col.key}
                              className={col.hideOnMobile ? 'industry-ni-col' : ''}
                              onClick={() => toggleSort(col.key)}
                              style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                            >
                              {col.label}
                              {sortKey === col.key && (
                                <span style={{ marginLeft: '2px', fontSize: '8px', opacity: 0.8 }}>
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
                              colors={colors} dark={dark}
                              isQuarterly={isQuarterly} gridCols={gridCols}
                            />
                            {expandedIndustry === ind.sector_code && (
                              <CompanyList
                                companies={ind.companies}
                                onNavigate={(corpCode) => onViewCard ? onViewCard(corpCode) : navigate(`/deep-dive/${corpCode}`)}
                                colors={colors} dark={dark}
                                isQuarterly={isQuarterly}
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
            grid-template-columns: 1fr 50px 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}


function PeriodButton({ label, active, onClick, colors, dark }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        border: 'none',
        backgroundColor: active ? PREMIUM.accent : 'transparent',
        color: active ? '#fff' : colors.textSecondary,
        fontSize: '12px',
        fontWeight: active ? 700 : 500,
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  )
}


function IndustryRow({ industry: ind, isExpanded, onToggle, colors, dark, isQuarterly, gridCols }) {
  const stripeBg = dark ? 'rgba(255,255,255,0.02)' : 'transparent'
  return (
    <div
      className="industry-table-row"
      onClick={onToggle}
      style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        padding: '9px 16px 9px 40px',
        backgroundColor: stripeBg,
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'}`,
        cursor: 'pointer', transition: 'background-color 0.15s',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.05)' : '#F0F0F5'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = stripeBg}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>
          {ind.industry_name}
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono, marginTop: '1px' }}>
          KSIC {ind.sector_code}
        </div>
      </div>
      <div style={{ textAlign: 'right', fontSize: '12px', fontWeight: 600, fontFamily: FONTS.mono, color: colors.textPrimary }}>
        {ind.company_count}
      </div>
      <YoyCell value={ind.avg_revenue_yoy} colors={colors} />
      <YoyCell value={ind.avg_op_yoy} colors={colors} />
      {!isQuarterly && <YoyCell value={ind.avg_ni_yoy} colors={colors} className="industry-ni-col" />}
    </div>
  )
}


function CompanyList({ companies, onNavigate, colors, dark, isQuarterly }) {
  const companyCols = isQuarterly ? '1fr 1fr 1fr' : '1fr 1fr 1fr 1fr'
  return (
    <div style={{
      backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
      borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'}`,
      padding: '6px 16px 6px 52px',
    }}>
      <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        Companies ({companies.length})
      </div>
      {companies.map((comp) => (
        <div
          key={comp.corp_code}
          onClick={(e) => { e.stopPropagation(); onNavigate(comp.corp_code) }}
          style={{
            display: 'grid', gridTemplateColumns: companyCols,
            padding: '5px 6px', borderRadius: '6px',
            cursor: 'pointer', fontSize: '12px', transition: 'background-color 0.15s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.05)' : '#EEF2F6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <div>
            <span style={{ fontWeight: 600, color: colors.textPrimary, fontSize: '12px' }}>{comp.corp_name}</span>
            {comp.stock_code && (
              <span style={{ marginLeft: '5px', color: colors.textMuted, fontFamily: FONTS.mono, fontSize: '9px' }}>
                {comp.stock_code}
              </span>
            )}
          </div>
          <YoyCell value={comp.revenue_yoy} compact colors={colors} />
          <YoyCell value={comp.op_yoy} compact colors={colors} />
          {!isQuarterly && <YoyCell value={comp.ni_yoy} compact colors={colors} className="industry-ni-col" />}
        </div>
      ))}
    </div>
  )
}


function FilterChip({ label, count, active, onClick, colors, dark }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '5px 12px', borderRadius: '16px',
        border: active ? `2px solid ${PREMIUM.accent}` : `1px solid ${colors.border}`,
        backgroundColor: active ? PREMIUM.accent : 'transparent',
        color: active ? '#fff' : colors.textSecondary,
        fontSize: '11px', fontWeight: active ? 700 : 500,
        cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}
    >
      {label}
      {count != null && (
        <span style={{
          fontSize: '9px', fontWeight: 600,
          backgroundColor: active ? 'rgba(255,255,255,0.25)' : (dark ? 'rgba(255,255,255,0.08)' : '#F4F4F5'),
          borderRadius: '8px', padding: '1px 5px',
          color: active ? '#fff' : colors.textMuted,
        }}>
          {count}
        </span>
      )}
    </button>
  )
}


const YOY_UP = '#E8364E'    // 상승 = 빨강 (한국 증시 관례)
const YOY_DOWN = '#2563EB'  // 하락 = 파랑

function YoySummaryCard({ label, value, colors, dark, className }) {
  const color = value == null ? colors.textMuted : value >= 0 ? YOY_UP : YOY_DOWN
  return (
    <div className={className} style={{
      padding: '14px 16px', borderRadius: '10px',
      backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
      border: `1px solid ${colors.border}`,
    }}>
      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: FONTS.mono, color, letterSpacing: '-0.02em' }}>
        {value != null ? `${value >= 0 ? '+' : ''}${value.toFixed(1)}%` : '-'}
      </div>
    </div>
  )
}


function YoyCell({ value, compact, className, colors }) {
  if (value == null) {
    return (
      <div className={className} style={{ textAlign: 'right', fontSize: compact ? '11px' : '12px', color: colors.textMuted, fontFamily: FONTS.mono }}>
        -
      </div>
    )
  }

  const isPositive = value >= 0
  const color = isPositive ? YOY_UP : YOY_DOWN

  return (
    <div className={className} style={{ textAlign: 'right' }}>
      <span style={{
        fontSize: compact ? '11px' : '12px', fontWeight: 600,
        fontFamily: FONTS.mono, color,
      }}>
        {isPositive ? '+' : ''}{value.toFixed(1)}%
      </span>
      {!compact && (
        <div style={{
          height: '3px', borderRadius: '1.5px', marginTop: '3px', overflow: 'hidden',
          backgroundColor: isPositive ? 'rgba(232,54,78,0.12)' : 'rgba(37,99,235,0.12)',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.min(Math.abs(value), 200) / 200 * 100}%`,
            backgroundColor: color, borderRadius: '1.5px',
            transition: 'width 0.3s',
          }} />
        </div>
      )}
    </div>
  )
}


function IndustrySkeleton({ colors, dark, isQuarterly }) {
  const cardCount = isQuarterly ? 2 : 3
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cardCount}, 1fr)`, gap: '10px', marginBottom: '20px' }}>
        {Array.from({ length: cardCount }, (_, i) => (
          <div key={i} style={{ padding: '14px 16px', borderRadius: '10px', border: `1px solid ${colors?.border || '#E4E4E7'}` }}>
            <Skeleton width="80px" height="11px" style={{ marginBottom: '6px' }} />
            <Skeleton width="60px" height="20px" />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} width="80px" height="28px" style={{ borderRadius: '16px' }} />
        ))}
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ padding: '12px 16px', marginBottom: '8px', borderRadius: '12px', border: `1px solid ${colors?.border || '#E4E4E7'}` }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Skeleton width="120px" height="14px" />
            <Skeleton width="40px" height="14px" />
            <Skeleton width="80px" height="14px" />
            <Skeleton width="80px" height="14px" />
          </div>
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

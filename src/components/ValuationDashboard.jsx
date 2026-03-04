import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useValuations } from '../hooks/useValuations'
import Skeleton from './Skeleton'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const SORT_COLUMNS = [
  { key: 'per', label: 'PER' },
  { key: 'pbr', label: 'PBR' },
  { key: 'roe', label: 'ROE' },
  { key: 'op_margin', label: 'OPM', hideOnMobile: true },
  { key: 'debt_ratio', label: 'Debt', hideOnMobile: true },
]

const VERDICT_STYLE = {
  '저평가': { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0', label: 'Undervalued' },
  '고평가': { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE', label: 'Overvalued' },
  '적정': { bg: '#F4F4F5', color: '#52525B', border: '#E4E4E7', label: 'Fair' },
}

const VERDICT_STYLE_DARK = {
  '저평가': { bg: 'rgba(74,222,128,0.12)', color: '#86EFAC', border: 'rgba(74,222,128,0.2)', label: 'Undervalued' },
  '고평가': { bg: 'rgba(96,165,250,0.12)', color: '#93C5FD', border: 'rgba(96,165,250,0.2)', label: 'Overvalued' },
  '적정': { bg: 'rgba(255,255,255,0.06)', color: '#A1A1AA', border: 'rgba(255,255,255,0.1)', label: 'Fair' },
}

const SEVERITY_ICON = {
  CRITICAL: { icon: '!', color: '#DC2626', bg: '#FEE2E2' },
  WARNING: { icon: '!', color: '#D97706', bg: '#FEF3C7' },
  CAUTION: { icon: '-', color: '#CA8A04', bg: '#FEF9C3' },
  WATCH: { icon: '-', color: '#6B7280', bg: '#F4F4F5' },
}

export default function ValuationDashboard({ onViewCard }) {
  const { colors, dark } = useTheme()
  const {
    companies, allCompanies, summary, loading, sortKey, sortOrder,
    toggleSort, activeFilter, setFilter,
  } = useValuations()
  const navigate = useNavigate()

  const criticalCount = allCompanies.filter((c) =>
    c.risk_flags?.some((f) => f.severity === 'CRITICAL')
  ).length

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '20px', fontWeight: 700, color: colors.textPrimary,
          fontFamily: FONTS.serif, margin: 0, letterSpacing: '-0.02em',
        }}>
          Valuation Screening
        </h2>
        <p style={{ fontSize: '13px', color: colors.textMuted, margin: '4px 0 0' }}>
          PER / PBR / ROE peer comparison + risk alerts · 카드 클릭 시 필터
        </p>
      </div>

      {loading ? (
        <ValuationSkeleton colors={colors} dark={dark} />
      ) : (
        <>
          {/* Summary cards */}
          <div className="val-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
            <SummaryCard
              label="Total" value={summary.total} color={colors.textPrimary}
              colors={colors} dark={dark}
              active={activeFilter === null}
              onClick={() => setFilter(null)}
            />
            <SummaryCard
              label="Undervalued" value={summary.undervalued_count} color={colors.positive}
              colors={colors} dark={dark}
              active={activeFilter === 'undervalued'}
              activeColor={dark ? 'rgba(74,222,128,0.15)' : '#DCFCE7'}
              activeBorder={dark ? 'rgba(74,222,128,0.35)' : '#86EFAC'}
              onClick={() => setFilter('undervalued')}
              guideType="undervalued"
            />
            <SummaryCard
              label="Overvalued" value={summary.overvalued_count} color={dark ? '#93C5FD' : '#2563EB'}
              colors={colors} dark={dark}
              active={activeFilter === 'overvalued'}
              activeColor={dark ? 'rgba(96,165,250,0.15)' : '#DBEAFE'}
              activeBorder={dark ? 'rgba(96,165,250,0.35)' : '#93C5FD'}
              onClick={() => setFilter('overvalued')}
              guideType="overvalued"
            />
            <SummaryCard
              label="Risk" value={summary.risk_count} color="#D97706"
              colors={colors} dark={dark}
              active={activeFilter === 'risk'}
              activeColor={dark ? 'rgba(217,119,6,0.15)' : '#FEF3C7'}
              activeBorder={dark ? 'rgba(217,119,6,0.35)' : '#FCD34D'}
              onClick={() => setFilter('risk')}
              guideType="risk"
            />
          </div>

          {/* Critical banner */}
          {criticalCount > 0 && (
            <div style={{
              padding: '8px 14px', borderRadius: '8px', marginBottom: '16px',
              backgroundColor: dark ? 'rgba(220,38,38,0.08)' : '#FEF2F2',
              border: `1px solid ${dark ? 'rgba(220,38,38,0.2)' : '#FECACA'}`,
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '12px', fontWeight: 600,
              color: dark ? '#FCA5A5' : '#991B1B',
            }}>
              <span style={{
                width: '16px', height: '16px', borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', fontWeight: 800,
                backgroundColor: dark ? 'rgba(220,38,38,0.15)' : '#FEE2E2',
                color: dark ? '#F87171' : '#DC2626',
              }}>!</span>
              {criticalCount} stock(s) with capital impairment
            </div>
          )}

          {/* Filter bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '8px', padding: '0 2px',
          }}>
            <span style={{ fontSize: '12px', color: colors.textMuted }}>
              {companies.length} stocks
              {activeFilter && (
                <span style={{
                  marginLeft: '6px', padding: '1px 7px', borderRadius: '10px',
                  fontSize: '10px', fontWeight: 600,
                  backgroundColor: dark ? 'rgba(255,255,255,0.08)' : '#F4F4F5',
                  color: colors.textSecondary,
                }}>
                  {activeFilter === 'undervalued' ? 'Undervalued' : activeFilter === 'overvalued' ? 'Overvalued' : 'Risk'} 필터 중
                </span>
              )}
            </span>
            {activeFilter && (
              <button
                onClick={() => setFilter(null)}
                style={{
                  fontSize: '11px', color: colors.textMuted, background: 'none',
                  border: 'none', cursor: 'pointer', padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                ✕ 필터 해제
              </button>
            )}
          </div>

          {companies.length === 0 ? (
            <div style={{
              padding: '80px 20px', textAlign: 'center',
              borderRadius: '12px', backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
              border: `1px dashed ${colors.border}`,
            }}>
              <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '6px' }}>
                {riskOnly ? 'No risk-flagged stocks' : 'No valuation data'}
              </div>
              <div style={{ fontSize: '12px', color: colors.textMuted }}>
                Data appears after company cards are generated
              </div>
            </div>
          ) : (
            <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${colors.border}` }}>
              {/* Table header */}
              <div className="val-table-header" style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr repeat(5, 1fr) 76px',
                padding: '10px 16px',
                backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
                borderBottom: `1px solid ${colors.border}`,
                fontSize: '11px', fontWeight: 600, color: colors.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                <div>Name</div>
                {SORT_COLUMNS.map((col) => (
                  <div
                    key={col.key}
                    className={col.hideOnMobile ? 'val-hide-mobile' : ''}
                    onClick={() => toggleSort(col.key)}
                    style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                  >
                    {col.label}
                    {sortKey === col.key && <SortArrow order={sortOrder} />}
                  </div>
                ))}
                <div style={{ textAlign: 'center' }}>Verdict</div>
              </div>

              {companies.map((c, i) => (
                <ValuationRow
                  key={c.corp_code}
                  company={c}
                  even={i % 2 === 0}
                  dark={dark}
                  onClick={() => onViewCard ? onViewCard(c.corp_code) : navigate(`/deep-dive/${c.corp_code}`)}
                />
              ))}
            </div>
          )}
        </>
      )}

    </div>
  )
}


// ── 판단 기준 가이드 데이터 ──────────────────────────────────────
const GUIDE = {
  undervalued: {
    title: '저평가 판단 기준',
    color: '#166534',
    items: [
      { icon: '①', text: 'PER < 업종 평균 × 0.7', sub: '동일 업종 대비 30% 이상 저렴' },
      { icon: '②', text: 'PBR < 1.0', sub: '주가가 순자산(청산가치) 이하 거래' },
      { icon: '', text: '두 조건 동시 충족 시 저평가 판정', sub: '' },
    ],
  },
  overvalued: {
    title: '고평가 판단 기준',
    color: '#1E40AF',
    items: [
      { icon: '①', text: 'PER > 업종 평균 × 1.5', sub: '동일 업종 대비 50% 이상 고가' },
      { icon: '', text: 'PBR 조건 없이 PER만으로 판정', sub: '성장주도 포함될 수 있음' },
    ],
  },
  risk: {
    title: 'Risk 판단 기준',
    color: '#B45309',
    items: [
      { icon: '🔴', text: '완전자본잠식', sub: '자본총계 ≤ 0 (CRITICAL)' },
      { icon: '🟠', text: '부채비율 > 200%', sub: '자기자본 대비 부채 과다 (WARNING)' },
      { icon: '🟠', text: '영업적자', sub: '영업이익 < 0 (WARNING)' },
      { icon: '🟡', text: '순손실 / PER > 100', sub: '순이익 < 0 또는 PER 과열 (CAUTION)' },
    ],
  },
}

function InfoTooltip({ type, dark, colors }) {
  const [open, setOpen] = useState(false)
  const guide = GUIDE[type]
  if (!guide) return null

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        style={{
          fontSize: '11px', lineHeight: 1,
          color: dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)',
          cursor: 'pointer', userSelect: 'none',
          marginLeft: '4px',
        }}
        title="판단 기준 보기"
      >
        ⓘ
      </span>

      {open && (
        <div style={{
          position: 'absolute',
          bottom: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '230px',
          backgroundColor: dark ? '#1E2533' : '#ffffff',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#E4E4E7'}`,
          borderRadius: '10px',
          padding: '12px 14px',
          zIndex: 200,
          boxShadow: dark
            ? '0 8px 24px rgba(0,0,0,0.5)'
            : '0 8px 24px rgba(0,0,0,0.12)',
          pointerEvents: 'none',
        }}>
          {/* 말풍선 꼭짓점 */}
          <div style={{
            position: 'absolute', bottom: '-6px', left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '10px', height: '10px',
            backgroundColor: dark ? '#1E2533' : '#ffffff',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#E4E4E7'}`,
            borderTop: 'none', borderLeft: 'none',
          }} />

          <div style={{
            fontSize: '11px', fontWeight: 700,
            color: guide.color,
            marginBottom: '8px', letterSpacing: '0.01em',
          }}>
            {guide.title}
          </div>

          {guide.items.map((item, i) => (
            <div key={i} style={{ marginBottom: i < guide.items.length - 1 ? '7px' : 0 }}>
              <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-start' }}>
                {item.icon && (
                  <span style={{ fontSize: '10px', flexShrink: 0, marginTop: '1px' }}>
                    {item.icon}
                  </span>
                )}
                <span style={{ fontSize: '11px', fontWeight: 600, color: dark ? '#E4E4E7' : '#18181B' }}>
                  {item.text}
                </span>
              </div>
              {item.sub && (
                <div style={{
                  fontSize: '10px', color: dark ? 'rgba(255,255,255,0.4)' : '#71717A',
                  marginLeft: item.icon ? '15px' : '0', marginTop: '1px',
                }}>
                  {item.sub}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </span>
  )
}

function SummaryCard({ label, value, color, colors, dark, active, activeColor, activeBorder, onClick, guideType }) {
  const isClickable = !!onClick
  const bg = active && activeColor
    ? activeColor
    : (dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA')
  const border = active && activeBorder
    ? `1.5px solid ${activeBorder}`
    : `1px solid ${colors.border}`

  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px', borderRadius: '10px',
        backgroundColor: bg,
        border,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'background-color 0.15s, border-color 0.15s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (isClickable && !active) e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.06)' : '#F0F0F5'
      }}
      onMouseLeave={(e) => {
        if (isClickable && !active) e.currentTarget.style.backgroundColor = bg
      }}
    >
      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
        {label}
        {active && <span style={{ marginLeft: '4px', fontSize: '9px', opacity: 0.7 }}>●</span>}
        {guideType && <InfoTooltip type={guideType} dark={dark} colors={colors} />}
      </div>
      <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: FONTS.mono, color, letterSpacing: '-0.02em' }}>
        {value != null ? value : 0}
      </div>
    </div>
  )
}


function ValuationRow({ company: c, even, dark, onClick }) {
  const { colors } = useTheme()
  const val = c.valuation || {}
  const peer = c.peer || {}
  const flags = c.risk_flags || []
  const verdictStyles = dark ? VERDICT_STYLE_DARK : VERDICT_STYLE
  const vs = verdictStyles[peer.verdict] || verdictStyles['적정']
  const hasCritical = flags.some((f) => f.severity === 'CRITICAL')

  const stripeBg = even ? 'transparent' : (dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA')
  const criticalBg = dark ? 'rgba(220,38,38,0.06)' : '#FEF2F2'

  return (
    <div
      className="val-table-row"
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr repeat(5, 1fr) 76px',
        padding: '10px 16px',
        backgroundColor: hasCritical ? criticalBg : stripeBg,
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'}`,
        cursor: 'pointer', transition: 'background-color 0.15s',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.05)' : '#F0F0F5'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = hasCritical ? criticalBg : stripeBg}
    >
      {/* Name */}
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>
            {c.corp_name}
          </span>
          {flags.slice(0, 2).map((f, i) => {
            const si = SEVERITY_ICON[f.severity] || SEVERITY_ICON.WATCH
            return (
              <span key={i} title={`${f.flag}: ${f.detail}`} style={{
                fontSize: '8px', fontWeight: 800, width: '14px', height: '14px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '4px', backgroundColor: si.bg, color: si.color,
              }}>
                {si.icon}
              </span>
            )
          })}
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono, marginTop: '1px' }}>
          {c.stock_code || ''}
          {c.sector_name && ` \u00B7 ${c.sector_name}`}
        </div>
      </div>

      {/* PER */}
      <MetricCell value={val.per} vs={peer.per_vs_sector} format="f1" colors={colors} />
      {/* PBR */}
      <MetricCell value={val.pbr} vs={peer.pbr_vs_sector} format="f2" colors={colors} />
      {/* ROE */}
      <MetricCell value={val.roe} vs={peer.roe_vs_sector} format="f1" unit="%" invertColor colors={colors} />

      {/* OPM */}
      <div className="val-hide-mobile" style={{ textAlign: 'right' }}>
        <span style={{
          fontSize: '12px', fontFamily: FONTS.mono, fontWeight: 600,
          color: val.op_margin != null ? (val.op_margin >= 0 ? colors.textPrimary : colors.negative) : colors.textMuted,
        }}>
          {val.op_margin != null ? `${val.op_margin.toFixed(1)}%` : '-'}
        </span>
      </div>

      {/* Debt */}
      <div className="val-hide-mobile" style={{ textAlign: 'right' }}>
        <span style={{
          fontSize: '12px', fontFamily: FONTS.mono, fontWeight: 600,
          color: val.debt_ratio != null
            ? (val.debt_ratio > 200 ? colors.negative : val.debt_ratio > 100 ? '#D97706' : colors.textPrimary)
            : colors.textMuted,
        }}>
          {val.debt_ratio != null ? `${val.debt_ratio.toFixed(0)}%` : '-'}
        </span>
      </div>

      {/* Verdict */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.02em',
          padding: '3px 8px', borderRadius: '6px',
          backgroundColor: vs.bg, color: vs.color,
          border: `1px solid ${vs.border}`,
        }}>
          {vs.label}
        </span>
      </div>
    </div>
  )
}


function MetricCell({ value, vs, format, unit, invertColor, colors }) {
  if (value == null || value === 0) {
    return <div style={{ textAlign: 'right', fontSize: '12px', color: colors.textMuted, fontFamily: FONTS.mono }}>-</div>
  }

  const formatted = format === 'f2' ? value.toFixed(2) : value.toFixed(1)
  const suffix = unit || ''

  let arrow = ''
  let arrowColor = colors.textMuted
  if (vs != null) {
    arrow = vs > 0 ? '\u2191' : '\u2193'
    arrowColor = invertColor
      ? (vs > 0 ? colors.positive : colors.negative)
      : (vs < 0 ? colors.positive : colors.negative)
  }

  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
        <span style={{ fontSize: '12px', fontFamily: FONTS.mono, fontWeight: 600, color: colors.textPrimary }}>
          {formatted}{suffix}
        </span>
        {arrow && (
          <span style={{ fontSize: '9px', fontWeight: 700, color: arrowColor }}>{arrow}</span>
        )}
      </div>
    </div>
  )
}


function SortArrow({ order }) {
  return (
    <span style={{ marginLeft: '2px', fontSize: '8px', opacity: 0.8 }}>
      {order === 'desc' ? '\u25BC' : '\u25B2'}
    </span>
  )
}


function ValuationSkeleton({ colors, dark }) {
  return (
    <div>
      <div className="val-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ padding: '14px 16px', borderRadius: '10px', border: `1px solid ${colors?.border || '#E4E4E7'}` }}>
            <Skeleton width="60px" height="11px" style={{ marginBottom: '6px' }} />
            <Skeleton width="40px" height="20px" />
          </div>
        ))}
      </div>
      <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${colors?.border || '#E4E4E7'}` }}>
        <div style={{ padding: '10px 16px', backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB' }}>
          <Skeleton width="100%" height="14px" />
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px 16px', borderBottom: '1px solid #F4F4F5' }}>
            <Skeleton width="120px" height="14px" />
            <Skeleton width="50px" height="14px" />
            <Skeleton width="50px" height="14px" />
            <Skeleton width="50px" height="14px" />
            <Skeleton width="60px" height="14px" />
          </div>
        ))}
      </div>
    </div>
  )
}

import React from 'react'
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
    companies, summary, loading, sortKey, sortOrder,
    toggleSort, riskOnly, toggleRiskOnly,
  } = useValuations()
  const navigate = useNavigate()

  const criticalCount = companies.filter((c) =>
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
          PER / PBR / ROE peer comparison + risk alerts
        </p>
      </div>

      {loading ? (
        <ValuationSkeleton colors={colors} dark={dark} />
      ) : (
        <>
          {/* Summary cards */}
          <div className="val-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
            <SummaryCard label="Total" value={summary.total} color={colors.textPrimary} colors={colors} dark={dark} />
            <SummaryCard label="Undervalued" value={summary.undervalued_count} color={colors.positive} colors={colors} dark={dark} />
            <SummaryCard label="Overvalued" value={summary.overvalued_count} color={dark ? '#93C5FD' : '#2563EB'} colors={colors} dark={dark} />
            <SummaryCard label="Risk" value={summary.risk_count} color="#D97706" colors={colors} dark={dark} />
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
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: colors.textSecondary }}>
              <input
                type="checkbox" checked={riskOnly}
                onChange={toggleRiskOnly}
                style={{ accentColor: '#D97706' }}
              />
              Risk only
            </label>
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

      <style>{`
        @media (max-width: 640px) {
          .val-hide-mobile { display: none !important; }
          .val-table-header, .val-table-row {
            grid-template-columns: 1.5fr repeat(3, 1fr) 70px !important;
          }
          .val-summary-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  )
}


function SummaryCard({ label, value, color, colors, dark }) {
  return (
    <div style={{
      padding: '14px 16px', borderRadius: '10px',
      backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
      border: `1px solid ${colors.border}`,
    }}>
      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px', fontWeight: 500 }}>{label}</div>
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

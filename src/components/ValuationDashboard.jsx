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
  { key: 'op_margin', label: 'OP Margin', hideOnMobile: true },
  { key: 'debt_ratio', label: 'Debt Ratio', hideOnMobile: true },
]

const VERDICT_STYLE = {
  '저평가': { bg: '#DCFCE7', color: '#16A34A', label: 'Undervalued' },
  '고평가': { bg: '#DBEAFE', color: '#2563EB', label: 'Overvalued' },
  '적정': { bg: '#F3F4F6', color: '#6B7280', label: 'Fair' },
}

const SEVERITY_ICON = {
  CRITICAL: { icon: '\u26A0', color: '#1D4ED8' },
  WARNING: { icon: '\u26A0', color: '#D97706' },
  CAUTION: { icon: '\u25CB', color: '#CA8A04' },
  WATCH: { icon: '\u25CB', color: '#6B7280' },
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
    <div className="page-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.textPrimary, fontFamily: FONTS.serif, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ display: 'inline-block', width: '4px', height: '22px', background: PREMIUM.accent, borderRadius: '2px' }} />
          Valuation Screening
        </h2>
        <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>
          PER / PBR / ROE based — Undervalued & Overvalued verdict vs. sector peers + risk alerts
        </div>
      </div>

      {loading ? (
        <ValuationSkeleton />
      ) : (
        <>
          {/* 요약 카드 4개 */}
          <div className="val-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <SummaryCard label="Total Stocks" value={summary.total} unit="" color={PREMIUM.accent} />
            <SummaryCard label="Undervalued" value={summary.undervalued_count} unit="" color={colors.positive} />
            <SummaryCard label="Overvalued" value={summary.overvalued_count} unit="" color={colors.negative} />
            <SummaryCard label="Risk Alerts" value={summary.risk_count} unit="" color="#D97706" />
          </div>

          {/* CRITICAL 배너 */}
          {criticalCount > 0 && (
            <div style={{
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: dark ? '#1E3A5F' : '#EFF6FF',
              border: `1px solid ${dark ? '#1E40AF' : '#BFDBFE'}`,
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#1D4ED8',
            }}>
              <span style={{ fontSize: '16px' }}>{'\u26A0'}</span>
              {criticalCount} stock(s) with capital impairment detected
            </div>
          )}

          {/* 리스크 필터 토글 */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '12px',
          }}>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>
              {companies.length} stocks
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', color: colors.textSecondary }}>
              <input
                type="checkbox"
                checked={riskOnly}
                onChange={toggleRiskOnly}
                style={{ accentColor: '#D97706' }}
              />
              Risk stocks only
            </label>
          </div>

          {companies.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: colors.textMuted }}>
              <div style={{ fontSize: '15px', marginBottom: '8px' }}>
                {riskOnly ? 'No risk-flagged stocks found' : 'No valuation data available'}
              </div>
              <div style={{ fontSize: '13px' }}>Data will appear after company cards are generated</div>
            </div>
          ) : (
            /* 메인 테이블 */
            <div style={{ borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: PREMIUM.shadowMd }}>
              {/* 테이블 헤더 */}
              <div className="val-table-header" style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr repeat(5, 1fr) 80px',
                padding: '10px 16px',
                backgroundColor: dark ? '#09090B' : '#18181B',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}>
                <div>Stock</div>
                {SORT_COLUMNS.map((col) => (
                  <div
                    key={col.key}
                    className={col.hideOnMobile ? 'val-hide-mobile' : ''}
                    onClick={() => toggleSort(col.key)}
                    style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                  >
                    {col.label}
                    {sortKey === col.key && (
                      <span style={{ marginLeft: '4px', fontSize: '10px' }}>
                        {sortOrder === 'desc' ? '\u25BC' : '\u25B2'}
                      </span>
                    )}
                  </div>
                ))}
                <div style={{ textAlign: 'center' }}>Verdict</div>
              </div>

              {/* 테이블 바디 */}
              {companies.map((c) => {
                const val = c.valuation || {}
                const peer = c.peer || {}
                const flags = c.risk_flags || []
                const vs = VERDICT_STYLE[peer.verdict] || VERDICT_STYLE['적정']
                const hasCritical = flags.some((f) => f.severity === 'CRITICAL')

                return (
                  <ValuationRow
                    key={c.corp_code}
                    company={c}
                    val={val}
                    peer={peer}
                    flags={flags}
                    vs={vs}
                    hasCritical={hasCritical}
                    onClick={() => onViewCard ? onViewCard(c.corp_code) : navigate(`/deep-dive/${c.corp_code}`)}
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      {/* 반응형 CSS */}
      <style>{`
        @media (max-width: 640px) {
          .val-hide-mobile { display: none !important; }
          .val-table-header, .val-table-row {
            grid-template-columns: 1.5fr repeat(3, 1fr) 70px !important;
          }
          .val-summary-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  )
}


function SummaryCard({ label, value, unit, color }) {
  const { colors } = useTheme()
  return (
    <div style={{
      padding: '16px',
      borderRadius: '16px',
      backgroundColor: colors.bgCard,
      border: `1px solid ${colors.border}`,
      boxShadow: PREMIUM.shadowSm,
    }}>
      <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '6px' }}>{label}</div>
      <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: FONTS.mono, color }}>
        {value != null ? value : 0}
        <span style={{ fontSize: '12px', fontWeight: 400, color: colors.textMuted, marginLeft: '2px' }}>{unit}</span>
      </div>
    </div>
  )
}


function ValuationRow({ company: c, val, peer, flags, vs, hasCritical, onClick }) {
  const { colors, dark } = useTheme()

  const criticalBg = dark ? '#1E3A5F' : '#EFF6FF'
  const criticalHoverBg = dark ? '#1E3A8A' : '#DBEAFE'

  return (
    <div
      className="val-table-row"
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr repeat(5, 1fr) 80px',
        padding: '12px 16px',
        backgroundColor: hasCritical ? criticalBg : colors.bgCard,
        borderTop: `1px solid ${colors.border}`,
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hasCritical ? criticalHoverBg : colors.borderLight}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = hasCritical ? criticalBg : colors.bgCard}
    >
      {/* 종목명 + 리스크 아이콘 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>
            {c.corp_name}
          </span>
          {flags.map((f, i) => {
            const si = SEVERITY_ICON[f.severity] || SEVERITY_ICON.WATCH
            return (
              <span
                key={i}
                title={`${f.flag}: ${f.detail}`}
                style={{ fontSize: '12px', color: si.color, cursor: 'help' }}
              >
                {si.icon}
              </span>
            )
          })}
        </div>
        <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: FONTS.mono }}>
          {c.stock_code || ''}
        </div>
      </div>

      {/* PER */}
      <MetricCell value={val.per} vs={peer.per_vs_sector} format="f1" />
      {/* PBR */}
      <MetricCell value={val.pbr} vs={peer.pbr_vs_sector} format="f2" />
      {/* ROE */}
      <MetricCell value={val.roe} vs={peer.roe_vs_sector} format="f1" unit="%" invertColor />

      {/* 영업이익률 */}
      <div className="val-hide-mobile" style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: '13px', fontFamily: FONTS.mono, fontWeight: 600,
          color: val.op_margin != null ? (val.op_margin >= 0 ? colors.textPrimary : colors.negative) : colors.textMuted,
        }}>
          {val.op_margin != null ? `${val.op_margin.toFixed(1)}%` : '-'}
        </div>
      </div>

      {/* 부채비율 */}
      <div className="val-hide-mobile" style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: '13px', fontFamily: FONTS.mono, fontWeight: 600,
          color: val.debt_ratio != null
            ? (val.debt_ratio > 200 ? colors.negative : val.debt_ratio > 100 ? '#D97706' : colors.textPrimary)
            : colors.textMuted,
        }}>
          {val.debt_ratio != null ? `${val.debt_ratio.toFixed(1)}%` : '-'}
        </div>
      </div>

      {/* 판정 */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: '11px', fontWeight: 700,
          padding: '2px 8px', borderRadius: '4px',
          backgroundColor: vs.bg, color: vs.color,
        }}>
          {vs.label}
        </span>
      </div>
    </div>
  )
}


function MetricCell({ value, vs, format, unit, invertColor }) {
  const { colors } = useTheme()

  if (value == null) {
    return (
      <div style={{ textAlign: 'right', fontSize: '13px', color: colors.textMuted }}>-</div>
    )
  }

  const formatted = format === 'f2' ? value.toFixed(2) : value.toFixed(1)
  const suffix = unit || ''

  let arrow = ''
  let arrowColor = colors.textMuted
  if (vs != null) {
    if (invertColor) {
      arrow = vs > 0 ? '\u2191' : '\u2193'
      arrowColor = vs > 0 ? colors.positive : colors.negative
    } else {
      arrow = vs > 0 ? '\u2191' : '\u2193'
      arrowColor = vs < 0 ? colors.positive : colors.negative
    }
  }

  return (
    <div style={{ textAlign: 'right' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
        <span style={{ fontSize: '13px', fontFamily: FONTS.mono, fontWeight: 600, color: colors.textPrimary }}>
          {formatted}{suffix}
        </span>
        {arrow && (
          <span style={{ fontSize: '11px', fontWeight: 700, color: arrowColor }}>{arrow}</span>
        )}
      </div>
    </div>
  )
}


function ValuationSkeleton() {
  return (
    <div>
      <div className="val-summary-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <Skeleton width="80px" height="12px" style={{ marginBottom: '6px' }} />
            <Skeleton width="60px" height="22px" />
          </div>
        ))}
      </div>
      <Skeleton width="80px" height="12px" style={{ marginBottom: '12px' }} />
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '12px 16px', borderBottom: '1px solid var(--border, #e2e8f0)',
        }}>
          <Skeleton width="120px" height="14px" />
          <Skeleton width="50px" height="14px" />
          <Skeleton width="50px" height="14px" />
          <Skeleton width="50px" height="14px" />
          <Skeleton width="60px" height="14px" />
          <Skeleton width="50px" height="14px" />
        </div>
      ))}
    </div>
  )
}

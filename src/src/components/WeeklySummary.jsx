import React from 'react'
import GradeBadge from './GradeBadge'
import Skeleton from './Skeleton'
import { useWeeklySummary } from '../hooks/useWeeklySummary'
import { FONTS, GRADE_COLORS, EARNINGS_STYLE, PREMIUM } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'

export default function WeeklySummary({ onViewCard }) {
  const { colors } = useTheme()
  const { data, loading } = useWeeklySummary()

  if (loading) {
    return (
      <div style={{ marginBottom: '2rem' }}>
        <Skeleton width="140px" height="18px" style={{ marginBottom: '16px' }} />
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} width="90px" height="36px" borderRadius="8px" />
          ))}
        </div>
        <div style={{ border: `1px solid ${colors.border}`, borderRadius: '16px', overflow: 'hidden', backgroundColor: colors.bgCard }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: i < 3 ? `1px solid ${colors.borderLight}` : 'none' }}>
              <Skeleton width="32px" height="22px" borderRadius="4px" />
              <div style={{ flex: 1 }}>
                <Skeleton width="120px" height="14px" style={{ marginBottom: '4px' }} />
                <Skeleton width="200px" height="12px" />
              </div>
              <Skeleton width="50px" height="11px" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const { earnings = [], others = [], stats = {}, week_start, week_end } = data
  const total = (earnings.length + others.length)

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{
          fontSize: '1.25rem', fontWeight: 700, color: colors.textPrimary, margin: 0,
          fontFamily: FONTS.serif, display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span style={{ display: 'inline-block', width: '4px', height: '18px', background: PREMIUM.accent, borderRadius: '2px' }} />
          Weekly Filings
        </h3>
        {week_start && week_end && (
          <span style={{ fontSize: '12px', color: colors.textMuted, fontFamily: FONTS.mono }}>
            {week_start} ~ {week_end}
          </span>
        )}
      </div>

      {/* Weekly Stats Bar */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap',
      }}>
        <StatChip label="Total" value={stats.total ?? 0} color={PREMIUM.accent} />
        <StatChip label="S Grade" value={stats.S ?? 0} color={GRADE_COLORS.S.bg} />
        <StatChip label="A Grade" value={stats.A ?? 0} color={GRADE_COLORS.A.bg} />
        <StatChip label="D Grade" value={stats.D ?? 0} color={GRADE_COLORS.D.bg} />
        <StatChip label="Earnings" value={earnings.length} color={EARNINGS_STYLE.border} />
      </div>

      {/* Empty Notice */}
      {total === 0 && (
        <div style={{
          padding: '2rem', textAlign: 'center', color: colors.textMuted,
          border: `1px solid ${colors.border}`, borderRadius: '16px',
          backgroundColor: colors.bgCard, boxShadow: PREMIUM.shadowSm,
        }}>
          No key filings this week
        </div>
      )}

      {/* Earnings Section */}
      {earnings.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
          }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: EARNINGS_STYLE.accent,
              padding: '2px 8px', borderRadius: '4px',
              backgroundColor: EARNINGS_STYLE.bg,
            }}>
              {EARNINGS_STYLE.label}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: colors.textSecondary }}>
              Earnings Reports ({earnings.length})
            </span>
          </div>
          <div style={{
            border: `1px solid ${EARNINGS_STYLE.border}`,
            borderRadius: '16px', overflow: 'hidden',
            backgroundColor: colors.bgCard, boxShadow: PREMIUM.shadowSm,
          }}>
            {earnings.map((d, i) => (
              <DisclosureRow
                key={d.rcept_no || i}
                disclosure={d}
                isLast={i === earnings.length - 1}
                isEarnings
                onViewCard={onViewCard}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Key Filings Section */}
      {others.length > 0 && (
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: colors.textSecondary, marginBottom: '8px' }}>
            Other Key Filings ({others.length})
          </div>
          <div style={{
            border: `1px solid ${colors.border}`,
            borderRadius: '16px', overflow: 'hidden',
            backgroundColor: colors.bgCard, boxShadow: PREMIUM.shadowSm,
          }}>
            {others.map((d, i) => (
              <DisclosureRow
                key={d.rcept_no || i}
                disclosure={d}
                isLast={i === others.length - 1}
                onViewCard={onViewCard}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


function DisclosureRow({ disclosure: d, isLast, isEarnings, onViewCard }) {
  const { colors } = useTheme()
  return (
    <div
      onClick={() => d.corp_code && onViewCard && onViewCard(d.corp_code)}
      style={{
        padding: '12px 16px',
        borderBottom: isLast ? 'none' : `1px solid ${isEarnings ? EARNINGS_STYLE.border + '30' : colors.borderLight}`,
        borderLeft: isEarnings ? `3px solid ${EARNINGS_STYLE.border}` : 'none',
        backgroundColor: isEarnings ? EARNINGS_STYLE.bg : 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: d.corp_code ? 'pointer' : 'default',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (d.corp_code) e.currentTarget.style.backgroundColor = isEarnings ? '#FDDCDB' : colors.bgPrimary
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isEarnings ? EARNINGS_STYLE.bg : 'transparent'
      }}
    >
      <GradeBadge grade={d.grade} size="lg" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: colors.textPrimary }}>
            {d.corp_name}
          </span>
          {isEarnings && (
            <span style={{
              fontSize: '10px', fontWeight: 700,
              padding: '1px 6px', borderRadius: '3px',
              backgroundColor: EARNINGS_STYLE.badge,
              color: '#fff',
            }}>
              {EARNINGS_STYLE.label}
            </span>
          )}
        </div>
        <div style={{
          fontSize: '12px', color: colors.textSecondary,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {d.report_nm}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <span style={{ fontSize: '11px', color: colors.textMuted, fontFamily: FONTS.mono }}>
          {d.stock_code}
        </span>
        {d.created_at && (
          <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono, marginTop: '2px' }}>
            {new Date(d.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
          </div>
        )}
        {d.corp_code && (
          <div style={{ fontSize: '10px', color: PREMIUM.accent, marginTop: '2px', fontWeight: 600 }}>View Card &rarr;</div>
        )}
      </div>
    </div>
  )
}


function StatChip({ label, value, color }) {
  const { colors } = useTheme()
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '6px 14px', borderRadius: '8px',
      backgroundColor: colors.bgCard,
      border: `1px solid ${colors.border}`,
      boxShadow: PREMIUM.shadowSm,
    }}>
      <span style={{
        width: '8px', height: '8px', borderRadius: '2px',
        backgroundColor: color, flexShrink: 0,
      }} />
      <span style={{ fontSize: '12px', color: colors.textSecondary, fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: '14px', fontWeight: 700, color, fontFamily: FONTS.mono }}>{value}</span>
    </div>
  )
}

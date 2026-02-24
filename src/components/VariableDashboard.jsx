import React, { useState, useRef } from 'react'
import { useVariableScores } from '../hooks/useVariableScores'
import VariableSkeleton from './skeletons/VariableSkeleton'
import { useTheme } from '../contexts/ThemeContext'
import { VARIABLE_GRADE_COLORS, FONTS, PREMIUM } from '../constants/theme'

const GRADES = ['대운', '순풍', '양호', '보통', '주의', '경고']
const FACTOR_LABELS = ['CCC', 'Leverage', 'Dilution', 'Productivity', 'Pricing', 'Safety', 'Momentum']
const FACTOR_KEYS = ['ccc_score', 'leverage_score', 'dilution_score', 'productivity_score', 'pricing_score', 'safety_score', 'momentum_score']
const FACTOR_CATEGORIES = [
  { label: '체질', indices: [0, 1, 4, 3] },
  { label: '안전', indices: [2, 5] },
  { label: '방향', indices: [6] },
]

export default function VariableDashboard({ onViewCard }) {
  const { colors } = useTheme()
  const {
    scores, distribution, loading,
    gradeFilter, setGradeFilter,
    search, setSearch,
    page, setPage, totalCount, pageSize,
  } = useVariableScores()
  const [inputVal, setInputVal] = useState('')
  const debounceRef = useRef(null)

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

  const handleInput = (e) => {
    const val = e.target.value
    setInputVal(val)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearch(val), 300)
  }

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{
          fontSize: '1.5rem', fontWeight: 700, color: colors.textPrimary, fontFamily: FONTS.serif, margin: 0,
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <span style={{ display: 'inline-block', width: '4px', height: '22px', background: PREMIUM.accent, borderRadius: '2px' }} />
          7-Factor Analysis
        </h2>
        <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '6px', marginLeft: '14px' }}>
          KOSPI fundamental scoring — CCC, Leverage, Dilution, Productivity, Pricing, Safety, Momentum
        </div>
      </div>

      {loading ? (
        <VariableSkeleton />
      ) : (
        <>
          {/* Grade Summary Cards — All + 대운 + 등급 */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <GradeSummaryCard
              label="All"
              count={distribution.total || 0}
              active={gradeFilter === null}
              onClick={() => setGradeFilter(null)}
              color={{ bg: colors.bgCard, text: colors.textPrimary, badge: PREMIUM.accent }}
              colors={colors}
            />

            {GRADES.map((grade) => {
              const gc = VARIABLE_GRADE_COLORS[grade]
              return (
                <GradeSummaryCard
                  key={grade}
                  label={`${gc.mark} ${grade}`}
                  count={distribution[grade] || 0}
                  active={gradeFilter === grade}
                  onClick={() => setGradeFilter(gradeFilter === grade ? null : grade)}
                  color={gc}
                  colors={colors}
                />
              )
            })}
          </div>

          {/* Search */}
          <input
            type="text"
            value={inputVal}
            onChange={handleInput}
            placeholder="Search by company or stock code..."
            style={{
              width: '100%', padding: '10px 14px', fontSize: '14px',
              border: `1px solid ${colors.border}`, borderRadius: '8px',
              backgroundColor: colors.bgCard, color: colors.textPrimary,
              outline: 'none', boxSizing: 'border-box', fontFamily: FONTS.body,
              marginBottom: '16px', transition: 'border-color 0.2s',
            }}
            onFocus={(e) => e.target.style.borderColor = PREMIUM.accent}
            onBlur={(e) => e.target.style.borderColor = colors.border}
          />

          {/* Empty Result */}
          {scores.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', color: colors.textMuted }}>
              <div style={{ fontSize: '15px', marginBottom: '8px' }}>
                {search ? `No results for "${search}"` : 'No variable analysis data available'}
              </div>
              <div style={{ fontSize: '13px' }}>Data will appear after batch processing</div>
            </div>
          )}

          {/* Score List */}
          {scores.length > 0 && (
            <>
              <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px' }}>
                {gradeFilter || 'All'} — {totalCount} stocks
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {scores.map((s) => (
                  <ScoreRow key={s.corp_code} score={s} onClick={() => onViewCard && onViewCard(s.corp_code)} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  colors={colors}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}


function Pagination({ page, totalPages, onPageChange, colors }) {
  const pages = buildPageNumbers(page, totalPages)

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      gap: '4px', marginTop: '24px', padding: '12px 0',
    }}>
      {/* 이전 */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={{
          ...paginationBtnStyle(colors),
          opacity: page <= 1 ? 0.4 : 1,
          cursor: page <= 1 ? 'default' : 'pointer',
        }}
      >
        ‹ 이전
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} style={{ padding: '0 6px', fontSize: '13px', color: colors.textMuted }}>
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            style={{
              ...paginationBtnStyle(colors),
              backgroundColor: p === page ? PREMIUM.accent : colors.bgCard,
              color: p === page ? '#fff' : colors.textPrimary,
              fontWeight: p === page ? 700 : 500,
              borderColor: p === page ? PREMIUM.accent : colors.border,
            }}
          >
            {p}
          </button>
        )
      )}

      {/* 다음 */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        style={{
          ...paginationBtnStyle(colors),
          opacity: page >= totalPages ? 0.4 : 1,
          cursor: page >= totalPages ? 'default' : 'pointer',
        }}
      >
        다음 ›
      </button>
    </div>
  )
}


function paginationBtnStyle(colors) {
  return {
    padding: '6px 12px',
    fontSize: '13px',
    fontFamily: FONTS.body,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    backgroundColor: colors.bgCard,
    color: colors.textPrimary,
    cursor: 'pointer',
    transition: 'all 0.15s',
    lineHeight: 1.4,
  }
}


function buildPageNumbers(current, total) {
  // 5개 이하면 전부 표시
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = []

  // 항상 1페이지
  pages.push(1)

  if (current > 3) {
    pages.push('...')
  }

  // 현재 페이지 주변
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('...')
  }

  // 항상 마지막 페이지
  if (!pages.includes(total)) {
    pages.push(total)
  }

  return pages
}


function GradeSummaryCard({ label, count, active, onClick, color, colors }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        border: active ? `2px solid ${color.badge || color.text}` : `1px solid ${colors.border}`,
        backgroundColor: active ? color.bg : colors.bgCard,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '8px',
        transition: 'all 0.2s',
        boxShadow: active ? PREMIUM.shadowSm : 'none',
      }}
    >
      <span style={{ fontSize: '13px', fontWeight: 600, color: color.text }}>{label}</span>
      <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: FONTS.mono, color: color.text }}>
        {count}
      </span>
    </button>
  )
}


function ScoreRow({ score, onClick }) {
  const { colors } = useTheme()
  const gc = VARIABLE_GRADE_COLORS[score.grade] || VARIABLE_GRADE_COLORS['보통']

  return (
    <div
      onClick={onClick}
      className="score-row"
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 16px', borderRadius: '16px',
        backgroundColor: colors.bgCard,
        border: `1px solid ${colors.border}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: PREMIUM.shadowSm,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = PREMIUM.accent
        e.currentTarget.style.boxShadow = PREMIUM.shadowMd
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = colors.border
        e.currentTarget.style.boxShadow = PREMIUM.shadowSm
        e.currentTarget.style.transform = 'none'
      }}
    >
      {/* Grade Mark */}
      <span style={{
        padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
        backgroundColor: gc.bg, color: gc.text, whiteSpace: 'nowrap',
      }}>
        {gc.mark} {score.grade}
      </span>

      {/* Company Name */}
      <div style={{ flex: '0 0 120px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: colors.textPrimary }}>{score.corp_name}</div>
        <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: FONTS.mono }}>{score.stock_code}</div>
      </div>

      {/* Total Score */}
      <div style={{ flex: '0 0 50px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: FONTS.mono, color: gc.text }}>
          {score.total_score?.toFixed(1)}
        </div>
      </div>

      {/* 7-Factor Mini Bars — 카테고리 그룹 */}
      <div className="score-row-factors" style={{ flex: 1, display: 'flex', gap: '0px', alignItems: 'center' }}>
        {FACTOR_CATEGORIES.map((cat, ci) => (
          <div key={cat.label} style={{
            flex: cat.indices.length, display: 'flex', flexDirection: 'column',
            ...(ci > 0 ? { borderLeft: `1px dashed ${colors.border}`, paddingLeft: '6px', marginLeft: '6px' } : {}),
          }}>
            <div style={{ fontSize: '8px', color: colors.textMuted, textAlign: 'center', marginBottom: '3px' }}>
              {cat.label}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {cat.indices.map((idx) => {
                const key = FACTOR_KEYS[idx]
                const val = score[key] || 5
                const width = `${(val / 10) * 100}%`
                return (
                  <div key={key} style={{ flex: 1 }} title={`${FACTOR_LABELS[idx]}: ${val.toFixed(1)}`}>
                    <div style={{ fontSize: '9px', color: colors.textMuted, marginBottom: '2px', textAlign: 'center' }}>
                      {FACTOR_LABELS[idx]}
                    </div>
                    <div style={{ height: '6px', backgroundColor: colors.borderLight, borderRadius: '3px' }}>
                      <div style={{
                        height: '100%', width, borderRadius: '3px',
                        backgroundColor: val >= 7 ? colors.positive : val >= 4 ? PREMIUM.accent : colors.negative,
                        transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Signal Badges + AI Comment */}
      <div className="score-row-comment" style={{
        flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: '4px',
        overflow: 'hidden',
      }}>
        {score.signal_modules && Object.keys(score.signal_modules).length > 0 && (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {score.signal_modules.promise && (
              <SignalBadge label="약속이행" type="positive" />
            )}
            {score.signal_modules.risk && (
              <SignalBadge
                label="리스크"
                type={score.signal_modules.risk === 'RED' ? 'negative' : 'warning'}
              />
            )}
            {score.signal_modules.insider && (
              <SignalBadge
                label="스마트머니"
                type={score.signal_modules.insider === 'GREEN' ? 'positive' : 'negative'}
              />
            )}
          </div>
        )}
        <div style={{
          fontSize: '11px', color: colors.textSecondary,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {(score.ai_comment || '').split('\n')[0].slice(0, 60) || '-'}
        </div>
      </div>

      {/* 모바일용 카테고리 태그 (데스크톱에서는 숨김) */}
      <div className="score-row-mobile-cats" style={{ display: 'none' }}>
        {FACTOR_CATEGORIES.map((cat) => {
          const avg = cat.indices.reduce((sum, idx) => sum + (score[FACTOR_KEYS[idx]] || 5), 0) / cat.indices.length
          const tagColor = avg >= 7 ? colors.positive : avg >= 4 ? PREMIUM.accent : colors.negative
          return (
            <span key={cat.label} style={{
              fontSize: '11px', fontWeight: 600, color: tagColor,
              padding: '2px 8px', borderRadius: '4px',
              backgroundColor: colors.bgPrimary, border: `1px solid ${colors.borderLight}`,
            }}>
              {cat.label} {avg.toFixed(1)}
            </span>
          )
        })}
      </div>
    </div>
  )
}


const SIGNAL_BADGE_STYLES = {
  positive: { bg: '#DCFCE7', color: '#166534', dot: '#16A34A' },
  negative: { bg: '#FEE2E2', color: '#991B1B', dot: '#DC2626' },
  warning: { bg: '#FEF3C7', color: '#92400E', dot: '#D97706' },
}

function SignalBadge({ label, type }) {
  const s = SIGNAL_BADGE_STYLES[type] || SIGNAL_BADGE_STYLES.warning
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '3px',
      fontSize: '9px', fontWeight: 600, lineHeight: 1,
      padding: '2px 6px', borderRadius: '4px',
      backgroundColor: s.bg, color: s.color,
    }}>
      <span style={{
        width: '5px', height: '5px', borderRadius: '50%',
        backgroundColor: s.dot, flexShrink: 0,
      }} />
      {label}
    </span>
  )
}

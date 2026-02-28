import React, { useState, useRef } from 'react'
import { useVariableScores } from '../hooks/useVariableScores'
import VariableSkeleton from './skeletons/VariableSkeleton'
import EmptyState from './EmptyState'
import { useTheme } from '../contexts/ThemeContext'
import { VARIABLE_GRADE_COLORS, FONTS, PREMIUM } from '../constants/theme'

const GRADES = ['대운', '순풍', '양호', '보통', '주의', '경고']
const FACTOR_LABELS = ['CCC', 'Leverage', 'Dilution', 'Safety', 'Momentum']
const FACTOR_KEYS = ['ccc_score', 'leverage_score', 'dilution_score', 'safety_score', 'momentum_score']
const FACTOR_COLORS = ['#2563EB', '#0D9488', '#8B5CF6', '#D97706', '#DC2626']
const FACTOR_CATEGORIES = [
  { label: '체질', indices: [0, 1] },
  { label: '안전', indices: [2, 3] },
  { label: '방향', indices: [4] },
]

export default function VariableDashboard({ onViewCard }) {
  const { colors, dark } = useTheme()
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
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '20px', fontWeight: 700, color: colors.textPrimary,
          fontFamily: FONTS.serif, margin: 0, letterSpacing: '-0.02em',
        }}>
          5-Factor Analysis
        </h2>
        <p style={{ fontSize: '13px', color: colors.textMuted, margin: '6px 0 0', lineHeight: 1.5 }}>
          CCC · Leverage · Dilution · Safety · Momentum
        </p>
      </div>

      {loading ? (
        <VariableSkeleton />
      ) : (
        <>
          {/* Grade Filter Pills */}
          <div style={{
            display: 'flex', gap: '6px', marginBottom: '20px',
            flexWrap: 'wrap', alignItems: 'center',
          }}>
            <GradePill
              label="All"
              count={distribution.total || 0}
              active={gradeFilter === null}
              onClick={() => setGradeFilter(null)}
              accentColor={PREMIUM.accent}
              colors={colors}
              dark={dark}
            />
            {GRADES.map((grade) => {
              const gc = VARIABLE_GRADE_COLORS[grade]
              return (
                <GradePill
                  key={grade}
                  label={grade}
                  mark={gc.mark}
                  count={distribution[grade] || 0}
                  active={gradeFilter === grade}
                  onClick={() => setGradeFilter(gradeFilter === grade ? null : grade)}
                  accentColor={gc.badge}
                  colors={colors}
                  dark={dark}
                />
              )
            })}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '14px', color: colors.textMuted, pointerEvents: 'none',
            }}>
              &#x1F50D;
            </span>
            <input
              type="text"
              value={inputVal}
              onChange={handleInput}
              placeholder="종목명 또는 종목코드 검색..."
              style={{
                width: '100%', padding: '10px 14px 10px 36px', fontSize: '13px',
                border: `1px solid ${colors.border}`, borderRadius: '10px',
                backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#FAFAFA',
                color: colors.textPrimary,
                outline: 'none', boxSizing: 'border-box', fontFamily: FONTS.body,
                transition: 'all 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = PREMIUM.accent
                e.target.style.backgroundColor = colors.bgCard
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.border
                e.target.style.backgroundColor = dark ? 'rgba(255,255,255,0.04)' : '#FAFAFA'
              }}
            />
          </div>

          {/* Count */}
          <div style={{
            fontSize: '12px', color: colors.textMuted, marginBottom: '12px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span>{gradeFilter || 'All'} — {totalCount} stocks</span>
            {/* Factor Legend */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {FACTOR_LABELS.map((f, i) => (
                <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: colors.textMuted }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: FACTOR_COLORS[i] }} />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Empty */}
          {scores.length === 0 && (
            <EmptyState
              icon={search ? 'search' : 'chart'}
              title={search ? `"${search}"에 대한 결과 없음` : '데이터가 없습니다'}
              description="배치 처리 후 데이터가 표시됩니다"
            />
          )}

          {/* Score Table */}
          {scores.length > 0 && (
            <>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '44px 1fr 60px minmax(180px, 260px) 1fr',
                padding: '8px 16px',
                fontSize: '10px', fontWeight: 600, color: colors.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                borderBottom: `1px solid ${colors.border}`,
              }}
              className="var-table-header"
              >
                <div>등급</div>
                <div>종목</div>
                <div style={{ textAlign: 'center' }}>점수</div>
                <div style={{ textAlign: 'center' }}>5-Factor</div>
                <div>AI 코멘트</div>
              </div>

              {/* Rows */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {scores.map((s) => (
                  <ScoreRow key={s.corp_code} score={s} onClick={() => onViewCard && onViewCard(s.corp_code)} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} colors={colors} />
              )}
            </>
          )}
        </>
      )}

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .var-table-header { display: none !important; }
        }
      `}</style>
    </div>
  )
}


/* ── Grade Pill ── */
function GradePill({ label, mark, count, active, onClick, accentColor, colors, dark }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '5px 14px', borderRadius: '20px',
        border: active ? `2px solid ${accentColor}` : `1px solid ${colors.border}`,
        backgroundColor: active
          ? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.02)')
          : 'transparent',
        cursor: 'pointer', transition: 'all 0.2s',
        boxShadow: active ? `0 0 0 1px ${accentColor}20` : 'none',
      }}
    >
      {mark && <span style={{ fontSize: '11px' }}>{mark}</span>}
      <span style={{ fontSize: '12px', fontWeight: 600, color: active ? accentColor : colors.textSecondary }}>
        {label}
      </span>
      <span style={{
        fontSize: '12px', fontWeight: 700, fontFamily: FONTS.mono,
        color: active ? accentColor : colors.textMuted,
      }}>
        {count}
      </span>
    </button>
  )
}


/* ── Score Row ── */
function ScoreRow({ score, onClick }) {
  const { colors, dark } = useTheme()
  const gc = VARIABLE_GRADE_COLORS[score.grade] || VARIABLE_GRADE_COLORS['보통']

  return (
    <div
      onClick={onClick}
      className="var-score-row card-lift"
      style={{
        display: 'grid',
        gridTemplateColumns: '44px 1fr 60px minmax(180px, 260px) 1fr',
        padding: '12px 16px',
        alignItems: 'center',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.05)' : '#F4F4F5'}`,
        cursor: 'pointer',
        transition: 'background-color 0.15s, transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {/* Grade Badge */}
      <div>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '32px', height: '22px', borderRadius: '6px',
          fontSize: '10px', fontWeight: 700,
          backgroundColor: gc.bg, color: gc.text,
        }}>
          {gc.mark}
        </span>
      </div>

      {/* Company */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: 600, color: colors.textPrimary,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {score.corp_name}
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono }}>
          {score.stock_code}
        </div>
      </div>

      {/* Score */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: '15px', fontWeight: 700, fontFamily: FONTS.mono,
          color: gc.text,
        }}>
          {score.total_score?.toFixed(1)}
        </span>
      </div>

      {/* 5-Factor Mini Bars */}
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center', padding: '0 4px' }}>
        {FACTOR_KEYS.map((key, idx) => {
          const val = score[key] || 5
          const pct = Math.min((val / 10) * 100, 100)
          return (
            <div key={key} style={{ flex: 1 }} title={`${FACTOR_LABELS[idx]}: ${val.toFixed(1)}`}>
              <div style={{
                height: '18px', borderRadius: '3px',
                backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5',
                overflow: 'hidden', position: 'relative',
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  backgroundColor: FACTOR_COLORS[idx],
                  opacity: 0.75, borderRadius: '3px',
                  transition: 'width 0.3s ease',
                }} />
                <span style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '8px', fontWeight: 700, fontFamily: FONTS.mono,
                  color: pct > 50 ? '#fff' : colors.textMuted,
                  textShadow: pct > 50 ? '0 0 2px rgba(0,0,0,0.3)' : 'none',
                }}>
                  {val.toFixed(0)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* AI Comment */}
      <div style={{
        fontSize: '11px', color: colors.textSecondary,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        paddingLeft: '8px',
      }}>
        {/* Signal Badges */}
        {score.signal_modules && Object.keys(score.signal_modules).length > 0 && (
          <span style={{ marginRight: '6px' }}>
            {score.signal_modules.promise && <SignalDot color="#16A34A" title="약속이행" />}
            {score.signal_modules.risk && <SignalDot color="#DC2626" title="리스크" />}
            {score.signal_modules.insider && <SignalDot color="#2563EB" title="스마트머니" />}
          </span>
        )}
        {(score.ai_comment || '').split('\n')[0].slice(0, 50) || '-'}
      </div>
    </div>
  )
}


/* ── Signal Dot ── */
function SignalDot({ color, title }) {
  return (
    <span title={title} style={{
      display: 'inline-block', width: '6px', height: '6px',
      borderRadius: '50%', backgroundColor: color, marginRight: '2px',
    }} />
  )
}


/* ── Pagination ── */
function Pagination({ page, totalPages, onPageChange, colors }) {
  const pages = buildPageNumbers(page, totalPages)

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      gap: '2px', marginTop: '24px', padding: '12px 0',
    }}>
      <PaginationBtn
        label="‹"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        colors={colors}
      />
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} style={{ padding: '0 6px', fontSize: '12px', color: colors.textMuted }}>...</span>
        ) : (
          <PaginationBtn
            key={p}
            label={p}
            onClick={() => onPageChange(p)}
            active={p === page}
            colors={colors}
          />
        )
      )}
      <PaginationBtn
        label="›"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        colors={colors}
      />
    </div>
  )
}

function PaginationBtn({ label, onClick, disabled, active, colors }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: '32px', height: '32px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', borderRadius: '8px',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: '13px', fontWeight: active ? 700 : 500,
        fontFamily: typeof label === 'number' ? FONTS.mono : FONTS.body,
        backgroundColor: active ? PREMIUM.accent : 'transparent',
        color: active ? '#fff' : disabled ? colors.textMuted : colors.textPrimary,
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )
}


function buildPageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (current > 3) pages.push('...')
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (current < total - 2) pages.push('...')
  if (!pages.includes(total)) pages.push(total)
  return pages
}

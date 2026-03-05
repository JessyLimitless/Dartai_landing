import React, { useState, useRef } from 'react'
import { useVariableScores } from '../hooks/useVariableScores'
import VariableSkeleton from './skeletons/VariableSkeleton'
import EmptyState from './EmptyState'
import { useTheme } from '../contexts/ThemeContext'
import { VARIABLE_GRADE_COLORS, FONTS, PREMIUM } from '../constants/theme'

const GRADES = ['대운', '순풍', '양호', '보통', '주의', '경고']

const FACTOR_LABELS = ['수익성', '성장성', '안전성', '현금창출', '밸류에이션']
const FACTOR_KEYS   = ['profitability_score', 'growth_score', 'safety_score', 'cashflow_score', 'valuation_score']
const FACTOR_COLORS = ['#2563EB', '#0D9488', '#8B5CF6', '#D97706', '#E11D48']

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
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '28px 20px' }}>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <h2 style={{
            fontSize: '18px', fontWeight: 700, color: colors.textPrimary,
            fontFamily: FONTS.serif, margin: 0, letterSpacing: '-0.02em',
          }}>
            5-Factor Analysis
          </h2>
          <span style={{ fontSize: '12px', color: colors.textMuted }}>
            수익성 · 성장성 · 안전성 · 현금창출 · 밸류에이션
          </span>
        </div>
      </div>

      {/* Grade Filter + Search row */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Grade Pills */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
          <GradePill
            label="All"
            count={distribution.total || 0}
            active={gradeFilter === null}
            onClick={() => setGradeFilter(null)}
            accentColor={PREMIUM.accent}
            colors={colors} dark={dark}
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
                colors={colors} dark={dark}
              />
            )
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '180px' }}>
          <span style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '13px', color: colors.textMuted, pointerEvents: 'none',
          }}>
            &#x1F50D;
          </span>
          <input
            type="text"
            value={inputVal}
            onChange={handleInput}
            placeholder="종목 검색..."
            style={{
              width: '100%', padding: '8px 12px 8px 32px', fontSize: '12px',
              border: `1px solid ${colors.border}`, borderRadius: '8px',
              backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#FAFAFA',
              color: colors.textPrimary, outline: 'none',
              boxSizing: 'border-box', fontFamily: FONTS.body,
            }}
            onFocus={(e) => { e.target.style.borderColor = PREMIUM.accent }}
            onBlur={(e) => { e.target.style.borderColor = colors.border }}
          />
        </div>
      </div>

      {/* Count + Legend */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '10px',
      }}>
        <span style={{ fontSize: '11px', color: colors.textMuted }}>
          {gradeFilter || 'All'} — <strong style={{ color: colors.textSecondary }}>{totalCount}</strong> 종목
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          {FACTOR_LABELS.map((f, i) => (
            <span key={f} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', color: colors.textMuted }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: FACTOR_COLORS[i] }} />
              {f}
            </span>
          ))}
        </div>
      </div>

      {loading ? (
        <VariableSkeleton />
      ) : scores.length === 0 ? (
        <EmptyState
          icon={search ? 'search' : 'chart'}
          title={search ? `"${search}"에 대한 결과 없음` : '데이터가 없습니다'}
          description="배치 처리 후 데이터가 표시됩니다"
        />
      ) : (
        <>
          {/* Table */}
          <div style={{
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
          }}>
            {/* Table Header */}
            <div className="var-table-header" style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 56px minmax(160px, 240px)',
              padding: '9px 16px',
              fontSize: '10px', fontWeight: 600, color: colors.textMuted,
              textTransform: 'uppercase', letterSpacing: '0.05em',
              backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
              borderBottom: `1px solid ${colors.border}`,
            }}>
              <div style={{ textAlign: 'center' }}>등급</div>
              <div>종목</div>
              <div style={{ textAlign: 'center' }}>점수</div>
              <div style={{ textAlign: 'center' }}>5-Factor</div>
            </div>

            {/* Rows */}
            {scores.map((s, idx) => (
              <ScoreRow
                key={s.corp_code}
                score={s}
                idx={idx}
                onClick={() => onViewCard && onViewCard(s.corp_code)}
                colors={colors}
                dark={dark}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} colors={colors} />
          )}
        </>
      )}

    </div>
  )
}


/* ── Grade Pill ── */
function GradePill({ label, mark, count, active, onClick, accentColor, colors, dark }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        padding: '4px 12px', borderRadius: '16px',
        border: active ? `1.5px solid ${accentColor}` : `1px solid ${colors.border}`,
        backgroundColor: active
          ? (dark ? `${accentColor}18` : `${accentColor}0F`)
          : 'transparent',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {mark && <span style={{ fontSize: '10px' }}>{mark}</span>}
      <span style={{ fontSize: '11px', fontWeight: 600, color: active ? accentColor : colors.textSecondary }}>
        {label}
      </span>
      <span style={{
        fontSize: '10px', fontWeight: 700, fontFamily: FONTS.mono,
        color: active ? accentColor : colors.textMuted,
      }}>
        {count}
      </span>
    </button>
  )
}


/* ── Score Row ── */
function ScoreRow({ score, idx, onClick, colors, dark }) {
  const gc = VARIABLE_GRADE_COLORS[score.grade] || VARIABLE_GRADE_COLORS['보통']
  const stripeBg = idx % 2 === 0 ? 'transparent' : (dark ? 'rgba(255,255,255,0.015)' : '#FAFAFA')

  return (
    <div
      className="var-score-row"
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 1fr 56px minmax(160px, 240px)',
        padding: '11px 16px',
        alignItems: 'center',
        backgroundColor: stripeBg,
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'}`,
        cursor: 'pointer',
        transition: 'background-color 0.12s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.05)' : '#F0F4FF'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = stripeBg}
    >
      {/* Grade Badge */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '28px', height: '20px', borderRadius: '5px',
          fontSize: '9px', fontWeight: 700,
          backgroundColor: gc.bg, color: gc.text,
        }}>
          {gc.mark}
        </span>
      </div>

      {/* Company */}
      <div style={{ minWidth: 0, paddingRight: '8px' }}>
        <div style={{
          fontSize: '13px', fontWeight: 600, color: colors.textPrimary,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {score.corp_name}
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono, marginTop: '1px' }}>
          {score.stock_code}
          {score.signal_modules && (
            <>
              {score.signal_modules.promise && <SignalDot color="#16A34A" title="약속이행" />}
              {score.signal_modules.risk    && <SignalDot color="#DC2626" title="리스크" />}
              {score.signal_modules.insider && <SignalDot color="#2563EB" title="스마트머니" />}
            </>
          )}
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
      <div className="var-factor-col" style={{ display: 'flex', gap: '3px', alignItems: 'center', padding: '0 4px' }}>
        {FACTOR_KEYS.map((key, idx) => {
          const val = score[key] ?? 5
          const pct = Math.min((val / 10) * 100, 100)
          return (
            <div key={key} style={{ flex: 1 }} title={`${FACTOR_LABELS[idx]}: ${val.toFixed(1)}`}>
              <div style={{
                height: '20px', borderRadius: '4px',
                backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#EEEEEF',
                overflow: 'hidden', position: 'relative',
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  backgroundColor: FACTOR_COLORS[idx],
                  opacity: 0.7, borderRadius: '4px',
                  transition: 'width 0.4s ease',
                }} />
                <span style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '9px', fontWeight: 700, fontFamily: FONTS.mono,
                  color: pct > 50 ? '#fff' : colors.textSecondary,
                  textShadow: pct > 50 ? '0 0 3px rgba(0,0,0,0.25)' : 'none',
                }}>
                  {val.toFixed(0)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


/* ── Signal Dot ── */
function SignalDot({ color, title }) {
  return (
    <span title={title} style={{
      display: 'inline-block', width: '5px', height: '5px',
      borderRadius: '50%', backgroundColor: color,
      marginLeft: '4px', verticalAlign: 'middle',
    }} />
  )
}


/* ── Pagination ── */
function Pagination({ page, totalPages, onPageChange, colors }) {
  const pages = buildPageNumbers(page, totalPages)
  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      gap: '2px', marginTop: '20px',
    }}>
      <PaginationBtn label="‹" onClick={() => onPageChange(page - 1)} disabled={page <= 1} colors={colors} />
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} style={{ padding: '0 6px', fontSize: '12px', color: colors.textMuted }}>…</span>
        ) : (
          <PaginationBtn key={p} label={p} onClick={() => onPageChange(p)} active={p === page} colors={colors} />
        )
      )}
      <PaginationBtn label="›" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} colors={colors} />
    </div>
  )
}

function PaginationBtn({ label, onClick, disabled, active, colors }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: '30px', height: '30px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: 'none', borderRadius: '7px',
        cursor: disabled ? 'default' : 'pointer',
        fontSize: '12px', fontWeight: active ? 700 : 400,
        fontFamily: typeof label === 'number' ? FONTS.mono : FONTS.body,
        backgroundColor: active ? PREMIUM.accent : 'transparent',
        color: active ? '#fff' : disabled ? colors.textMuted : colors.textPrimary,
        opacity: disabled ? 0.35 : 1,
        transition: 'all 0.12s',
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

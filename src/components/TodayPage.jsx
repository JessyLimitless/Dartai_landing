import React from 'react'
import GradeBadge from './GradeBadge'
import WeeklySummary from './WeeklySummary'
import FeedSkeleton from './skeletons/FeedSkeleton'
import { useDisclosures } from '../hooks/useDisclosures'
import { FONTS, GRADE_COLORS, MARKET_LABELS, PREMIUM } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'

export default function TodayPage({ onViewCard }) {
  const { colors } = useTheme()
  const {
    disclosures, counts, loading,
    gradeFilter, setGradeFilter,
    search, setSearch,
  } = useDisclosures()

  /* ── S등급 하이라이트 (최대 3개) ── */
  const sHighlights = disclosures.filter(d => d.grade === 'S').slice(0, 3)

  /* ── 오전/오후 그룹핑 ── */
  const grouped = React.useMemo(() => {
    if (!disclosures.length) return []
    const pm = []
    const am = []
    disclosures.forEach(d => {
      const hour = d.created_at ? parseInt(d.created_at.substring(11, 13), 10) : 0
      if (hour >= 12) pm.push(d)
      else am.push(d)
    })
    const result = []
    if (pm.length > 0) {
      result.push({ type: 'divider', label: '오후' })
      pm.forEach(d => result.push({ type: 'row', data: d }))
    }
    if (am.length > 0) {
      result.push({ type: 'divider', label: '오전' })
      am.forEach(d => result.push({ type: 'row', data: d }))
    }
    return result
  }, [disclosures])

  /* ── 갱신 시각: 최신 공시 기준 ── */
  const lastUpdated = disclosures.length > 0 && disclosures[0].created_at
    ? disclosures[0].created_at.substring(11, 16)
    : null

  return (
    <div className="page-container" style={{ padding: '2rem 2.5rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* ── DateHeader ── */}
      <DateHeader
        counts={counts}
        lastUpdated={lastUpdated}
        gradeFilter={gradeFilter}
        setGradeFilter={setGradeFilter}
        colors={colors}
      />

      {/* ── 2-Column Grid ── */}
      <div className="today-grid">
        {/* ── Left: Search + Feed List ── */}
        <div>
          <SearchBar search={search} setSearch={setSearch} colors={colors} />

          <div style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            <div>
              {loading ? (
                <div style={{ padding: '16px' }}><FeedSkeleton /></div>
              ) : disclosures.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', color: colors.textSecondary, fontSize: '14px' }}>
                  No disclosure data available
                </div>
              ) : (
                grouped.map((item, i) =>
                  item.type === 'divider' ? (
                    <TimeDivider key={`div-${item.label}`} label={item.label} colors={colors} />
                  ) : (
                    <FeedRow key={item.data.rcept_no} d={item.data} delay={i * 20} onViewCard={onViewCard} colors={colors} />
                  )
                )
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Highlight + Weekly (sticky) ── */}
        <div className="today-weekly-col">
          {sHighlights.length > 0 && (
            <HighlightCard highlights={sHighlights} onViewCard={onViewCard} colors={colors} />
          )}
          <WeeklySummary onViewCard={onViewCard} />
        </div>
      </div>
    </div>
  )
}

/* ── DateHeader: 날짜 + 갱신 시각 + GradeBlocks ── */
function DateHeader({ counts, lastUpdated, gradeFilter, setGradeFilter, colors }) {
  const now = new Date()
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 ${dayNames[now.getDay()]}`

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Line 1: Date + Update time */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '12px', flexWrap: 'wrap', gap: '8px',
      }}>
        <h2 style={{
          fontSize: '1.4rem', fontWeight: 700, margin: 0,
          color: colors.textPrimary, fontFamily: FONTS.serif,
        }}>
          {dateStr} <span style={{ fontFamily: FONTS.mono, fontSize: '1rem', fontWeight: 400, color: colors.textSecondary, marginLeft: '4px' }}>
            · 총 {counts.total}건
          </span>
        </h2>

        {lastUpdated && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', color: colors.textSecondary, fontFamily: FONTS.mono,
          }}>
            마지막 갱신 {lastUpdated}
            <span className="animate-pulse" style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: '#22C55E', display: 'inline-block',
            }} />
          </div>
        )}
      </div>

      {/* Line 2: GradeBlocks */}
      <GradeBlocks counts={counts} gradeFilter={gradeFilter} setGradeFilter={setGradeFilter} colors={colors} />
    </div>
  )
}

/* ── GradeBlocks: S/A/D/기타 클릭 필터 ── */
function GradeBlocks({ counts, gradeFilter, setGradeFilter, colors }) {
  if (!counts || counts.total === 0) return null

  const grades = [
    { key: 'S', label: 'S', color: GRADE_COLORS.S.bg, count: counts.S || 0 },
    { key: 'A', label: 'A', color: GRADE_COLORS.A.bg, count: counts.A || 0 },
    { key: 'D', label: 'D', color: GRADE_COLORS.D.bg, count: counts.D || 0 },
  ]
  const otherCount = counts.total - grades.reduce((s, g) => s + g.count, 0)
  if (otherCount > 0) grades.push({ key: 'etc', label: '기타', color: '#94A3B8', count: otherCount })

  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {grades.map(g => {
        const active = gradeFilter === (g.key === 'etc' ? null : g.key)
          ? false // 'etc' never truly "active" via gradeFilter
          : gradeFilter === g.key
        // For 'etc': when gradeFilter is null (ALL), no block is highlighted
        // Each block is active when gradeFilter matches its key
        const isActive = g.key !== 'etc' && gradeFilter === g.key
        const widthPct = counts.total > 0 ? (g.count / counts.total) * 100 : 0

        return (
          <button
            key={g.key}
            onClick={() => {
              if (g.key === 'etc') {
                setGradeFilter(null)
              } else {
                setGradeFilter(gradeFilter === g.key ? null : g.key)
              }
            }}
            style={{
              flex: `0 0 auto`,
              minWidth: '80px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: isActive ? `2px solid ${g.color}` : `1px solid ${colors.border}`,
              backgroundColor: isActive ? (g.key === 'S' ? '#FEF2F2' : g.key === 'A' ? '#F0FDFA' : g.key === 'D' ? '#EFF6FF' : colors.bgCard) : colors.bgCard,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              transform: isActive ? 'scale(1.03)' : 'scale(1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {/* Label + Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '13px', fontWeight: 700, fontFamily: FONTS.mono, color: g.color,
              }}>{g.label}</span>
              <span style={{
                fontSize: '16px', fontWeight: 700, fontFamily: FONTS.mono, color: colors.textPrimary,
              }}>{g.count}</span>
            </div>
            {/* Color bar (proportional width) */}
            <div style={{
              height: '3px', borderRadius: '2px', backgroundColor: colors.border, width: '100%', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', backgroundColor: g.color, borderRadius: '2px',
                width: `${Math.max(widthPct, 8)}%`, transition: 'width 0.3s ease',
              }} />
            </div>
          </button>
        )
      })}
    </div>
  )
}

/* ── SearchBar: 검색 입력만 (등급 탭은 GradeBlocks로 이동) ── */
function SearchBar({ search, setSearch, colors }) {
  const [searchInput, setSearchInput] = React.useState(search)
  const [focused, setFocused] = React.useState(false)

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSearch(searchInput) }}
      style={{
        display: 'flex', gap: '6px', marginBottom: '12px', width: '100%',
      }}
    >
      <input
        type="text"
        placeholder="기업명 또는 공시 검색..."
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
          border: `1px solid ${focused ? PREMIUM.accent : colors.border}`,
          backgroundColor: colors.bgCard, color: colors.textPrimary,
          outline: 'none', transition: 'border-color 0.15s',
        }}
      />
      <button type="submit" style={{
        padding: '8px 16px', borderRadius: '8px', border: 'none',
        backgroundColor: PREMIUM.accent, color: '#fff',
        fontSize: '13px', fontWeight: 600, cursor: 'pointer',
        flexShrink: 0,
      }}>
        검색
      </button>
    </form>
  )
}

/* ── TimeDivider: 오전/오후 구분선 ── */
function TimeDivider({ label, colors }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      padding: '8px 16px', userSelect: 'none',
    }}>
      <span style={{
        fontSize: '11px', fontWeight: 600, color: colors.textSecondary,
        fontFamily: FONTS.mono, letterSpacing: '0.05em', flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{
        flex: 1, height: '1px', backgroundColor: colors.border,
      }} />
    </div>
  )
}

/* ── HighlightCard: 오늘의 핵심 (S등급) ── */
function HighlightCard({ highlights, onViewCard, colors }) {
  return (
    <div style={{
      backgroundColor: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
    }}>
      <h3 style={{
        fontSize: '13px', fontWeight: 700, margin: '0 0 12px 0',
        color: GRADE_COLORS.S.bg, fontFamily: FONTS.serif,
        display: 'flex', alignItems: 'center', gap: '6px',
      }}>
        <span style={{
          width: '4px', height: '14px', backgroundColor: GRADE_COLORS.S.bg,
          borderRadius: '2px', display: 'inline-block',
        }} />
        오늘의 핵심
      </h3>

      {highlights.map((d, i) => {
        const summary = d.ai_summary ? d.ai_summary.replace(/\*\*/g, '').slice(0, 150) : ''
        return (
          <HighlightItem
            key={d.rcept_no}
            d={d}
            summary={summary}
            isLast={i === highlights.length - 1}
            onViewCard={onViewCard}
            colors={colors}
          />
        )
      })}
    </div>
  )
}

function HighlightItem({ d, summary, isLast, onViewCard, colors }) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      onClick={() => onViewCard(d.corp_code)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', gap: '10px', padding: '10px 8px',
        cursor: 'pointer', borderRadius: '8px',
        transition: 'background-color 0.15s',
        backgroundColor: hovered ? PREMIUM.accentLight : 'transparent',
        borderBottom: isLast ? 'none' : `1px solid ${colors.border}`,
      }}
    >
      {/* Left red bar */}
      <div style={{
        width: '4px', borderRadius: '2px', backgroundColor: GRADE_COLORS.S.bg,
        flexShrink: 0, alignSelf: 'stretch',
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: '14px', color: colors.textPrimary,
          fontFamily: FONTS.serif, marginBottom: '2px',
        }}>
          {d.corp_name}
        </div>
        <div style={{
          fontSize: '12px', color: colors.textSecondary,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: summary ? '4px' : 0,
        }}>
          {d.report_nm}
        </div>
        {summary && (
          <div style={{
            fontSize: '11px', color: colors.textSecondary, lineHeight: '1.5',
            display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', opacity: 0.8,
          }}>
            {summary}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── FeedRow: Simplified disclosure row (no detail panel) ── */
function FeedRow({ d, delay, onViewCard, colors }) {
  const [hovered, setHovered] = React.useState(false)
  const market = MARKET_LABELS[d.corp_cls] || ''
  const summary = d.ai_summary ? d.ai_summary.replace(/\*\*/g, '').slice(0, 120) : ''
  const time = d.created_at ? d.created_at.substring(11, 16) : ''

  return (
    <div
      onClick={() => onViewCard(d.corp_code)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="animate-fade-in"
      style={{
        display: 'flex', gap: '10px', padding: '12px 16px',
        cursor: 'pointer', transition: 'background-color 0.15s ease',
        backgroundColor: hovered ? (colors.bgHover || PREMIUM.accentLight) : 'transparent',
        borderBottom: `1px solid ${colors.border}`,
        animationDelay: `${delay}ms`, animationFillMode: 'both',
      }}
    >
      {/* Grade */}
      <div style={{ flexShrink: 0, paddingTop: '2px' }}>
        <GradeBadge grade={d.grade} size="lg" />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Line 1: Company + Market */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d.corp_name}
          </span>
          {market && (
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '1px 5px', borderRadius: '3px',
              backgroundColor: colors.bgHover || '#F1F5F9', color: colors.textSecondary,
            }}>{market}</span>
          )}
        </div>
        {/* Line 2: Filing name */}
        <div style={{
          fontSize: '12px', color: colors.textSecondary,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          marginBottom: summary ? '4px' : 0,
        }}>
          {d.report_nm}
        </div>
        {/* Line 3: AI summary (2 lines) */}
        {summary && (
          <div style={{
            fontSize: '11px', color: colors.textSecondary, lineHeight: '1.4',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            overflow: 'hidden', opacity: 0.8,
          }}>
            {summary}
          </div>
        )}
      </div>

      {/* Time + Stock code */}
      <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '2px' }}>
        {time && <span style={{ fontSize: '11px', color: colors.textSecondary, fontFamily: FONTS.mono }}>{time}</span>}
        {d.stock_code && <span style={{ fontSize: '10px', color: colors.textSecondary, fontFamily: FONTS.mono, opacity: 0.6 }}>{d.stock_code}</span>}
      </div>
    </div>
  )
}

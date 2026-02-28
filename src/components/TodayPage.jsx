import React from 'react'
import GradeBadge from './GradeBadge'
import WeeklySummary from './WeeklySummary'
import FeedSkeleton from './skeletons/FeedSkeleton'
import { useDisclosures } from '../hooks/useDisclosures'
import { FONTS, GRADE_COLORS, MARKET_LABELS, PREMIUM } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'

export default function TodayPage({ onViewCard }) {
  const { colors, dark } = useTheme()
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
    <div className="page-container" style={{ padding: '24px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* ── DateHeader ── */}
      <DateHeader
        counts={counts}
        lastUpdated={lastUpdated}
        gradeFilter={gradeFilter}
        setGradeFilter={setGradeFilter}
        colors={colors}
        dark={dark}
      />

      {/* ── 2-Column Grid ── */}
      <div className="today-grid">
        {/* ── Left: Search + Feed List ── */}
        <div>
          <SearchBar search={search} setSearch={setSearch} colors={colors} dark={dark} />

          <div style={{
            backgroundColor: colors.bgCard,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {loading ? (
              <div style={{ padding: '16px' }}><FeedSkeleton /></div>
            ) : disclosures.length === 0 ? (
              <div style={{
                padding: '80px 24px', textAlign: 'center',
                borderRadius: '12px',
                backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
              }}>
                {(gradeFilter || search) ? (
                  <>
                    <div style={{ fontSize: '14px', color: colors.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                      조건에 맞는 공시가 없습니다
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '12px' }}>
                      {gradeFilter && `등급 필터: ${gradeFilter}`}{gradeFilter && search && ' · '}{search && `검색: "${search}"`}
                    </div>
                    <button
                      onClick={() => { setGradeFilter(null); setSearch('') }}
                      style={{
                        padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 600,
                        backgroundColor: PREMIUM.accent, color: '#fff',
                      }}
                    >
                      필터 초기화
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '14px', color: colors.textSecondary, fontWeight: 600, marginBottom: '6px' }}>
                      오늘 수집된 공시가 없습니다
                    </div>
                    <div style={{ fontSize: '12px', color: colors.textMuted }}>
                      장 운영 시간(09:00~18:00)에 자동으로 수집됩니다
                    </div>
                  </>
                )}
              </div>
            ) : (
              grouped.map((item, i) =>
                item.type === 'divider' ? (
                  <TimeDivider key={`div-${item.label}`} label={item.label} colors={colors} dark={dark} />
                ) : (
                  <FeedRow key={item.data.rcept_no} d={item.data} delay={i * 20} onViewCard={onViewCard} colors={colors} dark={dark} />
                )
              )
            )}
          </div>
        </div>

        {/* ── Right: Highlight + Weekly (sticky) ── */}
        <div className="today-weekly-col">
          {sHighlights.length > 0 && (
            <HighlightCard highlights={sHighlights} onViewCard={onViewCard} colors={colors} dark={dark} />
          )}
          <WeeklySummary onViewCard={onViewCard} />
        </div>
      </div>
    </div>
  )
}

/* ── DateHeader: 날짜 + 갱신 시각 + GradeBlocks ── */
function DateHeader({ counts, lastUpdated, gradeFilter, setGradeFilter, colors, dark }) {
  const now = new Date()
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일']
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 ${dayNames[now.getDay()]}`

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Line 1: Date + Update time */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '14px', flexWrap: 'wrap', gap: '8px',
      }}>
        <div>
          <h2 style={{
            fontSize: '20px', fontWeight: 700, margin: 0,
            color: colors.textPrimary, fontFamily: FONTS.serif,
            letterSpacing: '-0.02em',
          }}>
            Today's Filing
          </h2>
          <p style={{
            fontSize: '13px', color: colors.textMuted, margin: '4px 0 0',
          }}>
            {dateStr} · {counts.total}건 접수
          </p>
        </div>

        {lastUpdated && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '16px',
            backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#F0FDF4',
            border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#BBF7D0'}`,
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              backgroundColor: '#22C55E', display: 'inline-block',
              animation: 'today-pulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: '11px', color: dark ? '#86EFAC' : '#15803D',
              fontFamily: FONTS.mono, fontWeight: 600,
            }}>
              {lastUpdated}
            </span>
          </div>
        )}
      </div>

      {/* Line 2: GradeBlocks */}
      <GradeBlocks counts={counts} gradeFilter={gradeFilter} setGradeFilter={setGradeFilter} colors={colors} dark={dark} />

      <style>{`
        @keyframes today-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

/* ── GradeBlocks: S/A/D/기타 필터 (pill 스타일) ── */
function GradeBlocks({ counts, gradeFilter, setGradeFilter, colors, dark }) {
  if (!counts || counts.total === 0) return null

  const grades = [
    { key: 'S', label: 'S', color: GRADE_COLORS.S.bg, count: counts.S || 0 },
    { key: 'A', label: 'A', color: GRADE_COLORS.A.bg, count: counts.A || 0 },
    { key: 'D', label: 'D', color: GRADE_COLORS.D.bg, count: counts.D || 0 },
  ]
  const otherCount = counts.total - grades.reduce((s, g) => s + g.count, 0)
  if (otherCount > 0) grades.push({ key: 'etc', label: 'ETC', color: '#94A3B8', count: otherCount })

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {grades.map(g => {
        const isActive = g.key !== 'etc' && gradeFilter === g.key

        return (
          <button
            key={g.key}
            onClick={() => {
              if (g.key === 'etc') setGradeFilter(null)
              else setGradeFilter(gradeFilter === g.key ? null : g.key)
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '20px',
              border: isActive ? `2px solid ${g.color}` : `1px solid ${colors.border}`,
              backgroundColor: isActive ? g.color : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {/* Grade letter badge */}
            <span style={{
              width: '20px', height: '20px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 800, fontFamily: FONTS.mono,
              backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : (dark ? 'rgba(255,255,255,0.06)' : `${g.color}12`),
              color: isActive ? '#fff' : g.color,
            }}>
              {g.label.charAt(0)}
            </span>
            {/* Count */}
            <span style={{
              fontSize: '13px', fontWeight: 700, fontFamily: FONTS.mono,
              color: isActive ? '#fff' : colors.textPrimary,
            }}>
              {g.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ── SearchBar ── */
function SearchBar({ search, setSearch, colors, dark }) {
  const [searchInput, setSearchInput] = React.useState(search)
  const [focused, setFocused] = React.useState(false)

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); setSearch(searchInput) }}
      style={{
        display: 'flex', gap: '6px', marginBottom: '12px', width: '100%',
      }}
    >
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        borderRadius: '10px', padding: '0 12px',
        border: `1px solid ${focused ? PREMIUM.accent : colors.border}`,
        backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#FAFAFA',
        transition: 'border-color 0.15s, background-color 0.15s',
      }}>
        {/* Search icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="기업명 또는 공시 검색..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1, padding: '9px 8px', fontSize: '13px',
            border: 'none', backgroundColor: 'transparent',
            color: colors.textPrimary, outline: 'none',
          }}
        />
      </div>
      <button type="submit" style={{
        padding: '9px 18px', borderRadius: '10px', border: 'none',
        backgroundColor: PREMIUM.accent, color: '#fff',
        fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        flexShrink: 0, transition: 'opacity 0.15s',
      }}>
        검색
      </button>
    </form>
  )
}

/* ── TimeDivider: 오전/오후 구분선 ── */
function TimeDivider({ label, colors, dark }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '10px',
      padding: '6px 16px',
      backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
      borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'}`,
    }}>
      <span style={{
        fontSize: '10px', fontWeight: 700, color: colors.textMuted,
        fontFamily: FONTS.mono, letterSpacing: '0.06em',
        textTransform: 'uppercase', flexShrink: 0,
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', backgroundColor: colors.border, opacity: 0.5 }} />
    </div>
  )
}

/* ── HighlightCard: 오늘의 핵심 (S등급) ── */
function HighlightCard({ highlights, onViewCard, colors, dark }) {
  return (
    <div style={{
      backgroundColor: colors.bgCard,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      overflow: 'hidden',
      marginBottom: '16px',
    }}>
      {/* Title bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '12px 16px',
        backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FEF2F2',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#FECDD3'}`,
      }}>
        <span style={{
          width: '3px', height: '14px', backgroundColor: GRADE_COLORS.S.bg,
          borderRadius: '1.5px', display: 'inline-block',
        }} />
        <span style={{
          fontSize: '12px', fontWeight: 700, color: GRADE_COLORS.S.bg,
          fontFamily: FONTS.serif, letterSpacing: '-0.01em',
        }}>
          Key Highlights
        </span>
        <span style={{
          fontSize: '10px', fontWeight: 600, fontFamily: FONTS.mono,
          color: dark ? 'rgba(255,255,255,0.4)' : '#FDA4AF',
          marginLeft: 'auto',
        }}>
          S-GRADE
        </span>
      </div>

      {/* Items */}
      <div style={{ padding: '4px 0' }}>
        {highlights.map((d, i) => (
          <HighlightItem
            key={d.rcept_no}
            d={d}
            isLast={i === highlights.length - 1}
            onViewCard={onViewCard}
            colors={colors}
            dark={dark}
          />
        ))}
      </div>
    </div>
  )
}

function HighlightItem({ d, isLast, onViewCard, colors, dark }) {
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      onClick={() => onViewCard(d.corp_code)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', gap: '10px', padding: '10px 16px',
        cursor: 'pointer', transition: 'background-color 0.15s',
        backgroundColor: hovered ? (dark ? 'rgba(255,255,255,0.04)' : '#FFF5F5') : 'transparent',
        borderBottom: isLast ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#FEE2E2'}`,
      }}
    >
      {/* Left accent bar */}
      <div style={{
        width: '3px', borderRadius: '1.5px', backgroundColor: GRADE_COLORS.S.bg,
        flexShrink: 0, alignSelf: 'stretch', opacity: 0.6,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontWeight: 600, fontSize: '13px', color: colors.textPrimary,
          fontFamily: FONTS.serif, marginBottom: '2px', letterSpacing: '-0.01em',
        }}>
          {d.corp_name}
        </div>
        <div style={{
          fontSize: '11px', color: colors.textMuted,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {d.report_nm}
        </div>
      </div>
    </div>
  )
}

/* ── FeedRow: 공시 피드 행 ── */
function FeedRow({ d, delay, onViewCard, colors, dark }) {
  const [hovered, setHovered] = React.useState(false)
  const market = MARKET_LABELS[d.corp_cls] || ''
  const time = d.created_at ? d.created_at.substring(11, 16) : ''

  return (
    <div
      onClick={() => onViewCard(d.corp_code)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="animate-fade-in"
      style={{
        display: 'flex', gap: '10px', padding: '11px 16px',
        cursor: 'pointer', transition: 'background-color 0.15s ease',
        backgroundColor: hovered ? (dark ? 'rgba(255,255,255,0.04)' : '#F8F8FC') : 'transparent',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'}`,
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
          <span style={{
            fontWeight: 600, fontSize: '13px', color: colors.textPrimary,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}>
            {d.corp_name}
          </span>
          {market && (
            <span style={{
              fontSize: '9px', fontWeight: 600, padding: '1px 5px', borderRadius: '3px',
              backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
              color: colors.textMuted, letterSpacing: '0.02em',
            }}>{market}</span>
          )}
        </div>
        {/* Line 2: Filing name */}
        <div style={{
          fontSize: '11px', color: colors.textMuted,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          lineHeight: '1.4',
        }}>
          {d.report_nm}
        </div>
      </div>

      {/* Time + Stock code */}
      <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px', paddingTop: '2px' }}>
        {time && (
          <span style={{ fontSize: '11px', color: colors.textSecondary, fontFamily: FONTS.mono, fontWeight: 500 }}>
            {time}
          </span>
        )}
        {d.stock_code && (
          <span style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono, opacity: 0.5 }}>
            {d.stock_code}
          </span>
        )}
      </div>
    </div>
  )
}

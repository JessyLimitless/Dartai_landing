import React, { useState, useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'
import WEEKLY_EVENTS, { CURRENT_EVENTS, ARCHIVED_EVENTS } from '../data/weeklyEvents'

const TAG_COLORS = {
  'GLOBAL EVENT': { bg: 'rgba(220,38,38,0.10)', color: '#F87171', label: '글로벌' },
  'INDUSTRY': { bg: 'rgba(37,99,235,0.10)', color: '#60A5FA', label: '산업' },
  'MACRO': { bg: 'rgba(217,119,6,0.10)', color: '#FBBF24', label: '매크로' },
  'EARNINGS': { bg: 'rgba(22,163,74,0.10)', color: '#4ADE80', label: '실적' },
}

// **bold** → <strong>
function renderInline(text, primaryColor, mutedColor) {
  const parts = []
  const re = /\*\*(.+?)\*\*/g
  let idx = 0, match, lastEnd = 0
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastEnd) parts.push(<span key={`t${idx++}`} style={{ color: mutedColor }}>{text.slice(lastEnd, match.index)}</span>)
    parts.push(<strong key={`b${idx++}`} style={{ color: primaryColor, fontWeight: 600 }}>{match[1]}</strong>)
    lastEnd = match.index + match[0].length
  }
  if (lastEnd < text.length) parts.push(<span key={`t${idx++}`} style={{ color: mutedColor }}>{text.slice(lastEnd)}</span>)
  return parts.length > 0 ? parts : text
}

// 이벤트 날짜 파싱: '3/19(수)' → [19], '3/16(일)~19(수)' → [16,17,18,19]
function parseEventDays(dateStr) {
  const days = []
  // 범위: 3/16(일)~19(수) or 3/16(일)~20(금)
  const rangeMatch = dateStr.match(/(\d+)\/(\d+).*?~.*?(\d+)/)
  if (rangeMatch) {
    const from = parseInt(rangeMatch[2])
    const to = parseInt(rangeMatch[3])
    for (let d = from; d <= to; d++) days.push(d)
    return days
  }
  // 단일: 3/19(수)
  const singleMatch = dateStr.match(/(\d+)\/(\d+)/)
  if (singleMatch) days.push(parseInt(singleMatch[2]))
  return days
}

export default function DartEventPage() {
  const { colors, dark } = useTheme()
  const [selectedId, setSelectedId] = useState(CURRENT_EVENTS[0]?.id || null)
  const [showArchive, setShowArchive] = useState(false)
  const visibleEvents = showArchive ? WEEKLY_EVENTS : CURRENT_EVENTS
  const selected = WEEKLY_EVENTS.find(e => e.id === selectedId)

  // 캘린더 데이터: 모든 이벤트 (아카이브 포함) 표시
  const eventDayMap = useMemo(() => {
    const map = {} // day → [event]
    WEEKLY_EVENTS.forEach(ev => {
      const days = parseEventDays(ev.date)
      days.forEach(d => {
        if (!map[d]) map[d] = []
        map[d].push(ev)
      })
    })
    return map
  }, [])

  const c = {
    sep: dark ? '#1E1E22' : '#F0F0F2',
    cardBg: dark ? '#141416' : '#FFFFFF',
    pillBg: dark ? '#1A1A1E' : '#F4F4F5',
  }

  return (
    <div className="page-enter" style={{
      maxWidth: 1100, margin: '0 auto', padding: '0 20px 80px',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* ── 헤더 ── */}
      <div style={{ padding: '20px 4px 20px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>
          이벤트 캘린더
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
          글로벌 이벤트 일정과 투자 인사이트
        </div>
      </div>

      {/* ── 미니 캘린더 ── */}
      <MiniCalendar
        eventDayMap={eventDayMap}
        selectedId={selectedId}
        onSelectEvent={(id) => setSelectedId(id)}
        dark={dark}
        colors={colors}
        c={c}
      />

      {/* ── 2컬럼 레이아웃 ── */}
      <div className="event-grid" style={{
        display: 'grid', gridTemplateColumns: '320px 1fr',
        gap: 20, alignItems: 'start', marginTop: 20,
      }}>

        {/* 좌: 이벤트 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {visibleEvents.map((event) => {
            const active = selectedId === event.id
            const tc = TAG_COLORS[event.tag] || TAG_COLORS['GLOBAL EVENT']
            return (
              <div key={event.id} className="touch-press"
                onClick={() => setSelectedId(event.id)}
                style={{
                  padding: 16, borderRadius: 14, cursor: 'pointer',
                  border: `1px solid ${active ? PREMIUM.accent : c.sep}`,
                  background: active
                    ? (dark ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.02)')
                    : c.cardBg,
                  position: 'relative', overflow: 'hidden',
                  transition: 'all 0.15s',
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    width: 3, background: PREMIUM.accent, borderRadius: '14px 0 0 14px',
                  }} />
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                    background: tc.bg, color: tc.color,
                  }}>{tc.label}</span>
                  <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
                    {event.date}
                  </span>
                  {event.archived && (
                    <span style={{
                      fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                      background: dark ? '#27272A' : '#E4E4E7',
                      color: colors.textMuted, marginLeft: 4,
                    }}>지난주</span>
                  )}
                </div>
                <div style={{
                  fontSize: 15, fontWeight: 700, color: colors.textPrimary,
                  fontFamily: FONTS.serif, lineHeight: 1.4, marginBottom: 6,
                }}>{event.title}</div>
                <div style={{
                  fontSize: 12, color: colors.textMuted, lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>{event.summary}</div>
                <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
                  {event.impact.map(tag => (
                    <span key={tag} style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 6,
                      background: c.pillBg, color: colors.textMuted, fontWeight: 500,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            )
          })}
          {/* 아카이브 토글 */}
          {ARCHIVED_EVENTS.length > 0 && (
            <div
              className="touch-press"
              onClick={() => setShowArchive(!showArchive)}
              style={{
                padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                border: `1px dashed ${colors.textMuted}30`,
                textAlign: 'center', fontSize: 12, color: colors.textMuted,
                fontWeight: 500, marginTop: 4,
                background: showArchive ? (dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') : 'transparent',
              }}
            >
              {showArchive ? '지난 일정 숨기기 ▲' : `지난 일정 보기 (${ARCHIVED_EVENTS.length}건) ▼`}
            </div>
          )}
        </div>

        {/* 우: 인사이트 문서 */}
        <div style={{
          background: c.cardBg, border: `1px solid ${c.sep}`,
          borderRadius: 14, overflow: 'hidden',
        }}>
          {selected ? (
            <>
              <div style={{
                padding: '14px 24px', borderBottom: `1px solid ${c.sep}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FONTS.serif, color: colors.textPrimary }}>
                    DART <span style={{ color: PREMIUM.accent }}>Insight</span>
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                    padding: '2px 7px', borderRadius: 4,
                    background: 'rgba(220,38,38,0.10)', color: '#F87171',
                  }}>ANALYST BRIEF</span>
                </div>
                <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
                  {selected.week} | {selected.date}
                </span>
              </div>
              <div style={{ padding: '20px 24px 32px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
                <MarkdownRenderer content={selected.insight} />
              </div>
            </>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: colors.textMuted, fontSize: 14 }}>
              이벤트를 선택하세요
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .event-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}


// ══ 미니 캘린더 ══
function MiniCalendar({ eventDayMap, selectedId, onSelectEvent, dark, colors, c }) {
  const now = new Date()
  const year = 2026
  const month = 2 // March (0-indexed)
  const today = now.getDate()

  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']

  // 선택된 이벤트의 날짜들
  const selectedEvent = WEEKLY_EVENTS.find(e => e.id === selectedId)
  const selectedDays = selectedEvent ? new Set(parseEventDays(selectedEvent.date)) : new Set()

  const cells = []
  // 빈 셀 (월 시작 전)
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div style={{
      padding: '20px', borderRadius: 14,
      background: c.cardBg, border: `1px solid ${c.sep}`,
      margin: '0 4px',
    }}>
      {/* 월 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 16,
      }}>
        <span style={{
          fontSize: 16, fontWeight: 700, color: colors.textPrimary,
          fontFamily: FONTS.serif,
        }}>
          2026년 3월
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(TAG_COLORS).map(([key, tc]) => {
            const hasEvent = WEEKLY_EVENTS.some(e => e.tag === key)
            if (!hasEvent) return null
            return (
              <span key={key} style={{
                fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                background: tc.bg, color: tc.color,
              }}>{tc.label}</span>
            )
          })}
        </div>
      </div>

      {/* 요일 헤더 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2,
        marginBottom: 4,
      }}>
        {dayNames.map((d, i) => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 11, fontWeight: 600,
            color: i === 0 ? '#DC2626' : i === 6 ? '#2563EB' : colors.textMuted,
            padding: '4px 0',
          }}>{d}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2,
      }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />

          const events = eventDayMap[day] || []
          const hasEvent = events.length > 0
          const isSelected = selectedDays.has(day)
          const isToday = day === today
          const dayOfWeek = (firstDay + day - 1) % 7
          const isSun = dayOfWeek === 0
          const isSat = dayOfWeek === 6

          // 이벤트 날짜의 태그 색상 (첫 번째 이벤트 기준)
          const eventTag = hasEvent ? events[0].tag : null
          const eventColor = eventTag ? (TAG_COLORS[eventTag]?.color || '#F87171') : null

          return (
            <div
              key={day}
              onClick={() => {
                if (hasEvent) onSelectEvent(events[0].id)
              }}
              style={{
                position: 'relative',
                textAlign: 'center',
                padding: '8px 4px',
                borderRadius: 10,
                cursor: hasEvent ? 'pointer' : 'default',
                background: isSelected
                  ? (dark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.06)')
                  : 'transparent',
                border: isToday ? `1.5px solid ${PREMIUM.accent}` : '1.5px solid transparent',
                transition: 'all 0.12s',
              }}
            >
              <div style={{
                fontSize: 14, fontWeight: isSelected || isToday ? 700 : 400,
                fontFamily: FONTS.mono,
                color: isSelected ? PREMIUM.accent
                  : isToday ? PREMIUM.accent
                  : isSun ? '#DC2626'
                  : isSat ? '#2563EB'
                  : colors.textPrimary,
              }}>
                {day}
              </div>
              {/* 이벤트 도트 */}
              {hasEvent && (
                <div style={{
                  display: 'flex', gap: 2, justifyContent: 'center', marginTop: 3,
                }}>
                  {events.slice(0, 3).map((ev, ei) => {
                    const tc = TAG_COLORS[ev.tag] || TAG_COLORS['GLOBAL EVENT']
                    return (
                      <div key={ei} style={{
                        width: 5, height: 5, borderRadius: '50%',
                        background: tc.color,
                      }} />
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}


// ══ 마크다운 렌더러 ══
function MarkdownRenderer({ content }) {
  const { colors, dark } = useTheme()
  const lines = content.split('\n')
  const elements = []
  let tableRows = []
  let tableHeaders = []
  let inTable = false

  const clean = (text) => text.replace(/[\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{2B50}\u{2702}-\u{27B0}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '').trim()
  const renderCell = (text) => renderInline(text, colors.textPrimary, colors.textSecondary)

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={`tbl-${elements.length}`} style={{ overflowX: 'auto', margin: '14px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{tableHeaders.map((h, i) => (
                <th key={i} style={{
                  padding: '8px 12px', textAlign: 'left',
                  borderBottom: `2px solid ${dark ? '#27272A' : '#E4E4E7'}`,
                  color: colors.textMuted, fontWeight: 600, fontSize: 12,
                }}>{renderCell(h)}</th>
              ))}</tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '8px 12px',
                    borderBottom: `1px solid ${dark ? '#1E1E22' : '#F4F4F5'}`,
                    color: colors.textSecondary, fontSize: 13, lineHeight: 1.5,
                  }}>{renderCell(cell)}</td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    tableHeaders = []; tableRows = []; inTable = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').filter(c => c.trim()).map(c => c.trim())
      if (!inTable) { tableHeaders = cells; inTable = true; continue }
      if (cells.every(c => /^[-:]+$/.test(c))) continue
      tableRows.push(cells); continue
    } else if (inTable) { flushTable() }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontSize: 18, fontWeight: 800, fontFamily: FONTS.serif, color: colors.textPrimary, margin: '20px 0 10px', letterSpacing: -0.3 }}>{clean(line.slice(2))}</h1>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: 15, fontWeight: 700, fontFamily: FONTS.serif, color: colors.textPrimary, margin: '20px 0 8px', paddingTop: 12, borderTop: `1px solid ${dark ? '#27272A' : '#E4E4E7'}` }}>{clean(line.slice(3))}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: 14, fontWeight: 700, color: colors.textSecondary, margin: '14px 0 6px' }}>{clean(line.slice(4))}</h3>)
    } else if (line.startsWith('---')) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`, margin: '14px 0' }} />)
    } else if (line.startsWith('- **')) {
      const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/)
      if (match) {
        elements.push(
          <div key={i} style={{ display: 'flex', gap: 8, padding: '4px 0', fontSize: 13 }}>
            <span style={{ color: PREMIUM.accent, flexShrink: 0, lineHeight: 1.6 }}>•</span>
            <span style={{ lineHeight: 1.6 }}>
              <strong style={{ color: colors.textPrimary, fontWeight: 600 }}>{match[1]}</strong>
              <span style={{ color: colors.textMuted }}> {renderInline(match[2], colors.textPrimary, colors.textMuted)}</span>
            </span>
          </div>
        )
      }
    } else if (line.startsWith('- ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', fontSize: 13, color: colors.textMuted, lineHeight: 1.6 }}>
          <span style={{ flexShrink: 0 }}>•</span>
          <span>{renderInline(line.slice(2), colors.textPrimary, colors.textMuted)}</span>
        </div>
      )
    } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      elements.push(<p key={i} style={{ fontSize: 12, color: colors.textMuted, margin: '10px 0 0', fontStyle: 'italic' }}>{line.replace(/\*/g, '')}</p>)
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 4 }} />)
    } else {
      elements.push(<p key={i} style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.7, margin: '3px 0' }}>{renderInline(line, colors.textPrimary, colors.textMuted)}</p>)
    }
  }
  if (inTable) flushTable()
  return <>{elements}</>
}

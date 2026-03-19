import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'
import { API } from '../lib/api'

export default function BriefingPage() {
  const { colors, dark } = useTheme()
  const [briefings, setBriefings] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/briefings`)
      .then(r => r.json())
      .then(d => {
        const list = d.briefings || []
        setBriefings(list)
        if (list.length > 0) setSelected(list[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const lineSep = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* 헤더 */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>
          오늘의 브리핑
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
          매일 저녁 7시, 전문가가 해석한 핵심 공시
        </div>
      </div>

      {/* 미니 캘린더 */}
      <BriefingCalendar
        briefings={briefings}
        selectedId={selected?.id}
        onSelect={(b) => setSelected(b)}
        dark={dark} colors={colors}
      />

      {/* 콘텐츠 */}
      <div style={{ padding: '0 24px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 0' }}>
            {[80, 100, 60, 90, 70].map((w, i) => (
              <div key={i} style={{
                height: 16, width: `${w}%`, borderRadius: 8,
                background: dark ? '#1A1A1E' : '#F4F4F5',
                animation: 'pulse 1.4s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : !selected ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
              아직 브리핑이 없어요
            </div>
            <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>
              매일 저녁 7시에 전문가의 공시 해석이 업로드됩니다
            </div>
          </div>
        ) : (
          <div style={{ paddingTop: 8 }}>
            {/* 브리핑 헤더 */}
            <div style={{
              padding: '20px 0', borderBottom: `1px solid ${lineSep}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                  background: 'rgba(220,38,38,0.10)', color: '#DC2626',
                  letterSpacing: '0.05em',
                }}>DAILY BRIEF</span>
                <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono }}>
                  {selected.date_label}
                </span>
              </div>
              <h2 style={{
                fontSize: 20, fontWeight: 800, color: colors.textPrimary,
                fontFamily: FONTS.serif, margin: 0, lineHeight: 1.4,
              }}>
                {selected.title}
              </h2>
              {selected.summary && (
                <p style={{ fontSize: 14, color: colors.textMuted, marginTop: 8, lineHeight: 1.6 }}>
                  {selected.summary}
                </p>
              )}
            </div>

            {/* MD 본문 */}
            <div style={{ padding: '20px 0' }}>
              <MarkdownBody content={selected.content} colors={colors} dark={dark} />
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )
}


// ── 마크다운 렌더러 ──
function MarkdownBody({ content, colors, dark }) {
  if (!content) return null

  // 첫 번째 # 제목 + > 인용문은 헤더에서 이미 표시하므로 스킵
  let rawLines = content.split('\n')
  let startIdx = 0
  if (rawLines[0]?.startsWith('# ')) startIdx = 1
  // # 다음 빈 줄 + > 인용문 스킵
  while (startIdx < rawLines.length && (rawLines[startIdx].trim() === '' || rawLines[startIdx].startsWith('>'))) {
    startIdx++
  }
  const lines = rawLines.slice(startIdx)
  const elements = []
  let tableRows = []
  let tableHeaders = []
  let inTable = false

  const renderInline = (text) => {
    const parts = []
    let idx = 0, lastEnd = 0
    const re = /\*\*(.+?)\*\*/g
    let match
    while ((match = re.exec(text)) !== null) {
      if (match.index > lastEnd) parts.push(<span key={`t${idx++}`}>{text.slice(lastEnd, match.index)}</span>)
      parts.push(<strong key={`b${idx++}`} style={{ color: colors.textPrimary, fontWeight: 600 }}>{match[1]}</strong>)
      lastEnd = match.index + match[0].length
    }
    if (lastEnd < text.length) parts.push(<span key={`t${idx++}`}>{text.slice(lastEnd)}</span>)
    return parts.length > 0 ? parts : text
  }

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={`tbl-${elements.length}`} style={{
          overflowX: 'auto', margin: '18px 0',
          borderRadius: 10, border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{tableHeaders.map((h, i) => (
                <th key={i} style={{
                  padding: '10px 14px', textAlign: 'left',
                  borderBottom: `2px solid ${dark ? '#333' : '#D4D4D8'}`,
                  background: dark ? '#0F0F11' : '#FAFAFA',
                  color: colors.textMuted, fontWeight: 600, fontSize: 12,
                  letterSpacing: '0.02em',
                }}>{renderInline(h)}</th>
              ))}</tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '10px 14px',
                    borderBottom: ri < tableRows.length - 1 ? `1px solid ${dark ? '#1E1E22' : '#F4F4F5'}` : 'none',
                    color: colors.textSecondary, fontSize: 14, lineHeight: 1.6,
                  }}>{renderInline(cell)}</td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    tableHeaders = []; tableRows = []; inTable = false
  }

  // 이모지 정리
  const clean = (t) => t.replace(/[\u{1F300}-\u{1FAD6}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}\u{2B50}\u{2702}-\u{27B0}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}]/gu, '').trim()

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').filter(c => c.trim()).map(c => c.trim())
      if (!inTable) { tableHeaders = cells; inTable = true; continue }
      if (cells.every(c => /^[-:]+$/.test(c))) continue
      tableRows.push(cells); continue
    } else if (inTable) { flushTable() }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{
        fontSize: 22, fontWeight: 800, fontFamily: FONTS.serif,
        color: colors.textPrimary, margin: '32px 0 14px',
        letterSpacing: -0.3, lineHeight: 1.3,
      }}>{clean(line.slice(2))}</h1>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{
        fontSize: 18, fontWeight: 700, fontFamily: FONTS.serif,
        color: colors.textPrimary, margin: '28px 0 12px',
        paddingTop: 20, borderTop: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
        lineHeight: 1.3,
      }}>{clean(line.slice(3))}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{
        fontSize: 16, fontWeight: 700, color: colors.textPrimary,
        margin: '20px 0 8px', lineHeight: 1.4,
      }}>{clean(line.slice(4))}</h3>)
    } else if (line.startsWith('> ')) {
      // 인용문 블록
      elements.push(
        <div key={i} style={{
          borderLeft: `3px solid ${PREMIUM.accent}`,
          padding: '10px 16px', margin: '14px 0',
          background: dark ? 'rgba(220,38,38,0.04)' : 'rgba(220,38,38,0.03)',
          borderRadius: '0 8px 8px 0',
        }}>
          <span style={{
            fontSize: 14, color: colors.textPrimary, fontWeight: 500,
            lineHeight: 1.7, fontStyle: 'italic',
          }}>{renderInline(line.slice(2))}</span>
        </div>
      )
    } else if (line.startsWith('---')) {
      elements.push(<hr key={i} style={{
        border: 'none', borderTop: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
        margin: '24px 0',
      }} />)
    } else if (line.startsWith('- ')) {
      elements.push(
        <div key={i} style={{
          display: 'flex', gap: 10, padding: '4px 0',
          fontSize: 15, color: colors.textSecondary, lineHeight: 1.8,
        }}>
          <span style={{ color: PREMIUM.accent, flexShrink: 0, marginTop: 1 }}>•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      )
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 10 }} />)
    } else {
      elements.push(<p key={i} style={{
        fontSize: 15, color: colors.textSecondary,
        lineHeight: 1.9, margin: '6px 0',
        wordBreak: 'keep-all',
      }}>{renderInline(line)}</p>)
    }
  }
  if (inTable) flushTable()
  return <>{elements}</>
}


// ── 미니 캘린더 (세련화) ──
function BriefingCalendar({ briefings, selectedId, onSelect, dark, colors }) {
  const now = new Date()
  const kstNow = new Date(now.getTime() + 9 * 3600000)
  const year = kstNow.getUTCFullYear()
  const month = kstNow.getUTCMonth()
  const today = kstNow.getUTCDate()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const briefingMap = {}
  for (const b of briefings) {
    const d = parseInt(b.date_label?.slice(-2) || '0')
    if (d > 0) briefingMap[d] = b
  }

  const selectedDay = selectedId ? parseInt(selectedId.slice(-2) || '0') : 0
  const briefingCount = Object.keys(briefingMap).length

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div style={{
      margin: '16px 24px 0', padding: '16px 18px',
      borderRadius: 14,
      background: dark ? '#111113' : '#FFFFFF',
      border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.03)',
    }}>
      {/* 월 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontSize: 16, fontWeight: 800, color: colors.textPrimary,
            fontFamily: FONTS.serif,
          }}>{monthNames[month]}</span>
          <span style={{
            fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono,
          }}>{year}</span>
        </div>
        <span style={{
          fontSize: 11, color: '#DC2626', fontWeight: 600,
          background: 'rgba(220,38,38,0.08)', padding: '2px 8px', borderRadius: 10,
        }}>{briefingCount}건</span>
      </div>

      {/* 요일 헤더 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
        {dayNames.map((d, i) => (
          <div key={`h${i}`} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 700,
            color: i === 0 ? 'rgba(220,38,38,0.5)' : i === 6 ? 'rgba(37,99,235,0.5)' : colors.textMuted,
            padding: '2px 0', letterSpacing: '0.05em',
          }}>{d}</div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />

          const hasBriefing = !!briefingMap[day]
          const isSelected = day === selectedDay
          const isToday = day === today
          const dayOfWeek = (firstDay + day - 1) % 7
          const isPast = day < today

          return (
            <div key={day} className={hasBriefing ? 'touch-press' : ''}
              onClick={() => hasBriefing && onSelect(briefingMap[day])}
              style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '6px 2px', cursor: hasBriefing ? 'pointer' : 'default',
                borderRadius: 10,
                background: isSelected
                  ? '#DC2626'
                  : isToday
                    ? (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')
                    : 'transparent',
                transition: 'all 0.15s',
                minHeight: 36,
              }}>
              <span style={{
                fontSize: 13, fontFamily: FONTS.mono,
                fontWeight: isSelected || isToday || hasBriefing ? 700 : 400,
                color: isSelected ? '#FFFFFF'
                  : isToday ? '#DC2626'
                  : dayOfWeek === 0 ? '#DC2626'
                  : dayOfWeek === 6 ? '#2563EB'
                  : hasBriefing ? colors.textPrimary
                  : colors.textMuted,
                opacity: (!hasBriefing && !isToday && isPast) ? 0.3 : 1,
                lineHeight: 1,
              }}>{day}</span>
              {hasBriefing && !isSelected && (
                <div style={{
                  width: 4, height: 4, borderRadius: 2,
                  background: '#DC2626', marginTop: 3,
                }} />
              )}
              {hasBriefing && isSelected && (
                <div style={{
                  width: 4, height: 4, borderRadius: 2,
                  background: 'rgba(255,255,255,0.7)', marginTop: 3,
                }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

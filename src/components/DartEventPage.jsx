import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'
import WEEKLY_EVENTS from '../data/weeklyEvents'

// 간이 마크다운 렌더러
function MarkdownRenderer({ content }) {
  const { colors, dark } = useTheme()
  const lines = content.split('\n')
  const elements = []
  let tableRows = []
  let tableHeaders = []
  let inTable = false

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={`tbl-${elements.length}`} style={{ overflowX: 'auto', margin: '12px 0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr>{tableHeaders.map((h, i) => (
                <th key={i} style={{
                  padding: '8px 10px', textAlign: 'left',
                  borderBottom: `2px solid ${dark ? '#27272A' : '#E4E4E7'}`,
                  color: colors.textMuted, fontWeight: 600, fontSize: 11,
                }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '7px 10px',
                    borderBottom: `1px solid ${dark ? '#1E1E22' : '#F4F4F5'}`,
                    color: colors.textSecondary, fontSize: 12,
                  }}>{cell}</td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    tableHeaders = []
    tableRows = []
    inTable = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line.split('|').filter(c => c.trim()).map(c => c.trim())
      if (!inTable) { tableHeaders = cells; inTable = true; continue }
      if (cells.every(c => /^[-:]+$/.test(c))) continue
      tableRows.push(cells)
      continue
    } else if (inTable) { flushTable() }

    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} style={{ fontSize: 20, fontWeight: 700, fontFamily: FONTS.serif, color: colors.textPrimary, margin: '24px 0 12px' }}>{line.slice(2)}</h1>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: 16, fontWeight: 700, fontFamily: FONTS.serif, color: colors.textPrimary, margin: '20px 0 10px', paddingTop: 8, borderTop: `1px solid ${dark ? '#27272A' : '#E4E4E7'}` }}>{line.slice(3)}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: 14, fontWeight: 600, color: colors.textSecondary, margin: '16px 0 8px' }}>{line.slice(4)}</h3>)
    } else if (line.startsWith('---')) {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`, margin: '16px 0' }} />)
    } else if (line.startsWith('- **')) {
      const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/)
      if (match) {
        elements.push(
          <div key={i} style={{ display: 'flex', gap: 6, padding: '4px 0', fontSize: 13 }}>
            <span style={{ color: PREMIUM.accent, flexShrink: 0 }}>•</span>
            <span><strong style={{ color: colors.textPrimary }}>{match[1]}</strong><span style={{ color: colors.textMuted }}> {match[2]}</span></span>
          </div>
        )
      }
    } else if (line.startsWith('- ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0', fontSize: 13, color: colors.textMuted }}>
          <span style={{ color: colors.textMuted }}>•</span>
          <span>{line.slice(2)}</span>
        </div>
      )
    } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      elements.push(<p key={i} style={{ fontSize: 11, color: colors.textMuted, margin: '12px 0 0', fontStyle: 'italic' }}>{line.replace(/\*/g, '')}</p>)
    } else if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 6 }} />)
    } else {
      elements.push(<p key={i} style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.7, margin: '4px 0' }}>{line}</p>)
    }
  }
  if (inTable) flushTable()
  return <>{elements}</>
}

const TAG_COLORS = {
  'GLOBAL EVENT': { bg: 'rgba(220,38,38,0.12)', color: '#F87171' },
  'INDUSTRY': { bg: 'rgba(37,99,235,0.12)', color: '#60A5FA' },
  'MACRO': { bg: 'rgba(217,119,6,0.12)', color: '#FBBF24' },
  'EARNINGS': { bg: 'rgba(22,163,74,0.12)', color: '#4ADE80' },
}

export default function DartEventPage() {
  const { colors, dark } = useTheme()
  const [selectedId, setSelectedId] = useState(WEEKLY_EVENTS[0]?.id || null)

  const selected = WEEKLY_EVENTS.find(e => e.id === selectedId)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1 style={{
            fontSize: 22, fontWeight: 700, fontFamily: FONTS.serif,
            color: colors.textPrimary, margin: 0,
          }}>
            DART <span style={{ color: PREMIUM.accent }}>Insight</span>
          </h1>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
            padding: '2px 7px', borderRadius: 4,
            background: 'rgba(220,38,38,0.12)', color: '#F87171',
          }}>ANALYST BRIEF</span>
        </div>
        <p style={{ fontSize: 13, color: colors.textMuted, margin: 0 }}>
          글로벌 이벤트 → 국내 공급망 연결 → 공시 모니터링 체크리스트
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '320px 1fr',
        gap: 20,
        alignItems: 'start',
      }}>
        {/* 좌: 주간 이벤트 리스트 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {WEEKLY_EVENTS.map((event, idx) => {
            const active = selectedId === event.id
            const tc = TAG_COLORS[event.tag] || TAG_COLORS['GLOBAL EVENT']
            return (
              <div
                key={event.id}
                onClick={() => setSelectedId(event.id)}
                style={{
                  padding: '16px',
                  borderRadius: 12,
                  border: `1px solid ${active ? PREMIUM.accent : (dark ? 'rgba(255,255,255,0.06)' : '#E4E4E7')}`,
                  background: active
                    ? (dark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.03)')
                    : (dark ? 'rgba(255,255,255,0.02)' : '#fff'),
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* 좌측 악센트 바 */}
                {active && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, bottom: 0,
                    width: 3, background: PREMIUM.accent,
                    borderRadius: '12px 0 0 12px',
                  }} />
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
                    padding: '2px 6px', borderRadius: 3,
                    background: tc.bg, color: tc.color,
                  }}>{event.tag}</span>
                  <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
                    {event.weekRange}
                  </span>
                </div>

                <div style={{
                  fontSize: 15, fontWeight: 700, color: colors.textPrimary,
                  fontFamily: FONTS.serif, marginBottom: 6,
                  letterSpacing: '-0.01em',
                }}>
                  {event.title}
                </div>

                <div style={{
                  fontSize: 12, color: colors.textMuted,
                  lineHeight: 1.5,
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {event.summary}
                </div>

                {/* 영향 업종 태그 */}
                <div style={{ display: 'flex', gap: 4, marginTop: 10, flexWrap: 'wrap' }}>
                  {event.impact.map(tag => (
                    <span key={tag} style={{
                      fontSize: 10, padding: '2px 6px', borderRadius: 4,
                      background: dark ? 'rgba(255,255,255,0.05)' : '#F4F4F5',
                      color: colors.textMuted, fontWeight: 500,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* 우: 인사이트 문서 */}
        <div style={{
          background: dark ? 'rgba(255,255,255,0.02)' : '#fff',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#E4E4E7'}`,
          borderRadius: 14,
          overflow: 'hidden',
        }}>
          {selected ? (
            <>
              {/* 문서 헤더 */}
              <div style={{
                padding: '16px 24px',
                borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 13, fontWeight: 700, fontFamily: FONTS.serif,
                    color: colors.textPrimary,
                  }}>
                    DART <span style={{ color: PREMIUM.accent }}>Insight</span>
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                    padding: '2px 7px', borderRadius: 4,
                    background: 'rgba(220,38,38,0.12)', color: '#F87171',
                  }}>ANALYST BRIEF</span>
                </div>
                <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
                  {selected.week} | {selected.date}
                </span>
              </div>

              {/* 문서 본문 */}
              <div style={{ padding: '20px 24px 32px', maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' }}>
                <MarkdownRenderer content={selected.insight} />
              </div>
            </>
          ) : (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: colors.textMuted }}>
              이벤트를 선택하세요
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 320px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

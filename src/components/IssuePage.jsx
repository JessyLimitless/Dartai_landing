import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const ISSUES = [
  {
    id: 'korea-zinc',
    title: '고려아연 경영권 분쟁',
    subtitle: 'MBK+영풍 vs 최윤범 — 한국 증시 최대 지배구조 전쟁',
    status: 'LIVE',
    statusColor: '#DC2626',
    tag: '경영권 분쟁',
    tagColor: '#DC2626',
    lastUpdate: '2026.03.25',
    timeline: [
      { date: '2024.09', title: 'MBK+영풍, 공개매수 발표', desc: '주당 66만원, 지분 14.6% 목표. 경영권 분쟁 시작', signal: '시작' },
      { date: '2024.10', title: '최윤범 회장, 자사주 매입 방어', desc: '1조원+ 자사주 매입 결정. "경영권 방어" 명분', signal: '방어' },
      { date: '2024.11', title: '1차 공개매수 결과', desc: 'MBK+영풍 지분 확보. 경영권 확보에는 미달', signal: '교착' },
      { date: '2025.01', title: '임시주총 표 대결', desc: '이사회 구성 안건. 양측 위임장 대결', signal: '격화' },
      { date: '2025.06', title: '2차 공개매수 + 자사주 소각', desc: '양측 지분 확대 경쟁 지속', signal: '지속' },
      { date: '2026.03.25', title: '정기주주총회 결과 (오늘)', desc: '이사회 구성 최종 결정. 경영권 향방의 분수령', signal: '결정', highlight: true },
    ],
    analysis: `## 왜 중요한가

고려아연 경영권 분쟁은 **이벤트 드리븐 투자의 교과서**다. 2024년 9월 시작된 이 싸움에서 모든 공시가 주가를 움직였다.

- 공개매수 발표 → 주가 급등
- 자사주 매입 방어 → 하방 지지
- 주총 표 대결 → 변동성 극대화

## 핵심 이해관계

| 진영 | 목표 | 전략 |
|------|------|------|
| **MBK+영풍** | 경영권 확보 | 공개매수 + 위임장 대결 |
| **최윤범 회장** | 경영권 방어 | 자사주 매입 + 소각 + 우호 지분 확보 |

## 3/25 주총이 결정적인 이유

오늘 정기주총에서 **이사회 구성**이 결정된다. 이사회를 누가 장악하느냐가 곧 경영권이다.

- MBK 측 이사 선임 성공 → 경영권 교체 신호
- 최윤범 측 방어 성공 → 현 경영 체제 유지

## 투자자 관점

이 분쟁은 **아직 끝나지 않았다**. 주총 결과에 따라:
- 경영권 교체 시 → 구조조정, 자산 매각 가능 → 주가 재평가
- 현상 유지 시 → 자사주 소각 지속 → 주주환원 강화

**핵심: 공시를 추적하라. 이 싸움의 모든 수는 공시로 나온다.**`,
    insight: '경영권 분쟁 종목의 공시는 이벤트 드리븐의 최고 교재다 — 모든 수가 공시로 드러난다.',
  },
]

export default function IssuePage() {
  const { colors, dark } = useTheme()
  const [selectedId, setSelectedId] = useState(ISSUES[0]?.id || null)
  const selected = ISSUES.find(i => i.id === selectedId)

  const sep = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* 헤더 */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5, fontFamily: FONTS.serif }}>
          이슈 <span style={{ color: PREMIUM.accent }}>트래커</span>
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
          시장을 움직이는 이슈를 처음부터 끝까지 추적합니다
        </div>
      </div>

      {/* 이슈 카드 리스트 */}
      <div style={{ padding: '20px 24px 0' }}>
        {ISSUES.map((issue) => {
          const active = selectedId === issue.id
          return (
            <div key={issue.id} className="touch-press"
              onClick={() => setSelectedId(issue.id)}
              style={{
                padding: '18px 20px', borderRadius: 16, cursor: 'pointer',
                marginBottom: 12,
                background: active
                  ? (dark ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.03)')
                  : (dark ? '#141416' : '#fff'),
                border: `1px solid ${active ? 'rgba(220,38,38,0.15)' : sep}`,
                transition: 'all 0.2s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 4,
                  background: issue.statusColor, color: '#fff', letterSpacing: '0.05em',
                }}>{issue.status}</span>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                  background: `${issue.tagColor}15`, color: issue.tagColor,
                }}>{issue.tag}</span>
                <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono, marginLeft: 'auto' }}>
                  {issue.lastUpdate}
                </span>
              </div>
              <div style={{
                fontSize: 17, fontWeight: 800, color: colors.textPrimary,
                fontFamily: FONTS.serif, letterSpacing: '-0.3px', marginBottom: 4,
              }}>{issue.title}</div>
              <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>
                {issue.subtitle}
              </div>
            </div>
          )
        })}
      </div>

      {/* 선택된 이슈 상세 */}
      {selected && (
        <div style={{ padding: '0 24px' }}>

          {/* 타임라인 */}
          <div style={{
            padding: '20px', borderRadius: 16,
            background: dark ? '#141416' : '#fff',
            border: `1px solid ${sep}`,
            marginBottom: 16,
          }}>
            <div style={{
              fontSize: 14, fontWeight: 700, color: colors.textPrimary,
              fontFamily: FONTS.serif, marginBottom: 16,
            }}>타임라인</div>
            {selected.timeline.map((event, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14, marginBottom: i < selected.timeline.length - 1 ? 16 : 0,
                position: 'relative',
              }}>
                {/* 세로선 */}
                {i < selected.timeline.length - 1 && (
                  <div style={{
                    position: 'absolute', left: 5, top: 14, bottom: -16,
                    width: 1, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                  }} />
                )}
                {/* 점 */}
                <div style={{
                  width: 11, height: 11, borderRadius: '50%', flexShrink: 0, marginTop: 3,
                  background: event.highlight ? PREMIUM.accent : (dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'),
                  boxShadow: event.highlight ? '0 0 8px rgba(220,38,38,0.4)' : 'none',
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>{event.date}</span>
                    <span style={{
                      fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                      background: event.highlight ? `${PREMIUM.accent}15` : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                      color: event.highlight ? PREMIUM.accent : colors.textMuted,
                    }}>{event.signal}</span>
                  </div>
                  <div style={{
                    fontSize: 14, fontWeight: event.highlight ? 700 : 600,
                    color: event.highlight ? PREMIUM.accent : colors.textPrimary,
                    fontFamily: FONTS.serif, marginBottom: 2,
                  }}>{event.title}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.5 }}>
                    {event.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 분석 본문 */}
          <div style={{
            padding: '20px', borderRadius: 16,
            background: dark ? '#141416' : '#fff',
            border: `1px solid ${sep}`,
            marginBottom: 16,
          }}>
            <IssueMarkdown content={selected.analysis} colors={colors} dark={dark} />
          </div>

          {/* 인사이트 */}
          <div style={{
            padding: '16px 20px', borderRadius: 14,
            borderLeft: `3px solid ${PREMIUM.accent}`,
            background: dark ? 'rgba(220,38,38,0.04)' : 'rgba(220,38,38,0.02)',
            fontSize: 14, fontStyle: 'italic', color: colors.textSecondary,
            lineHeight: 1.6, fontFamily: FONTS.serif,
          }}>
            {selected.insight}
          </div>
        </div>
      )}
    </div>
  )
}


function IssueMarkdown({ content, colors, dark }) {
  if (!content) return null
  const lines = content.split('\n')
  const elements = []
  let tableRows = []
  let tableHeaders = []
  let inTable = false
  let key = 0

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
        <div key={`tbl-${key++}`} style={{
          overflowX: 'auto', margin: '12px 0',
          borderRadius: 10, border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{tableHeaders.map((h, i) => (
                <th key={i} style={{
                  padding: '8px 12px', textAlign: 'left',
                  borderBottom: `2px solid ${dark ? '#333' : '#D4D4D8'}`,
                  background: dark ? '#0F0F11' : '#FAFAFA',
                  color: colors.textMuted, fontWeight: 600, fontSize: 11,
                }}>{renderInline(h)}</th>
              ))}</tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '7px 12px',
                    borderBottom: `1px solid ${dark ? '#1E1E22' : '#F0F0F2'}`,
                    color: colors.textSecondary, fontSize: 12,
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

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim())
      if (cells.every(c => /^[-:]+$/.test(c))) continue
      if (!inTable) { tableHeaders = cells; inTable = true } else { tableRows.push(cells) }
      continue
    }
    if (inTable) flushTable()
    if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={key++} style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, fontFamily: FONTS.serif, margin: '20px 0 10px' }}>{renderInline(trimmed.replace(/^##\s*/, ''))}</h2>)
      continue
    }
    if (trimmed.startsWith('- ')) {
      elements.push(<div key={key++} style={{ display: 'flex', gap: 8, margin: '4px 0', fontSize: 13, color: colors.textSecondary, lineHeight: 1.6 }}><span style={{ color: PREMIUM.accent }}>•</span><span>{renderInline(trimmed.replace(/^-\s*/, ''))}</span></div>)
      continue
    }
    if (!trimmed) continue
    elements.push(<p key={key++} style={{ margin: '6px 0', fontSize: 13.5, lineHeight: 1.7, color: colors.textSecondary }}>{renderInline(trimmed)}</p>)
  }
  if (inTable) flushTable()
  return <>{elements}</>
}

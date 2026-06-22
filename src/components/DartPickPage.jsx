import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'
import { MarkdownBody } from './BriefingPage'

const GRADE_COLOR = { S: '#E8364E', A: '#0D9488', B: '#6B7280', D: '#DC2626' }

export default function DartPickPage() {
  const { colors, dark } = useTheme()
  const [pick, setPick] = useState(null)
  const [archive, setArchive] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/pick/today`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/pick/list`).then(r => r.json()).catch(() => null),
    ])
      .then(([today, list]) => {
        // flat 구조({corp_name,...}) 또는 {pick:{...}} 모두 대응
        const p = today && today.corp_name ? today : (today && today.pick) || null
        setPick(p)
        const all = (list && Array.isArray(list.picks)) ? list.picks : []
        // 오늘(featured) 픽과 같은 날짜는 아카이브에서 제외
        const rest = p ? all.filter(it => it.date !== p.date) : all
        setArchive(rest)
      })
      .finally(() => setLoading(false))
  }, [])

  const lineSep = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const accent = '#DC2626'

  return (
    <div className="page-enter" style={{
      maxWidth: 720, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>
      {/* 헤더 */}
      <div className="bp-pad" style={{ paddingTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, color: '#fff', background: accent,
            padding: '3px 8px', borderRadius: 6, letterSpacing: '0.04em',
          }}>DART 픽</span>
          <span style={{ fontSize: 13, color: colors.textMuted }}>매일 아침, 단 하나의 상승 시그널 종목</span>
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 8, lineHeight: 1.6 }}>
          800여 건 공시 + 미국 AI 섹터를 한 깔때기에 넣어 <b style={{ color: colors.textSecondary }}>단 하나</b>로 좁힙니다.
        </div>
      </div>

      <div className="bp-pad">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 0' }}>
            {[70, 100, 55, 90].map((w, i) => (
              <div key={i} style={{
                height: 16, width: `${w}%`, borderRadius: 8,
                background: dark ? '#1A1A1E' : '#F4F4F5',
                animation: 'pulse 1.4s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : !pick ? (
          <EmptyState colors={colors} />
        ) : (
          <div>
            {/* 종목 헤더 카드 */}
            <div style={{
              marginTop: 20, padding: '18px 18px',
              borderRadius: 16, border: `1px solid ${lineSep}`,
              background: dark ? '#1416' : '#FFF',
              boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {pick.grade && (
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: '#fff',
                    background: GRADE_COLOR[pick.grade] || '#6B7280',
                    padding: '2px 7px', borderRadius: 5,
                  }}>{pick.grade}</span>
                )}
                <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono }}>{pick.date}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>
                {pick.corp_name}
                <span style={{ fontSize: 14, color: colors.textMuted, fontWeight: 600, marginLeft: 8, fontFamily: FONTS.mono }}>
                  {pick.stock_code}
                </span>
              </div>
              {pick.reason && (
                <div style={{
                  fontSize: 14, color: colors.textSecondary, marginTop: 10, lineHeight: 1.6,
                  paddingTop: 10, borderTop: `1px solid ${lineSep}`,
                }}>
                  {pick.reason}
                </div>
              )}
            </div>

            {/* 본문 (선정 깔때기) */}
            {pick.detail && (
              <div style={{ padding: '12px 0 8px' }}>
                <MarkdownBody content={pick.detail} colors={colors} dark={dark} />
              </div>
            )}
          </div>
        )}

        {/* 지난 픽 아카이브 */}
        {!loading && archive.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{
              fontSize: 13, fontWeight: 800, color: colors.textSecondary,
              letterSpacing: '0.02em', marginBottom: 4, paddingTop: 16,
              borderTop: `1px solid ${lineSep}`,
            }}>
              지난 픽
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12 }}>
              날짜를 누르면 그날의 선정 깔때기를 펼쳐 봅니다.
            </div>
            {archive.map(item => (
              <ArchiveItem key={item.date} item={item} colors={colors} dark={dark} lineSep={lineSep} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ArchiveItem({ item, colors, dark, lineSep }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderRadius: 12, border: `1px solid ${lineSep}`,
      background: dark ? '#141416' : '#FFF', marginBottom: 8, overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 14px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        {item.grade && (
          <span style={{
            fontSize: 10, fontWeight: 800, color: '#fff',
            background: GRADE_COLOR[item.grade] || '#6B7280',
            padding: '2px 6px', borderRadius: 4, flexShrink: 0,
          }}>{item.grade}</span>
        )}
        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono, flexShrink: 0 }}>{item.date}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, flexShrink: 0 }}>{item.corp_name}</span>
        {item.reason && (
          <span style={{
            fontSize: 12, color: colors.textMuted, marginLeft: 4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{item.reason}</span>
        )}
        <span style={{
          marginLeft: 'auto', fontSize: 12, color: colors.textMuted, flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s',
        }}>▾</span>
      </button>
      {open && item.detail && (
        <div style={{ padding: '0 14px 16px', borderTop: `1px solid ${lineSep}` }}>
          <MarkdownBody content={item.detail} colors={colors} dark={dark} />
        </div>
      )}
    </div>
  )
}

function EmptyState({ colors }) {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
        오늘의 픽이 아직 없어요
      </div>
      <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>
        매일 아침, 공시·미국 시그널을 종합한 단 하나의 상승 시그널 종목을 선정합니다.
      </div>
    </div>
  )
}

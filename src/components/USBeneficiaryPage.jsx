import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'
import { MarkdownBody, LoginGate } from './BriefingPage'

export default function USBeneficiaryPage() {
  const { colors, dark } = useTheme()
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  // 베타: 로그인(구독자) 전용
  const isLoggedIn = (() => {
    try { return !!JSON.parse(localStorage.getItem('dart_user'))?.email } catch { return false }
  })()

  useEffect(() => {
    fetch(`${API}/api/us-beneficiary/cards`)
      .then(r => r.json())
      .then(d => {
        const list = d.cards || []
        setCards(list)
        if (list.length > 0) setSelected(list[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const lineSep = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  if (!isLoggedIn) return <LoginGate dark={dark} colors={colors} />

  return (
    <div className="page-enter" style={{
      maxWidth: 720, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>
      {/* 헤더 */}
      <div className="bp-pad" style={{ paddingTop: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>
          미국장 브리핑
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
          美 신호 → 韓 수혜주 · 매일 오전 발행
        </div>
      </div>

      {/* 아카이브 날짜칩 — 6/15부터 일자별 누적 */}
      {!loading && cards.length > 1 && (
        <div className="bp-pad" style={{
          display: 'flex', gap: 8, overflowX: 'auto', paddingTop: 16, paddingBottom: 4,
        }}>
          {cards.map((c) => {
            const isSel = selected?.id === c.id
            return (
              <button key={c.id} onClick={() => setSelected(c)} style={{
                flexShrink: 0, padding: '6px 14px', borderRadius: 20,
                border: `1px solid ${isSel ? '#DC2626' : lineSep}`,
                background: isSel ? '#DC2626' : 'transparent',
                color: isSel ? '#fff' : colors.textMuted,
                fontSize: 12, fontWeight: 600, fontFamily: FONTS.mono,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}>{c.date_label}</button>
            )
          })}
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="bp-pad">
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
          <EmptyState colors={colors} />
        ) : (
          <div>
            {/* 제목 + 요약 */}
            <div style={{ padding: '24px 0 12px', borderBottom: `1px solid ${lineSep}` }}>
              <div style={{
                fontSize: 20, fontWeight: 800, color: colors.textPrimary,
                lineHeight: 1.35, letterSpacing: -0.3,
              }}>
                {selected.title}
              </div>
              {selected.summary && (
                <div style={{
                  fontSize: 14, color: colors.textMuted, marginTop: 8, lineHeight: 1.6,
                }}>
                  {selected.summary}
                </div>
              )}
            </div>

            {/* 본문 (마크다운) */}
            <div style={{ padding: '12px 0 32px' }}>
              <MarkdownBody content={selected.content} colors={colors} dark={dark} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EmptyState({ colors }) {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
        아직 카드가 없어요
      </div>
      <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>
        매일 오전, 미국 특징주 → 한국 수혜주 인과 사슬 카드가 발행됩니다.
      </div>
    </div>
  )
}

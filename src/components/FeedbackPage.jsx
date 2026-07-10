import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'
import { MarkdownBody } from './BriefingPage'
import PickScorecard from './PickScorecard'

// 공시 피드백(채점) 코너 — 어제 브리핑 메뉴를 다음 장 시세로 채점.
// 브리핑과 별도 엔드포인트(/api/feedback)·별도 날짜 슬롯이라 같은 날에 공존.
export default function FeedbackPage() {
  const { colors, dark } = useTheme()
  const [cards, setCards] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pickScores, setPickScores] = useState(null)

  useEffect(() => {
    fetch(`${API}/api/feedback`)
      .then(r => r.json())
      .then(d => {
        const list = d.cards || []
        setCards(list)
        if (list.length > 0) setSelected(list[0])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
    // DART 픽 성적표 — 선정 후 시세 추적 + 요인 분해 (키움 실측)
    fetch(`${API}/api/pick/feedback`).then(r => r.json())
      .then(d => setPickScores(d && Array.isArray(d.picks) ? d : null))
      .catch(() => setPickScores(null))
  }, [])

  const lineSep = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* 헤더 */}
      <div className="bp-pad" style={{ paddingTop: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>
          픽 채점
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
          어제 브리핑 메뉴, 다음 장에서 맞았나 — 매일 시세로 직접 채점
        </div>
      </div>

      {/* DART 픽 성적표 — 선정 후 시세 추적 + 요인 분해 */}
      {pickScores && pickScores.picks && pickScores.picks.length > 0 && (
        <div className="bp-pad">
          <PickScorecard data={pickScores} colors={colors} dark={dark} lineSep={lineSep} defaultOpen={true} />
        </div>
      )}

      {/* 날짜 탭 (가로 스크롤) */}
      {cards.length > 0 && (
        <div style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '16px 24px 4px',
          WebkitOverflowScrolling: 'touch',
        }}>
          {cards.map((c) => {
            const isSel = c.id === selected?.id
            return (
              <button key={c.id} onClick={() => setSelected(c)} style={{
                flexShrink: 0, padding: '8px 14px', borderRadius: 10,
                border: `1px solid ${isSel ? '#0D9488' : (dark ? '#27272A' : '#E4E4E7')}`,
                background: isSel ? '#0D9488' : 'transparent',
                color: isSel ? '#FFFFFF' : colors.textMuted,
                fontSize: 13, fontWeight: isSel ? 700 : 500, cursor: 'pointer',
                fontFamily: FONTS.mono, whiteSpace: 'nowrap',
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
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
              아직 채점 기록이 없어요
            </div>
            <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>
              브리핑 다음 날, 시세로 채점한 결과가 올라옵니다
            </div>
          </div>
        ) : (
          <div style={{ paddingTop: 8 }}>
            {/* 채점 헤더 */}
            <div style={{ padding: '20px 0', borderBottom: `1px solid ${lineSep}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                  background: 'rgba(13,148,136,0.12)', color: '#0D9488',
                  letterSpacing: '0.05em',
                }}>SCORING</span>
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

            {/* MD 본문 — 브리핑과 동일 렌더러 재사용 */}
            <div style={{ padding: '20px 0' }}>
              <MarkdownBody content={selected.content} colors={colors} dark={dark} />
            </div>
          </div>
        )}
      </div>

      {!loading && (
        <div className="bp-pad" style={{ paddingBottom: 32 }}>
          <div style={{ borderTop: `1px solid ${lineSep}`, paddingTop: 20 }}></div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )
}

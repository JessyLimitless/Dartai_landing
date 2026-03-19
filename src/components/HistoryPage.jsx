import React, { useState, useEffect, useCallback } from 'react'
import DisclosureModal from './DisclosureModal'
import { FONTS, GRADE_COLORS } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'
import { API } from '../lib/api'

function getDateRange(days) {
  const today = new Date()
  const from = new Date(today)
  from.setDate(today.getDate() - days)
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { from: fmt(from), to: fmt(today) }
}
function getDateKey(iso) { return iso ? iso.slice(0, 10) : '' }

function useRecentTracks(days) {
  const [data, setData] = useState({ tracks: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const load = useCallback(async () => {
    try {
      const { from, to } = getDateRange(days * 2)
      const res = await fetch(`${API}/api/price-tracks/history?from_date=${from}&to_date=${to}`)
      if (!res.ok) return
      const d = await res.json()
      let tracks = d.tracks || []
      const tradingDates = [...new Set(tracks.map(t => getDateKey(t.created_at)).filter(Boolean))].sort().reverse()
      const recentDates = new Set(tradingDates.slice(0, days))
      tracks = tracks.filter(t => recentDates.has(getDateKey(t.created_at)))
      setData({ tracks, total: tracks.length })
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [days])
  useEffect(() => { setLoading(true); load() }, [load])
  return { ...data, loading }
}

function pctColor(v) {
  if (v == null) return '#A1A1AA'
  return v > 0 ? '#DC2626' : v < 0 ? '#2563EB' : '#71717A'
}
function fmtPct(v) {
  if (v == null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

export default function HistoryPage({ onViewCard }) {
  const { colors, dark } = useTheme()
  const days = 5 // 최근 5거래일 고정
  const [direction, setDirection] = useState('up')
  const [showAll, setShowAll] = useState(false)
  const [modalRceptNo, setModalRceptNo] = useState(null)
  const recent = useRecentTracks(days)

  // change_5d 우선, 없으면 change_close 폴백
  const getChange = (t) => t.change_5d ?? t.change_close
  const withChange = [...recent.tracks].filter(t => getChange(t) != null)
  const upRanked = withChange.filter(t => getChange(t) > 0).sort((a, b) => getChange(b) - getChange(a))
  const downRanked = withChange.filter(t => getChange(t) < 0).sort((a, b) => getChange(a) - getChange(b))

  // S등급 적중률 (공시 후 상승 비율)
  const sGrade = withChange.filter(t => t.grade === 'S')
  const sHitRate = sGrade.length > 0
    ? Math.round(sGrade.filter(t => getChange(t) > 0).length / sGrade.length * 100)
    : null
  const totalHitRate = withChange.length > 0
    ? Math.round(upRanked.length / withChange.length * 100)
    : 0

  const activeList = direction === 'up' ? upRanked : downRanked
  const accentColor = direction === 'up' ? '#DC2626' : '#2563EB'
  const visibleItems = showAll ? activeList.slice(0, 30) : activeList.slice(0, 10)
  const lineSep = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

  return (
    <div className="page-enter hist-page" style={{
      maxWidth: 640, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* ── 히어로: 적중률 ── */}
      <div className="hist-pad" style={{ paddingTop: 24 }}>
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 8 }}>
          공시 후 5거래일 상승 적중률
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <div className="hist-hero-num" style={{
            fontWeight: 800, fontFamily: FONTS.mono,
            color: totalHitRate >= 50 ? '#DC2626' : '#2563EB',
            letterSpacing: -1.5, lineHeight: 1,
          }}>{totalHitRate}%</div>
          {sHitRate !== null && (
            <span style={{ fontSize: 14, color: colors.textMuted }}>
              S등급 <span style={{ fontWeight: 700, color: sHitRate >= 50 ? '#DC2626' : '#2563EB', fontFamily: FONTS.mono }}>{sHitRate}%</span>
            </span>
          )}
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 8 }}>
          최근 5거래일 · {withChange.length}건 중 {upRanked.length}건 상승
        </div>
      </div>

      {/* ── 섹션 타이틀 ── */}
      <div className="hist-pad" style={{ paddingTop: 28 }}>
        <div className="hist-section-title" style={{ fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.3 }}>
          공시 후 주가 변동 TOP
        </div>
      </div>

      {/* 구분선 */}
      <div style={{ borderBottom: `1px solid ${lineSep}`, marginTop: 16 }} />

      {/* ── pill 토글 ── */}
      <div className="hist-pad" style={{ paddingTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'inline-flex', borderRadius: 24,
          background: dark ? '#1A1A1E' : '#F4F4F5', padding: 3,
        }}>
          {[
            { key: 'up', label: '상승', color: '#DC2626' },
            { key: 'down', label: '하락', color: '#2563EB' },
          ].map(btn => {
            const active = direction === btn.key
            return (
              <button key={btn.key} className="touch-press"
                onClick={() => { setDirection(btn.key); setShowAll(false) }}
                style={{
                  padding: '8px 20px', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: active ? 700 : 500, minHeight: 40,
                  background: active ? (dark ? '#2A2A2E' : '#FFFFFF') : 'transparent',
                  color: active ? btn.color : colors.textMuted,
                  borderRadius: 22,
                  boxShadow: active ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.15s',
                }}>{btn.label}</button>
            )
          })}
        </div>
        <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: FONTS.mono }}>
          {activeList.length}건
        </span>
      </div>

      {/* ── 리스트 ── */}
      <div className="hist-pad" style={{ paddingTop: 4 }}>
        {recent.loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '20px 0' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{
                height: 72, borderRadius: 12,
                background: dark ? '#18181B' : '#F4F4F5',
                animation: 'pulse 1.4s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : activeList.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center' }}>
            <div style={{ fontSize: 15, color: colors.textPrimary, fontWeight: 600, marginBottom: 6 }}>
              {direction === 'up' ? '상승 종목이 없어요' : '하락 종목이 없어요'}
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.6 }}>
              S/A/D 등급 공시가 발생하면 자동으로 주가를 추적해요
            </div>
          </div>
        ) : (
          <>
            {visibleItems.map((t, i) => {
              const gc = GRADE_COLORS[t.grade] || { bg: '#A1A1AA', color: '#fff' }
              const change = t.change_5d ?? t.change_close ?? 0
              const is5d = t.change_5d != null
              const dt = t.created_at ? new Date(t.created_at) : null
              const dateLabel = dt ? `${dt.getMonth() + 1}.${dt.getDate()}` : ''

              return (
                <div key={t.rcept_no || i} className="touch-press hist-row"
                  onClick={() => setModalRceptNo(t.rcept_no)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '18px 0', cursor: 'pointer',
                    borderBottom: i < visibleItems.length - 1 ? `1px solid ${lineSep}` : 'none',
                    minHeight: 64,
                  }}>

                  <span className="hist-rank" style={{
                    fontWeight: 700, fontFamily: FONTS.mono,
                    color: accentColor, textAlign: 'right',
                  }}>{i + 1}</span>

                  <div className="hist-badge" style={{
                    borderRadius: '50%', flexShrink: 0,
                    background: gc.bg, color: gc.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontFamily: FONTS.mono,
                  }}>{t.grade}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="hist-corp" style={{
                      fontWeight: 700, color: colors.textPrimary,
                      fontFamily: FONTS.serif,
                    }}>{t.corp_name}</div>
                    <div className="hist-sub" style={{
                      color: colors.textMuted, marginTop: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {t.report_nm}
                      {dateLabel && <span style={{ fontFamily: FONTS.mono, marginLeft: 6 }}>{dateLabel}</span>}
                    </div>
                  </div>

                  <span className="hist-right-num" style={{
                    fontWeight: 700, fontFamily: FONTS.mono,
                    color: accentColor, flexShrink: 0, letterSpacing: -0.5,
                  }}>
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </span>
                </div>
              )
            })}

            {!showAll && activeList.length > 10 && (
              <button className="touch-press" onClick={() => setShowAll(true)} style={{
                width: '100%', padding: '18px 0', border: 'none',
                background: 'transparent', cursor: 'pointer',
                fontSize: 15, fontWeight: 600, color: colors.textSecondary,
                borderTop: `1px solid ${lineSep}`, minHeight: 52,
              }}>더 보기</button>
            )}
          </>
        )}
      </div>

      {modalRceptNo && (
        <DisclosureModal rcept_no={modalRceptNo} onClose={() => setModalRceptNo(null)} onViewCard={onViewCard} />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        .hist-pad { padding-left: 24px; padding-right: 24px; }
        .hist-hero-num { font-size: 40px; }
        .hist-section-title { font-size: 20px; }
        .hist-row { gap: 16px; }
        .hist-rank { font-size: 17px; min-width: 24px; display: inline-block; }
        .hist-badge { width: 48px; height: 48px; font-size: 16px; }
        .hist-corp { font-size: 17px; }
        .hist-sub { font-size: 13px; }
        .hist-right-num { font-size: 18px; }

        @media (max-width: 768px) {
          .hist-pad { padding-left: 20px; padding-right: 20px; }
        }

        @media (max-width: 480px) {
          .hist-pad { padding-left: 16px; padding-right: 16px; }
          .hist-hero-num { font-size: 34px; }
          .hist-section-title { font-size: 18px; }
          .hist-row { gap: 10px; }
          .hist-rank { font-size: 14px; min-width: 18px; }
          .hist-badge { width: 40px; height: 40px; font-size: 14px; }
          .hist-corp { font-size: 15px; }
          .hist-sub { font-size: 12px; }
          .hist-right-num { font-size: 15px; }
        }

        @media (max-width: 360px) {
          .hist-pad { padding-left: 12px; padding-right: 12px; }
          .hist-rank { display: none; }
          .hist-badge { width: 36px; height: 36px; font-size: 13px; }
          .hist-corp { font-size: 14px; }
          .hist-right-num { font-size: 14px; }
        }
      `}</style>
    </div>
  )
}

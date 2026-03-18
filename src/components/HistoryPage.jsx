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
  if (v > 0) return '#DC2626'
  if (v < 0) return '#2563EB'
  return '#71717A'
}

function fmtPct(v) {
  if (v == null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

const PERIODS = [
  { key: 5, label: '5일' },
  { key: 10, label: '10일' },
  { key: 20, label: '1개월' },
]

export default function HistoryPage({ onViewCard }) {
  const { colors, dark } = useTheme()
  const [days, setDays] = useState(5)
  const [direction, setDirection] = useState('up')
  const [showAll, setShowAll] = useState(false)
  const [modalRceptNo, setModalRceptNo] = useState(null)
  const recent = useRecentTracks(days)

  const withChange = [...recent.tracks].filter(t => t.change_close != null)
  const upRanked = withChange.filter(t => t.change_close > 0).sort((a, b) => b.change_close - a.change_close)
  const downRanked = withChange.filter(t => t.change_close < 0).sort((a, b) => a.change_close - b.change_close)

  const avgChange = recent.total > 0
    ? recent.tracks.reduce((s, t) => s + (t.change_close ?? 0), 0) / recent.total : 0

  const activeList = direction === 'up' ? upRanked : downRanked
  const accentColor = direction === 'up' ? '#DC2626' : '#2563EB'
  const visibleItems = showAll ? activeList.slice(0, 30) : activeList.slice(0, 10)

  const sep = dark ? '#1E1E22' : '#F4F4F5'

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto', padding: '0 0 100px',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* ── 히어로: 평균 수익률 ── */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 8 }}>
          공시 후 종가 기준 평균 수익률
        </div>
        <div style={{
          fontSize: 36, fontWeight: 800, fontFamily: FONTS.mono,
          color: pctColor(avgChange), letterSpacing: -1, lineHeight: 1,
        }}>{fmtPct(avgChange)}</div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 8 }}>
          최근 {days === 20 ? '1개월' : `${days}일`} · {recent.total}건 추적
        </div>
      </div>

      {/* ── 섹션 타이틀 (토스 스타일) ── */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ fontSize: 19, fontWeight: 800, color: colors.textPrimary }}>
          공시 후 주가 변동 TOP
        </div>
      </div>

      {/* ── 기간 탭 (토스: 언더라인 탭) ── */}
      <div style={{
        display: 'flex', padding: '16px 24px 0',
        borderBottom: `1px solid ${sep}`,
      }}>
        {PERIODS.map(p => {
          const active = days === p.key
          return (
            <button key={p.key} className="touch-press"
              onClick={() => { setDays(p.key); setShowAll(false) }}
              style={{
                padding: '10px 18px 14px', border: 'none', cursor: 'pointer',
                background: 'transparent', position: 'relative',
                fontSize: 15, fontWeight: active ? 700 : 400,
                color: active ? colors.textPrimary : colors.textMuted,
              }}>
              {p.label}
              {active && (
                <div style={{
                  position: 'absolute', bottom: -1, left: 18, right: 18,
                  height: 2.5, borderRadius: 1.5, background: colors.textPrimary,
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* ── pill 토글 (토스: 순매수/순매도) ── */}
      <div style={{ padding: '16px 24px 0' }}>
        <div style={{
          display: 'inline-flex', borderRadius: 22, overflow: 'hidden',
          background: dark ? '#1A1A1E' : '#F4F4F5',
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
                  fontSize: 14, fontWeight: active ? 700 : 500,
                  background: active ? (dark ? '#2A2A2E' : '#FFFFFF') : 'transparent',
                  color: active ? btn.color : colors.textMuted,
                  borderRadius: 22,
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s',
                }}>{btn.label}</button>
            )
          })}
        </div>
        <span style={{
          fontSize: 13, color: colors.textMuted, fontFamily: FONTS.mono, marginLeft: 12,
        }}>{activeList.length}건</span>
      </div>

      {/* ── 리스트 (토스2 스타일) ── */}
      <div style={{ padding: '0 24px' }}>
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
              const change = t.change_close ?? 0
              const dt = t.created_at ? new Date(t.created_at) : null
              const dateLabel = dt ? `${dt.getMonth() + 1}.${dt.getDate()}` : ''

              return (
                <div key={t.rcept_no || i} className="touch-press"
                  onClick={() => setModalRceptNo(t.rcept_no)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '18px 0', cursor: 'pointer',
                    borderBottom: i < visibleItems.length - 1 ? `1px solid ${sep}` : 'none',
                  }}>

                  {/* 순번 */}
                  <span style={{
                    fontSize: 16, fontWeight: 700, fontFamily: FONTS.mono,
                    color: i < 3 ? accentColor : colors.textMuted,
                    minWidth: 22, textAlign: 'right',
                  }}>{i + 1}</span>

                  {/* 원형 등급배지 */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 24, flexShrink: 0,
                    background: gc.bg, color: gc.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, fontFamily: FONTS.mono,
                  }}>{t.grade}</div>

                  {/* 기업명 + 공시 + 날짜 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 17, fontWeight: 700, color: colors.textPrimary,
                      fontFamily: FONTS.serif, lineHeight: 1.3,
                    }}>{t.corp_name}</div>
                    <div style={{
                      fontSize: 13, color: colors.textMuted, marginTop: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {t.report_nm}
                      {dateLabel && <span style={{ fontFamily: FONTS.mono, marginLeft: 6 }}>{dateLabel}</span>}
                    </div>
                  </div>

                  {/* 우측 큰 수익률 (토스: 6,885억원 스타일) */}
                  <span style={{
                    fontSize: 18, fontWeight: 700, fontFamily: FONTS.mono,
                    color: accentColor, flexShrink: 0,
                  }}>
                    {change > 0 ? '+' : ''}{change.toFixed(1)}%
                  </span>
                </div>
              )
            })}

            {/* 더 보기 */}
            {!showAll && activeList.length > 10 && (
              <button className="touch-press" onClick={() => setShowAll(true)} style={{
                width: '100%', padding: '18px 0', border: 'none',
                background: 'transparent', cursor: 'pointer',
                fontSize: 15, fontWeight: 600, color: colors.textSecondary,
                borderTop: `1px solid ${sep}`,
              }}>더 보기</button>
            )}
          </>
        )}
      </div>

      {modalRceptNo && (
        <DisclosureModal rcept_no={modalRceptNo} onClose={() => setModalRceptNo(null)} onViewCard={onViewCard} />
      )}
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )
}

import React, { useState, useEffect, useCallback } from 'react'
import DisclosureModal from './DisclosureModal'
import { FONTS, GRADE_COLORS, getBoxStyle } from '../constants/theme'
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
  const [timelineRcept, setTimelineRcept] = useState(null)
  const [showAllUp, setShowAllUp] = useState(false)
  const [showAllDown, setShowAllDown] = useState(false)
  const [modalRceptNo, setModalRceptNo] = useState(null)
  const recent = useRecentTracks(days)

  const withChange = [...recent.tracks].filter(t => t.change_close != null)
  const upRanked = withChange.filter(t => t.change_close > 0).sort((a, b) => b.change_close - a.change_close)
  const downRanked = withChange.filter(t => t.change_close < 0).sort((a, b) => a.change_close - b.change_close)

  const avgChange = recent.total > 0
    ? recent.tracks.reduce((s, t) => s + (t.change_close ?? 0), 0) / recent.total : 0

  const c = {
    sep: dark ? '#1E1E22' : '#F4F4F5',
    text1: dark ? '#FAFAFA' : '#18181B',
    text2: dark ? '#A1A1AA' : '#71717A',
    text3: dark ? '#52525B' : '#A1A1AA',
  }

  const renderList = (items, showAll, setShowAll, accentColor, limit = 5) => {
    const visible = showAll ? items.slice(0, 30) : items.slice(0, limit)
    return (
      <>
        {visible.map((t, i) => {
          const gc = GRADE_COLORS[t.grade] || { bg: '#A1A1AA', color: '#fff' }
          const change = t.change_close ?? 0
          const dt = t.created_at ? new Date(t.created_at) : null
          const dateLabel = dt ? `${dt.getMonth() + 1}.${dt.getDate()}` : ''
          return (
            <div key={t.rcept_no || i} className="touch-press"
              onClick={() => setModalRceptNo(t.rcept_no)}
              style={{
                padding: '14px 2px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                borderBottom: i < visible.length - 1 ? `1px solid ${c.sep}` : 'none',
              }}
            >
              <span style={{
                fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono,
                color: i < 3 ? accentColor : c.text3, minWidth: 20, textAlign: 'right',
              }}>{i + 1}</span>
              <span style={{
                background: gc.bg, color: gc.color,
                fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                fontFamily: FONTS.mono, flexShrink: 0,
              }}>{t.grade}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: c.text1, fontFamily: FONTS.serif }}>
                  {t.corp_name}
                </span>
                <div style={{ fontSize: 11, color: c.text3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.report_nm} <span style={{ fontFamily: FONTS.mono }}>{dateLabel}</span>
                </div>
              </div>
              <span style={{
                fontSize: 20, fontWeight: 800, fontFamily: FONTS.mono,
                color: accentColor, flexShrink: 0,
              }}>
                {change > 0 ? '+' : ''}{change.toFixed(2)}%
              </span>
            </div>
          )
        })}
        {!showAll && items.length > limit && (
          <button className="touch-press" onClick={() => setShowAll(true)} style={{
            width: '100%', padding: '12px', border: 'none', background: 'transparent',
            cursor: 'pointer', fontSize: 13, fontWeight: 600, color: accentColor, minHeight: 44,
          }}>
            전체 {items.length}건 보기
          </button>
        )}
      </>
    )
  }

  return (
    <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto', padding: '16px 16px 80px', fontFamily: FONTS.body }}>

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontSize: 22, fontWeight: 800, fontFamily: FONTS.serif, color: colors.textPrimary }}>
          History
        </span>
        <span style={{ fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono, color: pctColor(avgChange) }}>
          평균 {fmtPct(avgChange)}
        </span>
      </div>

      {/* 기간 선택 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{
          display: 'inline-flex', borderRadius: 12, overflow: 'hidden',
          background: dark ? '#1A1A1E' : '#F4F4F5', padding: 3,
        }}>
          {PERIODS.map(p => {
            const active = days === p.key
            return (
              <button key={p.key} className="touch-press" onClick={() => { setDays(p.key); setShowAllUp(false); setShowAllDown(false) }} style={{
                padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: active ? (dark ? '#FAFAFA' : '#FFFFFF') : 'transparent',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                fontSize: 13, fontWeight: active ? 700 : 500,
                color: active ? c.text1 : c.text3,
                transition: 'all 0.15s',
              }}>{p.label}</button>
            )
          })}
        </div>
        <span style={{ fontSize: 12, color: c.text3, fontFamily: FONTS.mono }}>
          {recent.total}건 추적
        </span>
      </div>

      {/* 콘텐츠 */}
      {recent.loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ height: 56, borderRadius: 8, background: dark ? '#18181B' : '#F4F4F5', animation: 'pulse 1.4s ease-in-out infinite' }} />
          ))}
        </div>
      ) : withChange.length === 0 ? (
        <div style={{ padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 15, color: c.text1, fontWeight: 600, marginBottom: 6 }}>아직 추적 데이터가 없어요</div>
          <div style={{ fontSize: 13, color: c.text3, lineHeight: 1.6 }}>S/A/D 등급 공시가 발생하면 자동으로 주가를 추적해요</div>
        </div>
      ) : (
        <>
          {/* 급등 */}
          {upRanked.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <svg width="10" height="10" viewBox="0 0 8 8" fill="#DC2626"><path d="M4 1L7 6H1L4 1Z" /></svg>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#DC2626' }}>공시 후 급등</span>
                <span style={{ fontSize: 12, color: c.text3 }}>{upRanked.length}건</span>
              </div>
              {renderList(upRanked, showAllUp, setShowAllUp, '#DC2626')}
            </div>
          )}

          {/* 급락 */}
          {downRanked.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <svg width="10" height="10" viewBox="0 0 8 8" fill="#2563EB"><path d="M4 7L1 2H7L4 7Z" /></svg>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#2563EB' }}>공시 후 급락</span>
                <span style={{ fontSize: 12, color: c.text3 }}>{downRanked.length}건</span>
              </div>
              {renderList(downRanked, showAllDown, setShowAllDown, '#2563EB')}
            </div>
          )}
        </>
      )}

      {/* 타임라인 바텀시트 */}
      {timelineRcept && (
        <TrackTimeline rceptNo={timelineRcept} onClose={() => setTimelineRcept(null)} onOpenModal={setModalRceptNo} onViewCard={onViewCard} />
      )}

      {modalRceptNo && (
        <DisclosureModal rcept_no={modalRceptNo} onClose={() => setModalRceptNo(null)} onViewCard={onViewCard} />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )
}


// ══ 타임라인 바텀시트 ══
function TrackTimeline({ rceptNo, onClose, onOpenModal, onViewCard }) {
  const { colors, dark } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    fetch(`${API}/api/price-tracks/${rceptNo}/timeline`)
      .then(r => r.json())
      .then(d => { setData(d.timeline); setLoading(false) })
      .catch(() => setLoading(false))
  }, [rceptNo])

  const handleClose = () => { setVisible(false); setTimeout(onClose, 250) }
  const tl = data

  return (
    <>
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        opacity: visible ? 1 : 0, transition: 'opacity 0.25s',
      }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: visible ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.95)',
        zIndex: 1001,
        background: dark ? '#141416' : '#FFFFFF',
        borderRadius: 16, width: '92%', maxWidth: 480,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>

        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: 20, height: 20, border: '2px solid #E4E4E7', borderTopColor: '#DC2626', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : !tl ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: colors.textMuted, fontSize: 14 }}>추적 데이터가 없어요</div>
        ) : (
          <div style={{ padding: '0 20px 20px', paddingBottom: 'max(20px, env(safe-area-inset-bottom, 20px))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {tl.grade && (
                <span style={{
                  background: GRADE_COLORS[tl.grade]?.bg || '#A1A1AA',
                  color: GRADE_COLORS[tl.grade]?.color || '#fff',
                  fontSize: 11, fontWeight: 800, padding: '2px 7px', borderRadius: 5, fontFamily: FONTS.mono,
                }}>{tl.grade}</span>
              )}
              <span style={{ fontSize: 18, fontWeight: 800, color: colors.textPrimary, fontFamily: FONTS.serif }}>{tl.corp_name}</span>
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>{tl.report_nm}</div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: colors.textMuted }}>공시 시점</span>
              <span style={{ fontSize: 22, fontWeight: 800, fontFamily: FONTS.mono, color: colors.textPrimary }}>
                {tl.base_price ? Number(tl.base_price).toLocaleString() : '—'}
              </span>
              <span style={{ fontSize: 12, color: colors.textMuted }}>원</span>
            </div>

            {tl.points.map((p, i) => {
              const isUp = p.change > 0
              const isDown = p.change < 0
              const color = isUp ? '#DC2626' : isDown ? '#2563EB' : colors.textMuted
              const dimBg = dark ? '#0F0F11' : '#F8F8FA'
              return (
                <div key={p.time} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0',
                  borderBottom: i < tl.points.length - 1 ? `1px solid ${dark ? '#1E1E22' : '#F4F4F5'}` : 'none',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, minWidth: 60, fontFamily: FONTS.mono }}>{p.label}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: dimBg, position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute', left: p.change >= 0 ? '50%' : undefined, right: p.change < 0 ? '50%' : undefined,
                      top: 0, height: '100%', width: `${Math.min(Math.abs(p.change) * 5, 50)}%`,
                      background: color, borderRadius: 3, opacity: 0.7,
                    }} />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, fontFamily: FONTS.mono, color, minWidth: 70, textAlign: 'right' }}>
                    {isUp ? '+' : ''}{p.change.toFixed(2)}%
                  </span>
                </div>
              )
            })}

            {/* 액션 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              {/* 공시 내용 보기 */}
              <button className="touch-press" onClick={() => { onOpenModal?.(rceptNo); handleClose() }} style={{
                width: '100%', padding: '12px', borderRadius: 12,
                border: `1px solid ${dark ? '#232328' : '#EBEBEB'}`, background: 'transparent',
                color: colors.textPrimary, fontSize: 14, fontWeight: 600, cursor: 'pointer', minHeight: 48,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                공시 내용 보기
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                {/* DART 바로가기 */}
                <a className="touch-press" href={`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rceptNo}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    flex: 1, padding: '12px', borderRadius: 12, textDecoration: 'none',
                    border: `1px solid ${dark ? '#232328' : '#EBEBEB'}`, background: 'transparent',
                    color: colors.textSecondary, fontSize: 13, fontWeight: 600, minHeight: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                  DART 원문
                </a>
                {/* 기업 카드 */}
                {tl.corp_code && (
                  <button className="touch-press" onClick={() => { onViewCard?.(tl.corp_code); handleClose() }} style={{
                    flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                    background: dark ? '#FAFAFA' : '#18181B',
                    color: dark ? '#18181B' : '#FAFAFA',
                    fontSize: 13, fontWeight: 700, cursor: 'pointer', minHeight: 48,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}>
                    기업 카드
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

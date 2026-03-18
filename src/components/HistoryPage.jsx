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
  const [direction, setDirection] = useState('up') // 'up' | 'down'
  const [timelineRcept, setTimelineRcept] = useState(null)
  const [showAll, setShowAll] = useState(false)
  const [modalRceptNo, setModalRceptNo] = useState(null)
  const recent = useRecentTracks(days)

  const withChange = [...recent.tracks].filter(t => t.change_close != null)
  const upRanked = withChange.filter(t => t.change_close > 0).sort((a, b) => b.change_close - a.change_close)
  const downRanked = withChange.filter(t => t.change_close < 0).sort((a, b) => a.change_close - b.change_close)

  const avgChange = recent.total > 0
    ? recent.tracks.reduce((s, t) => s + (t.change_close ?? 0), 0) / recent.total : 0

  // 등급별 평균
  const gradeAvg = {}
  for (const grade of ['S', 'A', 'D']) {
    const items = withChange.filter(t => t.grade === grade)
    gradeAvg[grade] = items.length > 0
      ? items.reduce((s, t) => s + (t.change_close ?? 0), 0) / items.length
      : null
  }

  const activeList = direction === 'up' ? upRanked : downRanked
  const accentColor = direction === 'up' ? '#DC2626' : '#2563EB'
  const visibleItems = showAll ? activeList.slice(0, 30) : activeList.slice(0, 10)

  const c = {
    sep: dark ? '#1E1E22' : '#F0F0F2',
    cardBg: dark ? '#141416' : '#FFFFFF',
    text1: dark ? '#FAFAFA' : '#18181B',
    text2: dark ? '#A1A1AA' : '#71717A',
    text3: dark ? '#52525B' : '#A1A1AA',
    pillBg: dark ? '#1A1A1E' : '#F4F4F5',
  }

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto', padding: '0 0 80px',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* ── 히어로: 평균 수익률 (토스 종목상세 가격 스타일) ── */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 8 }}>
          공시 후 종가 기준 평균 수익률
        </div>
        <div style={{
          fontSize: 36, fontWeight: 800, fontFamily: FONTS.mono,
          color: pctColor(avgChange), letterSpacing: -1, lineHeight: 1,
        }}>
          {fmtPct(avgChange)}
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 6 }}>
          최근 {days === 20 ? '1개월' : `${days}일`} · {recent.total}건 추적
        </div>
      </div>

      {/* ── 등급별 요약 바 (코스피/코스닥 스타일) ── */}
      {!recent.loading && withChange.length > 0 && (
        <div style={{
          display: 'flex', gap: 1, margin: '20px 24px 0',
          background: c.sep, borderRadius: 12, overflow: 'hidden',
        }}>
          {[
            { label: 'S등급', avg: gradeAvg.S, color: GRADE_COLORS.S.bg },
            { label: 'A등급', avg: gradeAvg.A, color: GRADE_COLORS.A.bg },
            { label: 'D등급', avg: gradeAvg.D, color: GRADE_COLORS.D.bg },
          ].map(item => (
            <div key={item.label} style={{
              flex: 1, padding: '14px 8px', textAlign: 'center',
              background: c.cardBg,
            }}>
              <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>
                {item.label}
              </div>
              <div style={{
                fontSize: 16, fontWeight: 800, fontFamily: FONTS.mono,
                color: item.avg != null ? pctColor(item.avg) : colors.textMuted,
                lineHeight: 1,
              }}>
                {item.avg != null ? fmtPct(item.avg) : '—'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 기간 탭 (토스 밑줄 스타일) ── */}
      <div style={{
        display: 'flex', padding: '0 24px', marginTop: 24,
        borderBottom: `1px solid ${c.sep}`,
      }}>
        {PERIODS.map(p => {
          const active = days === p.key
          return (
            <button key={p.key} className="touch-press"
              onClick={() => { setDays(p.key); setShowAll(false) }}
              style={{
                padding: '12px 18px 14px', border: 'none', cursor: 'pointer',
                background: 'transparent', position: 'relative',
                fontSize: 15, fontWeight: active ? 700 : 400,
                color: active ? c.text1 : c.text3,
              }}
            >
              {p.label}
              {active && (
                <div style={{
                  position: 'absolute', bottom: -1, left: 18, right: 18,
                  height: 2, borderRadius: 1, background: c.text1,
                }} />
              )}
            </button>
          )
        })}
      </div>

      {/* ── 콘텐츠 ── */}
      <div style={{ padding: '0 24px' }}>

        {/* 섹션 헤더 + 순매수/순매도 토글 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 0 12px',
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: c.text1 }}>
            공시 후 주가 변동
          </div>
          {/* pill 토글 (순매수/순매도 스타일) */}
          <div style={{
            display: 'flex', borderRadius: 20, overflow: 'hidden',
            background: c.pillBg,
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
                    padding: '6px 16px', border: 'none', cursor: 'pointer',
                    fontSize: 13, fontWeight: active ? 700 : 500,
                    background: active ? (dark ? '#2A2A2E' : '#FFFFFF') : 'transparent',
                    color: active ? btn.color : c.text3,
                    borderRadius: 20,
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {btn.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* 로딩 */}
        {recent.loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
            <div style={{ fontSize: 15, color: c.text1, fontWeight: 600, marginBottom: 6 }}>
              {direction === 'up' ? '상승 종목이 없어요' : '하락 종목이 없어요'}
            </div>
            <div style={{ fontSize: 13, color: c.text3, lineHeight: 1.6 }}>
              S/A/D 등급 공시가 발생하면 자동으로 주가를 추적해요
            </div>
          </div>
        ) : (
          <>
            {/* 랭킹 리스트 (토스 스타일) */}
            {visibleItems.map((t, i) => (
              <RankedItem key={t.rcept_no || i} t={t} rank={i + 1}
                accentColor={accentColor} isLast={i === visibleItems.length - 1}
                dark={dark} colors={colors} c={c}
                onClick={() => setTimelineRcept(t.rcept_no)} />
            ))}

            {/* 더 보기 */}
            {!showAll && activeList.length > 10 && (
              <button className="touch-press" onClick={() => setShowAll(true)} style={{
                width: '100%', padding: '16px', border: 'none',
                background: 'transparent', cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: colors.textSecondary,
                borderTop: `1px solid ${c.sep}`,
              }}>
                더 보기
              </button>
            )}
          </>
        )}
      </div>

      {/* 타임라인 바텀시트 */}
      {timelineRcept && (
        <TrackTimeline rceptNo={timelineRcept} onClose={() => setTimelineRcept(null)}
          onOpenModal={setModalRceptNo} onViewCard={onViewCard} />
      )}

      {modalRceptNo && (
        <DisclosureModal rcept_no={modalRceptNo} onClose={() => setModalRceptNo(null)} onViewCard={onViewCard} />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )
}


// ══ 랭킹 아이템 (토스 투자자별 리스트 스타일) ══
function RankedItem({ t, rank, accentColor, isLast, dark, colors, c, onClick }) {
  const gc = GRADE_COLORS[t.grade] || { bg: '#A1A1AA', color: '#fff' }
  const change = t.change_close ?? 0
  const dt = t.created_at ? new Date(t.created_at) : null
  const dateLabel = dt ? `${dt.getMonth() + 1}.${dt.getDate()}` : ''

  return (
    <div className="touch-press" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '16px 0', cursor: 'pointer',
      borderBottom: isLast ? 'none' : `1px solid ${c.sep}`,
      minHeight: 72,
    }}>
      {/* 순위 */}
      <span style={{
        fontSize: 15, fontWeight: 800, fontFamily: FONTS.mono,
        color: rank <= 3 ? accentColor : c.text3,
        minWidth: 24, textAlign: 'center',
      }}>
        {rank}
      </span>

      {/* 원형 등급 배지 (토스 회사 로고 자리) */}
      <div style={{
        width: 44, height: 44, borderRadius: 22, flexShrink: 0,
        background: gc.bg, color: gc.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, fontWeight: 800, fontFamily: FONTS.mono,
      }}>
        {t.grade}
      </div>

      {/* 기업명 + 공시 + 날짜 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 16, fontWeight: 700, color: c.text1,
          fontFamily: FONTS.serif,
        }}>
          {t.corp_name}
        </div>
        <div style={{
          fontSize: 13, color: c.text3, marginTop: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {t.report_nm}
          {dateLabel && (
            <span style={{ fontFamily: FONTS.mono, marginLeft: 6 }}>{dateLabel}</span>
          )}
        </div>
      </div>

      {/* 우측 큰 수익률 (토스 순매수 금액 스타일) */}
      <span style={{
        fontSize: 17, fontWeight: 700, fontFamily: FONTS.mono,
        color: accentColor, flexShrink: 0,
      }}>
        {change > 0 ? '+' : ''}{change.toFixed(2)}%
      </span>
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
        position: 'fixed', bottom: 0, left: '50%',
        transform: visible ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(100%)',
        zIndex: 1001,
        background: dark ? '#141416' : '#FFFFFF',
        borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 640,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
        transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        {/* 핸들 바 */}
        <div style={{ padding: '12px 0 8px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: dark ? '#333' : '#D4D4D8',
          }} />
        </div>

        {loading ? (
          <div style={{ padding: '40px 24px', textAlign: 'center' }}>
            <div style={{
              width: 20, height: 20, border: '2px solid #E4E4E7',
              borderTopColor: '#DC2626', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : !tl ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: colors.textMuted, fontSize: 14 }}>
            추적 데이터가 없어요
          </div>
        ) : (
          <div style={{
            padding: '0 24px 24px', overflowY: 'auto',
            paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
          }}>
            {/* 기업명 + 등급 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              {tl.grade && (
                <div style={{
                  width: 32, height: 32, borderRadius: 16,
                  background: GRADE_COLORS[tl.grade]?.bg || '#A1A1AA',
                  color: GRADE_COLORS[tl.grade]?.color || '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono,
                }}>
                  {tl.grade}
                </div>
              )}
              <span style={{
                fontSize: 20, fontWeight: 800, color: colors.textPrimary,
                fontFamily: FONTS.serif,
              }}>
                {tl.corp_name}
              </span>
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>
              {tl.report_nm}
            </div>

            {/* 기준가 (토스 큰 가격 스타일) */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>
                공시 시점 기준가
              </div>
              <div style={{
                fontSize: 28, fontWeight: 800, fontFamily: FONTS.mono,
                color: colors.textPrimary, letterSpacing: -0.5,
              }}>
                {tl.base_price ? `${Number(tl.base_price).toLocaleString()}원` : '—'}
              </div>
            </div>

            {/* 타임라인 포인트 (레인지바 스타일) */}
            {tl.points.map((p, i) => {
              const isUp = p.change > 0
              const isDown = p.change < 0
              const color = isUp ? '#DC2626' : isDown ? '#2563EB' : colors.textMuted
              const dimBg = dark ? '#0F0F11' : '#F4F4F5'
              return (
                <div key={p.time} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0',
                  borderBottom: i < tl.points.length - 1
                    ? `1px solid ${dark ? '#1E1E22' : '#F4F4F5'}` : 'none',
                }}>
                  <span style={{
                    fontSize: 13, fontWeight: 600, color: colors.textMuted,
                    minWidth: 52, fontFamily: FONTS.mono,
                  }}>
                    {p.label}
                  </span>
                  <div style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: dimBg, position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{
                      position: 'absolute',
                      left: p.change >= 0 ? '50%' : undefined,
                      right: p.change < 0 ? '50%' : undefined,
                      top: 0, height: '100%',
                      width: `${Math.min(Math.abs(p.change) * 5, 50)}%`,
                      background: color, borderRadius: 3, opacity: 0.7,
                    }} />
                  </div>
                  <span style={{
                    fontSize: 16, fontWeight: 800, fontFamily: FONTS.mono,
                    color, minWidth: 70, textAlign: 'right',
                  }}>
                    {isUp ? '+' : ''}{p.change.toFixed(2)}%
                  </span>
                </div>
              )
            })}

            {/* 액션 버튼 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
              <button className="touch-press" onClick={() => { onOpenModal?.(rceptNo); handleClose() }} style={{
                width: '100%', padding: '14px', borderRadius: 14,
                border: `1px solid ${dark ? '#232328' : '#E4E4E7'}`,
                background: 'transparent', color: colors.textPrimary,
                fontSize: 15, fontWeight: 600, cursor: 'pointer', minHeight: 50,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                공시 내용 보기
              </button>
              <div style={{ display: 'flex', gap: 8 }}>
                <a className="touch-press"
                  href={`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${rceptNo}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    flex: 1, padding: '14px', borderRadius: 14, textDecoration: 'none',
                    border: `1px solid ${dark ? '#232328' : '#E4E4E7'}`,
                    background: 'transparent', color: colors.textSecondary,
                    fontSize: 14, fontWeight: 600, minHeight: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  DART 원문
                </a>
                {tl.corp_code && (
                  <button className="touch-press" onClick={() => { onViewCard?.(tl.corp_code); handleClose() }} style={{
                    flex: 1, padding: '14px', borderRadius: 14, border: 'none',
                    background: dark ? '#FAFAFA' : '#18181B',
                    color: dark ? '#18181B' : '#FAFAFA',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 50,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                  }}>
                    기업 카드
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
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

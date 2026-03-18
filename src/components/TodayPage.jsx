import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from './EmptyState'
import FeedSkeleton from './skeletons/FeedSkeleton'
import DisclosureModal from './DisclosureModal'
import { useDisclosures } from '../hooks/useDisclosures'
import { FONTS, GRADE_COLORS } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'

export default function TodayPage({ onViewCard }) {
  const { colors, dark } = useTheme()
  const [modalRceptNo, setModalRceptNo] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchOpen, setSearchOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const {
    disclosures, counts, loading,
    gradeFilter, setGradeFilter,
    search, setSearch,
    prices,
  } = useDisclosures()

  useEffect(() => {
    const urlGrade = searchParams.get('grade')
    if (urlGrade && ['S', 'A', 'D'].includes(urlGrade)) {
      setGradeFilter(urlGrade)
      setSearchParams({}, { replace: true })
    }
  }, [])

  const now = new Date()
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const kstNow = new Date(now.getTime() + 9 * 3600000)
  const kstHour = kstNow.getUTCHours()
  const targetDate = kstHour < 9 ? new Date(kstNow.getTime() - 24 * 3600000) : kstNow
  const targetStr = targetDate.toISOString().slice(0, 10)
  const displayDate = new Date(targetStr + 'T00:00:00')
  const dateStr = `${displayDate.getMonth() + 1}.${displayDate.getDate()} ${dayNames[displayDate.getDay()]}요일`

  const todayDisclosures = useMemo(() => {
    if (!disclosures) return []
    return disclosures.filter(d => {
      if (!d.created_at) return false
      const dt = new Date(d.created_at)
      const kst = new Date(dt.getTime() + 9 * 3600000)
      return kst.toISOString().slice(0, 10) === targetStr
    })
  }, [disclosures, targetStr])

  const todayCounts = useMemo(() => {
    const c = { S: 0, A: 0, D: 0, total: 0 }
    todayDisclosures.forEach(d => {
      if (d.grade === 'S') c.S++
      else if (d.grade === 'A') c.A++
      else if (d.grade === 'D') c.D++
      c.total++
    })
    return c
  }, [todayDisclosures])

  const filtered = useMemo(() => {
    let list = todayDisclosures
    if (gradeFilter) list = list.filter(d => d.grade === gradeFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(d =>
        d.corp_name?.toLowerCase().includes(q) || d.report_nm?.toLowerCase().includes(q)
      )
    }
    return list
  }, [todayDisclosures, gradeFilter, search])

  const visibleItems = showAll ? filtered : filtered.slice(0, 20)
  const lineSep = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

  // 실시간 상승 TOP 5
  const topMovers = useMemo(() => {
    return todayDisclosures
      .filter(d => {
        const pd = prices[d.stock_code]
        return pd?.change_pct != null && pd?.price > 0
      })
      .map(d => ({ ...d, changePct: prices[d.stock_code].change_pct, price: prices[d.stock_code].price }))
      .sort((a, b) => b.changePct - a.changePct)
      .slice(0, 5)
      .filter(d => d.changePct > 0)
  }, [todayDisclosures, prices])

  return (
    <div className="page-enter today-page" style={{
      maxWidth: 640, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* ── 헤더 ── */}
      <div className="today-pad" style={{ paddingTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="today-title" style={{ fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>
              오늘의 공시
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
              {dateStr}{kstHour < 9 && ' · 09시에 오늘 공시로 전환'}
            </div>
          </div>
          <button className="touch-press" onClick={() => setSearchOpen(!searchOpen)} style={{
            width: 44, height: 44, borderRadius: 22, border: 'none',
            background: searchOpen ? (dark ? '#2A2A2E' : '#F0F0F2') : 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={colors.textSecondary} strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
        {searchOpen && (
          <SearchBar search={search} setSearch={setSearch} colors={colors} dark={dark}
            onClose={() => { setSearchOpen(false); setSearch('') }} />
        )}
      </div>

      {/* ── 실시간 상승 TOP 5 ── */}
      {!loading && topMovers.length > 0 && (
        <div className="today-pad" style={{ paddingTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="#DC2626">
              <path d="M8 2L13 9H3L8 2Z" />
            </svg>
            <span className="today-section-title" style={{ fontWeight: 800, color: '#DC2626', letterSpacing: -0.3 }}>
              실시간 급등 TOP
            </span>
          </div>
          <div style={{
            display: 'flex', gap: 10, overflowX: 'auto',
            WebkitOverflowScrolling: 'touch', paddingBottom: 4,
          }}>
            {topMovers.map((d, i) => {
              const gc = GRADE_COLORS[d.grade] || { bg: '#94A3B8', color: '#fff' }
              return (
                <div key={d.rcept_no} className="touch-press"
                  onClick={() => setModalRceptNo(d.rcept_no)}
                  style={{
                    minWidth: 140, padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
                    background: dark ? '#1A1A1E' : '#FEF2F2',
                    border: `1px solid ${dark ? '#2A1A1A' : '#FECACA'}`,
                    flexShrink: 0,
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono, color: '#DC2626',
                    }}>{i + 1}</span>
                    <div style={{
                      width: 22, height: 22, borderRadius: 11,
                      background: gc.bg, color: gc.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, fontFamily: FONTS.mono,
                    }}>{d.grade}</div>
                  </div>
                  <div style={{
                    fontSize: 15, fontWeight: 700, color: colors.textPrimary,
                    fontFamily: FONTS.serif, marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{d.corp_name}</div>
                  <div style={{
                    fontSize: 20, fontWeight: 800, fontFamily: FONTS.mono,
                    color: '#DC2626', letterSpacing: -0.5,
                  }}>+{d.changePct.toFixed(1)}%</div>
                  <div style={{
                    fontSize: 12, fontFamily: FONTS.mono, color: colors.textMuted, marginTop: 2,
                  }}>{d.price.toLocaleString()}원</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 섹션 타이틀 ── */}
      {!loading && todayCounts.total > 0 && (
        <div className="today-pad" style={{ paddingTop: 24 }}>
          <div className="today-section-title" style={{ fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.3 }}>
            AI가 선별한 핵심 공시
          </div>
        </div>
      )}

      {/* ── 등급 탭 ── */}
      {!loading && todayCounts.total > 0 && (
        <div style={{
          display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch',
          borderBottom: `1px solid ${lineSep}`, marginTop: 16,
        }}>
          <div style={{ width: 24, flexShrink: 0 }} />
          {[
            { key: null, label: '전체', count: todayCounts.total },
            { key: 'S', label: 'S등급', count: todayCounts.S, color: GRADE_COLORS.S.bg },
            { key: 'A', label: 'A등급', count: todayCounts.A, color: GRADE_COLORS.A.bg },
            { key: 'D', label: 'D등급', count: todayCounts.D, color: GRADE_COLORS.D.bg },
          ].filter(t => t.key === null || t.count > 0).map(t => {
            const active = gradeFilter === t.key
            return (
              <button key={t.label} className="touch-press"
                onClick={() => { setGradeFilter(active && t.key !== null ? null : t.key); setShowAll(false) }}
                style={{
                  padding: '10px 14px 14px', border: 'none', cursor: 'pointer',
                  background: 'transparent', position: 'relative', whiteSpace: 'nowrap',
                  fontSize: 14, fontWeight: active ? 700 : 400, minHeight: 44,
                  color: active ? (t.color || colors.textPrimary) : colors.textMuted,
                }}>
                {t.label}
                {active && (
                  <div style={{
                    position: 'absolute', bottom: -1, left: 10, right: 10,
                    height: 3, borderRadius: 1.5,
                    background: t.color || colors.textPrimary,
                  }} />
                )}
              </button>
            )
          })}
          <div style={{ width: 24, flexShrink: 0 }} />
        </div>
      )}

      {/* ── 리스트 ── */}
      <div className="today-pad" style={{ paddingTop: 4 }}>
        {loading ? (
          <div style={{ padding: '20px 0' }}><FeedSkeleton /></div>
        ) : filtered.length === 0 ? (
          (gradeFilter || search) ? (
            <EmptyState icon="search" title="검색 결과가 없어요"
              action="초기화" onAction={() => { setGradeFilter(null); setSearch('') }} />
          ) : (
            <EmptyState icon="calendar" title="아직 오늘 공시가 없어요"
              description="보통 오전 9시부터 올라와요" />
          )
        ) : (
          <>
            {visibleItems.map((d, i) => {
              const gc = GRADE_COLORS[d.grade] || { bg: '#94A3B8', color: '#fff' }
              const pd = prices[d.stock_code]
              const changePct = pd?.change_pct
              const price = pd?.price
              const hasPrice = price != null && price > 0
              const priceColor = changePct > 0 ? '#DC2626' : changePct < 0 ? '#2563EB' : colors.textMuted

              const kstTime = (() => {
                if (!d.created_at) return ''
                const dt = new Date(d.created_at)
                const kst = new Date(dt.getTime() + 9 * 60 * 60 * 1000)
                return `${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')}`
              })()

              return (
                <div key={d.rcept_no} className="touch-press today-row"
                  onClick={() => setModalRceptNo(d.rcept_no)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '18px 0', cursor: 'pointer',
                    borderBottom: i < visibleItems.length - 1 ? `1px solid ${lineSep}` : 'none',
                    minHeight: 64,
                  }}>

                  {/* 순번 (모바일에서 숨김) */}
                  <span className="today-rank" style={{
                    fontWeight: 700, fontFamily: FONTS.mono,
                    color: gc.bg, textAlign: 'right',
                  }}>{i + 1}</span>

                  {/* 원형 등급배지 */}
                  <div className="today-badge" style={{
                    borderRadius: '50%', flexShrink: 0,
                    background: gc.bg, color: gc.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontFamily: FONTS.mono,
                  }}>{d.grade}</div>

                  {/* 기업명 + 공시사유·시세 (2줄 컴팩트) */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="today-corp" style={{
                      fontWeight: 700, color: colors.textPrimary,
                      fontFamily: FONTS.serif,
                    }}>{d.corp_name}</div>
                    <div className="today-sub" style={{
                      color: colors.textMuted, marginTop: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {d.report_nm}
                      {hasPrice && (
                        <>
                          <span style={{ margin: '0 5px', opacity: 0.4 }}>·</span>
                          <span style={{ fontFamily: FONTS.mono }}>{price.toLocaleString()}원</span>
                          {' '}
                          <span style={{ color: priceColor, fontWeight: 600 }}>
                            {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 우측 */}
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    {hasPrice ? (
                      <span className="today-right-num" style={{
                        fontWeight: 700, fontFamily: FONTS.mono, color: priceColor,
                      }}>
                        {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}%
                      </span>
                    ) : kstTime ? (
                      <span style={{ fontSize: 13, fontFamily: FONTS.mono, color: colors.textMuted }}>
                        {kstTime}
                      </span>
                    ) : null}
                  </div>
                </div>
              )
            })}

            {!showAll && filtered.length > 20 && (
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
        /* 데스크톱 기본값 */
        .today-pad { padding-left: 24px; padding-right: 24px; }
        .today-title { font-size: 22px; }
        .today-section-title { font-size: 20px; }
        .today-row { gap: 16px; }
        .today-rank { font-size: 17px; min-width: 24px; display: inline-block; }
        .today-badge { width: 48px; height: 48px; font-size: 16px; }
        .today-corp { font-size: 17px; }
        .today-sub { font-size: 14px; }
        .today-right-num { font-size: 17px; }

        /* 태블릿 */
        @media (max-width: 768px) {
          .today-pad { padding-left: 20px; padding-right: 20px; }
        }

        /* 모바일 */
        @media (max-width: 480px) {
          .today-pad { padding-left: 16px; padding-right: 16px; }
          .today-title { font-size: 20px; }
          .today-section-title { font-size: 18px; }
          .today-row { gap: 10px; }
          .today-rank { font-size: 14px; min-width: 18px; }
          .today-badge { width: 40px; height: 40px; font-size: 14px; }
          .today-corp { font-size: 15px; }
          .today-sub { font-size: 13px; }
          .today-right-num { font-size: 15px; }
        }

        /* 극소 모바일 */
        @media (max-width: 360px) {
          .today-pad { padding-left: 12px; padding-right: 12px; }
          .today-rank { display: none; }
          .today-badge { width: 36px; height: 36px; font-size: 13px; }
          .today-corp { font-size: 14px; }
          .today-sub { font-size: 12px; }
          .today-right-num { font-size: 14px; }
        }
      `}</style>
    </div>
  )
}

function SearchBar({ search, setSearch, colors, dark, onClose }) {
  const [val, setVal] = useState(search || '')
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 14px', borderRadius: 12, height: 48,
        background: dark ? '#1A1A1E' : '#F4F4F5',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input ref={inputRef} type="text" placeholder="기업명 또는 공시 검색" value={val} autoComplete="off"
          onChange={e => { setVal(e.target.value); setSearch(e.target.value) }}
          style={{
            flex: 1, padding: '12px 0', fontSize: 16, border: 'none',
            background: 'transparent', color: colors.textPrimary, outline: 'none',
          }} />
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: colors.textMuted, fontSize: 14, fontWeight: 600,
          padding: '8px 4px', minHeight: 44,
        }}>취소</button>
      </div>
    </div>
  )
}

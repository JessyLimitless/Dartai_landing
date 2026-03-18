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

  const sep = dark ? '#1E1E22' : '#F4F4F5'

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto', padding: '0 0 100px',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* ── 헤더 (토스: 심플 타이틀 + 검색 아이콘) ── */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>
              오늘의 공시
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
              {dateStr}{kstHour < 9 && ' · 09시에 오늘 공시로 전환'}
            </div>
          </div>
          <button className="touch-press" onClick={() => setSearchOpen(!searchOpen)} style={{
            width: 40, height: 40, borderRadius: 20, border: 'none',
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

      {/* ── 섹션 타이틀 (토스: "지금 많이 사고팔리는 종목" 스타일) ── */}
      {!loading && todayCounts.total > 0 && (
        <div style={{ padding: '28px 24px 0' }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: colors.textPrimary, marginBottom: 4 }}>
            AI가 선별한 핵심 공시
          </div>
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            전체 {todayCounts.total}건 중 S·A·D 등급
          </div>
        </div>
      )}

      {/* ── 등급 탭 (토스: 외국인 | 기관 | 개인 언더라인 탭) ── */}
      {!loading && todayCounts.total > 0 && (
        <div style={{
          display: 'flex', padding: '16px 24px 0',
          borderBottom: `1px solid ${sep}`,
        }}>
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
                  padding: '10px 16px 14px', border: 'none', cursor: 'pointer',
                  background: 'transparent', position: 'relative',
                  fontSize: 15, fontWeight: active ? 700 : 400,
                  color: active ? (t.color || colors.textPrimary) : colors.textMuted,
                }}>
                {t.label}
                {active && (
                  <div style={{
                    position: 'absolute', bottom: -1, left: 16, right: 16,
                    height: 2.5, borderRadius: 1.5,
                    background: t.color || colors.textPrimary,
                  }} />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ── 리스트 (토스2: 순번 + 원형48px + 기업명18px + 가격+등락률 + 우측 큰 시간) ── */}
      <div style={{ padding: '0 24px' }}>
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
                <div key={d.rcept_no} className="touch-press"
                  onClick={() => setModalRceptNo(d.rcept_no)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '18px 0', cursor: 'pointer',
                    borderBottom: i < visibleItems.length - 1 ? `1px solid ${sep}` : 'none',
                  }}>

                  {/* 순번 (토스: 빨강 숫자) */}
                  <span style={{
                    fontSize: 16, fontWeight: 700, fontFamily: FONTS.mono,
                    color: i < 3 ? (gc.bg || '#DC2626') : colors.textMuted,
                    minWidth: 22, textAlign: 'right',
                  }}>{i + 1}</span>

                  {/* 원형 등급배지 (토스: 48px 로고) */}
                  <div style={{
                    width: 48, height: 48, borderRadius: 24, flexShrink: 0,
                    background: gc.bg, color: gc.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 800, fontFamily: FONTS.mono,
                  }}>{d.grade}</div>

                  {/* 기업명 + 가격/등락률 (토스: 종목명 18px + 가격 14px) */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 17, fontWeight: 700, color: colors.textPrimary,
                      fontFamily: FONTS.serif, lineHeight: 1.3,
                    }}>{d.corp_name}</div>
                    <div style={{
                      fontSize: 14, color: colors.textMuted, marginTop: 4,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {hasPrice ? (
                        <>
                          <span style={{ fontFamily: FONTS.mono }}>{price.toLocaleString()}원</span>
                          {' '}
                          <span style={{ color: priceColor, fontWeight: 600 }}>
                            {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <span style={{ fontSize: 13 }}>{d.report_nm}</span>
                      )}
                    </div>
                  </div>

                  {/* 우측 시간 (토스: 큰 금액 자리) */}
                  {kstTime && (
                    <span style={{
                      fontSize: 13, fontFamily: FONTS.mono,
                      color: colors.textMuted, flexShrink: 0,
                    }}>{kstTime}</span>
                  )}
                </div>
              )
            })}

            {/* 더 보기 (토스 하단) */}
            {!showAll && filtered.length > 20 && (
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
    </div>
  )
}


// ══ 검색바 ══
function SearchBar({ search, setSearch, colors, dark, onClose }) {
  const [val, setVal] = useState(search || '')
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 14px', borderRadius: 12, height: 44,
        background: dark ? '#1A1A1E' : '#F4F4F5',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input ref={inputRef} type="text" placeholder="기업명 또는 공시 검색" value={val} autoComplete="off"
          onChange={e => { setVal(e.target.value); setSearch(e.target.value) }}
          style={{
            flex: 1, padding: '10px 0', fontSize: 15, border: 'none',
            background: 'transparent', color: colors.textPrimary, outline: 'none',
          }} />
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: colors.textMuted, fontSize: 13, fontWeight: 600, padding: '4px 2px',
        }}>취소</button>
      </div>
    </div>
  )
}

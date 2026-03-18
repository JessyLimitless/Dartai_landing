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

  // KST 9시 전이면 전일 공시
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

  // 필터링
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

  const FILTER_PILLS = [
    { key: null, label: '전체', count: todayCounts.total },
    { key: 'S', label: 'S', count: todayCounts.S, color: GRADE_COLORS.S.bg },
    { key: 'A', label: 'A', count: todayCounts.A, color: GRADE_COLORS.A.bg },
    { key: 'D', label: 'D', count: todayCounts.D, color: GRADE_COLORS.D.bg },
  ]

  const c = {
    sep: dark ? '#1E1E22' : '#F4F4F5',
    pillBg: dark ? '#1A1A1E' : '#F4F4F5',
    pillActiveBg: dark ? '#2A2A2E' : '#18181B',
  }

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto', padding: '0 0 80px',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* ── 헤더 ── */}
      <div style={{ padding: '20px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>
              오늘의 공시
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 2 }}>
              {dateStr}{kstHour < 9 && ' · 09시부터 오늘 공시로 전환'}
            </div>
          </div>
          <button className="touch-press" onClick={() => setSearchOpen(!searchOpen)}
            style={{
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

      {/* ── 요약 바 ── */}
      {!loading && todayCounts.total > 0 && (
        <div style={{
          display: 'flex', gap: 1, margin: '16px 24px 0',
          background: dark ? '#1E1E22' : '#F0F0F2', borderRadius: 12, overflow: 'hidden',
        }}>
          {[
            { label: '전체', value: todayCounts.total, color: colors.textPrimary },
            { label: 'S등급', value: todayCounts.S, color: GRADE_COLORS.S.bg },
            { label: 'A등급', value: todayCounts.A, color: GRADE_COLORS.A.bg },
            { label: 'D등급', value: todayCounts.D, color: GRADE_COLORS.D.bg },
          ].map(item => (
            <div key={item.label} style={{
              flex: 1, padding: '12px 8px', textAlign: 'center',
              background: dark ? '#141416' : '#FFFFFF',
            }}>
              <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: FONTS.mono, color: item.color, lineHeight: 1 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 필터 pill (토스 순매수/순매도 스타일) ── */}
      {!loading && todayCounts.total > 0 && (
        <div style={{
          display: 'flex', gap: 8, padding: '16px 24px 0',
          overflowX: 'auto', WebkitOverflowScrolling: 'touch',
        }}>
          {FILTER_PILLS.filter(p => p.key === null || p.count > 0).map(p => {
            const active = gradeFilter === p.key
            return (
              <button key={p.label} className="touch-press"
                onClick={() => setGradeFilter(active && p.key !== null ? null : p.key)}
                style={{
                  padding: '8px 16px', borderRadius: 20, border: 'none',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  background: active ? c.pillActiveBg : c.pillBg,
                  color: active ? (dark ? '#FAFAFA' : '#FFFFFF') : colors.textSecondary,
                  transition: 'all 0.15s',
                }}>
                {p.label}
                {p.count > 0 && (
                  <span style={{
                    marginLeft: 4, fontFamily: FONTS.mono, fontSize: 12,
                    color: active ? (p.color || (dark ? '#FAFAFA' : '#FFFFFF')) : colors.textMuted,
                  }}>{p.count}</span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* ── 공시 리스트 (toss2 스타일: 순번 + 원형배지 + 기업명/공시 + 우측 시세) ── */}
      <div style={{ padding: '12px 24px 0' }}>
        {loading ? (
          <div style={{ padding: '12px 0' }}><FeedSkeleton /></div>
        ) : filtered.length === 0 ? (
          (gradeFilter || search) ? (
            <EmptyState icon="search" title="검색 결과가 없어요"
              action="초기화" onAction={() => { setGradeFilter(null); setSearch('') }} />
          ) : (
            <EmptyState icon="calendar" title="아직 오늘 공시가 없어요"
              description="보통 오전 9시부터 올라와요" />
          )
        ) : (
          filtered.map((d, i) => (
            <FeedRow key={d.rcept_no} d={d} rank={i + 1} isLast={i === filtered.length - 1}
              onOpenModal={setModalRceptNo} colors={colors} dark={dark}
              priceData={prices[d.stock_code]} sep={c.sep} />
          ))
        )}
      </div>

      {modalRceptNo && (
        <DisclosureModal rcept_no={modalRceptNo} onClose={() => setModalRceptNo(null)} onViewCard={onViewCard} />
      )}
    </div>
  )
}


// ══ toss2 스타일 리스트 아이템 ══
// 순번 + 원형 등급배지 + 기업명/가격/등락률 + 우측 큰 시세
function FeedRow({ d, rank, isLast, onOpenModal, colors, dark, priceData, sep }) {
  const gc = GRADE_COLORS[d.grade] || { bg: '#94A3B8', color: '#fff' }
  const changePct = priceData?.change_pct
  const price = priceData?.price
  const hasPrice = price != null && price > 0
  const priceColor = changePct > 0 ? '#DC2626' : changePct < 0 ? '#2563EB' : colors.textMuted

  const kstTime = (() => {
    if (!d.created_at) return ''
    const dt = new Date(d.created_at)
    const kst = new Date(dt.getTime() + 9 * 60 * 60 * 1000)
    return `${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')}`
  })()

  return (
    <div className="touch-press" onClick={() => onOpenModal?.(d.rcept_no)} style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '16px 0', cursor: 'pointer',
      borderBottom: isLast ? 'none' : `1px solid ${sep}`,
      minHeight: 72,
    }}>
      {/* 순번 */}
      <span style={{
        fontSize: 14, fontWeight: 700, fontFamily: FONTS.mono,
        color: rank <= 3
          ? (d.grade === 'S' ? GRADE_COLORS.S.bg : d.grade === 'D' ? GRADE_COLORS.D.bg : colors.textPrimary)
          : colors.textMuted,
        minWidth: 20, textAlign: 'right',
      }}>
        {rank}
      </span>

      {/* 원형 등급배지 (토스 회사로고 자리) */}
      <div style={{
        width: 44, height: 44, borderRadius: 22, flexShrink: 0,
        background: gc.bg, color: gc.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 15, fontWeight: 800, fontFamily: FONTS.mono,
      }}>
        {d.grade}
      </div>

      {/* 기업명 + 가격/등락률 (토스: 종목명 + 가격 +x.x%) */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 16, fontWeight: 700, color: dark ? '#FAFAFA' : '#18181B',
          fontFamily: FONTS.serif,
        }}>
          {d.corp_name}
        </div>
        <div style={{
          fontSize: 13, color: colors.textMuted, marginTop: 3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {hasPrice ? (
            <>
              <span style={{ fontFamily: FONTS.mono }}>{price.toLocaleString()}원</span>
              <span style={{ color: priceColor, fontWeight: 600, marginLeft: 6 }}>
                {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}%
              </span>
            </>
          ) : (
            <span>{d.report_nm}</span>
          )}
        </div>
      </div>

      {/* 우측: 공시시간 또는 장외 */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        {kstTime && (
          <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono }}>
            {kstTime}
          </span>
        )}
      </div>
    </div>
  )
}


// ══ 검색바 ══
function SearchBar({ search, setSearch, colors, dark, onClose }) {
  const [val, setVal] = useState(search || '')
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  return (
    <div style={{ marginTop: 12 }}>
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
          }}
        />
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: colors.textMuted, fontSize: 13, fontWeight: 600, padding: '4px 2px',
        }}>취소</button>
      </div>
    </div>
  )
}

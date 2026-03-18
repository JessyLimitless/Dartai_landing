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

  // KST 9시 전이면 전일 공시를 보여줌
  const kstNow = new Date(now.getTime() + 9 * 3600000)
  const kstHour = kstNow.getUTCHours()
  const targetDate = kstHour < 9
    ? new Date(kstNow.getTime() - 24 * 3600000) // 전일
    : kstNow
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

  // S등급 분리 (최대 4개만 히어로)
  const allSGrade = todayDisclosures.filter(d => d.grade === 'S')
  const sGradeItems = allSGrade.slice(0, 4)
  const sGradeOverflow = allSGrade.slice(4) // 나머지는 전체 리스트로
  const hasHero = sGradeItems.length > 0 && !gradeFilter

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

  // 히어로에 표시된 S등급은 리스트에서 제외 (overflow분은 리스트에 포함)
  const heroRceptNos = hasHero ? new Set(sGradeItems.map(d => d.rcept_no)) : new Set()
  const listItems = hasHero ? filtered.filter(d => !heroRceptNos.has(d.rcept_no)) : filtered

  const FILTER_PILLS = [
    { key: null, label: '전체', count: todayCounts.total },
    { key: 'S', label: 'S', count: todayCounts.S, color: GRADE_COLORS.S.bg },
    { key: 'A', label: 'A', count: todayCounts.A, color: GRADE_COLORS.A.bg },
    { key: 'D', label: 'D', count: todayCounts.D, color: GRADE_COLORS.D.bg },
  ]

  const c = {
    sep: dark ? '#1E1E22' : '#F0F0F2',
    cardBg: dark ? '#141416' : '#FFFFFF',
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
          background: c.sep, borderRadius: 12, overflow: 'hidden',
        }}>
          {[
            { label: '전체', value: todayCounts.total, color: colors.textPrimary },
            { label: 'S등급', value: todayCounts.S, color: GRADE_COLORS.S.bg },
            { label: 'A등급', value: todayCounts.A, color: GRADE_COLORS.A.bg },
            { label: 'D등급', value: todayCounts.D, color: GRADE_COLORS.D.bg },
          ].map(item => (
            <div key={item.label} style={{
              flex: 1, padding: '12px 8px', textAlign: 'center', background: c.cardBg,
            }}>
              <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: FONTS.mono, color: item.color, lineHeight: 1 }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── S등급 히어로 (컴팩트, 시세 우측) ── */}
      {!loading && hasHero && (
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: colors.textPrimary, marginBottom: 10 }}>
            핵심 공시
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: sGradeItems.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap: 8,
          }}>
            {sGradeItems.map(d => (
              <HeroCard key={d.rcept_no} d={d} dark={dark} colors={colors}
                priceData={prices[d.stock_code]} onOpenModal={setModalRceptNo} />
            ))}
          </div>
        </div>
      )}

      {/* ── 필터 pill ── */}
      {!loading && todayCounts.total > 0 && (
        <div style={{
          display: 'flex', gap: 8, padding: '20px 24px 0',
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

      {/* ── 전체 공시 (2컬럼 카드 그리드) ── */}
      <div style={{ padding: '16px 24px 0' }}>
        {!loading && listItems.length > 0 && !gradeFilter && !search && (
          <div style={{ fontSize: 17, fontWeight: 800, color: colors.textPrimary, marginBottom: 10 }}>
            전체 공시
          </div>
        )}

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
          <>
            <div className="today-card-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
            }}>
              {listItems.map((d) => (
                <FeedCard key={d.rcept_no} d={d}
                  onOpenModal={setModalRceptNo} colors={colors} dark={dark}
                  priceData={prices[d.stock_code]} c={c} />
              ))}
            </div>
            <style>{`
              @media (max-width: 480px) {
                .today-card-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </>
        )}
      </div>

      {modalRceptNo && (
        <DisclosureModal rcept_no={modalRceptNo} onClose={() => setModalRceptNo(null)} onViewCard={onViewCard} />
      )}
    </div>
  )
}


// ══ S등급 히어로 카드 (컴팩트 + 시세 우측) ══
function HeroCard({ d, dark, colors, priceData, onOpenModal }) {
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
      padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
      background: dark ? '#1A1A1E' : '#FEF2F2',
      border: `1px solid ${dark ? '#2A1A1A' : '#FECACA'}`,
      display: 'flex', alignItems: 'center', gap: 12,
      transition: 'transform 0.1s',
    }}>
      {/* 좌: 등급 + 기업명 + 공시 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 12,
            background: GRADE_COLORS.S.bg, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, fontFamily: FONTS.mono, flexShrink: 0,
          }}>S</div>
          {kstTime && (
            <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>{kstTime}</span>
          )}
        </div>
        <div style={{
          fontSize: 15, fontWeight: 700, color: dark ? '#FAFAFA' : '#18181B',
          fontFamily: FONTS.serif, marginBottom: 2,
        }}>
          {d.corp_name}
        </div>
        <div style={{
          fontSize: 12, color: colors.textMuted, lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {d.report_nm}
        </div>
      </div>

      {/* 우: 시세 */}
      {hasPrice && (
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{
            fontSize: 18, fontWeight: 800, fontFamily: FONTS.mono, color: priceColor, lineHeight: 1,
          }}>
            {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}%
          </div>
          <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono, marginTop: 4 }}>
            {price.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  )
}


// ══ 카드형 피드 아이템 (2컬럼용) ══
function FeedCard({ d, onOpenModal, colors, dark, priceData, c }) {
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
      padding: '14px', borderRadius: 12, cursor: 'pointer',
      background: c.cardBg,
      border: `1px solid ${c.sep}`,
      display: 'flex', flexDirection: 'column',
      height: 120,
      transition: 'transform 0.1s',
    }}>
      {/* 1행: 등급배지 + 기업명 + 변동률 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 12,
          background: gc.bg, color: gc.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, fontFamily: FONTS.mono, flexShrink: 0,
        }}>
          {d.grade}
        </div>
        <span style={{
          fontSize: 15, fontWeight: 700, color: dark ? '#FAFAFA' : '#18181B',
          fontFamily: FONTS.serif, flex: 1, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {d.corp_name}
        </span>
        {hasPrice ? (
          <span style={{
            fontSize: 15, fontWeight: 700, fontFamily: FONTS.mono,
            color: priceColor, flexShrink: 0,
          }}>
            {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}%
          </span>
        ) : kstTime ? (
          <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono, flexShrink: 0 }}>{kstTime}</span>
        ) : null}
      </div>

      {/* 2행: 공시제목 */}
      <div style={{
        fontSize: 12, color: colors.textMuted, lineHeight: 1.5, flex: 1,
        overflow: 'hidden', textOverflow: 'ellipsis',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {d.report_nm}
      </div>

      {/* 3행: 가격 */}
      {hasPrice && (
        <div style={{
          fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono,
          marginTop: 'auto', paddingTop: 6,
        }}>
          {price.toLocaleString()}원
        </div>
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

import React, { useState, useEffect } from 'react'
import EmptyState from './EmptyState'
import FeedSkeleton from './skeletons/FeedSkeleton'
import DisclosureModal from './DisclosureModal'
import { useDisclosures } from '../hooks/useDisclosures'
import { FONTS, GRADE_COLORS, MARKET_LABELS, getBoxStyle } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'

export default function TodayPage({ onViewCard }) {
  const { colors, dark } = useTheme()
  const [tab, setTab] = useState('all') // 'all' | 'up' | 'down'
  const [modalRceptNo, setModalRceptNo] = useState(null)
  const {
    disclosures, counts, loading,
    gradeFilter, setGradeFilter,
    search, setSearch,
    prices,
  } = useDisclosures()

  const now = new Date()
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const dateStr = `${now.getMonth() + 1}.${now.getDate()} ${dayNames[now.getDay()]}`

  // 가격 데이터 있는 종목 분류
  const withPrice = disclosures
    .filter(d => prices[d.stock_code]?.change_pct != null)
    .map(d => ({ ...d, changePct: prices[d.stock_code].change_pct, price: prices[d.stock_code].price }))
  const upList = withPrice.filter(d => d.changePct > 0).sort((a, b) => b.changePct - a.changePct)
  const downList = withPrice.filter(d => d.changePct < 0).sort((a, b) => a.changePct - b.changePct)

  const TABS = [
    { key: 'all', label: '전체', count: counts.total || 0, color: colors.textPrimary, icon: null },
    { key: 'up', label: '상승', count: upList.length, color: '#DC2626', icon: <svg width="8" height="8" viewBox="0 0 8 8" fill="#DC2626"><path d="M4 1L7 6H1L4 1Z" /></svg> },
    { key: 'down', label: '하락', count: downList.length, color: '#2563EB', icon: <svg width="8" height="8" viewBox="0 0 8 8" fill="#2563EB"><path d="M4 7L1 2H7L4 7Z" /></svg> },
  ]

  return (
    <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto', padding: '16px 16px 80px', fontFamily: FONTS.body }}>

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontSize: 22, fontWeight: 700, fontFamily: FONTS.serif, color: colors.textPrimary }}>
          Today
        </span>
        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono }}>{dateStr}</span>
      </div>

      {/* 탭: 실시간 상승 / 실시간 하락 / 전체 */}
      <div style={{
        display: 'inline-flex', borderRadius: 12, overflow: 'hidden',
        background: dark ? '#1A1A1E' : '#F4F4F5', padding: 3, marginBottom: 16,
      }}>
        {TABS.map(t => {
          const active = tab === t.key
          return (
            <button key={t.key} className="touch-press" onClick={() => setTab(t.key)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: active ? (dark ? '#FAFAFA' : '#FFFFFF') : 'transparent',
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              fontSize: 13, fontWeight: active ? 700 : 500,
              color: active ? t.color : colors.textMuted,
              transition: 'all 0.15s',
            }}>
              {t.icon}
              {t.label}
              {t.count > 0 && (
                <span style={{ fontSize: 11, fontFamily: FONTS.mono, fontWeight: 700, opacity: active ? 1 : 0.6 }}>{t.count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* 탭 콘텐츠 */}
      <div key={tab} className="tab-fade">
        {tab === 'up' && (
          <RankedList items={upList} accentColor="#DC2626" loading={loading} onOpenModal={setModalRceptNo}
            emptyTitle="장중에 업데이트돼요" emptyDesc="장 운영 시간(09:00~15:30)에 공시 종목의 실시간 상승률이 표시됩니다" />
        )}
        {tab === 'down' && (
          <RankedList items={downList} accentColor="#2563EB" loading={loading} onOpenModal={setModalRceptNo}
            emptyTitle="장중에 업데이트돼요" emptyDesc="장 운영 시간(09:00~15:30)에 공시 종목의 실시간 하락률이 표시됩니다" />
        )}
        {tab === 'all' && (
          <AllDisclosures disclosures={disclosures} counts={counts} loading={loading} prices={prices}
            gradeFilter={gradeFilter} setGradeFilter={setGradeFilter}
            search={search} setSearch={setSearch} onOpenModal={setModalRceptNo} />
        )}
      </div>

      {modalRceptNo && (
        <DisclosureModal rcept_no={modalRceptNo} onClose={() => setModalRceptNo(null)} onViewCard={onViewCard} />
      )}
    </div>
  )
}

// ══ 순위 리스트 (상승/하락 공용) ══
function RankedList({ items, accentColor, loading, onOpenModal, emptyTitle, emptyDesc }) {
  const { colors, dark } = useTheme()
  const c = { sep: dark ? '#1E1E22' : '#F4F4F5', text1: dark ? '#FAFAFA' : '#18181B', text3: dark ? '#52525B' : '#A1A1AA' }

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ height: 56, borderRadius: 8, background: dark ? '#18181B' : '#F4F4F5', animation: 'pulse 1.4s ease-in-out infinite' }} />
      ))}
    </div>
  )

  if (items.length === 0) return (
    <div style={{ padding: '48px 20px', textAlign: 'center' }}>
      <div style={{ fontSize: 15, color: c.text1, fontWeight: 600, marginBottom: 6 }}>{emptyTitle}</div>
      <div style={{ fontSize: 13, color: c.text3 }}>{emptyDesc}</div>
    </div>
  )

  return items.map((d, i) => {
    const gc = GRADE_COLORS[d.grade] || { bg: '#A1A1AA', color: '#fff' }
    const kstTime = (() => {
      if (!d.created_at) return ''
      const dt = new Date(d.created_at)
      const kst = new Date(dt.getTime() + 9 * 60 * 60 * 1000)
      return `${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')}`
    })()
    return (
      <div key={d.rcept_no} className="touch-press" onClick={() => onOpenModal?.(d.rcept_no)} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 2px', cursor: 'pointer',
        borderBottom: i < items.length - 1 ? `1px solid ${c.sep}` : 'none',
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono, color: i < 3 ? accentColor : c.text3, minWidth: 20, textAlign: 'right' }}>{i + 1}</span>
        <span style={{ background: gc.bg, color: gc.color, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, fontFamily: FONTS.mono, flexShrink: 0 }}>{d.grade}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: c.text1, fontFamily: FONTS.serif }}>{d.corp_name}</span>
            {kstTime && <span style={{ fontSize: 10, color: c.text3, fontFamily: FONTS.mono }}>{kstTime}</span>}
          </div>
          <div style={{ fontSize: 11, color: c.text3, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.report_nm}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 20, fontWeight: 800, fontFamily: FONTS.mono, color: accentColor, lineHeight: 1 }}>
            {d.changePct > 0 ? '+' : ''}{d.changePct.toFixed(2)}%
          </div>
          <div style={{ fontSize: 11, color: c.text3, fontFamily: FONTS.mono, marginTop: 3 }}>{d.price?.toLocaleString()}</div>
        </div>
      </div>
    )
  })
}

// ══ 전체 공시 ══
function AllDisclosures({ disclosures, counts, loading, prices, gradeFilter, setGradeFilter, search, setSearch, onOpenModal }) {
  const { colors, dark } = useTheme()

  return (
    <>
      {/* 등급 필터 */}
      {!loading && counts.total > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {[
            { key: 'S', count: counts.S, color: GRADE_COLORS.S.bg },
            { key: 'A', count: counts.A, color: GRADE_COLORS.A.bg },
            { key: 'D', count: counts.D, color: GRADE_COLORS.D.bg },
          ].filter(g => g.count > 0).map(g => {
            const active = gradeFilter === g.key
            return (
              <button key={g.key} className="touch-press" onClick={() => setGradeFilter(active ? null : g.key)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: active ? `${g.color}20` : `${g.color}10`, minHeight: 32,
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: g.color, fontFamily: FONTS.mono }}>{g.key}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: g.color, fontFamily: FONTS.mono }}>{g.count}</span>
              </button>
            )
          })}
          {gradeFilter && (
            <button className="touch-press" onClick={() => setGradeFilter(null)} style={{
              padding: '4px 10px', borderRadius: 20, border: 'none', background: 'transparent',
              cursor: 'pointer', fontSize: 12, color: colors.textMuted,
            }}>초기화</button>
          )}
        </div>
      )}

      <SearchBar search={search} setSearch={setSearch} colors={colors} dark={dark} />

      {loading ? (
        <div style={{ padding: 12 }}><FeedSkeleton /></div>
      ) : disclosures.length === 0 ? (
        (gradeFilter || search) ? (
          <EmptyState icon="search" title="검색 결과가 없어요" action="초기화" onAction={() => { setGradeFilter(null); setSearch('') }} />
        ) : (
          <EmptyState icon="calendar" title="아직 오늘 공시가 없어요" description="보통 오전 9시부터 올라와요" />
        )
      ) : (
        disclosures.map((d, i) => (
          <FeedRow key={d.rcept_no} d={d} isLast={i === disclosures.length - 1}
            onOpenModal={onOpenModal} colors={colors} dark={dark}
            priceData={prices[d.stock_code]} />
        ))
      )}
    </>
  )
}


// TodayTopMovers removed — replaced by tab structure
function _unused_TodayTopMovers({ disclosures, prices, loading, onOpenModal }) {
  const { colors, dark } = useTheme()
  if (loading || !disclosures.length) return null

  // 가격 데이터 있는 종목만
  const withPrice = disclosures
    .filter(d => prices[d.stock_code]?.change_pct != null)
    .map(d => ({ ...d, changePct: prices[d.stock_code].change_pct, price: prices[d.stock_code].price }))

  if (withPrice.length === 0) return null

  const top10Up = [...withPrice].filter(d => d.changePct > 0).sort((a, b) => b.changePct - a.changePct).slice(0, 10)
  const top10Down = [...withPrice].filter(d => d.changePct < 0).sort((a, b) => a.changePct - b.changePct).slice(0, 10)

  const c = {
    sep: dark ? '#1E1E22' : '#F4F4F5',
    text1: dark ? '#FAFAFA' : '#18181B',
    text3: dark ? '#52525B' : '#A1A1AA',
  }

  const renderSection = (items, label, icon, accentColor) => {
    if (items.length === 0) return null
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
          {icon}
          <span style={{ fontSize: 13, fontWeight: 800, color: accentColor }}>{label}</span>
          <span style={{ fontSize: 11, color: c.text3 }}>{items.length}</span>
        </div>
        {items.map((d, i) => {
          const gc = GRADE_COLORS[d.grade] || { bg: '#A1A1AA', color: '#fff' }
          return (
            <div key={d.rcept_no} className="touch-press"
              onClick={() => onOpenModal?.(d.rcept_no)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 2px', cursor: 'pointer',
                borderBottom: i < items.length - 1 ? `1px solid ${c.sep}` : 'none',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, fontFamily: FONTS.mono, color: i < 3 ? accentColor : c.text3, minWidth: 18, textAlign: 'right' }}>{i + 1}</span>
              <span style={{ background: gc.bg, color: gc.color, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, fontFamily: FONTS.mono, flexShrink: 0 }}>{d.grade}</span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: c.text1, fontFamily: FONTS.serif, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.corp_name}</span>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, fontFamily: FONTS.mono, color: accentColor }}>
                  {d.changePct > 0 ? '+' : ''}{d.changePct.toFixed(2)}%
                </div>
                <div style={{ fontSize: 10, color: c.text3, fontFamily: FONTS.mono }}>{d.price?.toLocaleString()}</div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {renderSection(top10Up, '실시간 상승', <svg width="9" height="9" viewBox="0 0 8 8" fill="#DC2626"><path d="M4 1L7 6H1L4 1Z" /></svg>, '#DC2626')}
      {renderSection(top10Down, '실시간 하락', <svg width="9" height="9" viewBox="0 0 8 8" fill="#2563EB"><path d="M4 7L1 2H7L4 7Z" /></svg>, '#2563EB')}
    </div>
  )
}


function SearchBar({ search, setSearch, colors, dark }) {
  const [val, setVal] = useState('')
  const [focused, setFocused] = useState(false)
  return (
    <form onSubmit={e => { e.preventDefault(); setSearch(val) }} style={{ marginBottom: 12 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 12px', borderRadius: 12,
        border: `1px solid ${focused ? '#DC2626' : (dark ? '#232328' : '#EBEBEB')}`,
        background: dark ? '#141416' : '#F8F8FA',
        transition: 'border-color 0.15s',
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input type="text" placeholder="기업명 또는 공시 검색..." value={val} autoComplete="off"
          onChange={e => setVal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setSearch(val) }}
          style={{ flex: 1, padding: '10px 4px', fontSize: 14, border: 'none', background: 'transparent', color: colors.textPrimary, outline: 'none' }}
        />
        {val && <button type="button" onClick={() => { setVal(''); setSearch('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, padding: '4px', fontSize: 14 }}>x</button>}
      </div>
    </form>
  )
}


function FeedRow({ d, isLast, onOpenModal, colors, dark, priceData }) {
  const gc = GRADE_COLORS[d.grade] || { bg: '#94A3B8', color: '#fff' }
  const changePct = priceData?.change_pct
  const price = priceData?.price
  const hasPrice = price != null && price > 0
  const priceColor = changePct > 0 ? '#DC2626' : changePct < 0 ? '#2563EB' : colors.textMuted
  const timeStr = (() => {
    if (!d.created_at) return ''
    const dt = new Date(d.created_at)
    const kst = new Date(dt.getTime() + 9 * 60 * 60 * 1000)
    return `${String(kst.getUTCHours()).padStart(2, '0')}:${String(kst.getUTCMinutes()).padStart(2, '0')}`
  })()

  return (
    <div className="touch-press" onClick={() => onOpenModal?.(d.rcept_no)} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 4px', cursor: 'pointer',
      borderBottom: isLast ? 'none' : `1px solid ${dark ? '#1E1E22' : '#F4F4F5'}`,
      minHeight: 56,
    }}>
      <span style={{
        flexShrink: 0, background: gc.bg, color: gc.color,
        fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5,
        fontFamily: FONTS.mono, minWidth: 24, textAlign: 'center',
      }}>{d.grade}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            fontWeight: 700, fontSize: 15, color: dark ? '#FAFAFA' : '#18181B',
            fontFamily: FONTS.serif,
          }}>{d.corp_name}</span>
          {timeStr && (
            <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono, flexShrink: 0 }}>
              {timeStr}
            </span>
          )}
        </div>
        <div style={{
          fontSize: 12, color: colors.textMuted, marginTop: 2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{d.report_nm}</div>
      </div>

      {hasPrice ? (
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: FONTS.mono, color: priceColor }}>
            {changePct > 0 ? '+' : ''}{changePct.toFixed(2)}%
          </div>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono, marginTop: 1 }}>
            {price.toLocaleString()}
          </div>
        </div>
      ) : d.stock_code ? (
        <span style={{ flexShrink: 0, fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono, opacity: 0.5 }}>
          {d.stock_code}
        </span>
      ) : null}
    </div>
  )
}

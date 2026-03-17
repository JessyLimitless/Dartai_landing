import React, { useState, useEffect, useCallback } from 'react'
import EmptyState from './EmptyState'
import FeedSkeleton from './skeletons/FeedSkeleton'
import DisclosureModal from './DisclosureModal'
import MacroTicker from './MacroTicker'
import { useDisclosures } from '../hooks/useDisclosures'
import { FONTS, GRADE_COLORS, MARKET_LABELS, getBoxStyle } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'
import { API } from '../lib/api'

// ── 주가 추적 데이터 훅 ──
function getDateRange(days) {
  const today = new Date()
  const from = new Date(today)
  from.setDate(today.getDate() - days)
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { from: fmt(from), to: fmt(today) }
}

function getDateKey(iso) {
  return iso ? iso.slice(0, 10) : ''
}

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
  if (v == null) return '\u2014'
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

function fmtDateShort(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const days = ['\uC77C', '\uC6D4', '\uD654', '\uC218', '\uBAA9', '\uAE08', '\uD1A0']
  return `${d.getMonth() + 1}.${d.getDate()} ${days[d.getDay()]}`
}

// ── 메인 페이지 ──
export default function TodayPage({ onViewCard }) {
  const { colors, dark } = useTheme()
  const [tab, setTab] = useState('feed')
  const [modalRceptNo, setModalRceptNo] = useState(null)

  const now = new Date()
  const dayNames = ['\uC77C', '\uC6D4', '\uD654', '\uC218', '\uBAA9', '\uAE08', '\uD1A0']
  const dateStr = `${now.getMonth() + 1}\uC6D4 ${now.getDate()}\uC77C ${dayNames[now.getDay()]}\uC694\uC77C`

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 16px', fontFamily: FONTS.body }}>

      {/* 매크로 티커 — 최상단 */}
      <MacroTicker />

      {/* 탭 네비게이션 — 깔끔하게 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 0,
        marginBottom: 14,
      }}>
        {[
          { key: 'feed', label: '공시' },
          { key: 'track', label: '추적' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 20px', border: 'none', cursor: 'pointer',
            background: 'transparent',
            fontSize: 16, fontWeight: tab === t.key ? 800 : 400,
            fontFamily: FONTS.serif,
            color: tab === t.key ? colors.textPrimary : colors.textMuted,
            transition: 'all 0.15s',
            position: 'relative',
          }}>
            {t.label}
            {tab === t.key && (
              <div style={{
                position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                width: 20, height: 3, borderRadius: 2,
                background: '#DC2626',
              }} />
            )}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 12, color: colors.textMuted }}>{dateStr}</span>
      </div>

      <div key={tab} className="tab-fade">
        {tab === 'feed' ? (
          <FeedView onViewCard={onViewCard} onOpenModal={setModalRceptNo} />
        ) : (
          <TrackView onOpenModal={setModalRceptNo} />
        )}
      </div>

      {modalRceptNo && (
        <DisclosureModal
          rcept_no={modalRceptNo}
          onClose={() => setModalRceptNo(null)}
          onViewCard={onViewCard}
        />
      )}
    </div>
  )
}

// ══ 탭 1: 공시 피드 ══
function FeedView({ onViewCard, onOpenModal }) {
  const { colors, dark } = useTheme()
  const {
    disclosures, counts, loading,
    gradeFilter, setGradeFilter,
    search, setSearch,
    prices,
  } = useDisclosures()
  const [showAll, setShowAll] = useState(false)

  const [pricesLoading, setPricesLoading] = useState(true)
  useEffect(() => {
    if (Object.keys(prices).length > 0 || !loading) {
      const t = setTimeout(() => setPricesLoading(false), 300)
      return () => clearTimeout(t)
    }
  }, [prices, loading])

  // S/A 하이라이트 (상위 등급만)
  const highlights = disclosures.filter(d => d.grade === 'S' || d.grade === 'A').slice(0, 3)
  const rest = gradeFilter || search
    ? disclosures
    : showAll ? disclosures : disclosures.slice(0, 15)

  return (
    <>
      {/* 오늘의 요약 — 깔끔하게 */}
      {!loading && counts.total > 0 && !gradeFilter && !search && (
        <div className="card-stagger" style={{ marginBottom: 12 }}>
          {/* 등급 요약 인라인 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            marginBottom: 12, padding: '0 2px',
          }}>
            <span style={{
              fontSize: 13, fontWeight: 600, color: colors.textMuted,
            }}>오늘 {counts.total}건</span>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { key: 'S', count: counts.S, color: GRADE_COLORS.S.bg },
                { key: 'A', count: counts.A, color: GRADE_COLORS.A.bg },
                { key: 'D', count: counts.D, color: GRADE_COLORS.D.bg },
              ].filter(g => g.count > 0).map(g => (
                <span key={g.key} className="touch-press" onClick={() => setGradeFilter(g.key)} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 20, cursor: 'pointer',
                  background: dark ? `${g.color}18` : `${g.color}10`,
                }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: g.color, fontFamily: FONTS.mono }}>{g.key}</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: g.color, fontFamily: FONTS.mono }}>{g.count}</span>
                </span>
              ))}
            </div>
            )}
          </div>
          {/* 핵심 공시 미리보기 */}
          {highlights.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {highlights.map((d, i) => {
                const gc = GRADE_COLORS[d.grade] || { bg: '#A1A1AA', color: '#fff' }
                const pd = prices[d.stock_code]
                const changePct = pd?.change_pct
                return (
                  <div key={d.rcept_no} onClick={() => onOpenModal?.(d.rcept_no)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 0', cursor: 'pointer',
                    borderTop: i > 0 ? `1px solid ${dark ? '#1E1E22' : '#F4F4F5'}` : 'none',
                  }}>
                    <span style={{
                      background: gc.bg, color: gc.color,
                      fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                      fontFamily: FONTS.mono, flexShrink: 0,
                    }}>{d.grade}</span>
                    <span style={{
                      fontSize: 14, fontWeight: 700, color: colors.textPrimary,
                      fontFamily: FONTS.serif, flexShrink: 0,
                    }}>{d.corp_name}</span>
                    <span style={{
                      fontSize: 12, color: colors.textMuted, flex: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{d.report_nm}</span>
                    {changePct != null && (
                      <span style={{
                        fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono, flexShrink: 0,
                        color: changePct > 0 ? '#DC2626' : changePct < 0 ? '#2563EB' : colors.textMuted,
                      }}>{changePct > 0 ? '+' : ''}{changePct.toFixed(2)}%</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 필터 활성 시 초기화 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {gradeFilter && (
          <button className="touch-press" onClick={() => setGradeFilter(null)} style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '6px 12px', borderRadius: 20,
            border: `1.5px solid ${GRADE_COLORS[gradeFilter]?.bg || '#DC2626'}`,
            background: `${GRADE_COLORS[gradeFilter]?.bg || '#DC2626'}18`,
            cursor: 'pointer', fontSize: 12, fontWeight: 700,
            color: GRADE_COLORS[gradeFilter]?.bg || '#DC2626', minHeight: 36,
          }}>
            {gradeFilter} 등급 필터 x
          </button>
        )}
      </div>

      <SearchBar search={search} setSearch={setSearch} colors={colors} dark={dark} />

      <div style={{ ...getBoxStyle(dark, 'table') }}>
        {loading ? (
          <div style={{ padding: 12 }}><FeedSkeleton /></div>
        ) : disclosures.length === 0 ? (
          (gradeFilter || search) ? (
            <EmptyState icon="search" title="검색 결과가 없어요"
              description={`${gradeFilter ? `등급: ${gradeFilter}` : ''}${gradeFilter && search ? ' · ' : ''}${search ? `"${search}"` : ''} 조건에 맞는 공시가 없습니다`}
              action="초기화" onAction={() => { setGradeFilter(null); setSearch('') }} />
          ) : (
            <EmptyState icon="calendar" title="아직 오늘 공시가 없어요"
              description="보통 오전 9시부터 공시가 올라와요. 조금만 기다려주세요!" />
          )
        ) : (
          <>
            {rest.map((d, i) => (
              <FeedRow key={d.rcept_no} d={d} isLast={i === rest.length - 1 && (showAll || gradeFilter || search)}
                onOpenModal={onOpenModal} colors={colors} dark={dark}
                priceData={prices[d.stock_code]} pricesLoading={pricesLoading && !prices[d.stock_code]} />
            ))}
            {/* 더보기 */}
            {!showAll && !gradeFilter && !search && disclosures.length > 15 && (
              <button onClick={() => setShowAll(true)} style={{
                width: '100%', padding: '14px', border: 'none',
                background: 'transparent', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: colors.textMuted,
                borderTop: `1px solid ${dark ? '#1E1E22' : '#F4F4F5'}`,
                minHeight: 44,
              }}>
                전체 {disclosures.length}건 보기
              </button>
            )}
          </>
        )}
      </div>
    </>
  )
}

// ══ 탭 2: 주가 추적 ══
const PERIODS = [
  { key: 5, label: '5D' },
  { key: 10, label: '10D' },
  { key: 20, label: '1M' },
]

function TrackView({ onOpenModal }) {
  const { colors, dark } = useTheme()
  const [days, setDays] = useState(5)
  const recent = useRecentTracks(days)

  const top3 = [...recent.tracks]
    .filter(t => t.change_close != null)
    .sort((a, b) => (b.change_close ?? 0) - (a.change_close ?? 0))
    .slice(0, 3)

  const upCount = recent.tracks.filter(t => (t.change_close ?? 0) > 0).length
  const winRate = recent.total > 0 ? Math.round(upCount / recent.total * 100) : 0
  const avgChange = recent.total > 0
    ? recent.tracks.reduce((s, t) => s + (t.change_close ?? 0), 0) / recent.total : 0

  const box = getBoxStyle(dark, 'section')
  const c = {
    sep: dark ? '#1E1E22' : '#F4F4F5',
    hover: dark ? 'rgba(255,255,255,0.03)' : '#FAFBFC',
    text1: dark ? '#FAFAFA' : '#18181B',
    text3: dark ? '#52525B' : '#A1A1AA',
  }

  const [sortCol, setSortCol] = useState('created_at')
  const [sortAsc, setSortAsc] = useState(false)
  const handleSort = col => {
    if (sortCol === col) setSortAsc(p => !p)
    else { setSortCol(col); setSortAsc(false) }
  }
  const sorted = [...recent.tracks].sort((a, b) => {
    if (sortCol === 'created_at') {
      return sortAsc ? (a.created_at || '').localeCompare(b.created_at || '') : (b.created_at || '').localeCompare(a.created_at || '')
    }
    return sortAsc ? (a[sortCol] ?? -Infinity) - (b[sortCol] ?? -Infinity) : (b[sortCol] ?? -Infinity) - (a[sortCol] ?? -Infinity)
  })

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{
          display: 'inline-flex', borderRadius: 8,
          border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`, overflow: 'hidden',
        }}>
          {PERIODS.map(p => (
            <button key={p.key} onClick={() => setDays(p.key)} style={{
              padding: '5px 14px', border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 600, fontFamily: FONTS.mono,
              background: days === p.key ? (dark ? '#FAFAFA' : '#18181B') : 'transparent',
              color: days === p.key ? (dark ? '#18181B' : '#FAFAFA') : c.text3,
              borderRight: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
            }}>{p.label}</button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: c.text3, fontFamily: FONTS.mono }}>{recent.total}\uAC74</span>
          <span style={{ fontSize: 11, color: pctColor(avgChange), fontFamily: FONTS.mono, fontWeight: 700 }}>
            \uD3C9\uADE0 {fmtPct(avgChange)}
          </span>
          <span style={{ fontSize: 11, color: c.text3, fontFamily: FONTS.mono }}>\uC2B9\uB960 {winRate}%</span>
        </div>
      </div>

      {/* TOP 3 */}
      {top3.length > 0 && (
        <div style={{ ...box, padding: 0, marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: c.text3, letterSpacing: '0.08em', padding: '8px 12px 0' }}>
            TOP MOVERS
          </div>
          {top3.map((t, i) => {
            const gc = GRADE_COLORS[t.grade] || { bg: '#A1A1AA', color: '#fff' }
            const change = t.change_close ?? 0
            return (
              <div key={t.rcept_no || i} onClick={() => onOpenModal?.(t.rcept_no)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', cursor: 'pointer',
                borderTop: i > 0 ? `1px solid ${c.sep}` : 'none',
                transition: 'background 0.1s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = c.hover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                  background: i === 0 ? 'rgba(220,38,38,0.1)' : c.sep,
                  color: i === 0 ? '#DC2626' : c.text3,
                  fontSize: 10, fontWeight: 800, fontFamily: FONTS.mono,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{i + 1}</span>
                <span style={{
                  background: gc.bg, color: gc.color,
                  fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                  fontFamily: FONTS.mono, flexShrink: 0,
                }}>{t.grade}</span>
                <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: c.text1, fontFamily: FONTS.serif, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {t.corp_name}
                </span>
                <span style={{ fontSize: 14, fontWeight: 800, fontFamily: FONTS.mono, color: pctColor(change), flexShrink: 0 }}>
                  {fmtPct(change)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* 테이블 */}
      {recent.loading ? (
        <div style={{ ...getBoxStyle(dark, 'table') }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{
              height: 42, display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10,
              borderBottom: i < 5 ? `1px solid ${c.sep}` : 'none',
            }}>
              <div style={{ width: 40, height: 8, borderRadius: 4, background: c.sep, animation: 'pulse 1.4s ease-in-out infinite' }} />
              <div style={{ width: 80, height: 8, borderRadius: 4, background: c.sep, animation: 'pulse 1.4s ease-in-out infinite' }} />
              <div style={{ flex: 1 }} />
              <div style={{ width: 50, height: 8, borderRadius: 4, background: c.sep, animation: 'pulse 1.4s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      ) : recent.tracks.length === 0 ? (
        <div style={{ ...box, padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: c.text1, fontWeight: 600, marginBottom: 6 }}>
            아직 추적 데이터가 없어요
          </div>
          <div style={{ fontSize: 13, color: c.text3, lineHeight: 1.6 }}>
            S/A 등급 공시가 발생하면 자동으로 주가를 추적해요
          </div>
        </div>
      ) : (
        <div style={{ ...getBoxStyle(dark, 'table'), overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <thead>
              <tr>
                {[
                  { key: 'created_at', label: '\uB0A0\uC9DC', w: 72, align: 'left', sort: true },
                  { key: 'corp_name', label: '\uC885\uBAA9', w: null, align: 'left', sort: false },
                  { key: 'grade', label: '\uB4F1\uAE09', w: 44, align: 'center', sort: false },
                  { key: 'change_close', label: '\uBCC0\uB3D9\uB960', w: 80, align: 'right', sort: true },
                ].map(col => (
                  <th key={col.key} onClick={col.sort ? () => handleSort(col.key) : undefined} style={{
                    padding: '8px 12px', fontSize: 10, fontWeight: 700,
                    color: sortCol === col.key ? c.text1 : c.text3,
                    textAlign: col.align, width: col.w || undefined,
                    cursor: col.sort ? 'pointer' : 'default',
                    borderBottom: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
                    background: dark ? '#18181B' : '#FAFAFA',
                  }}>
                    {col.label}
                    {col.sort && <span style={{ fontSize: 10, marginLeft: 2 }}>{sortCol === col.key ? (sortAsc ? '\u2191' : '\u2193') : '\u2195'}</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(() => {
                let prevDate = null
                return sorted.map((t, i) => {
                  const gc = GRADE_COLORS[t.grade] || { bg: '#A1A1AA', color: '#fff' }
                  const change = t.change_close ?? 0
                  const dateKey = getDateKey(t.created_at)
                  const isNewDate = dateKey !== prevDate && sortCol === 'created_at'
                  prevDate = dateKey
                  const isLast = i === sorted.length - 1
                  return (
                    <React.Fragment key={`${t.rcept_no}-${i}`}>
                      {isNewDate && i > 0 && <tr><td colSpan={4} style={{ padding: 0, borderBottom: `2px solid ${dark ? '#3F3F46' : '#E0E0E0'}` }} /></tr>}
                      <tr onClick={() => onOpenModal?.(t.rcept_no)} style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = c.hover}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '8px 12px', borderBottom: isLast ? 'none' : `1px solid ${c.sep}` }}>
                          <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: c.text3 }}>{fmtDateShort(t.created_at)}</span>
                        </td>
                        <td style={{ padding: '8px 12px', borderBottom: isLast ? 'none' : `1px solid ${c.sep}` }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: c.text1, fontFamily: FONTS.serif }}>{t.corp_name}</div>
                          <div style={{ fontSize: 10, color: c.text3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{t.report_nm}</div>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', borderBottom: isLast ? 'none' : `1px solid ${c.sep}` }}>
                          <span style={{ background: gc.bg, color: gc.color, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, fontFamily: FONTS.mono }}>{t.grade}</span>
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', borderBottom: isLast ? 'none' : `1px solid ${c.sep}` }}>
                          <span style={{
                            fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: pctColor(change),
                            background: change > 0 ? 'rgba(220,38,38,0.06)' : change < 0 ? 'rgba(37,99,235,0.06)' : 'transparent',
                            padding: change !== 0 ? '2px 6px' : '0', borderRadius: 5,
                          }}>{fmtPct(change)}</span>
                        </td>
                      </tr>
                    </React.Fragment>
                  )
                })
              })()}
            </tbody>
          </table>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </>
  )
}

// ══ 공통 컴포넌트 ══
function SearchBar({ search, setSearch, colors, dark }) {
  const [val, setVal] = useState('')
  const [focused, setFocused] = useState(false)
  return (
    <form onSubmit={e => { e.preventDefault(); setSearch(val) }} style={{ marginBottom: 10 }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 10px', borderRadius: 10,
        border: `1px solid ${focused ? '#DC2626' : (dark ? '#27272A' : '#E4E4E7')}`,
        background: dark ? '#18181B' : '#FAFAFA',
        transition: 'border-color 0.15s',
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input type="text" placeholder="\uAE30\uC5C5\uBA85 \uB610\uB294 \uACF5\uC2DC \uAC80\uC0C9..." value={val}
          onChange={e => setVal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setSearch(val) }}
          style={{ flex: 1, padding: '8px 4px', fontSize: 13, border: 'none', background: 'transparent', color: colors.textPrimary, outline: 'none' }}
        />
        {val && <button type="button" onClick={() => { setVal(''); setSearch('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: colors.textMuted, padding: '4px', fontSize: 13 }}>x</button>}
      </div>
    </form>
  )
}

function FeedRow({ d, isLast, onOpenModal, colors, dark, priceData, pricesLoading }) {
  const gc = GRADE_COLORS[d.grade] || { bg: '#94A3B8', color: '#fff' }
  const market = MARKET_LABELS[d.corp_cls] || ''
  const changePct = priceData?.change_pct
  const price = priceData?.price
  const hasPrice = price != null && price > 0
  const priceColor = changePct > 0 ? '#E8364E' : changePct < 0 ? '#3B82F6' : colors.textMuted

  return (
    <div className="touch-press" onClick={() => onOpenModal?.(d.rcept_no)} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px', cursor: 'pointer',
      borderBottom: isLast ? 'none' : `1px solid ${dark ? '#27272A' : '#F4F4F5'}`,
      transition: 'background 0.12s',
      minHeight: 56,
    }}
      onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.03)' : '#F9FAFB'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      <span style={{
        flexShrink: 0, background: gc.bg, color: gc.color,
        fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 5,
        fontFamily: FONTS.mono, minWidth: 24, textAlign: 'center',
      }}>{d.grade}</span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
          <span style={{
            fontWeight: 700, fontSize: 14, color: dark ? '#FAFAFA' : '#18181B',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: FONTS.serif,
          }}>{d.corp_name}</span>
          {market && <span style={{
            fontSize: 8, fontWeight: 600, padding: '1px 4px', borderRadius: 3,
            background: dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5', color: colors.textMuted, flexShrink: 0,
          }}>{market}</span>}
        </div>
        <div style={{ fontSize: 11, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {d.report_nm}
        </div>
      </div>

      {hasPrice ? (
        <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 64 }}>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: FONTS.mono, color: priceColor }}>
            {changePct > 0 ? '+' : ''}{changePct?.toFixed(2)}%
          </div>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono, marginTop: 1 }}>
            {price?.toLocaleString()}
          </div>
        </div>
      ) : pricesLoading && d.stock_code ? (
        <div style={{ flexShrink: 0, textAlign: 'right', minWidth: 50 }}>
          <div style={{
            width: 48, height: 10, borderRadius: 4, marginBottom: 4, marginLeft: 'auto',
            background: dark ? '#27272A' : '#F0F0F2',
            animation: 'pulse 1.4s ease-in-out infinite',
          }} />
          <div style={{
            width: 36, height: 8, borderRadius: 3, marginLeft: 'auto',
            background: dark ? '#27272A' : '#F0F0F2',
            animation: 'pulse 1.4s ease-in-out infinite', animationDelay: '0.2s',
          }} />
        </div>
      ) : d.stock_code ? (
        <span style={{ flexShrink: 0, fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono, opacity: 0.5 }}>
          {d.stock_code}
        </span>
      ) : null}
    </div>
  )
}

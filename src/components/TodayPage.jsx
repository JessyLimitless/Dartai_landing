import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import EmptyState from './EmptyState'
import FeedSkeleton from './skeletons/FeedSkeleton'
import DisclosureModal from './DisclosureModal'
import { useDisclosures } from '../hooks/useDisclosures'
import { FONTS, GRADE_COLORS, PREMIUM } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'
import { API } from '../lib/api'

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

  // 공시 후 상승 종목
  // 장중: base_price(공시 시점) 대비 현재가 변동률
  // 장외: base_price 없거나 변동 0이면 전일 대비(change_pct)로 폴백
  const risers = useMemo(() => {
    const seen = new Set()
    return todayDisclosures
      .filter(d => {
        // 투자주의/경고/위험 필터 — KIND 인코딩 깨짐 대응
        const rn = d.report_nm || ''
        const rno = d.rcept_no || ''
        if (rno.startsWith('KIND_') || d.source === 'KIND') {
          if (d.grade === 'D') return false
        } else if (rno.startsWith('NAVER_')) {
          if (/소수계좌|소수지점/.test(rn)) { /* 포함 */ }
          else return false
        } else {
          if (/투자주의|투자경고|투자위험/.test(rn)) return false
        }
        const bp = d.base_price
        const pd = prices[d.stock_code]
        if (!pd?.price || pd.price <= 0) return false
        // base_price 기준 변동률
        if (bp && bp > 0) {
          const impact = (pd.price - bp) / bp * 100
          if (impact > 0.5) return !seen.has(d.stock_code) && seen.add(d.stock_code)
        }
        // 폴백: 전일 대비 변동률 (장외 또는 base_price 변동 미미할 때)
        if (pd.change_pct > 0.5) return !seen.has(d.stock_code) && seen.add(d.stock_code)
        return false
      })
      .map(d => {
        const pd = prices[d.stock_code]
        const bp = d.base_price
        const currentPrice = pd.price
        // base_price 기준 우선, 변동 미미하면 전일 대비 사용
        let impact = 0
        let useBase = false
        if (bp && bp > 0) {
          impact = (currentPrice - bp) / bp * 100
          useBase = Math.abs(impact) > 0.5
        }
        if (!useBase) {
          impact = pd.change_pct || 0
        }
        return { ...d, changePct: Math.round(impact * 10) / 10, price: currentPrice, basePrice: useBase ? bp : 0 }
      })
      .sort((a, b) => b.changePct - a.changePct)
      .slice(0, 10)
  }, [todayDisclosures, prices])

  // DART Pick
  const [pick, setPick] = useState(null)
  useEffect(() => {
    fetch(`${API}/api/pick/today`)
      .then(r => r.json())
      .then(d => { if (d?.corp_name) setPick(d) })
      .catch(() => {})
  }, [])


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
            {(() => {
              const kstMin = kstNow.getUTCMinutes()
              const isMarketOpen = (kstHour > 9 || (kstHour === 9 && kstMin >= 0)) && (kstHour < 15 || (kstHour === 15 && kstMin <= 30))
              return (
                <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {dateStr}{kstHour < 9 && ' · 09시에 오늘 공시로 전환'}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                    color: isMarketOpen ? '#16A34A' : '#9CA3AF',
                    background: isMarketOpen ? 'rgba(22,163,74,0.08)' : (dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                  }}>
                    <span style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: isMarketOpen ? '#16A34A' : '#9CA3AF',
                      animation: isMarketOpen ? 'pulse 1.4s ease-in-out infinite' : 'none',
                    }} />
                    {isMarketOpen ? 'LIVE' : '마감'}
                  </span>
                </div>
              )
            })()}
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

      {/* ── 오늘의 DART Pick ── */}
      {pick && (
        <div className="today-pad" style={{ paddingTop: 20 }}>
          <div className="touch-press" onClick={() => {
            if (pick.stock_code) {
              const cc = pick.corp_code || pick.stock_code
              window.location.href = `/deep-dive/${cc}`
            }
          }} style={{
            padding: '16px 18px', borderRadius: 14, cursor: 'pointer',
            background: dark
              ? 'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.02))'
              : 'linear-gradient(135deg, rgba(220,38,38,0.06), rgba(220,38,38,0.02))',
            border: `1px solid ${dark ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.12)'}`,
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4,
                background: PREMIUM.accent, color: '#fff', letterSpacing: '0.05em',
              }}>DART PICK</span>
              <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono }}>
                {pick.date}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{
                  fontSize: 18, fontWeight: 800, color: colors.textPrimary,
                  fontFamily: FONTS.serif, marginBottom: 3,
                }}>{pick.corp_name}</div>
                <div style={{ fontSize: 13, color: colors.textMuted }}>
                  {pick.reason}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
                <div style={{
                  fontSize: 16, fontWeight: 700, fontFamily: FONTS.mono,
                  color: colors.textPrimary,
                }}>{pick.price}</div>
                <div style={{
                  fontSize: 11, color: colors.textMuted, marginTop: 2,
                }}>PBR {pick.pbr}</div>
              </div>
            </div>
            {pick.detail && (
              <div style={{
                fontSize: 12, color: colors.textMuted, marginTop: 10,
                paddingTop: 10, borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                lineHeight: 1.5,
              }}>{pick.detail}</div>
            )}
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
          <div style={{ flex: 1 }} />
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
              const currentPrice = pd?.price || 0
              const bp = d.base_price
              // 공시 대비 변동률 → 없으면 전일 대비 폴백
              const changePct = (bp && bp > 0 && currentPrice > 0)
                ? Math.round((currentPrice - bp) / bp * 1000) / 10
                : (pd?.change_pct ?? null)
              const price = currentPrice
              const hasPrice = price != null && price > 0
              const hasChange = changePct != null
              const priceColor = hasChange ? (changePct > 0 ? '#DC2626' : changePct < 0 ? '#2563EB' : colors.textMuted) : colors.textMuted

              return (
                <div key={d.rcept_no} className="touch-press today-row"
                  onClick={() => setModalRceptNo(d.rcept_no)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    cursor: 'pointer',
                    borderBottom: i < visibleItems.length - 1 ? `1px solid ${lineSep}` : 'none',
                    minHeight: 64,
                    padding: '18px 0',
                  }}>
                  <span className="today-rank" style={{
                    fontWeight: 700, fontFamily: FONTS.mono, color: gc.bg, textAlign: 'right',
                  }}>{i + 1}</span>
                  <div className="today-badge" style={{
                    borderRadius: '50%', flexShrink: 0,
                    background: gc.bg, color: gc.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontFamily: FONTS.mono,
                  }}>{d.grade}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="today-corp" style={{
                        fontWeight: 700, color: colors.textPrimary, fontFamily: FONTS.serif,
                      }}>{d.corp_name}</span>
                      {(() => {
                        if (!d.created_at) return null
                        const dt = new Date(d.created_at)
                        const kst = new Date(dt.getTime() + 9 * 60 * 60 * 1000)
                        const t = `${String(kst.getUTCHours()).padStart(2,'0')}:${String(kst.getUTCMinutes()).padStart(2,'0')}`
                        return <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono, flexShrink: 0 }}>{t}</span>
                      })()}
                    </div>
                    <div className="today-sub" style={{
                      color: colors.textMuted, marginTop: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {d.report_nm}
                    </div>
                  </div>
                  <div style={{ flexShrink: 0, textAlign: 'right' }}>
                    {hasPrice && hasChange ? (
                      <>
                        <div className="today-right-num" style={{
                          fontWeight: 700, fontFamily: FONTS.mono, color: priceColor,
                        }}>
                          {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}%
                        </div>
                        <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono, marginTop: 2 }}>
                          {price.toLocaleString()}
                        </div>
                      </>
                    ) : hasPrice ? (
                      <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
                        {price.toLocaleString()}
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

      {/* ── 실시간 급등 플로팅 위젯 (우측 사이드) ── */}
      {risers.length > 0 && (
        <LiveRiserWidget risers={risers} dark={dark} colors={colors}
          onOpenModal={setModalRceptNo} />
      )}


      {modalRceptNo && (
        <DisclosureModal rcept_no={modalRceptNo} onClose={() => setModalRceptNo(null)} onViewCard={onViewCard} />
      )}

      <style>{`
        .today-pad { padding-left: 24px; padding-right: 24px; }
        .today-title { font-size: 22px; }
        .today-section-title { font-size: 20px; }
        .today-row { gap: 16px; }
        .today-rank { font-size: 17px; min-width: 24px; display: inline-block; }
        .today-badge { width: 48px; height: 48px; font-size: 16px; }
        .today-corp { font-size: 17px; }
        .today-sub { font-size: 14px; }
        .today-right-num { font-size: 17px; }
        @media (max-width: 768px) { .today-pad { padding-left: 20px; padding-right: 20px; } }
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
        @media (max-width: 360px) {
          .today-pad { padding-left: 12px; padding-right: 12px; }
          .today-rank { display: none; }
          .today-badge { width: 36px; height: 36px; font-size: 13px; }
          .today-corp { font-size: 14px; }
          .today-sub { font-size: 12px; }
          .today-right-num { font-size: 14px; }
        }

        /* 급등 패널 — 데스크톱: 우측 상단 고정 */
        .riser-panel {
          top: 64px; right: max(12px, calc((100vw - 640px) / 2 - 220px));
          width: 200px;
        }
        /* 태블릿: 우측 고정 */
        @media (max-width: 1024px) {
          .riser-panel { right: 8px; width: 180px; }
        }
        /* 모바일: 숨기고 FAB로 전환 */
        @media (max-width: 768px) {
          .riser-panel { display: none !important; }
          .riser-fab { display: flex !important; }
        }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fab-glow { 0%,100%{box-shadow:0 4px 20px rgba(220,38,38,0.35)} 50%{box-shadow:0 4px 28px rgba(220,38,38,0.5)} }
        @keyframes sheet-up { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .riser-sheet-enter { animation: sheet-up 0.3s cubic-bezier(0.32,0.72,0,1); }
        .riser-item:hover { background: ${dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'} !important; }
      `}</style>
    </div>
  )
}


// ══ 공시 후 급등 — 데스크톱: 우측 고정 패널, 모바일: FAB + 바텀시트 ══
function LiveRiserWidget({ risers, dark, colors, onOpenModal }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const lineSep = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

  const maxPct = Math.max(...risers.map(d => d.changePct), 1)
  const hero = risers[0]
  const rest = risers.slice(1)

  const SummaryLine = ({ text, full }) => {
    if (!text) return null
    const first = text.split('\n')[0]
    // 시그널 태그 파싱: {UP} {DOWN} {NEUTRAL} {WARN}
    const sigMatch = first.match(/^\{(UP|DOWN|NEUTRAL|WARN)\}\s*/)
    const sigMap = { UP: '#DC2626', DOWN: '#2563EB', NEUTRAL: '#16A34A', WARN: '#D97706' }
    const sigColor = sigMatch ? sigMap[sigMatch[1]] : null
    const cleaned = (sigMatch ? first.slice(sigMatch[0].length) : first)
      .replace(/^[\[（(]\w등급[\]）)]\s*/, '').replace(/\*+/g, '').trim()
    if (!cleaned) return null
    if (full) {
      const lines = text.split('\n').slice(1).filter(l => l.trim())
      return (
        <div style={{ marginTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {sigColor && <span style={{ width: 6, height: 6, borderRadius: 3, background: sigColor, flexShrink: 0 }} />}
            <span style={{ fontSize: 11, fontWeight: 700, color: sigColor || colors.textPrimary, lineHeight: 1.3 }}>{cleaned}</span>
          </div>
          {lines.length > 0 && (
            <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 4, lineHeight: 1.5 }}>
              {lines.slice(0, 3).map((l, i) => <div key={i}>{l.trim()}</div>)}
            </div>
          )}
        </div>
      )
    }
    return (
      <div style={{
        fontSize: 10, color: colors.textMuted, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4,
        lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {sigColor && <span style={{ width: 5, height: 5, borderRadius: '50%', background: sigColor, flexShrink: 0 }} />}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cleaned}</span>
      </div>
    )
  }

  // 급등 패널은 히어로 없이 동일한 리스트 형태로 통일

  const RiserList = ({ onItemClick, skipHero }) => {
    const items = skipHero ? rest : risers
    return (
      <div style={{ padding: '4px 0' }}>
        {items.map((d, idx) => {
          const i = skipHero ? idx + 1 : idx
          return (
            <div key={d.rcept_no} className="touch-press riser-item"
              onClick={() => onItemClick?.(d.rcept_no)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 12px', cursor: 'pointer',
              }}>
              <span style={{
                fontSize: 10, fontWeight: 700, fontFamily: FONTS.mono,
                color: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                width: 14, textAlign: 'right', flexShrink: 0,
              }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12, fontWeight: 700, color: colors.textPrimary,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{d.corp_name}</div>
              </div>
              <span style={{
                fontSize: 12, fontWeight: 700, fontFamily: FONTS.mono,
                color: '#DC2626', flexShrink: 0,
              }}>+{d.changePct.toFixed(1)}%</span>
            </div>
          )
        })}
      </div>
    )
  }

  const PanelHeader = ({ onClose, onToggle, isCollapsed }) => {
    const topPct = risers[0]?.changePct
    const kstNow2 = new Date(Date.now() + 9 * 3600000)
    const h = kstNow2.getUTCHours(), m = kstNow2.getUTCMinutes()
    const live = (h > 9 || (h === 9 && m >= 0)) && (h < 15 || (h === 15 && m <= 30))

    return (
      <div style={{
        padding: '10px 12px',
        borderBottom: isCollapsed ? 'none' : `1px solid ${lineSep}`,
        display: 'flex', alignItems: 'center', gap: 8,
        cursor: onToggle ? 'pointer' : 'default',
      }} onClick={onToggle}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="10" height="10" viewBox="0 0 12 12"><path d="M6 1L10 7H2Z" fill="#DC2626"/></svg>
            <span style={{ fontSize: 11, fontWeight: 800, color: colors.textPrimary, letterSpacing: '-0.2px' }}>공시 후 실시간 급등</span>
            <span style={{
              fontSize: 9, fontWeight: 700, fontFamily: FONTS.mono,
              color: '#DC2626',
            }}>{topPct ? `+${topPct.toFixed(1)}%` : risers.length}</span>
            {live && (
              <span style={{
                width: 5, height: 5, borderRadius: '50%', background: '#16A34A',
                animation: 'pulse 1.4s ease-in-out infinite', marginLeft: -2,
              }} />
            )}
          </div>
        </div>
        {onToggle && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round"
            style={{ transition: 'transform 0.2s', transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}>
            <polyline points="18 15 12 9 6 15" />
          </svg>
        )}
        {onClose && (
          <button onClick={(e) => { e.stopPropagation(); onClose() }} style={{
            background: 'none', border: 'none',
            cursor: 'pointer', color: colors.textMuted, fontSize: 14, padding: '0 2px', flexShrink: 0,
          }}>✕</button>
        )}
      </div>
    )
  }

  return (
    <>
      {/* 데스크톱: 우측 고정 패널 (접기/펼치기) */}
      <div className="riser-panel" style={{
        position: 'fixed', zIndex: 90,
        background: dark ? '#141416' : '#FFFFFF',
        borderRadius: 12,
        border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#EBEBED'}`,
        boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.3)' : '0 4px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        maxHeight: 'calc(100vh - 80px)',
        overflowY: 'auto',
      }}>
        <PanelHeader onToggle={() => setCollapsed(!collapsed)} isCollapsed={collapsed} />
        {!collapsed && <RiserList onItemClick={onOpenModal} />}
      </div>

      {/* 모바일: FAB 버튼 */}
      <button className="riser-fab touch-press" onClick={() => setMobileOpen(true)} style={{
        display: 'none', position: 'fixed', zIndex: 90,
        right: 16, bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        height: 36, borderRadius: 18, padding: '0 14px 0 10px',
        background: '#DC2626',
        color: '#fff', border: 'none',
        cursor: 'pointer', gap: 5,
        alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(220,38,38,0.25)',
      }}>
        <svg width="10" height="10" viewBox="0 0 12 12"><path d="M6 1L10 7H2Z" fill="#fff" opacity="0.9"/></svg>
        <span style={{ fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono, letterSpacing: '-0.3px' }}>
          +{risers[0]?.changePct.toFixed(1)}%
        </span>
      </button>

      {/* 모바일: 바텀시트 */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 95,
            background: 'rgba(0,0,0,0.4)',
          }} />
          <div className="riser-sheet-enter" style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 96,
            background: dark ? '#141416' : '#FFFFFF',
            borderRadius: '16px 16px 0 0',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
            paddingBottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
            maxHeight: '85vh',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{ padding: '12px 0 4px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: dark ? '#333' : '#D4D4D8' }} />
            </div>
            <div style={{ flexShrink: 0 }}>
              <PanelHeader onClose={() => setMobileOpen(false)} isCollapsed={false} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <RiserList onItemClick={(rcept) => { onOpenModal(rcept); setMobileOpen(false) }} />
            </div>
          </div>
        </>
      )}
    </>
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

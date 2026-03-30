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

  // 공시 후 상승 종목 — base_price(공시 시점) 대비 현재가 변동률만 표시
  // base_price 없는 공시는 표시하지 않음 (가짜 데이터보다 없는 게 낫다)
  const risers = useMemo(() => {
    const seen = new Set()
    return todayDisclosures
      .filter(d => {
        // 투자주의/경고/위험 필터 — KIND 인코딩 깨짐 대응
        const rn = d.report_nm || ''
        const rno = d.rcept_no || ''
        if (rno.startsWith('KIND_')) {
          if (d.grade === 'D') return false
        } else if (rno.startsWith('NAVER_')) {
          if (/소수계좌|소수지점/.test(rn)) { /* 포함 */ }
          else return false
        } else {
          if (/투자주의|투자경고|투자위험/.test(rn)) return false
        }
        const bp = d.base_price
        const pd = prices[d.stock_code]
        // base_price 필수 — 없으면 급등 리스트에 표시 안 함
        if (!bp || bp <= 0 || !pd?.price || pd.price <= 0) return false
        const impact = (pd.price - bp) / bp * 100
        if (impact <= 0) return false
        if (seen.has(d.stock_code)) return false
        seen.add(d.stock_code)
        return true
      })
      .map(d => {
        const pd = prices[d.stock_code]
        const bp = d.base_price
        const currentPrice = pd.price
        const impact = (currentPrice - bp) / bp * 100
        return { ...d, changePct: Math.round(impact * 10) / 10, price: currentPrice, basePrice: bp }
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
            <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
              {dateStr}{kstHour < 9 && ' · 09시에 오늘 공시로 전환'}
            </div>
            {(() => {
              const kstMin = kstNow.getUTCMinutes()
              const isMarketOpen = (kstHour > 9 || (kstHour === 9 && kstMin >= 0)) && (kstHour < 15 || (kstHour === 15 && kstMin <= 30))
              const dotColor = isMarketOpen ? '#16A34A' : '#9CA3AF'
              return (
                <div style={{
                  fontSize: 11, color: isMarketOpen ? '#16A34A' : '#9CA3AF', fontWeight: 600, marginTop: 6,
                  display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: 3, background: dotColor,
                    boxShadow: isMarketOpen ? '0 0 6px rgba(22,163,74,0.4)' : 'none',
                    animation: isMarketOpen ? 'pulse 1.4s ease-in-out infinite' : 'none',
                  }} />
                  {isMarketOpen ? '공시 대비 · 10분 주기' : '공시 대비 · 종가 기준'}
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
          <span style={{
            fontSize: 10, fontWeight: 600, color: colors.textMuted,
            alignSelf: 'center', paddingRight: 24, whiteSpace: 'nowrap',
            fontFamily: FONTS.mono,
          }}>공시 후 변동</span>
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
              // 공시 대비 변동률 — base_price 없으면 null (폴백 안 함)
              const changePct = (bp && bp > 0 && currentPrice > 0)
                ? Math.round((currentPrice - bp) / bp * 1000) / 10
                : null
              const price = currentPrice
              const hasPrice = price != null && price > 0
              const priceColor = changePct > 0 ? '#DC2626' : changePct < 0 ? '#2563EB' : colors.textMuted

              return (
                <div key={d.rcept_no} className="touch-press today-row"
                  onClick={() => setModalRceptNo(d.rcept_no)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '18px 0', cursor: 'pointer',
                    borderBottom: i < visibleItems.length - 1 ? `1px solid ${lineSep}` : 'none',
                    minHeight: 64,
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
                    {hasPrice ? (
                      <>
                        <div className="today-right-num" style={{
                          fontWeight: 700, fontFamily: FONTS.mono, color: priceColor,
                        }}>
                          {changePct > 0 ? '+' : ''}{changePct.toFixed(1)}%
                        </div>
                        <div style={{
                          fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono, marginTop: 2,
                        }}>
                          {price.toLocaleString()}원 {d.base_price > 0 ? '· 공시 대비' : ''}
                        </div>
                      </>
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
      `}</style>
    </div>
  )
}


// ══ 공시 후 급등 — 데스크톱: 우측 고정 패널, 모바일: FAB + 바텀시트 ══
function LiveRiserWidget({ risers, dark, colors, onOpenModal }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const lineSep = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

  const RiserList = ({ onItemClick }) => (
    <div style={{ padding: '4px 0' }}>
      {risers.map((d, i) => {
        const pctSize = d.changePct >= 10 ? 14 : 12
        return (
          <div key={d.rcept_no} className="touch-press"
            onClick={() => onItemClick?.(d.rcept_no)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', cursor: 'pointer',
              borderBottom: i < risers.length - 1 ? `1px solid ${lineSep}` : 'none',
              transition: 'background 0.1s',
            }}>
            <span style={{
              fontSize: 10, fontWeight: 800, fontFamily: FONTS.mono,
              color: i < 3 ? '#DC2626' : (dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'),
              width: 14, textAlign: 'right', flexShrink: 0,
            }}>{i + 1}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 12, fontWeight: 700, color: colors.textPrimary,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                letterSpacing: '-0.2px',
              }}>{d.corp_name}</div>
              <div style={{
                fontSize: 9, color: colors.textMuted, fontFamily: FONTS.mono, marginTop: 2,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                {d.created_at && (() => {
                  const dt = new Date(d.created_at)
                  const k = new Date(dt.getTime() + 9*3600000)
                  return `${String(k.getUTCHours()).padStart(2,'0')}:${String(k.getUTCMinutes()).padStart(2,'0')}`
                })()}
                {d.price > 0 && <span>{d.price.toLocaleString()}</span>}
              </div>
            </div>
            <div style={{
              flexShrink: 0, textAlign: 'right',
              padding: '3px 8px', borderRadius: 6,
              background: 'rgba(220,38,38,0.08)',
            }}>
              <span style={{
                fontSize: pctSize, fontWeight: 800, fontFamily: FONTS.mono,
                color: '#DC2626',
              }}>+{d.changePct.toFixed(1)}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )

  const PanelHeader = ({ onClose, onToggle, isCollapsed }) => {
    const topPct = risers[0]?.changePct
    const kstNow2 = new Date(Date.now() + 9 * 3600000)
    const h = kstNow2.getUTCHours(), m = kstNow2.getUTCMinutes()
    const live = (h > 9 || (h === 9 && m >= 0)) && (h < 15 || (h === 15 && m <= 30))

    return (
      <div style={{
        padding: '10px 12px',
        borderBottom: isCollapsed ? 'none' : `1px solid ${lineSep}`,
        display: 'flex', alignItems: 'center', gap: 6,
        cursor: onToggle ? 'pointer' : 'default',
        background: dark ? 'rgba(220,38,38,0.03)' : 'rgba(220,38,38,0.015)',
      }} onClick={onToggle}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: 'rgba(220,38,38,0.10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="10" height="10" viewBox="0 0 16 16" fill="#DC2626">
            <path d="M8 2L13 9H3L8 2Z" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: colors.textPrimary }}>공시 후 급등</span>
            <span style={{
              fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 8,
              background: '#DC2626', color: '#fff',
            }}>{risers.length}</span>
          </div>
          {!isCollapsed && (
            <div style={{ fontSize: 9, color: colors.textMuted, fontFamily: FONTS.mono, marginTop: 1 }}>
              공시 대비 · {live ? '10분 주기' : '종가'}{topPct ? ` · 최대 +${topPct.toFixed(1)}%` : ''}
            </div>
          )}
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
        borderRadius: 14,
        border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#F0F0F2'}`,
        boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.06)',
        overflow: 'hidden', transition: 'all 0.2s ease',
      }}>
        <PanelHeader onToggle={() => setCollapsed(!collapsed)} isCollapsed={collapsed} />
        {!collapsed && <RiserList onItemClick={onOpenModal} />}
      </div>

      {/* 모바일: FAB 버튼 */}
      <button className="riser-fab touch-press" onClick={() => setMobileOpen(true)} style={{
        display: 'none', position: 'fixed', zIndex: 90,
        right: 16, bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        width: 52, height: 52, borderRadius: 26,
        background: '#DC2626', color: '#fff', border: 'none',
        cursor: 'pointer', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
      }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="#fff">
          <path d="M8 2L13 9H3L8 2Z" />
        </svg>
        <span style={{ fontSize: 8, fontWeight: 800, marginTop: 1 }}>TOP{risers.length}</span>
      </button>

      {/* 모바일: 바텀시트 */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{
            position: 'fixed', inset: 0, zIndex: 95,
            background: 'rgba(0,0,0,0.4)',
          }} />
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 96,
            background: dark ? '#141416' : '#FFFFFF',
            borderRadius: '20px 20px 0 0',
            boxShadow: '0 -8px 32px rgba(0,0,0,0.15)',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            maxHeight: '80vh',
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


function TodayBriefingSummary({ dark, colors }) {
  const [items, setItems] = useState([])
  const [dateLabel, setDateLabel] = useState('')

  useEffect(() => {
    fetch(`${API}/api/briefings`)
      .then(r => r.json())
      .then(d => {
        const list = d.briefings || []
        const latest = list.find(b => b.id && /^\d{4}-\d{2}-\d{2}$/.test(b.id))
        if (!latest) return
        setDateLabel(latest.date_label || latest.id)
        const lines = (latest.content || '').split('\n')
        const extracted = []
        const signalMap = { '강력 긍정': '#16A34A', '긍정': '#0D9488', '중립': '#94A3B8', '부정': '#D97706', '강력 부정': '#DC2626' }
        for (const line of lines) {
          const m = line.match(/^## (\d)\.\s*(.+?)\s*\((\d+)\)\s*\|\s*(.+)/)
          if (m) extracted.push({ num: m[1], name: m[2], type: m[4] })
        }
        let idx = 0
        for (const line of lines) {
          const sm = line.match(/판정.*?(강력 긍정|긍정|중립|부정|강력 부정)/)
          if (sm && idx < extracted.length) {
            extracted[idx].signal = sm[1]
            extracted[idx].color = signalMap[sm[1]] || '#94A3B8'
            idx++
          }
        }
        setItems(extracted.slice(0, 5))
      }).catch(() => {})
  }, [])

  if (items.length === 0) return null

  return (
    <div className="today-pad" style={{ paddingTop: 12 }}>
      <div onClick={() => window.location.href = '/briefing'} style={{
        padding: '20px 20px 16px', borderRadius: 16, cursor: 'pointer',
        background: dark
          ? 'linear-gradient(160deg, rgba(220,38,38,0.04), rgba(255,255,255,0.01))'
          : 'linear-gradient(160deg, rgba(220,38,38,0.025), rgba(255,255,255,0.8))',
        border: `1px solid ${dark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.06)'}`,
        transition: 'all 0.2s',
        boxShadow: dark ? 'none' : '0 1px 8px rgba(220,38,38,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 6, height: 6, borderRadius: 3, background: '#DC2626',
              boxShadow: '0 0 6px rgba(220,38,38,0.4)',
            }} />
            <span style={{
              fontSize: 14, fontWeight: 700, color: colors.textPrimary,
              fontFamily: FONTS.serif, letterSpacing: '-0.3px',
            }}>오늘의 브리핑</span>
            <span style={{
              fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono,
              padding: '2px 8px', borderRadius: 6,
              background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
            }}>{dateLabel}</span>
          </div>
          <span style={{ fontSize: 11, color: colors.textMuted, fontWeight: 500 }}>보기 →</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {items.map((item, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '10px 2px',
              borderBottom: i < items.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` : 'none',
            }}>
              <span style={{
                fontSize: 10, fontWeight: 800, fontFamily: FONTS.mono,
                color: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                width: 14, textAlign: 'right', flexShrink: 0, marginTop: 3,
              }}>{item.num}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 14, fontWeight: 700, color: colors.textPrimary,
                    fontFamily: FONTS.serif, letterSpacing: '-0.3px',
                  }}>{item.name}</span>
                  {item.signal && (
                    <span style={{
                      fontSize: 9, fontWeight: 700, color: item.color,
                      padding: '2px 8px', borderRadius: 20,
                      background: `${item.color}10`,
                      fontFamily: FONTS.serif, whiteSpace: 'nowrap',
                    }}>{item.signal}</span>
                  )}
                </div>
                <div style={{
                  fontSize: 12, color: colors.textMuted, marginTop: 2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{item.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

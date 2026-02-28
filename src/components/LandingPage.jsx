import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FONTS, PREMIUM, GRADE_COLORS } from '../constants/theme'
import { useLandingData } from '../hooks/useLandingData'

/* ── Variable color maps ── */
const VAR_GRADE_COLORS = {
  '순풍': '#16A34A', '양호': '#4ADE80', '보통': '#D97706', '주의': '#EA580C', '경고': '#DC2626',
}

export default function LandingPage() {
  const navigate = useNavigate()
  const go = () => navigate('/today')
  const { disclosures, stats, recentCards, variableDist, foreignFlow, loading } = useLandingData()

  const totalCount = stats?.today_count ?? 0
  const sCount = stats?.s_count ?? 0
  const aCount = stats?.a_count ?? 0
  const dCount = stats?.d_count ?? 0
  const isCumulative = stats?.is_cumulative

  return (
    <div style={{ fontFamily: FONTS.body, overflowX: 'hidden' }}>

      {/* ━━━ Section 1: Dark Hero (100vh, 항상 다크) ━━━ */}
      <section style={{
        background: '#09090B', color: '#FAFAFA',
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: 'clamp(80px, 12vh, 120px) clamp(20px, 5vw, 64px) 48px',
        position: 'relative',
      }}>
        {/* Nav bar */}
        <nav style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 clamp(24px, 5vw, 64px)', height: '56px',
        }}>
          <span style={{
            fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px',
            fontFamily: FONTS.serif, color: '#FAFAFA',
          }}>
            DART <span style={{ color: PREMIUM.accent }}>Insight</span>
          </span>
          <button onClick={go} style={{
            padding: '7px 18px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent', color: '#A1A1AA', fontSize: '13px', fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.color = '#FAFAFA' }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = '#A1A1AA' }}
          >대시보드</button>
        </nav>

        <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
          {/* Kicker */}
          <Reveal>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <PulseDot />
              <span style={{ fontSize: '12px', fontWeight: 600, color: PREMIUM.accent, letterSpacing: '0.08em' }}>
                AI 공시 인사이트
              </span>
            </div>
          </Reveal>

          {/* H1 */}
          <Reveal d={60}>
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 700,
              lineHeight: 1.15, letterSpacing: '-0.03em',
              margin: '0 0 16px', fontFamily: FONTS.serif, color: '#FAFAFA',
            }}>
              매일 쏟아지는 공시 속<br />
              투자 <span style={{ color: PREMIUM.accent }}>시그널</span>을 찾아드립니다
            </h1>
          </Reveal>

          {/* Subcopy */}
          <Reveal d={90}>
            <p style={{
              fontSize: '14px', color: '#71717A', margin: '0 0 40px',
              lineHeight: 1.6, letterSpacing: '0.01em',
            }}>
              DART · KIND 실시간 수집 → AI 등급 분류 → 핵심 공시만 큐레이션
            </p>
          </Reveal>

          {/* Counter cards */}
          <Reveal d={120}>
            <div className="landing-counters-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px', marginBottom: '24px',
            }}>
              <CounterCard label={isCumulative ? '분석 완료' : '오늘 공시'} value={totalCount} color={PREMIUM.accent} delay={0} />
              <CounterCard label="S Grade" value={sCount} color={GRADE_COLORS.S.bg} delay={100} />
              <CounterCard label="A Grade" value={aCount} color={GRADE_COLORS.A.bg} delay={200} />
              <CounterCard label="D Grade" value={dCount} color={GRADE_COLORS.D.bg} delay={300} />
            </div>
          </Reveal>

          {/* Grade bar */}
          {totalCount > 0 && (
            <Reveal d={180}>
              <div style={{ maxWidth: '480px', margin: '0 auto 32px' }}>
                <GradeBar s={sCount} a={aCount} d={dCount} total={totalCount} />
              </div>
            </Reveal>
          )}

          {/* 3-step pipeline */}
          <Reveal d={200}>
            <div className="landing-pipeline-steps" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', marginBottom: '32px', flexWrap: 'wrap',
            }}>
              {[
                { step: '수집', desc: '800+ 공시/일' },
                { step: '분석', desc: 'AI 등급 분류' },
                { step: '큐레이션', desc: '핵심 5건 알림' },
              ].map((item, i) => (
                <React.Fragment key={item.step}>
                  {i > 0 && (
                    <span style={{ color: '#52525B', fontSize: '11px', lineHeight: 1 }}>→</span>
                  )}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '5px 12px', borderRadius: '20px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, color: PREMIUM.accent,
                      letterSpacing: '0.04em',
                    }}>{item.step}</span>
                    <span style={{
                      fontSize: '11px', color: '#A1A1AA', fontWeight: 500,
                    }}>{item.desc}</span>
                  </span>
                </React.Fragment>
              ))}
            </div>
          </Reveal>

          {/* CTA */}
          <Reveal d={260}>
            <button onClick={go} style={{
              padding: '12px 32px', borderRadius: '8px', border: 'none',
              backgroundColor: PREMIUM.accent, color: '#FFFFFF',
              fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(220,38,38,0.4)',
            }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(220,38,38,0.5)' }}
              onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 14px rgba(220,38,38,0.4)' }}
            >대시보드 열기</button>
          </Reveal>

          {/* Scroll down guide */}
          <ScrollDownGuide />
        </div>
      </section>

      {/* ━━━ Section 2: 라이브 피드 (티커 + 테이블) ━━━ */}
      <section style={{
        background: '#FFFFFF', color: '#18181B',
        borderTop: '1px solid #E4E4E7',
      }}>
        {/* Ticker strip */}
        <TickerStrip disclosures={disclosures} />

        {/* Disclosure table */}
        <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px clamp(20px, 5vw, 64px)' }}>
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: FONTS.serif, margin: 0 }}>
                최신 공시
              </h2>
              <button onClick={go} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, color: PREMIUM.accent,
                padding: 0, transition: 'opacity 0.2s',
              }}
                onMouseEnter={e => e.target.style.opacity = '0.7'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >전체 보기 &rarr;</button>
            </div>
          </Reveal>
          <DisclosureTable disclosures={disclosures} loading={loading} navigate={navigate} />
        </div>
      </section>

      {/* ━━━ Section 3: 시장 인텔리전스 ━━━ */}
      <section style={{
        background: '#FAFAFA', color: '#18181B',
        borderTop: '1px solid #E4E4E7',
        padding: '48px clamp(20px, 5vw, 64px)',
      }}>
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <Reveal>
            <h2 style={{
              fontSize: '28px', fontWeight: 700, fontFamily: FONTS.serif,
              margin: '0 0 28px', letterSpacing: '-0.02em',
            }}>시장 인텔리전스</h2>
          </Reveal>

          <div className="landing-pulse-grid" style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px',
          }}>
            <Reveal d={0}>
              <RecentCardsCard cards={recentCards} navigate={navigate} />
            </Reveal>
            <Reveal d={60}>
              <VariableDistCard dist={variableDist} navigate={navigate} />
            </Reveal>
            <Reveal d={120}>
              <FlowSnapshotCard items={foreignFlow} navigate={navigate} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ━━━ Section 4: 미니멀 푸터 ━━━ */}
      <footer style={{
        background: '#18181B', color: '#A1A1AA',
        padding: '20px clamp(20px, 5vw, 64px)',
        borderTop: '1px solid #27272A',
      }}>
        <div style={{
          maxWidth: '960px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '14px', fontFamily: FONTS.serif, fontWeight: 700, color: '#FAFAFA' }}>
              DART <span style={{ color: PREMIUM.accent }}>Insight</span>
            </span>
            <span style={{ fontSize: '11px', color: '#52525B' }}>
              DART API &middot; 키움 REST
            </span>
          </div>
          <button onClick={go} style={{
            padding: '7px 18px', borderRadius: '6px', border: 'none',
            background: PREMIUM.accent, color: '#fff',
            fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.target.style.opacity = '0.85'}
            onMouseLeave={e => e.target.style.opacity = '1'}
          >대시보드 열기</button>
        </div>
      </footer>
    </div>
  )
}


/* ════════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════════ */

function PulseDot() {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: '8px', height: '8px' }}>
      <span className="landing-pulse-ring" style={{
        position: 'absolute', inset: '-4px',
        borderRadius: '50%', border: `2px solid ${PREMIUM.accent}`,
        opacity: 0.5,
      }} />
      <span style={{
        display: 'block', width: '8px', height: '8px',
        borderRadius: '50%', backgroundColor: PREMIUM.accent,
      }} />
    </span>
  )
}


function CounterCard({ label, value, color, delay = 0 }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const visible = useRef(false)
  const lastAnimated = useRef(0)

  // Track visibility
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { visible.current = true; ob.disconnect() }
    }, { threshold: 0.1 })
    ob.observe(el)
    return () => ob.disconnect()
  }, [])

  // Animate when value changes (and visible)
  useEffect(() => {
    if (value <= 0 || value === lastAnimated.current) return
    const run = () => {
      lastAnimated.current = value
      const from = display
      const duration = 1200
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - p, 3)
        setDisplay(Math.round(from + (value - from) * eased))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    if (visible.current) {
      setTimeout(run, delay)
    } else {
      // Wait until visible
      const check = setInterval(() => {
        if (visible.current) { clearInterval(check); setTimeout(run, delay) }
      }, 100)
      return () => clearInterval(check)
    }
  }, [value])

  return (
    <div ref={ref} style={{
      padding: '16px', borderRadius: '10px',
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      transition: 'border-color 0.3s',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
    >
      <div style={{
        fontSize: '24px', fontWeight: 700, fontFamily: FONTS.mono,
        color, letterSpacing: '-0.03em', lineHeight: 1,
      }}>
        {display.toLocaleString()}
      </div>
      <div style={{ fontSize: '11px', color: '#71717A', marginTop: '6px', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  )
}


function GradeBar({ s, a, d, total }) {
  const other = total - s - a - d
  const pct = (v) => Math.max((v / total) * 100, 0)

  return (
    <div>
      <div style={{ display: 'flex', gap: '2px', borderRadius: '4px', overflow: 'hidden', height: '4px', backgroundColor: 'rgba(255,255,255,0.06)' }}>
        {s > 0 && <div className="landing-bar-animate" style={{ width: `${pct(s)}%`, backgroundColor: GRADE_COLORS.S.bg }} />}
        {a > 0 && <div className="landing-bar-animate" style={{ width: `${pct(a)}%`, backgroundColor: GRADE_COLORS.A.bg }} />}
        {d > 0 && <div className="landing-bar-animate" style={{ width: `${pct(d)}%`, backgroundColor: '#1D4ED8' }} />}
        {other > 0 && <div className="landing-bar-animate" style={{ width: `${pct(other)}%`, backgroundColor: 'rgba(255,255,255,0.1)' }} />}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '8px', justifyContent: 'center' }}>
        {[
          { label: 'S', count: s, color: GRADE_COLORS.S.bg },
          { label: 'A', count: a, color: GRADE_COLORS.A.bg },
          { label: 'D', count: d, color: '#1D4ED8' },
          { label: 'B/C', count: other, color: '#71717A' },
        ].map(g => g.count > 0 && (
          <div key={g.label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: g.color }} />
            <span style={{ fontSize: '11px', color: '#71717A', fontFamily: FONTS.mono }}>
              {g.label} {g.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}


function ScrollDownGuide() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      style={{
        marginTop: '48px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: '8px', cursor: 'pointer',
        opacity: visible ? 0.6 : 0,
        transform: visible ? 'none' : 'translateY(8px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
      onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
    >
      <span style={{ fontSize: '18px', color: '#FAFAFA', letterSpacing: '0.04em', fontWeight: 700, fontFamily: FONTS.serif }}>
        실시간 공시 현황
      </span>
      <div className="landing-scroll-arrow" style={{
        width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
          <path d="M4 6L8 10L12 6" stroke="#FAFAFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  )
}


function Reveal({ children, d = 0 }) {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); ob.disconnect() } }, { threshold: 0.1 })
    ob.observe(el)
    return () => ob.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(10px)',
      transition: `opacity 0.35s ease ${d}ms, transform 0.35s ease ${d}ms`,
    }}>{children}</div>
  )
}


/* ── Ticker Strip (수평 무한 스크롤) ── */
const TICKER_GRADE_BG = {
  S: '#FEE2E2', A: '#D1FAE5', D: '#DBEAFE', C: '#FEF3C7', B: '#F4F4F5',
}
const TICKER_GRADE_FG = {
  S: '#991B1B', A: '#065F46', D: '#1E40AF', C: '#92400E', B: '#71717A',
}

function TickerStrip({ disclosures }) {
  const items = useMemo(() => {
    if (!disclosures || disclosures.length === 0) return []
    return disclosures.map(d => ({
      grade: d.grade || 'B',
      corp: d.corp_name || '',
      report: (d.report_nm || '').length > 20 ? d.report_nm.slice(0, 20) + '...' : (d.report_nm || ''),
      time: d.created_at ? d.created_at.substring(11, 16) : '',
    }))
  }, [disclosures])

  if (items.length === 0) return null

  const renderItems = (list) => list.map((d, i) => (
    <span key={i} style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      paddingRight: '32px', whiteSpace: 'nowrap',
    }}>
      <span style={{
        fontSize: '10px', fontWeight: 700, fontFamily: FONTS.mono,
        padding: '1px 5px', borderRadius: '3px', lineHeight: '16px',
        backgroundColor: TICKER_GRADE_BG[d.grade] || TICKER_GRADE_BG.B,
        color: TICKER_GRADE_FG[d.grade] || TICKER_GRADE_FG.B,
      }}>{d.grade}</span>
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#3F3F46' }}>{d.corp}</span>
      <span style={{ fontSize: '11px', color: '#A1A1AA' }}>{d.report}</span>
      <span style={{ fontSize: '10px', fontFamily: FONTS.mono, color: '#D4D4D8' }}>{d.time}</span>
    </span>
  ))

  // 충분한 반복 확보
  const pool = items.length <= 3 ? [...items, ...items, ...items, ...items] : [...items, ...items]

  return (
    <div className="landing-ticker-strip" style={{
      height: '40px', overflow: 'hidden',
      borderBottom: '1px solid #F4F4F5',
      background: '#FAFAFA',
      position: 'relative',
    }}>
      {/* 좌우 페이드 마스크 */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '48px',
        background: 'linear-gradient(to right, #FAFAFA, transparent)', zIndex: 2,
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '48px',
        background: 'linear-gradient(to left, #FAFAFA, transparent)', zIndex: 2,
      }} />
      <div className="landing-ticker-track" style={{
        display: 'flex', alignItems: 'center', height: '100%',
        whiteSpace: 'nowrap',
        animation: 'tickerScroll 45s linear infinite',
      }}>
        <span style={{ display: 'inline-flex', paddingRight: '16px' }}>{renderItems(pool)}</span>
        <span style={{ display: 'inline-flex', paddingRight: '16px' }}>{renderItems(pool)}</span>
      </div>
    </div>
  )
}


/* ── Disclosure Table (8행) ── */
function DisclosureTable({ disclosures, loading, navigate }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '48px', borderRadius: '6px' }} />
        ))}
      </div>
    )
  }

  if (!disclosures || disclosures.length === 0) {
    return (
      <div style={{ padding: '48px 0', textAlign: 'center', color: '#A1A1AA', fontSize: '13px' }}>
        공시 데이터를 기다리는 중...
      </div>
    )
  }

  return (
    <div style={{
      border: '1px solid #E4E4E7', borderRadius: '10px', overflow: 'hidden',
      background: '#FFFFFF',
    }}>
      {disclosures.slice(0, 8).map((d, i) => {
        const gc = GRADE_COLORS[d.grade] || {}
        const timeStr = d.created_at ? d.created_at.substring(11, 16) : ''
        return (
          <div
            key={d.rcept_no}
            onClick={() => navigate(`/deep-dive/${d.corp_code}`)}
            className="landing-table-row"
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 16px',
              borderBottom: i < Math.min(disclosures.length, 8) - 1 ? '1px solid #F4F4F5' : 'none',
              cursor: 'pointer', transition: 'background-color 0.15s',
              opacity: 0,
              animation: `fadeIn 0.3s ease ${i * 30}ms forwards`,
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F4F4F5'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {/* Grade badge */}
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '26px', height: '26px', borderRadius: '6px',
              fontSize: '11px', fontWeight: 800, fontFamily: FONTS.mono,
              backgroundColor: gc.bg || '#52525B', color: '#fff', flexShrink: 0,
            }}>{d.grade}</span>

            {/* Corp name */}
            <span style={{
              fontSize: '13px', fontWeight: 600, color: '#18181B',
              minWidth: '80px', flexShrink: 0,
            }}>{d.corp_name}</span>

            {/* Report name */}
            <span className="landing-table-report" style={{
              fontSize: '12px', color: '#A1A1AA',
              flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{d.report_nm}</span>

            {/* Time */}
            <span style={{
              fontSize: '11px', fontFamily: FONTS.mono, color: '#A1A1AA',
              flexShrink: 0,
            }}>{timeStr}</span>
          </div>
        )
      })}
    </div>
  )
}


/* ── Market Intelligence Cards ── */

function CardShell({ children, style }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E4E4E7',
      borderRadius: '12px', padding: '20px',
      height: '100%', display: 'flex', flexDirection: 'column',
      ...style,
    }}>
      {children}
    </div>
  )
}

function CardLink({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      marginTop: 'auto', paddingTop: '16px',
      background: 'none', border: 'none', cursor: 'pointer',
      fontSize: '12px', fontWeight: 600, color: PREMIUM.accent,
      textAlign: 'left', padding: '16px 0 0', transition: 'opacity 0.2s',
    }}
      onMouseEnter={e => e.target.style.opacity = '0.7'}
      onMouseLeave={e => e.target.style.opacity = '1'}
    >{label} &rarr;</button>
  )
}

function HorizBar({ items, total }) {
  if (!total || total === 0) return null
  return (
    <div style={{ display: 'flex', gap: '2px', borderRadius: '4px', overflow: 'hidden', height: '8px', marginBottom: '10px' }}>
      {items.map((item, i) => item.value > 0 && (
        <div key={i} style={{
          width: `${(item.value / total) * 100}%`,
          backgroundColor: item.color,
          transition: 'width 0.5s ease',
        }} />
      ))}
    </div>
  )
}

function SkeletonCard() {
  return (
    <CardShell>
      <div className="skeleton" style={{ height: '16px', width: '40%', marginBottom: '16px' }} />
      <div className="skeleton" style={{ height: '8px', width: '100%', marginBottom: '12px' }} />
      <div className="skeleton" style={{ height: '12px', width: '70%', marginBottom: '8px' }} />
      <div className="skeleton" style={{ height: '12px', width: '55%', marginBottom: '8px' }} />
      <div className="skeleton" style={{ height: '12px', width: '60%' }} />
    </CardShell>
  )
}


function RecentCardsCard({ cards, navigate }) {
  if (!cards) return <SkeletonCard />

  return (
    <CardShell>
      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px', fontFamily: FONTS.serif }}>
        기업 사계보
      </h3>
      {cards.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A1A1AA', fontSize: '12px' }}>
          아직 생성된 카드가 없습니다
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          {cards.map((c) => (
            <div
              key={c.corp_code}
              onClick={() => navigate(`/deep-dive/${c.corp_code}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                cursor: 'pointer', transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <span style={{
                width: '8px', height: '8px', borderRadius: '2px',
                backgroundColor: PREMIUM.accent, flexShrink: 0,
              }} />
              <span style={{ fontSize: '12px', color: '#52525B', flex: 1 }}>
                {c.corp_name}
              </span>
              <span style={{ fontSize: '11px', fontFamily: FONTS.mono, color: '#A1A1AA' }}>
                {c.stock_code}
              </span>
            </div>
          ))}
        </div>
      )}
      <CardLink label="자세히 보기" onClick={() => navigate('/deep-dive')} />
    </CardShell>
  )
}


function VariableDistCard({ dist, navigate }) {
  if (!dist) return <SkeletonCard />

  const total = dist.total || 0
  const grades = ['순풍', '양호', '보통', '주의', '경고']

  return (
    <CardShell>
      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px', fontFamily: FONTS.serif }}>
        7대 변수
      </h3>
      <HorizBar
        total={total}
        items={grades.map(g => ({ value: dist[g] || 0, color: VAR_GRADE_COLORS[g] }))}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {grades.map(g => (
          <div key={g} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '2px',
              backgroundColor: VAR_GRADE_COLORS[g], flexShrink: 0,
            }} />
            <span style={{ fontSize: '12px', color: '#52525B', flex: 1 }}>
              {g}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 600, fontFamily: FONTS.mono, color: '#18181B' }}>
              {dist[g] || 0}
            </span>
          </div>
        ))}
      </div>
      <CardLink label="자세히 보기" onClick={() => navigate('/discover?tab=7factor')} />
    </CardShell>
  )
}


function FlowSnapshotCard({ items, navigate }) {
  if (!items) return <SkeletonCard />

  const buyers = (items || []).filter(i => i.side === 'buy').slice(0, 5)
  const sellers = (items || []).filter(i => i.side === 'sell').slice(0, 5)

  return (
    <CardShell>
      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px', fontFamily: FONTS.serif }}>
        외국인 수급 <span style={{ fontSize: '11px', fontWeight: 500, color: '#A1A1AA' }}>1주</span>
      </h3>
      {items.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A1A1AA', fontSize: '12px' }}>
          데이터 없음
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
          {/* Buy side */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#DC2626', marginBottom: '6px', letterSpacing: '0.04em' }}>
              순매수
            </div>
            {buyers.map((b, i) => (
              <div key={i} style={{
                fontSize: '11px', color: '#52525B',
                padding: '3px 0', display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  {b.stock_name}
                </span>
                <span style={{ fontFamily: FONTS.mono, color: '#DC2626', fontWeight: 600, fontSize: '10px' }}>
                  +{(b.net_buy_qty || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          {/* Sell side */}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#2563EB', marginBottom: '6px', letterSpacing: '0.04em' }}>
              순매도
            </div>
            {sellers.map((s, i) => (
              <div key={i} style={{
                fontSize: '11px', color: '#52525B',
                padding: '3px 0', display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  {s.stock_name}
                </span>
                <span style={{ fontFamily: FONTS.mono, color: '#2563EB', fontWeight: 600, fontSize: '10px' }}>
                  {(s.net_buy_qty || 0).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <CardLink label="자세히 보기" onClick={() => navigate('/market?tab=flow')} />
    </CardShell>
  )
}

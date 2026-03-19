import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FONTS, PREMIUM, GRADE_COLORS } from '../constants/theme'
import { useLandingData } from '../hooks/useLandingData'
import { CURRENT_EVENT } from '../data/weeklyEvents'

const WEEKLY_EVENT = CURRENT_EVENT

export default function LandingPage() {
  const navigate = useNavigate()
  const go = () => navigate('/today')
  const { disclosures, stats, loading } = useLandingData()
  const [showPopup, setShowPopup] = useState(false)
  const [showInsight, setShowInsight] = useState(false)
  const [showLoginToast, setShowLoginToast] = useState(false)

  // KST 9시 전이면 전일 공시 표시
  const recentDisclosures = useMemo(() => {
    if (!disclosures) return disclosures
    const now = new Date()
    const kstNow = new Date(now.getTime() + 9 * 3600000)
    const kstHour = kstNow.getUTCHours()
    const targetDate = kstHour < 9 ? new Date(kstNow.getTime() - 24 * 3600000) : kstNow
    const targetStr = targetDate.toISOString().slice(0, 10)
    const filtered = disclosures.filter(d => {
      if (!d.created_at) return false
      const dt = new Date(d.created_at)
      const kst = new Date(dt.getTime() + 9 * 3600000)
      return kst.toISOString().slice(0, 10) === targetStr
    })
    // 필터 결과가 비면 전체 최신 8건 반환
    return filtered.length > 0 ? filtered : disclosures.slice(0, 8)
  }, [disclosures])

  useEffect(() => {
    const dismissed = localStorage.getItem(`event_dismissed_${WEEKLY_EVENT.id}`)
    if (!dismissed) {
      const timer = setTimeout(() => setShowPopup(true), 1200)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismissPopup = () => {
    setShowPopup(false)
    localStorage.setItem(`event_dismissed_${WEEKLY_EVENT.id}`, Date.now().toString())
  }

  const totalCount = stats?.today_count ?? 0
  const sCount = stats?.s_count ?? 0
  const aCount = stats?.a_count ?? 0
  const dCount = stats?.d_count ?? 0

  return (
    <div style={{ fontFamily: FONTS.body, overflowX: 'hidden' }}>

      {showPopup && (
        <EventPopup event={WEEKLY_EVENT} onClose={dismissPopup}
          onInsight={() => { dismissPopup(); setShowInsight(true) }} />
      )}
      {showInsight && (
        <InsightModal event={WEEKLY_EVENT} onClose={() => setShowInsight(false)} />
      )}

      {/* ━━━ 히어로 (토스 국내주식 메인 스타일) ━━━ */}
      <section style={{
        background: '#09090B', color: '#FAFAFA',
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: 'clamp(80px, 12vh, 120px) clamp(20px, 5vw, 64px) 48px',
        position: 'relative',
      }}>
        {/* Nav */}
        <nav style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 clamp(24px, 5vw, 64px)', height: 56,
        }}>
          <span style={{
            fontSize: '1.25rem', fontWeight: 700, letterSpacing: -0.5,
            fontFamily: FONTS.serif, color: '#FAFAFA',
          }}>
            DART <span style={{ color: PREMIUM.accent }}>Insight</span>
          </span>
          <button onClick={() => { setShowLoginToast(true); setTimeout(() => setShowLoginToast(false), 2500) }} style={{
            padding: '7px 18px', borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent', color: '#A1A1AA',
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.color = '#FAFAFA' }}
            onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = '#A1A1AA' }}
          >로그인</button>
        </nav>

        <div style={{ maxWidth: 640, width: '100%', textAlign: 'center' }}>
          {/* H1 — 간결하게 */}
          <Reveal>
            <h1 style={{
              fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800,
              lineHeight: 1.2, letterSpacing: '-0.03em',
              margin: '0 0 40px', fontFamily: FONTS.serif,
            }}>
              800건의 공시에서<br />
              투자자를 위한<br />
              <span style={{ color: PREMIUM.accent }}>핵심 공시</span>를 골라드립니다
            </h1>
          </Reveal>


          {/* CTA */}
          <Reveal d={180}>
            <button onClick={go} style={{
              padding: '14px 36px', borderRadius: 12, border: 'none',
              background: PREMIUM.accent, color: '#fff',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(220,38,38,0.4)',
            }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(220,38,38,0.5)' }}
              onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 14px rgba(220,38,38,0.4)' }}
            >
              대시보드 열기
            </button>
          </Reveal>

          {/* Buffett AI 카드 */}
          <Reveal d={220}>
            <div
              onClick={() => { navigate('/premium'); setTimeout(() => window.dispatchEvent(new Event('open-buffett-chat')), 500) }}
              style={{
                maxWidth: 400, width: '100%', margin: '36px auto 0',
                padding: '16px 20px', borderRadius: 16, cursor: 'pointer',
                background: 'linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.03))',
                border: '1px solid rgba(220,38,38,0.2)',
                display: 'flex', alignItems: 'center', gap: 16,
                transition: 'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.4)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(220,38,38,0.15)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.2)'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 28, overflow: 'hidden', flexShrink: 0,
                border: '2px solid rgba(220,38,38,0.3)',
                boxShadow: '0 0 20px rgba(220,38,38,0.15)',
              }}>
                <img src="/bufit.png" alt="Buffett AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#FAFAFA', marginBottom: 2 }}>
                  Buffett AI
                </div>
                <div style={{ fontSize: 12, color: '#A1A1AA', lineHeight: 1.4 }}>
                  AI 애널리스트에게 투자 인사이트를 물어보세요
                </div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </Reveal>


          {/* Scroll guide */}
          <Reveal d={300}>
            <div
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              style={{ marginTop: 48, cursor: 'pointer', opacity: 0.5 }}
            >
              <svg width="28" height="28" viewBox="0 0 16 16" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                <path d="M4 6L8 10L12 6" stroke="#FAFAFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━ 서비스 활용 가이드 ━━━ */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E4E4E7' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px clamp(20px, 5vw, 40px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{
              fontSize: 22, fontWeight: 800, fontFamily: FONTS.serif,
              color: '#18181B', margin: '0 0 6px',
            }}>이렇게 활용하세요</h2>
            <p style={{ fontSize: 14, color: '#71717A' }}>
              매일 저녁 7시, 3분이면 충분합니다
            </p>
          </div>

          {/* 핵심 3개 — 대형 카드 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
            {[
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
                tag: 'CORE',
                title: '실시간 공시 · S/A/D 등급',
                desc: '하루 800건 공시를 AI가 자동 분류. 핵심만 확인하세요',
                accent: '#DC2626', bg: 'rgba(220,38,38,0.04)',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
                tag: 'DAILY',
                title: '저녁 7시 브리핑 · DART Pick',
                desc: '전문가가 해석한 공시의 이면 + 데이터가 가리키는 오늘의 종목',
                accent: '#DC2626', bg: 'rgba(220,38,38,0.04)',
              },
              {
                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
                tag: 'TRACK',
                title: '공시 후 5거래일 추적',
                desc: '공시 시점 가격 기준, 실제로 얼마나 올랐는지 데이터로 증명',
                accent: '#2563EB', bg: 'rgba(37,99,235,0.04)',
              },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '20px', borderRadius: 14,
                background: item.bg,
                border: `1px solid ${item.accent}15`,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: '#FFFFFF',
                  border: `1px solid ${item.accent}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                      background: item.accent, color: '#fff', letterSpacing: '0.05em',
                    }}>{item.tag}</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#18181B', marginBottom: 3 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#71717A', lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 보조 3개 — 컴팩트 가로 그리드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              {
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
                title: 'Buffett AI',
                desc: '내재가치 분석',
                accent: '#D97706',
              },
              {
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
                title: '서재',
                desc: '전자책 5권',
                accent: '#0EA5E9',
              },
              {
                icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
                title: '이벤트',
                desc: '글로벌 일정',
                accent: '#16A34A',
              },
            ].map((item, i) => (
              <div key={i} style={{
                padding: '16px 12px', borderRadius: 12, textAlign: 'center',
                background: '#FAFAFA', border: '1px solid #F0F0F2',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, margin: '0 auto 10px',
                  background: `${item.accent}10`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{item.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#18181B', marginBottom: 2 }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 11, color: '#A1A1AA' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 최신 공시 (토스 랭킹 리스트 스타일) ━━━ */}
      <section style={{ background: '#FFFFFF', borderTop: '1px solid #E4E4E7' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px clamp(20px, 5vw, 40px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, fontFamily: FONTS.serif, margin: 0, color: '#18181B' }}>
              최신 공시
            </h2>
            <button onClick={go} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: PREMIUM.accent, padding: 0,
            }}>
              전체 보기 →
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ height: 72, borderRadius: 12, background: '#F4F4F5', animation: 'pulse 1.4s ease-in-out infinite' }} />
              ))}
            </div>
          ) : !recentDisclosures || recentDisclosures.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#A1A1AA', fontSize: 14 }}>
              오늘 공시를 기다리는 중...
            </div>
          ) : (
            recentDisclosures.slice(0, 8).map((d, i) => {
              const gc = GRADE_COLORS[d.grade] || { bg: '#94A3B8', color: '#fff' }
              const kstTime = d.created_at ? (() => {
                const dt = new Date(d.created_at)
                const k = new Date(dt.getTime() + 9 * 3600000)
                return `${String(k.getUTCHours()).padStart(2, '0')}:${String(k.getUTCMinutes()).padStart(2, '0')}`
              })() : ''

              return (
                <div key={d.rcept_no}
                  onClick={() => d.corp_code ? navigate(`/deep-dive/${d.corp_code}`) : navigate('/today')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '16px 0', cursor: 'pointer',
                    borderBottom: i < Math.min(recentDisclosures.length, 8) - 1 ? '1px solid #F4F4F5' : 'none',
                    minHeight: 72, transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {/* 원형 등급 배지 */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 22, flexShrink: 0,
                    background: gc.bg, color: gc.color || '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 800, fontFamily: FONTS.mono,
                  }}>
                    {d.grade}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#18181B', fontFamily: FONTS.serif }}>
                      {d.corp_name}
                    </div>
                    <div style={{
                      fontSize: 13, color: '#A1A1AA', marginTop: 3,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {d.report_nm}
                    </div>
                  </div>

                  <span style={{ fontSize: 12, color: '#A1A1AA', fontFamily: FONTS.mono, flexShrink: 0 }}>
                    {kstTime}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </section>

      {/* ━━━ 전자공시 시그널 가이드 ━━━ */}
      <section style={{
        background: '#FAF8F5', borderTop: '1px solid #E8E4DD',
        padding: 'clamp(40px, 6vh, 64px) clamp(20px, 5vw, 40px)',
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.1em',
            padding: '3px 8px', borderRadius: 4,
            background: 'linear-gradient(135deg, #9E7A2F, #C9A84C)', color: '#fff',
          }}>GUIDE</span>
          <h2 style={{
            fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 700,
            fontFamily: FONTS.serif, color: '#1A1A1A',
            lineHeight: 1.3, margin: '14px 0 8px',
          }}>
            전자공시 시그널 <span style={{ color: '#9E7A2F' }}>가이드</span>
          </h2>
          <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.7, margin: '0 0 24px' }}>
            800건의 공시에서 진짜 시그널을 찾아내는 체계적 방법론
          </p>
          <a href="https://jessylimitless.github.io/dartbook/" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '12px 28px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #9E7A2F, #B8922E)', color: '#fff',
              fontSize: 14, fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(158,122,47,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            무료로 읽기
          </a>
        </div>
      </section>

      {/* 로그인 토스트 */}
      {showLoginToast && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10000,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          borderRadius: 16, padding: '24px 32px',
          textAlign: 'center',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#FAFAFA', marginBottom: 6 }}>
            Beta Version
          </div>
          <div style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.5 }}>
            현재 테스트 버전으로 운영 중입니다
          </div>
        </div>
      )}

      {/* ━━━ 푸터 ━━━ */}
      <footer style={{
        background: '#18181B', color: '#A1A1AA',
        padding: '20px clamp(20px, 5vw, 64px)',
        borderTop: '1px solid #27272A',
      }}>
        <div style={{
          maxWidth: 640, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontSize: 14, fontFamily: FONTS.serif, fontWeight: 700, color: '#FAFAFA' }}>
            DART <span style={{ color: PREMIUM.accent }}>Insight</span>
          </span>
          <button onClick={go} style={{
            padding: '7px 18px', borderRadius: 6, border: 'none',
            background: PREMIUM.accent, color: '#fff',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>대시보드 열기</button>
        </div>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes popupFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popupSlideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
      `}</style>
    </div>
  )
}


/* ════════════════════════════════════════════
   Sub-components
   ════════════════════════════════════════════ */

function AnimatedNumber({ value, color }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    if (value <= 0) return
    const duration = 1000
    const start = performance.now()
    const from = display
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return (
    <div style={{
      fontSize: 24, fontWeight: 800, fontFamily: FONTS.mono,
      color, letterSpacing: -1, lineHeight: 1,
    }}>
      {display.toLocaleString()}
    </div>
  )
}


function Reveal({ children, d = 0 }) {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); ob.disconnect() }
    }, { threshold: 0.1 })
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


/* ── 이벤트 팝업 ── */
function EventPopup({ event, onClose, onInsight }) {
  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(6px)',
      animation: 'popupFadeIn 0.3s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#09090B', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, width: '100%', maxWidth: 440, overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        animation: 'popupSlideUp 0.35s ease',
      }}>
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, #DC2626, #F59E0B, #DC2626)',
          backgroundSize: '200% 100%', animation: 'shimmer 3s linear infinite',
        }} />
        <div style={{ padding: '24px 24px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
                padding: '3px 8px', borderRadius: 4,
                background: 'rgba(220,38,38,0.15)', color: '#F87171',
              }}>{event.tag}</span>
              <span style={{ fontSize: 12, fontFamily: FONTS.mono, color: '#71717A' }}>{event.date}</span>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.06)', border: 'none',
              borderRadius: 6, width: 28, height: 28,
              color: '#71717A', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>
          <h3 style={{
            fontSize: 20, fontWeight: 700, fontFamily: FONTS.serif,
            color: '#FAFAFA', margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.3,
          }}>{event.title}</h3>
          <p style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.7, margin: '0 0 20px' }}>
            {event.summary}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={onInsight} style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
              background: PREMIUM.accent, color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              인사이트 보기
            </button>
            <button onClick={onClose} style={{
              padding: '10px 20px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: '#71717A',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>닫기</button>
          </div>
        </div>
      </div>
    </div>
  )
}


/* ── 인사이트 마크다운 모달 ── */
function InsightModal({ event, onClose }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const renderMarkdown = (md) => {
    const lines = md.split('\n')
    const elements = []
    let tableRows = []
    let tableHeaders = []
    let inTable = false

    const flushTable = () => {
      if (tableHeaders.length > 0) {
        elements.push(
          <div key={`tbl-${elements.length}`} style={{ overflowX: 'auto', margin: '12px 0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>{tableHeaders.map((h, i) => (
                  <th key={i} style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '2px solid #27272A', color: '#A1A1AA', fontWeight: 600, fontSize: 11 }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {tableRows.map((row, ri) => (
                  <tr key={ri}>{row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '7px 10px', borderBottom: '1px solid #1E1E22', color: '#D4D4D8', fontSize: 12 }}>{cell}</td>
                  ))}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
      tableHeaders = []
      tableRows = []
      inTable = false
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.split('|').filter(c => c.trim()).map(c => c.trim())
        if (!inTable) { tableHeaders = cells; inTable = true; continue }
        if (cells.every(c => /^[-:]+$/.test(c))) continue
        tableRows.push(cells); continue
      } else if (inTable) { flushTable() }

      if (line.startsWith('# ')) {
        elements.push(<h1 key={i} style={{ fontSize: 20, fontWeight: 700, fontFamily: FONTS.serif, color: '#FAFAFA', margin: '24px 0 12px' }}>{line.slice(2)}</h1>)
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} style={{ fontSize: 16, fontWeight: 700, fontFamily: FONTS.serif, color: '#FAFAFA', margin: '20px 0 10px', paddingTop: 8, borderTop: '1px solid #27272A' }}>{line.slice(3)}</h2>)
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} style={{ fontSize: 14, fontWeight: 600, color: '#E4E4E7', margin: '16px 0 8px' }}>{line.slice(4)}</h3>)
      } else if (line.startsWith('---')) {
        elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid #27272A', margin: '16px 0' }} />)
      } else if (line.startsWith('- **')) {
        const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/)
        if (match) {
          elements.push(
            <div key={i} style={{ display: 'flex', gap: 6, padding: '4px 0', fontSize: 13 }}>
              <span style={{ color: '#DC2626', flexShrink: 0 }}>•</span>
              <span><strong style={{ color: '#FAFAFA' }}>{match[1]}</strong><span style={{ color: '#A1A1AA' }}> {match[2]}</span></span>
            </div>
          )
        }
      } else if (line.startsWith('- ')) {
        elements.push(
          <div key={i} style={{ display: 'flex', gap: 6, padding: '3px 0', fontSize: 13, color: '#A1A1AA' }}>
            <span style={{ color: '#52525B' }}>•</span><span>{line.slice(2)}</span>
          </div>
        )
      } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
        elements.push(<p key={i} style={{ fontSize: 11, color: '#52525B', margin: '12px 0 0', fontStyle: 'italic' }}>{line.replace(/\*/g, '')}</p>)
      } else if (line.trim() === '') {
        elements.push(<div key={i} style={{ height: 6 }} />)
      } else {
        elements.push(<p key={i} style={{ fontSize: 13, color: '#A1A1AA', lineHeight: 1.7, margin: '4px 0' }}>{line}</p>)
      }
    }
    if (inTable) flushTable()
    return elements
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, backdropFilter: 'blur(8px)',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0C0C0E', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16, width: '100%', maxWidth: 640, maxHeight: '85vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #1E1E22',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, fontFamily: FONTS.serif, color: '#FAFAFA' }}>
              DART <span style={{ color: PREMIUM.accent }}>Insight</span>
            </span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
              padding: '2px 7px', borderRadius: 4,
              background: 'rgba(220,38,38,0.15)', color: '#F87171',
            }}>ANALYST BRIEF</span>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: 'none',
            borderRadius: 6, width: 28, height: 28,
            color: '#71717A', fontSize: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 28px' }}>
          {renderMarkdown(event.insight)}
        </div>
      </div>
    </div>
  )
}

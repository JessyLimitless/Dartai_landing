import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FONTS, PREMIUM, GRADE_COLORS } from '../constants/theme'
import { API } from '../lib/api'
import { useLandingData } from '../hooks/useLandingData'
import { CURRENT_EVENT } from '../data/weeklyEvents'

const WEEKLY_EVENT = CURRENT_EVENT
const R = '#DC2626' // 단일 악센트

export default function LandingPage() {
  const navigate = useNavigate()
  const go = () => navigate('/today')
  const { disclosures, stats, loading } = useLandingData()
  const [showPopup, setShowPopup] = useState(false)
  const [showInsight, setShowInsight] = useState(false)
  const [showLoginToast, setShowLoginToast] = useState(false)
  const [showTerms, setShowTerms] = useState(null)
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dart_user')) } catch { return null }
  })

  const googleBtnRef = useRef(null)
  const [showGoogleBtn, setShowGoogleBtn] = useState(false)

  const handleGoogleLogin = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: '20826231899-mfkodjf7svaafnr63ne773g5s6cf5k1m.apps.googleusercontent.com',
        callback: async (response) => {
          try {
            const res = await fetch(`${API || ''}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            })
            if (res.ok) {
              const data = await res.json()
              if (data.user) {
                setUser(data.user)
                localStorage.setItem('dart_user', JSON.stringify(data.user))
                setShowGoogleBtn(false)
              }
            }
          } catch {}
        },
      })
      // prompt 먼저 시도, 실패하면 버튼 렌더링
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowGoogleBtn(true)
            setTimeout(() => {
              if (googleBtnRef.current) {
                window.google.accounts.id.renderButton(googleBtnRef.current, {
                  theme: 'outline', size: 'large', width: 280, text: 'signin_with',
                })
              }
            }, 100)
          }
        })
      } catch {
        setShowGoogleBtn(true)
        setTimeout(() => {
          if (googleBtnRef.current) {
            window.google.accounts.id.renderButton(googleBtnRef.current, {
              theme: 'outline', size: 'large', width: 280, text: 'signin_with',
            })
          }
        }, 100)
      }
    } else {
      setShowLoginToast(true)
      setTimeout(() => setShowLoginToast(false), 2500)
    }
  }

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

  return (
    <div style={{ fontFamily: FONTS.body, overflowX: 'hidden', background: '#FFFFFF' }}>

      {showPopup && (
        <EventPopup event={WEEKLY_EVENT} onClose={dismissPopup}
          onInsight={() => { dismissPopup(); setShowInsight(true) }} />
      )}
      {showInsight && (
        <InsightModal event={WEEKLY_EVENT} onClose={() => setShowInsight(false)} />
      )}

      {/* ━━━ 1. 히어로 ━━━ */}
      <section style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: 'clamp(100px, 15vh, 160px) clamp(20px, 5vw, 64px) 64px',
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
            fontFamily: FONTS.serif, color: '#18181B',
          }}>
            DART <span style={{ color: R }}>Insight</span>
          </span>
          {user ? (
            <div
              onClick={() => { localStorage.removeItem('dart_user'); setUser(null) }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              title="클릭하면 로그아웃"
            >
              {user.picture && <img src={user.picture} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />}
              <span style={{ fontSize: 13, color: '#18181B', fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
          ) : (
            <button onClick={handleGoogleLogin} style={{
              padding: '7px 18px', borderRadius: 6,
              border: '1px solid #E4E4E7',
              background: 'transparent', color: '#71717A',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.borderColor = '#A1A1AA'; e.target.style.color = '#18181B' }}
              onMouseLeave={e => { e.target.style.borderColor = '#E4E4E7'; e.target.style.color = '#71717A' }}
            >로그인</button>
          )}
        </nav>

        <div style={{ maxWidth: 600, width: '100%', textAlign: 'center' }}>
          <Reveal>
            <p style={{ fontSize: 13, color: '#A1A1AA', letterSpacing: '0.1em', fontWeight: 600, margin: '0 0 20px' }}>
              AI DISCLOSURE INTELLIGENCE
            </p>
          </Reveal>

          <Reveal d={80}>
            <h1 style={{
              fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 800,
              lineHeight: 1.15, letterSpacing: '-0.03em',
              margin: '0 0 24px', fontFamily: FONTS.serif, color: '#18181B',
            }}>
              매일 800건의 공시,<br />
              <span style={{ color: R }}>5건</span>만 읽으세요
            </h1>
          </Reveal>

          <Reveal d={160}>
            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)', color: '#71717A',
              lineHeight: 1.6, margin: '0 0 40px', maxWidth: 440, marginLeft: 'auto', marginRight: 'auto',
            }}>
              DART 공시를 AI가 실시간 분석하고,<br />
              주가에 영향을 주는 핵심만 골라드립니다.
            </p>
          </Reveal>

          {/* 실시간 카운터 */}
          <Reveal d={240}>
            <div style={{
              display: 'flex', justifyContent: 'center', gap: 'clamp(24px, 5vw, 48px)',
              marginBottom: 48,
            }}>
              {[
                { label: '오늘 공시', value: totalCount, suffix: '건' },
                { label: 'S등급', value: sCount, suffix: '건', accent: true },
                { label: 'A등급', value: aCount, suffix: '건' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, fontFamily: FONTS.mono,
                    color: s.accent ? R : '#18181B', letterSpacing: -1, lineHeight: 1,
                  }}>
                    <AnimatedNumber value={s.value} /><span style={{ fontSize: '0.5em', fontWeight: 600 }}>{s.suffix}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#A1A1AA', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Reveal>

          {/* CTA */}
          <Reveal d={320}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button onClick={go} style={{
                padding: '14px 40px', borderRadius: 10, border: 'none',
                background: R, color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(220,38,38,0.4)' }}
                onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none' }}
              >
                무료로 시작하기
              </button>
            </div>
          </Reveal>

          <Reveal d={400}>
            <div
              onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              style={{ marginTop: 56, cursor: 'pointer', opacity: 0.25 }}
            >
              <svg width="24" height="24" viewBox="0 0 16 16" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                <path d="M4 6L8 10L12 6" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━ 2. 소셜 프루프 — 실시간 공시 피드 ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(64px, 8vh, 96px) clamp(20px, 5vw, 40px)' }}>
          <Reveal>
            <p style={{
              fontSize: 13, color: '#A1A1AA', letterSpacing: '0.08em', fontWeight: 600,
              textAlign: 'center', marginBottom: 12,
            }}>LIVE FEED</p>
            <h2 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 48px',
              letterSpacing: '-0.02em',
            }}>
              지금 이 공시가 올라왔습니다
            </h2>
          </Reveal>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 64, background: '#F4F4F5', borderRadius: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
              ))}
            </div>
          ) : !recentDisclosures || recentDisclosures.length === 0 ? (
            <div style={{ padding: '48px 0', textAlign: 'center', color: '#A1A1AA', fontSize: 14 }}>
              오늘 공시를 기다리는 중...
            </div>
          ) : (
            <div>
              {recentDisclosures.slice(0, 5).map((d, i) => {
                const gc = GRADE_COLORS[d.grade] || { bg: '#94A3B8', color: '#fff' }
                const kstTime = d.created_at ? (() => {
                  const dt = new Date(d.created_at)
                  const k = new Date(dt.getTime() + 9 * 3600000)
                  return `${String(k.getUTCHours()).padStart(2, '0')}:${String(k.getUTCMinutes()).padStart(2, '0')}`
                })() : ''

                return (
                  <div key={d.rcept_no}
                    onClick={() => d.corp_code ? navigate(`/deep-dive/${d.corp_code}`) : go()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '18px 0', cursor: 'pointer',
                      borderBottom: i < 4 ? '1px solid #F4F4F5' : 'none',
                      transition: 'opacity 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: gc.bg, color: gc.color || '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono,
                    }}>
                      {d.grade}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#18181B' }}>{d.corp_name}</div>
                      <div style={{
                        fontSize: 13, color: '#A1A1AA', marginTop: 2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{d.report_nm}</div>
                    </div>
                    <span style={{ fontSize: 12, color: '#A1A1AA', fontFamily: FONTS.mono, flexShrink: 0 }}>
                      {kstTime}
                    </span>
                  </div>
                )
              })}
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button onClick={go} style={{
                  padding: '10px 28px', borderRadius: 8,
                  border: '1px solid #E4E4E7',
                  background: 'transparent', color: '#71717A',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.target.style.borderColor = '#A1A1AA'; e.target.style.color = '#18181B' }}
                  onMouseLeave={e => { e.target.style.borderColor = '#E4E4E7'; e.target.style.color = '#71717A' }}
                >
                  전체 공시 보기
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ━━━ 3. 작동 방식 — 3단계 ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(64px, 8vh, 96px) clamp(20px, 5vw, 40px)' }}>
          <Reveal>
            <p style={{ fontSize: 13, color: '#A1A1AA', letterSpacing: '0.08em', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>HOW IT WORKS</p>
            <h2 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 56px',
              letterSpacing: '-0.02em',
            }}>
              3단계로 핵심만 잡아냅니다
            </h2>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {[
              {
                step: '01',
                title: '실시간 수집',
                desc: 'DART에서 하루 800건 이상의 공시를 1분 간격으로 수집합니다.',
              },
              {
                step: '02',
                title: 'AI 등급 분류',
                desc: '자사주 소각, 대형 계약, 실적 급변 등 주가에 영향을 주는 공시만 S/A/D 등급으로 선별합니다.',
              },
              {
                step: '03',
                title: '주가 추적',
                desc: '등급 공시 발표 시점부터 5거래일간 실제 주가 변동을 추적하여 데이터로 검증합니다.',
              },
            ].map((item, i) => (
              <Reveal key={i} d={i * 100}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: 32, fontWeight: 800, fontFamily: FONTS.mono,
                    color: i === 1 ? R : '#E4E4E7', lineHeight: 1, flexShrink: 0,
                    width: 48,
                  }}>{item.step}</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#18181B', marginBottom: 8 }}>{item.title}</div>
                    <div style={{ fontSize: 15, color: '#71717A', lineHeight: 1.7 }}>{item.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━ 4. Buffett AI ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5' }}>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: 'clamp(64px, 8vh, 96px) clamp(20px, 5vw, 40px)' }}>
          <Reveal>
            <p style={{ fontSize: 13, color: '#A1A1AA', letterSpacing: '0.08em', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>AI ANALYST</p>
            <h2 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 16px',
              letterSpacing: '-0.02em',
            }}>
              종목을 물어보세요
            </h2>
            <p style={{ fontSize: 15, color: '#71717A', textAlign: 'center', margin: '0 0 40px', lineHeight: 1.6 }}>
              DART 재무제표 + 실시간 시세 + AI 추론으로<br />가치투자 관점의 분석 리포트를 제공합니다.
            </p>
          </Reveal>

          {/* 채팅 시뮬레이션 */}
          <Reveal d={100}>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.08)',
              background: '#0C0C0E',
            }}>
              <div style={{
                padding: '12px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <img src="/bufit.png" alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontSize: 14, fontWeight: 700, color: '#FAFAFA' }}>Buffett AI</span>
              </div>

              <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    padding: '10px 16px', borderRadius: '16px 16px 4px 16px',
                    background: R, color: '#fff',
                    fontSize: 14, fontWeight: 500,
                  }}>
                    SK하이닉스 지금 사도 될까?
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <img src="/bufit.png" alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      padding: '12px 16px', borderRadius: '4px 16px 16px 16px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                      fontSize: 14, color: '#A1A1AA', lineHeight: 1.7,
                    }}>
                      <span style={{ color: '#FAFAFA', fontWeight: 600 }}>현재 안전마진 +18%로 매력적인 구간</span>입니다. HBM3E 독점 공급으로 해자가 견고하고, 부채비율 32%로 재무도 양호해요.
                    </div>

                    <div style={{
                      marginTop: 10, padding: '12px 14px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { label: '안전마진', value: '+18%', pct: 68 },
                          { label: '경제적 해자', value: '넓음', pct: 85 },
                          { label: '부채비율', value: '32%', pct: 82 },
                          { label: 'ROE', value: '21.4%', pct: 78 },
                        ].map((m, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 12, color: '#52525B', width: 60, flexShrink: 0 }}>{m.label}</span>
                            <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                              <div style={{ width: `${m.pct}%`, height: '100%', borderRadius: 2, background: R }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#FAFAFA', fontFamily: FONTS.mono, width: 40, textAlign: 'right' }}>{m.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '12px 16px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{
                  flex: 1, padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)', fontSize: 13, color: '#3F3F46',
                }}>
                  종목명을 입력하세요
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: R, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal d={200}>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button onClick={() => { navigate('/premium'); setTimeout(() => window.dispatchEvent(new Event('open-buffett-chat')), 500) }} style={{
                padding: '12px 32px', borderRadius: 10, border: 'none',
                background: R, color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(220,38,38,0.4)' }}
                onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none' }}
              >
                무료 1회 체험하기
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━ 5. 최종 CTA ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5', background: '#FAFAFA' }}>
        <div style={{
          maxWidth: 480, margin: '0 auto', textAlign: 'center',
          padding: 'clamp(80px, 10vh, 120px) clamp(20px, 5vw, 40px)',
        }}>
          <Reveal>
            <h2 style={{
              fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', margin: '0 0 16px', letterSpacing: '-0.02em',
            }}>
              공시를 읽는 새로운 방법
            </h2>
            <p style={{ fontSize: 15, color: '#71717A', margin: '0 0 36px', lineHeight: 1.6 }}>
              매일 저녁, 3분이면 충분합니다.
            </p>
            <button onClick={go} style={{
              padding: '16px 48px', borderRadius: 10, border: 'none',
              background: R, color: '#fff',
              fontSize: 16, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(220,38,38,0.4)' }}
              onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none' }}
            >
              무료로 시작하기
            </button>
          </Reveal>
        </div>
      </section>

      {/* Google 로그인 버튼 (prompt 실패 시 폴백) */}
      {showGoogleBtn && (
        <div onClick={() => setShowGoogleBtn(false)} style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFFFFF', borderRadius: 16, padding: '32px 28px',
            textAlign: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#18181B', marginBottom: 6 }}>로그인</div>
            <div style={{ fontSize: 13, color: '#71717A', marginBottom: 20 }}>Google 계정으로 시작하세요</div>
            <div ref={googleBtnRef} style={{ display: 'flex', justifyContent: 'center' }} />
            <div onClick={() => setShowGoogleBtn(false)} style={{
              marginTop: 16, fontSize: 13, color: '#A1A1AA', cursor: 'pointer',
            }}>닫기</div>
          </div>
        </div>
      )}

      {/* 로그인 토스트 */}
      {showLoginToast && (
        <div style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', zIndex: 10000,
          background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)',
          borderRadius: 16, padding: '24px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#FAFAFA', marginBottom: 6 }}>로그인 준비 중</div>
          <div style={{ fontSize: 13, color: '#71717A', lineHeight: 1.5 }}>잠시 후 다시 시도해주세요</div>
        </div>
      )}

      {/* ━━━ 푸터 ━━━ */}
      <footer style={{ borderTop: '1px solid #F4F4F5', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px clamp(24px, 5vw, 48px) 40px' }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ fontSize: 18, fontFamily: FONTS.serif, fontWeight: 700, color: '#18181B' }}>
              DART <span style={{ color: R }}>Insight</span>
            </span>
          </div>

          <div style={{ fontSize: 13, lineHeight: 2, color: '#A1A1AA', marginBottom: 24 }}>
            <div style={{ fontWeight: 600, color: '#71717A', marginBottom: 4 }}>주식회사 뮤즈에이아이</div>
            <div>사업자등록번호 : 764-88-03375</div>
            <div>서울특별시 은평구 통일로62길 7, 3층</div>
          </div>

          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            <span onClick={() => setShowTerms('terms')} style={{
              fontSize: 13, color: '#A1A1AA', cursor: 'pointer',
              borderBottom: '1px solid #E4E4E7', paddingBottom: 1,
            }}>이용약관</span>
            <span onClick={() => setShowTerms('privacy')} style={{
              fontSize: 13, color: '#A1A1AA', cursor: 'pointer',
              borderBottom: '1px solid #E4E4E7', paddingBottom: 1,
            }}>개인정보 처리방침</span>
          </div>

          <div style={{
            fontSize: 12, color: '#D4D4D8', lineHeight: 1.6,
            borderTop: '1px solid #E4E4E7', paddingTop: 20,
          }}>
            © 2026 MuseAI Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* 약관/개인정보 모달 */}
      {showTerms && (
        <div onClick={() => setShowTerms(null)} style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, backdropFilter: 'blur(8px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#0C0C0E', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '80vh', overflow: 'auto', padding: '28px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#FAFAFA' }}>
                {showTerms === 'terms' ? '서비스 이용약관' : '개인정보 처리방침'}
              </h3>
              <button onClick={() => setShowTerms(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#52525B' }}>✕</button>
            </div>
            {showTerms === 'terms' ? (
              <div style={{ fontSize: 13, color: '#71717A', lineHeight: 1.8 }}>
                <p><strong style={{ color: '#A1A1AA' }}>제1조 (목적)</strong><br/>이 약관은 주식회사 뮤즈에이아이(이하 "회사")가 제공하는 DART Insight 서비스(이하 "서비스")의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
                <p><strong style={{ color: '#A1A1AA' }}>제2조 (서비스 내용)</strong><br/>회사는 DART·KIND 공시 정보의 수집, 분류, 분석 및 관련 콘텐츠를 제공합니다. 서비스의 구체적인 내용은 회사의 정책에 따라 변경될 수 있습니다.</p>
                <p><strong style={{ color: '#A1A1AA' }}>제3조 (이용자의 의무)</strong><br/>이용자는 서비스를 통해 제공되는 정보를 투자 판단의 참고 자료로만 활용해야 하며, 이를 근거로 한 투자 손실에 대해 회사는 책임을 지지 않습니다.</p>
                <p><strong style={{ color: '#A1A1AA' }}>제4조 (면책)</strong><br/>본 서비스에서 제공하는 모든 정보는 참고용이며, 특정 종목에 대한 매수·매도 추천이 아닙니다. 모든 투자 판단과 그에 따른 결과는 전적으로 이용자 본인의 책임입니다.</p>
                <p><strong style={{ color: '#A1A1AA' }}>제5조 (저작권)</strong><br/>서비스 내 콘텐츠(브리핑, 분석, 전자책 등)의 저작권은 회사에 귀속되며, 무단 복제·배포를 금지합니다.</p>
                <p><strong style={{ color: '#A1A1AA' }}>제6조 (서비스 변경 및 중단)</strong><br/>회사는 운영상 필요한 경우 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며, 이에 대해 사전 공지합니다.</p>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#71717A', lineHeight: 1.8 }}>
                <p><strong style={{ color: '#A1A1AA' }}>1. 수집하는 개인정보</strong><br/>회사는 Google 로그인을 통해 이메일 주소, 이름, 프로필 사진을 수집합니다. 별도의 회원가입 절차 없이 Google 계정 정보만 활용합니다.</p>
                <p><strong style={{ color: '#A1A1AA' }}>2. 개인정보의 이용 목적</strong><br/>수집된 정보는 서비스 이용자 식별, 관심종목 관리, 서비스 개선을 위한 통계 분석에 활용됩니다.</p>
                <p><strong style={{ color: '#A1A1AA' }}>3. 개인정보의 보유 및 이용 기간</strong><br/>이용자의 개인정보는 서비스 탈퇴 시까지 보유하며, 탈퇴 요청 시 지체 없이 파기합니다.</p>
                <p><strong style={{ color: '#A1A1AA' }}>4. 개인정보의 제3자 제공</strong><br/>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의한 요청이 있는 경우 예외로 합니다.</p>
                <p><strong style={{ color: '#A1A1AA' }}>5. 개인정보의 안전성 확보 조치</strong><br/>회사는 개인정보의 안전한 처리를 위해 SSL 암호화 통신, 접근 권한 제한 등 기술적·관리적 보호 조치를 시행합니다.</p>
                <p><strong style={{ color: '#A1A1AA' }}>6. 정보주체의 권리</strong><br/>이용자는 언제든지 자신의 개인정보에 대한 열람, 수정, 삭제를 요청할 수 있으며, 회사는 이에 지체 없이 응합니다.</p>
                <p><strong style={{ color: '#A1A1AA' }}>7. 개인정보 보호 책임자</strong><br/>주식회사 뮤즈에이아이 (문의: dartinsight@museai.co.kr)</p>
              </div>
            )}
          </div>
        </div>
      )}

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

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value <= 0) return
    const duration = 1000
    const start = performance.now()
    const from = 0
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (value - from) * eased))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])

  return <>{display.toLocaleString()}</>
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
      opacity: v ? 1 : 0, transform: v ? 'none' : 'translateY(16px)',
      transition: `opacity 0.5s ease ${d}ms, transform 0.5s ease ${d}ms`,
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
          background: `linear-gradient(90deg, ${R}, #F59E0B, ${R})`,
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
              background: R, color: '#fff',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
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
              <span style={{ color: R, flexShrink: 0 }}>•</span>
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
              DART <span style={{ color: R }}>Insight</span>
            </span>
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

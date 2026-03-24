import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FONTS, PREMIUM, GRADE_COLORS } from '../constants/theme'
import { API } from '../lib/api'
import { useLandingData } from '../hooks/useLandingData'

const R = '#DC2626'

export default function LandingPage() {
  const navigate = useNavigate()
  const { disclosures, stats, loading } = useLandingData()
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

  const totalCount = stats?.today_count ?? 0
  const sCount = stats?.s_count ?? 0
  const aCount = stats?.a_count ?? 0

  return (
    <div style={{ fontFamily: FONTS.body, overflowX: 'hidden', background: '#FFFFFF' }}>

      {/* ━━━ 1. 히어로 ━━━ */}
      <section style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: 'clamp(100px, 15vh, 160px) clamp(20px, 5vw, 64px) 64px',
        position: 'relative',
      }}>
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
            <div onClick={() => { localStorage.removeItem('dart_user'); setUser(null) }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              {user.picture && <img src={user.picture} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />}
              <span style={{ fontSize: 13, color: '#18181B', fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
            </div>
          ) : (
            <button onClick={handleGoogleLogin} style={{
              padding: '7px 18px', borderRadius: 6,
              border: '1px solid #E4E4E7', background: 'transparent',
              color: '#71717A', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>로그인</button>
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

          <Reveal d={320}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button onClick={() => navigate('/today')} style={{
                padding: '14px 40px', borderRadius: 10, border: 'none',
                background: R, color: '#fff',
                fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(220,38,38,0.4)' }}
                onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none' }}
              >무료로 시작하기</button>
            </div>
          </Reveal>

          <Reveal d={400}>
            <div onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              style={{ marginTop: 56, cursor: 'pointer', opacity: 0.25 }}>
              <svg width="24" height="24" viewBox="0 0 16 16" fill="none" style={{ display: 'block', margin: '0 auto' }}>
                <path d="M4 6L8 10L12 6" stroke="#18181B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━ 2. 일일 브리핑 ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(64px, 8vh, 96px) clamp(20px, 5vw, 40px)' }}>
          <Reveal>
            <p style={{ fontSize: 13, color: '#A1A1AA', letterSpacing: '0.08em', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>DAILY BRIEFING</p>
            <h2 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 16px', letterSpacing: '-0.02em',
            }}>
              매일 저녁, 핵심 공시 5건을 해석합니다
            </h2>
            <p style={{ fontSize: 15, color: '#71717A', textAlign: 'center', margin: '0 0 48px', lineHeight: 1.6 }}>
              공시 유형 분류 → 맥락 해석 → 이해관계 분석 → 시그널 판정 → 감시 포인트까지.<br />
              5-Step 프레임워크로 공시의 이면을 읽어드립니다.
            </p>
          </Reveal>

          <Reveal d={100}>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid #F0F0F2', background: '#FAFAFA',
            }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F2', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: R, color: '#fff', letterSpacing: '0.05em' }}>DAILY BRIEF</span>
                <span style={{ fontSize: 12, color: '#A1A1AA', fontFamily: FONTS.mono }}>2026-03-23</span>
              </div>
              {[
                { num: '1', name: '사람인', type: '공개매수', signal: '🔵 Mild Bull' },
                { num: '2', name: '삼성중공업', type: 'LNG 수주 7,700억', signal: '🔵 Mild Bull' },
                { num: '3', name: '세나테크놀로지', type: '자사주 50억 소각', signal: '🟢 Strong Bull' },
                { num: '4', name: 'EDGC', type: '회생 유상증자 165억', signal: '⚪ Neutral' },
                { num: '5', name: '대한조선', type: '원유운반선 수주', signal: '🔵 Mild Bull' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
                  borderBottom: i < 4 ? '1px solid #F4F4F5' : 'none',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: R, fontFamily: FONTS.mono, width: 20 }}>{item.num}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#18181B' }}>{item.name}</span>
                    <span style={{ fontSize: 12, color: '#A1A1AA', marginLeft: 8 }}>{item.type}</span>
                  </div>
                  <span style={{ fontSize: 11, color: '#71717A', flexShrink: 0 }}>{item.signal}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal d={200}>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button onClick={() => navigate('/briefing')} style={{
                padding: '10px 28px', borderRadius: 8,
                border: '1px solid #E4E4E7', background: 'transparent',
                color: '#71717A', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>오늘의 브리핑 보기</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━ 3. DART View — 딥분석 ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(64px, 8vh, 96px) clamp(20px, 5vw, 40px)' }}>
          <Reveal>
            <p style={{ fontSize: 13, color: '#A1A1AA', letterSpacing: '0.08em', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>DART VIEW</p>
            <h2 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 16px', letterSpacing: '-0.02em',
            }}>
              462종목, 8섹션 재무 딥분석
            </h2>
            <p style={{ fontSize: 15, color: '#71717A', textAlign: 'center', margin: '0 0 48px', lineHeight: 1.6 }}>
              DART 공시 재무제표를 기반으로 실적·현금흐름·밸류에이션·리스크까지.<br />
              증권사 리포트가 다루지 않는 깊이를 제공합니다.
            </p>
          </Reveal>

          <Reveal d={100}>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid #F0F0F2', background: '#FFFFFF',
            }}>
              {[
                { rank: 1, name: '삼성전자', code: '005930', grade: 'A', cap: '420.3조', color: '#0D9488' },
                { rank: 2, name: 'SK하이닉스', code: '000660', grade: 'A+', cap: '180.5조', color: '#16A34A' },
                { rank: 3, name: '현대차', code: '005380', grade: 'A', cap: '52.1조', color: '#0D9488' },
                { rank: 4, name: 'LG에너지솔루션', code: '373220', grade: 'B+', cap: '48.7조', color: '#D97706' },
                { rank: 5, name: '삼성바이오로직스', code: '207940', grade: 'A-', cap: '46.2조', color: '#0D9488' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
                  borderBottom: i < 4 ? '1px solid #F4F4F5' : 'none',
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#A1A1AA', fontFamily: FONTS.mono, width: 24, textAlign: 'right' }}>{item.rank}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#18181B', fontFamily: FONTS.serif }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: item.color, fontFamily: FONTS.mono,
                    padding: '2px 8px', borderRadius: 6, background: `${item.color}15` }}>{item.grade}</span>
                  <span style={{ fontSize: 11, color: '#A1A1AA', fontFamily: FONTS.mono, width: 52, textAlign: 'right' }}>{item.cap}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal d={200}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
              {['실적 해부', '현금흐름', '밸류에이션', '해외 Peer', '리스크', '종합 점수'].map((tag, i) => (
                <span key={i} style={{
                  fontSize: 12, fontWeight: 500, color: '#71717A',
                  padding: '5px 12px', borderRadius: 20, background: '#F4F4F5',
                }}>{tag}</span>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button onClick={() => navigate('/dart-view')} style={{
                padding: '12px 32px', borderRadius: 10, border: 'none',
                background: R, color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(220,38,38,0.4)' }}
                onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none' }}
              >전체 종목 보기</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━ 4. 작동 방식 ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(64px, 8vh, 96px) clamp(20px, 5vw, 40px)' }}>
          <Reveal>
            <p style={{ fontSize: 13, color: '#A1A1AA', letterSpacing: '0.08em', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>HOW IT WORKS</p>
            <h2 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 56px', letterSpacing: '-0.02em',
            }}>
              3단계로 핵심만 잡아냅니다
            </h2>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {[
              { step: '01', title: '실시간 수집', desc: 'DART + KRX KIND에서 하루 800건 이상의 공시를 30초 간격으로 수집합니다.' },
              { step: '02', title: 'AI 등급 분류 + 실시간 알림', desc: '핵심 공시가 나올 때마다 즉시 Web Push 알림으로 전달합니다. 장중 수시로, 놓치면 안 되는 공시만 골라서.' },
              { step: '03', title: '딥분석 + 브리핑', desc: '462종목 8섹션 재무 딥분석과 매일 저녁 핵심 공시 5건의 5-Step 브리핑을 제공합니다.' },
            ].map((item, i) => (
              <Reveal key={i} d={i * 100}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: 32, fontWeight: 800, fontFamily: FONTS.mono,
                    color: i === 1 ? R : '#E4E4E7', lineHeight: 1, flexShrink: 0, width: 48,
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

      {/* ━━━ 5. 실시간 공시 피드 ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(64px, 8vh, 96px) clamp(20px, 5vw, 40px)' }}>
          <Reveal>
            <p style={{ fontSize: 13, color: '#A1A1AA', letterSpacing: '0.08em', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>LIVE FEED</p>
            <h2 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 48px', letterSpacing: '-0.02em',
            }}>
              지금 이 공시가 올라왔습니다
            </h2>
          </Reveal>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ height: 64, background: '#F0F0F2', borderRadius: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
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
                    onClick={() => navigate('/today')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '18px 0', cursor: 'pointer',
                      borderBottom: i < 4 ? '1px solid #F4F4F5' : 'none',
                    }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                      background: gc.bg, color: gc.color || '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono,
                    }}>{d.grade}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#18181B' }}>{d.corp_name}</div>
                      <div style={{
                        fontSize: 13, color: '#A1A1AA', marginTop: 2,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>{d.report_nm}</div>
                    </div>
                    <span style={{ fontSize: 12, color: '#A1A1AA', fontFamily: FONTS.mono, flexShrink: 0 }}>{kstTime}</span>
                  </div>
                )
              })}
              <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button onClick={() => navigate('/today')} style={{
                  padding: '10px 28px', borderRadius: 8,
                  border: '1px solid #E4E4E7', background: 'transparent',
                  color: '#71717A', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>전체 공시 보기</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ━━━ 6. 최종 CTA ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5' }}>
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
            <button onClick={() => navigate('/today')} style={{
              padding: '16px 48px', borderRadius: 10, border: 'none',
              background: R, color: '#fff',
              fontSize: 16, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(220,38,38,0.4)' }}
              onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none' }}
            >무료로 시작하기</button>
          </Reveal>
        </div>
      </section>

      {/* Google 로그인 폴백 */}
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
            <p style={{ fontSize: 15, fontWeight: 600, color: '#18181B', marginBottom: 20 }}>Google 계정으로 로그인</p>
            <div ref={googleBtnRef} />
            <button onClick={() => setShowGoogleBtn(false)} style={{
              marginTop: 16, padding: '8px 20px', borderRadius: 6,
              border: '1px solid #E4E4E7', background: 'transparent',
              color: '#71717A', fontSize: 13, cursor: 'pointer',
            }}>취소</button>
          </div>
        </div>
      )}

      {/* 푸터 */}
      <footer style={{
        borderTop: '1px solid #F4F4F5', padding: '24px clamp(20px, 5vw, 64px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: '#A1A1AA' }}>© 2026 DART Insight</span>
        <span onClick={() => navigate('/inquiry')} style={{
          fontSize: 12, color: '#A1A1AA', cursor: 'pointer',
        }}>문의하기</span>
      </footer>

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  )
}


// ── 유틸 컴포넌트 ──
function Reveal({ children, d = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? 'none' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${d}ms, transform 0.6s ease ${d}ms`,
    }}>{children}</div>
  )
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect() } }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  useEffect(() => {
    if (!started || value === 0) return
    let start = 0
    const step = Math.max(1, Math.floor(value / 30))
    const timer = setInterval(() => {
      start += step
      if (start >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(start)
    }, 30)
    return () => clearInterval(timer)
  }, [started, value])
  return <span ref={ref}>{display}</span>
}

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
  const [showTerms, setShowTerms] = useState(null)

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

      {/* ━━━ 2. 공시 후 급등 — 가장 강력한 셀링 포인트 ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(64px, 8vh, 96px) clamp(20px, 5vw, 40px)' }}>
          <Reveal>
            <p style={{ fontSize: 13, color: '#A1A1AA', letterSpacing: '0.08em', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>LIVE SIGNAL</p>
            <h2 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 16px', letterSpacing: '-0.02em',
            }}>
              공시가 나오면, 주가가 움직입니다
            </h2>
            <p style={{ fontSize: 15, color: '#71717A', textAlign: 'center', margin: '0 0 40px', lineHeight: 1.6 }}>
              실시간으로 포착한 공시 직후 급등 종목입니다.<br />
              이 알림을 받았다면, 당신도 탈 수 있었습니다.
            </p>
          </Reveal>

          <Reveal d={100}>
            <LiveRiserLanding navigate={navigate} />
          </Reveal>

          <Reveal d={200}>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button onClick={() => navigate('/today')} style={{
                padding: '12px 32px', borderRadius: 10, border: 'none',
                background: R, color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(220,38,38,0.4)' }}
                onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none' }}
              >실시간 공시 보기</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━ 3. 일일 브리핑 ━━━ */}
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
              공시의 이면을 5-Step 프레임워크로 읽어드립니다.
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
                { num: '1', name: '사람인', type: '공개매수', signal: '긍정', color: '#0D9488' },
                { num: '2', name: '삼성중공업', type: 'LNG 수주 7,700억', signal: '긍정', color: '#0D9488' },
                { num: '3', name: '세나테크놀로지', type: '자사주 50억 소각', signal: '강력 긍정', color: '#16A34A' },
                { num: '4', name: 'EDGC', type: '회생 유상증자 165억', signal: '중립', color: '#A1A1AA' },
                { num: '5', name: '대한조선', type: '원유운반선 수주', signal: '긍정', color: '#0D9488' },
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
                  borderBottom: i < 4 ? '1px solid #F4F4F5' : 'none',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: R, fontFamily: FONTS.mono, width: 20 }}>{item.num}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#18181B' }}>{item.name}</span>
                    <span style={{ fontSize: 12, color: '#A1A1AA', marginLeft: 8 }}>{item.type}</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: item.color, flexShrink: 0,
                    padding: '3px 10px', borderRadius: 12,
                    background: `${item.color}15`,
                  }}>{item.signal}</span>
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
              { step: '01', title: '실시간 수집 + 알림', desc: 'DART + KRX KIND에서 30초 간격으로 수집하고, 핵심 공시가 나올 때마다 즉시 Push 알림으로 전달합니다.' },
              { step: '02', title: '공시 후 급등 종목 실시간 추적', desc: '공시 발표 직후 주가가 움직이는 종목을 실시간으로 포착합니다. 어떤 공시가 시장을 움직이는지, 데이터로 증명합니다.' },
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

          <Reveal d={200}>
            <a href="https://jessylimitless.github.io/dartbook/" target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '18px 20px', borderRadius: 14, textDecoration: 'none',
                background: '#FAFAFA', border: '1px solid #F0F0F2',
                marginTop: 40, textAlign: 'left', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0F0F2'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 11, flexShrink: 0,
                background: '#0F2440', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 3 }}>FREE E-BOOK</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#18181B' }}>전자공시 시그널 가이드</div>
                <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>공시의 첫걸음 — 무료로 읽어보세요</div>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
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
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
            <span onClick={() => setShowTerms('terms')} style={{ fontSize: 13, color: '#A1A1AA', cursor: 'pointer', borderBottom: '1px solid #E4E4E7', paddingBottom: 1 }}>이용약관</span>
            <span onClick={() => setShowTerms('privacy')} style={{ fontSize: 13, color: '#A1A1AA', cursor: 'pointer', borderBottom: '1px solid #E4E4E7', paddingBottom: 1 }}>개인정보 처리방침</span>
            <span onClick={() => navigate('/inquiry')} style={{
              fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer',
              padding: '4px 12px', borderRadius: 6, background: '#DC2626',
            }}>자동매매 프로그램 문의</span>
          </div>
          <div style={{ fontSize: 12, color: '#D4D4D8', lineHeight: 1.6, borderTop: '1px solid #E4E4E7', paddingTop: 20 }}>
            © 2026 MuseAI Inc. All rights reserved.
          </div>
        </div>
      </footer>

      {/* 약관/개인정보 모달 */}
      {showTerms && (
        <div onClick={() => setShowTerms(null)} style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, backdropFilter: 'blur(8px)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFFFFF', border: '1px solid #E4E4E7',
            borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '80vh', overflow: 'auto', padding: '28px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: '#18181B' }}>
                {showTerms === 'terms' ? '서비스 이용약관' : '개인정보 처리방침'}
              </h3>
              <button onClick={() => setShowTerms(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#A1A1AA' }}>✕</button>
            </div>
            {showTerms === 'terms' ? (
              <div style={{ fontSize: 13, color: '#71717A', lineHeight: 1.8 }}>
                <p><strong style={{ color: '#18181B' }}>제1조 (목적)</strong><br/>이 약관은 주식회사 뮤즈에이아이(이하 "회사")가 제공하는 DART Insight 서비스(이하 "서비스")의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
                <p><strong style={{ color: '#18181B' }}>제2조 (서비스 내용)</strong><br/>회사는 DART·KIND 공시 정보의 수집, 분류, 분석 및 관련 콘텐츠를 제공합니다.</p>
                <p><strong style={{ color: '#18181B' }}>제3조 (이용자의 의무)</strong><br/>이용자는 서비스를 통해 제공되는 정보를 투자 판단의 참고 자료로만 활용해야 하며, 이를 근거로 한 투자 손실에 대해 회사는 책임을 지지 않습니다.</p>
                <p><strong style={{ color: '#18181B' }}>제4조 (면책)</strong><br/>본 서비스에서 제공하는 모든 정보는 참고용이며, 특정 종목에 대한 매수·매도 추천이 아닙니다. 모든 투자 판단과 그에 따른 결과는 전적으로 이용자 본인의 책임입니다.</p>
                <p><strong style={{ color: '#18181B' }}>제5조 (저작권)</strong><br/>서비스 내 콘텐츠(브리핑, 분석, 전자책 등)의 저작권은 회사에 귀속되며, 무단 복제·배포를 금지합니다.</p>
                <p><strong style={{ color: '#18181B' }}>제6조 (서비스 변경 및 중단)</strong><br/>회사는 운영상 필요한 경우 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며, 이에 대해 사전 공지합니다.</p>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#71717A', lineHeight: 1.8 }}>
                <p><strong style={{ color: '#18181B' }}>1. 수집하는 개인정보</strong><br/>회사는 Google 로그인을 통해 이메일 주소, 이름, 프로필 사진을 수집합니다.</p>
                <p><strong style={{ color: '#18181B' }}>2. 개인정보의 이용 목적</strong><br/>수집된 정보는 서비스 이용자 식별, 관심종목 관리, 서비스 개선을 위한 통계 분석에 활용됩니다.</p>
                <p><strong style={{ color: '#18181B' }}>3. 개인정보의 보유 및 이용 기간</strong><br/>이용자의 개인정보는 서비스 탈퇴 시까지 보유하며, 탈퇴 요청 시 지체 없이 파기합니다.</p>
                <p><strong style={{ color: '#18181B' }}>4. 개인정보의 제3자 제공</strong><br/>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.</p>
                <p><strong style={{ color: '#18181B' }}>5. 개인정보의 안전성 확보 조치</strong><br/>회사는 SSL 암호화 통신, 접근 권한 제한 등 기술적·관리적 보호 조치를 시행합니다.</p>
                <p><strong style={{ color: '#18181B' }}>6. 정보주체의 권리</strong><br/>이용자는 언제든지 자신의 개인정보에 대한 열람, 수정, 삭제를 요청할 수 있습니다.</p>
                <p><strong style={{ color: '#18181B' }}>7. 개인정보 보호 책임자</strong><br/>주식회사 뮤즈에이아이 (문의: dartinsight@museai.co.kr)</p>
              </div>
            )}
          </div>
        </div>
      )}

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

function LiveRiserLanding({ navigate }) {
  const [risers, setRisers] = useState([])
  const [riserLoading, setRiserLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/api/disclosures`)
      .then(r => r.json())
      .then(data => {
        const discs = data.disclosures || []
        // 오늘 공시 중 가격 데이터 있는 것
        const now = new Date()
        const kstNow = new Date(now.getTime() + 9 * 3600000)
        const targetStr = kstNow.toISOString().slice(0, 10)

        fetch(`${API}/api/stats`)
          .then(r => r.json())
          .then(stats => {
            // price_changes에서 상승 종목 추출
            const priceMap = stats.price_changes || {}
            const seen = new Set()
            const results = discs
              .filter(d => {
                const pd = priceMap[d.stock_code]
                if (!pd || !pd.change_pct || pd.change_pct <= 0) return false
                if (seen.has(d.stock_code)) return false
                seen.add(d.stock_code)
                return true
              })
              .map(d => ({
                ...d,
                changePct: priceMap[d.stock_code].change_pct,
                price: priceMap[d.stock_code].price,
              }))
              .sort((a, b) => b.changePct - a.changePct)
              .slice(0, 5)
            setRisers(results)
          })
          .catch(() => {})
      })
      .catch(() => {})
      .finally(() => setRiserLoading(false))
  }, [])

  if (riserLoading) return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 64, background: '#F0F0F2', borderRadius: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
      ))}
    </div>
  )

  if (risers.length === 0) return (
    <div style={{
      borderRadius: 16, overflow: 'hidden', border: '1px solid #F0F0F2', background: '#FFFFFF',
    }}>
      {[
        { name: '예시 종목 A', report: '단일판매·공급계약체결 (매출 35%)', pct: '+12.3', grade: 'S' },
        { name: '예시 종목 B', report: '자기주식취득 결정 (50억 소각)', pct: '+8.7', grade: 'A' },
        { name: '예시 종목 C', report: '영업이익 흑자전환 (YoY +340%)', pct: '+6.2', grade: 'A' },
      ].map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
          borderBottom: i < 2 ? '1px solid #F4F4F5' : 'none',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: item.grade === 'S' ? '#E8364E' : '#0D9488',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: FONTS.mono,
          }}>{item.grade}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#18181B' }}>{item.name}</div>
            <div style={{ fontSize: 12, color: '#A1A1AA', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.report}</div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#DC2626', fontFamily: FONTS.mono, flexShrink: 0 }}>{item.pct}%</span>
        </div>
      ))}
      <div style={{ padding: '12px 20px', background: '#FAFAFA', textAlign: 'center', fontSize: 12, color: '#A1A1AA' }}>
        장중 실시간 데이터로 업데이트됩니다
      </div>
    </div>
  )

  return (
    <div style={{
      borderRadius: 16, overflow: 'hidden', border: '1px solid #F0F0F2', background: '#FFFFFF',
    }}>
      <div style={{
        padding: '10px 20px', borderBottom: '1px solid #F4F4F5',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="#DC2626"><path d="M8 2L13 9H3L8 2Z" /></svg>
        <span style={{ fontSize: 13, fontWeight: 800, color: '#18181B' }}>공시 후 급등</span>
        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#DC2626', color: '#fff' }}>LIVE</span>
      </div>
      {risers.map((d, i) => {
        const gc = GRADE_COLORS[d.grade] || { bg: '#94A3B8' }
        return (
          <div key={d.rcept_no} onClick={() => navigate('/today')}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
              cursor: 'pointer', borderBottom: i < risers.length - 1 ? '1px solid #F4F4F5' : 'none',
            }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
              background: gc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: FONTS.mono,
            }}>{d.grade}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#18181B' }}>{d.corp_name}</div>
              <div style={{ fontSize: 12, color: '#A1A1AA', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.report_nm}</div>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#DC2626', fontFamily: FONTS.mono, flexShrink: 0 }}>
              +{d.changePct.toFixed(1)}%
            </span>
          </div>
        )
      })}
    </div>
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

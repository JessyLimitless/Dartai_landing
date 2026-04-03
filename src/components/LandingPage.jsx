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
              공시가 나오면,<br />
              <span style={{ color: R }}>주가가 움직입니다</span>
            </h1>
          </Reveal>
          <Reveal d={160}>
            <p style={{
              fontSize: 'clamp(15px, 2vw, 18px)', color: '#71717A',
              lineHeight: 1.6, margin: '0 0 40px', maxWidth: 480, marginLeft: 'auto', marginRight: 'auto',
            }}>
              매일 800건의 공시, 다 읽을 수 없잖아요.<br />
              주가를 움직이는 핵심 5건만 골라서 알려드려요.
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

      {/* ━━━ 1.5 실시간 급등 피드 ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(64px, 8vh, 96px) clamp(20px, 5vw, 40px)' }}>
          <Reveal>
            <p style={{ fontSize: 13, color: '#A1A1AA', letterSpacing: '0.08em', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>LIVE SURGE</p>
            <h2 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 48px', letterSpacing: '-0.02em',
            }}>
              공시 직후 급등한 종목,<br />
              실시간으로 포착합니다
            </h2>
          </Reveal>
          <Reveal d={100}>
            <LiveRiserLanding navigate={navigate} />
          </Reveal>
        </div>
      </section>

      {/* ━━━ 2. 공시 임팩트 — 킬러콘텐츠 ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(64px, 8vh, 96px) clamp(20px, 5vw, 40px)' }}>
          <Reveal>
            <p style={{ fontSize: 13, color: '#A1A1AA', letterSpacing: '0.08em', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>AI DISCLOSURE ANALYST</p>
            <h2 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 16px', letterSpacing: '-0.02em',
            }}>
              급등한 이유,<br />AI가 즉시 해석합니다
            </h2>
            <p style={{ fontSize: 15, color: '#71717A', textAlign: 'center', margin: '0 0 40px', lineHeight: 1.6 }}>
              공시 원문을 AI가 직접 읽고 핵심을 요약합니다.<br />
              왜 올랐는지, 어떻게 봐야 하는지 — 증권사 리포트보다 빠릅니다.
            </p>
          </Reveal>

          <Reveal d={100}>
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
              fontSize: 'clamp(18px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 16px', letterSpacing: '-0.02em',
              whiteSpace: 'nowrap',
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
              <BriefingPreview />
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

      {/* ━━━ 3.5. 이슈 리포트 — 킬러콘텐츠 ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(64px, 8vh, 96px) clamp(20px, 5vw, 40px)' }}>
          <Reveal>
            <p style={{ fontSize: 13, color: '#A1A1AA', letterSpacing: '0.08em', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>ISSUE TRACKER</p>
            <h2 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 16px', letterSpacing: '-0.02em',
            }}>
              공시의 이면을 읽습니다
            </h2>
            <p style={{ fontSize: 15, color: '#71717A', textAlign: 'center', margin: '0 0 40px', lineHeight: 1.6 }}>
              유상증자 27건이 한꺼번에 나온 이유, 경영권 분쟁의 다음 수순,<br />
              정치경제가 공시에 남기는 흔적까지. 숫자 너머의 구도를 해석합니다.
            </p>
          </Reveal>

          <Reveal d={100}>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              border: '1px solid #F0F0F2', background: '#FFFFFF',
            }}>
              {[
                { tag: '매크로', tagColor: '#2563EB', title: '비용의 시대는 끝났다 — 정치경제가 지배하는 새로운 투자 문법', date: '2026.03.28' },
                { tag: '유상증자', tagColor: '#D97706', title: '티웨이 → 트리니티: 4,000억 유증 완료 + 사명 변경', date: '2026.03.27' },
                { tag: '경영권', tagColor: '#DC2626', title: '한화솔루션 주총 유상증자 → -18% 폭락', date: '2026.03.26' },
              ].map((item, i) => (
                <div key={i} onClick={() => navigate('/issue')}
                  style={{
                    padding: '16px 20px', cursor: 'pointer',
                    borderBottom: i < 2 ? '1px solid #F4F4F5' : 'none',
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                  }}>
                  <div style={{ flexShrink: 0, marginTop: 2 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                      background: `${item.tagColor}15`, color: item.tagColor,
                    }}>{item.tag}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#18181B', lineHeight: 1.4 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#A1A1AA', marginTop: 4, fontFamily: 'var(--font-mono, monospace)' }}>{item.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal d={200}>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button onClick={() => navigate('/issues')} style={{
                padding: '12px 32px', borderRadius: 10, border: 'none',
                background: R, color: '#fff',
                fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 24px rgba(220,38,38,0.4)' }}
                onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = 'none' }}
              >이슈 트래커 보기</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ━━━ 4. DART View — 딥분석 ━━━ */}
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

      {/* ━━━ 4.5. 시그널 시리즈 — 전자책 3부작 ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(64px, 8vh, 96px) clamp(20px, 5vw, 40px)' }}>
          <Reveal>
            <p style={{ fontSize: 13, color: '#A1A1AA', letterSpacing: '0.08em', fontWeight: 600, textAlign: 'center', marginBottom: 12 }}>SIGNAL SERIES</p>
            <h2 style={{
              fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, fontFamily: FONTS.serif,
              color: '#18181B', textAlign: 'center', margin: '0 0 16px', letterSpacing: '-0.02em',
            }}>
              공시 · 재무 · 법률,<br />
              세 겹의 시그널을 읽는 법
            </h2>
            <p style={{ fontSize: 15, color: '#71717A', textAlign: 'center', margin: '0 0 48px', lineHeight: 1.6 }}>
              전자공시 시그널에서 시작해, 재무제표의 행간과 상법의 구조까지.<br />
              숫자 너머의 진짜 시그널을 읽는 3부작 시리즈입니다.
            </p>
          </Reveal>

          <Reveal d={100}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                {
                  num: 'Vol. 1',
                  title: '전자공시 시그널',
                  desc: '800건의 공시에서 주가를 움직이는 S등급을 골라내는 체계적 방법론',
                  url: 'https://jessylimitless.github.io/dartbook/',
                  accent: '#DC2626',
                  tag: '공시',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  ),
                },
                {
                  num: 'Vol. 2',
                  title: 'Financial Signal',
                  desc: '재무제표는 경영진이 쓴 자서전이다 — 적힌 것보다 빠진 것이 더 중요하다',
                  url: 'https://jessylimitless.github.io/financial_signal/',
                  accent: '#10B981',
                  tag: '재무',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M2 3h20v18H2z" /><path d="M2 9h20" /><path d="M8 3v18" />
                    </svg>
                  ),
                },
                {
                  num: 'Vol. 3',
                  title: '상법 Signal',
                  desc: '법적 리스크를 투자 시그널로 전환하는 법 — 지배구조의 소스코드를 읽는 기술',
                  url: 'https://jessylimitless.github.io/law_signal/',
                  accent: '#7C3AED',
                  tag: '법률',
                  icon: (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                    </svg>
                  ),
                },
              ].map((book, i) => (
                <a key={i} href={book.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '20px 20px', borderRadius: 14, textDecoration: 'none',
                    background: '#FFFFFF', border: '1px solid #F0F0F2',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = book.accent; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${book.accent}15` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0F0F2'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                    background: `${book.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {book.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: book.accent, letterSpacing: '0.05em', fontFamily: FONTS.mono }}>{book.num}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: `${book.accent}12`, color: book.accent }}>{book.tag}</span>
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#18181B', marginBottom: 2 }}>{book.title}</div>
                    <div style={{ fontSize: 12, color: '#71717A', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{book.desc}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal d={200}>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <button onClick={() => navigate('/library')} style={{
                padding: '10px 28px', borderRadius: 8,
                border: '1px solid #E4E4E7', background: 'transparent',
                color: '#71717A', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              }}>전체 서재 보기</button>
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
              이렇게 도와드려요
            </h2>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {[
              { step: '01', title: '하루 800건, 핵심 5건만', desc: '매일 쏟아지는 공시 중에서 주가를 움직이는 S/A등급만 골라드려요. 나머지 795건은 볼 필요 없어요.' },
              { step: '02', title: '공시 나오면, 바로 포착', desc: '공시 직후 급등하는 종목을 실시간으로 추적해요. 어떤 공시에 시장이 반응하는지 한눈에 보여요.' },
              { step: '03', title: 'AI가 기업을 설명해줘요', desc: '처음 보는 종목이어도 괜찮아요. 일반 AI와 달리 DART 공시와 실시간 시세 데이터를 직접 읽고 답해서 정확해요.' },
            ].map((item, i) => (
              <Reveal key={i} d={i * 100}>
                <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: 32, fontWeight: 800, fontFamily: FONTS.mono,
                    color: i === 1 ? R : (i === 2 ? R : '#E4E4E7'), lineHeight: 1, flexShrink: 0, width: 48,
                  }}>{item.step}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#18181B', marginBottom: 8 }}>{item.title}</div>
                    <div style={{ fontSize: 15, color: '#71717A', lineHeight: 1.7 }}>{item.desc}</div>
                  </div>
                </div>
                {/* 03번: AI 챗봇 실제 화면 미리보기 */}
                {i === 2 && (
                  <div style={{
                    marginTop: 24, marginLeft: 68, borderRadius: 20, overflow: 'hidden',
                    background: '#fff', border: '1px solid #E8E8EC',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    maxWidth: 360,
                  }}>
                    {/* 챗봇 헤더 */}
                    <div style={{
                      padding: '14px 18px', borderBottom: '1px solid #F2F2F4',
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: '#FAFAFA',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 10,
                        background: `linear-gradient(135deg, ${R} 0%, #E8364E 100%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(220,38,38,0.2)',
                      }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#18181B', letterSpacing: '-0.3px' }}>AI 기업분석</div>
                        <div style={{ fontSize: 10, color: '#A1A1AA' }}>DART + 키움 실시간 데이터 기반</div>
                      </div>
                    </div>

                    {/* 강점 배지 */}
                    <div style={{
                      padding: '0 16px', display: 'flex', gap: 6, flexWrap: 'wrap',
                    }}>
                      {['실시간 DART 공시', '키움 시세 연동', '재무제표 검증'].map(tag => (
                        <span key={tag} style={{
                          fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                          background: '#FEF2F2', color: R, letterSpacing: '-0.1px',
                        }}>{tag}</span>
                      ))}
                    </div>

                    {/* 대화 영역 */}
                    <div style={{ padding: '18px 16px 14px' }}>
                      {/* 사용자 */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
                        <div style={{
                          padding: '10px 14px', borderRadius: '16px 16px 4px 16px',
                          background: '#18181B', color: '#fff',
                          fontSize: 13, fontWeight: 600,
                        }}>삼성전자 소개해줘</div>
                      </div>

                      {/* AI 응답 */}
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                          background: 'linear-gradient(135deg, #FEE2E2, #FFF)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginTop: 2,
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: R }}>AI</span>
                        </div>
                        <div style={{
                          flex: 1, padding: '14px 16px', borderRadius: '4px 16px 16px 16px',
                          background: '#F8F8FA', border: '1px solid #F0F0F2',
                          fontSize: 13, color: '#3F3F46', lineHeight: 1.8,
                          letterSpacing: '-0.2px',
                        }}>
                          <strong style={{ color: '#18181B' }}>삼성전자</strong>는 시가총액 1,056조원의 글로벌 반도체 1위 기업이에요. DRAM과 NAND 메모리 세계 1위, 최근 AI 수요 폭증으로 HBM 시장에서도 빠르게 성장하고 있어요.

                          <div style={{ marginTop: 10 }}>
                            2024년 매출 300.9조원, 영업이익 32.7조원으로 전년 대비 크게 회복했고, 외국인 보유비율 48.4%로 글로벌 신뢰가 높아요. 현재가 180,000원이에요.
                          </div>

                          <div style={{
                            marginTop: 10, padding: '6px 0',
                            color: '#A1A1AA', fontSize: 12, fontStyle: 'italic',
                          }}>
                            (...중략)
                          </div>

                          <div style={{ marginTop: 6 }}>
                            다만 파운드리 수율 이슈와 중국 메모리 업체의 추격은 주의 포인트에요. 52주 최고가 대비 61% 수준에서 거래 중이에요.
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 기업카드 미니 모크업 */}
                    <div style={{
                      margin: '0 16px', padding: '14px 16px', borderRadius: 14,
                      background: '#F8F8FA', border: '1px solid #EBEBEB',
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#A1A1AA', letterSpacing: '0.05em', marginBottom: 10 }}>
                        기업카드 화면
                      </div>
                      {/* 카드 헤더 */}
                      <div style={{
                        padding: '12px 14px', borderRadius: 12,
                        background: '#fff', border: '1px solid #F0F0F2',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontSize: 16, fontWeight: 800, color: '#18181B', fontFamily: FONTS.serif }}>삼성전자</span>
                              <span style={{ fontSize: 10, color: '#A1A1AA', fontFamily: FONTS.mono }}>005930</span>
                              <span style={{
                                fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3,
                                background: '#F0F0F2', color: '#71717A',
                              }}>KOSPI</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                              <span style={{ fontSize: 18, fontWeight: 800, fontFamily: FONTS.mono, color: '#18181B' }}>180,000</span>
                              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: FONTS.mono, color: R }}>+13.4%</span>
                            </div>
                          </div>
                          <div style={{
                            width: 48, height: 28, borderRadius: 6,
                            background: 'linear-gradient(90deg, #E4E4E7 0%, #E4E4E7 30%, #A1A1AA 45%, #D4D4D8 55%, #71717A 70%, #A1A1AA 100%)',
                            opacity: 0.3,
                          }} />
                        </div>
                        {/* AI 기업소개 버튼 */}
                        <div style={{
                          marginTop: 12, padding: '10px', borderRadius: 10,
                          background: `linear-gradient(135deg, ${R} 0%, #E8364E 100%)`,
                          color: '#fff', textAlign: 'center',
                          fontSize: 13, fontWeight: 700,
                          boxShadow: '0 2px 8px rgba(220,38,38,0.25)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          AI 기업소개
                        </div>
                        <div style={{ fontSize: 10, color: '#71717A', textAlign: 'center', marginTop: 8, lineHeight: 1.6 }}>
                          이 버튼을 누르면 위와 같은 AI 분석을 받을 수 있어요
                          <br />
                          <span style={{ color: '#A1A1AA' }}>일반 ChatGPT와 달리 실제 DART 데이터로 답해요</span>
                        </div>
                      </div>
                    </div>

                    {/* 경로 안내 */}
                    <div style={{
                      padding: '14px 18px 18px',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontSize: 11, color: '#A1A1AA', letterSpacing: '-0.2px',
                        justifyContent: 'center', flexWrap: 'wrap',
                      }}>
                        <span style={{ fontWeight: 600, color: '#71717A' }}>공시 탭</span>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#D4D4D8" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                        <span style={{ fontWeight: 600, color: '#71717A' }}>종목 클릭</span>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#D4D4D8" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                        <span style={{ fontWeight: 600, color: '#71717A' }}>기업카드</span>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#D4D4D8" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                        <span style={{ fontWeight: 700, color: R }}>AI 기업소개</span>
                      </div>
                    </div>
                  </div>
                )}
              </Reveal>
            ))}
          </div>

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
              공시가 주가를 움직이는 순간,<br />놓치지 마세요
            </h2>
            <p style={{ fontSize: 15, color: '#71717A', margin: '0 0 36px', lineHeight: 1.6 }}>
              지금 바로 오늘의 공시 임팩트를 확인하세요.
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 40, textAlign: 'left' }}>
              {[
                {
                  title: '전자공시 시그널',
                  desc: '공시의 첫걸음 — 800건에서 S등급을 골라내는 법',
                  url: 'https://jessylimitless.github.io/dartbook/',
                  accent: '#DC2626',
                  tag: 'Vol.1 공시',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
                },
                {
                  title: 'Financial Signal',
                  desc: '재무제표는 경영진이 쓴 자서전이다',
                  url: 'https://jessylimitless.github.io/financial_signal/',
                  accent: '#10B981',
                  tag: 'Vol.2 재무',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round"><path d="M2 3h20v18H2z" /><path d="M2 9h20" /><path d="M8 3v18" /></svg>,
                },
                {
                  title: '상법 Signal',
                  desc: '지배구조의 소스코드를 읽는 기술',
                  url: 'https://jessylimitless.github.io/law_signal/',
                  accent: '#7C3AED',
                  tag: 'Vol.3 법률',
                  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>,
                },
              ].map((book, i) => (
                <a key={i} href={book.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '18px 20px', borderRadius: 14, textDecoration: 'none',
                    background: '#FAFAFA', border: '1px solid #F0F0F2',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = book.accent; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 4px 16px ${book.accent}18` }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#F0F0F2'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 11, flexShrink: 0,
                    background: `${book.accent}10`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {book.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: book.accent, fontWeight: 700, letterSpacing: '0.05em', marginBottom: 3 }}>{book.tag}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#18181B' }}>{book.title}</div>
                    <div style={{ fontSize: 12, color: '#71717A', marginTop: 2 }}>{book.desc}</div>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              ))}
            </div>
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
      {/* ━━━ B2B ━━━ */}
      <section style={{ borderTop: '1px solid #F4F4F5', background: '#FAFAFA' }}>
        <div style={{
          maxWidth: 480, margin: '0 auto',
          padding: 'clamp(56px, 8vh, 72px) clamp(20px, 5vw, 40px)',
        }}>
          <Reveal>
            <div style={{
              padding: '32px 28px', borderRadius: 20,
              background: '#fff', border: '1px solid #E8E8EC',
              boxShadow: '0 2px 12px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: '#A1A1AA', letterSpacing: '0.12em',
                marginBottom: 16,
              }}>DATA INTEGRATION</div>
              <h3 style={{
                fontSize: 22, fontWeight: 800, color: '#18181B', margin: '0 0 8px',
                letterSpacing: '-0.5px', lineHeight: 1.3,
              }}>
                실시간 공시 데이터,<br />당신의 시스템에 바로 연결
              </h3>
              <p style={{
                fontSize: 14, color: '#71717A', margin: '0 0 24px', lineHeight: 1.6,
              }}>
                공시 수집부터 등급 분류, AI 분석까지 — 별도 개발 없이 API 하나로 연동할 수 있어요
              </p>
              <div style={{
                display: 'flex', gap: 20, marginBottom: 24, flexWrap: 'wrap',
              }}>
                {['실시간 공시 API', 'AI 기업분석', '공시 시그널'].map(tag => (
                  <span key={tag} style={{
                    fontSize: 12, color: '#52525B', fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    <span style={{ width: 4, height: 4, borderRadius: 2, background: R }} />
                    {tag}
                  </span>
                ))}
              </div>
              <button onClick={() => navigate('/inquiry?type=api')}
                className="touch-press"
                style={{
                  width: '100%', padding: '14px', borderRadius: 12,
                  border: '1px solid #D4D4D8', background: '#fff', color: '#18181B',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s', letterSpacing: '-0.2px',
                }}
                onMouseEnter={e => { e.target.style.background = R; e.target.style.color = '#fff'; e.target.style.borderColor = R }}
                onMouseLeave={e => { e.target.style.background = '#fff'; e.target.style.color = '#18181B'; e.target.style.borderColor = '#D4D4D8' }}
              >
                도입 문의하기
              </button>
            </div>
          </Reveal>
        </div>
      </section>

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
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <span onClick={() => setShowTerms('terms')} style={{ fontSize: 12, color: '#A1A1AA', cursor: 'pointer', borderBottom: '1px solid #E4E4E7', paddingBottom: 1 }}>이용약관</span>
            <span onClick={() => setShowTerms('privacy')} style={{ fontSize: 12, color: '#A1A1AA', cursor: 'pointer', borderBottom: '1px solid #E4E4E7', paddingBottom: 1 }}>개인정보 처리방침</span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            <span onClick={() => navigate('/inquiry')} style={{
              fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer',
              padding: '5px 14px', borderRadius: 6, background: '#DC2626',
            }}>자동매매 솔루션</span>
            <span onClick={() => navigate('/inquiry?type=api')} style={{
              fontSize: 11, fontWeight: 600, color: '#71717A', cursor: 'pointer',
              padding: '5px 14px', borderRadius: 6, border: '1px solid #D4D4D8', background: '#fff',
            }}>공시 데이터 연동</span>
          </div>
          <div style={{ fontSize: 11, color: '#D4D4D8', lineHeight: 1.6, borderTop: '1px solid #E4E4E7', paddingTop: 16 }}>
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

function LiveRiserLanding({ navigate, heroOnly }) {
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

  if (riserLoading) return heroOnly ? null : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {[1,2,3].map(i => (
        <div key={i} style={{ height: 64, background: '#F0F0F2', borderRadius: 8, animation: 'pulse 1.4s ease-in-out infinite' }} />
      ))}
    </div>
  )

  if (risers.length === 0) return heroOnly ? null : (
    <div style={{
      borderRadius: 16, overflow: 'hidden', border: '1px solid #F0F0F2', background: '#FFFFFF',
    }}>
      {[
        { name: '예시 종목 A', summary: '대형 공급계약 — 매출의 35%, 반도체 장비 수출', pct: '+12.3', price: '58,400', grade: 'S' },
        { name: '예시 종목 B', summary: '자사주 50억 소각 결정 — 주당가치 직접 상승', pct: '+8.7', price: '23,150', grade: 'S' },
        { name: '예시 종목 C', summary: '영업이익 흑자전환 — 적자 3년 만에 YoY +340%', pct: '+6.2', price: '8,920', grade: 'A' },
        { name: '예시 종목 D', summary: '대표이사 장내매수 — 내부자가 지갑으로 말하는 확신', pct: '+4.8', price: '41,700', grade: 'S' },
        { name: '예시 종목 E', summary: '미래에셋 5%+ 신규 대량보유 — 기관 매집 시그널', pct: '+3.5', price: '12,650', grade: 'A' },
      ].map((item, i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
          borderBottom: i < 4 ? '1px solid #F4F4F5' : 'none',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 8, flexShrink: 0,
            background: item.grade === 'S' ? '#E8364E' : '#0D9488',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: FONTS.mono,
          }}>{item.grade}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#18181B' }}>{item.name}</div>
            <div style={{ fontSize: 12, color: '#52525B', marginTop: 3, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.summary}</div>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#DC2626', fontFamily: FONTS.mono }}>{item.pct}%</div>
            <div style={{ fontSize: 11, color: '#A1A1AA', fontFamily: FONTS.mono, marginTop: 2 }}>{item.price}</div>
          </div>
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
        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#18181B', color: '#fff' }}>AI 요약</span>
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
              {d.ai_summary ? (
                <div style={{ fontSize: 12, color: '#52525B', marginTop: 3, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.ai_summary.split('\n')[0].replace(/^\{(UP|DOWN|NEUTRAL|WARN)\}\s*/, '').replace(/^\[\w등급\]\s*/, '').replace(/\*+/g, '').trim()}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#A1A1AA', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.report_nm}</div>
              )}
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#DC2626', fontFamily: FONTS.mono }}>+{d.changePct.toFixed(1)}%</div>
              {d.price > 0 && <div style={{ fontSize: 11, color: '#A1A1AA', fontFamily: FONTS.mono, marginTop: 2 }}>{d.price.toLocaleString()}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BriefingPreview() {
  const [items, setItems] = useState([])
  const [dateLabel, setDateLabel] = useState('')

  useEffect(() => {
    fetch(`${API}/api/briefings`)
      .then(r => r.json())
      .then(d => {
        const list = d.briefings || []
        // 날짜 파일만 (premium-sample 제외), 첫 번째 = 최신
        const latest = list.find(b => b.id && /^\d{4}-\d{2}-\d{2}$/.test(b.id))
        if (!latest) return
        setDateLabel(latest.date_label || latest.id)

        // MD에서 ## N. 종목명 패턴 추출
        const lines = (latest.content || '').split('\n')
        const extracted = []
        const signalMap = { '강력 긍정': '#16A34A', '긍정': '#0D9488', '중립': '#A1A1AA', '부정': '#D97706', '강력 부정': '#DC2626' }

        for (const line of lines) {
          const m = line.match(/^## (\d)\.\s*(.+?)\s*\((\d+)\)\s*\|\s*(.+)/)
          if (m) extracted.push({ num: m[1], name: m[2], type: m[4] })
        }

        // 시그널 추출
        let idx = 0
        for (const line of lines) {
          const sm = line.match(/판정.*?(강력 긍정|긍정|중립|부정|강력 부정)/)
          if (sm && idx < extracted.length) {
            extracted[idx].signal = sm[1]
            extracted[idx].color = signalMap[sm[1]] || '#A1A1AA'
            idx++
          }
        }

        setItems(extracted.slice(0, 5))
      })
      .catch(() => {})
  }, [])

  if (items.length === 0) return null

  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #F0F0F2', background: '#FAFAFA' }}>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F2', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: '#DC2626', color: '#fff', letterSpacing: '0.05em' }}>DAILY BRIEF</span>
        <span style={{ fontSize: 12, color: '#A1A1AA', fontFamily: FONTS.mono }}>{dateLabel}</span>
      </div>
      {items.map((item, i) => (
        <div key={i} style={{
          padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: i < items.length - 1 ? '1px solid #F4F4F5' : 'none',
        }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#DC2626', fontFamily: FONTS.mono, width: 20 }}>{item.num}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#18181B' }}>{item.name}</span>
            <span style={{ fontSize: 12, color: '#A1A1AA', marginLeft: 8 }}>{item.type}</span>
          </div>
          {item.signal && (
            <span style={{
              fontSize: 11, fontWeight: 700, color: item.color, flexShrink: 0,
              padding: '3px 10px', borderRadius: 12, background: `${item.color}15`,
            }}>{item.signal}</span>
          )}
        </div>
      ))}
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

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { FONTS, PREMIUM, GRADE_COLORS } from '../constants/theme'
import { API } from '../lib/api'
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
  const [showTerms, setShowTerms] = useState(null) // 'terms' | 'privacy' | null
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dart_user')) } catch { return null }
  })

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
              }
            }
          } catch {}
        },
      })
      window.google.accounts.id.prompt()
    } else {
      setShowLoginToast(true)
      setTimeout(() => setShowLoginToast(false), 2500)
    }
  }

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
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {user.picture && <img src={user.picture} alt="" style={{ width: 28, height: 28, borderRadius: '50%' }} />}
              <span style={{ fontSize: 13, color: '#FAFAFA', fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
            </div>
          ) : (
            <button onClick={handleGoogleLogin} style={{
              padding: '7px 18px', borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent', color: '#A1A1AA',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.borderColor = 'rgba(255,255,255,0.3)'; e.target.style.color = '#FAFAFA' }}
              onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.color = '#A1A1AA' }}
            >로그인</button>
          )}
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
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '56px clamp(24px, 5vw, 48px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{
              fontSize: 26, fontWeight: 800, fontFamily: FONTS.serif,
              color: '#18181B', margin: '0 0 8px',
            }}>이렇게 활용하세요</h2>
            <p style={{ fontSize: 16, color: '#71717A' }}>
              매일 저녁 7시, 3분이면 충분합니다
            </p>
          </div>

          {/* 핵심 3개 — 동적 카드 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>

            {/* 1. 실시간 공시 — 자동 순환 예시 */}
            <GuideCard delay={0}>
              <div style={{
                padding: '24px', borderRadius: 16,
                background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.08)',
                transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(220,38,38,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#DC2626', color: '#fff', letterSpacing: '0.05em' }}>CORE</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#18181B' }}>실시간 공시 · S/A/D 등급</span>
                </div>
                <div style={{ fontSize: 14, color: '#71717A', lineHeight: 1.8, marginBottom: 16 }}>
                  DART · KIND에서 매일 쏟아지는 800건의 공시 중에서 주가에 직접 영향을 주는 <span style={{ color: '#18181B', fontWeight: 600 }}>자사주 취득, 대형 계약, 실적 급변, 투자경고</span> 등을 AI가 자동으로 선별하여 S/A/D 등급으로 분류합니다. 장중은 물론 <span style={{ color: '#DC2626', fontWeight: 600 }}>장 마감 후 18시에 집중되는 핵심 공시</span>도 놓치지 않습니다.
                </div>
                <LiveExamples />
                <div onClick={() => navigate('/today')} style={{ marginTop: 14, fontSize: 14, fontWeight: 600, color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  공시 확인하기 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              </div>
            </GuideCard>

            {/* 2. 브리핑 + Pick */}
            <div style={{
              padding: '20px', borderRadius: 14,
              background: 'rgba(220,38,38,0.04)', border: '1px solid rgba(220,38,38,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#DC2626', color: '#fff', letterSpacing: '0.05em' }}>DAILY 19:00</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#18181B' }}>저녁 브리핑 · DART Pick</span>
              </div>
              <div style={{ fontSize: 14, color: '#71717A', lineHeight: 1.8, marginBottom: 16 }}>
                공시 제목만으로는 알 수 없는 <span style={{ color: '#18181B', fontWeight: 600 }}>숫자 뒤에 숨겨진 의도</span>를 전문가가 해석합니다. "자사주 소각인데 왜 주가가 안 오르지?" 같은 의문에 답합니다. 매일 저녁 7시, 다음 날 장 시작 전에 반드시 읽어야 할 브리핑과 함께 <span style={{ color: '#DC2626', fontWeight: 600 }}>데이터가 가리키는 오늘의 DART Pick</span>을 선정합니다.
              </div>
              <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FFFFFF', border: '1px solid #F0F0F2' }}>
                <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 700, marginBottom: 6 }}>오늘의 브리핑 예시</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#18181B', marginBottom: 4, fontFamily: FONTS.serif }}>
                  "자사주 소각 3사 — 누가 진짜 주주 편인가?"
                </div>
                <div style={{ fontSize: 12, color: '#A1A1AA' }}>
                  DART Pick: <span style={{ fontWeight: 600, color: '#18181B' }}>아이씨디</span> — 실적 턴어라운드 + 자사주 소각
                </div>
              </div>
              <div onClick={() => navigate('/briefing')} style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                브리핑 읽기 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </div>

            {/* 3. 추적 */}
            <div style={{
              padding: '20px', borderRadius: 14,
              background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#2563EB', color: '#fff', letterSpacing: '0.05em' }}>TRACK</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#18181B' }}>공시 후 5거래일 추적</span>
              </div>
              <div style={{ fontSize: 14, color: '#71717A', lineHeight: 1.8, marginBottom: 16 }}>
                S/A/D 등급 공시가 발표된 <span style={{ color: '#18181B', fontWeight: 600 }}>그 시각의 실제 주가</span>를 기준으로 5거래일간 주가 변동을 추적합니다. "이 공시가 정말 주가를 올렸는가?" — 감이 아닌 <span style={{ color: '#2563EB', fontWeight: 600 }}>데이터로 증명</span>합니다.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { name: '빅텍', change: '+4.8%', color: '#DC2626' },
                  { name: '티씨케이', change: '+4.3%', color: '#DC2626' },
                  { name: '유니트론텍', change: '-4.4%', color: '#2563EB' },
                ].map((ex, i) => (
                  <div key={i} style={{ flex: 1, padding: '8px 10px', borderRadius: 8, background: '#FFFFFF', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#18181B', marginBottom: 2 }}>{ex.name}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: ex.color, fontFamily: FONTS.mono }}>{ex.change}</div>
                  </div>
                ))}
              </div>
              <div onClick={() => navigate('/history')} style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: '#2563EB', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                추적 현황 보기 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </div>
          </div>

          {/* Buffett AI */}
          <div style={{
            padding: '20px', borderRadius: 14, marginBottom: 14,
            background: 'rgba(217,119,6,0.04)', border: '1px solid rgba(217,119,6,0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#D97706', color: '#fff', letterSpacing: '0.05em' }}>AI</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#18181B' }}>Buffett AI · 가치투자 분석</span>
            </div>
            <div style={{ fontSize: 14, color: '#71717A', lineHeight: 1.8, marginBottom: 16 }}>
              종목명만 입력하면 워런 버핏의 가치투자 원칙으로 <span style={{ color: '#18181B', fontWeight: 600 }}>내재가치, 경제적 해자, 재무 건전성, 자본 배분, 경영진, 레드플래그</span> 6가지 관점에서 분석합니다. DART 재무제표 + 실시간 시세 + AI 추론을 결합한 리포트를 받아보세요.
            </div>
            <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FFFFFF', border: '1px solid #F0F0F2' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <img src="/bufit.png" alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                <span style={{ fontSize: 13, color: '#71717A' }}>"삼성전자 지금 사야 할까?"</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: '안전마진', value: '+12%', color: '#D97706' },
                  { label: 'ROE', value: '8.6%', color: '#71717A' },
                  { label: '부채비율', value: '28%', color: '#16A34A' },
                ].map((m, i) => (
                  <div key={i} style={{ padding: '4px 10px', borderRadius: 6, background: '#FAFAFA', fontSize: 12 }}>
                    <span style={{ color: '#A1A1AA' }}>{m.label} </span>
                    <span style={{ fontWeight: 700, color: m.color, fontFamily: FONTS.mono }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div onClick={() => navigate('/premium')} style={{ marginTop: 12, fontSize: 13, fontWeight: 600, color: '#D97706', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              AI 분석 체험하기 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          </div>

          {/* 서재 + 이벤트 — 2열 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {/* 서재 */}
            <div style={{
              padding: '16px', borderRadius: 12,
              background: 'rgba(14,165,233,0.04)', border: '1px solid rgba(14,165,233,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#18181B' }}>서재</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {['전자공시 시그널 가이드', '전자공시 시그널', '코스톨라니'].map((t, i) => (
                  <div key={i} style={{ fontSize: 12, color: i === 0 ? '#0EA5E9' : '#71717A', fontWeight: i === 0 ? 600 : 400 }}>
                    {t}
                  </div>
                ))}
                <div style={{ fontSize: 11, color: '#A1A1AA', marginTop: 2 }}>외 2권</div>
              </div>
              <div onClick={() => navigate('/library')} style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: '#0EA5E9', cursor: 'pointer' }}>
                서재 열기 →
              </div>
            </div>

            {/* 이벤트 */}
            <div style={{
              padding: '16px', borderRadius: 12,
              background: 'rgba(22,163,74,0.04)', border: '1px solid rgba(22,163,74,0.08)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#18181B' }}>이벤트</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[
                  { tag: '글로벌', title: '미·일 정상회담' },
                  { tag: '산업', title: 'NVIDIA GTC 2026' },
                  { tag: '매크로', title: '슈퍼 목요일' },
                ].map((ev, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: '#16A34A', color: '#fff' }}>{ev.tag}</span>
                    <span style={{ color: '#18181B', fontWeight: i === 0 ? 600 : 400 }}>{ev.title}</span>
                  </div>
                ))}
              </div>
              <div onClick={() => navigate('/dart-event')} style={{ marginTop: 10, fontSize: 12, fontWeight: 600, color: '#16A34A', cursor: 'pointer' }}>
                이벤트 보기 →
              </div>
            </div>
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
        background: '#111113', color: '#71717A',
        borderTop: '1px solid #27272A',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px clamp(24px, 5vw, 48px) 40px' }}>
          {/* 상단: 로고 + CTA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <span style={{ fontSize: 20, fontFamily: FONTS.serif, fontWeight: 700, color: '#FAFAFA' }}>
              DART <span style={{ color: PREMIUM.accent }}>Insight</span>
            </span>
            <button onClick={go} style={{
              padding: '10px 24px', borderRadius: 8, border: 'none',
              background: PREMIUM.accent, color: '#fff',
              fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>대시보드 열기</button>
          </div>

          {/* 회사 정보 */}
          <div style={{ fontSize: 14, lineHeight: 2, color: '#71717A', marginBottom: 28 }}>
            <div style={{ fontWeight: 700, color: '#A1A1AA', marginBottom: 6, fontSize: 15 }}>주식회사 뮤즈에이아이</div>
            <div>사업자등록번호 : 764-88-03375</div>
            <div>서울특별시 은평구 통일로62길 7, 3층</div>
          </div>

          {/* 약관 링크 */}
          <div style={{ display: 'flex', gap: 24, marginBottom: 28 }}>
            <span onClick={() => setShowTerms('terms')} style={{
              fontSize: 14, color: '#A1A1AA', cursor: 'pointer',
              borderBottom: '1px solid #52525B', paddingBottom: 2,
            }}>
              서비스 이용약관
            </span>
            <span onClick={() => setShowTerms('privacy')} style={{
              fontSize: 14, color: '#A1A1AA', cursor: 'pointer',
              borderBottom: '1px solid #52525B', paddingBottom: 2,
            }}>
              개인정보 처리방침
            </span>
          </div>

          {/* 저작권 */}
          <div style={{
            fontSize: 13, color: '#52525B', lineHeight: 1.6,
            borderTop: '1px solid #1E1E22', paddingTop: 20,
          }}>
            © 2026 MuseAI Inc. All rights reserved.<br />
            DART Insight는 주식회사 뮤즈에이아이의 서비스입니다.
          </div>
        </div>
      </footer>

      {/* 약관/개인정보 모달 */}
      {showTerms && (
        <div onClick={() => setShowTerms(null)} style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: '#FFFFFF', borderRadius: 16, width: '100%', maxWidth: 560,
            maxHeight: '80vh', overflow: 'auto', padding: '28px 24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
                {showTerms === 'terms' ? '서비스 이용약관' : '개인정보 처리방침'}
              </h3>
              <button onClick={() => setShowTerms(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#71717A' }}>✕</button>
            </div>
            {showTerms === 'terms' ? (
              <div style={{ fontSize: 13, color: '#52525B', lineHeight: 1.8 }}>
                <p><strong>제1조 (목적)</strong><br/>이 약관은 주식회사 뮤즈에이아이(이하 "회사")가 제공하는 DART Insight 서비스(이하 "서비스")의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.</p>
                <p><strong>제2조 (서비스 내용)</strong><br/>회사는 DART·KIND 공시 정보의 수집, 분류, 분석 및 관련 콘텐츠를 제공합니다. 서비스의 구체적인 내용은 회사의 정책에 따라 변경될 수 있습니다.</p>
                <p><strong>제3조 (이용자의 의무)</strong><br/>이용자는 서비스를 통해 제공되는 정보를 투자 판단의 참고 자료로만 활용해야 하며, 이를 근거로 한 투자 손실에 대해 회사는 책임을 지지 않습니다.</p>
                <p><strong>제4조 (면책)</strong><br/>본 서비스에서 제공하는 모든 정보는 참고용이며, 특정 종목에 대한 매수·매도 추천이 아닙니다. 모든 투자 판단과 그에 따른 결과는 전적으로 이용자 본인의 책임입니다.</p>
                <p><strong>제5조 (저작권)</strong><br/>서비스 내 콘텐츠(브리핑, 분석, 전자책 등)의 저작권은 회사에 귀속되며, 무단 복제·배포를 금지합니다.</p>
                <p><strong>제6조 (서비스 변경 및 중단)</strong><br/>회사는 운영상 필요한 경우 서비스의 전부 또는 일부를 변경하거나 중단할 수 있으며, 이에 대해 사전 공지합니다.</p>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#52525B', lineHeight: 1.8 }}>
                <p><strong>1. 수집하는 개인정보</strong><br/>회사는 Google 로그인을 통해 이메일 주소, 이름, 프로필 사진을 수집합니다. 별도의 회원가입 절차 없이 Google 계정 정보만 활용합니다.</p>
                <p><strong>2. 개인정보의 이용 목적</strong><br/>수집된 정보는 서비스 이용자 식별, 관심종목 관리, 서비스 개선을 위한 통계 분석에 활용됩니다.</p>
                <p><strong>3. 개인정보의 보유 및 이용 기간</strong><br/>이용자의 개인정보는 서비스 탈퇴 시까지 보유하며, 탈퇴 요청 시 지체 없이 파기합니다.</p>
                <p><strong>4. 개인정보의 제3자 제공</strong><br/>회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 법령에 의한 요청이 있는 경우 예외로 합니다.</p>
                <p><strong>5. 개인정보의 안전성 확보 조치</strong><br/>회사는 개인정보의 안전한 처리를 위해 SSL 암호화 통신, 접근 권한 제한 등 기술적·관리적 보호 조치를 시행합니다.</p>
                <p><strong>6. 정보주체의 권리</strong><br/>이용자는 언제든지 자신의 개인정보에 대한 열람, 수정, 삭제를 요청할 수 있으며, 회사는 이에 지체 없이 응합니다.</p>
                <p><strong>7. 개인정보 보호 책임자</strong><br/>주식회사 뮤즈에이아이 (문의: dartinsight@museai.co.kr)</p>
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


// ── 가이드 카드 래퍼 (스크롤 애니메이션) ──
function GuideCard({ children, delay = 0 }) {
  const ref = useRef(null)
  const [v, setV] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const ob = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); ob.disconnect() }
    }, { threshold: 0.15 })
    ob.observe(el)
    return () => ob.disconnect()
  }, [])
  return (
    <div ref={ref} style={{
      opacity: v ? 1 : 0,
      transform: v ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
    }}>{children}</div>
  )
}


// ── 실시간 공시 자동 순환 예시 ──
function LiveExamples() {
  const examples = [
    { grade: 'S', color: '#DC2626', name: '삼양사', desc: '주식소각결정' },
    { grade: 'S', color: '#DC2626', name: '아이씨디', desc: '자기주식취득결정' },
    { grade: 'A', color: '#0D9488', name: '삼성전자', desc: '영업(잠정)실적 YoY +30%' },
    { grade: 'S', color: '#DC2626', name: '휴마시스', desc: '주식소각결정 (211억)' },
    { grade: 'D', color: '#1D4ED8', name: '씨에스베어링', desc: '환기종목 지정' },
    { grade: 'S', color: '#DC2626', name: '빅텍', desc: '단일판매·공급계약체결' },
  ]
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setIdx(p => (p + 1) % (examples.length - 2)), 2500)
    return () => clearInterval(iv)
  }, [])

  const visible = examples.slice(idx, idx + 3)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 108 }}>
      {visible.map((ex, i) => (
        <div key={`${ex.name}-${idx}-${i}`} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 10, background: '#FFFFFF',
          animation: 'fadeIn 0.4s ease',
        }}>
          <span style={{
            fontSize: 11, fontWeight: 800, color: '#fff', background: ex.color,
            padding: '2px 7px', borderRadius: 5, fontFamily: "'Inter', sans-serif",
          }}>{ex.grade}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#18181B' }}>{ex.name}</span>
          <span style={{ fontSize: 13, color: '#A1A1AA', flex: 1 }}>{ex.desc}</span>
          <div style={{
            width: 6, height: 6, borderRadius: 3, background: ex.color,
            animation: 'pulse 1.5s infinite',
          }} />
        </div>
      ))}
    </div>
  )
}

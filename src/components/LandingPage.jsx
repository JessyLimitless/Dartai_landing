import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
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
  const [dateFilter, setDateFilter] = useState('today')

  // 오늘 날짜 기준 필터링 (KST)
  const filteredDisclosures = useMemo(() => {
    if (!disclosures || dateFilter === 'all') return disclosures
    const now = new Date()
    const kstNow = new Date(now.getTime() + 9 * 3600000)
    const todayStr = kstNow.toISOString().slice(0, 10)
    return disclosures.filter(d => {
      if (!d.created_at) return false
      const dt = new Date(d.created_at)
      const kst = new Date(dt.getTime() + 9 * 3600000)
      return kst.toISOString().slice(0, 10) === todayStr
    })
  }, [disclosures, dateFilter])

  // 24시간 내 닫은 적 있으면 표시 안 함
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
  const isCumulative = stats?.is_cumulative

  return (
    <div style={{ fontFamily: FONTS.body, overflowX: 'hidden' }}>

      {/* 이벤트 팝업 */}
      {showPopup && (
        <EventPopup
          event={WEEKLY_EVENT}
          onClose={dismissPopup}
          onInsight={() => { dismissPopup(); setShowInsight(true) }}
        />
      )}

      {/* 인사이트 문서 모달 */}
      {showInsight && (
        <InsightModal
          event={WEEKLY_EVENT}
          onClose={() => setShowInsight(false)}
        />
      )}

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
          {/* Buffett Avatar + Kicker */}
          <Reveal>
            <div style={{ marginBottom: '24px' }}>
              <div onClick={() => { navigate('/premium'); setTimeout(() => window.dispatchEvent(new Event('open-buffett-chat')), 500) }} style={{
                width: 'clamp(72px, 12vw, 96px)', height: 'clamp(72px, 12vw, 96px)',
                borderRadius: '50%', overflow: 'hidden',
                margin: '0 auto 16px', cursor: 'pointer',
                border: '3px solid rgba(220,38,38,0.3)',
                boxShadow: '0 0 40px rgba(220,38,38,0.15), 0 0 80px rgba(220,38,38,0.05)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(220,38,38,0.25)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(220,38,38,0.15), 0 0 80px rgba(220,38,38,0.05)' }}
              >
                <img src="/bufit.png" alt="Buffett AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <PulseDot />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#FAFAFA', letterSpacing: '0.04em' }}>
                  with <span style={{ color: PREMIUM.accent }}>Buffett AI</span>
                </span>
              </div>
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
              <CounterCard label={isCumulative ? '분석 완료' : '오늘 공시'} value={totalCount} color={PREMIUM.accent} delay={0} onClick={() => navigate('/today')} />
              <CounterCard label="S Grade" value={sCount} color={GRADE_COLORS.S.bg} delay={100} onClick={() => navigate('/today?grade=S')} />
              <CounterCard label="A Grade" value={aCount} color={GRADE_COLORS.A.bg} delay={200} onClick={() => navigate('/today?grade=A')} />
              <CounterCard label="D Grade" value={dCount} color={GRADE_COLORS.D.bg} delay={300} onClick={() => navigate('/today?grade=D')} />
            </div>
          </Reveal>

          {/* Grade bar */}
          {totalCount > 0 && (
            <Reveal d={180}>
              <div style={{ maxWidth: '480px', margin: '0 auto 32px' }}>
                <GradeBar s={sCount} a={aCount} d={dCount} total={totalCount} />
                <p style={{fontSize: '12px', color: '#52525B', textAlign: 'center', margin: '8px auto 0', maxWidth: '400px', lineHeight: 1.5}}>
                  S등급 = 주가에 즉각적 영향을 미치는 최우선 공시
                  <br/>
                  <span style={{color: '#71717A', fontSize: '11px'}}>투자주의종목 · 전환사채 · 임원매수 · 대규모 계약 등</span>
                </p>
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={go} style={{
                padding: '12px 32px', borderRadius: '8px', border: 'none',
                backgroundColor: PREMIUM.accent, color: '#FFFFFF',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 4px 14px rgba(220,38,38,0.4)',
              }}
                onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 20px rgba(220,38,38,0.5)' }}
                onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 14px rgba(220,38,38,0.4)' }}
              >대시보드 열기</button>
              <button onClick={() => { navigate('/premium'); setTimeout(() => window.dispatchEvent(new Event('open-buffett-chat')), 500) }} style={{
                padding: '12px 28px', borderRadius: '8px',
                border: '1px solid rgba(220,38,38,0.4)',
                background: 'transparent', color: '#F87171',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s', display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
                onMouseEnter={e => { e.target.style.backgroundColor = 'rgba(220,38,38,0.08)'; e.target.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.transform = 'none' }}
              >Buffett AI 체험</button>
              <a
                href="https://jessylimitless.github.io/dartbook/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '12px 24px', borderRadius: '8px',
                  border: '1px solid rgba(158,122,47,0.4)',
                  background: 'transparent', color: '#C9A84C',
                  fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  textDecoration: 'none', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(158,122,47,0.7)'; e.currentTarget.style.backgroundColor = 'rgba(158,122,47,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(158,122,47,0.4)'; e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.transform = 'none' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                전자공시 시그널
              </a>
            </div>
          </Reveal>

          {/* 성공사례 — S등급 시그널 적중 */}
          <Reveal d={300}>
            <div style={{
              maxWidth: '520px', width: '100%', margin: '40px auto 0',
              padding: '20px 24px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              cursor: 'default',
              transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                {/* 좌측: 배지 + 종목 정보 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '26px', height: '26px', borderRadius: '50%',
                      backgroundColor: GRADE_COLORS.S.bg, color: '#fff',
                      fontSize: '12px', fontWeight: 800, fontFamily: FONTS.mono,
                      flexShrink: 0,
                    }}>S</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 600, color: '#F87171',
                      padding: '2px 8px', borderRadius: '4px',
                      backgroundColor: 'rgba(248,113,113,0.12)',
                      whiteSpace: 'nowrap',
                    }}>투자경고종목 지정</span>
                  </div>
                  <div style={{
                    fontFamily: FONTS.serif, fontWeight: 700, fontSize: '17px',
                    color: '#FAFAFA', marginBottom: '4px',
                  }}>로킷헬스케어</div>
                  <div style={{
                    fontSize: '12px', color: '#A1A1AA', lineHeight: 1.4,
                  }}>소수계좌 매수관여 과다 → 투자경고 지정 예고</div>
                </div>
                {/* 우측: 수익률 */}
                <div style={{
                  fontFamily: FONTS.mono, fontSize: '32px', fontWeight: 800,
                  color: '#22C55E', letterSpacing: '-0.02em', flexShrink: 0,
                  lineHeight: 1,
                }}>+50%</div>
              </div>
              <div style={{
                fontSize: '11px', color: '#71717A', marginTop: '12px',
                borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px',
              }}>
                DART Insight S등급 포착 → 공시 이후 50% 상승
              </div>
            </div>
            <p style={{
              fontSize: '10px', color: '#52525B', textAlign: 'center',
              margin: '10px 0 0', letterSpacing: '0.02em',
            }}>
              실제 사례 기반 · 투자 성과를 보장하지 않습니다
            </p>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 700, fontFamily: FONTS.serif, margin: 0 }}>
                  최신 공시
                </h2>
                <div style={{
                  display: 'inline-flex', borderRadius: '6px', overflow: 'hidden',
                  border: '1px solid #E4E4E7',
                }}>
                  {[{ key: 'today', label: '오늘' }, { key: 'all', label: '전체' }].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => setDateFilter(opt.key)}
                      style={{
                        padding: '4px 12px', border: 'none', cursor: 'pointer',
                        fontSize: '12px', fontWeight: 600, transition: 'all 0.15s',
                        background: dateFilter === opt.key ? PREMIUM.accent : 'transparent',
                        color: dateFilter === opt.key ? '#fff' : '#71717A',
                      }}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>
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
          <DisclosureTable disclosures={filteredDisclosures} loading={loading} navigate={navigate} />
        </div>
      </section>

      {/* ━━━ Section 3: 전자공시 시그널 전자책 ━━━ */}
      <section style={{
        background: '#FAF8F5',
        borderTop: '1px solid #E8E4DD',
        borderBottom: '1px solid #E8E4DD',
        padding: 'clamp(48px, 8vh, 80px) clamp(20px, 5vw, 64px)',
      }}>
        <div style={{
          maxWidth: '800px', margin: '0 auto',
          display: 'flex', alignItems: 'center', gap: 'clamp(24px, 4vw, 48px)',
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {/* 왼쪽: 텍스트 */}
          <div style={{ flex: '1 1 320px', minWidth: '280px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              marginBottom: '14px',
            }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em',
                padding: '3px 8px', borderRadius: '4px',
                background: 'linear-gradient(135deg, #9E7A2F, #C9A84C)',
                color: '#fff',
              }}>E-BOOK</span>
            </div>
            <h2 style={{
              fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 700,
              fontFamily: FONTS.serif, color: '#1A1A1A',
              lineHeight: 1.3, margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}>
              전자공시 <span style={{ color: '#9E7A2F' }}>시그널</span>
            </h2>
            <p style={{
              fontSize: '14px', color: '#555', lineHeight: 1.7,
              margin: '0 0 24px',
            }}>
              공시로 읽는 투자의 기술 — 800건의 공시에서 진짜 시그널을 찾아내는 체계적 방법론을 담았습니다.
              수주공시 분석부터 자금조달 리스크, 섹터별 핵심 지표까지.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a
                href="https://jessylimitless.github.io/dartbook/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  background: 'linear-gradient(135deg, #9E7A2F, #B8922E)',
                  color: '#fff', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', textDecoration: 'none',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(158,122,47,0.3)',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(158,122,47,0.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(158,122,47,0.3)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                무료로 읽기
              </a>
            </div>
          </div>

          {/* 오른쪽: 목차 미리보기 카드 */}
          <div style={{
            flex: '0 0 auto', width: 'clamp(220px, 28vw, 260px)',
            background: '#FFFFFF',
            borderRadius: '12px', padding: '20px 22px',
            border: '1px solid #E8E4DD',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          }}>
            <div style={{
              fontSize: '10px', fontWeight: 600, color: '#9E7A2F',
              letterSpacing: '0.08em', marginBottom: '12px',
            }}>CONTENTS</div>
            {[
              { ch: '01', title: '투자의 기준' },
              { ch: '02', title: '공시의 이해' },
              { ch: '03', title: '기업의 체력 검증' },
              { ch: '04', title: '실전 시그널 필터' },
              { ch: '05', title: '의사결정 매뉴얼' },
            ].map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '6px 0',
                borderBottom: i < 4 ? '1px solid rgba(0,0,0,0.04)' : 'none',
              }}>
                <span style={{
                  fontSize: '10px', fontWeight: 700, fontFamily: FONTS.mono,
                  color: '#9E7A2F', opacity: 0.6, minWidth: '18px',
                }}>{item.ch}</span>
                <span style={{
                  fontSize: '12px', color: '#3F3F46', fontWeight: 500,
                }}>{item.title}</span>
              </div>
            ))}
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


function CounterCard({ label, value, color, delay = 0, onClick }) {
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
    <div ref={ref} onClick={onClick} style={{
      padding: '16px', borderRadius: '10px',
      backgroundColor: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      transition: 'border-color 0.3s, transform 0.2s',
      cursor: onClick ? 'pointer' : 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.16)'; if (onClick) e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'none' }}
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
      time: d.created_at ? (() => { const dt = new Date(d.created_at); const k = new Date(dt.getTime() + 9*3600000); return `${String(k.getUTCHours()).padStart(2,'0')}:${String(k.getUTCMinutes()).padStart(2,'0')}` })() : '',
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
        const timeStr = d.created_at ? (() => { const dt = new Date(d.created_at); const k = new Date(dt.getTime() + 9*3600000); return `${String(k.getUTCHours()).padStart(2,'0')}:${String(k.getUTCMinutes()).padStart(2,'0')}` })() : ''
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


/* ── 이벤트 팝업 ── */
function EventPopup({ event, onClose, onInsight }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(6px)',
        animation: 'popupFadeIn 0.3s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#09090B',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          width: '100%', maxWidth: 440,
          overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          animation: 'popupSlideUp 0.35s ease',
        }}
      >
        {/* 상단 악센트 바 */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, #DC2626, #F59E0B, #DC2626)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s linear infinite',
        }} />

        <div style={{ padding: '24px 24px 20px' }}>
          {/* 태그 + 닫기 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontSize: 9, fontWeight: 800, letterSpacing: '0.12em',
                padding: '3px 8px', borderRadius: 4,
                background: 'rgba(220,38,38,0.15)', color: '#F87171',
              }}>{event.tag}</span>
              <span style={{
                fontSize: 12, fontFamily: FONTS.mono, color: '#71717A',
              }}>{event.date}</span>
            </div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.06)', border: 'none',
              borderRadius: 6, width: 28, height: 28,
              color: '#71717A', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          </div>

          {/* 제목 */}
          <h3 style={{
            fontSize: 20, fontWeight: 700, fontFamily: FONTS.serif,
            color: '#FAFAFA', margin: '0 0 12px',
            letterSpacing: '-0.02em', lineHeight: 1.3,
          }}>
            {event.title}
          </h3>

          {/* 요약 */}
          <p style={{
            fontSize: 13, color: '#A1A1AA', lineHeight: 1.7,
            margin: '0 0 20px',
          }}>
            {event.summary}
          </p>

          {/* 액션 */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={onInsight}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8, border: 'none',
                background: PREMIUM.accent, color: '#fff',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              인사이트 보기
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: 8,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#71717A',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#A1A1AA' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#71717A' }}
            >
              닫기
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popupFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes popupSlideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }
      `}</style>
    </div>
  )
}


/* ── 인사이트 마크다운 모달 ── */
function InsightModal({ event, onClose }) {
  // ESC 닫기
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  // 간이 마크다운 렌더러
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

      // 테이블
      if (line.startsWith('|') && line.endsWith('|')) {
        const cells = line.split('|').filter(c => c.trim()).map(c => c.trim())
        if (!inTable) {
          tableHeaders = cells
          inTable = true
          continue
        }
        if (cells.every(c => /^[-:]+$/.test(c))) continue // 구분선
        tableRows.push(cells)
        continue
      } else if (inTable) {
        flushTable()
      }

      if (line.startsWith('# ')) {
        elements.push(<h1 key={i} style={{ fontSize: 20, fontWeight: 700, fontFamily: FONTS.serif, color: '#FAFAFA', margin: '24px 0 12px', letterSpacing: '-0.02em' }}>{line.slice(2)}</h1>)
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
            <span style={{ color: '#52525B' }}>•</span>
            <span>{line.slice(2)}</span>
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
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0C0C0E',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          width: '100%', maxWidth: 640,
          maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* 헤더 */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #1E1E22',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 14, fontWeight: 700, fontFamily: FONTS.serif,
              color: '#FAFAFA',
            }}>
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

        {/* 본문 */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px 24px 28px',
        }}>
          {renderMarkdown(event.insight)}
        </div>
      </div>
    </div>
  )
}

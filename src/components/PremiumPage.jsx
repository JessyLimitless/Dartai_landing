import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM_GOLD } from '../constants/theme'

// ── 시뮬레이션 대화 시나리오 ──
const SIMULATION = [
  {
    role: 'user',
    text: '삼성전자 분석해줘',
    delay: 800,
  },
  {
    role: 'typing',
    delay: 1800,
  },
  {
    role: 'ai',
    text: `삼성전자(005930) 내재가치 분석입니다.

▎ Owner Earnings 기반 내재가치
순이익 6.5조 + 감가상각 4.2조 - CapEx 5.1조
→ Owner Earnings: 5.6조
→ DCF 내재가치: 78,400원 (현재가 대비 MoS +14.2%)

▎ 경제적 해자 (Moat)
영업이익률 3개년 평균 16.8% (반도체 업종 상위)
매출총이익률 안정적 (변동계수 0.08)
→ 해자 판정: 해자 가능성

▎ 재무 건전성
부채비율 32.4% (매우 건전)
이자보상배율 18.7배 | 유동비율 248%
잉여현금흐름(FCF) +1.4조 (양호)

▎ 레드플래그: 없음`,
    scorecard: {
      mos: { value: '+14.2%', color: '#059669' },
      roe: { value: '8.4%', color: '#D97706' },
      de: { value: '32.4%', color: '#059669' },
      moat: { value: '해자 가능성', color: '#D97706' },
      fcf: { value: 'FCF +', color: '#059669' },
    },
    delay: 400,
  },
  {
    role: 'user',
    text: '해자가 "가능성"인 이유가 뭐야?',
    delay: 2000,
  },
  {
    role: 'typing',
    delay: 1500,
  },
  {
    role: 'ai',
    text: `좋은 질문입니다. "강한 해자"가 아닌 이유를 설명드리겠습니다.

▎ 해자 판정 기준
① 영업이익률 3년 평균 ≥ 15% → 16.8% (충족)
② 매출총이익률 변동계수 ≤ 0.1 → 0.08 (충족)
③ 영업이익률 변동계수 ≤ 0.15 → 0.22 (미충족)

세 번째 조건에서 탈락했습니다. 반도체 업황 사이클에 따라 영업이익률이 2024년 4.7% → 2025년 18.2%로 큰 폭 변동했기 때문입니다.

버핏의 관점에서, 사이클 의존도가 높은 기업은 "강한 해자"보다는 "해자 가능성"으로 보수적 평가합니다.`,
    delay: 400,
  },
]

// ── 6가지 분석 관점 ──
const ANALYSIS_ASPECTS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: '내재가치 (Intrinsic Value)',
    desc: 'Owner Earnings + DCF로 적정 주가 산출, 안전마진(MoS) 판별',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: '경제적 해자 (Moat)',
    desc: '이익률 안정성 + 마진 지속력으로 경쟁우위 판정',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
      </svg>
    ),
    title: '재무 건전성',
    desc: '부채비율, 이자보상배율, 유동비율, FCF 종합 진단',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
    title: '자본 배분',
    desc: '배당수익률, 배당성향, 재투자 효율성 평가',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: '경영진 품질',
    desc: '최대주주 지분율, 내부자 거래, 지배구조 분석',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    title: '레드플래그 감지',
    desc: '영업적자, OCF 음수, 부채 급증, 감사의견 비적정 경고',
  },
]

// ── 예시 질문 ──
const EXAMPLE_QUESTIONS = [
  { q: '삼성전자 내재가치 분석해줘', tag: '내재가치' },
  { q: 'SK하이닉스 해자가 있어?', tag: '해자' },
  { q: '현대차 재무 건전한 편이야?', tag: '재무' },
  { q: 'POSCO홀딩스 레드플래그 있어?', tag: '위험' },
  { q: 'LG에너지솔루션 배당 어때?', tag: '배분' },
]


export default function PremiumPage() {
  const { dark } = useTheme()
  const [simStep, setSimStep] = useState(-1)
  const [visibleMessages, setVisibleMessages] = useState([])
  const [showTyping, setShowTyping] = useState(false)
  const [simDone, setSimDone] = useState(false)
  const chatRef = useRef(null)
  const timerRef = useRef(null)

  // Colors — always premium dark
  const bg = '#08080A'
  const surface = 'rgba(255,255,255,0.03)'
  const border = 'rgba(212,160,23,0.12)'
  const borderActive = 'rgba(212,160,23,0.35)'
  const textP = '#F5F5F0'
  const textS = '#A8A89A'
  const textM = '#6B6B60'
  const gold = PREMIUM_GOLD.primary
  const goldGrad = PREMIUM_GOLD.gradient

  // ── Simulation playback ──
  useEffect(() => {
    if (simStep < 0) {
      timerRef.current = setTimeout(() => setSimStep(0), 600)
      return () => clearTimeout(timerRef.current)
    }
    if (simStep >= SIMULATION.length) {
      setSimDone(true)
      return
    }

    const step = SIMULATION[simStep]

    if (step.role === 'typing') {
      setShowTyping(true)
      timerRef.current = setTimeout(() => {
        setShowTyping(false)
        setSimStep(s => s + 1)
      }, step.delay)
    } else {
      setVisibleMessages(prev => [...prev, step])
      timerRef.current = setTimeout(() => {
        setSimStep(s => s + 1)
      }, step.delay)
    }

    return () => clearTimeout(timerRef.current)
  }, [simStep])

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [visibleMessages, showTyping])

  const openRealChat = () => {
    window.dispatchEvent(new Event('open-buffett-chat'))
  }

  const replaySimulation = () => {
    setVisibleMessages([])
    setShowTyping(false)
    setSimDone(false)
    setSimStep(-1)
  }

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      backgroundColor: bg,
      padding: '0 24px 80px',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes pfIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pfPulse { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
        @keyframes pfSlide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pfChat { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pfCursor { 0%,100% { opacity:1; } 50% { opacity:0; } }
        @keyframes pfGlow { 0%,100% { box-shadow: 0 0 30px rgba(212,160,23,0.04); } 50% { box-shadow: 0 0 50px rgba(212,160,23,0.1); } }
        .pf-aspect:hover { background: rgba(212,160,23,0.06) !important; border-color: rgba(212,160,23,0.25) !important; }
        .pf-example:hover { background: rgba(212,160,23,0.1) !important; border-color: rgba(212,160,23,0.3) !important; }
        .pf-cta-btn:hover { opacity: 0.9; transform: translateY(-1px); }
        @media (max-width: 900px) {
          .pf-main-grid { grid-template-columns: 1fr !important; }
          .pf-sim-panel { min-height: 480px !important; }
        }
        @media (max-width: 768px) {
          .pf-hero-title { font-size: 28px !important; }
          .pf-aspects-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        maxWidth: 900,
        margin: '0 auto',
        textAlign: 'center',
        paddingTop: 56,
        paddingBottom: 40,
        animation: 'pfIn 0.5s ease-out',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 14px',
          borderRadius: 20,
          border: `1px solid ${border}`,
          background: surface,
          marginBottom: 24,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: gold, animation: 'pfPulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
            color: gold, fontFamily: FONTS.mono,
          }}>AI ANALYST</span>
        </div>

        {/* Buffett avatar + Title */}
        <div style={{ marginBottom: 16 }}>
          <img
            src="/bufit.png"
            alt="Warren Buffett AI"
            style={{
              width: 72, height: 72, borderRadius: '50%',
              objectFit: 'cover',
              border: `2px solid rgba(212,160,23,0.3)`,
              marginBottom: 16,
            }}
          />
        </div>

        <h1 className="pf-hero-title" style={{
          margin: '0 0 14px',
          fontSize: 38,
          fontWeight: 800,
          fontFamily: FONTS.serif,
          lineHeight: 1.25,
          color: textP,
        }}>
          <span style={{
            background: goldGrad,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Buffett AI</span>
          {' '}Analyst
        </h1>

        <p style={{
          margin: '0 auto 6px',
          fontSize: 15,
          color: textS,
          lineHeight: 1.7,
          maxWidth: 500,
          fontStyle: 'italic',
        }}>
          "내재가치를 모르면 투자가 아니라 투기입니다"
        </p>
        <p style={{
          margin: '0 auto',
          fontSize: 13,
          color: textM,
          lineHeight: 1.7,
          maxWidth: 480,
        }}>
          DART 공시 + 재무제표 + 실시간 시세를 기반으로
          <br />
          워런 버핏의 가치투자 프레임워크로 기업을 분석합니다.
        </p>
      </section>

      {/* ── MAIN: Guide + Simulation ── */}
      <section className="pf-main-grid" style={{
        maxWidth: 1100,
        margin: '0 auto 56px',
        display: 'grid',
        gridTemplateColumns: '1fr 1.15fr',
        gap: 20,
        animation: 'pfIn 0.5s ease-out 0.15s both',
      }}>
        {/* ── LEFT: 사용 가이드 ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* 6가지 분석 관점 */}
          <div style={{
            borderRadius: 16,
            border: `1px solid ${border}`,
            background: surface,
            padding: '24px 22px',
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
              color: gold, fontFamily: FONTS.mono, marginBottom: 6,
            }}>
              HOW IT WORKS
            </div>
            <h3 style={{
              margin: '0 0 18px',
              fontSize: 17,
              fontWeight: 700,
              color: textP,
              fontFamily: FONTS.serif,
            }}>
              6가지 관점으로 분석합니다
            </h3>

            <div className="pf-aspects-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 8,
            }}>
              {ANALYSIS_ASPECTS.map((a, i) => (
                <div key={i} className="pf-aspect" style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  border: `1px solid rgba(255,255,255,0.04)`,
                  background: 'rgba(255,255,255,0.015)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ color: gold, marginBottom: 8, opacity: 0.8 }}>
                    {a.icon}
                  </div>
                  <div style={{
                    fontSize: 12, fontWeight: 700,
                    color: textP, marginBottom: 4,
                    fontFamily: FONTS.serif,
                  }}>
                    {a.title}
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: textM,
                    lineHeight: 1.5,
                  }}>
                    {a.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 예시 질문 */}
          <div style={{
            borderRadius: 16,
            border: `1px solid ${border}`,
            background: surface,
            padding: '22px 22px',
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
              color: gold, fontFamily: FONTS.mono, marginBottom: 6,
            }}>
              EXAMPLE QUESTIONS
            </div>
            <h3 style={{
              margin: '0 0 14px',
              fontSize: 17,
              fontWeight: 700,
              color: textP,
              fontFamily: FONTS.serif,
            }}>
              이런 질문을 해보세요
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {EXAMPLE_QUESTIONS.map((eq, i) => (
                <button
                  key={i}
                  className="pf-example"
                  onClick={openRealChat}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `1px solid rgba(255,255,255,0.05)`,
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                    padding: '2px 7px', borderRadius: 4,
                    background: 'rgba(212,160,23,0.1)',
                    color: gold, fontFamily: FONTS.mono,
                    flexShrink: 0,
                  }}>
                    {eq.tag}
                  </span>
                  <span style={{ fontSize: 13, color: textS, fontWeight: 500 }}>
                    {eq.q}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={textM} strokeWidth="2" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: 시뮬레이션 채팅 ── */}
        <div className="pf-sim-panel" style={{
          borderRadius: 16,
          border: `1px solid ${borderActive}`,
          background: '#0C0C0E',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'pfGlow 4s ease-in-out infinite',
          minHeight: 560,
        }}>
          {/* Chat header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 18px',
            borderBottom: `1px solid rgba(255,255,255,0.06)`,
            background: 'rgba(212,160,23,0.03)',
            flexShrink: 0,
          }}>
            <img src="/bufit.png" alt="" style={{
              width: 28, height: 28, borderRadius: '50%',
              objectFit: 'cover',
              border: '1px solid rgba(212,160,23,0.2)',
            }} />
            <div>
              <div style={{
                fontSize: 13, fontWeight: 700, color: textP,
                fontFamily: FONTS.serif,
              }}>
                Buffett AI
              </div>
              <div style={{
                fontSize: 10, color: textM,
                fontFamily: FONTS.mono,
                letterSpacing: '0.05em',
              }}>
                LIVE SIMULATION
              </div>
            </div>
            <div style={{
              marginLeft: 'auto',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#059669',
                animation: 'pfPulse 2s ease-in-out infinite',
              }} />
              <span style={{
                fontSize: 10, color: '#059669',
                fontFamily: FONTS.mono, fontWeight: 600,
              }}>ONLINE</span>
            </div>
          </div>

          {/* Chat messages */}
          <div ref={chatRef} style={{
            flex: 1,
            overflowY: 'auto',
            padding: '18px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}>
            {/* Welcome message */}
            {visibleMessages.length === 0 && !showTyping && (
              <div style={{
                textAlign: 'center',
                padding: '30px 16px',
                animation: 'pfIn 0.4s ease-out',
              }}>
                <div style={{ fontSize: 13, color: textM, lineHeight: 1.6 }}>
                  시뮬레이션이 곧 시작됩니다...
                </div>
              </div>
            )}

            {visibleMessages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                animation: 'pfChat 0.35s ease-out',
              }}>
                {msg.role === 'ai' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    marginBottom: 4, paddingLeft: 2,
                  }}>
                    <img src="/bufit.png" alt="" style={{
                      width: 18, height: 18, borderRadius: '50%',
                      objectFit: 'cover',
                    }} />
                    <span style={{ fontSize: 10, color: textM, fontWeight: 600 }}>
                      Buffett AI
                    </span>
                  </div>
                )}
                <div style={{
                  maxWidth: '92%',
                  padding: msg.role === 'user' ? '10px 14px' : '14px 16px',
                  borderRadius: msg.role === 'user'
                    ? '12px 12px 4px 12px'
                    : '12px 12px 12px 4px',
                  background: msg.role === 'user'
                    ? 'rgba(212,160,23,0.12)'
                    : 'rgba(255,255,255,0.04)',
                  border: msg.role === 'user'
                    ? '1px solid rgba(212,160,23,0.2)'
                    : '1px solid rgba(255,255,255,0.06)',
                  color: textP,
                  fontSize: 12,
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.text}
                </div>

                {/* Scorecard badges */}
                {msg.scorecard && (
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 5,
                    marginTop: 8, paddingLeft: 2,
                    animation: 'pfSlide 0.4s ease-out 0.2s both',
                  }}>
                    {Object.entries(msg.scorecard).map(([key, v]) => (
                      <span key={key} style={{
                        fontSize: 10, fontWeight: 600,
                        padding: '3px 9px', borderRadius: 10,
                        border: `1px solid ${v.color}`,
                        color: v.color,
                        background: 'rgba(0,0,0,0.3)',
                        fontFamily: FONTS.mono,
                      }}>
                        {key === 'mos' ? 'MoS' : key === 'roe' ? 'ROE' : key === 'de' ? 'D/E' : key === 'moat' ? 'Moat' : key === 'fcf' ? 'FCF' : key.toUpperCase()}{' '}
                        {v.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {showTyping && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                animation: 'pfChat 0.3s ease-out',
              }}>
                <img src="/bufit.png" alt="" style={{
                  width: 18, height: 18, borderRadius: '50%',
                  objectFit: 'cover', alignSelf: 'flex-end',
                }} />
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '12px 12px 12px 4px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex', gap: 5,
                }}>
                  {[0, 1, 2].map(d => (
                    <span key={d} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: textM, display: 'inline-block',
                      animation: `pfPulse 1s ease-in-out ${d * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom: CTA */}
          <div style={{
            padding: '16px 18px',
            borderTop: `1px solid rgba(255,255,255,0.06)`,
            background: 'rgba(0,0,0,0.3)',
            flexShrink: 0,
          }}>
            {simDone ? (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="pf-cta-btn"
                  onClick={openRealChat}
                  style={{
                    flex: 1,
                    padding: '13px',
                    borderRadius: 10,
                    border: 'none',
                    background: goldGrad,
                    color: '#1A1A18',
                    fontSize: 14,
                    fontWeight: 800,
                    fontFamily: FONTS.body,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '-0.01em',
                  }}
                >
                  직접 질문하기
                </button>
                <button
                  onClick={replaySimulation}
                  style={{
                    padding: '13px 16px',
                    borderRadius: 10,
                    border: `1px solid ${border}`,
                    background: 'transparent',
                    color: textS,
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: FONTS.body,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: '-2px' }}>
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
                  </svg>
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex', alignItems: 'center',
                padding: '10px 14px',
                borderRadius: 10,
                border: `1px solid rgba(255,255,255,0.06)`,
                background: 'rgba(255,255,255,0.02)',
              }}>
                <span style={{ fontSize: 12, color: textM }}>
                  시뮬레이션 진행 중...
                </span>
                <span style={{
                  width: 2, height: 14,
                  background: gold,
                  marginLeft: 4,
                  animation: 'pfCursor 1s step-end infinite',
                }} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 데이터 소스 + 면책 ── */}
      <section style={{
        maxWidth: 600,
        margin: '0 auto',
        textAlign: 'center',
        animation: 'pfIn 0.5s ease-out 0.3s both',
      }}>
        <div style={{
          width: 32, height: 1,
          background: goldGrad,
          margin: '0 auto 24px',
        }} />

        {/* Data sources */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 36,
          marginBottom: 24, flexWrap: 'wrap',
        }}>
          {[
            { val: 'DART', sub: '금감원 공식 공시' },
            { val: '키움', sub: '실시간 시세' },
            { val: '재무제표', sub: '3개년 CFS 분석' },
            { val: 'AI Agent', sub: 'AI 추론 엔진' },
          ].map((t, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 14, fontWeight: 800, color: gold,
                fontFamily: FONTS.mono, marginBottom: 3,
              }}>
                {t.val}
              </div>
              <div style={{ fontSize: 10, color: textM }}>{t.sub}</div>
            </div>
          ))}
        </div>

        <p style={{
          margin: 0,
          fontSize: 11,
          color: textM,
          lineHeight: 1.7,
          maxWidth: 420,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          본 AI는 가치투자 관점의 분석 보조 도구이며 투자 권유가 아닙니다.
          <br />
          최종 투자 결정은 투자자 본인의 판단과 책임 하에 이루어져야 합니다.
        </p>
      </section>
    </div>
  )
}

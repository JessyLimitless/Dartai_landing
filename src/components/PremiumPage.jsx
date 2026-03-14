import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM_GOLD } from '../constants/theme'

// ── 프리미엄 4대 콘텐츠 ──
const FEATURES = [
  {
    id: 'insight',
    icon: (c) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
    kicker: 'WEEKLY INSIGHT',
    title: '주간 이벤트 인사이트',
    desc: 'FOMC, GTC, 양회 등 증시에 영향을 줄 핵심 이벤트를 DART 애널리스트가 직접 분석합니다. 시나리오별 영향과 국내 증시 연결 포인트까지.',
    preview: {
      type: 'report',
      lines: [
        { label: '이벤트', value: 'NVIDIA GTC 2026 + FOMC' },
        { label: '영향 업종', value: '반도체 · AI · 금융' },
        { label: '시나리오', value: '비둘기 → 외국인 매수 유입' },
        { label: '주의 포인트', value: 'Buy the rumor, Sell the news' },
      ],
    },
  },
  {
    id: 'report',
    icon: (c) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    kicker: 'WEEKLY REPORT',
    title: '주간 공시 리포팅',
    desc: '한 주간 쏟아진 공시 중 투자에 의미 있는 핵심만 추려 리포트로 정리합니다. S/A등급 공시 요약, 업종별 트렌드, 기관 수급 변화까지.',
    preview: {
      type: 'report',
      lines: [
        { label: '기간', value: '3월 2주차 (3/7 ~ 3/13)' },
        { label: 'S등급 공시', value: '삼성전자 공급계약 외 3건' },
        { label: '업종 트렌드', value: '2차전지 ↑ · 건설 ↓' },
        { label: '기관 주목', value: 'SK하이닉스 5일 연속 순매수' },
      ],
    },
  },
  {
    id: 'chatbot',
    icon: (c) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    kicker: 'AI ANALYST',
    title: '워런버핏 AI 챗봇',
    desc: '버핏의 가치투자 원칙을 학습한 AI가 DART 공시, 재무제표, 5대 변수, 기관 수급을 실시간으로 참조하여 기업 분석 대화를 나눕니다.',
    preview: {
      type: 'chat',
    },
  },
  {
    id: 'nxt',
    icon: (c) => (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    kicker: 'BONUS',
    title: 'NXT 시간외 분석',
    desc: '18:00~20:00 시간외 거래에서 기관·외국인이 움직이는 업종별 수익률 패턴을 분석합니다. 다음 날 장 흐름의 선행 시그널.',
    preview: {
      type: 'report',
      lines: [
        { label: '분석 시간', value: '18:00 ~ 20:00 (NXT)' },
        { label: 'TOP 업종', value: '반도체 +2.3% · 자동차 +1.8%' },
        { label: '시그널', value: '외국인 반도체 집중 매수' },
        { label: '다음 날 상관', value: '72% 방향 일치' },
      ],
    },
  },
]

const CHAT_DEMO = [
  { role: 'user', text: '삼성전자 최근 공시 기반으로 분석해줘' },
  { role: 'ai', text: '삼성전자(005930) 최근 공시 기반 분석입니다.\n\n▎ 최근 주요 공시\n· 3/10 공급계약 체결 (매출 대비 12.4%)\n· 3/7 자기주식 취득 결정 (500억)\n\n▎ 5대 변수 스코어: 7.2/10 (순풍)\n체질 양호, 이익 모멘텀 상승 전환\n\n▎ 기관 수급\n외국인 3일 연속 순매수 (+842억)' },
]

const PLAN = {
  price: '4,900',
  period: '월',
  items: [
    '주간 이벤트 심층 인사이트',
    '주간 핵심 공시 리포트',
    '워런버핏 AI 챗봇 무제한',
    'NXT 시간외 분석 데이터',
    '신규 프리미엄 기능 우선 접근',
  ],
}

export default function PremiumPage() {
  const { dark } = useTheme()
  const [activeFeature, setActiveFeature] = useState('insight')
  const [chatVisible, setChatVisible] = useState(0)
  const [toast, setToast] = useState(null)
  const heroRef = useRef(null)

  // Chat animation
  useEffect(() => {
    if (activeFeature === 'chatbot' && chatVisible < CHAT_DEMO.length) {
      const t = setTimeout(() => setChatVisible(v => v + 1), 500)
      return () => clearTimeout(t)
    }
  }, [activeFeature, chatVisible])

  useEffect(() => {
    setChatVisible(0)
  }, [activeFeature])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Colors — always dark
  const bg = '#08080A'
  const surface = 'rgba(255,255,255,0.03)'
  const surfaceHover = 'rgba(255,255,255,0.06)'
  const border = 'rgba(212,160,23,0.12)'
  const borderActive = 'rgba(212,160,23,0.35)'
  const textP = '#F5F5F0'
  const textS = '#A8A89A'
  const textM = '#6B6B60'
  const gold = PREMIUM_GOLD.primary
  const goldGrad = PREMIUM_GOLD.gradient

  const activeData = FEATURES.find(f => f.id === activeFeature)

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      backgroundColor: bg,
      padding: '0 24px 120px',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes pfIn { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pfGlow { 0%,100% { box-shadow: 0 0 40px rgba(212,160,23,0.06); } 50% { box-shadow: 0 0 60px rgba(212,160,23,0.12); } }
        @keyframes pfPulse { 0%,100% { opacity:0.4; } 50% { opacity:1; } }
        @keyframes pfSlide { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pfChat { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .pf-feat-btn { transition: all 0.2s ease !important; }
        .pf-feat-btn:hover { background: ${surfaceHover} !important; }
        .pf-plan-item { transition: all 0.15s; }
        .pf-plan-item:hover { background: rgba(212,160,23,0.06); }
        @media (max-width: 768px) {
          .pf-hero-title { font-size: 32px !important; }
          .pf-features-grid { grid-template-columns: 1fr !important; }
          .pf-showcase { grid-template-columns: 1fr !important; }
          .pf-pricing-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section ref={heroRef} style={{
        maxWidth: 800,
        margin: '0 auto',
        textAlign: 'center',
        paddingTop: 64,
        paddingBottom: 56,
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
          marginBottom: 28,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: gold, animation: 'pfPulse 2s ease-in-out infinite',
          }} />
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
            color: gold, fontFamily: FONTS.mono,
          }}>PREMIUM</span>
        </div>

        {/* Title */}
        <h1 className="pf-hero-title" style={{
          margin: '0 0 16px',
          fontSize: 44,
          fontWeight: 800,
          fontFamily: FONTS.serif,
          lineHeight: 1.2,
          color: textP,
        }}>
          데이터는 무료.
          <br />
          <span style={{
            background: goldGrad,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>해석은 프리미엄.</span>
        </h1>

        {/* Subtitle */}
        <p style={{
          margin: '0 auto',
          maxWidth: 480,
          fontSize: 15,
          color: textS,
          lineHeight: 1.75,
        }}>
          DART 공시와 기관 수급 데이터를 기반으로,
          <br />
          매주 정리된 인사이트와 AI 분석을 제공합니다.
        </p>
      </section>

      {/* ── FEATURE SHOWCASE ── */}
      <section style={{
        maxWidth: 1000,
        margin: '0 auto 72px',
        animation: 'pfIn 0.5s ease-out 0.15s both',
      }}>
        {/* Feature tabs */}
        <div className="pf-features-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 24,
        }}>
          {FEATURES.map(f => {
            const active = activeFeature === f.id
            return (
              <button
                key={f.id}
                className="pf-feat-btn"
                onClick={() => setActiveFeature(f.id)}
                style={{
                  padding: '16px 14px',
                  borderRadius: 12,
                  border: `1px solid ${active ? borderActive : border}`,
                  background: active ? 'rgba(212,160,23,0.06)' : surface,
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {active && (
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: 2, background: goldGrad,
                  }} />
                )}
                <div style={{ marginBottom: 10 }}>
                  {f.icon(active ? gold : textM)}
                </div>
                <div style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.12em',
                  color: active ? gold : textM,
                  fontFamily: FONTS.mono,
                  marginBottom: 6,
                }}>
                  {f.kicker}
                </div>
                <div style={{
                  fontSize: 14, fontWeight: 700,
                  color: active ? textP : textS,
                  fontFamily: FONTS.serif,
                  lineHeight: 1.3,
                }}>
                  {f.title}
                </div>
              </button>
            )
          })}
        </div>

        {/* Feature detail panel */}
        <div key={activeFeature} style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          borderRadius: 16,
          border: `1px solid ${border}`,
          background: surface,
          overflow: 'hidden',
          animation: 'pfSlide 0.3s ease-out',
          className: 'pf-showcase',
        }}>
          {/* Left: description */}
          <div style={{ padding: '36px 32px' }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.15em',
              color: gold, fontFamily: FONTS.mono, marginBottom: 14,
            }}>
              {activeData.kicker}
            </div>
            <h3 style={{
              margin: '0 0 14px',
              fontSize: 22,
              fontWeight: 700,
              color: textP,
              fontFamily: FONTS.serif,
            }}>
              {activeData.title}
            </h3>
            <p style={{
              margin: 0,
              fontSize: 14,
              color: textS,
              lineHeight: 1.75,
            }}>
              {activeData.desc}
            </p>
            {activeData.id === 'nxt' && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                marginTop: 16,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'rgba(212,160,23,0.08)',
                border: `1px solid ${border}`,
              }}>
                <span style={{ fontSize: 11, color: gold, fontWeight: 700, fontFamily: FONTS.mono }}>BONUS</span>
                <span style={{ fontSize: 11, color: textM }}>프리미엄 구독 시 무료 제공</span>
              </div>
            )}
          </div>

          {/* Right: preview */}
          <div style={{
            padding: '28px 24px',
            borderLeft: `1px solid ${border}`,
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>
            {activeData.preview.type === 'report' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  marginBottom: 16,
                }}>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    fontFamily: FONTS.serif, color: textP,
                  }}>
                    DART <span style={{ color: gold }}>Insight</span>
                  </span>
                  <span style={{
                    fontSize: 8, fontWeight: 800, letterSpacing: '0.1em',
                    padding: '2px 6px', borderRadius: 3,
                    background: 'rgba(212,160,23,0.15)', color: gold,
                  }}>PREVIEW</span>
                </div>
                {activeData.preview.lines.map((line, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    padding: '10px 0',
                    borderBottom: i < activeData.preview.lines.length - 1
                      ? `1px solid rgba(255,255,255,0.04)` : 'none',
                    animation: `pfSlide 0.3s ease-out ${i * 0.08}s both`,
                  }}>
                    <span style={{
                      width: 80, flexShrink: 0,
                      fontSize: 11, color: textM, fontWeight: 600,
                    }}>
                      {line.label}
                    </span>
                    <span style={{
                      fontSize: 13, color: textP, fontWeight: 500,
                    }}>
                      {line.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                borderRadius: 12,
                border: `1px solid rgba(255,255,255,0.06)`,
                overflow: 'hidden',
                background: '#0C0C0E',
              }}>
                {/* Chat header */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(212,160,23,0.03)',
                }}>
                  <img src="/bufit.png" alt="" style={{
                    width: 22, height: 22, borderRadius: '50%',
                    objectFit: 'cover', border: '1px solid rgba(212,160,23,0.2)',
                  }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: textP, fontFamily: FONTS.serif }}>
                    워런버핏 AI
                  </span>
                  <span style={{
                    fontSize: 8, fontWeight: 800, letterSpacing: '0.1em',
                    padding: '2px 6px', borderRadius: 3, marginLeft: 'auto',
                    background: 'rgba(212,160,23,0.15)', color: gold,
                  }}>PREVIEW</span>
                </div>
                {/* Chat messages */}
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 180 }}>
                  {CHAT_DEMO.slice(0, chatVisible).map((msg, i) => (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      animation: 'pfChat 0.35s ease-out',
                    }}>
                      <div style={{
                        maxWidth: '90%',
                        padding: '10px 13px',
                        borderRadius: msg.role === 'user' ? '10px 10px 3px 10px' : '10px 10px 10px 3px',
                        background: msg.role === 'user'
                          ? 'rgba(212,160,23,0.12)' : 'rgba(255,255,255,0.04)',
                        border: msg.role === 'user'
                          ? '1px solid rgba(212,160,23,0.2)' : 'none',
                        color: textP,
                        fontSize: 12, lineHeight: 1.65,
                        whiteSpace: 'pre-wrap',
                      }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {chatVisible < CHAT_DEMO.length && (
                    <div style={{ display: 'flex', gap: 4, paddingLeft: 4 }}>
                      {[0,1,2].map(d => (
                        <span key={d} style={{
                          width: 5, height: 5, borderRadius: '50%',
                          background: textM,
                          animation: `pfPulse 1s ease-in-out ${d * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{
        maxWidth: 480,
        margin: '0 auto 72px',
        animation: 'pfIn 0.5s ease-out 0.3s both',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{
            margin: '0 0 8px', fontSize: 24, fontWeight: 700,
            color: textP, fontFamily: FONTS.serif,
          }}>
            심플한 요금제
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: textM }}>
            모든 프리미엄 콘텐츠를 하나의 구독으로
          </p>
        </div>

        <div style={{
          borderRadius: 16,
          border: `1px solid ${borderActive}`,
          background: surface,
          overflow: 'hidden',
          animation: 'pfGlow 4s ease-in-out infinite',
        }}>
          {/* Price header */}
          <div style={{
            padding: '32px 28px 24px',
            textAlign: 'center',
            borderBottom: `1px solid ${border}`,
            background: 'rgba(212,160,23,0.03)',
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.15em',
              color: gold, fontFamily: FONTS.mono, marginBottom: 16,
            }}>
              DART INSIGHT PREMIUM
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
              <span style={{ fontSize: 42, fontWeight: 800, color: textP, fontFamily: FONTS.mono }}>
                {PLAN.price}
              </span>
              <span style={{ fontSize: 15, color: textM, fontWeight: 500 }}>
                원 / {PLAN.period}
              </span>
            </div>
          </div>

          {/* Included features */}
          <div style={{ padding: '20px 28px 28px' }}>
            {PLAN.items.map((item, i) => (
              <div key={i} className="pf-plan-item" style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 8px',
                borderRadius: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ fontSize: 14, color: textP, fontWeight: 500 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ padding: '0 28px 28px' }}>
            <button
              onClick={() => showToast('서비스 준비 중입니다. 곧 만나보실 수 있습니다.')}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 10,
                border: 'none',
                background: goldGrad,
                color: '#1A1A18',
                fontSize: 15,
                fontWeight: 800,
                fontFamily: FONTS.body,
                cursor: 'pointer',
                transition: 'opacity 0.2s, transform 0.2s',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => { e.target.style.opacity = '0.9'; e.target.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)' }}
            >
              프리미엄 시작하기
            </button>
            <p style={{
              margin: '12px 0 0',
              fontSize: 11, color: textM,
              textAlign: 'center',
            }}>
              언제든지 해지 가능 · 첫 7일 무료 체험
            </p>
          </div>
        </div>
      </section>

      {/* ── TRUST / DISCLAIMER ── */}
      <section style={{
        maxWidth: 540,
        margin: '0 auto',
        textAlign: 'center',
        animation: 'pfIn 0.5s ease-out 0.4s both',
      }}>
        <div style={{
          width: 32, height: 1,
          background: goldGrad,
          margin: '0 auto 20px',
        }} />

        {/* Trust badges */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 32,
          marginBottom: 28, flexWrap: 'wrap',
        }}>
          {[
            { val: 'DART', sub: '금감원 공식 데이터' },
            { val: '키움', sub: '기관 실매매 데이터' },
            { val: 'Gemini', sub: 'AI 분석 엔진' },
          ].map((t, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 16, fontWeight: 800, color: gold,
                fontFamily: FONTS.mono, marginBottom: 4,
              }}>
                {t.val}
              </div>
              <div style={{ fontSize: 11, color: textM }}>{t.sub}</div>
            </div>
          ))}
        </div>

        <p style={{
          margin: 0,
          fontSize: 11,
          color: textM,
          lineHeight: 1.7,
          maxWidth: 400,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          본 서비스는 투자 참고 정보를 제공하며 투자 권유가 아닙니다.
          최종 투자 결정은 투자자 본인의 판단과 책임 하에 이루어져야 합니다.
        </p>
      </section>

      {/* ── TOAST ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: 100,
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '14px 28px',
          borderRadius: 14,
          backgroundColor: '#1A1A18',
          color: textP,
          fontSize: 14,
          fontWeight: 600,
          boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 0 1px ${border}`,
          zIndex: 9999,
          animation: 'pfIn 0.3s ease-out',
          display: 'flex', alignItems: 'center', gap: 10,
          whiteSpace: 'nowrap',
          fontFamily: FONTS.body,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: gold, flexShrink: 0,
          }} />
          {toast}
        </div>
      )}
    </div>
  )
}

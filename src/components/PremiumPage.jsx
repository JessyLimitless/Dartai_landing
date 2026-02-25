import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM_GOLD } from '../constants/theme'

const VALUE_CARDS = [
  {
    num: '01',
    title: '고급 데이터 연결',
    desc: 'DART 공시, 키움증권 실시간 시세, CFS 재무제표, 수급 동향 등 프리미엄 API가 실시간으로 연결됩니다.',
  },
  {
    num: '02',
    title: 'AI 투자 상담',
    desc: '7대 변수 분석, Edge-Finder 시그널, 밸류에이션까지 통합된 컨텍스트로 깊이 있는 대화를 나눕니다.',
  },
  {
    num: '03',
    title: '맞춤 리포트 생성',
    desc: '대화 중 원하는 시점에 종목 분석 리포트를 자동 생성합니다. PDF 다운로드까지 한 번에.',
  },
]

const CHAT_MESSAGES = [
  {
    role: 'assistant',
    text: '안녕하세요. Grok Heavy AI 투자 상담입니다.\n종목명이나 투자 주제를 말씀해주세요.',
  },
  {
    role: 'user',
    text: '삼성전자 최근 실적과 투자 포인트를 분석해주세요',
  },
  {
    role: 'assistant',
    text: '삼성전자(005930) 분석 결과입니다.\n\n▎ 실적 트렌드\n매출 74.1조 (YoY +10.2%), 영업이익 10.4조\n반도체 부문 HBM 수요 증가로 회복세\n\n▎ 7대 변수 스코어: 7.2/10 (순풍)\nCCC 효율성 A, 이익 모멘텀 상승 전환\n\n▎ 리포트 생성 가능\n상세 분석 리포트를 PDF로 받아보시겠습니까?',
    hasReport: true,
  },
]

const STATS = [
  { value: '850+', label: '종목 분석' },
  { value: '7대', label: '변수 스코어링' },
  { value: '실시간', label: '공시 연동' },
]

export default function PremiumPage() {
  const { dark } = useTheme()
  const [toast, setToast] = useState(null)
  const [visibleMsgs, setVisibleMsgs] = useState(0)

  // Staggered chat message reveal
  useEffect(() => {
    if (visibleMsgs < CHAT_MESSAGES.length) {
      const timer = setTimeout(() => setVisibleMsgs((v) => v + 1), 600)
      return () => clearTimeout(timer)
    }
  }, [visibleMsgs])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  // Colors
  const bg = dark ? PREMIUM_GOLD.bgDark : PREMIUM_GOLD.bgLight
  const textPrimary = dark ? '#F5F5F0' : '#1A1A18'
  const textSecondary = dark ? '#A8A89A' : '#6B6B60'
  const textMuted = dark ? '#6B6B60' : '#A8A89A'
  const cardBg = dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)'
  const cardBorder = dark ? 'rgba(212,160,23,0.15)' : 'rgba(212,160,23,0.12)'
  const chatBg = dark ? '#111110' : '#FFFFFF'
  const chatBubbleAi = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
  const chatBubbleUser = dark ? 'rgba(212,160,23,0.15)' : 'rgba(212,160,23,0.08)'
  const dividerColor = dark ? 'rgba(212,160,23,0.25)' : 'rgba(212,160,23,0.35)'

  return (
    <div style={{
      minHeight: 'calc(100vh - 60px)',
      backgroundColor: bg,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '0 24px 120px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes premFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes premLineGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        @keyframes premMsgIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes premToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .prem-card:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 32px rgba(212,160,23,0.10) !important;
        }
      `}</style>

      {/* ── Section 1: Hero ── */}
      <section style={{
        width: '100%',
        maxWidth: '720px',
        textAlign: 'center',
        paddingTop: '64px',
        paddingBottom: '48px',
        animation: 'premFadeIn 0.6s ease-out both',
      }}>
        {/* Gold line divider */}
        <div style={{
          width: '48px',
          height: '1px',
          background: PREMIUM_GOLD.gradient,
          margin: '0 auto 20px',
          animation: 'premLineGrow 0.6s ease-out both',
          transformOrigin: 'center',
        }} />

        {/* Kicker */}
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '0.3em',
          color: PREMIUM_GOLD.primary,
          marginBottom: '24px',
          fontFamily: FONTS.mono,
        }}>
          PREMIUM
        </div>

        {/* Main title */}
        <h1 style={{
          margin: '0 0 8px',
          fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 800,
          fontFamily: FONTS.serif,
          background: PREMIUM_GOLD.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.15,
        }}>
          Grok Heavy
        </h1>

        {/* Subtitle */}
        <p style={{
          margin: '0 0 20px',
          fontSize: '16px',
          color: textSecondary,
          fontWeight: 500,
          fontFamily: FONTS.body,
        }}>
          AI 투자 상담 · 리포트 자동 생성
        </p>

        {/* Description */}
        <p style={{
          margin: '0 auto 36px',
          maxWidth: '540px',
          fontSize: '14px',
          color: textSecondary,
          lineHeight: 1.7,
          fontFamily: FONTS.body,
        }}>
          DART 공시 데이터와 키움증권 실시간 시세, 재무제표, 7대 변수 분석 등
          고급 정보 API가 연결된 최고 성능 AI가 투자 상담 후 맞춤 리포트를 생성합니다.
        </p>

        {/* 3 Stats */}
        <div className="prem-stats" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0',
          flexWrap: 'wrap',
        }}>
          {STATS.map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <div style={{
                  width: '1px',
                  height: '32px',
                  background: dividerColor,
                  margin: '0 28px',
                  flexShrink: 0,
                }} />
              )}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '22px',
                  fontWeight: 800,
                  color: PREMIUM_GOLD.primary,
                  fontFamily: FONTS.mono,
                  letterSpacing: '-0.02em',
                }}>
                  {s.value}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: textSecondary,
                  marginTop: '4px',
                  fontWeight: 500,
                }}>
                  {s.label}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* ── Section 2: Value Proposition Cards ── */}
      <section className="prem-cards-section" style={{
        width: '100%',
        maxWidth: '900px',
        marginBottom: '56px',
        animation: 'premFadeIn 0.6s ease-out 0.2s both',
      }}>
        <div className="prem-cards-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          {VALUE_CARDS.map((card, i) => (
            <div
              key={i}
              className="prem-card"
              style={{
                padding: '28px 24px',
                borderRadius: '14px',
                backgroundColor: cardBg,
                border: `1px solid ${cardBorder}`,
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                cursor: 'default',
              }}
            >
              <div style={{
                fontSize: '13px',
                fontWeight: 700,
                color: PREMIUM_GOLD.primary,
                fontFamily: FONTS.mono,
                marginBottom: '14px',
                opacity: 0.7,
              }}>
                {card.num}
              </div>
              <div style={{
                fontSize: '17px',
                fontWeight: 700,
                color: textPrimary,
                marginBottom: '10px',
                fontFamily: FONTS.serif,
                lineHeight: 1.3,
              }}>
                {card.title}
              </div>
              <div style={{
                fontSize: '13px',
                color: textSecondary,
                lineHeight: 1.65,
              }}>
                {card.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Section 3: Chat Preview ── */}
      <section style={{
        width: '100%',
        maxWidth: '640px',
        marginBottom: '56px',
        animation: 'premFadeIn 0.6s ease-out 0.4s both',
      }}>
        {/* Section subtitle */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            color: PREMIUM_GOLD.primary,
            fontFamily: FONTS.mono,
            marginBottom: '8px',
          }}>
            PREVIEW
          </div>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 700,
            color: textPrimary,
            fontFamily: FONTS.serif,
          }}>
            이렇게 대화합니다
          </h2>
        </div>

        {/* Chat window */}
        <div style={{
          borderRadius: '16px',
          border: `1px solid ${cardBorder}`,
          overflow: 'hidden',
          boxShadow: dark
            ? '0 8px 40px rgba(0,0,0,0.3)'
            : '0 8px 40px rgba(212,160,23,0.06)',
          background: chatBg,
        }}>
          {/* Chat header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 20px',
            borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            background: dark ? 'rgba(212,160,23,0.04)' : 'rgba(212,160,23,0.02)',
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: PREMIUM_GOLD.primary,
              flexShrink: 0,
            }} />
            <span style={{
              fontSize: '14px',
              fontWeight: 700,
              color: textPrimary,
              fontFamily: FONTS.serif,
            }}>
              Grok Heavy
            </span>
            <span style={{
              fontSize: '12px',
              color: textMuted,
              marginLeft: 'auto',
            }}>
              AI 투자 상담
            </span>
          </div>

          {/* Messages area */}
          <div style={{
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            minHeight: '280px',
          }}>
            {CHAT_MESSAGES.slice(0, visibleMsgs).map((msg, i) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    animation: 'premMsgIn 0.4s ease-out both',
                  }}
                >
                  {!isUser && (
                    <span style={{
                      fontSize: '11px',
                      color: PREMIUM_GOLD.primary,
                      fontWeight: 600,
                      marginBottom: '6px',
                      fontFamily: FONTS.mono,
                    }}>
                      AI
                    </span>
                  )}
                  <div style={{
                    maxWidth: '88%',
                    padding: '12px 16px',
                    borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    background: isUser ? chatBubbleUser : chatBubbleAi,
                    color: textPrimary,
                    fontSize: '13.5px',
                    lineHeight: 1.7,
                    fontFamily: FONTS.body,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    border: isUser
                      ? `1px solid ${dark ? 'rgba(212,160,23,0.2)' : 'rgba(212,160,23,0.12)'}`
                      : 'none',
                  }}>
                    {msg.text}
                    {msg.hasReport && (
                      <button
                        onClick={() => showToast('서비스 준비 중입니다. 곧 만나보실 수 있습니다.')}
                        style={{
                          display: 'block',
                          marginTop: '12px',
                          padding: '8px 18px',
                          borderRadius: '8px',
                          border: `1px solid ${PREMIUM_GOLD.primary}`,
                          background: dark
                            ? 'rgba(212,160,23,0.1)'
                            : 'rgba(212,160,23,0.06)',
                          color: PREMIUM_GOLD.primary,
                          fontSize: '12.5px',
                          fontWeight: 700,
                          fontFamily: FONTS.body,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                          letterSpacing: '0.02em',
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = dark
                            ? 'rgba(212,160,23,0.18)'
                            : 'rgba(212,160,23,0.12)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = dark
                            ? 'rgba(212,160,23,0.1)'
                            : 'rgba(212,160,23,0.06)'
                        }}
                      >
                        리포트 생성
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Disabled input bar */}
          <div style={{
            padding: '12px 20px',
            borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
            background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
          }}>
            <div
              onClick={() => showToast('서비스 준비 중입니다. 곧 만나보실 수 있습니다.')}
              style={{
                padding: '11px 16px',
                borderRadius: '10px',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                color: textMuted,
                fontSize: '13px',
                fontFamily: FONTS.body,
                cursor: 'pointer',
              }}
            >
              서비스 오픈 시 이곳에서 대화를 시작합니다
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: CTA + Disclaimer ── */}
      <section style={{
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center',
        animation: 'premFadeIn 0.6s ease-out 0.6s both',
      }}>
        {/* Gold divider */}
        <div style={{
          width: '32px',
          height: '1px',
          background: PREMIUM_GOLD.gradient,
          margin: '0 auto 20px',
        }} />

        <div style={{
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.15em',
          color: PREMIUM_GOLD.primary,
          fontFamily: FONTS.mono,
          marginBottom: '8px',
        }}>
          COMING SOON
        </div>

        <p style={{
          margin: '0 0 32px',
          fontSize: '14px',
          color: textSecondary,
          lineHeight: 1.6,
        }}>
          현재 서비스를 준비하고 있습니다.
          <br />
          곧 최고 수준의 AI 투자 상담을 경험하실 수 있습니다.
        </p>

        {/* Disclaimer */}
        <p style={{
          margin: 0,
          fontSize: '11px',
          color: textMuted,
          lineHeight: 1.6,
          maxWidth: '400px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          본 서비스는 투자 참고 정보를 제공하며 투자 권유가 아닙니다.
          최종 투자 결정은 투자자 본인의 판단과 책임 하에 이루어져야 합니다.
        </p>
      </section>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '14px 28px',
          borderRadius: '14px',
          backgroundColor: dark ? '#1A1A18' : '#FFFFFF',
          color: textPrimary,
          fontSize: '14px',
          fontWeight: 600,
          boxShadow: `0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px ${cardBorder}`,
          zIndex: 9999,
          animation: 'premToastIn 0.3s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          whiteSpace: 'nowrap',
          fontFamily: FONTS.body,
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: PREMIUM_GOLD.primary,
            flexShrink: 0,
          }} />
          {toast}
        </div>
      )}
    </div>
  )
}

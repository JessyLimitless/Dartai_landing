import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'

const R = '#DC2626'

const FEATURES = [
  {
    badge: 'PREMIUM',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/>
      </svg>
    ),
    title: 'DART 픽 — 오늘의 상승 종목',
    desc: '매일 아침 800여 건 공시 + 미국 AI 섹터를 한 깔때기에 넣어 단 하나의 상승 시그널 종목으로 좁혀 드립니다. 선정 깔때기(공시 70 + 미국 30)를 그대로 공개해요.',
  },
  {
    free: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: '오늘의 공시 브리핑',
    desc: '매일 800건 중 상승 시그널 5종목만. 소수계좌·투자경고·내부자 매수를 골라 업종·재무·PBR까지 한눈에 정리해 드려요.',
  },
  {
    free: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: '미국장 브리핑',
    desc: '어젯밤 미국장의 유가·금리·매크로 + AI 섹터 세분 분석으로, 그 신호가 한국 어느 종목에 꽂히는지 매핑해 드려요.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    title: '핵심 공시 즉시 알림',
    desc: '장중 S/A급 공시가 올라오는 순간 Web Push(브라우저 알림)로 알려드려요.',
  },
]

const FAQ = [
  {
    q: '무료와 뭐가 다른가요?',
    a: '공시 브리핑과 미국장 브리핑은 누구나 무료로 보실 수 있어요. 프리미엄은 매일 아침 단 하나의 상승 시그널 종목을 고르는 「DART 픽」 — 공시·미국 신호를 종합한 최종 한 종목과 선정 깔때기를 받아보실 수 있습니다.',
  },
  {
    q: '콘텐츠는 매일 오나요?',
    a: '평일 매일입니다. 공시 브리핑은 장 마감 후, 미국장 브리핑은 아침에 발행되고, DART 픽은 매일 아침 단 한 종목으로 발행됩니다.',
  },
  {
    q: '왜 신뢰할 수 있나요?',
    a: '모든 시세·재무는 실제 API로 조회한 값만 씁니다 — 추정이나 소문이 아니라 데이터 기반이에요. 공시 원문까지 확인해 정리합니다.',
  },
  {
    q: '가격과 결제는?',
    a: '가격은 문의 주시면 안내드립니다. 「프리미엄 문의하기」로 연락처를 남겨주시면 구독 방법과 함께 알려드려요. 언제든 해지 가능합니다.',
  },
]

export default function PremiumPage() {
  const { colors, dark } = useTheme()
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(null)

  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  return (
    <div className="page-enter" style={{
      maxWidth: 560, margin: '0 auto', paddingBottom: 120,
      fontFamily: FONTS.body, color: colors.textPrimary,
    }}>

      {/* 히어로 */}
      <div style={{ padding: 'clamp(48px, 8vw, 72px) 28px 40px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: R, margin: '0 0 24px', textTransform: 'uppercase' }}>
          DART Insight Premium
        </p>
        <h1 style={{
          fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 800, fontFamily: FONTS.serif,
          lineHeight: 1.2, letterSpacing: '-0.03em', margin: '0 0 16px', color: colors.textPrimary,
        }}>
          매일 아침,<br />단 하나의 상승 종목
        </h1>
        <p style={{ fontSize: 16, color: colors.textMuted, lineHeight: 1.65, margin: '0 auto 32px', maxWidth: 400 }}>
          공시 브리핑과 미국장 브리핑은 <b style={{ color: colors.textSecondary }}>무료</b>.<br />
          그 위에, 신호를 종합한 <b style={{ color: R }}>DART 픽</b> 한 종목을 매일.
        </p>

        {/* 가격 — 비공개, 문의 시 안내 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 800, fontFamily: FONTS.serif,
            color: colors.textPrimary, letterSpacing: '-0.02em', lineHeight: 1.3,
          }}>
            가격은 문의 주시면 안내드려요
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
              color: '#B45309', background: dark ? 'rgba(217,119,6,0.12)' : 'rgba(217,119,6,0.1)',
              padding: '5px 13px', borderRadius: 20,
            }}>
              DART 픽 — 프리미엄 전용
            </span>
          </div>
        </div>

        {/* 프리미엄(DART 픽) 문의 CTA */}
        <button onClick={() => navigate('/inquiry?type=premium')} style={{
          width: '100%', maxWidth: 380, height: 52, borderRadius: 12, border: 'none',
          background: R, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          margin: '0 auto', display: 'block', letterSpacing: '-0.01em',
        }}>
          프리미엄 문의하기
        </button>
        <button onClick={() => navigate('/briefing')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: colors.textMuted, textDecoration: 'underline', marginTop: 14,
        }}>
          무료 브리핑 먼저 보기 →
        </button>
      </div>

      <div style={{ height: 1, background: border, margin: '0 28px' }} />

      {/* 기능 */}
      <div style={{ padding: '48px 28px 0' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: colors.textMuted, margin: '0 0 32px', textTransform: 'uppercase' }}>
          매일 받는 것
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 18, alignItems: 'flex-start' }}>
              <div style={{
                width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: f.badge ? (dark ? 'rgba(220,38,38,0.14)' : 'rgba(220,38,38,0.07)') : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                color: f.badge ? R : colors.textSecondary,
              }}>
                {f.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>{f.title}</span>
                  {f.badge && (
                    <span style={{ fontSize: 10, fontWeight: 800, color: R, background: dark ? 'rgba(220,38,38,0.14)' : 'rgba(220,38,38,0.08)', padding: '2px 7px', borderRadius: 5 }}>{f.badge}</span>
                  )}
                  {f.free && (
                    <span style={{ fontSize: 10, fontWeight: 800, color: colors.textMuted, background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', padding: '2px 7px', borderRadius: 5 }}>무료</span>
                  )}
                </div>
                <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: border, margin: '48px 28px 0' }} />

      {/* FAQ */}
      <div style={{ padding: '48px 28px 0' }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: colors.textMuted, margin: '0 0 24px', textTransform: 'uppercase' }}>
          자주 묻는 질문
        </p>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{ borderTop: i === 0 ? `1px solid ${border}` : 'none', borderBottom: `1px solid ${border}` }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: '100%', padding: '18px 0', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', gap: 16,
              }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.4 }}>{item.q}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round"
                  style={{ flexShrink: 0, transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openFaq === i && (
                <p style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.7, margin: '0 0 18px' }}>{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 하단 CTA — 프리미엄 문의 */}
      <div style={{ padding: '48px 28px 0', textAlign: 'center' }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, margin: '0 0 6px' }}>
          DART 픽으로 매일 한 종목을
        </p>
        <p style={{ fontSize: 13, color: colors.textMuted, margin: '0 0 20px' }}>
          공시·미국 신호를 종합한 단 하나의 상승 시그널 종목. 가격은 문의 시 안내드려요.
        </p>
        <button onClick={() => navigate('/inquiry?type=premium')} style={{
          width: '100%', maxWidth: 380, height: 52, borderRadius: 12, border: 'none',
          background: R, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          margin: '0 auto', display: 'block', letterSpacing: '-0.01em',
        }}>
          프리미엄 문의하기
        </button>
      </div>

      {/* 면책 */}
      <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.7, textAlign: 'center', margin: '40px 28px 0' }}>
        본 서비스는 투자 참고 정보를 제공하며 투자 권유가 아닙니다.
        최종 투자 결정은 투자자 본인의 판단과 책임 하에 이루어져야 합니다.
      </p>
    </div>
  )
}

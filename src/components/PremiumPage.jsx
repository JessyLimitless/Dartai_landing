import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { useAuth } from '../contexts/AuthContext'
import { API } from '../lib/api'

const R = '#DC2626'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: '오늘의 공시 브리핑',
    desc: '매일 800건 중 상승 시그널 5종목만. 소수계좌·투자경고·내부자 매수를 골라 업종·재무·PBR까지 한눈에 정리해 드려요.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: '미국 시그널',
    desc: '어젯밤 미국장의 유가·금리·매크로 + AI 섹터 세분 분석으로, 그 신호가 한국 어느 종목에 꽂히는지 매핑해 드려요.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
      </svg>
    ),
    title: '핵심 공시 즉시 알림',
    desc: '장중 S/A급 공시가 올라오는 순간 Web Push로 알려드려요. 메일로도 매일 받아보실 수 있어요.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    title: '기업 딥분석 · AI 카드',
    desc: '관심 종목의 재무·주주·차트·AI 요약을 한 화면에. 추천 종목을 더 깊게 확인하고 싶을 때.',
  },
]

const FAQ = [
  {
    q: '무료와 뭐가 다른가요?',
    a: '무료는 일부 요약만 열람됩니다. 프리미엄은 매일 2개 콘텐츠(공시 브리핑·미국 시그널) 전체 + 매일 채점 + 즉시 알림을 메일로 받아보실 수 있어요.',
  },
  {
    q: '콘텐츠는 매일 오나요?',
    a: '평일 매일입니다. 공시 브리핑은 장 마감 후, 미국 시그널은 아침에 발행되고, 메일로도 함께 보내드립니다.',
  },
  {
    q: '왜 신뢰할 수 있나요?',
    a: '모든 시세·재무는 실제 API로 조회한 값만 씁니다 — 추정이나 소문이 아니라 데이터 기반이에요. 공시 원문까지 확인해 정리합니다.',
  },
  {
    q: '결제와 해지는?',
    a: '월 9,900원 단위 구독이며 언제든 해지 가능합니다. (현재 지인 베타 기간은 무료로 체험하실 수 있어요.)',
  },
]

export default function PremiumPage() {
  const { colors, dark } = useTheme()
  const { user } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [done, setDone] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) return
    try {
      await fetch(`${API}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: user?.name || '' }),
      })
    } catch {}
    setDone(true)
  }

  const border = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  const SubscribeForm = () => done ? (
    <div style={{
      display: 'inline-block', padding: '14px 28px', borderRadius: 12,
      background: dark ? 'rgba(220,38,38,0.1)' : 'rgba(220,38,38,0.06)',
      fontSize: 14, fontWeight: 600, color: R,
    }}>
      신청 완료 — 매일 핵심 콘텐츠를 메일로 보내드릴게요
    </div>
  ) : (
    <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8, maxWidth: 380, margin: '0 auto' }}>
      <input
        type="email" value={email} onChange={e => setEmail(e.target.value)}
        placeholder="이메일 주소" required
        style={{
          flex: 1, height: 50, padding: '0 16px', borderRadius: 12,
          border: `1px solid ${border}`, background: dark ? '#111113' : '#F8F8FA',
          color: colors.textPrimary, fontSize: 15, outline: 'none', fontFamily: FONTS.body,
        }}
        onFocus={e => { e.target.style.borderColor = R }}
        onBlur={e => { e.target.style.borderColor = border }}
      />
      <button type="submit" style={{
        height: 50, padding: '0 24px', borderRadius: 12, border: 'none',
        background: R, color: '#fff', fontSize: 15, fontWeight: 700,
        cursor: 'pointer', flexShrink: 0, letterSpacing: '-0.01em',
      }}>구독 신청</button>
    </form>
  )

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
          매일 아침,<br />주가를 움직이는 핵심만
        </h1>
        <p style={{ fontSize: 16, color: colors.textMuted, lineHeight: 1.65, margin: '0 auto 40px', maxWidth: 400 }}>
          800건 중 핵심만 골라,<br />공시 브리핑과 미국 시그널로 매일 아침.
        </p>

        {/* 가격 */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 54, fontWeight: 900, letterSpacing: '-3px', lineHeight: 1, color: colors.textPrimary, fontVariantNumeric: 'tabular-nums' }}>9,900</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, fontWeight: 600, color: colors.textMuted }}>원</span>
              <span style={{ fontSize: 13, color: colors.textMuted, whiteSpace: 'nowrap' }}>/ 월</span>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
              color: '#B45309', background: dark ? 'rgba(217,119,6,0.12)' : 'rgba(217,119,6,0.1)',
              padding: '5px 13px', borderRadius: 20,
            }}>
              지인 베타 — 한정 무료 체험
            </span>
          </div>
        </div>

        <SubscribeForm />
        <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 12 }}>
          스팸 없음 · 언제든 해지 가능
        </p>
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

      {/* 하단 CTA */}
      {!done && (
        <div style={{ padding: '48px 28px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, margin: '0 0 6px' }}>
            지금 구독하면 베타 기간 무료
          </p>
          <p style={{ fontSize: 13, color: colors.textMuted, margin: '0 0 20px' }}>
            이메일만 남기면 내일 아침부터 핵심 콘텐츠를 보내드려요
          </p>
          <SubscribeForm />
        </div>
      )}

      {/* 면책 */}
      <p style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.7, textAlign: 'center', margin: '40px 28px 0' }}>
        본 서비스는 투자 참고 정보를 제공하며 투자 권유가 아닙니다.
        최종 투자 결정은 투자자 본인의 판단과 책임 하에 이루어져야 합니다.
      </p>
    </div>
  )
}

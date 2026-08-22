import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { PREMIUM_PRICE_LABEL } from '../lib/access'

const R = '#DC2626'

// 구독 상품 = 오늘의 공시 · 브리핑 · 미국장 브리핑 3종.
// __DART 픽은 포함하지 않는다__ — 자산운용용 내부 도구라 판매 대상이 아니다.
//
// ⚠️ 이 페이지의 모든 문구는 __성과를 약속하지 않는다.__ "수익률"·"수익을 높인다"
//    류를 쓰면 근거 없는 주장이 된다(알파 p=1.000 · 위약 대조군 p=0.363).
//    파는 것은 __원문 검증에 들어간 사람의 시간__이다.

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
    title: '오늘의 공시',
    desc: '하루 800여 건 중 주가를 움직이는 S·A 시그널만 실시간으로 골라냅니다. 소수계좌·투자경고·내부자 매수를 등급과 강도로 정리해 드려요.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    title: '일일 브리핑',
    desc: '핵심 공시를 골라 원문까지 직접 열어 확인하고 해석합니다. 제목만 보면 반대로 읽히는 공시 — 3주짜리 자사주 소각, 매수가 아닌 무상신주 — 를 걸러내는 게 이 작업의 전부입니다.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: '미국장 브리핑',
    desc: '밤사이 뉴욕장이 무엇을 왜 움직였는지 읽고, 그 신호가 한국 어느 섹터에 꽂히는지 매핑합니다. 1차 수혜와 연상 수혜를 구분해 표기해요.',
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
    q: '무엇을 받게 되나요?',
    a: '오늘의 공시 · 일일 브리핑 · 미국장 브리핑 3종 전체입니다. 구독 전에도 각 화면의 앞부분은 미리 보실 수 있어요.',
  },
  {
    q: '콘텐츠는 매일 오나요?',
    a: '평일 기준으로 발행하지만 매일을 약속드리지는 않습니다. 최근 22거래일 실측 발행률은 브리핑 91%(20회), 미국장 브리핑 86%(19회)였어요. 사람이 원문을 직접 확인해 쓰기 때문에 열흘에 한 번 정도는 거르는 날이 있습니다. 월 20회 내외로 보시면 됩니다.',
  },
  {
    q: '수익을 올려주나요?',
    a: '아니요, 그런 약속은 드리지 않습니다. 저희가 파는 것은 수익률이 아니라 정보를 압축하는 시간입니다 — 하루 800여 건의 공시에서 볼 만한 것을 골라내고, 원문을 열어 제목과 실제 내용이 다른 것을 걸러내는 작업이에요. 투자 판단과 그 결과는 이용자 본인의 몫입니다.',
  },
  {
    q: '왜 신뢰할 수 있나요?',
    a: '모든 시세·재무는 실제 API로 조회한 값만 씁니다 — 추정이나 소문을 쓰지 않아요. 확인되지 않은 것은 "확인 필요"로 표기하고 넘어갑니다.',
  },
  {
    q: '가격과 결제는?',
    a: PREMIUM_PRICE_LABEL + '입니다. 아래 「구독 신청하기」로 연락처를 남겨주시면 결제 방법을 안내드려요. 언제든 해지 가능합니다.',
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
          공시 원문까지<br />직접 열어 봅니다
        </h1>
        <p style={{ fontSize: 16, color: colors.textMuted, lineHeight: 1.65, margin: '0 auto 32px', maxWidth: 400 }}>
          하루 800여 건의 공시 중 볼 만한 것을 골라,
          <b style={{ color: colors.textSecondary }}> 제목과 실제 내용이 다른 것</b>을 걸러 드립니다.
        </p>

        {/* 가격 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 'clamp(30px, 7vw, 40px)', fontWeight: 800, fontFamily: FONTS.mono,
            color: colors.textPrimary, letterSpacing: '-0.03em', lineHeight: 1.2,
          }}>
            {PREMIUM_PRICE_LABEL}
          </div>
          <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 1.6 }}>
            오늘의 공시 · 브리핑 · 미국장 브리핑 3종<br />
            언제든 해지 · 발행일 기준 월 20회 내외
          </div>
        </div>

        {/* 구독 신청 CTA — 결제 연동 전까지 문의 페이지로 */}
        <button onClick={() => navigate('/inquiry?type=premium')} style={{
          width: '100%', maxWidth: 380, height: 52, borderRadius: 12, border: 'none',
          background: R, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          margin: '0 auto', display: 'block', letterSpacing: '-0.01em',
        }}>
          구독 신청하기
        </button>
        <button onClick={() => navigate('/briefing')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: colors.textMuted, textDecoration: 'underline', marginTop: 14,
        }}>
          먼저 미리보기 →
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
          공시 읽는 시간을 줄여 드립니다
        </p>
        <p style={{ fontSize: 13, color: colors.textMuted, margin: '0 0 20px' }}>
          {PREMIUM_PRICE_LABEL} · 오늘의 공시 · 브리핑 · 미국장 브리핑 3종.
        </p>
        <button onClick={() => navigate('/inquiry?type=premium')} style={{
          width: '100%', maxWidth: 380, height: 52, borderRadius: 12, border: 'none',
          background: R, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
          margin: '0 auto', display: 'block', letterSpacing: '-0.01em',
        }}>
          구독 신청하기
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

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM_GOLD } from '../constants/theme'
import { PREMIUM_PRICE_LABEL, isLoggedIn } from '../lib/access'

/**
 * 유료 콘텐츠 페이월 — 미리보기 아래에 붙는 전환 카드.
 *
 * 설계 원칙 두 가지:
 *  1. __성과를 약속하지 않는다.__ "수익률"·"수익을 높여준다" 류 문구 금지.
 *     이 상품이 파는 것은 원문 검증에 들어간 사람의 시간이지 수익이 아니다.
 *  2. __발행 실적을 숨기지 않는다.__ 매일 발행이 아니라는 걸 먼저 밝힌다
 *     (최근 22거래일 실측 발행률 86~91%). 유료 상품에서 과장은 환불 사유가 된다.
 */
export default function PremiumLock({ title, benefits = [], compact = false }) {
  const { colors, dark } = useTheme()
  const navigate = useNavigate()
  const loggedIn = isLoggedIn()

  const gold = PREMIUM_GOLD.primary
  const border = dark ? 'rgba(212,160,23,0.22)' : 'rgba(212,160,23,0.28)'

  return (
    <div style={{ position: 'relative' }}>
      {/* 미리보기와 페이월 사이 페이드 — 콘텐츠가 이어진다는 느낌을 준다 */}
      {!compact && (
        <div aria-hidden style={{
          height: 96, marginTop: -96, pointerEvents: 'none', position: 'relative', zIndex: 1,
          background: `linear-gradient(to bottom, transparent, ${colors.bgPrimary} 88%)`,
        }} />
      )}

      <div style={{
        position: 'relative', zIndex: 2,
        margin: compact ? '12px 0' : '0 0 32px',
        padding: compact ? '20px 18px' : '28px 22px',
        borderRadius: 16, border: `1px solid ${border}`,
        background: dark ? 'rgba(212,160,23,0.045)' : 'rgba(212,160,23,0.035)',
        textAlign: 'center', fontFamily: FONTS.body,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 10, fontWeight: 800, letterSpacing: '0.06em',
          color: dark ? PREMIUM_GOLD.light : PREMIUM_GOLD.dark,
          padding: '4px 10px', borderRadius: 5,
          background: dark ? 'rgba(212,160,23,0.12)' : 'rgba(212,160,23,0.10)',
          marginBottom: 12,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          구독자 전용
        </div>

        <div style={{
          fontSize: compact ? 16 : 18, fontWeight: 800, color: colors.textPrimary,
          fontFamily: FONTS.serif, marginBottom: 8, lineHeight: 1.4,
        }}>
          {title || '이어지는 내용은 구독자에게 공개됩니다'}
        </div>

        <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.65, marginBottom: benefits.length ? 16 : 20 }}>
          공시 원문을 사람이 직접 열어 확인한 내용입니다.<br />
          제목만으로는 반대로 읽히는 공시를 걸러냅니다.
        </div>

        {benefits.length > 0 && (
          <div style={{
            textAlign: 'left', display: 'inline-flex', flexDirection: 'column', gap: 8,
            margin: '0 auto 20px', maxWidth: 300,
          }}>
            {benefits.map((b, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ color: gold, fontSize: 13, lineHeight: 1.6, flexShrink: 0 }}>·</span>
                <span style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.6 }}>{b}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{
          fontSize: 22, fontWeight: 800, color: colors.textPrimary,
          fontFamily: FONTS.mono, letterSpacing: -0.5, marginBottom: 4,
        }}>
          {PREMIUM_PRICE_LABEL}
        </div>
        <div style={{ fontSize: 11.5, color: colors.textMuted, marginBottom: 18 }}>
          언제든 해지 · 발행일 기준 월 20회 내외
        </div>

        <button onClick={() => navigate('/inquiry?type=premium')} style={{
          width: '100%', maxWidth: 300, padding: '13px 24px', borderRadius: 10,
          border: 'none', background: colors.textPrimary,
          color: dark ? '#0A0A0B' : '#fff',
          fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONTS.body,
        }}>
          구독 신청하기
        </button>

        <div style={{ marginTop: 14, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/premium')} style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            fontSize: 12.5, color: colors.textMuted, textDecoration: 'underline',
            fontFamily: FONTS.body,
          }}>
            구독 안내 자세히
          </button>
          {!loggedIn && (
            <span style={{ fontSize: 12.5, color: colors.textMuted }}>
              이미 구독 중이라면 로그인
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

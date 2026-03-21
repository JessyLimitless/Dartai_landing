import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const R = '#DC2626'

const TIERS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '9,900',
    period: '월',
    tagline: '개인 투자자',
    color: '#71717A',
    features: [
      '매일 저녁 7시 브리핑 요약',
      'S/A 등급 공시 알림',
      'Buffett AI 1회/일',
      '관심종목 5개',
      '기업카드 열람',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '100,000',
    period: '월',
    tagline: '전업 투자자 · 전문투자자',
    color: R,
    badge: 'BEST',
    features: [
      '브리핑 전문 + DART Pick',
      '전등급 공시 + 독소조항 알림',
      'Buffett AI 무제한',
      '관심종목 50개',
      '이사회결의 심층 분석 리포트',
      '5개년 재무 딥분석 (AI)',
      '세력 평단가 · 오버행 알림',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '300,000',
    period: '월',
    tagline: '자산운용사 · 투자자문사',
    color: '#D4A017',
    features: [
      'Premium 전체 기능 포함',
      'API 키 발급 (시스템 연동)',
      '포트폴리오 무제한 종목',
      'PDF 리포트 다운로드',
      '커스텀 키워드 알림',
      '전용 슬랙/텔레그램 채널',
      '우선 기술 지원',
    ],
  },
]

export default function PremiumPage() {
  const { colors, dark } = useTheme()
  const [selectedTier, setSelectedTier] = useState('premium')

  const sep = dark ? '#1E1E22' : '#F0F0F2'
  const dimBg = dark ? '#141416' : '#F8F8FA'

  const openChat = () => {
    window.dispatchEvent(new Event('open-buffett-chat'))
  }

  return (
    <div className="page-enter" style={{
      maxWidth: 720, margin: '0 auto',
      padding: '0 0 80px',
      fontFamily: FONTS.body,
      backgroundColor: colors.bgPrimary,
    }}>

      {/* 히어로 */}
      <div style={{ padding: '32px 20px 8px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: colors.textMuted, letterSpacing: '0.08em', fontWeight: 600, marginBottom: 12 }}>
          PRICING
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: colors.textPrimary, fontFamily: FONTS.serif, marginBottom: 8 }}>
          기관의 언어를,<br />당신의 수익으로
        </div>
        <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>
          공시 이면의 자본 전략을 읽는 AI 리포트
        </div>
      </div>

      {/* 무료 체험 CTA */}
      <div style={{ padding: '16px 20px 24px', textAlign: 'center' }}>
        <button className="touch-press" onClick={openChat} style={{
          padding: '12px 32px', borderRadius: 10, border: 'none',
          background: R, color: '#fff',
          fontSize: 15, fontWeight: 700, cursor: 'pointer',
        }}>
          Buffett AI 무료 체험
        </button>
      </div>

      {/* 요금제 카드 3개 */}
      <div style={{ padding: '0 16px 24px' }}>
        <div className="pricing-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}>
          {TIERS.map((tier) => {
            const isSelected = selectedTier === tier.id
            const isPremium = tier.id === 'premium'
            const isEnterprise = tier.id === 'enterprise'
            const borderColor = isSelected ? tier.color : sep

            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                style={{
                  borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
                  border: `${isSelected ? 2 : 1}px solid ${borderColor}`,
                  background: dark ? '#141416' : '#FFFFFF',
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
              >
                {/* 뱃지 */}
                {tier.badge && (
                  <div style={{
                    position: 'absolute', top: -1, right: -1,
                    background: tier.color, color: '#fff',
                    fontSize: 9, fontWeight: 800, letterSpacing: '0.05em',
                    padding: '3px 8px', borderRadius: '0 13px 0 8px',
                  }}>{tier.badge}</div>
                )}

                {/* 헤더 */}
                <div style={{
                  padding: '16px 12px 12px', textAlign: 'center',
                  borderBottom: `1px solid ${sep}`,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: tier.color, marginBottom: 2 }}>
                    {tier.name}
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 10 }}>
                    {tier.tagline}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
                    <span style={{
                      fontSize: isEnterprise ? 18 : 22, fontWeight: 800,
                      color: colors.textPrimary, fontFamily: "'Inter', sans-serif",
                    }}>{tier.price}</span>
                    <span style={{ fontSize: 11, color: colors.textMuted }}>원/{tier.period}</span>
                  </div>
                </div>

                {/* 기능 리스트 */}
                <div style={{ padding: '12px' }}>
                  {tier.features.map((feat, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 6,
                      padding: '4px 0',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke={tier.color} strokeWidth="3" strokeLinecap="round"
                        style={{ flexShrink: 0, marginTop: 2 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span style={{ fontSize: 11, color: colors.textSecondary, lineHeight: 1.4 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* 선택된 요금제 버튼 */}
        <div style={{ marginTop: 14 }}>
          {selectedTier === 'enterprise' ? (
            <div style={{
              width: '100%', padding: '14px', borderRadius: 10, textAlign: 'center',
              background: 'linear-gradient(135deg, #D4A017, #B8922E)', color: '#fff',
              fontSize: 15, fontWeight: 700, cursor: 'pointer',
            }}>
              도입 문의하기
            </div>
          ) : (
            <div style={{
              width: '100%', padding: '14px', borderRadius: 10, textAlign: 'center',
              background: dark ? '#1A1A1E' : '#F4F4F5',
              fontSize: 14, fontWeight: 600, color: colors.textMuted,
            }}>
              결제 서비스 준비 중
            </div>
          )}
        </div>
      </div>

      {/* 구분 */}
      <div style={{ height: 8, background: dimBg }} />

      {/* Premium 핵심 가치 */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
          Premium이 보여주는 것
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginBottom: 20 }}>
          증권앱에서는 절대 볼 수 없는 분석
        </div>
        {[
          { title: '이사회결의 심층 분석', desc: 'CB/BW 발행의 독소조항, 세력 평단가, Lock-up 해제 일정을 한눈에' },
          { title: '5개년 재무 딥분석', desc: '현금흐름 진위, 자본변동성, 업종 상대 밸류에이션 AI 자동 리포트' },
          { title: '세력 평단가 추적', desc: '제3자배정 발행가 vs 현재가 괴리율 — "큰손의 매입가"를 알 수 있습니다' },
          { title: '오버행 리스크 알림', desc: 'CB 전환, 보호예수 해제 D-Day 카운트다운으로 물량 폭탄 사전 경고' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 0',
            borderBottom: i < 3 ? `1px solid ${sep}` : 'none',
          }}>
            <span style={{
              fontSize: 11, fontWeight: 700, fontFamily: FONTS.mono,
              color: R, minWidth: 20, marginTop: 2,
            }}>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 3 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 구분 */}
      <div style={{ height: 8, background: dimBg }} />

      {/* Buffett AI 소개 */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: colors.textPrimary, marginBottom: 16 }}>
          이런 걸 물어보세요
        </div>
        {[
          { q: '삼성전자 지금 사야 할까?', desc: '내재가치 + 업종 전망 + 증권가 목표가 종합 분석' },
          { q: '현대차 해자 있어?', desc: '이익률 지속력으로 경쟁우위 판별' },
          { q: 'SK하이닉스 레드플래그?', desc: '영업적자, OCF 음수, 부채 급증 감지' },
        ].map((item, i) => (
          <div key={i} onClick={openChat} style={{
            padding: '14px 0', cursor: 'pointer',
            borderBottom: i < 2 ? `1px solid ${sep}` : 'none',
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, marginBottom: 3 }}>
              "{item.q}"
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted }}>{item.desc}</div>
          </div>
        ))}
      </div>

      {/* 면책 */}
      <div style={{ padding: '16px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          본 서비스는 투자 참고 정보를 제공하며 투자 권유가 아닙니다.
          <br />최종 투자 결정은 투자자 본인의 판단과 책임 하에 이루어져야 합니다.
        </p>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
    </div>
  )
}

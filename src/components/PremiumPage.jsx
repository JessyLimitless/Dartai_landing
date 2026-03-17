import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

export default function PremiumPage() {
  const { colors, dark } = useTheme()

  const sep = dark ? '#1E1E22' : '#F0F0F2'
  const dimBg = dark ? '#141416' : '#F8F8FA'

  const openChat = () => {
    window.dispatchEvent(new Event('open-buffett-chat'))
  }

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto',
      padding: '0 0 80px',
      fontFamily: FONTS.body,
      backgroundColor: colors.bgPrimary,
    }}>

      {/* 히어로 */}
      <div style={{ padding: '32px 20px 24px', textAlign: 'center' }}>
        <div onClick={openChat} style={{ cursor: 'pointer', display: 'inline-block' }}>
          <img src="/bufit.png" alt="Buffett AI" style={{
            width: 80, height: 80, borderRadius: '50%', objectFit: 'cover',
            marginBottom: 16,
          }} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
          Buffett AI
        </div>
        <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>
          "가격은 지불하는 것, 가치는 얻는 것"<br />
          기업의 내재가치를 중심으로 분석해드려요
        </div>
      </div>

      {/* 차별점 — 일반 AI와 뭐가 다른지 */}
      <div style={{ padding: '0 20px 20px' }}>
        <div style={{
          borderRadius: 14, padding: '18px 16px',
          background: dimBg, border: `1px solid ${sep}`,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 4 }}>
            버핏처럼 기업의 내재가치를 분석해요
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12 }}>
            단기 시세가 아닌, 기업의 본질적 가치에 집중합니다
          </div>
          {[
            'DART 공시 데이터를 실시간으로 분석해요',
            '키움증권 시세로 지금 가격 기준 내재가치를 계산해요',
            '3개년 재무제표를 자동 수집해서 트렌드를 봐요',
            '업종 평균, 경쟁사, 최신 뉴스까지 검색해서 비교해요',
            '시장 전망, 업종 전망을 뉴스·이벤트·정책 기반으로 분석해요',
          ].map((text, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              padding: '6px 0',
            }}>
              <span style={{ color: PREMIUM.accent, fontSize: 14, lineHeight: 1.5, flexShrink: 0 }}>·</span>
              <span style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 20px 24px' }}>
        <button className="touch-press" onClick={openChat} style={{
          width: '100%', padding: '14px', borderRadius: 12, border: 'none',
          background: PREMIUM.accent, color: '#fff',
          fontSize: 16, fontWeight: 700, cursor: 'pointer', minHeight: 48,
        }}>
          지금 분석 시작하기
        </button>
      </div>

      {/* 구분 */}
      <div style={{ height: 8, background: dimBg }} />

      {/* 이런 걸 물어보세요 */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: colors.textPrimary, marginBottom: 16 }}>
          이런 걸 물어보세요
        </div>
        {[
          { q: '삼성전자 지금 사야 할까?', desc: '시장 환경 + 업종 전망 + 내재가치 + 증권가 목표가까지 종합 분석' },
          { q: '반도체 업종 전망은?', desc: '뉴스, 이벤트, 정책, 유튜브 분석까지 검색해서 업종 전망을 분석해요' },
          { q: '삼성전자 vs SK하이닉스', desc: '재무 + 해자 + 증권가 목표가를 나란히 비교해요' },
          { q: '현대차 어때?', desc: 'DART 재무제표 + 실시간 시세 기반 내재가치 분석' },
          { q: 'LG에너지솔루션 위험한 거 없어?', desc: '레드플래그 + 최신 뉴스 기반 리스크 체크' },
        ].map((item, i) => (
          <div key={i} className="touch-press" onClick={() => {
            openChat()
          }} style={{
            padding: '14px 0', cursor: 'pointer',
            borderBottom: i < 3 ? `1px solid ${sep}` : 'none',
          }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, marginBottom: 3 }}>
              "{item.q}"
            </div>
            <div style={{ fontSize: 13, color: colors.textMuted }}>
              {item.desc}
            </div>
          </div>
        ))}
      </div>

      {/* 구분 */}
      <div style={{ height: 8, background: dimBg }} />

      {/* 분석 항목 */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: colors.textPrimary, marginBottom: 16 }}>
          6가지 관점으로 분석해요
        </div>
        {[
          { title: '내재가치', desc: 'Owner Earnings + DCF로 적정 주가를 계산해요' },
          { title: '경제적 해자', desc: '이익률 지속력으로 경쟁우위를 판별해요' },
          { title: '재무 건전성', desc: '부채비율, 유동비율, FCF를 종합 진단해요' },
          { title: '자본 배분', desc: '배당수익률과 재투자 효율을 평가해요' },
          { title: '경영진 품질', desc: '최대주주 지분율과 지배구조를 분석해요' },
          { title: '레드플래그', desc: '영업적자, OCF 음수, 부채 급증 등을 감지해요' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 0',
            borderBottom: i < 5 ? `1px solid ${sep}` : 'none',
          }}>
            <span style={{
              fontSize: 11, fontWeight: 700, fontFamily: FONTS.mono,
              color: PREMIUM.accent, minWidth: 20, marginTop: 2,
            }}>{String(i + 1).padStart(2, '0')}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: colors.textMuted }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 구분 */}
      <div style={{ height: 8, background: dimBg }} />

      {/* 데이터 출처 */}
      <div style={{ padding: '24px 20px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: colors.textPrimary, marginBottom: 16 }}>
          데이터 출처
        </div>
        {[
          { label: 'DART', desc: '금감원 공식 공시' },
          { label: '키움증권', desc: '실시간 시세' },
          { label: '재무제표', desc: '3개년 CFS 분석' },
          { label: 'AI Agent', desc: 'AI 추론 + 웹 검색' },
        ].map((item, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '12px 0',
            borderTop: i > 0 ? `1px solid ${sep}` : 'none',
          }}>
            <span style={{ fontSize: 14, color: colors.textMuted }}>{item.label}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{item.desc}</span>
          </div>
        ))}
      </div>

      {/* 면책 */}
      <div style={{ padding: '16px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6 }}>
          본 AI는 투자 참고 정보를 제공하며 투자 권유가 아닙니다.
          <br />최종 투자 결정은 투자자 본인의 판단과 책임 하에 이루어져야 합니다.
        </p>
      </div>
    </div>
  )
}

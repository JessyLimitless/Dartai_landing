import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const BookIcons = {
  signal: (color) => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  ),
  philosophy: (color) => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  ),
  quant: (color) => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 16l4-8 4 4 4-10" />
    </svg>
  ),
  math: (color) => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h6v6H4z" /><path d="M14 4h6v6h-6z" /><path d="M4 14h6v6H4z" />
      <circle cx="17" cy="17" r="3" />
      <path d="M7 4v6" /><path d="M4 7h6" /><path d="M17 4v6" /><path d="M14 7h6" />
    </svg>
  ),
}

const MAIN_BOOK = {
  id: 'dart-signal-advanced',
  title: '전자공시 시그널',
  subtitle: 'Advanced Guide',
  url: 'https://jessylimitless.github.io/dartbookhigh/',
  color: '#1E293B',
  accentColor: '#DC2626',
  iconKey: 'signal',
  description: 'DART 공시에서 숨겨진 투자 시그널을 포착하는 고급 전략서. S/A/D 등급 시스템, Hidden Alpha 5개 카테고리, 5초 판단 플로우차트까지.',
  tags: ['공시분석', 'S등급', '실전', '고급'],
  level: '핵심',
}

const SUB_BOOKS = [
  {
    id: 'kostolany',
    title: '코스톨라니',
    subtitle: 'Investment Philosophy',
    url: 'https://jessylimitless.github.io/Kostolanypil/',
    accentColor: '#D97706',
    iconKey: 'philosophy',
    description: '20세기 최고의 투기가 코스톨라니의 투자 원칙과 시장 심리 해부',
    tags: ['투자철학', '심리'],
    level: '교양',
  },
  {
    id: 'data-quant',
    title: '데이터 퀀트',
    subtitle: 'Quantitative Investing',
    url: 'https://jessylimitless.github.io/dataquent/',
    accentColor: '#2563EB',
    iconKey: 'quant',
    description: '팩터 투자를 한국 시장에 맞춰 설명. 백테스팅부터 멀티팩터 조합까지',
    tags: ['퀀트', '데이터'],
    level: '중급',
  },
  {
    id: 'ai-math',
    title: 'AI 핵심원리',
    subtitle: 'Mathematics of AI',
    url: 'https://jessylimitless.github.io/mathplay/',
    accentColor: '#7C3AED',
    iconKey: 'math',
    description: 'AI 패러다임 위의 증시를 이해하기 위한 인공지능 수학적 원리',
    tags: ['AI', '수학'],
    level: '심화',
  },
]

export default function LibraryPage() {
  const { dark, colors } = useTheme()
  const lineSep = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  return (
    <div style={{
      fontFamily: FONTS.body,
      minHeight: '100vh',
      background: colors.bgPrimary,
      padding: 'clamp(32px, 6vh, 64px) clamp(16px, 4vw, 48px)',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
    }}>
      {/* 헤더 */}
      <header style={{ maxWidth: 640, margin: '0 auto 40px' }}>
        <div style={{
          fontSize: 12, fontFamily: FONTS.mono, fontWeight: 600,
          color: colors.textMuted, letterSpacing: 3, textTransform: 'uppercase',
          marginBottom: 8,
        }}>Library</div>
        <h1 style={{
          fontFamily: FONTS.serif, fontSize: 'clamp(24px, 4vw, 32px)',
          fontWeight: 800, color: colors.textPrimary, margin: 0, letterSpacing: -0.5,
        }}>
          DART Insight <span style={{ color: PREMIUM.accent }}>서재</span>
        </h1>
        <p style={{ fontSize: 14, color: colors.textMuted, margin: '6px 0 0', lineHeight: 1.5 }}>
          공시 분석부터 AI 원리까지, 투자 인텔리전스를 위한 큐레이션
        </p>
      </header>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        {/* ── 메인 북 (전자공시 시그널) ── */}
        <MainBookCard book={MAIN_BOOK} dark={dark} colors={colors} />

        {/* ── 구분선 ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          margin: '32px 0 24px',
        }}>
          <div style={{ flex: 1, height: 1, background: lineSep }} />
          <span style={{ fontSize: 12, color: colors.textMuted, fontWeight: 600, flexShrink: 0 }}>
            함께 읽으면 좋은 책
          </span>
          <div style={{ flex: 1, height: 1, background: lineSep }} />
        </div>

        {/* ── 서브 북 리스트 ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {SUB_BOOKS.map((book, i) => (
            <SubBookCard key={book.id} book={book} index={i} dark={dark} colors={colors} />
          ))}
        </div>
      </div>

      {/* 푸터 */}
      <footer style={{
        maxWidth: 640, margin: '48px auto 0', textAlign: 'center',
      }}>
        <p style={{
          fontFamily: FONTS.mono, fontSize: 11,
          color: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
          letterSpacing: 2, textTransform: 'uppercase',
        }}>
          Curated by DART Insight
        </p>
      </footer>
    </div>
  )
}


// ══ 메인 북 카드 (크게) ══
function MainBookCard({ book, dark, colors }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div className="touch-press"
      onClick={() => window.open(book.url, '_blank', 'noopener')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer', borderRadius: 16, overflow: 'hidden',
        background: `linear-gradient(145deg, ${book.color}, ${adjustBrightness(book.color, 20)})`,
        boxShadow: hovered
          ? `0 16px 48px rgba(220,38,38,${dark ? 0.3 : 0.15})`
          : `0 8px 32px rgba(0,0,0,${dark ? 0.3 : 0.1})`,
        transform: hovered ? 'translateY(-4px)' : 'none',
        transition: 'all 0.25s ease',
        position: 'relative',
      }}>
      {/* 악센트 탑 바 */}
      <div style={{ height: 3, background: book.accentColor }} />

      <div style={{ padding: '28px 28px 24px' }}>
        {/* 레벨 배지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 4,
            background: book.accentColor, color: '#fff', letterSpacing: '0.05em',
          }}>{book.level}</span>
          <span style={{
            fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: FONTS.mono,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>{book.subtitle}</span>
        </div>

        {/* 아이콘 + 제목 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{ opacity: 0.8 }}>
            {BookIcons[book.iconKey]?.(book.accentColor)}
          </div>
          <h2 style={{
            fontFamily: FONTS.serif, fontSize: 26, fontWeight: 800,
            color: '#FFFFFF', margin: 0, letterSpacing: -0.5,
          }}>{book.title}</h2>
        </div>

        {/* 설명 */}
        <p style={{
          fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7,
          margin: '0 0 16px',
        }}>{book.description}</p>

        {/* 태그 + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {book.tags.map(tag => (
              <span key={tag} style={{
                fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                padding: '3px 10px', borderRadius: 100,
              }}>{tag}</span>
            ))}
          </div>
          <span style={{
            fontSize: 13, fontWeight: 600, color: book.accentColor,
            display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
          }}>
            읽기
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}


// ══ 서브 북 카드 (컴팩트) ══
function SubBookCard({ book, index, dark, colors }) {
  const [hovered, setHovered] = useState(false)
  const lineSep = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  return (
    <div className="touch-press"
      onClick={() => window.open(book.url, '_blank', 'noopener')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        cursor: 'pointer', borderRadius: 14, overflow: 'hidden',
        background: dark ? '#141416' : '#FFFFFF',
        border: `1px solid ${lineSep}`,
        display: 'flex', alignItems: 'center', gap: 16,
        padding: '16px 20px',
        boxShadow: hovered ? `0 4px 16px rgba(0,0,0,${dark ? 0.3 : 0.08})` : 'none',
        transform: hovered ? 'translateX(4px)' : 'none',
        transition: 'all 0.2s ease',
      }}>
      {/* 아이콘 */}
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {BookIcons[book.iconKey]?.(book.accentColor)}
      </div>

      {/* 제목 + 설명 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{
            fontSize: 16, fontWeight: 700, color: colors.textPrimary,
            fontFamily: FONTS.serif,
          }}>{book.title}</span>
          <span style={{
            fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
            background: `${book.accentColor}18`, color: book.accentColor,
          }}>{book.level}</span>
        </div>
        <div style={{
          fontSize: 13, color: colors.textMuted, lineHeight: 1.4,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{book.description}</div>
      </div>

      {/* 화살표 */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round"
        style={{ flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  )
}


function adjustBrightness(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xFF) + amount))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

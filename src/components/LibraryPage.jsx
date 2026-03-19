import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

// SVG 아이콘 (세련된 라인 아이콘)
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

const BOOKS = [
  {
    id: 'dart-signal-advanced',
    title: '전자공시 시그널',
    subtitle: 'Advanced Guide',
    url: 'https://jessylimitless.github.io/dartbookhigh/',
    color: '#1E293B',
    accentColor: '#DC2626',
    iconKey: 'signal',
    description: 'DART 공시에서 숨겨진 투자 시그널을 포착하는 고급 전략서',
    tags: ['공시분석', 'S등급', '실전'],
  },
  {
    id: 'kostolany',
    title: '코스톨라니',
    subtitle: 'Investment Philosophy',
    url: 'https://jessylimitless.github.io/Kostolanypil/',
    color: '#1C1917',
    accentColor: '#D97706',
    iconKey: 'philosophy',
    description: '20세기 최고의 투기가 앙드레 코스톨라니의 투자 원칙과 시장 심리',
    tags: ['투자철학', '거장', '심리'],
  },
  {
    id: 'data-quant',
    title: '데이터 퀀트',
    subtitle: 'Quantitative Investing',
    url: 'https://jessylimitless.github.io/dataquent/',
    color: '#0F172A',
    accentColor: '#2563EB',
    iconKey: 'quant',
    description: '데이터 기반의 체계적인 퀀트 투자, 처음 시작하는 분을 위한 입문서',
    tags: ['퀀트', '데이터', '입문'],
  },
  {
    id: 'ai-math',
    title: 'AI 핵심원리',
    subtitle: 'Mathematics of AI',
    url: 'https://jessylimitless.github.io/mathplay/',
    color: '#170F2E',
    accentColor: '#7C3AED',
    iconKey: 'math',
    description: '인공지능을 움직이는 핵심 수학적 원리와 알고리즘의 정수',
    tags: ['수학', '알고리즘', 'AI원리'],
  },
]

function BookCard({ book, index, dark, isActive, onHover }) {
  const [visible, setVisible] = useState(false)
  const [opening, setOpening] = useState(false)
  const hovered = isActive

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 120 * index)
    return () => clearTimeout(timer)
  }, [index])

  const handleOpen = () => {
    setOpening(true)
    window.open(book.url, '_blank', 'noopener')
    setTimeout(() => setOpening(false), 2000)
  }

  const spineWidth = 44
  const coverBg = dark
    ? `linear-gradient(145deg, ${book.color} 0%, ${adjustBrightness(book.color, 20)} 100%)`
    : `linear-gradient(145deg, ${book.color} 0%, ${adjustBrightness(book.color, 30)} 100%)`

  const dimmed = isActive === false

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(e) => { if (e.key === 'Enter') handleOpen() }}
      onMouseEnter={() => onHover?.(book.id)}
      onMouseLeave={() => onHover?.(null)}
      style={{
        cursor: 'pointer',
        opacity: visible ? (dimmed ? 0.5 : 1) : 0,
        transform: visible
          ? hovered
            ? 'perspective(800px) rotateY(0deg) translateY(-16px) scale(1.06)'
            : dimmed
              ? 'perspective(800px) rotateY(-5deg) scale(0.97)'
              : 'perspective(800px) rotateY(-5deg) translateY(0px)'
          : 'perspective(800px) rotateY(-8deg) translateY(20px)',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        transformOrigin: 'left center',
        display: 'flex',
        borderRadius: 6,
        overflow: 'hidden',
        boxShadow: hovered
          ? `12px 24px 48px rgba(0,0,0,${dark ? 0.7 : 0.3}), 4px 8px 16px rgba(0,0,0,${dark ? 0.5 : 0.2})`
          : `4px 8px 24px rgba(0,0,0,${dark ? 0.4 : 0.15}), 1px 2px 8px rgba(0,0,0,${dark ? 0.3 : 0.08})`,
        minHeight: 260,
        outline: 'none',
        zIndex: hovered ? 10 : 1,
        filter: dimmed ? 'brightness(0.7)' : 'none',
        position: 'relative',
      }}
    >
      {/* 로딩 오버레이 */}
      {opening && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 5,
          background: 'rgba(0,0,0,0.5)', borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 24, height: 24, border: '2px solid rgba(255,255,255,0.2)',
            borderTopColor: '#fff', borderRadius: '50%',
            animation: 'sp .8s linear infinite',
          }} />
        </div>
      )}
      {/* Spine */}
      <div style={{
        width: spineWidth,
        minWidth: spineWidth,
        background: `linear-gradient(180deg, ${book.accentColor} 0%, ${book.color} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Spine texture lines */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(255,255,255,0.03) 8px, rgba(255,255,255,0.03) 9px)',
        }} />
        <span style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          color: 'rgba(255,255,255,0.9)',
          fontFamily: FONTS.serif,
          fontWeight: 700,
          fontSize: 13,
          letterSpacing: 3,
          whiteSpace: 'nowrap',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          position: 'relative',
        }}>
          {book.title}
        </span>
      </div>

      {/* Cover */}
      <div style={{
        flex: 1,
        background: coverBg,
        padding: '28px 24px 20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle cover texture */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        {/* Accent stripe */}
        <div style={{
          position: 'absolute', top: 0, right: 0,
          width: 4, height: '100%',
          background: book.accentColor,
          opacity: 0.7,
        }} />

        {/* Icon */}
        <div style={{
          marginBottom: 16,
          opacity: hovered ? 1 : 0.7,
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'all 0.3s ease',
          position: 'relative',
        }}>
          {BookIcons[book.iconKey]?.(book.accentColor)}
        </div>

        {/* Title */}
        <h3 style={{
          fontFamily: FONTS.serif,
          fontWeight: 700,
          fontSize: 22,
          color: '#FFFFFF',
          margin: 0,
          lineHeight: 1.3,
          letterSpacing: -0.3,
          position: 'relative',
        }}>
          {book.title}
        </h3>

        {/* Subtitle */}
        <p style={{
          fontFamily: FONTS.body,
          fontSize: 13,
          color: 'rgba(255,255,255,0.6)',
          margin: '6px 0 0',
          fontWeight: 500,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
          position: 'relative',
        }}>
          {book.subtitle}
        </p>

        {/* Divider */}
        <div style={{
          width: 32, height: 2,
          background: book.accentColor,
          margin: '14px 0 12px',
          borderRadius: 1,
          opacity: 0.8,
          position: 'relative',
        }} />

        {/* Description */}
        <p style={{
          fontFamily: FONTS.body,
          fontSize: 13,
          color: 'rgba(255,255,255,0.55)',
          margin: 0,
          lineHeight: 1.6,
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {book.description}
        </p>

        {/* Tags */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginTop: 16,
          position: 'relative',
        }}>
          {book.tags.map((tag) => (
            <span key={tag} style={{
              fontSize: 11,
              fontFamily: FONTS.body,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.75)',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '3px 10px',
              borderRadius: 100,
              whiteSpace: 'nowrap',
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function ShelfLine({ dark }) {
  return (
    <div style={{
      height: 10,
      margin: '0 8px',
      borderRadius: '0 0 6px 6px',
      background: dark
        ? 'linear-gradient(180deg, #2A221A 0%, #1A150F 40%, #0F0C08 100%)'
        : 'linear-gradient(180deg, #C4A882 0%, #A8896A 40%, #8B7355 100%)',
      boxShadow: dark
        ? '0 4px 12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
        : '0 4px 12px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.3)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Wood grain texture */}
      <div style={{
        position: 'absolute', inset: 0,
        background: dark
          ? 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.02) 40px, rgba(255,255,255,0.02) 42px)'
          : 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0,0,0,0.04) 40px, rgba(0,0,0,0.04) 42px)',
      }} />
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

export default function LibraryPage() {
  const { dark, colors } = useTheme()
  const [hoveredId, setHoveredId] = useState(null)

  const topRow = BOOKS.slice(0, 2)
  const bottomRow = BOOKS.slice(2, 4)

  return (
    <div style={{
      fontFamily: FONTS.body,
      minHeight: '100vh',
      background: dark
        ? 'linear-gradient(180deg, #09090B 0%, #0F0F12 100%)'
        : 'linear-gradient(180deg, #FAFAFA 0%, #F4F4F5 100%)',
      padding: 'clamp(32px, 6vh, 64px) clamp(16px, 4vw, 48px)',
    }}>
      {/* Header */}
      <header style={{
        maxWidth: 820,
        margin: '0 auto 48px',
        textAlign: 'center',
      }}>
        {/* Bookshelf icon */}
        <div style={{
          fontSize: 14,
          fontFamily: FONTS.mono,
          fontWeight: 600,
          color: colors.textMuted,
          letterSpacing: 3,
          textTransform: 'uppercase',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
            <path d="M8 7h8" />
            <path d="M8 11h6" />
          </svg>
          Library
        </div>

        <h1 style={{
          fontFamily: FONTS.serif,
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 700,
          color: colors.textPrimary,
          margin: '0 0 8px',
          letterSpacing: -0.5,
        }}>
          DART Insight <span style={{ color: PREMIUM.accent }}>Library</span>
        </h1>

        <p style={{
          fontFamily: FONTS.body,
          fontSize: 15,
          color: colors.textMuted,
          margin: 0,
          lineHeight: 1.6,
        }}>
          DART Insight 큐레이션 서재
        </p>

        {/* Decorative line */}
        <div style={{
          width: 48, height: 2,
          background: dark
            ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(0,0,0,0.12), transparent)',
          margin: '20px auto 0',
          borderRadius: 1,
        }} />
      </header>

      {/* Bookshelf */}
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        {/* Row 1 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 28,
          marginBottom: 4,
        }}>
          {topRow.map((book, i) => (
            <BookCard key={book.id} book={book} index={i} dark={dark}
              isActive={hoveredId === null ? undefined : hoveredId === book.id}
              onHover={setHoveredId} />
          ))}
        </div>
        <ShelfLine dark={dark} />

        {/* Row 2 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 28,
          marginTop: 36,
          marginBottom: 4,
        }}>
          {bottomRow.map((book, i) => (
            <BookCard key={book.id} book={book} index={i + 2} dark={dark}
              isActive={hoveredId === null ? undefined : hoveredId === book.id}
              onHover={setHoveredId} />
          ))}
        </div>
        <ShelfLine dark={dark} />
      </div>

      {/* Watermark */}
      <footer style={{
        maxWidth: 820,
        margin: '56px auto 0',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: FONTS.mono,
          fontSize: 11,
          color: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
          letterSpacing: 2,
          textTransform: 'uppercase',
          margin: 0,
        }}>
          Curated by DART Insight
        </p>
      </footer>
    </div>
  )
}

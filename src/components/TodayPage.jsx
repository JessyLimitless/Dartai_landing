import React, { useState } from 'react'
import EmptyState from './EmptyState'
import FeedSkeleton from './skeletons/FeedSkeleton'
import DisclosureModal from './DisclosureModal'
import { useDisclosures } from '../hooks/useDisclosures'
import { FONTS, GRADE_COLORS, MARKET_LABELS } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'

export default function TodayPage({ onViewCard }) {
  const { colors, dark } = useTheme()
  const [modalRceptNo, setModalRceptNo] = useState(null)

  const now = new Date()
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const dateStr = `${now.getMonth() + 1}월 ${now.getDate()}일 ${dayNames[now.getDay()]}요일`

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px', fontFamily: FONTS.body }}>

      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontFamily: FONTS.serif, fontSize: 20, fontWeight: 700, color: colors.textPrimary }}>
          Today
        </span>
        <span style={{ fontSize: 13, color: colors.textMuted, marginLeft: 10 }}>{dateStr}</span>
      </div>

      <FeedTab onViewCard={onViewCard} onOpenModal={setModalRceptNo} />

      {modalRceptNo && (
        <DisclosureModal
          rcept_no={modalRceptNo}
          onClose={() => setModalRceptNo(null)}
          onViewCard={onViewCard}
        />
      )}
    </div>
  )
}

function FeedTab({ onViewCard, onOpenModal }) {
  const { colors, dark } = useTheme()
  const {
    disclosures, counts, loading,
    gradeFilter, setGradeFilter,
    search, setSearch,
    prices,
  } = useDisclosures()

  return (
    <>
      {/* 등급 필터 */}
      {!loading && counts.total > 0 && (
        <GradeFilter counts={counts} gradeFilter={gradeFilter} setGradeFilter={setGradeFilter} colors={colors} dark={dark} />
      )}

      {/* 검색 */}
      <SearchBar search={search} setSearch={setSearch} colors={colors} dark={dark} />

      {/* 피드 */}
      <div style={{
        background: dark ? '#18181B' : '#fff',
        border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 16 }}><FeedSkeleton /></div>
        ) : disclosures.length === 0 ? (
          (gradeFilter || search) ? (
            <EmptyState
              icon="search"
              title="조건에 맞는 공시가 없습니다"
              description={`${gradeFilter ? `등급: ${gradeFilter}` : ''}${gradeFilter && search ? ' · ' : ''}${search ? `"${search}"` : ''}`}
              action="초기화"
              onAction={() => { setGradeFilter(null); setSearch('') }}
            />
          ) : (
            <EmptyState
              icon="calendar"
              title="오늘 수집된 공시가 없습니다"
              description="장 운영 시간(09:00~18:00)에 자동으로 수집됩니다"
            />
          )
        ) : (
          disclosures.map((d, i) => (
            <FeedRow
              key={d.rcept_no}
              d={d}
              isLast={i === disclosures.length - 1}
              onOpenModal={onOpenModal}
              colors={colors}
              dark={dark}
              priceData={prices[d.stock_code]}
            />
          ))
        )}
      </div>
    </>
  )
}

function GradeFilter({ counts, gradeFilter, setGradeFilter, colors, dark }) {
  const grades = [
    { key: 'S', color: GRADE_COLORS.S.bg, count: counts.S || 0 },
    { key: 'A', color: GRADE_COLORS.A.bg, count: counts.A || 0 },
    { key: 'D', color: GRADE_COLORS.D.bg, count: counts.D || 0 },
  ].filter(g => g.count > 0)

  if (grades.length === 0) return null

  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
      {grades.map(g => {
        const active = gradeFilter === g.key
        return (
          <button
            key={g.key}
            onClick={() => setGradeFilter(active ? null : g.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 20,
              border: active ? `1.5px solid ${g.color}` : `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
              background: active ? `${g.color}18` : 'transparent',
              cursor: 'pointer', transition: 'all 0.15s',
              fontSize: 12, fontWeight: active ? 600 : 400,
              color: active ? g.color : colors.textSecondary,
            }}
          >
            <span style={{
              fontFamily: FONTS.mono, fontWeight: 800, fontSize: 11,
              color: active ? g.color : colors.textMuted,
            }}>{g.key}</span>
            <span style={{
              fontFamily: FONTS.mono, fontSize: 12,
              color: active ? g.color : colors.textMuted,
            }}>{g.count}</span>
          </button>
        )
      })}
      {gradeFilter && (
        <button
          onClick={() => setGradeFilter(null)}
          style={{
            padding: '5px 10px', borderRadius: 20, border: 'none',
            background: 'transparent', cursor: 'pointer',
            fontSize: 11, color: colors.textMuted,
          }}
        >
          전체 보기
        </button>
      )}
    </div>
  )
}

function SearchBar({ search, setSearch, colors, dark }) {
  const [val, setVal] = useState(search)
  const [focused, setFocused] = useState(false)

  return (
    <form
      onSubmit={e => { e.preventDefault(); setSearch(val) }}
      style={{ marginBottom: 12 }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 12px', borderRadius: 10,
        border: `1px solid ${focused ? '#0D9488' : (dark ? '#27272A' : '#E4E4E7')}`,
        background: dark ? '#18181B' : '#FAFAFA',
        transition: 'border-color 0.15s',
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="기업명 또는 공시 검색..."
          value={val}
          onChange={e => setVal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setSearch(val) }}
          style={{
            flex: 1, padding: '10px 6px', fontSize: 13,
            border: 'none', background: 'transparent',
            color: colors.textPrimary, outline: 'none',
          }}
        />
        {val && (
          <button
            type="button"
            onClick={() => { setVal(''); setSearch('') }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: colors.textMuted, padding: '4px', lineHeight: 1,
              fontSize: 14,
            }}
          >✕</button>
        )}
      </div>
    </form>
  )
}

function FeedRow({ d, isLast, onOpenModal, colors, dark, priceData }) {
  const gc = GRADE_COLORS[d.grade] || { bg: '#94A3B8', color: '#fff' }
  const market = MARKET_LABELS[d.corp_cls] || ''
  const changePct = priceData?.change_pct
  const price = priceData?.price
  const hasPrice = price != null && price > 0
  const isUp = changePct > 0
  const isDown = changePct < 0
  const priceColor = isUp ? '#E8364E' : isDown ? '#3B82F6' : colors.textMuted

  return (
    <div
      onClick={() => onOpenModal?.(d.rcept_no)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 16px', cursor: 'pointer',
        borderBottom: isLast ? 'none' : `1px solid ${dark ? '#27272A' : '#F4F4F5'}`,
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.03)' : '#F9FAFB'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* 등급 배지 */}
      <span style={{
        flexShrink: 0,
        background: gc.bg, color: gc.color,
        fontSize: 10, fontWeight: 800,
        padding: '2px 7px', borderRadius: 5,
        fontFamily: FONTS.mono, letterSpacing: '0.05em',
        minWidth: 24, textAlign: 'center',
      }}>{d.grade}</span>

      {/* 내용 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span
            style={{
              fontWeight: 600, fontSize: 14, color: dark ? '#FAFAFA' : '#18181B',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {d.corp_name}
          </span>
          {market && (
            <span style={{
              fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3,
              background: dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
              color: colors.textMuted, flexShrink: 0,
            }}>{market}</span>
          )}
        </div>
        <div style={{
          fontSize: 11, color: colors.textMuted,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {d.report_nm}
        </div>
      </div>

      {/* 시세 */}
      {hasPrice ? (
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{
            fontSize: 13, fontWeight: 700, fontFamily: FONTS.mono,
            color: priceColor,
          }}>
            {changePct > 0 ? '+' : ''}{changePct?.toFixed(2)}%
          </div>
          <div style={{
            fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono,
          }}>
            {price?.toLocaleString()}원
          </div>
        </div>
      ) : d.stock_code ? (
        <span style={{
          flexShrink: 0, fontSize: 10, color: colors.textMuted,
          fontFamily: FONTS.mono, opacity: 0.4,
        }}>
          {d.stock_code}
        </span>
      ) : null}

      {/* 공시 보기 화살표 */}
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, opacity: 0.4 }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  )
}

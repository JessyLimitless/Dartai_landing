import React, { useState } from 'react'
import GradeBadge from './GradeBadge'
import FeedSkeleton from './skeletons/FeedSkeleton'
import DetailPanelSkeleton from './skeletons/DetailPanelSkeleton'
import { useDisclosures } from '../hooks/useDisclosures'
import { GRADE_COLORS, MARKET_LABELS, FONTS, PREMIUM } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'

const GRADE_TABS = ['ALL', 'S', 'A', 'D']

export default function DisclosureFeed({ onViewCard }) {
  const { colors } = useTheme()
  const {
    disclosures, counts, loading, gradeFilter, setGradeFilter,
    search, setSearch, detail, detailLoading, fetchDetail,
    selectedRceptNo, setSelectedRceptNo,
  } = useDisclosures()

  const [searchInput, setSearchInput] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  return (
    <div className="feed-layout" style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Left: Filing List */}
      <div className="feed-list" style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${colors.border}` }}>
        {/* Filter Bar */}
        <div style={{ padding: '16px 20px 12px', borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.bgCard }}>
          {/* Grade Filter */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
            {GRADE_TABS.map((g) => {
              const isActive = (g === 'ALL' && !gradeFilter) || gradeFilter === g
              const count = g === 'ALL' ? counts.total : (counts[g] || 0)
              const gradeColor = g !== 'ALL' && GRADE_COLORS[g] ? GRADE_COLORS[g].bg : PREMIUM.accent
              return (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g === 'ALL' ? null : g)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    border: isActive ? 'none' : `1px solid ${colors.border}`,
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: isActive ? 600 : 500,
                    backgroundColor: isActive ? (g === 'ALL' ? PREMIUM.accent : gradeColor) : colors.bgCard,
                    color: isActive ? '#fff' : colors.textSecondary,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {g}
                  <span style={{
                    fontSize: '10px',
                    opacity: 0.8,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : colors.borderLight,
                    padding: '1px 5px',
                    borderRadius: '6px',
                  }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by company or filing name..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: `1px solid ${colors.border}`,
                fontSize: '13px',
                outline: 'none',
                fontFamily: FONTS.body,
                backgroundColor: colors.bgCard,
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = PREMIUM.accent}
              onBlur={(e) => e.target.style.borderColor = colors.border}
            />
            <button
              type="submit"
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: PREMIUM.accent,
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.opacity = '0.9'}
              onMouseLeave={(e) => e.target.style.opacity = '1'}
            >
              Search
            </button>
          </form>
        </div>

        {/* Filing List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <FeedSkeleton />
          ) : disclosures.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted }}>
              No disclosure data available
            </div>
          ) : (
            disclosures.map((d, i) => (
              <DisclosureRow
                key={d.rcept_no}
                disclosure={d}
                isSelected={selectedRceptNo === d.rcept_no}
                onClick={() => fetchDetail(d.rcept_no)}
                delay={i * 20}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: Detail Panel */}
      <DetailPanel
        detail={detail}
        loading={detailLoading}
        selectedRceptNo={selectedRceptNo}
        onClose={() => setSelectedRceptNo(null)}
        onViewCard={onViewCard}
      />
    </div>
  )
}


function DisclosureRow({ disclosure, isSelected, onClick, delay }) {
  const { colors } = useTheme()
  const d = disclosure
  const market = MARKET_LABELS[d.corp_cls] || ''
  const timeStr = d.created_at ? d.created_at.substring(11, 16) : ''

  return (
    <div
      onClick={onClick}
      className="animate-fade-in"
      style={{
        padding: '12px 20px',
        borderBottom: `1px solid ${colors.borderLight}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        backgroundColor: isSelected ? PREMIUM.accentLight : colors.bgCard,
        borderLeft: isSelected ? `3px solid ${PREMIUM.accent}` : '3px solid transparent',
        transition: 'all 0.2s ease',
        animationDelay: `${delay}ms`,
        animationFillMode: 'backwards',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = colors.bgPrimary
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = colors.bgCard
      }}
    >
      <GradeBadge grade={d.grade} size="lg" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
          <span style={{ fontWeight: 600, fontSize: '14px', color: colors.textPrimary }}>
            {d.corp_name}
          </span>
          {market && (
            <span style={{
              fontSize: '10px',
              color: colors.textMuted,
              backgroundColor: colors.borderLight,
              padding: '1px 5px',
              borderRadius: '3px',
            }}>
              {market}
            </span>
          )}
        </div>
        <div style={{
          fontSize: '12px',
          color: colors.textSecondary,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {d.report_nm}
        </div>
        {d.ai_summary && (
          <div style={{
            fontSize: '11px',
            color: colors.textMuted,
            marginTop: '4px',
            lineHeight: '1.5',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {d.ai_summary.replace(/\*\*/g, '').split('\n')[0].slice(0, 120)}
          </div>
        )}
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: FONTS.mono }}>
          {timeStr}
        </div>
        {d.stock_code && (
          <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono }}>
            {d.stock_code}
          </div>
        )}
      </div>
    </div>
  )
}


function DetailPanel({ detail, loading, selectedRceptNo, onClose, onViewCard }) {
  const { colors } = useTheme()
  if (!selectedRceptNo) {
    return (
      <div
        className="detail-panel detail-panel-empty"
        style={{
          width: '420px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
          fontSize: '13px',
          backgroundColor: colors.bgPrimary,
        }}
      >
        Select a filing to view details
      </div>
    )
  }

  if (loading) {
    return (
      <div
        className="detail-panel"
        style={{
          width: '420px',
          flexShrink: 0,
          overflowY: 'auto',
          backgroundColor: colors.bgCard,
          borderLeft: `1px solid ${colors.border}`,
        }}
      >
        <DetailPanelSkeleton />
      </div>
    )
  }

  if (!detail) {
    return (
      <div
        className="detail-panel"
        style={{
          width: '420px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.textMuted,
          backgroundColor: colors.bgPrimary,
        }}
      >
        Unable to load detail information
      </div>
    )
  }

  const rawData = detail.raw_data || {}
  const rawEntries = Object.entries(rawData).filter(([k]) => k !== 'rcept_no' && k !== 'corp_code')

  return (
    <div
      className="detail-panel animate-slide-in"
      style={{
        width: '420px',
        flexShrink: 0,
        overflowY: 'auto',
        backgroundColor: colors.bgCard,
        borderLeft: `1px solid ${colors.border}`,
      }}
    >
      {/* Mobile back button */}
      <button className="detail-back-btn" onClick={onClose}>
        &larr; Back to list
      </button>

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GradeBadge grade={detail.grade} size="lg" />
            <span style={{ fontWeight: 700, fontSize: '16px', fontFamily: FONTS.serif }}>{detail.corp_name}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '18px', color: colors.textMuted, padding: '4px',
            }}
          >
            &times;
          </button>
        </div>
        <div style={{ fontSize: '13px', color: colors.textSecondary, lineHeight: '1.5' }}>
          {detail.report_nm}
        </div>
        <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: '4px', fontFamily: FONTS.mono }}>
          {detail.stock_code} &middot; {detail.created_at?.substring(0, 16)}
        </div>
      </div>

      {/* Parsed Data */}
      {rawEntries.length > 0 && (
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{
            fontSize: '13px', fontWeight: 700, color: colors.textPrimary, marginBottom: '10px',
            fontFamily: FONTS.serif, display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ display: 'inline-block', width: '3px', height: '14px', background: PREMIUM.accent, borderRadius: '2px' }} />
            Parsed Data
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {rawEntries.map(([key, val]) => (
              <div key={key} style={{
                padding: '8px 10px',
                backgroundColor: colors.bgPrimary,
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '10px', color: colors.textMuted, marginBottom: '2px' }}>{key}</div>
                <div style={{ fontSize: '13px', fontWeight: 500, fontFamily: typeof val === 'number' ? FONTS.mono : FONTS.body }}>
                  {typeof val === 'number' ? val.toLocaleString() : String(val ?? '-')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary */}
      {detail.ai_summary && (
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
          <div style={{
            fontSize: '13px', fontWeight: 700, color: colors.textPrimary, marginBottom: '10px',
            fontFamily: FONTS.serif, display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            <span style={{ display: 'inline-block', width: '3px', height: '14px', background: PREMIUM.accent, borderRadius: '2px' }} />
            AI Summary
          </div>
          <div style={{ fontSize: '13px', lineHeight: '1.7', color: colors.textPrimary, whiteSpace: 'pre-wrap' }}>
            <SimpleMarkdown text={detail.ai_summary} />
          </div>
        </div>
      )}

      {/* View Company Card Button */}
      {detail.corp_code && (
        <div style={{ padding: '16px 20px' }}>
          <button
            onClick={() => onViewCard(detail.corp_code)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: PREMIUM.accent,
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            View Company Card &rarr;
          </button>
        </div>
      )}
    </div>
  )
}


function SimpleMarkdown({ text }) {
  const { colors } = useTheme()
  if (!text) return null

  const lines = text.split('\n')
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/)
    const rendered = parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={j}>{part.slice(2, -2)}</strong>
      }
      return part
    })

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.+)/)
    if (numMatch) {
      return (
        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
          <span style={{ color: PREMIUM.accent, fontFamily: FONTS.mono, fontSize: '12px', flexShrink: 0, fontWeight: 600 }}>
            {numMatch[1]}.
          </span>
          <span>{rendered}</span>
        </div>
      )
    }

    // Bullet
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
          <span style={{ color: PREMIUM.accent }}>•</span>
          <span>{rendered}</span>
        </div>
      )
    }

    return <div key={i} style={{ marginBottom: line.trim() ? '4px' : '8px' }}>{rendered}</div>
  })
}

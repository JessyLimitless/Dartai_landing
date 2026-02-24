import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForeignFlow } from '../hooks/useForeignFlow'
import Skeleton from './Skeleton'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const SUB_TABS = [
  { key: 'foreign', label: '외국인 순매매' },
  { key: 'institutional', label: '기관 순매매' },
]

const PERIODS = [
  { key: 'day', label: '당일' },
  { key: 'week', label: '1주' },
  { key: 'month', label: '1개월' },
]

const PERIOD_LABELS = { day: '당일', week: '1주', month: '1개월' }

export default function FlowDashboard({ onViewCard }) {
  const { colors, dark } = useTheme()
  const navigate = useNavigate()
  const {
    tab, setTab,
    period, setPeriod,
    items, loading,
  } = useForeignFlow()

  const buyItems = items.filter((it) => it.side === 'buy')
  const sellItems = items.filter((it) => it.side === 'sell')

  const handleRowClick = (stockCode) => {
    if (!stockCode) return
    if (onViewCard) onViewCard(stockCode)
    else navigate(`/deep-dive/${stockCode}`)
  }

  const periodLabel = PERIOD_LABELS[period] || period
  const typeLabel = tab === 'foreign' ? '외국인' : '기관'

  return (
    <div className="page-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{
            fontSize: '1.5rem', fontWeight: 700, color: colors.textPrimary,
            fontFamily: FONTS.serif, margin: 0,
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <span style={{ display: 'inline-block', width: '4px', height: '22px', background: PREMIUM.accent, borderRadius: '2px' }} />
            수급 동향
          </h2>
          <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>
            외국인 · 기관 순매매 종목 순위 (기간별)
          </div>
        </div>

        {/* Period dropdown */}
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            padding: '8px 32px 8px 12px',
            borderRadius: '8px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.bgCard,
            color: colors.textPrimary,
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
          }}
        >
          {PERIODS.map((p) => (
            <option key={p.key} value={p.key}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {SUB_TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '8px 20px', borderRadius: '8px',
                border: `1px solid ${active ? PREMIUM.accent : colors.border}`,
                backgroundColor: active ? PREMIUM.accent : colors.bgCard,
                color: active ? '#fff' : colors.textPrimary,
                fontSize: '13px', fontWeight: active ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div>
          {/* 로딩 인디케이터 */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', padding: '32px 0 24px',
          }}>
            <div style={{
              width: '18px', height: '18px', border: `2.5px solid ${colors.border}`,
              borderTopColor: PREMIUM.accent, borderRadius: '50%',
              animation: 'flow-spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: '13px', color: colors.textMuted, fontWeight: 500 }}>
              {typeLabel} 수급 데이터 조회 중...
            </span>
          </div>
          {items.length > 0 ? (
            /* 이전 데이터 흐리게 표시 */
            <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <FlowSection title={`${typeLabel} 순매수 TOP 20 (${periodLabel})`} titleColor={colors.positive} items={buyItems} tab={tab} dark={dark} colors={colors} onRowClick={handleRowClick} />
                <FlowSection title={`${typeLabel} 순매도 TOP 20 (${periodLabel})`} titleColor={colors.negative} items={sellItems} tab={tab} dark={dark} colors={colors} onRowClick={handleRowClick} />
              </div>
            </div>
          ) : (
            <FlowSkeleton />
          )}
        </div>
      ) : items.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: colors.textMuted }}>
          {period === 'day' ? (
            <>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>&#128340;</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: colors.textSecondary, marginBottom: '6px' }}>
                당일 수급은 장 마감 후 집계됩니다
              </div>
              <div style={{ fontSize: '13px' }}>
                15:30 이후 데이터가 갱신됩니다. 1주 · 1개월 데이터를 먼저 확인해 보세요.
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '15px', marginBottom: '8px' }}>데이터 없음</div>
              <div style={{ fontSize: '13px' }}>잠시 후 다시 시도해 주세요</div>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <FlowSection
            title={`${typeLabel} 순매수 TOP 20 (${periodLabel})`}
            titleColor={colors.positive}
            items={buyItems}
            tab={tab}
            dark={dark}
            colors={colors}
            onRowClick={handleRowClick}
          />
          <FlowSection
            title={`${typeLabel} 순매도 TOP 20 (${periodLabel})`}
            titleColor={colors.negative}
            items={sellItems}
            tab={tab}
            dark={dark}
            colors={colors}
            onRowClick={handleRowClick}
          />
        </div>
      )}

      {/* Responsive + spinner CSS */}
      <style>{`
        @keyframes flow-spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 640px) {
          .flow-hide-mobile { display: none !important; }
          .flow-table-header, .flow-table-row {
            grid-template-columns: 40px 1.5fr 1fr 0.7fr !important;
          }
        }
      `}</style>
    </div>
  )
}


function FlowSection({ title, titleColor, items, tab, dark, colors, onRowClick }) {
  if (!items.length) return null
  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: titleColor, marginBottom: '10px' }}>
        {title}
      </div>
      <FlowTable items={items} tab={tab} dark={dark} colors={colors} onRowClick={onRowClick} />
    </div>
  )
}


function FlowTable({ items, tab, dark, colors, onRowClick }) {
  const isForeign = tab === 'foreign'
  const gridCols = isForeign
    ? '50px 1.5fr 1fr 0.6fr 0.7fr'
    : '50px 1.5fr 1fr 0.7fr'

  return (
    <div style={{ borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: PREMIUM.shadowMd }}>
      {/* Header */}
      <div className="flow-table-header" style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        padding: '10px 16px',
        backgroundColor: dark ? '#09090B' : '#18181B',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 600,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ textAlign: 'center' }}>#</div>
        <div>종목명</div>
        <div style={{ textAlign: 'right' }}>순매매수량</div>
        {isForeign && (
          <div className="flow-hide-mobile" style={{ textAlign: 'right' }}>보유비율</div>
        )}
        <div style={{ textAlign: 'right' }}>현재가</div>
      </div>

      {/* Rows */}
      {items.map((item, idx) => (
        <FlowRow
          key={`${item.stock_code}-${idx}`}
          item={item}
          displayRank={idx + 1}
          tab={tab}
          gridCols={gridCols}
          colors={colors}
          onClick={() => onRowClick(item.stock_code)}
        />
      ))}
    </div>
  )
}


function FlowRow({ item, displayRank, tab, gridCols, colors, onClick }) {
  const isForeign = tab === 'foreign'

  return (
    <div
      className="flow-table-row"
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        padding: '10px 16px',
        backgroundColor: colors.bgCard,
        borderTop: `1px solid ${colors.border}`,
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.borderLight}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.bgCard}
    >
      {/* Rank */}
      <div style={{
        textAlign: 'center', fontSize: '13px', fontWeight: 700,
        fontFamily: FONTS.mono,
        color: displayRank <= 3 ? PREMIUM.accent : colors.textSecondary,
      }}>
        {displayRank}
      </div>

      {/* Name */}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>
          {item.stock_name}
        </div>
        <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: FONTS.mono }}>
          {item.stock_code}
        </div>
      </div>

      {/* 순매매수량 */}
      <div style={{
        textAlign: 'right', fontSize: '13px', fontFamily: FONTS.mono, fontWeight: 600,
        color: item.net_buy_qty > 0 ? colors.positive : item.net_buy_qty < 0 ? colors.negative : colors.textMuted,
      }}>
        {formatFlowNumber(item.net_buy_qty)}
      </div>

      {/* 외국인 보유비율 (외국인 탭만) */}
      {isForeign && (
        <div className="flow-hide-mobile" style={{
          textAlign: 'right', fontSize: '12px', fontFamily: FONTS.mono,
          color: colors.textSecondary,
        }}>
          {item.foreign_ratio != null && item.foreign_ratio > 0 ? `${item.foreign_ratio.toFixed(1)}%` : '-'}
        </div>
      )}

      {/* Price */}
      <div style={{
        textAlign: 'right', fontSize: '13px', fontWeight: 600,
        fontFamily: FONTS.mono, color: colors.textPrimary,
      }}>
        {item.price ? Number(item.price).toLocaleString() : '-'}
      </div>
    </div>
  )
}


function formatFlowNumber(num) {
  if (num == null) return '-'
  const abs = Math.abs(num)
  const sign = num > 0 ? '+' : num < 0 ? '-' : ''
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(0)}K`
  return `${sign}${abs}`
}


function FlowSkeleton() {
  return (
    <div>
      <Skeleton width="80px" height="12px" style={{ marginBottom: '12px' }} />
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '12px 16px', borderBottom: '1px solid var(--border, #e2e8f0)',
        }}>
          <Skeleton width="30px" height="14px" />
          <Skeleton width="120px" height="14px" />
          <Skeleton width="80px" height="14px" />
          <Skeleton width="80px" height="14px" />
          <Skeleton width="60px" height="14px" />
        </div>
      ))}
    </div>
  )
}

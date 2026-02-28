import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForeignFlow } from '../hooks/useForeignFlow'
import Skeleton from './Skeleton'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const SUB_TABS = [
  { key: 'foreign', label: '외국인 순매매', icon: 'F' },
  { key: 'institutional', label: '기관 순매매', icon: 'I' },
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
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{
            fontSize: '20px', fontWeight: 700, color: colors.textPrimary,
            fontFamily: FONTS.serif, margin: 0, letterSpacing: '-0.02em',
          }}>
            Flow Tracker
          </h2>
          <p style={{ fontSize: '13px', color: colors.textMuted, margin: '4px 0 0' }}>
            {typeLabel} {periodLabel} net buy/sell ranking
          </p>
        </div>

        {/* Period pills */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {PERIODS.map((p) => {
            const active = period === p.key
            return (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                style={{
                  padding: '5px 12px', borderRadius: '16px',
                  border: `1px solid ${active ? PREMIUM.accent : colors.border}`,
                  backgroundColor: active ? PREMIUM.accent : 'transparent',
                  color: active ? '#fff' : colors.textMuted,
                  fontSize: '11px', fontWeight: active ? 700 : 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                {p.label}
              </button>
            )
          })}
        </div>
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
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 16px', borderRadius: '20px',
                border: active ? `2px solid ${PREMIUM.accent}` : `1px solid ${colors.border}`,
                backgroundColor: active ? PREMIUM.accent : 'transparent',
                color: active ? '#fff' : colors.textPrimary,
                fontSize: '12px', fontWeight: active ? 700 : 500,
                cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              <span style={{
                width: '18px', height: '18px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '9px', fontWeight: 800, fontFamily: FONTS.mono,
                backgroundColor: active ? 'rgba(255,255,255,0.25)' : (dark ? 'rgba(255,255,255,0.08)' : '#F4F4F5'),
                color: active ? '#fff' : colors.textMuted,
              }}>
                {t.icon}
              </span>
              {t.label}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '10px', padding: '32px 0 24px',
          }}>
            <div style={{
              width: '16px', height: '16px', border: `2px solid ${colors.border}`,
              borderTopColor: PREMIUM.accent, borderRadius: '50%',
              animation: 'flow-spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: '12px', color: colors.textMuted }}>
              {typeLabel} 수급 데이터 조회 중...
            </span>
          </div>
          {items.length > 0 ? (
            <div style={{ opacity: 0.4, pointerEvents: 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <FlowSection title={`Net Buy TOP 20`} side="buy" items={buyItems} tab={tab} dark={dark} colors={colors} onRowClick={handleRowClick} />
                <FlowSection title={`Net Sell TOP 20`} side="sell" items={sellItems} tab={tab} dark={dark} colors={colors} onRowClick={handleRowClick} />
              </div>
            </div>
          ) : (
            <FlowSkeleton colors={colors} dark={dark} />
          )}
        </div>
      ) : items.length === 0 ? (
        <div style={{
          padding: '80px 20px', textAlign: 'center',
          borderRadius: '12px', backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
          border: `1px dashed ${colors.border}`,
        }}>
          {period === 'day' ? (
            <>
              <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '6px', fontWeight: 600 }}>
                장 마감 후 집계됩니다
              </div>
              <div style={{ fontSize: '12px', color: colors.textMuted }}>
                15:30 이후 갱신 — 1주/1개월 데이터를 먼저 확인해보세요
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '6px' }}>데이터 없음</div>
              <div style={{ fontSize: '12px', color: colors.textMuted }}>잠시 후 다시 시도해 주세요</div>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <FlowSection title="Net Buy TOP 20" side="buy" items={buyItems} tab={tab} dark={dark} colors={colors} onRowClick={handleRowClick} />
          <FlowSection title="Net Sell TOP 20" side="sell" items={sellItems} tab={tab} dark={dark} colors={colors} onRowClick={handleRowClick} />
        </div>
      )}

      <style>{`
        @keyframes flow-spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          .flow-hide-mobile { display: none !important; }
          .flow-table-header, .flow-table-row {
            grid-template-columns: 36px 1.5fr 1fr 0.7fr !important;
          }
        }
      `}</style>
    </div>
  )
}


function FlowSection({ title, side, items, tab, dark, colors, onRowClick }) {
  if (!items.length) return null
  const accentColor = side === 'buy' ? colors.positive : colors.negative
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        fontSize: '12px', fontWeight: 700, color: accentColor,
        marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        <span style={{ width: '3px', height: '12px', borderRadius: '1.5px', backgroundColor: accentColor }} />
        {title}
      </div>
      <FlowTable items={items} tab={tab} dark={dark} colors={colors} onRowClick={onRowClick} />
    </div>
  )
}


function FlowTable({ items, tab, dark, colors, onRowClick }) {
  const isForeign = tab === 'foreign'
  const gridCols = isForeign
    ? '36px 1.5fr 1fr 0.6fr 0.7fr'
    : '36px 1.5fr 1fr 0.7fr'

  return (
    <div style={{ borderRadius: '12px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
      {/* Header */}
      <div className="flow-table-header" style={{
        display: 'grid', gridTemplateColumns: gridCols,
        padding: '10px 16px',
        backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
        borderBottom: `1px solid ${colors.border}`,
        fontSize: '11px', fontWeight: 600, color: colors.textMuted,
        textTransform: 'uppercase', letterSpacing: '0.04em',
      }}>
        <div style={{ textAlign: 'center' }}>#</div>
        <div>Name</div>
        <div style={{ textAlign: 'right' }}>Net Vol.</div>
        {isForeign && <div className="flow-hide-mobile" style={{ textAlign: 'right' }}>Ratio</div>}
        <div style={{ textAlign: 'right' }}>Price</div>
      </div>

      {items.map((item, idx) => (
        <FlowRow
          key={`${item.stock_code}-${idx}`}
          item={item} rank={idx + 1} tab={tab}
          gridCols={gridCols} colors={colors} dark={dark}
          onClick={() => onRowClick(item.stock_code)}
        />
      ))}
    </div>
  )
}


function FlowRow({ item, rank, tab, gridCols, colors, dark, onClick }) {
  const isForeign = tab === 'foreign'
  const stripeBg = rank % 2 === 0 ? (dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA') : 'transparent'

  return (
    <div
      className="flow-table-row"
      onClick={onClick}
      style={{
        display: 'grid', gridTemplateColumns: gridCols,
        padding: '9px 16px', backgroundColor: stripeBg,
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'}`,
        cursor: 'pointer', transition: 'background-color 0.15s',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.05)' : '#F0F0F5'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = stripeBg}
    >
      <div style={{
        textAlign: 'center', fontSize: '11px', fontWeight: 700,
        fontFamily: FONTS.mono,
        color: rank <= 3 ? PREMIUM.accent : colors.textMuted,
      }}>
        {rank}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.stock_name}
        </div>
        <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono, marginTop: '1px' }}>
          {item.stock_code}
        </div>
      </div>

      <div style={{
        textAlign: 'right', fontSize: '12px', fontFamily: FONTS.mono, fontWeight: 600,
        color: item.net_buy_qty > 0 ? colors.positive : item.net_buy_qty < 0 ? colors.negative : colors.textMuted,
      }}>
        {formatFlowNumber(item.net_buy_qty)}
      </div>

      {isForeign && (
        <div className="flow-hide-mobile" style={{
          textAlign: 'right', fontSize: '11px', fontFamily: FONTS.mono,
          color: colors.textMuted,
        }}>
          {item.foreign_ratio != null && item.foreign_ratio > 0 ? `${item.foreign_ratio.toFixed(1)}%` : '-'}
        </div>
      )}

      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: '12px', fontWeight: 600,
          fontFamily: FONTS.mono, color: colors.textPrimary,
        }}>
          {item.price ? Number(item.price).toLocaleString() : '-'}
        </div>
        {item.change !== 0 && (
          <div style={{
            fontSize: '10px', fontFamily: FONTS.mono, marginTop: '1px',
            color: item.change > 0 ? colors.positive : item.change < 0 ? colors.negative : colors.textMuted,
          }}>
            {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
          </div>
        )}
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


function FlowSkeleton({ colors, dark }) {
  return (
    <div style={{ borderRadius: '12px', border: `1px solid ${colors?.border || '#E4E4E7'}`, overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB' }}>
        <Skeleton width="100%" height="14px" />
      </div>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px 16px', borderBottom: '1px solid #F4F4F5' }}>
          <Skeleton width="24px" height="14px" />
          <Skeleton width="120px" height="14px" />
          <Skeleton width="80px" height="14px" />
          <Skeleton width="60px" height="14px" />
        </div>
      ))}
    </div>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScreener } from '../hooks/useScreener'
import Skeleton from './Skeleton'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM, formatKoreanNumber } from '../constants/theme'

const SORT_COLUMNS = [
  { key: 'per', label: 'PER' },
  { key: 'pbr', label: 'PBR', hideOnMobile: true },
  { key: 'roe', label: 'ROE', hideOnMobile: true },
]

const VERDICT_STYLE = {
  '\uC800\uD3C9\uAC00': { bg: '#DCFCE7', color: '#16A34A' },
  '\uACE0\uD3C9\uAC00': { bg: '#DBEAFE', color: '#2563EB' },
  '\uC801\uC815': { bg: '#F3F4F6', color: '#6B7280' },
}

const SEVERITY_ICON = {
  CRITICAL: { icon: '\u26A0', color: '#1D4ED8' },
  WARNING: { icon: '\u26A0', color: '#D97706' },
  CAUTION: { icon: '\u25CB', color: '#CA8A04' },
  WATCH: { icon: '\u25CB', color: '#6B7280' },
}

export default function ScreenerDashboard({ onViewCard }) {
  const { colors, dark } = useTheme()
  const {
    results, summary, presets, loading,
    activePreset, customFilters, sortKey, sortOrder, liveMode,
    selectPreset, updateFilter, clearFilters, toggleSort, toggleLive,
  } = useScreener()
  const navigate = useNavigate()
  const [filterOpen, setFilterOpen] = useState(false)

  const filterInputStyle = {
    width: '70px',
    padding: '6px 8px',
    fontSize: '12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    backgroundColor: colors.bgPrimary,
    color: colors.textPrimary,
    fontFamily: FONTS.mono,
    outline: 'none',
    boxSizing: 'border-box',
  }

  return (
    <div className="page-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '24px' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.textPrimary, fontFamily: FONTS.serif, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ display: 'inline-block', width: '4px', height: '22px', background: PREMIUM.accent, borderRadius: '2px' }} />
            Stock Screener
          </h2>
          <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '4px' }}>
            Multi-condition filtering + preset stock discovery
          </div>
        </div>
        {/* 실시간 토글 */}
        <label style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          cursor: 'pointer', fontSize: '12px', color: colors.textSecondary,
          padding: '6px 12px', borderRadius: '8px',
          backgroundColor: liveMode ? '#FEF3C7' : colors.bgPrimary,
          border: `1px solid ${liveMode ? '#FDE68A' : colors.border}`,
        }}>
          <input
            type="checkbox"
            checked={liveMode}
            onChange={toggleLive}
            style={{ accentColor: '#D97706' }}
          />
          <span style={{ fontWeight: liveMode ? 600 : 400, color: liveMode ? '#92400E' : colors.textSecondary }}>
            Live {liveMode ? 'ON' : 'OFF'}
          </span>
        </label>
      </div>

      {loading && !results.length ? (
        <ScreenerSkeleton />
      ) : (
        <>
          {/* 프리셋 버튼 바 */}
          <div className="screener-preset-bar" style={{
            display: 'flex', gap: '8px', marginBottom: '16px',
            overflowX: 'auto', paddingBottom: '4px',
          }}>
            {presets.map((p) => {
              const isActive = activePreset === p.key
              return (
                <button
                  key={p.key}
                  onClick={() => selectPreset(p.key)}
                  title={p.description}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${isActive ? PREMIUM.accent : colors.border}`,
                    backgroundColor: isActive ? PREMIUM.accent : colors.bgCard,
                    color: isActive ? '#fff' : colors.textPrimary,
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                  }}
                >
                  {p.name}
                </button>
              )
            })}
          </div>

          {/* 필터 패널 토글 */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', color: colors.textSecondary, fontWeight: 600,
              marginBottom: filterOpen ? '12px' : '16px', padding: 0,
            }}
          >
            <span style={{ fontSize: '10px' }}>{filterOpen ? '\u25BC' : '\u25B6'}</span>
            Advanced Filters
            {Object.keys(customFilters).length > 0 && (
              <span style={{
                marginLeft: '6px', padding: '1px 6px', borderRadius: '10px',
                backgroundColor: PREMIUM.accent, color: '#fff', fontSize: '10px',
              }}>
                {Object.keys(customFilters).length}
              </span>
            )}
          </button>

          {/* 필터 패널 */}
          {filterOpen && (
            <div style={{
              padding: '16px', borderRadius: '16px',
              backgroundColor: colors.bgCard, border: `1px solid ${colors.border}`,
              marginBottom: '16px', boxShadow: PREMIUM.shadowSm,
            }}>
              <div className="screener-filter-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px', marginBottom: '12px',
              }}>
                <FilterRange label="PER" keyMin="per_min" keyMax="per_max" filters={customFilters} onChange={updateFilter} colors={colors} inputStyle={filterInputStyle} />
                <FilterRange label="PBR" keyMin="pbr_min" keyMax="pbr_max" filters={customFilters} onChange={updateFilter} step="0.1" colors={colors} inputStyle={filterInputStyle} />
                <FilterInput label="ROE >=" filterKey="roe_min" filters={customFilters} onChange={updateFilter} unit="%" colors={colors} inputStyle={filterInputStyle} />
                <FilterInput label="Op. Margin >=" filterKey="op_margin_min" filters={customFilters} onChange={updateFilter} unit="%" colors={colors} inputStyle={filterInputStyle} />
                <FilterInput label="Debt Ratio <=" filterKey="debt_ratio_max" filters={customFilters} onChange={updateFilter} unit="%" colors={colors} inputStyle={filterInputStyle} />
                <FilterInput label="Market Cap >=" filterKey="market_cap_min" filters={customFilters} onChange={updateFilter} unit="B" colors={colors} inputStyle={filterInputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <FilterCheckbox label="Exclude Capital Impairment" filterKey="exclude_risk_critical" filters={customFilters} onChange={updateFilter} colors={colors} />
                <FilterCheckbox label="Exclude Risk Warnings" filterKey="exclude_risk_warning" filters={customFilters} onChange={updateFilter} colors={colors} />
                <FilterCheckbox label="Risk Stocks Only" filterKey="risk_only" filters={customFilters} onChange={updateFilter} colors={colors} />

                <button
                  onClick={clearFilters}
                  style={{
                    marginLeft: 'auto', padding: '4px 12px', borderRadius: '6px',
                    border: `1px solid ${colors.border}`, backgroundColor: colors.bgPrimary,
                    color: colors.textSecondary, fontSize: '11px', cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* 카운트 */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '12px',
          }}>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>
              {summary.total > 0
                ? `${summary.filtered} of ${summary.total} matched`
                : 'No data'
              }
            </div>
            {liveMode && (
              <div style={{ fontSize: '11px', color: '#D97706', fontWeight: 600 }}>
                Live prices updating
              </div>
            )}
          </div>

          {results.length === 0 && !loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: colors.textMuted }}>
              <div style={{ fontSize: '15px', marginBottom: '8px' }}>
                {summary.total > 0 ? 'No stocks match the current filters' : 'No screening data available'}
              </div>
              <div style={{ fontSize: '13px' }}>
                {summary.total > 0 ? 'Try adjusting your filter criteria' : 'Data will appear after company cards are generated'}
              </div>
            </div>
          ) : (
            /* 메인 테이블 */
            <div style={{ borderRadius: '16px', border: `1px solid ${colors.border}`, overflow: 'hidden', boxShadow: PREMIUM.shadowMd }}>
              {/* 헤더 */}
              <div className="scr-table-header" style={{
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr 0.8fr repeat(3, 0.7fr) 70px',
                padding: '10px 16px',
                backgroundColor: dark ? '#09090B' : '#18181B',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}>
                <div>Name</div>
                <div
                  onClick={() => toggleSort('market_cap')}
                  style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                >
                  Price{sortKey === 'market_cap' && <SortArrow order={sortOrder} />}
                </div>
                <div
                  onClick={() => toggleSort('change_pct')}
                  style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                >
                  Change{sortKey === 'change_pct' && <SortArrow order={sortOrder} />}
                </div>
                {SORT_COLUMNS.map((col) => (
                  <div
                    key={col.key}
                    className={col.hideOnMobile ? 'scr-hide-mobile' : ''}
                    onClick={() => toggleSort(col.key)}
                    style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                  >
                    {col.label}{sortKey === col.key && <SortArrow order={sortOrder} />}
                  </div>
                ))}
                <div style={{ textAlign: 'center' }}>Verdict</div>
              </div>

              {/* 바디 */}
              {results.map((c) => (
                <ScreenerRow key={c.corp_code} company={c} onClick={() => onViewCard ? onViewCard(c.corp_code) : navigate(`/deep-dive/${c.corp_code}`)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* 반응형 CSS */}
      <style>{`
        @media (max-width: 640px) {
          .scr-hide-mobile { display: none !important; }
          .scr-table-header, .scr-table-row {
            grid-template-columns: 1.6fr 1fr 0.8fr 0.7fr 70px !important;
          }
          .screener-filter-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}


function ScreenerRow({ company: c, onClick }) {
  const { colors, dark } = useTheme()

  const val = c.valuation || {}
  const live = c.live || {}
  const peer = c.peer || {}
  const flags = c.risk_flags || []
  const hasLive = !!c.live
  const vs = VERDICT_STYLE[peer.verdict] || VERDICT_STYLE['\uC801\uC815']
  const hasCritical = flags.some((f) => f.severity === 'CRITICAL')

  const price = hasLive ? live.live_price : val.current_price
  const changePct = hasLive ? live.live_change_pct : null
  const per = hasLive && live.live_per != null ? live.live_per : val.per
  const pbr = hasLive && live.live_pbr != null ? live.live_pbr : val.pbr
  const roe = val.roe
  const volume = hasLive ? live.volume : null
  const volRatio = hasLive ? live.volume_ratio : null

  const criticalBg = dark ? '#1E3A5F' : '#EFF6FF'
  const criticalHoverBg = dark ? '#1E3A8A' : '#DBEAFE'

  return (
    <div
      className="scr-table-row"
      onClick={onClick}
      style={{
        display: 'grid',
        gridTemplateColumns: '1.6fr 1fr 0.8fr repeat(3, 0.7fr) 70px',
        padding: '10px 16px',
        backgroundColor: hasCritical ? criticalBg : colors.bgCard,
        borderTop: `1px solid ${colors.border}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = hasCritical ? criticalHoverBg : colors.borderLight}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = hasCritical ? criticalBg : colors.bgCard}
    >
      {/* 종목명 */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>
            {c.corp_name}
          </span>
          {flags.slice(0, 2).map((f, i) => {
            const si = SEVERITY_ICON[f.severity] || SEVERITY_ICON.WATCH
            return <span key={i} title={`${f.flag}: ${f.detail}`} style={{ fontSize: '11px', color: si.color }}>{si.icon}</span>
          })}
        </div>
        <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: FONTS.mono, display: 'flex', gap: '8px' }}>
          <span>{c.stock_code || ''}</span>
          {hasLive && volume != null && (
            <span>
              Vol {volume >= 1e6 ? `${(volume / 1e6).toFixed(1)}M` : volume >= 1e3 ? `${(volume / 1e3).toFixed(0)}K` : volume}
              {volRatio != null && volRatio > 0 && <span style={{ color: volRatio > 1.5 ? colors.positive : colors.textMuted }}> ({'\u00D7'}{volRatio.toFixed(1)})</span>}
            </span>
          )}
        </div>
      </div>

      {/* 현재가 */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, fontFamily: FONTS.mono, color: colors.textPrimary }}>
          {price ? Number(price).toLocaleString() : '-'}
        </div>
        {hasLive && val.market_cap != null && (
          <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono }}>
            {formatKoreanNumber(live.live_market_cap * 1e8 || val.market_cap)}
          </div>
        )}
      </div>

      {/* 등락 */}
      <div style={{ textAlign: 'right' }}>
        {changePct != null ? (
          <span style={{
            fontSize: '12px', fontWeight: 600, fontFamily: FONTS.mono,
            color: changePct > 0 ? colors.positive : changePct < 0 ? colors.negative : colors.textMuted,
          }}>
            {changePct > 0 ? '+' : ''}{changePct.toFixed(2)}%
          </span>
        ) : (
          <span style={{ fontSize: '12px', color: colors.textMuted }}>-</span>
        )}
      </div>

      {/* PER */}
      <div style={{ textAlign: 'right', fontSize: '13px', fontFamily: FONTS.mono, fontWeight: 600, color: per != null ? colors.textPrimary : colors.textMuted }}>
        {per != null ? per.toFixed(1) : '-'}
      </div>

      {/* PBR */}
      <div className="scr-hide-mobile" style={{ textAlign: 'right', fontSize: '13px', fontFamily: FONTS.mono, fontWeight: 600, color: pbr != null ? colors.textPrimary : colors.textMuted }}>
        {pbr != null ? pbr.toFixed(2) : '-'}
      </div>

      {/* ROE */}
      <div className="scr-hide-mobile" style={{
        textAlign: 'right', fontSize: '13px', fontFamily: FONTS.mono, fontWeight: 600,
        color: roe != null ? (roe > 0 ? colors.textPrimary : colors.negative) : colors.textMuted,
      }}>
        {roe != null ? `${roe.toFixed(1)}%` : '-'}
      </div>

      {/* 판정 */}
      <div style={{ textAlign: 'center' }}>
        <span style={{
          fontSize: '11px', fontWeight: 700,
          padding: '2px 8px', borderRadius: '4px',
          backgroundColor: vs.bg, color: vs.color,
        }}>
          {peer.verdict || '-'}
        </span>
      </div>
    </div>
  )
}


// -- 헬퍼 컴포넌트 --

function SortArrow({ order }) {
  return <span style={{ marginLeft: '3px', fontSize: '10px' }}>{order === 'desc' ? '\u25BC' : '\u25B2'}</span>
}

function FilterRange({ label, keyMin, keyMax, filters, onChange, step = '1', colors, inputStyle }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <input
          type="number"
          step={step}
          value={filters[keyMin] ?? ''}
          onChange={(e) => onChange(keyMin, e.target.value ? Number(e.target.value) : null)}
          placeholder="min"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = PREMIUM.accent}
          onBlur={(e) => e.target.style.borderColor = colors.border}
        />
        <span style={{ fontSize: '11px', color: colors.textMuted }}>~</span>
        <input
          type="number"
          step={step}
          value={filters[keyMax] ?? ''}
          onChange={(e) => onChange(keyMax, e.target.value ? Number(e.target.value) : null)}
          placeholder="max"
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = PREMIUM.accent}
          onBlur={(e) => e.target.style.borderColor = colors.border}
        />
      </div>
    </div>
  )
}

function FilterInput({ label, filterKey, filters, onChange, unit, colors, inputStyle }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <input
          type="number"
          value={filters[filterKey] ?? ''}
          onChange={(e) => onChange(filterKey, e.target.value ? Number(e.target.value) : null)}
          placeholder="0"
          style={{ ...inputStyle, flex: 1 }}
          onFocus={(e) => e.target.style.borderColor = PREMIUM.accent}
          onBlur={(e) => e.target.style.borderColor = colors.border}
        />
        {unit && <span style={{ fontSize: '11px', color: colors.textMuted }}>{unit}</span>}
      </div>
    </div>
  )
}

function FilterCheckbox({ label, filterKey, filters, onChange, colors }) {
  const checked = !!filters[filterKey]
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '12px', color: colors.textSecondary }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(filterKey, e.target.checked || null)}
        style={{ accentColor: PREMIUM.accent }}
      />
      {label}
    </label>
  )
}

function ScreenerSkeleton() {
  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} width="100px" height="36px" borderRadius="8px" />
        ))}
      </div>
      <Skeleton width="100px" height="12px" style={{ marginBottom: '12px' }} />
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          padding: '12px 16px', borderBottom: '1px solid var(--border, #e2e8f0)',
        }}>
          <Skeleton width="120px" height="14px" />
          <Skeleton width="80px" height="14px" />
          <Skeleton width="60px" height="14px" />
          <Skeleton width="50px" height="14px" />
          <Skeleton width="50px" height="14px" />
          <Skeleton width="50px" height="14px" />
        </div>
      ))}
    </div>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScreener } from '../hooks/useScreener'
import Skeleton from './Skeleton'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM, formatKoreanNumber } from '../constants/theme'

const SORT_COLUMNS = [
  { key: 'market_cap', label: 'Mkt Cap' },
  { key: 'per', label: 'PER' },
  { key: 'pbr', label: 'PBR', hideOnMobile: true },
  { key: 'roe', label: 'ROE', hideOnMobile: true },
]

const VERDICT_STYLE = {
  '저평가': { bg: '#DCFCE7', color: '#166534', border: '#BBF7D0' },
  '고평가': { bg: '#DBEAFE', color: '#1E40AF', border: '#BFDBFE' },
  '적정': { bg: '#F4F4F5', color: '#52525B', border: '#E4E4E7' },
}

const VERDICT_STYLE_DARK = {
  '저평가': { bg: 'rgba(74,222,128,0.12)', color: '#86EFAC', border: 'rgba(74,222,128,0.2)' },
  '고평가': { bg: 'rgba(96,165,250,0.12)', color: '#93C5FD', border: 'rgba(96,165,250,0.2)' },
  '적정': { bg: 'rgba(255,255,255,0.06)', color: '#A1A1AA', border: 'rgba(255,255,255,0.1)' },
}

const SEVERITY_ICON = {
  CRITICAL: { icon: '!', color: '#DC2626', bg: '#FEE2E2' },
  WARNING: { icon: '!', color: '#D97706', bg: '#FEF3C7' },
  CAUTION: { icon: '-', color: '#CA8A04', bg: '#FEF9C3' },
  WATCH: { icon: '-', color: '#6B7280', bg: '#F4F4F5' },
}

const PRESET_ICONS = {
  'value': 'V',
  'quality': 'Q',
  'growth': 'G',
  'risk_monitor': 'R',
  'undervalued_peer': 'U',
  'foreign_pick': 'F',
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
    padding: '7px 8px',
    fontSize: '12px',
    border: `1px solid ${colors.border}`,
    borderRadius: '8px',
    backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#FAFAFA',
    color: colors.textPrimary,
    fontFamily: FONTS.mono,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s',
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h2 style={{
            fontSize: '20px', fontWeight: 700, color: colors.textPrimary,
            fontFamily: FONTS.serif, margin: 0, letterSpacing: '-0.02em',
          }}>
            Stock Screener
          </h2>
          <p style={{ fontSize: '13px', color: colors.textMuted, margin: '4px 0 0' }}>
            {summary.total > 0 ? `${summary.total} stocks available` : 'Multi-condition screening'}
          </p>
        </div>

        {/* Live Toggle */}
        <button
          onClick={toggleLive}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '20px',
            border: `1px solid ${liveMode ? '#F59E0B' : colors.border}`,
            backgroundColor: liveMode ? '#FFFBEB' : 'transparent',
            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
            color: liveMode ? '#92400E' : colors.textMuted,
            transition: 'all 0.2s',
          }}
        >
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            backgroundColor: liveMode ? '#F59E0B' : colors.textMuted,
            boxShadow: liveMode ? '0 0 6px rgba(245,158,11,0.5)' : 'none',
          }} />
          {liveMode ? 'Live' : 'Static'}
        </button>
      </div>

      {loading && !results.length ? (
        <ScreenerSkeleton dark={dark} colors={colors} />
      ) : (
        <>
          {/* Preset Pills */}
          <div style={{
            display: 'flex', gap: '8px', marginBottom: '20px',
            overflowX: 'auto', paddingBottom: '4px',
          }}>
            {presets.map((p) => {
              const isActive = activePreset === p.key
              const icon = PRESET_ICONS[p.key] || '?'
              return (
                <button
                  key={p.key}
                  onClick={() => selectPreset(p.key)}
                  title={p.description}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 16px', borderRadius: '20px',
                    border: isActive ? `2px solid ${PREMIUM.accent}` : `1px solid ${colors.border}`,
                    backgroundColor: isActive ? PREMIUM.accent : 'transparent',
                    color: isActive ? '#fff' : colors.textPrimary,
                    fontSize: '12px', fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer', whiteSpace: 'nowrap',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{
                    width: '18px', height: '18px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', fontWeight: 800, fontFamily: FONTS.mono,
                    backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : (dark ? 'rgba(255,255,255,0.08)' : '#F4F4F5'),
                    color: isActive ? '#fff' : colors.textMuted,
                  }}>
                    {icon}
                  </span>
                  {p.name}
                </button>
              )
            })}
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', color: colors.textSecondary, fontWeight: 600,
              marginBottom: filterOpen ? '12px' : '16px', padding: '4px 0',
            }}
          >
            <span style={{
              fontSize: '8px', transition: 'transform 0.2s',
              transform: filterOpen ? 'rotate(90deg)' : 'rotate(0deg)',
            }}>&#9654;</span>
            Advanced Filters
            {Object.keys(customFilters).length > 0 && (
              <span style={{
                marginLeft: '4px', padding: '2px 7px', borderRadius: '10px',
                backgroundColor: PREMIUM.accent, color: '#fff', fontSize: '10px', fontWeight: 700,
              }}>
                {Object.keys(customFilters).length}
              </span>
            )}
          </button>

          {/* Filter Panel */}
          {filterOpen && (
            <div style={{
              padding: '16px 18px', borderRadius: '12px',
              backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
              border: `1px solid ${colors.border}`,
              marginBottom: '20px',
            }}>
              <div className="screener-filter-grid" style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '14px', marginBottom: '14px',
              }}>
                <FilterRange label="PER" keyMin="per_min" keyMax="per_max" filters={customFilters} onChange={updateFilter} colors={colors} inputStyle={filterInputStyle} />
                <FilterRange label="PBR" keyMin="pbr_min" keyMax="pbr_max" filters={customFilters} onChange={updateFilter} step="0.1" colors={colors} inputStyle={filterInputStyle} />
                <FilterInput label="ROE >=" filterKey="roe_min" filters={customFilters} onChange={updateFilter} unit="%" colors={colors} inputStyle={filterInputStyle} />
                <FilterInput label="Op. Margin >=" filterKey="op_margin_min" filters={customFilters} onChange={updateFilter} unit="%" colors={colors} inputStyle={filterInputStyle} />
                <FilterInput label="Debt Ratio <=" filterKey="debt_ratio_max" filters={customFilters} onChange={updateFilter} unit="%" colors={colors} inputStyle={filterInputStyle} />
                <FilterInput label="Market Cap >=" filterKey="market_cap_min" filters={customFilters} onChange={updateFilter} unit="B" colors={colors} inputStyle={filterInputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <FilterCheckbox label="자본잠식 제외" filterKey="exclude_risk_critical" filters={customFilters} onChange={updateFilter} colors={colors} />
                <FilterCheckbox label="리스크 종목만" filterKey="risk_only" filters={customFilters} onChange={updateFilter} colors={colors} />
                <button
                  onClick={clearFilters}
                  style={{
                    marginLeft: 'auto', padding: '5px 14px', borderRadius: '8px',
                    border: `1px solid ${colors.border}`, backgroundColor: 'transparent',
                    color: colors.textMuted, fontSize: '11px', cursor: 'pointer',
                    fontWeight: 500, transition: 'all 0.15s',
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Result Count */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '8px', padding: '0 2px',
          }}>
            <span style={{ fontSize: '12px', color: colors.textMuted }}>
              {summary.total > 0
                ? `${summary.filtered} of ${summary.total} matched`
                : 'No data'
              }
            </span>
            {liveMode && (
              <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#F59E0B', animation: 'pulse 2s infinite' }} />
                Live
              </span>
            )}
          </div>

          {/* Empty State */}
          {results.length === 0 && !loading ? (
            <div style={{
              padding: '80px 20px', textAlign: 'center',
              borderRadius: '16px', backgroundColor: dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA',
              border: `1px dashed ${colors.border}`,
            }}>
              <div style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '6px' }}>
                {summary.total > 0 ? '현재 필터에 해당하는 종목이 없습니다' : '스크리닝 데이터가 없습니다'}
              </div>
              <div style={{ fontSize: '12px', color: colors.textMuted }}>
                {summary.total > 0 ? '필터 조건을 조정해보세요' : '기업 카드 생성 후 데이터가 표시됩니다'}
              </div>
            </div>
          ) : (
            /* Main Table */
            <div style={{
              borderRadius: '12px', overflow: 'hidden',
              border: `1px solid ${colors.border}`,
            }}>
              {/* Table Header */}
              <div className="scr-table-header" style={{
                display: 'grid',
                gridTemplateColumns: '1.8fr repeat(4, 0.8fr) 0.7fr 72px',
                padding: '10px 16px',
                backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB',
                borderBottom: `1px solid ${colors.border}`,
                fontSize: '11px', fontWeight: 600, color: colors.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                <div>Name</div>
                {SORT_COLUMNS.map((col) => (
                  <div
                    key={col.key}
                    className={col.hideOnMobile ? 'scr-hide-mobile' : ''}
                    onClick={() => toggleSort(col.key)}
                    style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                  >
                    {col.label}
                    {sortKey === col.key && <SortArrow order={sortOrder} />}
                  </div>
                ))}
                <div style={{ textAlign: 'right', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => toggleSort('op_margin')}
                >
                  OPM{sortKey === 'op_margin' && <SortArrow order={sortOrder} />}
                </div>
                <div style={{ textAlign: 'center' }}>Verdict</div>
              </div>

              {/* Rows */}
              {results.map((c, i) => (
                <ScreenerRow
                  key={c.corp_code}
                  company={c}
                  even={i % 2 === 0}
                  activePreset={activePreset}
                  onClick={() => onViewCard ? onViewCard(c.corp_code) : navigate(`/deep-dive/${c.corp_code}`)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 640px) {
          .scr-hide-mobile { display: none !important; }
          .scr-table-header, .scr-table-row {
            grid-template-columns: 1.8fr 0.8fr 0.8fr 0.7fr 72px !important;
          }
          .screener-filter-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .scr-guide-row { padding-left: 12px !important; padding-right: 12px !important; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}


/* ── PresetGuide — 프리셋별 가이드 데이터 ── */
function buildPresetGuide(preset, val, peer, flags) {
  if (!preset) return null
  const tags = []
  const per = val.per, pbr = val.pbr, roe = val.roe
  const opm = val.op_margin, debt = val.debt_ratio, mc = val.market_cap
  const fr = val.foreign_ratio

  switch (preset) {
    case 'value':
      tags.push({ type: per != null && per > 0 && per <= 10 ? 'pass' : 'warn', metric: 'PER', value: per != null && per > 0 ? per.toFixed(1) : '-', threshold: '≤ 10' })
      tags.push({ type: pbr != null && pbr > 0 && pbr < 1.0 ? 'pass' : 'warn', metric: 'PBR', value: pbr != null ? pbr.toFixed(2) : '-', threshold: '< 1.0' })
      tags.push({ type: !flags.some(f => f.severity === 'CRITICAL') ? 'pass' : 'danger', metric: '건전성', value: flags.some(f => f.severity === 'CRITICAL') ? '잠식' : 'OK' })
      break
    case 'quality':
      tags.push({ type: roe != null && roe >= 5 ? 'pass' : 'warn', metric: 'ROE', value: roe != null ? roe.toFixed(1) + '%' : '-', threshold: '≥ 5%' })
      tags.push({ type: opm != null && opm >= 5 ? 'pass' : 'warn', metric: 'OPM', value: opm != null ? opm.toFixed(1) + '%' : '-', threshold: '≥ 5%' })
      tags.push({ type: debt != null && debt <= 150 ? 'pass' : 'warn', metric: '부채', value: debt != null ? debt.toFixed(0) + '%' : '-', threshold: '≤ 150%' })
      break
    case 'growth':
      tags.push({ type: mc != null && mc >= 1000 ? 'pass' : 'warn', metric: '시총', value: mc != null ? formatKoreanNumber(mc * 1e8) : '-', threshold: '≥ 1,000억' })
      tags.push({ type: opm != null && opm > 0 ? 'pass' : 'warn', metric: 'OPM', value: opm != null ? opm.toFixed(1) + '%' : '-', threshold: '> 0%' })
      break
    case 'risk_monitor':
      flags.forEach(f => {
        const t = f.severity === 'CRITICAL' ? 'danger' : f.severity === 'WARNING' ? 'warn' : 'info'
        tags.push({ type: t, metric: f.flag, value: f.detail || '' })
      })
      break
    case 'undervalued_peer': {
      const perVs = peer.per_vs_sector, pbrVs = peer.pbr_vs_sector
      const roeVs = peer.roe_vs_sector, cnt = peer.peer_count
      tags.push({ type: perVs != null && perVs < 0 ? 'pass' : 'warn', metric: 'PER', value: perVs != null ? (perVs > 0 ? '+' : '') + perVs.toFixed(0) + '%' : '-', threshold: 'vs Sector' })
      tags.push({ type: pbrVs != null && pbrVs < 0 ? 'pass' : 'warn', metric: 'PBR', value: pbrVs != null ? (pbrVs > 0 ? '+' : '') + pbrVs.toFixed(0) + '%' : '-', threshold: 'vs Sector' })
      if (roeVs != null) tags.push({ type: roeVs > 0 ? 'pass' : 'info', metric: 'ROE', value: (roeVs > 0 ? '+' : '') + roeVs.toFixed(0) + '%', threshold: 'vs Sector' })
      if (cnt != null) tags.push({ type: 'info', metric: 'Peers', value: String(cnt) })
      break
    }
    case 'foreign_pick':
      tags.push({ type: fr != null && fr >= 20 ? 'pass' : 'warn', metric: '외국인', value: fr != null ? fr.toFixed(1) + '%' : '-', threshold: '≥ 20%' })
      tags.push({ type: roe != null && roe >= 5 ? 'pass' : 'warn', metric: 'ROE', value: roe != null ? roe.toFixed(1) + '%' : '-', threshold: '≥ 5%' })
      tags.push({ type: per != null && per > 0 && per <= 30 ? 'pass' : 'warn', metric: 'PER', value: per != null && per > 0 ? per.toFixed(1) : '-', threshold: '≤ 30' })
      break
    default:
      return null
  }
  return tags
}

/* ── Tag color system ── */
const TAG_COLORS = {
  light: {
    pass:   { dot: '#16A34A', label: '#6B7280', value: '#15803D' },
    warn:   { dot: '#D97706', label: '#6B7280', value: '#92400E' },
    danger: { dot: '#DC2626', label: '#6B7280', value: '#991B1B' },
    info:   { dot: '#94A3B8', label: '#6B7280', value: '#475569' },
    guideBg: '#F8FAFC',
    guideBorder: 'rgba(0,0,0,0.04)',
    sep: 'rgba(0,0,0,0.06)',
    accentBar: { pass: '#16A34A', warn: '#D97706', danger: '#DC2626', info: '#94A3B8' },
  },
  dark: {
    pass:   { dot: '#4ADE80', label: '#71717A', value: '#86EFAC' },
    warn:   { dot: '#FBBF24', label: '#71717A', value: '#FDE68A' },
    danger: { dot: '#F87171', label: '#71717A', value: '#FCA5A5' },
    info:   { dot: '#71717A', label: '#52525B', value: '#A1A1AA' },
    guideBg: 'rgba(255,255,255,0.02)',
    guideBorder: 'rgba(255,255,255,0.04)',
    sep: 'rgba(255,255,255,0.06)',
    accentBar: { pass: '#4ADE80', warn: '#FBBF24', danger: '#F87171', info: '#52525B' },
  },
}


/* ── ScreenerRow ── */
function ScreenerRow({ company: c, even, activePreset, onClick }) {
  const { colors, dark } = useTheme()
  const palette = TAG_COLORS[dark ? 'dark' : 'light']

  const val = c.valuation || {}
  const live = c.live || {}
  const peer = c.peer || {}
  const flags = c.risk_flags || []
  const hasLive = !!c.live
  const verdictStyles = dark ? VERDICT_STYLE_DARK : VERDICT_STYLE
  const vs = verdictStyles[peer.verdict] || verdictStyles['적정']
  const hasCritical = flags.some((f) => f.severity === 'CRITICAL')

  const price = hasLive ? live.live_price : val.current_price
  const per = hasLive && live.live_per != null ? live.live_per : val.per
  const pbr = hasLive && live.live_pbr != null ? live.live_pbr : val.pbr
  const roe = val.roe
  const opMargin = val.op_margin
  const marketCap = val.market_cap

  const guideTags = buildPresetGuide(activePreset, { ...val, per, pbr }, peer, flags)

  // Determine dominant guide status for accent bar
  const guideAccent = (() => {
    if (!guideTags || guideTags.length === 0) return null
    if (guideTags.some(t => t.type === 'danger')) return 'danger'
    if (guideTags.some(t => t.type === 'warn')) return 'warn'
    if (guideTags.every(t => t.type === 'pass')) return 'pass'
    return 'info'
  })()

  const stripeBg = even
    ? 'transparent'
    : (dark ? 'rgba(255,255,255,0.02)' : '#FAFAFA')
  const criticalBg = dark ? 'rgba(220,38,38,0.06)' : '#FEF2F2'

  return (
    <>
      {/* Main data row */}
      <div
        className="scr-table-row"
        onClick={onClick}
        style={{
          display: 'grid',
          gridTemplateColumns: '1.8fr repeat(4, 0.8fr) 0.7fr 72px',
          padding: guideTags ? '10px 16px 6px' : '10px 16px',
          backgroundColor: hasCritical ? criticalBg : stripeBg,
          borderBottom: guideTags ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'}`,
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          alignItems: 'center',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.05)' : '#F0F0F5'
          const next = e.currentTarget.nextElementSibling
          if (next && next.classList.contains('scr-guide-row')) next.style.backgroundColor = dark ? 'rgba(255,255,255,0.03)' : '#EEF0F4'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = hasCritical ? criticalBg : stripeBg
          const next = e.currentTarget.nextElementSibling
          if (next && next.classList.contains('scr-guide-row')) next.style.backgroundColor = palette.guideBg
        }}
      >
        {/* Name */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.textPrimary }}>
              {c.corp_name}
            </span>
            {flags.slice(0, 2).map((f, i) => {
              const si = SEVERITY_ICON[f.severity] || SEVERITY_ICON.WATCH
              return (
                <span key={i} title={`${f.flag}: ${f.detail}`} style={{
                  fontSize: '8px', fontWeight: 800, width: '14px', height: '14px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: '4px', backgroundColor: si.bg, color: si.color,
                }}>
                  {si.icon}
                </span>
              )
            })}
          </div>
          <div style={{ fontSize: '10px', color: colors.textMuted, fontFamily: FONTS.mono, marginTop: '1px' }}>
            {c.stock_code || ''}
            {price ? ` \u00B7 ${Number(price).toLocaleString()}` : ''}
          </div>
        </div>

        {/* Mkt Cap */}
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '12px', fontWeight: 600, fontFamily: FONTS.mono,
            color: colors.textPrimary,
          }}>
            {marketCap ? formatKoreanNumber(marketCap * 1e8) : '-'}
          </span>
        </div>

        {/* PER */}
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '12px', fontWeight: 600, fontFamily: FONTS.mono,
            color: per != null && per > 0 ? colors.textPrimary : colors.textMuted,
          }}>
            {per != null && per > 0 ? per.toFixed(1) : '-'}
          </span>
        </div>

        {/* PBR */}
        <div className="scr-hide-mobile" style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '12px', fontWeight: 600, fontFamily: FONTS.mono,
            color: pbr != null ? colors.textPrimary : colors.textMuted,
          }}>
            {pbr != null ? pbr.toFixed(2) : '-'}
          </span>
        </div>

        {/* ROE */}
        <div className="scr-hide-mobile" style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '12px', fontWeight: 600, fontFamily: FONTS.mono,
            color: roe != null ? (roe > 0 ? colors.positive : colors.negative) : colors.textMuted,
          }}>
            {roe != null ? `${roe.toFixed(1)}%` : '-'}
          </span>
        </div>

        {/* OPM */}
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '12px', fontWeight: 600, fontFamily: FONTS.mono,
            color: opMargin != null ? (opMargin > 0 ? colors.textPrimary : colors.negative) : colors.textMuted,
          }}>
            {opMargin != null ? `${opMargin.toFixed(1)}%` : '-'}
          </span>
        </div>

        {/* Verdict */}
        <div style={{ textAlign: 'center' }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.02em',
            padding: '3px 8px', borderRadius: '6px',
            backgroundColor: vs.bg, color: vs.color,
            border: `1px solid ${vs.border}`,
          }}>
            {peer.verdict || '-'}
          </span>
        </div>
      </div>

      {/* Guide sub-row */}
      {guideTags && guideTags.length > 0 && (
        <div
          className="scr-guide-row"
          onClick={onClick}
          style={{
            display: 'flex', alignItems: 'center',
            padding: '0 16px 8px',
            backgroundColor: palette.guideBg,
            borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5'}`,
            cursor: 'pointer',
            transition: 'background-color 0.15s',
          }}
        >
          {/* Accent bar */}
          <span style={{
            width: '2px', height: '14px', borderRadius: '1px', flexShrink: 0,
            backgroundColor: guideAccent ? palette.accentBar[guideAccent] : palette.sep,
            marginRight: '10px', opacity: 0.7,
          }} />

          {/* Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', flexWrap: 'wrap' }}>
            {guideTags.map((tag, i) => {
              const tc = palette[tag.type] || palette.info
              return (
                <React.Fragment key={i}>
                  {i > 0 && (
                    <span style={{
                      width: '3px', height: '3px', borderRadius: '50%',
                      backgroundColor: palette.sep, margin: '0 8px', flexShrink: 0,
                    }} />
                  )}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    whiteSpace: 'nowrap',
                  }}>
                    {/* Status dot */}
                    <span style={{
                      width: '4px', height: '4px', borderRadius: '50%',
                      backgroundColor: tc.dot, flexShrink: 0,
                    }} />
                    {/* Metric label */}
                    <span style={{
                      fontSize: '9px', fontWeight: 600, fontFamily: FONTS.mono,
                      color: tc.label, textTransform: 'uppercase', letterSpacing: '0.04em',
                    }}>
                      {tag.metric}
                    </span>
                    {/* Value */}
                    <span style={{
                      fontSize: '10px', fontWeight: 700, fontFamily: FONTS.mono,
                      color: tc.value,
                    }}>
                      {tag.value}
                    </span>
                    {/* Threshold */}
                    {tag.threshold && (
                      <span style={{
                        fontSize: '8.5px', fontFamily: FONTS.mono,
                        color: tc.label, opacity: 0.6,
                      }}>
                        {tag.threshold}
                      </span>
                    )}
                  </span>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}


/* ── Helpers ── */

function SortArrow({ order }) {
  return (
    <span style={{ marginLeft: '2px', fontSize: '8px', opacity: 0.8 }}>
      {order === 'desc' ? '\u25BC' : '\u25B2'}
    </span>
  )
}

function FilterRange({ label, keyMin, keyMax, filters, onChange, step = '1', colors, inputStyle }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '5px', fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <input
          type="number" step={step}
          value={filters[keyMin] ?? ''}
          onChange={(e) => onChange(keyMin, e.target.value ? Number(e.target.value) : null)}
          placeholder="min" style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = PREMIUM.accent}
          onBlur={(e) => e.target.style.borderColor = colors.border}
        />
        <span style={{ fontSize: '10px', color: colors.textMuted }}>~</span>
        <input
          type="number" step={step}
          value={filters[keyMax] ?? ''}
          onChange={(e) => onChange(keyMax, e.target.value ? Number(e.target.value) : null)}
          placeholder="max" style={inputStyle}
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
      <div style={{ fontSize: '11px', color: colors.textMuted, marginBottom: '5px', fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <input
          type="number"
          value={filters[filterKey] ?? ''}
          onChange={(e) => onChange(filterKey, e.target.value ? Number(e.target.value) : null)}
          placeholder="0" style={{ ...inputStyle, flex: 1 }}
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
    <label style={{
      display: 'flex', alignItems: 'center', gap: '5px',
      cursor: 'pointer', fontSize: '12px', color: colors.textSecondary,
    }}>
      <input
        type="checkbox" checked={checked}
        onChange={(e) => onChange(filterKey, e.target.checked || null)}
        style={{ accentColor: PREMIUM.accent }}
      />
      {label}
    </label>
  )
}

function ScreenerSkeleton({ dark, colors }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} width="100px" height="34px" borderRadius="20px" />
        ))}
      </div>
      <div style={{
        borderRadius: '12px', overflow: 'hidden',
        border: `1px solid ${colors?.border || '#E4E4E7'}`,
      }}>
        <div style={{ padding: '10px 16px', backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB' }}>
          <Skeleton width="100%" height="14px" />
        </div>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} style={{ display: 'flex', gap: '16px', padding: '12px 16px', borderBottom: '1px solid #F4F4F5' }}>
            <Skeleton width="120px" height="14px" />
            <Skeleton width="60px" height="14px" />
            <Skeleton width="50px" height="14px" />
            <Skeleton width="50px" height="14px" />
            <Skeleton width="50px" height="14px" />
          </div>
        ))}
      </div>
    </div>
  )
}

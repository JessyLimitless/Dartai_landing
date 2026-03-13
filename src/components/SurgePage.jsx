import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { GRADE_COLORS, FONTS } from '../constants/theme'
import { API } from '../lib/api'

function useTodayTracks() {
  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const prevSurgesRef = useRef(new Set())
  const [alert, setAlert] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await window.fetch(`${API}/api/price-tracks/today?days=3`)
      if (res.ok) {
        const data = await res.json()
        const tracks = data.tracks || []
        setAll(tracks)
        const fresh = tracks.filter(t =>
          t.live_change >= 2.0 && !prevSurgesRef.current.has(t.stock_code)
        )
        if (fresh.length > 0) {
          setAlert(fresh[0])
          setTimeout(() => setAlert(null), 6000)
        }
        prevSurgesRef.current = new Set(tracks.filter(t => t.live_change >= 2.0).map(t => t.stock_code))
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    load()
    const iv = setInterval(load, 60000)
    return () => clearInterval(iv)
  }, [load])

  return { all, loading, alert, dismissAlert: () => setAlert(null) }
}

function pctColor(v) {
  if (v == null) return '#A1A1AA'
  if (v >= 2)  return '#DC2626'
  if (v > 0)   return '#059669'
  if (v < 0)   return '#2563EB'
  return '#71717A'
}

function fmtPct(v) {
  if (v == null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

function SurgeAlert({ item, onClose }) {
  if (!item) return null
  return (
    <div style={{
      position: 'fixed', top: 66, left: '50%', transform: 'translateX(-50%)',
      zIndex: 2000,
      background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
      color: '#fff', borderRadius: 14, padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 8px 32px rgba(220,38,38,0.5)',
      minWidth: 280, animation: 'surgeIn 0.3s ease-out',
    }}>
      <span style={{ fontSize: 20 }}>🚀</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>
          {item.corp_name} +{item.live_change?.toFixed(1)}% 급등
        </div>
        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 1 }}>
          [{item.grade}] {item.report_nm?.slice(0, 24)}
        </div>
      </div>
      <button onClick={onClose} style={{
        background: 'rgba(255,255,255,0.2)', border: 'none',
        color: '#fff', borderRadius: 6, padding: '3px 8px',
        fontSize: 11, cursor: 'pointer',
      }}>✕</button>
    </div>
  )
}

// 컬럼 정렬 아이콘
function SortIcon({ col, sortCol, sortAsc }) {
  if (sortCol !== col) return <span style={{ color: '#52525B', fontSize: 10, marginLeft: 3 }}>⇅</span>
  return <span style={{ color: '#0D9488', fontSize: 10, marginLeft: 3 }}>{sortAsc ? '↑' : '↓'}</span>
}

// 변화율 셀
function PctCell({ value }) {
  const col = pctColor(value)
  const bg = value == null ? 'transparent'
    : value >= 2  ? 'rgba(220,38,38,0.08)'
    : value > 0   ? 'rgba(5,150,105,0.08)'
    : value < 0   ? 'rgba(37,99,235,0.08)'
    : 'transparent'
  return (
    <span style={{
      fontFamily: FONTS.mono, fontSize: 13, fontWeight: value != null ? 700 : 400,
      color: col,
      background: bg,
      padding: value != null ? '2px 6px' : '0',
      borderRadius: 5,
      display: 'inline-block', minWidth: 60, textAlign: 'right',
    }}>
      {fmtPct(value)}
    </span>
  )
}

export default function SurgePage({ onViewCard, embedded = false }) {
  const { colors, dark } = useTheme()
  const { all, loading, alert, dismissAlert } = useTodayTracks()
  const [sortCol, setSortCol] = useState('change_close')
  const [sortAsc, setSortAsc] = useState(false)

  const nowHour = new Date().getHours()
  const nowMin = new Date().getMinutes()
  const isAfterMarket = nowHour > 15 || (nowHour === 15 && nowMin >= 30)
  const surgeCount = all.filter(t => (t.live_change ?? 0) >= 2.0).length

  const handleSort = (col) => {
    if (sortCol === col) setSortAsc(p => !p)
    else { setSortCol(col); setSortAsc(false) }
  }

  const sorted = [...all].sort((a, b) => {
    const av = a[sortCol] ?? -Infinity
    const bv = b[sortCol] ?? -Infinity
    return sortAsc ? av - bv : bv - av
  })

  const COLS = [
    { key: 'corp_name',    label: '종목',       sortable: false, width: null },
    { key: 'grade',        label: '등급',       sortable: false, width: 52 },
    { key: 'base_price',   label: '기준가',     sortable: true,  width: 90 },
    { key: 'change_close', label: '종가 변동률', sortable: true,  width: 120 },
  ]

  const thStyle = (col) => ({
    padding: '10px 12px',
    fontSize: 11, fontWeight: 600,
    color: sortCol === col.key ? '#0D9488' : colors.textMuted,
    textAlign: col.key === 'corp_name' ? 'left' : 'right',
    cursor: col.sortable ? 'pointer' : 'default',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    width: col.width || undefined,
    borderBottom: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
    background: dark ? '#18181B' : '#FAFAFA',
  })

  return (
    <div style={{ fontFamily: FONTS.body }}>

      <SurgeAlert item={alert} onClose={dismissAlert} />

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: isAfterMarket ? '#52525B' : '#DC2626',
            color: '#fff', fontSize: 9, fontWeight: 800,
            padding: '2px 7px', borderRadius: 20, letterSpacing: '0.1em',
          }}>{isAfterMarket ? '장 마감' : 'LIVE'}</span>
          <span style={{ fontSize: 12, color: colors.textMuted }}>
            {loading ? '로딩 중...'
              : all.length === 0 ? '오늘 S·A 등급 공시 없음'
              : `${all.length}개 추적${surgeCount > 0 ? ` · 🚀 ${surgeCount}개 2%+` : ''}`}
          </span>
        </div>
        {!loading && all.length > 0 && (
          <span style={{ fontSize: 11, color: colors.textMuted }}>
            컬럼 클릭으로 정렬
          </span>
        )}
      </div>

      {/* 테이블 */}
      {loading ? (
        <div style={{
          background: dark ? '#18181B' : '#fff',
          border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
          borderRadius: 12, overflow: 'hidden',
        }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={{
              height: 44, borderBottom: i < 7 ? `1px solid ${dark ? '#27272A' : '#F4F4F5'}` : 'none',
              display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
            }}>
              <div style={{ width: 120, height: 12, borderRadius: 4, background: dark ? '#27272A' : '#F4F4F5', animation: 'pulse 1.4s ease-in-out infinite' }} />
              <div style={{ flex: 1 }} />
              <div style={{ width: 60, height: 12, borderRadius: 4, background: dark ? '#27272A' : '#F4F4F5', animation: 'pulse 1.4s ease-in-out infinite' }} />
            </div>
          ))}
        </div>
      ) : all.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: colors.textMuted, fontSize: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
          공시 발생 시 자동으로 추적이 시작됩니다
        </div>
      ) : (
        <div style={{
          background: dark ? '#18181B' : '#fff',
          border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
          borderRadius: 12, overflow: 'hidden',
          overflowX: 'auto',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
            <thead>
              <tr>
                {COLS.map(col => (
                  <th
                    key={col.key}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                    style={thStyle(col)}
                  >
                    {col.label}
                    {col.sortable && <SortIcon col={col.key} sortCol={sortCol} sortAsc={sortAsc} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((t, i) => {
                const gc = GRADE_COLORS[t.grade] || { bg: '#A1A1AA', color: '#fff' }
                const isSurge = (t.live_change ?? 0) >= 2.0
                const rowBg = isSurge
                  ? (dark ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.03)')
                  : 'transparent'
                const borderBottom = i < sorted.length - 1
                  ? `1px solid ${dark ? '#27272A' : '#F4F4F5'}`
                  : 'none'

                return (
                  <tr
                    key={t.rcept_no || t.stock_code}
                    onClick={() => onViewCard?.(t.stock_code)}
                    style={{
                      background: rowBg,
                      cursor: 'pointer',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background = rowBg}
                  >
                    {/* 종목명 + 공시 */}
                    <td style={{ padding: '11px 12px', borderBottom }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {isSurge && <span style={{ fontSize: 12 }}>🚀</span>}
                        <div>
                          <div style={{
                            fontWeight: 600, fontSize: 13,
                            color: dark ? '#FAFAFA' : '#18181B',
                            fontFamily: FONTS.serif,
                          }}>
                            {t.corp_name || t.stock_code}
                          </div>
                          <div style={{
                            fontSize: 10, color: colors.textMuted, marginTop: 1,
                            maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {t.report_nm || '공시'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 등급 */}
                    <td style={{ padding: '11px 12px', textAlign: 'center', borderBottom }}>
                      <span style={{
                        background: gc.bg, color: gc.color,
                        fontSize: 10, fontWeight: 800,
                        padding: '2px 6px', borderRadius: 4,
                        fontFamily: FONTS.mono,
                      }}>{t.grade}</span>
                    </td>

                    {/* 기준가 */}
                    <td style={{ padding: '11px 12px', textAlign: 'right', borderBottom }}>
                      <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: colors.textSecondary }}>
                        {t.base_price ? t.base_price.toLocaleString() : '—'}
                      </span>
                    </td>

                    {/* 종가 변동률 */}
                    <td style={{ padding: '11px 12px', textAlign: 'right', borderBottom }}>
                      <PctCell value={t['change_close']} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes surgeIn { from{opacity:0;transform:translateX(-50%) translateY(-14px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @media (max-width: 640px) {
          .surge-table-hide { display: none !important; }
        }
      `}</style>
    </div>
  )
}

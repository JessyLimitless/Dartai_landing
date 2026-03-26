import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { GRADE_COLORS, FONTS } from '../constants/theme'
import { API } from '../lib/api'
import DisclosureModal from './DisclosureModal'

// ── 데이터 훅 ──────────────────────────────────────────────────

function useTodayTracks() {
  const [data, setData] = useState({ tracks: [], total: 0, surge_count: 0, date: '' })
  const [loading, setLoading] = useState(true)
  const prevSurgesRef = useRef(new Set())
  const [newSurge, setNewSurge] = useState(null)

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/price-tracks/today?days=3`)
      if (!res.ok) return
      const d = await res.json()
      const tracks = d.tracks || []

      const fresh = tracks.filter(t =>
        (t.live_change ?? 0) >= 2.0 && !prevSurgesRef.current.has(t.stock_code)
      )
      if (fresh.length > 0) {
        setNewSurge(fresh[0])
        setTimeout(() => setNewSurge(null), 6000)
      }
      prevSurgesRef.current = new Set(
        tracks.filter(t => (t.live_change ?? 0) >= 2.0).map(t => t.stock_code)
      )
      setData(d)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [load])

  return { ...data, loading, newSurge, dismissSurge: () => setNewSurge(null) }
}

// 주차 계산 유틸
function getWeekRange(weekOffset = 0) {
  const today = new Date()
  const day = today.getDay() // 0=일, 1=월 ... 6=토
  const mon = day === 0 ? 1 : -(day - 1) // 이번 주 월요일까지 거리
  const thisMonday = new Date(today)
  thisMonday.setDate(today.getDate() + mon + weekOffset * 7)
  thisMonday.setHours(0, 0, 0, 0)

  const fri = new Date(thisMonday)
  fri.setDate(thisMonday.getDate() + 4) // 금요일

  const fmt = d => d.toISOString().slice(0, 10)
  const label = weekOffset === 0
    ? '이번 주'
    : weekOffset === -1
    ? '지난 주'
    : `${Math.abs(weekOffset)}주 전`

  // 화면 표시용 (M/D ~ M/D)
  const display = `${thisMonday.getMonth() + 1}/${thisMonday.getDate()} ~ ${fri.getMonth() + 1}/${fri.getDate()}`

  return { from: fmt(thisMonday), to: fmt(fri), label, display }
}

function useHistory(weekOffset) {
  const [data, setData] = useState({ tracks: [], total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { from, to } = getWeekRange(weekOffset)
    setLoading(true)
    fetch(`${API}/api/price-tracks/history?from_date=${from}&to_date=${to}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [weekOffset])

  return { ...data, loading }
}

function useStats(weekOffset) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { from, to } = getWeekRange(weekOffset)
    setLoading(true)
    fetch(`${API}/api/price-tracks/stats?from_date=${from}&to_date=${to}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [weekOffset])

  return { data, loading }
}

// ── 유틸 ───────────────────────────────────────────────────────

function pctColor(v) {
  if (v == null) return '#A1A1AA'
  if (v > 0) return '#DC2626'
  if (v < 0) return '#2563EB'
  return '#71717A'
}

function fmtPct(v) {
  if (v == null) return '—'
  return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`
}

function fmtDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// ── 서브 컴포넌트 ─────────────────────────────────────────────

function SurgeAlert({ item, onClose }) {
  if (!item) return null
  return (
    <div style={{
      position: 'fixed', top: 66, left: '50%', transform: 'translateX(-50%)',
      zIndex: 2000,
      background: 'linear-gradient(135deg, #18181B, #27272A)',
      color: '#fff', borderRadius: 14, padding: '12px 20px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      border: '1px solid rgba(255,255,255,0.1)',
      minWidth: 280, animation: 'surgeIn 0.3s ease-out',
    }}>
      <span style={{ fontSize: 20 }}>🚀</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 13 }}>
          {item.corp_name} {fmtPct(item.live_change)} 급등
        </div>
        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 1 }}>
          [{item.grade}] {item.report_nm?.slice(0, 28)}
        </div>
      </div>
      <button onClick={onClose} style={{
        background: 'rgba(255,255,255,0.2)', border: 'none',
        color: '#fff', borderRadius: 6, padding: '3px 8px', fontSize: 11, cursor: 'pointer',
      }}>✕</button>
    </div>
  )
}

function PctCell({ value }) {
  const col = pctColor(value)
  const bg = value == null ? 'transparent'
    : value > 0 ? 'rgba(220,38,38,0.08)'
    : value < 0 ? 'rgba(37,99,235,0.08)'
    : 'transparent'
  return (
    <span style={{
      fontFamily: FONTS.mono, fontSize: 12, fontWeight: value != null ? 700 : 400,
      color: col, background: bg,
      padding: value != null ? '2px 6px' : '0',
      borderRadius: 5, display: 'inline-block', minWidth: 58, textAlign: 'right',
    }}>
      {fmtPct(value)}
    </span>
  )
}

function SortIcon({ col, sortCol, sortAsc }) {
  if (sortCol !== col) return <span style={{ color: '#52525B', fontSize: 10, marginLeft: 2 }}>⇅</span>
  return <span style={{ color: colors.textPrimary, fontSize: 10, marginLeft: 2 }}>{sortAsc ? '↑' : '↓'}</span>
}

// ── 통계 요약 카드 ──────────────────────────────────────────────

function StatsCards({ data, loading, colors, dark }) {
  if (loading || !data) return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{
          flex: 1, height: 80, borderRadius: 12,
          background: dark ? '#18181B' : '#F4F4F5',
          animation: 'pulse 1.4s ease-in-out infinite',
        }} />
      ))}
    </div>
  )

  const gradeStats = data.grade_stats || []
  const daily = data.daily_counts || []
  const totalDays = daily.length
  const surgeDays = daily.filter(d => (d.surge_cnt ?? 0) > 0).length

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
      {gradeStats.map(g => (
        <div key={g.grade} style={{
          flex: '1 1 140px',
          background: dark ? '#18181B' : '#fff',
          border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span style={{
              background: GRADE_COLORS[g.grade]?.bg || '#888',
              color: GRADE_COLORS[g.grade]?.color || '#fff',
              fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 4,
              fontFamily: FONTS.mono,
            }}>{g.grade}</span>
            <span style={{ fontSize: 11, color: colors.textMuted }}>{g.cnt}건</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>종가 평균</div>
              <div style={{
                fontSize: 15, fontWeight: 700, fontFamily: FONTS.mono,
                color: pctColor(g.avg_close),
              }}>{fmtPct(g.avg_close)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 2 }}>상승 확률</div>
              <div style={{
                fontSize: 15, fontWeight: 700, fontFamily: FONTS.mono,
                color: colors.textPrimary,
              }}>{g.win_rate ?? '—'}%</div>
            </div>
          </div>
        </div>
      ))}

      <div style={{
        flex: '1 1 140px',
        background: dark ? '#18181B' : '#fff',
        border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
        borderRadius: 12, padding: '14px 16px',
      }}>
        <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8 }}>기간 요약</div>
        <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.9 }}>
          <div>{totalDays}거래일 추적</div>
          <div style={{ color: colors.textPrimary, fontWeight: 600 }}>급등일 {surgeDays}회</div>
        </div>
      </div>
    </div>
  )
}

// ── 오늘 실시간 테이블 ─────────────────────────────────────────

function TodayTable({ tracks, loading, onOpenModal, colors, dark }) {
  const [sortCol, setSortCol] = useState('live_change')
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = col => {
    if (sortCol === col) setSortAsc(p => !p)
    else { setSortCol(col); setSortAsc(false) }
  }

  const sorted = [...tracks].sort((a, b) => {
    const av = a[sortCol] ?? -Infinity
    const bv = b[sortCol] ?? -Infinity
    return sortAsc ? av - bv : bv - av
  })

  const COLS = [
    { key: 'corp_name',    label: '종목',     sortable: false, w: null },
    { key: 'grade',        label: '등급',     sortable: false, w: 52 },
    { key: 'base_price',   label: '기준가',   sortable: true,  w: 90 },
    { key: 'change_close', label: '종가 변동률', sortable: true,  w: 110 },
  ]

  const thSt = col => ({
    padding: '9px 10px', fontSize: 11, fontWeight: 600,
    color: sortCol === col.key ? colors.textPrimary : colors.textMuted,
    textAlign: col.key === 'corp_name' ? 'left' : 'right',
    cursor: col.sortable ? 'pointer' : 'default',
    userSelect: 'none', whiteSpace: 'nowrap', width: col.w || undefined,
    borderBottom: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
    background: dark ? '#18181B' : '#FAFAFA',
  })

  if (loading) return (
    <div style={{ background: dark ? '#18181B' : '#fff', border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`, borderRadius: 12, overflow: 'hidden' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ height: 44, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, borderBottom: i < 5 ? `1px solid ${dark ? '#27272A' : '#F4F4F5'}` : 'none' }}>
          <div style={{ width: 120, height: 10, borderRadius: 4, background: dark ? '#27272A' : '#F4F4F5', animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div style={{ flex: 1 }} /><div style={{ width: 50, height: 10, borderRadius: 4, background: dark ? '#27272A' : '#F4F4F5', animation: 'pulse 1.4s ease-in-out infinite' }} />
        </div>
      ))}
    </div>
  )

  if (tracks.length === 0) return (
    <div style={{ background: dark ? '#18181B' : '#fff', border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`, borderRadius: 12, padding: '60px 20px', textAlign: 'center', color: colors.textMuted }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
      오늘 S·A 등급 공시 없음<br /><span style={{ fontSize: 12 }}>공시 발생 시 자동 추적 시작</span>
    </div>
  )

  return (
    <div style={{ background: dark ? '#18181B' : '#fff', border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`, borderRadius: 12, overflow: 'hidden', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
        <thead>
          <tr>{COLS.map(col => (
            <th key={col.key} onClick={col.sortable ? () => handleSort(col.key) : undefined} style={thSt(col)}>
              {col.label}{col.sortable && <SortIcon col={col.key} sortCol={sortCol} sortAsc={sortAsc} />}
            </th>
          ))}</tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => {
            const gc = GRADE_COLORS[t.grade] || { bg: '#A1A1AA', color: '#fff' }
            const isSurge = (t.live_change ?? 0) >= 2.0
            const rowBg = isSurge ? (dark ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.03)') : 'transparent'
            const border = i < sorted.length - 1 ? `1px solid ${dark ? '#27272A' : '#F4F4F5'}` : 'none'
            return (
              <tr key={t.rcept_no || t.stock_code} onClick={() => onOpenModal?.(t.rcept_no)}
                style={{ background: rowBg, cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = rowBg}
              >
                <td style={{ padding: '10px 10px', borderBottom: border }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    {isSurge && <span style={{ fontSize: 11 }}>🚀</span>}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: dark ? '#FAFAFA' : '#18181B', fontFamily: FONTS.serif }}>{t.corp_name || t.stock_code}</div>
                      <div style={{ fontSize: 10, color: colors.textMuted, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.report_nm || '공시'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 10px', textAlign: 'center', borderBottom: border }}>
                  <span style={{ background: gc.bg, color: gc.color, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, fontFamily: FONTS.mono }}>{t.grade}</span>
                </td>
                <td style={{ padding: '10px 10px', textAlign: 'right', borderBottom: border }}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: colors.textSecondary }}>{t.base_price ? t.base_price.toLocaleString() : '—'}</span>
                </td>
                <td style={{ padding: '10px 10px', textAlign: 'right', borderBottom: border }}>
                  <PctCell value={t['change_close']} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── 히스토리 테이블 ────────────────────────────────────────────

function HistoryTable({ tracks, loading, onOpenModal, colors, dark }) {
  const [sortCol, setSortCol] = useState('created_at')
  const [sortAsc, setSortAsc] = useState(false)

  const handleSort = col => {
    if (sortCol === col) setSortAsc(p => !p)
    else { setSortCol(col); setSortAsc(false) }
  }

  const sorted = [...tracks].sort((a, b) => {
    if (sortCol === 'created_at') {
      const av = a.created_at || ''
      const bv = b.created_at || ''
      return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av)
    }
    const av = a[sortCol] ?? -Infinity
    const bv = b[sortCol] ?? -Infinity
    return sortAsc ? av - bv : bv - av
  })

  const COLS = [
    { key: 'created_at',   label: '날짜',       sortable: true,  w: 52 },
    { key: 'corp_name',    label: '종목',       sortable: false, w: null },
    { key: 'grade',        label: '등급',       sortable: false, w: 48 },
    { key: 'change_close', label: '종가 변동률', sortable: true,  w: 110 },
  ]

  const thSt = col => ({
    padding: '9px 10px', fontSize: 11, fontWeight: 600,
    color: sortCol === col.key ? colors.textPrimary : colors.textMuted,
    textAlign: col.key === 'corp_name' ? 'left' : 'right',
    cursor: col.sortable ? 'pointer' : 'default',
    userSelect: 'none', whiteSpace: 'nowrap', width: col.w || undefined,
    borderBottom: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
    background: dark ? '#18181B' : '#FAFAFA',
  })

  if (loading) return (
    <div style={{ background: dark ? '#18181B' : '#fff', border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`, borderRadius: 12, overflow: 'hidden' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ height: 40, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12, borderBottom: i < 7 ? `1px solid ${dark ? '#27272A' : '#F4F4F5'}` : 'none' }}>
          <div style={{ width: 36, height: 9, borderRadius: 4, background: dark ? '#27272A' : '#F4F4F5', animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div style={{ width: 100, height: 9, borderRadius: 4, background: dark ? '#27272A' : '#F4F4F5', animation: 'pulse 1.4s ease-in-out infinite' }} />
          <div style={{ flex: 1 }} />
          <div style={{ width: 50, height: 9, borderRadius: 4, background: dark ? '#27272A' : '#F4F4F5', animation: 'pulse 1.4s ease-in-out infinite' }} />
        </div>
      ))}
    </div>
  )

  if (tracks.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textMuted }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
      해당 기간에 추적 데이터 없음
    </div>
  )

  return (
    <div style={{ background: dark ? '#18181B' : '#fff', border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`, borderRadius: 12, overflow: 'hidden', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
        <thead>
          <tr>{COLS.map(col => (
            <th key={col.key} onClick={col.sortable ? () => handleSort(col.key) : undefined} style={thSt(col)}>
              {col.label}{col.sortable && <SortIcon col={col.key} sortCol={sortCol} sortAsc={sortAsc} />}
            </th>
          ))}</tr>
        </thead>
        <tbody>
          {sorted.map((t, i) => {
            const gc = GRADE_COLORS[t.grade] || { bg: '#A1A1AA', color: '#fff' }
            const isSurge = (t.change_close ?? 0) >= 2.0
            const border = i < sorted.length - 1 ? `1px solid ${dark ? '#27272A' : '#F4F4F5'}` : 'none'
            return (
              <tr key={`${t.rcept_no}-${i}`} onClick={() => onOpenModal?.(t.rcept_no)}
                style={{ cursor: 'pointer', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.03)' : '#F9FAFB'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '9px 10px', textAlign: 'right', borderBottom: border }}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: colors.textMuted }}>{fmtDate(t.created_at)}</span>
                </td>
                <td style={{ padding: '9px 10px', borderBottom: border }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: dark ? '#FAFAFA' : '#18181B' }}>
                    {isSurge ? '🚀 ' : ''}{t.corp_name || t.stock_code}
                  </div>
                  <div style={{ fontSize: 10, color: colors.textMuted, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.report_nm || '공시'}</div>
                </td>
                <td style={{ padding: '9px 10px', textAlign: 'center', borderBottom: border }}>
                  <span style={{ background: gc.bg, color: gc.color, fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, fontFamily: FONTS.mono }}>{t.grade}</span>
                </td>
                <td style={{ padding: '9px 10px', textAlign: 'right', borderBottom: border }}>
                  <PctCell value={t['change_close']} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── 메인 페이지 ────────────────────────────────────────────────

function useBackfill() {
  const [status, setStatus] = useState(null) // null | 'loading' | 'done' | 'error'
  const run = async () => {
    setStatus('loading')
    try {
      const res = await fetch(`${API}/api/price-tracks/backfill`, { method: 'POST' })
      if (res.ok) setStatus('done')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
    setTimeout(() => setStatus(null), 4000)
  }
  return { status, run }
}

export default function AiLivePage({ onViewCard }) {
  const { colors, dark } = useTheme()
  const [view, setView] = useState('today')
  const [weekOffset, setWeekOffset] = useState(0) // 0=이번주, -1=지난주, ...
  const backfill = useBackfill()
  const [modalRceptNo, setModalRceptNo] = useState(null)

  const nowHour = new Date().getHours()
  const nowMin = new Date().getMinutes()
  const isAfterMarket = nowHour > 15 || (nowHour === 15 && nowMin >= 30)

  const today = useTodayTracks()
  const history = useHistory(weekOffset)
  const stats = useStats(weekOffset)
  const weekInfo = getWeekRange(weekOffset)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 20px', fontFamily: FONTS.body }}>

      <SurgeAlert item={today.newSurge} onClose={today.dismissSurge} />

      {/* 페이지 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontFamily: FONTS.serif, fontSize: 20, fontWeight: 700, color: colors.textPrimary }}>
            공시 후 주가 추적
          </span>
          <span style={{
            background: isAfterMarket ? '#52525B' : '#18181B',
            color: isAfterMarket ? '#A1A1AA' : '#22C55E', fontSize: 9, fontWeight: 800,
            padding: '2px 7px', borderRadius: 20, letterSpacing: '0.1em',
            border: isAfterMarket ? 'none' : '1px solid rgba(34,197,94,0.3)',
          }}>{isAfterMarket ? '장 마감' : 'LIVE'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <p style={{ margin: 0, fontSize: 12, color: colors.textMuted }}>
            당일 시가 기준 → 종가 변동률 측정 · 매일 누적
          </p>
          <button
            onClick={backfill.run}
            disabled={backfill.status === 'loading'}
            style={{
              fontSize: 11, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
              background: backfill.status === 'done' ? '#22C55E' : backfill.status === 'error' ? '#EF4444' : 'transparent',
              color: backfill.status ? '#fff' : colors.textMuted,
              transition: 'all 0.15s',
            }}
          >
            {backfill.status === 'loading' ? '갱신 중...' : backfill.status === 'done' ? '완료' : backfill.status === 'error' ? '실패' : '변동률 갱신'}
          </button>
        </div>
      </div>

      {/* 통계 카드 */}
      <StatsCards data={stats.data} loading={stats.loading} colors={colors} dark={dark} />

      {/* 뷰 탭 */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, borderBottom: `1px solid ${dark ? '#27272A' : '#E4E4E7'}` }}>
        {[
          { key: 'today', label: '오늘 실시간' },
          { key: 'history', label: '주간 히스토리' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            style={{
              padding: '8px 14px', border: 'none', cursor: 'pointer',
              background: 'transparent', fontSize: 13,
              fontWeight: view === t.key ? 600 : 400,
              color: view === t.key ? colors.textPrimary : colors.textSecondary,
              borderBottom: view === t.key ? `2px solid ${colors.textPrimary}` : '2px solid transparent',
              marginBottom: -1, transition: 'all 0.15s',
            }}
          >
            {t.label}
            {t.key === 'today' && today.total > 0 && (
              <span style={{
                marginLeft: 6, fontSize: 10, fontFamily: FONTS.mono,
                background: dark ? '#27272A' : '#F4F4F5',
                color: colors.textMuted, padding: '1px 5px', borderRadius: 10,
              }}>{today.total}</span>
            )}
          </button>
        ))}
      </div>

      {/* 메인 테이블 */}
      {view === 'today' ? (
        <TodayTable tracks={today.tracks} loading={today.loading} onOpenModal={setModalRceptNo} colors={colors} dark={dark} />
      ) : (
        <HistoryTable tracks={history.tracks} loading={history.loading} onOpenModal={setModalRceptNo} colors={colors} dark={dark} />
      )}

      {/* 주차 페이지 터너 */}
      {view === 'history' && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 12, marginTop: 20, padding: '14px 0',
          borderTop: `1px solid ${dark ? '#27272A' : '#F4F4F5'}`,
        }}>
          <button
            onClick={() => setWeekOffset(w => w - 1)}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
              background: dark ? '#18181B' : '#fff',
              color: colors.textSecondary, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = colors.textPrimary; e.currentTarget.style.color = colors.textPrimary }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? '#27272A' : '#E4E4E7'; e.currentTarget.style.color = colors.textSecondary }}
          >‹</button>

          <div style={{ textAlign: 'center', minWidth: 140 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>
              {weekInfo.label}
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono, marginTop: 2 }}>
              {weekInfo.display}
              {!history.loading && (
                <span style={{ marginLeft: 8, color: colors.textMuted }}>· {history.total}건</span>
              )}
            </div>
          </div>

          <button
            onClick={() => setWeekOffset(w => Math.min(w + 1, 0))}
            disabled={weekOffset >= 0}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
              background: dark ? '#18181B' : '#fff',
              color: weekOffset >= 0 ? (dark ? '#3F3F46' : '#D4D4D8') : colors.textSecondary,
              cursor: weekOffset >= 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (weekOffset < 0) { e.currentTarget.style.borderColor = colors.textPrimary; e.currentTarget.style.color = colors.textPrimary } }}
            onMouseLeave={e => { if (weekOffset < 0) { e.currentTarget.style.borderColor = dark ? '#27272A' : '#E4E4E7'; e.currentTarget.style.color = colors.textSecondary } }}
          >›</button>
        </div>
      )}

      {modalRceptNo && (
        <DisclosureModal
          rcept_no={modalRceptNo}
          onClose={() => setModalRceptNo(null)}
          onViewCard={onViewCard}
        />
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes surgeIn { from{opacity:0;transform:translateX(-50%) translateY(-14px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
      `}</style>
    </div>
  )
}

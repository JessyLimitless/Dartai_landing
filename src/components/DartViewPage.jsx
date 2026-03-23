import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'
import { API } from '../lib/api'

export default function DartViewPage() {
  const { colors, dark } = useTheme()
  const navigate = useNavigate()
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [marketFilter, setMarketFilter] = useState(null) // null | '코스피' | '코스닥'
  const inputRef = useRef(null)

  useEffect(() => {
    fetch(`${API}/api/dart-view/ranking`)
      .then(r => r.json())
      .then(d => setStocks(d.ranking || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    let list = stocks
    if (marketFilter) list = list.filter(s => s.market_type === marketFilter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.corp_name?.toLowerCase().includes(q) || s.stock_code?.includes(q)
      )
    }
    return list
  }, [stocks, marketFilter, search])

  const stats = useMemo(() => ({
    total: stocks.length,
    kospi: stocks.filter(s => s.market_type === '코스피').length,
    kosdaq: stocks.filter(s => s.market_type === '코스닥').length,
    analyzed: stocks.filter(s => s.deep_analysis).length,
  }), [stocks])

  const sep = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  const gradeColor = (score) => {
    if (!score) return colors.textMuted
    if (score >= 85) return '#16A34A'
    if (score >= 70) return '#0D9488'
    if (score >= 55) return '#D97706'
    if (score >= 40) return '#EA580C'
    return '#DC2626'
  }

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* 헤더 */}
      <div style={{ padding: '24px 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>
            DART <span style={{ color: PREMIUM.accent }}>View</span>
          </div>
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4 }}>
          시총 TOP {stats.total} 재무 딥분석
        </div>
      </div>

      {/* 검색 */}
      <div style={{ padding: '16px 24px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '0 14px', borderRadius: 12, height: 44,
          background: dark ? '#1A1A1E' : '#F4F4F5',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input ref={inputRef} type="text" placeholder="종목명 또는 코드 검색"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, padding: '10px 0', fontSize: 15, border: 'none',
              background: 'transparent', color: colors.textPrimary, outline: 'none',
            }} />
          {search && (
            <button onClick={() => setSearch('')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: colors.textMuted, fontSize: 18, padding: '4px',
            }}>×</button>
          )}
        </div>
      </div>

      {/* 시장 필터 */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 24px 0' }}>
        {[
          { key: null, label: '전체', count: stats.total },
          { key: '코스피', label: '코스피', count: stats.kospi, color: '#2563EB' },
          { key: '코스닥', label: '코스닥', count: stats.kosdaq, color: '#D97706' },
        ].map(t => {
          const active = marketFilter === t.key
          return (
            <button key={t.label} onClick={() => setMarketFilter(active ? null : t.key)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600,
                background: active ? (t.color || PREMIUM.accent) : (dark ? '#1A1A1E' : '#F4F4F5'),
                color: active ? '#fff' : colors.textMuted,
                transition: 'all 0.15s',
              }}>
              {t.label} {t.count}
            </button>
          )
        })}
      </div>

      {/* 리스트 */}
      <div style={{ padding: '12px 24px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '20px 0' }}>
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} style={{
                height: 52, borderRadius: 10,
                background: dark ? '#1A1A1E' : '#F4F4F5',
                animation: 'pulse 1.4s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>
            검색 결과가 없습니다
          </div>
        ) : (
          <div style={{
            borderRadius: 14, overflow: 'hidden',
            border: `1px solid ${sep}`,
            background: dark ? '#141416' : '#fff',
          }}>
            {filtered.map((item, i) => (
              <div key={item.stock_code}
                className="touch-press"
                onClick={() => navigate(`/deep-dive/${item.stock_code}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px', cursor: 'pointer',
                  borderBottom: i < filtered.length - 1 ? `1px solid ${sep}` : 'none',
                  transition: 'background 0.1s',
                }}>
                {/* 순위 */}
                <span style={{
                  fontSize: 12, fontWeight: 700, color: colors.textMuted,
                  fontFamily: FONTS.mono, width: 28, textAlign: 'right', flexShrink: 0,
                }}>
                  {item.rank}
                </span>

                {/* 종목명 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14, fontWeight: 700, color: colors.textPrimary,
                    fontFamily: FONTS.serif,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.corp_name}
                  </div>
                  <div style={{
                    fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono, marginTop: 1,
                  }}>
                    {item.stock_code}
                  </div>
                </div>

                {/* 종합등급 */}
                {item.grade && (
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: gradeColor(item.score),
                    fontFamily: FONTS.mono, flexShrink: 0,
                    padding: '2px 8px', borderRadius: 6,
                    background: `${gradeColor(item.score)}15`,
                  }}>
                    {item.grade}
                  </span>
                )}

                {/* 시장구분 */}
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 5px', borderRadius: 4,
                  background: item.market_type === '코스피' ? 'rgba(37,99,235,0.1)' : 'rgba(217,119,6,0.1)',
                  color: item.market_type === '코스피' ? '#2563EB' : '#D97706',
                  flexShrink: 0,
                }}>
                  {item.market_type}
                </span>

                {/* 시총 */}
                <span style={{
                  fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono,
                  flexShrink: 0, minWidth: 44, textAlign: 'right',
                }}>
                  {item.market_cap >= 10000 ? `${(item.market_cap / 10000).toFixed(1)}조` : `${Math.round(item.market_cap).toLocaleString()}억`}
                </span>

                {/* 화살표 */}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'

const API = import.meta.env.VITE_API_URL || ''

export default function SignalPage() {
  const { dark, colors } = useTheme()
  const [items, setItems] = useState([])
  const [heatmap, setHeatmap] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('rank')

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/impact`).then(r => r.json()),
      fetch(`${API}/api/impact/heatmap`).then(r => r.json()),
    ]).then(([d1, d2]) => {
      setItems(d1.items || [])
      setHeatmap(d2.cells || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const t = {
    red: '#F04452', blue: '#3182F6',
    dim: dark ? '#555' : '#ADB5BD',
    bg: dark ? '#000' : '#F4F5F7',
    card: dark ? '#1C1C1E' : '#FFF',
    border: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
  }

  const total = items.reduce((a, i) => a + i.count, 0)
  const hmTypes = [...new Set(heatmap.map(c => c.type))]
  const hmMap = {}
  heatmap.forEach(c => { hmMap[`${c.type}_${c.grade}`] = c })

  return (
    <div className="page-enter" style={{
      maxWidth: 480, margin: '0 auto', minHeight: '100vh',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: t.bg,
    }}>
      <div style={{ padding: '32px 20px 0' }}>
        <h1 style={{ fontSize: 21, fontWeight: 800, color: colors.textPrimary, margin: 0, letterSpacing: '-0.5px' }}>
          공시 시그널
        </h1>
        <p style={{ fontSize: 13, color: t.dim, margin: '4px 0 0' }}>
          {total.toLocaleString()}건 분석
        </p>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 0, margin: '14px 16px 0', borderBottom: `1px solid ${t.border}` }}>
        {[{ key: 'rank', label: '초과수익률' }, { key: 'heatmap', label: '등급별 승률' }].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '10px 16px', border: 'none', cursor: 'pointer', background: 'none',
            fontSize: 14, fontWeight: tab === key ? 800 : 500,
            color: tab === key ? colors.textPrimary : t.dim,
            borderBottom: tab === key ? `2px solid ${colors.textPrimary}` : '2px solid transparent',
            marginBottom: -1,
          }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: t.dim, fontSize: 13 }}>분석 중...</div>
      ) : tab === 'rank' ? (
        <div style={{ margin: '8px 16px', borderRadius: 14, overflow: 'hidden', background: t.card, border: `1px solid ${t.border}` }}>
          {items.map((item, idx) => {
            const ex = item.avg_excess_close || 0
            const up = ex >= 0
            const wr = item.win_rate || 0
            return (
              <div key={item.type} style={{
                display: 'flex', alignItems: 'center', padding: '13px 16px',
                borderBottom: idx < items.length - 1 ? `1px solid ${t.border}` : 'none',
              }}>
                <span style={{ width: 20, fontSize: 13, fontWeight: 800, fontFamily: FONTS.mono, color: idx < 3 && up ? t.red : t.dim, textAlign: 'center', flexShrink: 0 }}>{idx + 1}</span>
                <div style={{ flex: 1, margin: '0 12px', minWidth: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>{item.type}</span>
                  <span style={{ fontSize: 10, color: t.dim, fontFamily: FONTS.mono, marginLeft: 6 }}>{item.count}건 · 승률 {wr.toFixed(0)}%</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 900, fontFamily: FONTS.mono, color: up ? t.red : t.blue, flexShrink: 0 }}>{up ? '+' : ''}{ex.toFixed(2)}%</span>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={{ margin: '8px 16px', borderRadius: 14, overflow: 'hidden', background: t.card, border: `1px solid ${t.border}` }}>
          {/* 헤더 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px', borderBottom: `1px solid ${t.border}`, padding: '10px 14px' }}>
            <span style={{ fontSize: 11, color: t.dim }}>유형</span>
            {['S', 'A', 'D'].map(g => (
              <span key={g} style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: { S: t.red, A: t.blue, D: '#FF8A3D' }[g] }}>{g}</span>
            ))}
          </div>
          {/* 행 */}
          {hmTypes.map((type, ti) => (
            <div key={type} style={{
              display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px', padding: '11px 14px',
              borderBottom: ti < hmTypes.length - 1 ? `1px solid ${t.border}` : 'none',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{type}</span>
              {['S', 'A', 'D'].map(g => {
                const cell = hmMap[`${type}_${g}`]
                if (!cell) return <span key={g} style={{ textAlign: 'center', fontSize: 12, color: dark ? 'rgba(255,255,255,0.06)' : '#E4E4E7' }}>-</span>
                const wr = cell.win_rate
                return (
                  <span key={g} style={{
                    textAlign: 'center', fontSize: 14, fontWeight: 800, fontFamily: FONTS.mono,
                    color: wr >= 50 ? t.red : t.blue,
                  }}>{wr.toFixed(0)}%</span>
                )
              })}
            </div>
          ))}
        </div>
      )}

      <div style={{ margin: '6px 16px', padding: '10px 14px', borderRadius: 10, fontSize: 11, color: t.dim, lineHeight: 1.6 }}>
        {tab === 'rank' ? '초과수익률 = 종목 - 시장 수익률' : '승률 = 공시 후 시장 대비 상승 비율 · 3건 미만 제외'}
      </div>
    </div>
  )
}

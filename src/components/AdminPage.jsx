import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'

const ADMIN_EMAIL = 'j07087815@gmail.com'

export function isAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem('dart_user'))
    return user?.email === ADMIN_EMAIL
  } catch {
    return false
  }
}

export default function AdminPage() {
  const { colors, dark } = useTheme()
  const navigate = useNavigate()
  const [tab, setTab] = useState('ranking') // 'ranking' | 'disclosures' | 'inquiries'
  const [ranking, setRanking] = useState([])
  const [rankingStats, setRankingStats] = useState({ total: 0, done: 0 })
  const [disclosures, setDisclosures] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin()) { navigate('/'); return }

    Promise.all([
      fetch(`${API}/api/admin/market-cap-ranking?limit=300`).then(r => r.json()),
      fetch(`${API}/api/admin/disclosures?limit=200`).then(r => r.json()),
      fetch(`${API}/api/admin/inquiries?limit=100`).then(r => r.json()),
    ]).then(([rankData, discData, inqData]) => {
      setRanking(rankData.ranking || [])
      setRankingStats({ total: rankData.total || 0, done: rankData.done || 0, kospi: rankData.kospi_count || 0, kosdaq: rankData.kosdaq_count || 0 })
      setDisclosures(discData.disclosures || [])
      setInquiries(inqData.inquiries || [])
    }).catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const sep = dark ? '#1E1E22' : '#F0F0F2'
  const pct = rankingStats.total > 0 ? Math.round(rankingStats.done / rankingStats.total * 100) : 0

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 80px', fontFamily: FONTS.body }}>

      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, background: '#DC2626' }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>관리자</h1>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderRadius: 8, overflow: 'hidden', border: `1px solid ${sep}` }}>
        {[
          { key: 'ranking', label: `시총 순위 (${rankingStats.done}/${rankingStats.total})` },
          { key: 'disclosures', label: `공시 (${disclosures.length})` },
          { key: 'inquiries', label: `문의 (${inquiries.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            background: tab === t.key ? '#DC2626' : (dark ? '#141416' : '#fff'),
            color: tab === t.key ? '#fff' : colors.textMuted,
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>로딩 중...</div>
      ) : tab === 'ranking' ? (
        <>
          {/* 진행률 바 */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: colors.textMuted }}>딥분석 진행률</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>{pct}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: dark ? '#1E1E22' : '#F4F4F5', overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', borderRadius: 3, background: '#DC2626', transition: 'width 0.5s' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <span style={{ fontSize: 11, color: colors.textMuted }}>코스피 <b style={{ color: '#2563EB' }}>{rankingStats.kospi}</b></span>
              <span style={{ fontSize: 11, color: colors.textMuted }}>코스닥 <b style={{ color: '#D97706' }}>{rankingStats.kosdaq}</b></span>
              <span style={{ fontSize: 11, color: colors.textMuted }}>완료 <b style={{ color: '#16A34A' }}>{rankingStats.done}</b>/{rankingStats.total}</span>
            </div>
          </div>

          {/* 시총 순위 테이블 */}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${sep}`, background: dark ? '#141416' : '#fff' }}>
            {/* 헤더 */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: dark ? '#1A1A1E' : '#F9FAFB',
              borderBottom: `1px solid ${sep}`,
            }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, width: 28, textAlign: 'right' }}>#</span>
              <span style={{ width: 8 }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, flex: 1 }}>종목명</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, width: 42, textAlign: 'center' }}>점수</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, width: 36, textAlign: 'center' }}>등급</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, width: 38, textAlign: 'center' }}>시장</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, width: 52, textAlign: 'right' }}>시총</span>
            </div>
            {ranking.map((item, i) => {
              const sc = item.score
              const scoreColor = sc >= 85 ? '#16A34A' : sc >= 70 ? '#0D9488' : sc >= 55 ? '#D97706' : sc >= 40 ? '#EA580C' : sc != null ? '#DC2626' : colors.textMuted
              const gradeBg = sc >= 85 ? 'rgba(22,163,74,0.12)' : sc >= 70 ? 'rgba(13,148,136,0.12)' : sc >= 55 ? 'rgba(217,119,6,0.10)' : sc >= 40 ? 'rgba(234,88,12,0.10)' : sc != null ? 'rgba(220,38,38,0.10)' : 'transparent'
              return (
                <div key={item.stock_code}
                  onClick={() => navigate(`/deep-dive/${item.stock_code}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '9px 14px', cursor: 'pointer',
                    borderBottom: i < ranking.length - 1 ? `1px solid ${sep}` : 'none',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: colors.textMuted, fontFamily: FONTS.mono, width: 28, textAlign: 'right' }}>
                    {i + 1}
                  </span>
                  {item.deep_analysis ? (
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: '#16A34A', flexShrink: 0 }} />
                  ) : (
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: dark ? '#27272A' : '#E4E4E7', flexShrink: 0 }} />
                  )}
                  <span style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.corp_name}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor, fontFamily: FONTS.mono, width: 42, textAlign: 'center' }}>
                    {sc != null ? sc : '—'}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, width: 36, textAlign: 'center',
                    padding: '1px 0', borderRadius: 3,
                    background: gradeBg, color: scoreColor,
                  }}>
                    {item.grade || '—'}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 3, width: 38, textAlign: 'center',
                    background: item.market_type === '코스피' ? 'rgba(37,99,235,0.1)' : item.market_type === '코스닥' ? 'rgba(217,119,6,0.1)' : 'rgba(128,128,128,0.1)',
                    color: item.market_type === '코스피' ? '#2563EB' : item.market_type === '코스닥' ? '#D97706' : '#888',
                    flexShrink: 0,
                  }}>
                    {item.market_type}
                  </span>
                  <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono, width: 52, textAlign: 'right' }}>
                    {item.market_cap >= 10000 ? `${(item.market_cap / 10000).toFixed(1)}조` : `${Math.round(item.market_cap).toLocaleString()}억`}
                  </span>
                </div>
              )
            })}
          </div>
        </>
      ) : tab === 'disclosures' ? (
        disclosures.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>
            아직 수집된 프리미엄 공시가 없습니다.
          </div>
        ) : (
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${sep}`, background: dark ? '#141416' : '#fff' }}>
            {disclosures.map((d, i) => {
              const kstTime = d.created_at ? (() => {
                const dt = new Date(d.created_at)
                const k = new Date(dt.getTime() + 9 * 3600000)
                return `${k.getUTCMonth() + 1}/${k.getUTCDate()} ${String(k.getUTCHours()).padStart(2, '0')}:${String(k.getUTCMinutes()).padStart(2, '0')}`
              })() : ''
              return (
                <div key={d.rcept_no}
                  onClick={() => d.corp_code ? navigate(`/deep-dive/${d.corp_code}`) : null}
                  style={{
                    padding: '12px 14px', cursor: d.corp_code ? 'pointer' : 'default',
                    borderBottom: i < disclosures.length - 1 ? `1px solid ${sep}` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#DC2626', color: '#fff' }}>{d.grade}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{d.corp_name}</span>
                    <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono, marginLeft: 'auto' }}>{kstTime}</span>
                  </div>
                  <div style={{ fontSize: 12, color: colors.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.report_nm}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : tab === 'inquiries' ? (
        inquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>
            아직 접수된 문의가 없습니다.
          </div>
        ) : (
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${sep}`, background: dark ? '#141416' : '#fff' }}>
            {inquiries.map((inq, i) => {
              const kstTime = inq.created_at ? (() => {
                const dt = new Date(inq.created_at + 'Z')
                const k = new Date(dt.getTime() + 9 * 3600000)
                return `${k.getUTCMonth() + 1}/${k.getUTCDate()} ${String(k.getUTCHours()).padStart(2, '0')}:${String(k.getUTCMinutes()).padStart(2, '0')}`
              })() : ''
              return (
                <div key={inq.id}
                  onClick={() => {
                    if (!inq.is_read) {
                      fetch(`${API}/api/admin/inquiries/${inq.id}/read`, { method: 'POST' })
                      setInquiries(prev => prev.map(q => q.id === inq.id ? { ...q, is_read: 1 } : q))
                    }
                  }}
                  style={{
                    padding: '14px 16px', cursor: 'pointer',
                    borderBottom: i < inquiries.length - 1 ? `1px solid ${sep}` : 'none',
                    background: inq.is_read ? 'transparent' : (dark ? 'rgba(220,38,38,0.04)' : 'rgba(220,38,38,0.02)'),
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {!inq.is_read && <span style={{ width: 6, height: 6, borderRadius: 3, background: '#DC2626', flexShrink: 0 }} />}
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: dark ? '#1A1A1E' : '#F4F4F5', color: colors.textMuted }}>{inq.category}</span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{inq.name || '익명'}</span>
                    <span style={{ fontSize: 12, color: colors.textMuted, marginLeft: 'auto', fontFamily: FONTS.mono }}>{kstTime}</span>
                  </div>
                  {inq.contact && <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 4 }}>{inq.contact}</div>}
                  <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.5 }}>{inq.message}</div>
                </div>
              )
            })}
          </div>
        )
      ) : null}
    </div>
  )
}

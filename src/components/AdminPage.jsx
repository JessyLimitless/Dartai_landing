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
  const [tab, setTab] = useState('watch')
  const [ranking, setRanking] = useState([])
  const [rankingStats, setRankingStats] = useState({ total: 0, done: 0 })
  const [disclosures, setDisclosures] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [users, setUsers] = useState([])
  const [userTotal, setUserTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedDisc, setSelectedDisc] = useState(null)
  const [ssItems, setSsItems] = useState([])
  const [watchData, setWatchData] = useState(null)

  useEffect(() => {
    if (!isAdmin()) { navigate('/'); return }

    Promise.all([
      fetch(`${API}/api/admin/market-cap-ranking?limit=950`).then(r => r.json()),
      fetch(`${API}/api/admin/disclosures?limit=500`).then(r => r.json()),
      fetch(`${API}/api/admin/inquiries?limit=100`).then(r => r.json()),
      fetch(`${API}/api/admin/users`).then(r => r.json()),
      fetch(`${API}/api/admin/ss-screen`).then(r => r.json()),
      fetch(`${API}/api/watch/concentrated`).then(r => r.ok ? r.json() : null),
    ]).then(([rankData, discData, inqData, userData, ssData, watchResult]) => {
      setRanking(rankData.ranking || [])
      setRankingStats({ total: rankData.total || 0, done: rankData.done || 0, kospi: rankData.kospi_count || 0, kosdaq: rankData.kosdaq_count || 0 })
      setDisclosures(discData.disclosures || [])
      setInquiries(inqData.inquiries || [])
      setUsers(userData.users || [])
      setUserTotal(userData.total || 0)
      setSsItems(ssData.items || [])
      if (watchResult) setWatchData(watchResult)
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
          { key: 'ss', label: `SS급 (${ssItems.length})` },
          { key: 'watch', label: `소수계좌 (${watchData ? (watchData.total_active || 0) : 0})` },
          { key: 'users', label: `유저 (${userTotal})` },
          { key: 'ranking', label: `시총 (${rankingStats.done}/${rankingStats.total})` },
          { key: 'disclosures', label: `공시 (${disclosures.length})` },
          { key: 'inquiries', label: `문의 (${inquiries.length})` },
          { key: 'strategy', label: '전략' },
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
      ) : tab === 'ss' ? (
        ssItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted, fontSize: 13 }}>SS급 종목 없음</div>
        ) : (
          <div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>
              소수계좌 3회+ & 경고 미도달 & 복합 시그널 교차
            </div>
            {ssItems.map((item, i) => (
              <div key={i} style={{
                padding: '14px 16px', borderRadius: 12, marginBottom: 8,
                background: item.grade === 'SS' ? (dark ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.03)') : (dark ? '#141416' : '#fff'),
                border: `1px solid ${item.grade === 'SS' ? 'rgba(220,38,38,0.15)' : sep}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
                      background: item.grade === 'SS' ? '#DC2626' : '#F59E0B',
                      color: '#fff',
                    }}>{item.grade}</span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: colors.textPrimary }}>{item.corp_name}</span>
                    <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>{item.stock_code}</span>
                  </div>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>
                    {item.market_cap ? item.market_cap.toLocaleString() + '억' : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                  <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 700 }}>주의 {item.caution_count}회</span>
                  {item.pbr != null && item.pbr > 0 && (
                    <span style={{ fontSize: 11, color: item.pbr < 1 ? '#DC2626' : colors.textMuted, fontWeight: 600 }}>PBR {item.pbr}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {item.signals.map((s, si) => (
                    <span key={si} style={{
                      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
                      background: dark ? 'rgba(255,255,255,0.04)' : '#F4F4F5',
                      color: colors.textSecondary,
                    }}>{s.type}{s.count ? ' ' + s.count + '건' : ''}{s.value ? ' ' + s.value : ''}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      ) : tab === 'watch' ? (
        !watchData || ((watchData.total_active || 0) + (watchData.total_halted || 0) === 0) ? (
          <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted, fontSize: 13 }}>소수계좌 감시 종목 없음</div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
              {[
                { label: '감시 중', value: watchData.total_active || 0, color: '#DC2626' },
                { label: '거래정지', value: watchData.total_halted || 0, color: '#6B7280' },
              ].map((s, i) => (
                <div key={i} style={{
                  flex: 1, padding: '16px', borderRadius: 12, textAlign: 'center',
                  border: `1px solid ${sep}`, background: dark ? '#141416' : '#fff',
                }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: FONTS.mono }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            {[...(watchData.active || []).map(s => ({ ...s, halted: false })),
              ...(watchData.halted || []).map(s => ({ ...s, halted: true }))].map((item) => {
              const STAGE = { 1: { label: '투자주의', bg: '#FBBF24', color: '#92400E' }, 2: { label: '투자경고', bg: '#F97316', color: '#FFF' }, 3: { label: '투자위험', bg: '#DC2626', color: '#FFF' }, 4: { label: '거래정지', bg: '#6B7280', color: '#FFF' } }
              const stage = STAGE[item.stage_level] || STAGE[1]
              const isHalted = item.halted || item.stage_level === 4
              const daysSince = item.first_detected ? Math.floor((Date.now() - new Date(item.first_detected + 'T00:00:00+09:00').getTime()) / 86400000) : null
              return (
                <div key={item.stock_code} onClick={() => navigate(`/deep-dive/${item.stock_code}`)} style={{
                  padding: '14px 16px', borderRadius: 12, marginBottom: 8, cursor: 'pointer',
                  background: dark ? 'rgba(255,255,255,0.03)' : '#FFF',
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  opacity: isHalted ? 0.5 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, fontFamily: FONTS.serif, textDecoration: isHalted ? 'line-through' : 'none' }}>{item.corp_name}</span>
                      <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono }}>{item.stock_code}</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: stage.bg, color: stage.color }}>{stage.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                    {item.first_detected && (
                      <span style={{ fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono }}>
                        {item.first_detected.slice(5)} 감지{daysSince != null && daysSince > 0 ? ` (D+${daysSince})` : ''}
                      </span>
                    )}
                    {item.pbr != null && item.pbr > 0 && item.pbr < 1 && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(22,163,74,0.08)', color: '#16A34A' }}>PBR {item.pbr.toFixed(1)}</span>
                    )}
                    {item.pbr != null && item.pbr >= 5 && (
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(220,38,38,0.08)', color: '#DC2626' }}>PBR {item.pbr.toFixed(1)}</span>
                    )}
                    {item.current_price != null && item.current_price > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 600, fontFamily: FONTS.mono, color: item.change_pct > 0 ? '#DC2626' : item.change_pct < 0 ? '#2563EB' : colors.textMuted, marginLeft: 'auto' }}>
                        {item.current_price.toLocaleString()}{item.change_pct != null && <> {item.change_pct > 0 ? '+' : ''}{item.change_pct.toFixed(1)}%</>}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : tab === 'users' ? (
        <>
          {/* 유저 요약 */}
          <div style={{
            display: 'flex', gap: 12, marginBottom: 20,
          }}>
            {[
              { label: '총 가입자', value: userTotal, color: '#DC2626' },
              { label: '오늘 로그인', value: users.filter(u => u.last_login?.startsWith(new Date().toISOString().slice(0, 10))).length, color: '#16A34A' },
            ].map((s, i) => (
              <div key={i} style={{
                flex: 1, padding: '16px', borderRadius: 12,
                border: `1px solid ${sep}`, textAlign: 'center',
                background: dark ? '#141416' : '#fff',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.color, fontFamily: FONTS.mono }}>{s.value}</div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* 유저 리스트 */}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${sep}`, background: dark ? '#141416' : '#fff' }}>
            {users.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: colors.textMuted }}>아직 가입자가 없습니다</div>
            ) : users.map((u, i) => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px',
                borderBottom: i < users.length - 1 ? `1px solid ${sep}` : 'none',
              }}>
                {u.picture ? (
                  <img src={u.picture} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E4E4E7' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: colors.textMuted }}>{u.email}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono }}>
                    접속 {u.login_count}회
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted }}>
                    가입 {u.created_at?.slice(0, 10)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
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

          {/* 시총 순위 리스트 */}
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${sep}`, background: dark ? '#141416' : '#fff' }}>
            {ranking.filter(item => item.market_type === '코스피' || item.market_type === '코스닥').map((item, i) => (
              <div key={item.stock_code}
                onClick={() => navigate(`/deep-dive/${item.stock_code}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 14px', cursor: 'pointer',
                  borderBottom: i < ranking.length - 1 ? `1px solid ${sep}` : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: colors.textMuted, fontFamily: FONTS.mono, width: 28, textAlign: 'right' }}>
                  {i + 1}
                </span>
                {item.deep_analysis ? (
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: '#16A34A', flexShrink: 0 }} />
                ) : (
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: dark ? '#27272A' : '#E4E4E7', flexShrink: 0 }} />
                )}
                <span style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, flex: 1 }}>
                  {item.corp_name}
                </span>
                {item.grade && (() => {
                  const sc = item.score
                  const gc = sc >= 85 ? '#16A34A' : sc >= 70 ? '#0D9488' : sc >= 55 ? '#D97706' : sc >= 40 ? '#EA580C' : '#DC2626'
                  return <span style={{ fontSize: 10, fontWeight: 700, color: gc, fontFamily: FONTS.mono, flexShrink: 0 }}>{item.grade}</span>
                })()}
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '1px 4px', borderRadius: 3,
                  background: item.market_type === '코스피' ? 'rgba(37,99,235,0.1)' : 'rgba(217,119,6,0.1)',
                  color: item.market_type === '코스피' ? '#2563EB' : '#D97706',
                  flexShrink: 0,
                }}>
                  {item.market_type}
                </span>
                <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
                  {item.market_cap >= 10000 ? `${(item.market_cap / 10000).toFixed(1)}조` : `${Math.round(item.market_cap).toLocaleString()}억`}
                </span>
              </div>
            ))}
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
                  onClick={() => setSelectedDisc(d)}
                  style={{
                    padding: '12px 14px', cursor: 'pointer',
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
      ) : tab === 'strategy' ? (
        <StrategyBlog colors={colors} dark={dark} sep={sep} />
      ) : null}

      {/* ── 공시 상세 팝업 모달 ── */}
      {selectedDisc && (
        <div onClick={() => setSelectedDisc(null)} style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: dark ? '#1A1A1E' : '#fff', borderRadius: 16,
            maxWidth: 480, width: '100%', maxHeight: '80vh', overflow: 'auto',
            border: `1px solid ${sep}`, boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* 헤더 */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${sep}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: '#DC2626', color: '#fff' }}>{selectedDisc.grade}</span>
                <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: dark ? '#27272A' : '#E4E4E7', color: colors.textMuted }}>이사회 공시</span>
              </div>
              <button onClick={() => setSelectedDisc(null)} style={{ background: 'none', border: 'none', fontSize: 18, color: colors.textMuted, cursor: 'pointer' }}>✕</button>
            </div>

            {/* 기업 정보 */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: colors.textPrimary, marginBottom: 4, fontFamily: FONTS.serif }}>
                {selectedDisc.corp_name}
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono, marginBottom: 12 }}>
                {selectedDisc.stock_code || ''} · {selectedDisc.rcept_no}
              </div>

              {/* 공시명 */}
              <div style={{ fontSize: 14, fontWeight: 600, color: colors.textPrimary, marginBottom: 4 }}>
                {selectedDisc.report_nm}
              </div>
              <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 16 }}>
                수집 시각: {selectedDisc.created_at || '-'}
              </div>

              {/* 액션 버튼 */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => window.open(`https://dart.fss.or.kr/dsaf001/main.do?rcpNo=${selectedDisc.rcept_no}`, '_blank')}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: '#DC2626', color: '#fff', fontSize: 13, fontWeight: 600,
                  }}
                >
                  DART 원문 보기
                </button>
                {selectedDisc.stock_code && (
                  <button
                    onClick={() => { setSelectedDisc(null); navigate(`/deep-dive/${selectedDisc.corp_code || selectedDisc.stock_code}`) }}
                    style={{
                      flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${sep}`, cursor: 'pointer',
                      background: 'transparent', color: colors.textPrimary, fontSize: 13, fontWeight: 600,
                    }}
                  >
                    기업카드 보기
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


/* ═══════════════════════════════════════════════════════════
   전략 블로그 — 시그널 모형 PRD + 아키텍처 회의록
   ═══════════════════════════════════════════════════════════ */

function StrategyBlog({ colors, dark, sep }) {
  const h1 = { fontSize: 26, fontWeight: 900, color: colors.textPrimary, margin: 0, fontFamily: FONTS.serif, lineHeight: 1.3 }
  const h2 = { fontSize: 19, fontWeight: 800, color: colors.textPrimary, margin: '48px 0 14px', fontFamily: FONTS.serif }
  const h3 = { fontSize: 15, fontWeight: 700, color: colors.textPrimary, margin: '28px 0 10px' }
  const p = { fontSize: 14, color: colors.textSecondary, lineHeight: 1.85, margin: '0 0 16px' }
  const pStrong = { ...p, color: colors.textPrimary, fontWeight: 500 }
  const mono = { fontFamily: FONTS.mono, fontSize: 12.5, color: colors.textPrimary, background: dark ? '#1A1A1E' : '#F4F4F5', padding: '16px 18px', borderRadius: 10, margin: '14px 0 18px', lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap' }
  const quote = { borderLeft: '3px solid #DC2626', paddingLeft: 16, margin: '20px 0', fontSize: 14, color: colors.textSecondary, lineHeight: 1.8 }
  const badge = (text, bg) => ({ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: bg, color: '#fff', marginRight: 6 })
  const tbl = { width: '100%', fontSize: 12.5, borderCollapse: 'collapse', margin: '14px 0 22px' }
  const th = { textAlign: 'left', padding: '8px 10px', fontWeight: 700, color: colors.textPrimary, borderBottom: `2px solid ${dark ? '#333' : '#D4D4D8'}`, fontSize: 11 }
  const td = { padding: '8px 10px', borderBottom: `1px solid ${sep}`, color: colors.textSecondary, fontSize: 12.5, lineHeight: 1.5 }
  const tdMono = { ...td, fontFamily: FONTS.mono }
  const cardBox = { padding: '18px 20px', borderRadius: 12, border: `1px solid ${sep}`, background: dark ? '#141416' : '#fff', marginBottom: 12 }
  const divider = { height: 1, background: sep, margin: '40px 0' }
  const label = { fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }

  return (
    <div style={{ maxWidth: 680 }}>

      {/* ══════════════════════════════════════════
          타이틀
          ══════════════════════════════════════════ */}
      <div style={{ marginBottom: 8 }}>
        <span style={badge('전략 문서', '#DC2626')}>전략 문서</span>
        <span style={badge('2026-04-09', dark ? '#52525B' : '#A1A1AA')}>v1.0</span>
      </div>
      <h1 style={h1}>
        상승 시그널 모형 아키텍처
      </h1>
      <p style={{ fontSize: 14, color: colors.textMuted, margin: '8px 0 0', lineHeight: 1.6 }}>
        "800건의 공시에서 오를 종목 5개를 찾는다" — 이 문장의 실행 설계서.
      </p>
      <div style={divider} />


      {/* ══════════════════════════════════════════
          0. 우리는 무엇을 하는 회사인가
          ══════════════════════════════════════════ */}
      <h2 style={h2}>우리는 무엇을 하는 회사인가</h2>
      <p style={p}>
        매일 금감원 DART에서 약 800건의 공시가 쏟아진다.
        대부분은 노이즈다. 하지만 그 안에 주가를 움직이는 시그널이 숨어 있다.
      </p>
      <p style={p}>
        우리의 미션은 단순하다.
        <b style={{ color: colors.textPrimary }}> 공시 시그널을 잡아내서, 확률적으로 계산하고, 최적의 모형을 만드는 것.</b>
        {' '}1단계는 고객에게 공시 정보를 가격과 함께 알려주는 것이지만,
        최종 목표는 상승 시그널의 확률 모형을 도출하는 것이다.
      </p>
      <p style={p}>
        이 문서는 그 모형을 어떻게 설계할 것인가에 대한 아키텍처 회의(2026-04-09) 결론이다.
        5개의 근본적 질문을 던지고, 각각에 대해 결론을 내렸다.
      </p>


      {/* ══════════════════════════════════════════
          1. 핵심 해자 — 처음이자 끝
          ══════════════════════════════════════════ */}
      <h2 style={h2}>핵심 해자 — 공시 내용의 입체적 분석</h2>

      <div style={quote}>
        "같은 유형의 공시라도 내용에 따라 시그널의 강도와 방향이 완전히 다르다.
        이걸 잡아내는 게 우리의 전문성이자 해자다. 사실 이게 처음이자 끝이다.
        나머지는 자동화가 안 되더라도 수동으로 하면 그만이니까."
      </div>

      <p style={p}>
        DART 공시 원문은 공공재다. 누구나 같은 API로 수집할 수 있고,
        같은 키워드로 분류할 수 있다. 데이터 수집, 가격 추적, 재무 필터 — 이건 전부 인프라다.
        경쟁자가 내일 시작해도 한 달이면 따라온다.
      </p>
      <p style={pStrong}>
        하지만 "이 공시가 진짜 시그널인지 판별하는 눈"은 대체 불가능하다.
      </p>

      <h3 style={h3}>같은 CB발행, 전혀 다른 시그널</h3>
      <div style={{ display: 'flex', gap: 10, margin: '12px 0 18px', flexWrap: 'wrap' }}>
        <div style={{ ...cardBox, flex: 1, minWidth: 260, borderLeft: '3px solid #16A34A' }}>
          <div style={label}>매수 시그널</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#16A34A', marginBottom: 6 }}>CB발행 + 대주주 콜옵션 + 리픽싱 포기</div>
          <div style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 1.7 }}>
            대주주가 전환권을 되살 수 있는 콜옵션을 확보했다.
            리픽싱(전환가 하향 조정)도 포기했다.
            이건 "주가가 오를 것을 알고, 지분을 더 가져가려는" 설계다.
            세력이 수익 구조를 짜고 있다는 뜻이다.
          </div>
        </div>
        <div style={{ ...cardBox, flex: 1, minWidth: 260, borderLeft: '3px solid #DC2626' }}>
          <div style={label}>희석 경고</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#DC2626', marginBottom: 6 }}>CB발행 + 운영자금 조달 + 리픽싱 조항</div>
          <div style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 1.7 }}>
            운영자금이 부족해서 CB를 찍는다.
            리픽싱 조항이 있어서 주가가 떨어지면 전환가도 따라 내려간다.
            결국 더 많은 주식이 풀리고, 기존 주주의 지분이 희석된다.
            현금이 급한 회사의 절박한 자금 조달이다.
          </div>
        </div>
      </div>

      <h3 style={h3}>같은 공급계약, 전혀 다른 무게</h3>
      <div style={{ display: 'flex', gap: 10, margin: '12px 0 18px', flexWrap: 'wrap' }}>
        <div style={{ ...cardBox, flex: 1, minWidth: 260, borderLeft: '3px solid #16A34A' }}>
          <div style={label}>S급 시그널</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#16A34A', marginBottom: 6 }}>삼성전자 향 반도체 소재, 매출비 40%</div>
          <div style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 1.7 }}>
            매출의 40%를 차지하는 대형 계약.
            거래처가 삼성전자 — 신뢰도와 지속성이 보장된다.
            이 한 건이 회사의 실적 궤도를 바꿀 수 있다.
          </div>
        </div>
        <div style={{ ...cardBox, flex: 1, minWidth: 260, borderLeft: '3px solid #6B7280' }}>
          <div style={label}>노이즈</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#6B7280', marginBottom: 6 }}>이름 모를 SPC 향, 매출비 5%</div>
          <div style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 1.7 }}>
            매출의 5%에 불과하고, 거래처가 특수목적법인(SPC).
            실체가 불분명하고 지속성도 의심스럽다.
            공시 제목은 같은 "공급계약"인데, 의미는 완전히 다르다.
          </div>
        </div>
      </div>

      <p style={p}>
        이 차이를 구별하는 건 룰 엔진으로 안 된다.
        원문을 읽고, 거래처를 파악하고, 금액의 맥락을 이해해야 한다.
        컨텍스트 윈도우로 공시를 읽고, 그 판단의 히스토리를 쌓아가는 것 — 이게 해자다.
        매일 분석이 쌓일수록 강화되는 복리형 자산이다.
      </p>

      <div style={divider} />


      {/* ══════════════════════════════════════════
          2. 다섯 가지 질문과 답
          ══════════════════════════════════════════ */}
      <h2 style={h2}>다섯 가지 질문</h2>
      <p style={p}>
        모형을 설계하기 전에 근본적인 질문 5개를 던졌다.
        각 질문은 모형의 방향을 결정한다. 하나라도 잘못 답하면 전체 구조가 흔들린다.
      </p>

      {/* Q1 */}
      <div style={{ ...cardBox, marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#DC2626', fontFamily: FONTS.mono }}>Q1</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>
            재무 데이터는 주가를 예측하는가?
          </span>
        </div>
        <p style={{ ...p, marginBottom: 10 }}>
          재무 데이터는 과거다. 3분기 보고서가 나오는 시점에 이미 3~4개월 전 숫자.
          사업보고서는 최대 15개월 전이다.
          <b style={{ color: colors.textPrimary }}> 시장은 이미 그 재무를 반영한 가격을 만들어놓았다.</b>
        </p>
        <p style={{ ...p, marginBottom: 10 }}>
          ROE 20%인 회사는 이미 비싸다. 재무가 좋다고 더 오르는 게 아니라,
          좋은 재무가 이미 PER/PBR에 녹아 있다.
        </p>
        <p style={{ ...p, marginBottom: 10 }}>
          2026년 4월 광통신 테마에서 이걸 직접 봤다.
          광전자(PBR 0.78, 흑자)는 BPS 이하에서 매수할 수 있었고,
          대한광통신(PBR 27.9, 3년 적자)은 자산가치의 28배를 주고 사야 했다.
          같은 테마인데 재무 상태가 <b style={{ color: colors.textPrimary }}>상승 여부가 아니라 하락 시 바닥이 있는지</b>를 결정했다.
        </p>
        <div style={{ background: dark ? '#1A1A1E' : '#F9FAFB', borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>결론</div>
          <div style={{ fontSize: 13, color: colors.textPrimary, lineHeight: 1.6 }}>
            재무 데이터는 상승 예측이 아니라 <b>위험 필터</b>로만 쓴다.
            안전성(ICR, 부채비율)은 위험도 가중치, PBR/PER은 거품 크로스체크.
            나머지 재무 변수(ROE, 성장성, 현금창출력)는 모형에서 제외하거나 비중을 극소화한다.
          </div>
        </div>
      </div>

      {/* Q2 */}
      <div style={{ ...cardBox, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#DC2626', fontFamily: FONTS.mono }}>Q2</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>
            수급에서 기관만 보면 되는가?
          </span>
        </div>
        <p style={{ ...p, marginBottom: 10 }}>
          기존 Edge-Finder는 Promise 시그널에서 "기관 5일 연속 순매수"를 조건으로 썼다.
          하지만 기관은 리밸런싱, 펀드 환매 등 기계적 매매가 섞여 있어서 노이즈가 많다.
        </p>
        <p style={{ ...p, marginBottom: 10 }}>
          반면 <b style={{ color: colors.textPrimary }}>외국인은 진입 시 리서치 기반</b>이고,
          한번 사기 시작하면 연속 매수하는 경향이 강하다.
          특히 중소형주에서 외국인 연속 순매수는 "누군가 알고 사는" 시그널이다.
        </p>
        <p style={{ ...p, marginBottom: 10 }}>
          <b style={{ color: colors.textPrimary }}>소수계좌 집중매수</b>는 모든 시그널 중 최우선이다.
          급등 선행지표이며, 거래정지 에스컬레이션의 첫 단계다.
          승률(25%)은 낮지만 수익률이 높은 "저승률 고수익" 패턴이다.
        </p>
        <div style={{ background: dark ? '#1A1A1E' : '#F9FAFB', borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>결론</div>
          <div style={{ fontSize: 13, color: colors.textPrimary, lineHeight: 1.6 }}>
            수급 핵심 = <b>외국인 연속 순매수 + 소수계좌 집중매수</b>. 기관은 보조.
          </div>
        </div>
      </div>

      {/* Q3 */}
      <div style={{ ...cardBox, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#DC2626', fontFamily: FONTS.mono }}>Q3</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>
            시장 상황을 반영해야 하는가?
          </span>
        </div>
        <p style={{ ...p, marginBottom: 10 }}>
          코스피가 3% 오른 날 공시 종목이 4% 올랐다면, 공시 효과는 1%다.
          우리 price_tracks의 초과수익률은 이미 코스피 등락분을 차감한 수치다.
          SIGNAL_TIER의 "종가 초과수익 +3.69%"가 시장을 빼고 순수 공시 효과만 남긴 것이다.
        </p>
        <div style={{ background: dark ? '#1A1A1E' : '#F9FAFB', borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>결론</div>
          <div style={{ fontSize: 13, color: colors.textPrimary, lineHeight: 1.6 }}>
            시장 환경 승수 <b>불필요</b>. 데이터 자체가 이미 시장 중립. 또 반영하면 이중 차감이다.
          </div>
        </div>
      </div>

      {/* Q4 */}
      <div style={{ ...cardBox, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#DC2626', fontFamily: FONTS.mono }}>Q4</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>
            지금 백테스트가 가능한가?
          </span>
        </div>
        <p style={{ ...p, marginBottom: 10 }}>
          솔직하게 말하면, <b style={{ color: colors.textPrimary }}>현재 데이터로는 제대로 된 백테스트가 어렵다.</b>
        </p>
        <p style={{ ...p, marginBottom: 10 }}>
          price_tracks에 주가 변동은 있지만, 그 시점에 수급이 어땠는지,
          PBR이 얼마였는지, 외국인이 며칠째 순매수였는지 — 이 컨텍스트가 안 붙어 있다.
          지금 기업카드를 조인하면 "현재" 재무 데이터지, "공시 당시" 데이터가 아니다.
        </p>
        <p style={{ ...p, marginBottom: 10 }}>
          12,706건 중 교차 조건을 걸면 샘플이 급감한다.
          CB발행 108건에서 "외국인 연속 순매수 + PBR{'<'}1" 걸면 10건? 5건?
          통계적으로 의미 없다. 적은 샘플에서 승수를 뽑고 같은 데이터로 검증하면
          당연히 잘 맞는다. 그건 진짜 예측력이 아니라 커브피팅이다.
        </p>
        <div style={{ background: dark ? '#1A1A1E' : '#F9FAFB', borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>결론</div>
          <div style={{ fontSize: 13, color: colors.textPrimary, lineHeight: 1.6 }}>
            백테스트는 나중으로 미루고, <b>지금부터 스냅샷을 쌓는 게 우선</b>이다.
            공시 시점의 PBR, PER, 외국인 연속매수일수, 소수계좌 여부, 부채비율, ICR을
            price_tracks에 동시 저장한다. 6개월~1년 쌓으면 그때 진짜 검증이 가능하다.
          </div>
        </div>
      </div>

      {/* Q5 */}
      <div style={{ ...cardBox, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#DC2626', fontFamily: FONTS.mono }}>Q5</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>
            우리의 해자는 무엇인가?
          </span>
        </div>
        <p style={{ ...p, marginBottom: 10 }}>
          이 질문이 가장 중요하다. 해자가 없으면 경쟁자가 따라올 수 있고,
          따라오면 우리의 존재 이유가 사라진다.
        </p>
        <p style={{ ...p, marginBottom: 10 }}>
          DART 데이터는 공공재다. 코드도 복제할 수 있다. 심지어 스냅샷도 같은 구조로 쌓을 수 있다.
          하지만 <b style={{ color: colors.textPrimary }}>같은 유형의 공시 안에서 시그널의 강도와 방향을 구별하는 능력</b> — 이건 복제 불가능하다.
        </p>
        <p style={{ ...p, marginBottom: 10 }}>
          시장 상황, 밸류에이션, 업종 호황도에 따라 같은 공시의 효과가 다를 수 있다.
          하지만 데이터가 충분히 쌓이면 이런 외부 변수의 노이즈는 통계적으로 상쇄된다.
          그리고 <b style={{ color: colors.textPrimary }}>"이런 내용의 공시가 나오면 오른다"는 패턴이 수렴한다.</b>
        </p>
        <p style={{ ...p, marginBottom: 10 }}>
          그 수렴을 향해 매일 공시를 분석하고, 결과를 추적하고, 피드백 루프를 돌리는 것.
          이 방향성을 찾기 위해 우리 시스템이 존재한다.
        </p>
        <div style={{ background: dark ? '#1A1A1E' : '#F9FAFB', borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>결론</div>
          <div style={{ fontSize: 13, color: colors.textPrimary, lineHeight: 1.6 }}>
            해자 = <b>공시 내용의 입체적 분석과 예측</b>.
            이게 처음이자 끝이다. 나머지는 인프라다.
          </div>
        </div>
      </div>

      <div style={divider} />


      {/* ══════════════════════════════════════════
          진화하는 루프 — 두 번째 해자
          ══════════════════════════════════════════ */}
      <h2 style={h2}>축적 — 두 번째 해자</h2>
      <p style={p}>
        공시 내용 분석이 첫 번째 해자라면,
        <b style={{ color: colors.textPrimary }}> "분석하고, 기록하고, 결과를 확인하고, 계속 쌓는" 축적 자체가 두 번째 해자</b>다.
        이건 시간이 만드는 해자이기 때문에 돈으로 살 수 없다.
      </p>

      <h3 style={h3}>지금 단계 — 쌓는다</h3>
      <div style={{ position: 'relative', padding: '24px 0', margin: '16px 0 24px' }}>
        {[
          { step: '1', title: '공시 분석', desc: '원문을 읽고 시그널 강도를 판정한다. 콜옵션인가, 운영자금인가.', color: '#DC2626' },
          { step: '2', title: '스냅샷 저장', desc: '판정 결과 + 그 순간의 수급/PBR/외국인 데이터를 함께 기록한다.', color: '#D97706' },
          { step: '3', title: '결과 추적', desc: '2분, 15분, 1시간, 종가, 5일 — 실제로 올랐는지 추적한다.', color: '#2563EB' },
          { step: '4', title: '축적', desc: '결과값을 보정하며 계속 쌓는다. 방향성이 보일 때까지.', color: '#16A34A' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < 3 ? 4 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 36 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 14, background: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: '#fff', fontFamily: FONTS.mono, flexShrink: 0,
              }}>{item.step}</div>
              {i < 3 && <div style={{ width: 2, height: 20, background: sep, marginTop: 2 }} />}
            </div>
            <div style={{ flex: 1, paddingTop: 3 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: item.color, marginBottom: 2 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <p style={p}>
        지금은 이 직선을 반복한다.
        매일 공시를 분석하고, 스냅샷을 저장하고, 결과를 추적하고, 쌓는다.
        화려한 오차 분석이나 모형 보정은 아직 안 된다 — 데이터가 부족하니까.
        <b style={{ color: colors.textPrimary }}>하지만 이 직선이 충분히 길어지면 방향성이 보이기 시작한다.</b>
      </p>

      <h3 style={h3}>50,000건 이후 — 루프가 된다</h3>
      <p style={p}>
        스냅샷이 충분히 쌓이면 그때 비로소 "이 조건에서 왜 안 올랐지?"를 물을 수 있고,
        그 답을 모형에 반영할 수 있다. 직선이 루프로 전환되는 순간이다.
      </p>
      <div style={{ background: dark ? '#1A1A1E' : '#F9FAFB', borderRadius: 10, padding: '14px 18px', margin: '12px 0 18px', fontFamily: FONTS.mono, fontSize: 12.5, lineHeight: 1.8, color: colors.textPrimary, whiteSpace: 'pre-wrap' }}>
{`[지금]  분석 → 스냅샷 → 결과추적 → 축적 → 축적 → 축적...
                                              ↓
                                       방향성이 보인다
                                              ↓
[50K건] 분석 → 스냅샷 → 결과추적 → 오차분석 → 모형보정 → ↺`}
      </div>

      <p style={p}>
        경쟁자가 내일 똑같은 시스템을 만들어도,
        우리가 1년 동안 쌓은 "시그널 판정 + 스냅샷 + 결과"의 3종 세트는 복제할 수 없다.
        데이터는 복제 가능하지만,
        <b style={{ color: colors.textPrimary }}> 매일 결과를 확인하며 보정해온 축적은 시간으로만 만들어진다.</b>
      </p>

      <div style={divider} />


      {/* ══════════════════════════════════════════
          3. 최종 모형 구조
          ══════════════════════════════════════════ */}
      <h2 style={h2}>최종 모형 구조</h2>
      <p style={p}>
        5개의 질문을 거치면서 모형이 계속 단순해졌다.
        처음 제안했던 "기본확률 × 펀더멘탈 승수 × 수급 승수 × 밸류 승수 × 시장 승수"에서
        불필요한 것을 하나씩 쳐냈다.
      </p>

      <div style={mono}>
{`[처음 제안]
기본확률 × 펀더멘탈 승수 × 수급 승수 × 밸류 승수 × 시장 승수

[Q1] 펀더멘탈 → 위험 필터로 격하 (승수에서 제외)
[Q2] 수급: 기관 중심 → 외국인 + 소수계좌로 교체
[Q3] 시장 승수 → 제거 (이중 차감 방지)

[최종]
상승확률 = 시그널 강도(내용 분석) × 0.70  ← 핵심 해자, 70%
         + 기본확률(공시유형)      × 0.15
         + 수급(외국인/소수계좌)    × 0.15
         × 위험 필터(통과 or 차단)`}</div>

      <p style={p}>
        4개의 팩터만 남았다. 가중치의 70%가 <b style={{ color: '#DC2626' }}>시그널 강도(공시 내용 분석)</b>에 집중된다.
        이것이 우리의 핵심 역량이고, 나머지 30%는 데이터 자동화로 채운다.
      </p>

      <table style={tbl}>
        <thead>
          <tr>
            <th style={th}>팩터</th>
            <th style={th}>가중치</th>
            <th style={th}>역할</th>
            <th style={th}>소스</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ background: dark ? 'rgba(220,38,38,0.04)' : 'rgba(220,38,38,0.02)' }}>
            <td style={{ ...td, fontWeight: 800, color: '#DC2626' }}>시그널 강도</td>
            <td style={{ ...tdMono, fontWeight: 800, color: '#DC2626' }}>70%</td>
            <td style={td}>같은 유형 내 강/중/약 구별 — 콜옵션 vs 운영자금, 삼성 향 vs SPC 향</td>
            <td style={td}>공시 원문 딥 분석 (컨텍스트 윈도우)</td>
          </tr>
          <tr>
            <td style={{ ...td, fontWeight: 700 }}>기본확률</td>
            <td style={tdMono}>15%</td>
            <td style={td}>공시 유형별 베이스라인 승률</td>
            <td style={td}>SIGNAL_TIER (12,706건 실증)</td>
          </tr>
          <tr>
            <td style={{ ...td, fontWeight: 700 }}>수급</td>
            <td style={tdMono}>15%</td>
            <td style={td}>외국인 연속매수, 소수계좌, 거래량</td>
            <td style={td}>키움 API + KIND (스냅샷)</td>
          </tr>
          <tr>
            <td style={{ ...td, fontWeight: 700 }}>위험 필터</td>
            <td style={tdMono}>차단</td>
            <td style={td}>거품/부실 종목 아웃. 점수 아닌 통과/차단</td>
            <td style={td}>PBR, 부채비율, ICR</td>
          </tr>
        </tbody>
      </table>
      <div style={quote}>
        시그널 강도 70%는 단순한 비율이 아니다.
        나머지 30%가 아무리 좋아도, 공시 내용이 약하면 시그널이 아니라는 뜻이다.
        반대로 공시 내용이 강하면 수급이 아직 안 들어왔어도 선제적으로 잡을 수 있다.
        <b style={{ color: colors.textPrimary }}> 공시를 읽는 눈이 모든 것의 시작이다.</b>
      </div>

      <div style={divider} />


      {/* ══════════════════════════════════════════
          4. 스냅샷 시스템 — 시간이 만드는 해자
          ══════════════════════════════════════════ */}
      <h2 style={h2}>스냅샷 시스템</h2>
      <p style={p}>
        공시가 발생하는 순간, 주가뿐 아니라 그 시점의 시장 컨텍스트를 함께 저장한다.
        이 스냅샷은 그 순간에 저장하지 않으면 <b style={{ color: colors.textPrimary }}>영원히 복원할 수 없다.</b>
      </p>
      <p style={p}>
        "CB발행인데 왜 이건 올랐고 저건 안 올랐지?" — 이 질문에 답하려면
        그때 PBR이 얼마였는지, 외국인이 사고 있었는지를 알아야 한다.
        단순히 "CB발행 승률 49%"가 아니라
        <b style={{ color: colors.textPrimary }}> "CB발행 + PBR{'<'}1 + 외국인 매수 = 73%"</b>까지
        갈 수 있는 근거가 된다.
      </p>
      <p style={p}>
        그리고 오차를 잡을 수 있다.
        "이 조건이면 올라야 하는데 안 올랐다" — 그 예외 케이스를 분석하면
        우리가 놓친 변수를 발견할 수 있다.
      </p>

      <h3 style={h3}>저장 필드</h3>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '12px 0 18px' }}>
        <div style={{ ...cardBox, flex: 1, minWidth: 280 }}>
          <div style={{ ...label, color: '#16A34A' }}>수급 — 상승 예측 변수</div>
          {[
            ['외국인 연속 순매수 일수', '키움 ka10035'],
            ['외국인 보유비율 (%)', '키움 시세'],
            ['기관 연속 순매수 일수', '키움 ka10045'],
            ['소수계좌 집중매수 여부', 'KIND'],
            ['거래량 / 20일 평균', '키움 시세'],
          ].map(([name, src], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 4 ? `1px solid ${sep}` : 'none' }}>
              <span style={{ fontSize: 12.5, color: colors.textPrimary }}>{name}</span>
              <span style={{ fontSize: 11, color: colors.textMuted }}>{src}</span>
            </div>
          ))}
        </div>
        <div style={{ ...cardBox, flex: 1, minWidth: 280 }}>
          <div style={{ ...label, color: '#DC2626' }}>위험 — 하방 방어 변수</div>
          {[
            ['PBR (주가순자산비율)', '키움 시세'],
            ['PER (주가수익비율)', '키움 시세'],
            ['부채비율 (%)', '기업카드 DB'],
            ['이자보상배율 (ICR)', '기업카드 DB'],
            ['시가총액', '키움 시세'],
            ['CB/BW 오버행 (%)', '5대 변수'],
          ].map(([name, src], i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: i < 5 ? `1px solid ${sep}` : 'none' }}>
              <span style={{ fontSize: 12.5, color: colors.textPrimary }}>{name}</span>
              <span style={{ fontSize: 11, color: colors.textMuted }}>{src}</span>
            </div>
          ))}
        </div>
      </div>

      <p style={p}>
        추가 API 비용은 거의 0이다. 키움 시세는 price_tracker에서 이미 호출 중이고,
        수급은 5분 캐시에서, 재무는 로컬 DB에서 가져온다.
        응답 필드를 확장하기만 하면 된다.
      </p>

      <div style={divider} />


      {/* ══════════════════════════════════════════
          5. 로드맵
          ══════════════════════════════════════════ */}
      <h2 style={h2}>로드맵</h2>

      {[
        { phase: 'Phase 1', color: '#DC2626', title: '기본 스냅샷', when: '즉시',
          desc: 'price_tracks 테이블에 스냅샷 컬럼 추가. T+0 저장 시 수급 2종(외국인/기관 연속매수일수) + 위험 3종(PBR/PER/부채비율) 동시 수집.' },
        { phase: 'Phase 2', color: '#D97706', title: '확장 스냅샷', when: '1~2주',
          desc: '소수계좌 여부, ICR, CB/BW 오버행, 거래량비율 추가. V2 스코어 연동. 기존 12,706건 중 복원 가능한 필드(PBR/PER) 백필 시도.' },
        { phase: 'Phase 3', color: '#2563EB', title: '조건부 분석', when: '1개월+',
          desc: '조건별 승률 집계 API 구축. "CB발행 + PBR<1일 때 승률은?" 같은 질의 가능. 대시보드에 조건별 히트맵 시각화.' },
        { phase: 'Phase 4', color: '#16A34A', title: '확률 모형', when: '50,000건 도달',
          desc: '스냅샷 데이터로 로지스틱 회귀 또는 경량 ML 모형 학습. 캘리브레이션 검증(예측 확률 vs 실제 승률). 실시간 상승 확률 API.' },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 28 }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: item.color, flexShrink: 0 }} />
            {i < 3 && <div style={{ width: 2, flex: 1, background: sep, marginTop: 4 }} />}
          </div>
          <div style={{ flex: 1, paddingBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: item.color }}>{item.phase}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>{item.title}</span>
              <span style={{ fontSize: 11, color: colors.textMuted, marginLeft: 'auto', fontFamily: FONTS.mono }}>{item.when}</span>
            </div>
            <p style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
          </div>
        </div>
      ))}

      <div style={divider} />


      {/* ══════════════════════════════════════════
          6. 하지 않는 것
          ══════════════════════════════════════════ */}
      <h2 style={h2}>하지 않는 것</h2>
      <p style={p}>
        무엇을 하지 않을지 정하는 것이 무엇을 할지 정하는 것만큼 중요하다.
      </p>
      <div style={{ borderRadius: 10, border: `1px solid ${sep}`, overflow: 'hidden', margin: '14px 0 24px' }}>
        {[
          { text: '재무 데이터로 상승 확률을 높이지 않는다', why: '재무는 과거. 시장은 이미 반영했다. 필터 역할만.' },
          { text: '시장 환경 승수를 넣지 않는다', why: '초과수익률이 이미 코스피 차감. 이중 반영은 왜곡이다.' },
          { text: '적은 샘플에서 억지 백테스트를 하지 않는다', why: '커브피팅은 자기 확신 편향만 만든다. 스냅샷 먼저 쌓는다.' },
          { text: '50,000건 전에 복잡한 ML 모형을 시도하지 않는다', why: '데이터가 부족한 상태의 ML은 과적합의 다른 이름이다.' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '12px 16px',
            borderBottom: i < 3 ? `1px solid ${sep}` : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
              <span style={{ color: '#DC2626', fontWeight: 800, flexShrink: 0, fontSize: 14 }}>x</span>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: colors.textPrimary }}>{item.text}</span>
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, paddingLeft: 22, lineHeight: 1.5 }}>{item.why}</div>
          </div>
        ))}
      </div>


      {/* ══════════════════════════════════════════
          7. 현재 상태
          ══════════════════════════════════════════ */}
      <h2 style={h2}>현재 데이터 현황</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '14px 0 24px' }}>
        {[
          { label: 'price_tracks', value: '12,706건', desc: '공시 시점 주가 추적' },
          { label: 'disclosures', value: '33,507건', desc: '수집된 공시 원문' },
          { label: '공시 유형', value: '29종', desc: '분류된 시그널 카테고리' },
          { label: '목표', value: '50,000건', desc: '확률 모형 구축 임계점' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '18px 16px', borderRadius: 10, textAlign: 'center',
            border: `1px solid ${sep}`, background: dark ? '#141416' : '#fff',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: i === 3 ? '#16A34A' : '#DC2626', fontFamily: FONTS.mono }}>{item.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: colors.textPrimary, marginTop: 4 }}>{item.label}</div>
            <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{item.desc}</div>
          </div>
        ))}
      </div>

      <p style={p}>
        현재 월 약 1,500건씩 축적 중이다. 스냅샷 시스템이 가동되면
        2027년 중반에 50,000건에 도달하고, 그때 Phase 4 확률 모형이 시작된다.
        그때까지는 Phase 1~3을 단단하게 만들고, 매일 공시 내용 분석 히스토리를 쌓는다.
      </p>

      <div style={divider} />
      <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 1.8, padding: '0 0 20px' }}>
        DART Insight — Signal Architecture v1<br/>
        2026-04-09 아키텍처 회의 기반<br/>
        "800건에서 5건을 찾는다. 그리고 그 5건이 왜 오르는지 증명한다."
      </div>
    </div>
  )
}

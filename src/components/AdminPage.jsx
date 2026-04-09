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
  const h2 = { fontSize: 18, fontWeight: 800, color: colors.textPrimary, margin: '36px 0 12px', fontFamily: FONTS.serif }
  const h3 = { fontSize: 15, fontWeight: 700, color: colors.textPrimary, margin: '24px 0 8px' }
  const p = { fontSize: 13.5, color: colors.textSecondary, lineHeight: 1.8, margin: '0 0 12px' }
  const mono = { fontFamily: FONTS.mono, fontSize: 12.5, color: colors.textPrimary, background: dark ? '#1A1A1E' : '#F4F4F5', padding: '14px 16px', borderRadius: 10, margin: '12px 0 16px', lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre-wrap' }
  const quote = { borderLeft: '3px solid #DC2626', paddingLeft: 14, margin: '16px 0', fontSize: 13, color: colors.textSecondary, lineHeight: 1.7, fontStyle: 'italic' }
  const badge = (text, bg) => ({ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: bg, color: '#fff', marginRight: 6 })
  const tbl = { width: '100%', fontSize: 12.5, borderCollapse: 'collapse', margin: '12px 0 20px' }
  const th = { textAlign: 'left', padding: '8px 10px', fontWeight: 700, color: colors.textPrimary, borderBottom: `2px solid ${dark ? '#333' : '#D4D4D8'}`, fontSize: 11 }
  const td = { padding: '7px 10px', borderBottom: `1px solid ${sep}`, color: colors.textSecondary, fontSize: 12 }
  const tdMono = { ...td, fontFamily: FONTS.mono }

  return (
    <div style={{ maxWidth: 680 }}>

      {/* ── 메타 헤더 ── */}
      <div style={{ marginBottom: 8 }}>
        <span style={badge('PRD', '#DC2626')}>PRD</span>
        <span style={badge('v1.0', dark ? '#52525B' : '#A1A1AA')}>v1.0</span>
      </div>
      <h1 style={{ fontSize: 24, fontWeight: 900, color: colors.textPrimary, margin: '0 0 6px', fontFamily: FONTS.serif, lineHeight: 1.3 }}>
        공시 시점 시그널 스냅샷 시스템
      </h1>
      <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>2026-04-09 아키텍처 회의 결론</div>
      <div style={{ height: 1, background: sep, margin: '16px 0 28px' }} />


      {/* ══ 1. 핵심 해자 ══ */}
      <h2 style={h2}>핵심 해자</h2>
      <div style={quote}>
        "같은 유형의 공시라도 내용에 따라 시그널의 강도와 방향이 완전히 다르다.<br/>
        이걸 잡아내는 게 우리의 전문성이자 해자다. 이게 처음이자 끝이다."
      </div>
      <p style={p}>
        DART 공시 원문은 공공재다. 누구나 같은 API로 수집할 수 있다.
        하지만 <b style={{ color: colors.textPrimary }}>같은 CB발행이라도 대주주 콜옵션이 붙은 건 매수 시그널이고,
        운영자금 조달에 리픽싱 조항이 붙은 건 희석 경고</b>라는 판별 —
        이건 원문을 읽고, 맥락을 이해하고, 결과를 추적해서 피드백 루프를 돌려야만 가능하다.
      </p>
      <p style={p}>
        데이터가 쌓일수록 "이런 내용의 공시 → 오른다"가 수렴한다.
        외부 변수(시장, 업종, 밸류)의 노이즈는 통계적으로 상쇄되고,
        공시 내용 자체의 시그널만 남는다. 그 수렴점을 찾는 것이 이 시스템의 존재 이유다.
      </p>


      {/* ══ 2. 모형 구조 ══ */}
      <h2 style={h2}>상승 확률 모형 v1</h2>
      <div style={mono}>
{`최종 상승확률 = 기본확률(공시유형)
              × 시그널 강도(내용 분석)  ← 핵심 해자
              × 수급 승수
              × 위험 필터(통과/차단)`}
      </div>

      <h3 style={h3}>회의에서 내린 5가지 결론</h3>

      <table style={tbl}>
        <thead>
          <tr>
            <th style={th}>#</th>
            <th style={th}>결론</th>
            <th style={th}>근거</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={tdMono}>1</td>
            <td style={td}><b>재무 데이터 = 위험 필터</b><br/>상승 예측에 쓰지 않는다</td>
            <td style={td}>재무는 3개월+ 과거, 시장은 이미 반영한 가격. ROE 좋으면 이미 비싸다.</td>
          </tr>
          <tr>
            <td style={tdMono}>2</td>
            <td style={td}><b>수급 = 외국인 + 소수계좌</b><br/>기관은 보조</td>
            <td style={td}>기관은 리밸런싱/환매 노이즈. 외국인은 리서치 기반 연속매수. 소수계좌는 급등 선행.</td>
          </tr>
          <tr>
            <td style={tdMono}>3</td>
            <td style={td}><b>시장 환경 승수 불필요</b></td>
            <td style={td}>초과수익률이 이미 코스피 차감. 이중 반영 방지.</td>
          </tr>
          <tr>
            <td style={tdMono}>4</td>
            <td style={td}><b>백테스트 불가 → 스냅샷 축적</b></td>
            <td style={td}>공시 시점 컨텍스트 없음. 적은 샘플 + 같은 데이터 검증 = 과적합.</td>
          </tr>
          <tr>
            <td style={tdMono}>5</td>
            <td style={td}><b>공시 내용 분석이 해자</b></td>
            <td style={td}>같은 유형도 내용에 따라 시그널 방향이 다름. 룰 엔진 불가, 컨텍스트 윈도우 필수.</td>
          </tr>
        </tbody>
      </table>


      {/* ══ 3. 스냅샷 필드 ══ */}
      <h2 style={h2}>스냅샷 저장 필드</h2>
      <p style={p}>
        공시가 발생하면, 주가뿐 아니라 그 시점의 시장 컨텍스트를 함께 저장한다.
        이 스냅샷은 그 순간에 저장하지 않으면 <b style={{ color: colors.textPrimary }}>영원히 복원할 수 없다</b>.
        시간이 갈수록 따라올 수 없는 데이터 자산이 된다.
      </p>

      <h3 style={h3}>수급 (상승 예측 변수)</h3>
      <table style={tbl}>
        <thead><tr><th style={th}>필드</th><th style={th}>소스</th><th style={th}>설명</th></tr></thead>
        <tbody>
          <tr><td style={tdMono}>foreign_consec_buy_days</td><td style={td}>키움 ka10035</td><td style={td}>외국인 연속 순매수 일수</td></tr>
          <tr><td style={tdMono}>foreign_ownership_pct</td><td style={td}>키움 시세</td><td style={td}>외국인 보유비율 (%)</td></tr>
          <tr><td style={tdMono}>inst_consec_buy_days</td><td style={td}>키움 ka10045</td><td style={td}>기관 연속 순매수 일수</td></tr>
          <tr><td style={tdMono}>minority_account_flag</td><td style={td}>KIND</td><td style={td}>소수계좌 집중매수 여부</td></tr>
          <tr><td style={tdMono}>volume_ratio</td><td style={td}>키움 시세</td><td style={td}>거래량 / 20일 평균</td></tr>
        </tbody>
      </table>

      <h3 style={h3}>위험 필터 (하방 방어 변수)</h3>
      <table style={tbl}>
        <thead><tr><th style={th}>필드</th><th style={th}>소스</th><th style={th}>설명</th></tr></thead>
        <tbody>
          <tr><td style={tdMono}>pbr</td><td style={td}>키움 시세</td><td style={td}>주가순자산비율</td></tr>
          <tr><td style={tdMono}>per</td><td style={td}>키움 시세</td><td style={td}>주가수익비율</td></tr>
          <tr><td style={tdMono}>debt_ratio</td><td style={td}>기업카드</td><td style={td}>부채비율 (%)</td></tr>
          <tr><td style={tdMono}>icr</td><td style={td}>기업카드</td><td style={td}>이자보상배율</td></tr>
          <tr><td style={tdMono}>market_cap</td><td style={td}>키움 시세</td><td style={td}>시가총액 (원)</td></tr>
          <tr><td style={tdMono}>cb_bw_overhang_pct</td><td style={td}>5대 변수</td><td style={td}>CB/BW 오버행 (%)</td></tr>
        </tbody>
      </table>

      <h3 style={h3}>공시 컨텍스트</h3>
      <table style={tbl}>
        <thead><tr><th style={th}>필드</th><th style={th}>소스</th><th style={th}>설명</th></tr></thead>
        <tbody>
          <tr><td style={tdMono}>disclosure_type</td><td style={td}>scoring_engine</td><td style={td}>공시 유형 (29종)</td></tr>
          <tr><td style={tdMono}>grade</td><td style={td}>scoring_engine</td><td style={td}>확정 등급 (S/A/D)</td></tr>
          <tr><td style={tdMono}>signal_intensity</td><td style={td}>내용 분석</td><td style={td}>시그널 강도 (향후)</td></tr>
          <tr><td style={tdMono}>v2_score</td><td style={td}>scoring_v2</td><td style={td}>V2 종합 점수</td></tr>
        </tbody>
      </table>


      {/* ══ 4. 파이프라인 ══ */}
      <h2 style={h2}>데이터 수집 파이프라인</h2>
      <div style={mono}>
{`공시 수집 (dart_client)
    ↓
등급 분류 (scoring_engine)
    ↓
V2 스코어링 (scoring_v2)
    ↓
★ 스냅샷 수집 (신규)
  → 키움 시세: PBR/PER/외국인비율/거래량
  → 수급 캐시: 외국인/기관 연속매수일수
  → DB 조회: 부채비율/ICR/오버행
  → KIND 캐시: 소수계좌 여부
    ↓
price_tracks 저장 (기준가 + 스냅샷 동시 INSERT)
    ↓
2m → 15m → 1h → 종가 → 5일 업데이트 (기존 동일)`}
      </div>
      <p style={p}>
        추가 API 비용은 거의 0이다. 대부분 기존 캐시와 로컬 DB에서 가져온다.
        키움 시세는 price_tracker에서 이미 호출 중이므로 응답 필드를 확장만 하면 된다.
      </p>


      {/* ══ 5. 마일스톤 ══ */}
      <h2 style={h2}>마일스톤</h2>
      <table style={tbl}>
        <thead><tr><th style={th}>단계</th><th style={th}>내용</th><th style={th}>시기</th></tr></thead>
        <tbody>
          <tr>
            <td style={td}><span style={badge('Phase 1', '#DC2626')}>즉시</span></td>
            <td style={td}>price_tracks 컬럼 추가, T+0에 수급 2종 + 위험 3종 스냅샷 저장</td>
            <td style={tdMono}>즉시</td>
          </tr>
          <tr>
            <td style={td}><span style={badge('Phase 2', '#D97706')}>확장</span></td>
            <td style={td}>소수계좌/ICR/오버행/거래량비율 추가, V2 스코어 연동</td>
            <td style={tdMono}>1~2주</td>
          </tr>
          <tr>
            <td style={td}><span style={badge('Phase 3', '#2563EB')}>분석</span></td>
            <td style={td}>조건부 승률 집계 API, 조건별 히트맵 대시보드</td>
            <td style={tdMono}>1개월+</td>
          </tr>
          <tr>
            <td style={td}><span style={badge('Phase 4', '#16A34A')}>모형</span></td>
            <td style={td}>로지스틱 회귀 / 경량 ML, 캘리브레이션 검증</td>
            <td style={tdMono}>50K건 도달</td>
          </tr>
        </tbody>
      </table>


      {/* ══ 6. 성공 지표 ══ */}
      <h2 style={h2}>성공 지표</h2>
      <table style={tbl}>
        <thead><tr><th style={th}>지표</th><th style={th}>목표</th><th style={th}>측정</th></tr></thead>
        <tbody>
          <tr><td style={td}>스냅샷 수집률</td><td style={tdMono}>95%+</td><td style={td}>null 아닌 스냅샷 / 전체</td></tr>
          <tr><td style={td}>월간 축적</td><td style={tdMono}>~1,500건</td><td style={td}>price_tracks 월 증가량</td></tr>
          <tr><td style={td}>50,000건 도달</td><td style={tdMono}>2027 중반</td><td style={td}>누적 스냅샷 수</td></tr>
          <tr><td style={td}>유의미한 조건 조합</td><td style={tdMono}>Phase 3</td><td style={td}>전체 승률과 5%p+ 차이 나는 조합 수</td></tr>
        </tbody>
      </table>


      {/* ══ 7. 하지 않는 것 ══ */}
      <h2 style={h2}>하지 않는 것</h2>
      <div style={{ borderRadius: 10, border: `1px solid ${sep}`, overflow: 'hidden', margin: '12px 0 24px' }}>
        {[
          '재무 데이터로 상승 확률을 높이지 않는다 (필터 역할만)',
          '시장 환경 승수를 넣지 않는다 (초과수익률이 이미 시장 차감)',
          '적은 샘플에서 억지 백테스트 하지 않는다',
          '50,000건 전에 복잡한 ML 모형을 시도하지 않는다',
        ].map((text, i) => (
          <div key={i} style={{
            padding: '10px 14px', fontSize: 13, color: colors.textSecondary, lineHeight: 1.6,
            borderBottom: i < 3 ? `1px solid ${sep}` : 'none',
            display: 'flex', alignItems: 'flex-start', gap: 8,
          }}>
            <span style={{ color: '#DC2626', fontWeight: 700, flexShrink: 0 }}>x</span>
            {text}
          </div>
        ))}
      </div>


      {/* ══ 8. 현재 상태 ══ */}
      <h2 style={h2}>현재 데이터 현황</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '12px 0 24px' }}>
        {[
          { label: 'price_tracks', value: '12,706', sub: '건' },
          { label: 'disclosures', value: '33,507', sub: '건' },
          { label: '공시 유형', value: '29', sub: '종' },
          { label: '교차 조합', value: '68', sub: '개' },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '16px', borderRadius: 10, textAlign: 'center',
            border: `1px solid ${sep}`, background: dark ? '#141416' : '#fff',
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#DC2626', fontFamily: FONTS.mono }}>{item.value}</div>
            <div style={{ fontSize: 10, color: colors.textMuted, marginTop: 2 }}>{item.label}</div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: sep, margin: '32px 0 16px' }} />
      <div style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 1.6 }}>
        DART Insight Signal Architecture v1<br/>
        2026-04-09 아키텍처 회의 기반
      </div>
    </div>
  )
}

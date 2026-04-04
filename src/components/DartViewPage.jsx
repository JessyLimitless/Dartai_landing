import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'
import { API } from '../lib/api'

export default function DartViewPage() {
  const { colors, dark } = useTheme()
  const navigate = useNavigate()
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [marketFilter, setMarketFilter] = useState(null)
  const inputRef = useRef(null)

  // 로그인 체크 비활성화 — 전체 공개
  // const user = (() => { try { return JSON.parse(localStorage.getItem('dart_user')) } catch { return null } })()
  // if (!user) return <LoginGate dark={dark} colors={colors} label="딥분석" />

  useEffect(() => {
    fetch(`${API}/api/dart-view/ranking?limit=950`)
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
          <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono, marginLeft: 8 }}>
            기준일 {new Date().toISOString().slice(0, 10)}
          </span>
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
                onClick={() => navigate(`/dart-view/${item.stock_code}`)}
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


// ══ 딥분석 전용 뷰어 ══
export function DartViewDetail() {
  const { stockCode } = useParams()
  const navigate = useNavigate()
  const { colors, dark } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cardInfo, setCardInfo] = useState(null)
  const [livePrice, setLivePrice] = useState(null)

  useEffect(() => {
    if (!stockCode) return
    // stockCode 6자리 또는 corpCode 8자리 모두 지원
    const cardUrl = stockCode.length <= 6
      ? `${API}/api/companies/${stockCode}/card`
      : `${API}/api/companies/${stockCode}/card`

    Promise.all([
      fetch(`${API}/api/deep-analysis/${stockCode}`).then(r => r.json()),
      fetch(cardUrl).then(r => r.json()).catch(() => null),
    ]).then(([da, card]) => {
      // 딥분석이 없고 corpCode(8자리)로 왔다면, card에서 stock_code를 찾아 재시도
      if (!da?.exists && card?.card_data?.header?.stock_code) {
        const realCode = card.card_data.header.stock_code
        fetch(`${API}/api/deep-analysis/${realCode}`).then(r => r.json()).then(da2 => {
          setData(da2)
          setCardInfo(card.card_data)
          setLoading(false)
        })
      } else {
        setData(da)
        if (card?.card_data) setCardInfo(card.card_data)
        setLoading(false)
      }
    }).catch(() => setLoading(false))

    // 실시간 시세 조회 (키움 API)
    const code6 = stockCode.length <= 6 ? stockCode : null
    if (code6) {
      fetch(`${API}/api/prices/batch`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_codes: [code6] }),
      }).then(r => r.json()).then(d => {
        if (d[code6]) setLivePrice(d[code6])
      }).catch(() => {})
    }
  }, [stockCode])

  const sep = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  if (loading) return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px', textAlign: 'center', color: colors.textMuted }}>
      로딩 중...
    </div>
  )

  if (!data?.exists) return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 600, color: colors.textPrimary, marginBottom: 8 }}>
        딥분석 준비 중
      </div>
      <div style={{ fontSize: 14, color: colors.textMuted, marginBottom: 20 }}>
        이 종목의 재무 딥분석은 아직 작성되지 않았습니다.
      </div>
      <button onClick={() => navigate('/dart-view')} style={{
        padding: '10px 24px', borderRadius: 10, border: 'none', cursor: 'pointer',
        background: PREMIUM.accent, color: '#fff', fontSize: 14, fontWeight: 600,
      }}>← 목록으로</button>
    </div>
  )

  const content = data.content || ''
  const lines = content.split('\n')
  const title = lines[0]?.replace(/^#\s*/, '').trim() || ''

  // 기업 헤더 정보
  const market = cardInfo?.market || {}
  const header = cardInfo?.header || {}
  const marketType = { Y: '코스피', K: '코스닥' }[header.corp_cls] || ''
  const capStr = market.market_cap >= 10000
    ? `${(market.market_cap / 10000).toFixed(1)}조`
    : market.market_cap > 0 ? `${Math.round(market.market_cap).toLocaleString()}억` : ''

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>
      {/* 상단 바 */}
      <div style={{
        padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 14,
        borderBottom: `1px solid ${sep}`,
        background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
      }}>
        <button onClick={() => navigate('/dart-view')} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 6,
          color: colors.textMuted, borderRadius: 8, lineHeight: 1,
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = colors.textPrimary}
          onMouseLeave={e => e.currentTarget.style.color = colors.textMuted}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 18, fontWeight: 800, color: colors.textPrimary,
            fontFamily: FONTS.serif, letterSpacing: '-0.3px',
          }}>{title.split('—')[0]?.trim() || stockCode}</div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 3, fontFamily: FONTS.mono }}>
            {stockCode}{marketType && ` · ${marketType}`}{capStr && ` · 시총 ${capStr}`}
          </div>
        </div>
        <button onClick={() => navigate(`/deep-dive/${stockCode}`)} style={{
          padding: '7px 14px', borderRadius: 8, border: `1px solid ${sep}`,
          background: 'transparent', cursor: 'pointer',
          fontSize: 12, fontWeight: 600, color: colors.textMuted,
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = PREMIUM.accent; e.currentTarget.style.color = PREMIUM.accent }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = sep; e.currentTarget.style.color = colors.textMuted }}
        >기업카드</button>
      </div>

      {/* 실시간 시세 블록 (키움 API) */}
      {(livePrice || market.per || market.pbr) && (
        <div style={{
          margin: '16px 24px 0', padding: '14px 18px', borderRadius: 12,
          background: dark ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.03)',
          border: `1px solid ${dark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.08)'}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', letterSpacing: '0.05em', marginBottom: 8 }}>
            📊 실시간 시세 (키움 API)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', fontSize: 13 }}>
            {livePrice?.price > 0 && (
              <span style={{ color: colors.textPrimary, fontWeight: 600, fontFamily: FONTS.mono }}>
                {livePrice.price.toLocaleString()}원
                <span style={{
                  marginLeft: 6, fontSize: 12,
                  color: livePrice.change_pct > 0 ? '#DC2626' : livePrice.change_pct < 0 ? '#2563EB' : colors.textMuted,
                }}>
                  {livePrice.change_pct > 0 ? '+' : ''}{livePrice.change_pct?.toFixed(1)}%
                </span>
              </span>
            )}
            {capStr && <span style={{ color: colors.textMuted }}>시총 {capStr}</span>}
            {market.per > 0 && <span style={{ color: colors.textMuted, fontFamily: FONTS.mono }}>PER {market.per.toFixed(1)}배</span>}
            {market.pbr > 0 && <span style={{ color: colors.textMuted, fontFamily: FONTS.mono }}>PBR {market.pbr.toFixed(2)}배</span>}
            {market.foreign_ratio > 0 && <span style={{ color: colors.textMuted }}>외국인 {market.foreign_ratio.toFixed(1)}%</span>}
          </div>
        </div>
      )}

      {/* 딥분석 본문 */}
      <div style={{ padding: '20px 24px' }}>
        <DeepAnalysisMarkdown content={content} colors={colors} dark={dark} />
      </div>

      {/* 면책 */}
      <div style={{
        padding: '16px 24px', borderTop: `1px solid ${sep}`,
        fontSize: 11, color: colors.textMuted, lineHeight: 1.6,
      }}>
        본 분석은 DART 공시 재무제표(2024년 연간 기준) 기반 AI 자동 생성 리포트입니다. 본문 내 밸류에이션 수치는 작성 시점 기준이며, 상단 실시간 시세를 참고하세요. 투자 판단의 최종 책임은 투자자 본인에게 있습니다.
      </div>
    </div>
  )
}


// ══ 딥분석 마크다운 렌더러 ══
function DeepAnalysisMarkdown({ content, colors, dark }) {
  if (!content) return null

  const lines = content.split('\n')
  const elements = []
  let tableRows = []
  let tableHeaders = []
  let inTable = false
  let key = 0

  const renderInline = (text) => {
    const parts = []
    let idx = 0, lastEnd = 0
    const re = /\*\*(.+?)\*\*/g
    let match
    while ((match = re.exec(text)) !== null) {
      if (match.index > lastEnd) parts.push(<span key={`t${idx++}`}>{text.slice(lastEnd, match.index)}</span>)
      parts.push(<strong key={`b${idx++}`} style={{ color: colors.textPrimary, fontWeight: 600 }}>{match[1]}</strong>)
      lastEnd = match.index + match[0].length
    }
    if (lastEnd < text.length) parts.push(<span key={`t${idx++}`}>{text.slice(lastEnd)}</span>)
    return parts.length > 0 ? parts : text
  }

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={`tbl-${key++}`} style={{
          overflowX: 'auto', margin: '14px 0',
          borderRadius: 10, border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{tableHeaders.map((h, i) => (
                <th key={i} style={{
                  padding: '8px 12px', textAlign: 'left',
                  borderBottom: `2px solid ${dark ? '#333' : '#D4D4D8'}`,
                  background: dark ? '#0F0F11' : '#FAFAFA',
                  color: colors.textMuted, fontWeight: 600, fontSize: 11,
                  whiteSpace: 'nowrap',
                }}>{renderInline(h)}</th>
              ))}</tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '7px 12px',
                    borderBottom: `1px solid ${dark ? '#1E1E22' : '#F0F0F2'}`,
                    color: colors.textSecondary, fontSize: 12,
                    fontFamily: ci > 0 ? FONTS.mono : FONTS.body,
                    whiteSpace: 'nowrap',
                  }}>{renderInline(cell)}</td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    tableHeaders = []
    tableRows = []
    inTable = false
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // 테이블
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim())
      if (cells.every(c => /^[-:]+$/.test(c))) continue
      if (!inTable) {
        if (tableHeaders.length > 0) flushTable()
        tableHeaders = cells
        inTable = true
      } else {
        tableRows.push(cells)
      }
      continue
    }

    if (inTable) flushTable()

    // 제목
    if (trimmed.startsWith('# ') && i === 0) continue // 첫 줄 제목 스킵 (헤더에 표시)
    if (trimmed.startsWith('## ')) {
      elements.push(
        <h2 key={key++} style={{
          fontSize: 17, fontWeight: 800, color: colors.textPrimary,
          fontFamily: FONTS.serif, margin: '28px 0 12px',
          paddingBottom: 8, borderBottom: `2px solid ${PREMIUM.accent}30`,
        }}>{renderInline(trimmed.replace(/^##\s*/, ''))}</h2>
      )
      continue
    }
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={key++} style={{
          fontSize: 14, fontWeight: 700, color: colors.textPrimary,
          margin: '20px 0 8px',
        }}>{renderInline(trimmed.replace(/^###\s*/, ''))}</h3>
      )
      continue
    }

    // 인용문
    if (trimmed.startsWith('>')) {
      elements.push(
        <blockquote key={key++} style={{
          margin: '16px 0', padding: '12px 16px',
          borderLeft: `3px solid ${PREMIUM.accent}`,
          background: dark ? 'rgba(220,38,38,0.04)' : 'rgba(220,38,38,0.02)',
          borderRadius: '0 8px 8px 0',
          fontSize: 14, fontStyle: 'italic', color: colors.textSecondary,
          lineHeight: 1.6, fontFamily: FONTS.serif,
        }}>{renderInline(trimmed.replace(/^>\s*/, ''))}</blockquote>
      )
      continue
    }

    // 구분선
    if (trimmed === '---' || trimmed === '***') {
      elements.push(<hr key={key++} style={{ border: 'none', borderTop: `1px solid ${dark ? '#1E1E22' : '#F0F0F2'}`, margin: '20px 0' }} />)
      continue
    }

    // 리스트
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={key++} style={{
          display: 'flex', gap: 8, margin: '4px 0', fontSize: 13.5,
          color: colors.textSecondary, lineHeight: 1.6,
        }}>
          <span style={{ color: PREMIUM.accent, flexShrink: 0 }}>•</span>
          <span>{renderInline(trimmed.replace(/^[-*]\s*/, ''))}</span>
        </div>
      )
      continue
    }

    // 빈 줄
    if (!trimmed) continue

    // 일반 텍스트
    elements.push(
      <p key={key++} style={{
        margin: '6px 0', fontSize: 13.5, lineHeight: 1.7,
        color: colors.textSecondary,
      }}>{renderInline(trimmed)}</p>
    )
  }

  if (inTable) flushTable()

  return <>{elements}</>
}

function LoginGate({ dark, colors, label = '브리핑' }) {
  const btnRef = React.useRef(null)
  const [showBtn, setShowBtn] = React.useState(false)

  const handleLogin = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: '20826231899-mfkodjf7svaafnr63ne773g5s6cf5k1m.apps.googleusercontent.com',
        callback: async (response) => {
          try {
            const res = await fetch(`${API || ''}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            })
            if (res.ok) {
              const data = await res.json()
              if (data.user) {
                localStorage.setItem('dart_user', JSON.stringify(data.user))
                window.location.reload()
              }
            }
          } catch {}
        },
      })
      try {
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowBtn(true)
            setTimeout(() => {
              if (btnRef.current) {
                window.google.accounts.id.renderButton(btnRef.current, {
                  theme: 'outline', size: 'large', width: 280, text: 'signin_with',
                })
              }
            }, 100)
          }
        })
      } catch {
        setShowBtn(true)
        setTimeout(() => {
          if (btnRef.current) {
            window.google.accounts.id.renderButton(btnRef.current, {
              theme: 'outline', size: 'large', width: 280, text: 'signin_with',
            })
          }
        }, 100)
      }
    }
  }

  return (
    <div className="page-enter" style={{
      maxWidth: 640, margin: '0 auto',
      padding: '120px 24px', textAlign: 'center',
      fontFamily: FONTS.body,
    }}>
      <div style={{ marginBottom: 20 }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, fontFamily: FONTS.serif, marginBottom: 8 }}>
        로그인이 필요합니다
      </div>
      <div style={{ fontSize: 14, color: colors.textMuted, marginBottom: 32, lineHeight: 1.6 }}>
        {label}은 로그인 후 이용할 수 있습니다.
      </div>
      {showBtn ? (
        <div ref={btnRef} style={{ display: 'inline-block' }} />
      ) : (
        <button onClick={handleLogin} style={{
          padding: '12px 36px', borderRadius: 10, border: 'none',
          background: '#DC2626', color: '#fff',
          fontSize: 15, fontWeight: 600, cursor: 'pointer',
        }}>Google 로그인</button>
      )}
    </div>
  )
}

import React, { useState, useEffect, useMemo } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'

const API = import.meta.env.VITE_API_URL || ''

const C = {
  up: '#F04452', down: '#3182F6', green: '#10B981', amber: '#F59E0B',
  dimD: '#4E5968', dimL: '#8B95A1',
}
const MCAP_SHORT = { '대형(1조+)': '대형', '중형(3천억~1조)': '중형', '소형(~3천억)': '소형' }

export default function SignalPage() {
  const { dark, colors } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [view, setView] = useState('rank')
  const bg = dark ? '#000' : '#F4F5F7'
  const card = dark ? '#1C1C1E' : '#FFF'
  const dim = dark ? C.dimD : C.dimL
  const text = colors.textPrimary

  useEffect(() => {
    Promise.all([
      fetch(`${API}/api/impact`).then(r => r.json()),
      fetch(`${API}/api/impact/detailed`).then(r => r.json()),
    ]).then(([b, d]) => {
      setData({ basic: b.items || [], detailed: d })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const items = data?.basic || []
  const detailed = data?.detailed || {}
  const total = items.reduce((a, i) => a + i.count, 0)

  const golden = useMemo(() =>
    (detailed.cross || []).filter(c => c.avg_excess > 0 && c.win_rate >= 50 && c.count >= 5)
      .sort((a, b) => b.avg_excess - a.avg_excess).slice(0, 7), [detailed])

  const dead = useMemo(() =>
    (detailed.cross || []).filter(c => c.count >= 5)
      .sort((a, b) => a.avg_excess - b.avg_excess).slice(0, 7), [detailed])

  const maxExcess = useMemo(() => {
    if (!items.length) return 4
    return Math.max(4, ...items.map(i => Math.abs(i.avg_excess_close)))
  }, [items])

  if (loading) return (
    <div style={{ maxWidth: 960, margin: '0 auto', minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: dim, fontSize: 14 }}>불러오는 중</span>
    </div>
  )

  return (
    <div className="page-enter" style={{
      maxWidth: 960, margin: '0 auto', minHeight: '100vh', background: bg,
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body,
    }}>
      {/* 헤더 */}
      <div style={{ padding: '24px 24px 0' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: text, margin: 0, letterSpacing: '-0.5px' }}>공시 시그널</h1>
        <p style={{ fontSize: 14, color: dim, margin: '6px 0 0' }}>
          <span style={{ fontFamily: FONTS.mono, fontWeight: 700, color: text }}>{total.toLocaleString()}</span>건의 공시가 주가에 미친 영향
        </p>
      </div>

      {/* 히어로 */}
      {items.length > 0 && (() => {
        const hero = items.filter(i => i.count >= 10 && i.avg_excess_close > 0)
          .sort((a, b) => b.avg_excess_close - a.avg_excess_close)[0]
        if (!hero) return null
        return (
          <div style={{ margin: '16px 20px 0', padding: '16px 18px', borderRadius: 14, background: card, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            onClick={() => setSelected(hero)}>
            <div>
              <div style={{ fontSize: 11, color: dim }}>가장 강한 공시</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: text, marginTop: 2 }}>{hero.type}</div>
              <div style={{ fontSize: 12, color: dim, marginTop: 4 }}>승률 {hero.win_rate.toFixed(0)}% · {hero.count}건</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, fontFamily: FONTS.mono, color: C.up, letterSpacing: '-1px' }}>
              +{hero.avg_excess_close.toFixed(2)}%
            </div>
          </div>
        )
      })()}

      {/* 도트 플롯 — 데스크톱: 전체, 모바일: 상승분만 */}
      <div style={{ margin: '16px 20px 0' }}>
        <div style={{ background: card, borderRadius: 14, padding: '14px 14px 10px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: text, marginBottom: 10 }}>공시 유형별 초과수익률</div>
          {/* 컬럼 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, height: 20, marginBottom: 4 }}>
            <span style={{ width: 80, fontSize: 10, fontWeight: 600, color: dim, textAlign: 'right', paddingRight: 8, flexShrink: 0 }}>유형</span>
            <div style={{ flex: 1 }} />
            <span style={{ width: 50, fontSize: 10, fontWeight: 600, color: dim, textAlign: 'right', flexShrink: 0 }}>당일</span>
            <span className="signal-5d-col" style={{ width: 46, fontSize: 10, fontWeight: 600, color: dim, textAlign: 'right', flexShrink: 0 }}>5일</span>
            <span style={{ width: 32, fontSize: 10, fontWeight: 600, color: dim, textAlign: 'right', flexShrink: 0 }}>승률</span>
          </div>
          {items.filter(i => i.count >= 5).map(item => {
            const ex = item.avg_excess_close
            const isUp = ex >= 0
            const wr = item.win_rate
            const isSel = selected?.type === item.type
            const dotColor = isUp ? C.up : C.down
            const barMax = maxExcess
            const barPct = Math.min(45, (Math.abs(ex) / barMax) * 45)
            return (
              <div key={item.type} className={isUp ? '' : 'signal-dot-down'} onClick={() => setSelected(isSel ? null : item)} style={{
                display: 'flex', alignItems: 'center', gap: 0, cursor: 'pointer', height: 24,
                background: isSel ? (dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') : 'transparent',
                borderRadius: 4,
              }}>
                {/* 라벨 */}
                <span style={{ width: 80, fontSize: 11, fontWeight: 600, color: isSel ? text : dim, textAlign: 'right', paddingRight: 8, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.type}
                </span>
                {/* 바 영역 */}
                <div style={{ flex: 1, height: 16, position: 'relative' }}>
                  {/* 중심선 */}
                  <div style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: dim, opacity: 0.15 }} />
                  {/* 바 */}
                  <div style={{
                    position: 'absolute',
                    [isUp ? 'left' : 'right']: '50%',
                    top: 3, height: 10, borderRadius: 2,
                    width: `${barPct}%`,
                    background: dotColor,
                    opacity: isSel ? 0.9 : 0.5,
                  }} />
                  {/* 도트 */}
                  <div style={{
                    position: 'absolute',
                    left: `calc(50% + ${isUp ? '' : '-'}${barPct}%)`,
                    top: 3, width: 10, height: 10, borderRadius: '50%',
                    background: dotColor,
                    transform: 'translateX(-50%)',
                    border: isSel ? `2px solid ${text}` : 'none',
                  }} />
                </div>
                {/* 수치 */}
                <span style={{ width: 50, fontSize: 11, fontWeight: 700, fontFamily: FONTS.mono, color: dotColor, textAlign: 'right', flexShrink: 0 }}>
                  {isUp ? '+' : ''}{ex.toFixed(2)}%
                </span>
                <span className="signal-5d-col" style={{ width: 46, fontSize: 10, fontWeight: 600, fontFamily: FONTS.mono, textAlign: 'right', flexShrink: 0, color: item.avg_excess_5d != null ? (item.avg_excess_5d >= 0 ? C.up : C.down) : dim }}>
                  {item.avg_excess_5d != null ? `${item.avg_excess_5d >= 0 ? '+' : ''}${item.avg_excess_5d}%` : '—'}
                </span>
                <span style={{ width: 32, fontSize: 10, color: dim, textAlign: 'right', flexShrink: 0 }}>
                  {wr.toFixed(0)}%
                </span>
              </div>
            )
          })}
        </div>
      </div>


      {/* 모바일: 탭 */}
      <div className="signal-tabs" style={{ display: 'none', gap: 8, margin: '16px 20px 0' }}>
        {[
          { key: 'rank', label: '전체 랭킹' },
          { key: 'golden', label: '골든존' },
          { key: 'dead', label: '데드존' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => { setView(key); setSelected(null) }} style={{
            padding: '8px 16px', border: 'none', cursor: 'pointer', borderRadius: 20,
            fontSize: 13, fontWeight: view === key ? 700 : 500,
            color: view === key ? (dark ? '#000' : '#FFF') : dim,
            background: view === key ? text : (dark ? 'rgba(255,255,255,0.06)' : '#E8E8ED'),
          }}>{label}</button>
        ))}
      </div>

      {/* ═══ 데스크톱: 3컬럼 / 모바일: 탭 전환 ═══ */}
      <div className="signal-grid" style={{ display: 'flex', gap: 16, padding: '16px 20px 0', alignItems: 'flex-start' }}>

        {/* 전체 랭킹 */}
        <div className="signal-col signal-col-rank" style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: text, marginBottom: 8 }}>전체 랭킹</div>
          <div style={{ background: card, borderRadius: 14, overflow: 'hidden' }}>
            {items.filter(i => i.count >= 5).map((item, idx) => {
              const ex = item.avg_excess_close
              const barWidth = Math.min(90, (Math.abs(ex) / maxExcess) * 90)
              const isUp = ex >= 0
              const isSel = selected?.type === item.type
              return (
                <div key={item.type} onClick={() => setSelected(isSel ? null : item)} style={{
                  padding: '12px 14px', cursor: 'pointer',
                  borderBottom: idx < items.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}` : 'none',
                  background: isSel ? (dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)') : 'transparent',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: text }}>{item.type}</span>
                      <span style={{ fontSize: 10, color: dim }}>{item.count}건</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 14, fontWeight: 900, fontFamily: FONTS.mono, color: isUp ? C.up : C.down }}>
                        {isUp ? '+' : ''}{ex.toFixed(2)}%
                      </span>
                      {item.avg_excess_5d != null && (
                        <span style={{ fontSize: 11, fontWeight: 600, fontFamily: FONTS.mono, color: item.avg_excess_5d >= 0 ? C.up : C.down }}>
                          5일 {item.avg_excess_5d >= 0 ? '+' : ''}{item.avg_excess_5d}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 4, borderRadius: 2, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', overflow: 'hidden', position: 'relative' }}>
                      <div style={{
                        position: 'absolute', [isUp ? 'left' : 'right']: '50%', top: 0, height: '100%',
                        width: `${barWidth / 2}%`, borderRadius: 2, background: isUp ? C.up : C.down, opacity: 0.7,
                      }} />
                      <div style={{ position: 'absolute', left: '50%', top: 0, width: 1, height: '100%', background: dim, opacity: 0.2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: dim, width: 36, textAlign: 'right', flexShrink: 0 }}>{item.win_rate.toFixed(0)}%</span>
                  </div>
                  {isSel && <DetailInline item={item} dim={dim} text={text} dark={dark} detailed={detailed} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* 골든존 */}
        <div className="signal-col signal-col-zone" style={{ width: 260, flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.up, marginBottom: 8 }}>골든존</div>
          <div style={{ background: card, borderRadius: 14, overflow: 'hidden' }}>
            {golden.map((g, i) => <ZoneRow key={g.key} item={g} rank={i + 1} color={C.up} dim={dim} text={text} dark={dark} />)}
          </div>
        </div>

        {/* 데드존 */}
        <div className="signal-col signal-col-zone" style={{ width: 260, flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.up, marginBottom: 8 }}>데드존</div>
          <div style={{ background: card, borderRadius: 14, overflow: 'hidden' }}>
            {dead.map((g, i) => <ZoneRow key={g.key} item={g} rank={i + 1} color={C.up} dim={dim} text={text} dark={dark} />)}
          </div>
        </div>
      </div>

      <div style={{ margin: '8px 20px', fontSize: 11, color: dim, lineHeight: 1.7, textAlign: 'center' }}>
        초과수익률 = 종목 − 시장 · 5건 미만 제외
      </div>

      <style>{`
        .signal-tabs { display: none; }
        @media (max-width: 768px) {
          .signal-dot-down { display: none !important; }
          .signal-5d-col { display: none !important; }
          .signal-tabs { display: flex !important; }
          .signal-grid { flex-direction: column !important; padding: 8px 14px 0 !important; gap: 0 !important; }
          .signal-col-zone { width: 100% !important; margin-top: 16px; }
          .signal-col-rank { display: ${view === 'rank' ? 'block' : 'none'}; width: 100% !important; }
          .signal-col-zone:nth-child(2) { display: ${view === 'golden' ? 'block' : 'none'}; }
          .signal-col-zone:nth-child(3) { display: ${view === 'dead' ? 'block' : 'none'}; }
        }
      `}</style>
    </div>
  )
}

/* ── 인라인 상세 ── */
function DetailInline({ item, dim, text, dark, detailed }) {
  const cross = (detailed.cross || []).filter(c => c.key.startsWith(item.type + '|'))
  const samples = item.top_samples || []
  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}` }}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: dim }}>중앙값 <b style={{ color: item.median_excess_close >= 0 ? C.up : C.down }}>{item.median_excess_close >= 0 ? '+' : ''}{item.median_excess_close}%</b></span>
        {item.avg_excess_5d != null && (
          <span style={{ fontSize: 12, color: dim }}>5일 <b style={{ color: item.avg_excess_5d >= 0 ? C.up : C.down }}>{item.avg_excess_5d >= 0 ? '+' : ''}{item.avg_excess_5d}%</b></span>
        )}
      </div>
      {cross.length > 0 && cross.map(c => {
        const mc = c.key.split('|')[1]
        return (
          <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
            <span style={{ fontSize: 11, color: dim }}>{MCAP_SHORT[mc] || mc}</span>
            <span style={{ fontSize: 11, fontFamily: FONTS.mono, color: c.avg_excess >= 0 ? C.up : C.down, fontWeight: 700 }}>
              {c.avg_excess >= 0 ? '+' : ''}{c.avg_excess}% <span style={{ fontWeight: 400, color: dim }}>· {c.win_rate}%</span>
            </span>
          </div>
        )
      })}
      {samples.length > 0 && samples.slice(0, 2).map((s, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
          <span style={{ fontSize: 11, color: text }}>{s.corp_name} <span style={{ color: dim }}>{s.date}</span></span>
          <span style={{ fontSize: 11, fontWeight: 700, fontFamily: FONTS.mono, color: s.excess >= 0 ? C.up : C.down }}>
            {s.excess >= 0 ? '+' : ''}{s.excess}%
          </span>
        </div>
      ))}
      <div style={{ marginTop: 6, fontSize: 12, color: dim, lineHeight: 1.5 }}>{getInsight(item)}</div>
    </div>
  )
}

/* ── 골든/데드 행 ── */
function ZoneRow({ item, rank, color, dim, text, dark }) {
  const [dtype, mcap] = item.key.split('|')
  const barWidth = Math.min(80, Math.abs(item.avg_excess) * 15)
  return (
    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 800, fontFamily: FONTS.mono, color, width: 16 }}>{rank}</span>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: text }}>{dtype}</span>
            <span style={{ fontSize: 10, color: dim, marginLeft: 4 }}>{MCAP_SHORT[mcap] || mcap}</span>
          </div>
        </div>
        <span style={{ fontSize: 15, fontWeight: 900, fontFamily: FONTS.mono, color }}>
          {item.avg_excess >= 0 ? '+' : ''}{item.avg_excess}%
        </span>
      </div>
      <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${barWidth}%`, borderRadius: 2, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <span style={{ fontSize: 10, color: dim }}>승률 {item.win_rate}%</span>
        <span style={{ fontSize: 10, color: dim }}>{item.count}건</span>
      </div>
    </div>
  )
}

function getInsight(item) {
  const { type, win_rate: wr, avg_excess_close: ex } = item
  if (type === '자사주취득') return '경영진이 자기 돈으로 사는 건 이유가 있어요'
  if (type === '투자경고') return '투자경고 후 반등하는 패턴이 통계적으로 확인돼요'
  if (type === 'CB발행') return 'CB 발행일에 오히려 상승하는 경우가 많아요'
  if (type === '배당결정') return '배당 공시 후 오히려 하락해요. 재료 소진 효과'
  if (type === '시설투자') return '대규모 투자는 단기 악재로 작용해요'
  if (type === '감자결정') return '감자 후 5일간 -9%. 단기 회피가 유효해요'
  if (type === '전환권행사') return '희석 신호. 5일 후 -11.7%로 가장 큰 하락'
  if (ex >= 1) return `${type} 공시 후 평균 +${ex.toFixed(1)}% 상승`
  if (ex <= -1) return `${type} 공시 후 평균 ${ex.toFixed(1)}% 하락`
  return `당일 영향은 중립적. 공시 내용의 질이 방향을 결정해요`
}

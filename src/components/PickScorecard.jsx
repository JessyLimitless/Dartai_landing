import React, { useState } from 'react'
import { FONTS } from '../constants/theme'

// DART 픽 성적표 — 선정 후 시세 추적 + 요인 분해.
// 장 전 선정이므로 기준가는 전일(D-1) 종가. 현재는 장중 라이브 우선(없으면 최신 종가).
// 최고↑/최저↓는 선정일~+18영업일 고가·저가 envelope → "지속 상승/하락" 요인 모니터링.
export default function PickScorecard({ data, colors, dark, lineSep, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  const [tab, setTab] = useState('signal')
  const UP = '#E8364E', DOWN = '#2563EB'

  const rows = (data && Array.isArray(data.picks)) ? data.picks : []
  if (!rows.length) return null

  const overall = data.overall || {}
  const breakdown = data.breakdown || {}
  const best = data.best, worst = data.worst

  const colorOf = (v) => (typeof v !== 'number') ? colors.textMuted : v > 0 ? UP : v < 0 ? DOWN : colors.textMuted
  const fmt = (v, digits = 1) => {
    if (typeof v !== 'number') return '–'
    return `${v > 0 ? '+' : ''}${v.toFixed(digits)}%`
  }
  // 현재 값 = 라이브 우선, 없으면 최신 종가 ({live}=price, {latest}=close)
  const cur = (r) => r.live || r.latest
  const curPrice = (c) => (c == null ? null : (typeof c.price === 'number' ? c.price : c.close))
  const facChips = (f) => {
    if (!f) return []
    const out = []
    if (f.signal_type) out.push(f.repeat > 1 ? `${f.signal_type}·${f.repeat}회` : f.signal_type)
    if (f.pbr_band) out.push(`PBR ${f.pbr_band}`)
    if (f.is_ai) out.push('AI')
    return out
  }

  const th = { fontSize: 11, fontWeight: 700, color: colors.textMuted, padding: '7px 5px', textAlign: 'right', whiteSpace: 'nowrap' }
  const td = { fontSize: 12.5, padding: '9px 5px', textAlign: 'right', fontFamily: FONTS.mono, borderTop: `1px solid ${lineSep}` }

  const TABS = [
    ['signal', '신호유형', breakdown.by_signal],
    ['pbr', 'PBR', breakdown.by_pbr],
    ['ai', 'AI', breakdown.by_ai],
    ['theme', '테마', breakdown.by_theme],
  ]
  const activeGroups = (TABS.find(t => t[0] === tab)?.[2]) || []

  return (
    <div style={{ marginTop: 18 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          background: 'transparent', border: 'none', cursor: 'pointer',
          padding: '14px 0 8px', borderBottom: `1px solid ${lineSep}`, textAlign: 'left',
        }}
      >
        <span style={{
          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
          background: 'rgba(220,38,38,0.12)', color: '#DC2626', letterSpacing: '0.05em',
        }}>DART 픽</span>
        <span style={{ fontSize: 13, fontWeight: 800, color: colors.textSecondary }}>성적표</span>
        <span style={{ fontSize: 12, color: colors.textMuted }}>선정 후 시세 추적 · 요인 분해</span>
        <span style={{
          marginLeft: 'auto', fontSize: 12, color: colors.textMuted,
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s',
        }}>▾</span>
      </button>

      {open && (
        <>
          {/* 대표 성과: 청산룰(선정일 시가 진입 + 트레일링 -12%) 적용 실현손익 */}
          {overall.trail && (
            <div style={{ margin: '14px 0 6px' }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: colors.textSecondary, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.14)', color: '#16A34A', letterSpacing: '0.03em' }}>룰 적용</span>
                우리 매매룰대로 했으면
                <span style={{ fontWeight: 500, color: colors.textMuted }}>· {overall.trail.rule}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  ['실현 평균', overall.trail.avg, false],
                  ['중앙값', overall.trail.med, false],
                  ['승률', overall.trail.win, true],
                  ['손실 제한', overall.trail.worst, false],
                ].map(([label, val, isWin]) => (
                  <div key={label} style={{
                    flex: '1 1 0', minWidth: 82, padding: '10px 12px', borderRadius: 12,
                    border: `1px solid ${lineSep}`, background: dark ? '#141416' : '#FFF',
                  }}>
                    <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{label}</div>
                    <div style={{
                      fontSize: 17, fontWeight: 800, fontFamily: FONTS.mono,
                      color: isWin ? colors.textPrimary : colorOf(val),
                    }}>
                      {typeof val !== 'number' ? '–' : isWin ? `${val.toFixed(0)}%` : fmt(val)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 6, lineHeight: 1.55 }}>
                {overall.trail.n}건(청산 완료 {overall.trail.closed} · 보유중 {overall.trail.open}).
                {data.sample_note ? ` ${data.sample_note}` : ''}
              </div>
            </div>
          )}

          {/* 참고: 룰 미적용 원자료 — 종목이 실제로 어떻게 움직였나 */}
          <div style={{ fontSize: 10.5, color: colors.textMuted, margin: '12px 0 5px', fontWeight: 600 }}>참고 · 실제 추이(룰 미적용)</div>
          <div style={{ display: 'flex', gap: 8, margin: '0 0 6px', flexWrap: 'wrap' }}>
            {[
              ['현재 평균', overall.latest?.avg, overall.latest?.n],
              ['최고점 평균', overall.peak?.avg, overall.peak?.n],
              ['현재 승률', overall.latest ? overall.latest.win : undefined, overall.latest?.n, true],
            ].map(([label, val, n, isWin]) => (
              <div key={label} style={{
                flex: '1 1 0', minWidth: 96, padding: '10px 12px', borderRadius: 12,
                border: `1px solid ${lineSep}`, background: dark ? '#141416' : '#FFF',
              }}>
                <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>{label}</div>
                <div style={{
                  fontSize: 17, fontWeight: 800, fontFamily: FONTS.mono,
                  color: isWin ? colors.textPrimary : colorOf(val),
                }}>
                  {typeof val !== 'number' ? '–' : isWin ? `${val.toFixed(0)}%` : fmt(val)}
                </div>
                {typeof n === 'number' && (
                  <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>{n}건 기준</div>
                )}
              </div>
            ))}
          </div>

          {/* 종목별 표 — 기준가 → 현재(라이브) 사이 최고↑/최저↓ envelope */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: 'left' }}>선정일 · 종목</th>
                  <th style={{ ...th, textAlign: 'right' }}>기준가</th>
                  <th style={th}>현재가</th>
                  <th style={th}>최고↑</th>
                  <th style={th}>최저↓</th>
                  <th style={th} title="선정일 시가 진입 + 트레일링 -12% 실현손익">룰 실현</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => {
                  const c = cur(r)
                  return (
                    <tr key={`${r.date}-${r.stock_code}`}>
                      <td style={{ ...td, textAlign: 'left', fontFamily: FONTS.body, verticalAlign: 'top' }}>
                        <div>
                          <span style={{ color: colors.textMuted, fontFamily: FONTS.mono, fontSize: 11 }}>{r.date?.slice(5)}</span>
                          <span style={{ color: colors.textPrimary, fontWeight: 700, marginLeft: 6 }}>{r.corp_name}</span>
                          {r.role === 'secondary' && (
                            <span style={{
                              fontSize: 9, fontWeight: 700, color: colors.textMuted, marginLeft: 5,
                              border: `1px solid ${lineSep}`, borderRadius: 3, padding: '0 4px',
                            }}>보조</span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                          {facChips(r.factors).map((chip, i) => (
                            <span key={i} style={{
                              fontSize: 10, fontWeight: 600, color: colors.textMuted,
                              background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.045)',
                              padding: '1px 6px', borderRadius: 4,
                            }}>{chip}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ ...td, color: colors.textSecondary, verticalAlign: 'top' }}>
                        {r.base_close ? r.base_close.toLocaleString() : '–'}
                      </td>
                      <td style={{ ...td, verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          <span style={{ color: colors.textPrimary, fontWeight: 700 }}>
                            {curPrice(c) != null ? curPrice(c).toLocaleString() : '–'}
                          </span>
                          {r.live && (
                            <span title="장중 실시간" style={{
                              display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                              background: '#22C55E',
                            }} />
                          )}
                        </div>
                        <div style={{ color: colorOf(c?.pct), fontWeight: 700, fontSize: 11.5, marginTop: 2 }}>
                          {fmt(c?.pct)}
                        </div>
                      </td>
                      <td style={{ ...td, verticalAlign: 'top' }}>
                        <span style={{ color: colorOf(r.peak?.pct), fontWeight: 700 }}>{fmt(r.peak?.pct)}</span>
                      </td>
                      <td style={{ ...td, verticalAlign: 'top' }}>
                        <span style={{ color: colorOf(r.mdd?.pct), fontWeight: 700 }}>{fmt(r.mdd?.pct)}</span>
                      </td>
                      <td style={{ ...td, verticalAlign: 'top' }}>
                        <span style={{ color: colorOf(r.trail?.pct), fontWeight: 800 }}>{fmt(r.trail?.pct)}</span>
                        {r.trail && (
                          <div style={{ fontSize: 9.5, color: colors.textMuted, marginTop: 2, fontFamily: FONTS.body }}>
                            {r.trail.closed ? `청산·${r.trail.hold}일` : '보유중'}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* 요인 분해 — 어떤 요인이 지속 상승/하락하는가 */}
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: colors.textSecondary, marginBottom: 8 }}>
              요인별 성적 <span style={{ fontWeight: 500, color: colors.textMuted }}>— 어떤 요인이 잘 되나</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
              {TABS.map(([key, label, groups]) => (
                <button key={key} onClick={() => setTab(key)} disabled={!groups || !groups.length} style={{
                  padding: '5px 11px', borderRadius: 8, cursor: (!groups || !groups.length) ? 'default' : 'pointer',
                  border: `1px solid ${tab === key ? '#DC2626' : lineSep}`,
                  background: tab === key ? '#DC2626' : 'transparent',
                  color: tab === key ? '#FFF' : (!groups || !groups.length) ? colors.textMuted : colors.textSecondary,
                  fontSize: 12, fontWeight: tab === key ? 700 : 500, opacity: (!groups || !groups.length) ? 0.4 : 1,
                }}>{label}</button>
              ))}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ ...th, textAlign: 'left' }}>요인</th>
                    <th style={th}>건수</th>
                    <th style={th}>현재 평균</th>
                    <th style={th}>승률</th>
                    <th style={th}>최고 평균</th>
                  </tr>
                </thead>
                <tbody>
                  {activeGroups.length === 0 ? (
                    <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: colors.textMuted }}>데이터 없음</td></tr>
                  ) : activeGroups.map(g => (
                    <tr key={g.key}>
                      <td style={{ ...td, textAlign: 'left', fontFamily: FONTS.body, color: colors.textPrimary, fontWeight: 600 }}>{g.key}</td>
                      <td style={{ ...td, color: colors.textSecondary }}>{g.n}</td>
                      <td style={{ ...td, color: colorOf(g.avg_latest), fontWeight: 700 }}>{fmt(g.avg_latest)}</td>
                      <td style={{ ...td, color: colors.textSecondary }}>
                        {typeof g.win_latest === 'number' ? `${g.win_latest.toFixed(0)}%` : '–'}
                      </td>
                      <td style={{ ...td, color: colorOf(g.avg_peak) }}>{fmt(g.avg_peak)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 베스트 / 워스트 */}
          {(best || worst) && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
              {[['베스트', best, UP], ['워스트', worst, DOWN]].map(([label, r, col]) => r && (
                <div key={label} style={{
                  flex: '1 1 0', minWidth: 150, padding: '10px 12px', borderRadius: 12,
                  border: `1px solid ${lineSep}`, background: dark ? '#141416' : '#FFF',
                }}>
                  <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 3 }}>{label} 픽</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>
                    {r.corp_name}
                    <span style={{ fontSize: 15, fontWeight: 800, fontFamily: FONTS.mono, color: col, marginLeft: 8 }}>
                      {fmt(r.latest?.pct)}
                    </span>
                  </div>
                  <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 2 }}>
                    {r.date} · 최고 {fmt(r.peak?.pct)} / 최저 {fmt(r.mdd?.pct)}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 12, lineHeight: 1.6 }}>
            기준가 = <b style={{ color: colors.textSecondary }}>선정일 전 영업일(D-1) 종가</b>. “현재”는 장중 라이브(🟢)·없으면 최신 종가,
            “최고↑/최저↓”는 선정일 이후 최대 상승·하락폭입니다.
            “<b style={{ color: colors.textSecondary }}>룰 실현</b>”은 <b style={{ color: colors.textSecondary }}>선정일 시가에 진입</b>해
            고점 대비 <b style={{ color: colors.textSecondary }}>-12% 트레일링</b>으로 청산했을 때의 손익입니다(진입가 기준이라 분모가 기준가와 다름).
            소수계좌 알파는 <b style={{ color: colors.textSecondary }}>T+10~25일</b>에 나오니 최고점 도달률도 함께 보세요.
            시세는 키움 API 실측값입니다.
          </div>
        </>
      )}
    </div>
  )
}

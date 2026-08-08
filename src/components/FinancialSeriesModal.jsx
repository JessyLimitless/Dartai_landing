import React from 'react'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useTheme } from '../contexts/ThemeContext'
import { chartGrid, chartAxis } from './ChartPrimitives'
import { PREMIUM, FONTS } from '../constants/theme'
import { apiFetch } from '../lib/api'

/**
 * 재무 시계열 시각화 — 분기 12개 콤보 차트 3종.
 *
 * 색상은 dataviz 검증 팔레트를 통과한 조합만 쓴다.
 *   light  #2a78d6 #eb6834 #1baf7a #eda100 #4a3aa7  (surface #FFFFFF)
 *   dark   #3987e5 #d95926 #199e70 #c98500 #9085e9  (surface #18181B)
 * 라이트 모드에서 aqua·yellow가 3:1 미만이라 표 보기를 함께 제공한다(대비 완화 규칙).
 */
const SERIES = {
  light: { s1: '#2a78d6', s2: '#eb6834', s3: '#1baf7a', s4: '#eda100', s5: '#4a3aa7' },
  dark: { s1: '#3987e5', s2: '#d95926', s3: '#199e70', s4: '#c98500', s5: '#9085e9' },
}

// ── 단위 처리 ─────────────────────────────────────────────────────
// 원 단위 정수를 조/억으로 축약한다. 시계열 전체에서 단위를 한 번만 정해
// 막대 높이 비교가 눈으로 성립하게 한다.
function pickUnit(values) {
  const max = Math.max(0, ...values.filter((v) => v != null).map((v) => Math.abs(v)))
  if (max >= 1e12) return { div: 1e12, suffix: '조' }
  if (max >= 1e8) return { div: 1e8, suffix: '억' }
  return { div: 1, suffix: '원' }
}

const fmtUnit = (v, unit, digits = null) => {
  if (v == null) return '-'
  const n = v / unit.div
  // 조 단위는 자릿수가 크게 줄어 1자리로는 뭉개진다(1.0조가 12분기 내내 반복).
  if (digits == null) digits = unit.suffix === '조' ? 2 : 1
  // -0.0 방지: 반올림 후 0이면 부호를 떼고 0으로 표기
  const s = n.toFixed(digits)
  return `${Number(s) === 0 ? (0).toFixed(digits) : s}${unit.suffix}`
}

const fmtAxis = (unit) => (v) => {
  if (v === 0) return '0'
  const n = v / unit.div
  return Math.abs(n) >= 100 ? n.toFixed(0) : n.toFixed(1)
}

// ── 툴팁 ─────────────────────────────────────────────────────────
function SeriesTooltip({ active, payload, label, unit, pctKeys = [] }) {
  const { colors, dark } = useTheme()
  if (!active || !payload || payload.length === 0) return null
  // 축은 "2Q"로 줄였지만 툴팁엔 연도까지 온전히 보여준다.
  const full = payload[0]?.payload?.label || label
  return (
    <div style={{
      backgroundColor: dark ? '#27272A' : '#fff',
      padding: '10px 13px', borderRadius: 10, border: 'none',
      boxShadow: PREMIUM.shadowLg, fontSize: 12, color: colors.textPrimary,
      minWidth: 168,
    }}>
      <div style={{ fontWeight: 700, fontSize: 11, marginBottom: 6, color: colors.textSecondary }}>
        {full}
      </div>
      {payload.map((e, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
          <span style={{
            width: 7, height: 7, borderRadius: 2, flexShrink: 0,
            backgroundColor: e.color || e.fill,
          }} />
          <span style={{ color: colors.textMuted, fontSize: 11 }}>{e.name}</span>
          <span style={{
            fontWeight: 600, marginLeft: 'auto', fontFamily: FONTS.mono,
            fontVariantNumeric: 'tabular-nums',
            color: e.value < 0 ? colors.negative : colors.textPrimary,
          }}>
            {pctKeys.includes(e.dataKey)
              ? (e.value == null ? '-' : `${e.value.toFixed(1)}%`)
              : fmtUnit(e.value, unit)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── X축 눈금 ─────────────────────────────────────────────────────
// 12분기를 한 줄에 넣으면 좁은 화면에서 슬롯이 ~26px라 "23.1Q"(5글자)가 옆 눈금과
// 겹친다. 분기는 윗줄에 2글자로, 연도는 바뀌는 지점에만 아랫줄에 따로 찍는다.
function QuarterTick({ x, y, payload, rows, colors }) {
  const d = rows[payload?.index]
  if (!d) return null
  const prev = rows[payload.index - 1]
  const showYear = !prev || prev.year !== d.year
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} dy={11} textAnchor="middle" fontSize={10} fill={colors.textMuted}>
        {d.quarter}Q
      </text>
      {showYear && (
        <text x={0} dy={24} textAnchor="middle" fontSize={10} fontWeight={700}
          fill={colors.textSecondary}>
          {`'${String(d.year).slice(2)}`}
        </text>
      )}
    </g>
  )
}


// ── 차트 껍데기 ───────────────────────────────────────────────────
function ChartBlock({ title, caption, children }) {
  const { colors, dark } = useTheme()
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary, marginBottom: 2 }}>
        {title}
      </div>
      {caption && (
        <div style={{ fontSize: 11, color: colors.textMuted, marginBottom: 10, lineHeight: 1.5 }}>
          {caption}
        </div>
      )}
      <div style={{
        backgroundColor: colors.bgCard, borderRadius: 14,
        border: `1px solid ${colors.border}`, padding: '16px 10px 8px',
      }}>
        {children}
      </div>
    </div>
  )
}

const legendStyle = (colors) => ({
  fontSize: 11, color: colors.textSecondary, paddingTop: 6,
})

export default function FinancialSeriesModal({ corpCode, corpName, onClose }) {
  const { colors, dark } = useTheme()
  const C = dark ? SERIES.dark : SERIES.light
  const surface = colors.bgCard
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [showTable, setShowTable] = React.useState(false)

  React.useEffect(() => {
    let alive = true
    setLoading(true)
    setError('')
    apiFetch(`/api/companies/${corpCode}/financial-series?years=3`)
      .then((res) => { if (alive) { setData(res); setLoading(false) } })
      .catch(() => { if (alive) { setError('재무 시계열을 불러오지 못했어요'); setLoading(false) } })
    return () => { alive = false }
  }, [corpCode])

  // ESC 닫기 + 배경 스크롤 잠금
  React.useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  // X축 눈금: 12분기를 -45° 회전시키면 끝 라벨이 잘린다.
  // 연도는 바뀌는 지점에만 붙이고 나머지는 "2Q"로 줄여 눕힌 채로 넣는다.
  const quarters = React.useMemo(() => {
    const qs = data?.quarters || []
    return qs.map((q, i) => ({
      ...q,
      tick: (i === 0 || q.year !== qs[i - 1].year)
        ? `${String(q.year).slice(2)}.${q.quarter}Q`
        : `${q.quarter}Q`,
    }))
  }, [data])
  const hasFlow = quarters.some((q) => q.revenue != null)
  // 값이 전부 없는 시리즈는 그리지도, 범례에 올리지도 않는다.
  // (시가총액은 키움 조회 실패 시 통째로 비는데, 범례만 남으면 유령 시리즈가 된다)
  // 전부 0인 시리즈도 제외한다 — 막대는 안 보이는데 범례만 남는다.
  const has = React.useCallback(
    (key) => quarters.some((q) => q[key] != null && q[key] !== 0),
    [quarters],
  )
  // 범례 순서를 스택 순서에 고정한다. recharts 기본 순서는 스택에서 뒤섞인다.
  const legendOf = (items) => items.map(([value, color]) => ({
    value, color, type: 'circle', id: value,
  }))

  const isUnit = React.useMemo(
    () => pickUnit(quarters.flatMap((q) => [q.revenue, q.market_cap])),
    [quarters],
  )
  const bsUnit = React.useMemo(
    () => pickUnit(quarters.map((q) => q.total_assets)),
    [quarters],
  )
  const cfUnit = React.useMemo(
    () => pickUnit(quarters.flatMap((q) => [q.operating_cf, q.investing_cf, q.financing_cf, q.fcf])),
    [quarters],
  )

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: dark ? 'rgba(0,0,0,0.72)' : 'rgba(24,24,27,0.45)',
        // alignItems 기본값 stretch면 안쪽 패널이 뷰포트 높이에 고정돼
        // 배경만 거기서 끊기고 내용은 계속 흘러 마지막 차트가 패널 밖으로 나간다.
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        overflowY: 'auto', padding: '0',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: colors.bgPrimary, width: '100%', maxWidth: 720,
          minHeight: '100%', padding: '0 0 60px',
        }}
      >
        {/* 헤더 */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 2,
          backgroundColor: colors.bgPrimary,
          borderBottom: `1px solid ${colors.border}`,
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary }}>
              재무 시각화
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 1 }}>
              {corpName || corpCode} · 최근 12분기
            </div>
          </div>
          <button
            onClick={() => setShowTable((v) => !v)}
            style={{
              background: showTable ? colors.textPrimary : 'transparent',
              color: showTable ? colors.bgCard : colors.textSecondary,
              border: `1px solid ${showTable ? colors.textPrimary : colors.border}`,
              borderRadius: 8, padding: '7px 12px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            표
          </button>
          <button onClick={onClose} aria-label="닫기" style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: colors.textMuted, display: 'flex',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div style={{ padding: '20px 18px 0' }}>
          {loading && (
            <div style={{ padding: '60px 0', textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>
              재무 데이터를 불러오는 중…
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: '60px 0', textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>
              {error}
            </div>
          )}

          {!loading && !error && quarters.length === 0 && (
            <div style={{ padding: '60px 0', textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>
              이 기업은 아직 분기 재무 데이터가 없어요
            </div>
          )}

          {!loading && !error && quarters.length > 0 && (
            <>
              {!hasFlow && (
                <div style={{
                  backgroundColor: dark ? 'rgba(234,88,12,0.10)' : '#FFF7ED',
                  border: `1px solid ${dark ? 'rgba(234,88,12,0.25)' : '#FED7AA'}`,
                  borderRadius: 10, padding: '11px 13px', marginBottom: 18,
                  fontSize: 12, color: colors.textSecondary, lineHeight: 1.6,
                }}>
                  분기보고서를 제출하지 않는 기업이라 손익·현금흐름의 단독 분기값을
                  계산할 수 없어요. 재무상태표만 표시합니다.
                </div>
              )}

              {showTable ? (
                <SeriesTable quarters={quarters} colors={colors} dark={dark} />
              ) : (
                <>
                  {hasFlow && (
                    <ChartBlock
                      title="실적"
                      caption={`매출원가 + 판매관리비 + 영업이익 = 매출액 (단위 ${isUnit.suffix}원)`}
                    >
                      <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={quarters} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                          <CartesianGrid {...chartGrid(dark)} />
                          <XAxis dataKey="tick" {...chartAxis(colors)} interval={0}
                            height={34} minTickGap={0}
                            tick={<QuarterTick rows={quarters} colors={colors} />} />
                          <YAxis yAxisId="left" {...chartAxis(colors)} tickFormatter={fmtAxis(isUnit)} />
                          <YAxis yAxisId="right" orientation="right" {...chartAxis(colors)}
                            tickFormatter={fmtAxis(isUnit)} hide={!has('market_cap')} />
                          <Tooltip content={<SeriesTooltip unit={isUnit} />}
                            cursor={{ fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
                          <Legend wrapperStyle={legendStyle(colors)} iconType="circle" iconSize={7} itemSorter={null}
                            payload={legendOf([
                              ['매출원가', C.s1], ['판매관리비', C.s2],
                              ['영업이익', C.s3],
                              ...(has('other_opex') ? [['기타', C.s4]] : []),
                              ...(has('market_cap') ? [['시가총액', C.s5]] : []),
                            ])} />
                          {/* stroke=surface → 스택 segment 사이 2px 간격 */}
                          <Bar yAxisId="left" dataKey="cogs" stackId="s" name="매출원가"
                            fill={C.s1} stroke={surface} strokeWidth={1} maxBarSize={26} />
                          <Bar yAxisId="left" dataKey="sgna" stackId="s" name="판매관리비"
                            fill={C.s2} stroke={surface} strokeWidth={1} maxBarSize={26} />
                          <Bar yAxisId="left" dataKey="operating_profit" stackId="s" name="영업이익"
                            fill={C.s3} stroke={surface} strokeWidth={1} maxBarSize={26}
                            radius={has('other_opex') ? undefined : [4, 4, 0, 0]} />
                          {has('other_opex') && (
                            <Bar yAxisId="left" dataKey="other_opex" stackId="s" name="기타"
                              fill={C.s4} stroke={surface} strokeWidth={1} maxBarSize={26}
                              radius={[4, 4, 0, 0]} />
                          )}
                          {has('market_cap') && (
                            <Line yAxisId="right" type="monotone" dataKey="market_cap" name="시가총액"
                              stroke={C.s5} strokeWidth={2} dot={{ r: 2.5, strokeWidth: 0, fill: C.s5 }}
                              activeDot={{ r: 5, stroke: surface, strokeWidth: 2 }} connectNulls />
                          )}
                        </ComposedChart>
                      </ResponsiveContainer>
                      {data.market_cap_basis && quarters.some((q) => q.market_cap != null) && (
                        <div style={{ fontSize: 10, color: colors.textMuted, padding: '2px 8px 6px', lineHeight: 1.5 }}>
                          시가총액은 {data.market_cap_basis}
                        </div>
                      )}
                    </ChartBlock>
                  )}

                  <ChartBlock
                    title="재무현황"
                    caption={`자본총계 + 부채총계 = 자산총계 (단위 ${bsUnit.suffix}원) · 우축은 부채비율(%)`}
                  >
                    <ResponsiveContainer width="100%" height={280}>
                      <ComposedChart data={quarters} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                        <CartesianGrid {...chartGrid(dark)} />
                        <XAxis dataKey="tick" {...chartAxis(colors)} interval={0}
                          height={34} minTickGap={0}
                          tick={<QuarterTick rows={quarters} colors={colors} />} />
                        <YAxis yAxisId="left" {...chartAxis(colors)} tickFormatter={fmtAxis(bsUnit)} />
                        <YAxis yAxisId="right" orientation="right" {...chartAxis(colors)}
                          tickFormatter={(v) => `${v}%`} />
                        <Tooltip content={<SeriesTooltip unit={bsUnit} pctKeys={['debt_ratio']} />}
                          cursor={{ fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
                        <Legend wrapperStyle={legendStyle(colors)} iconType="circle" iconSize={7} itemSorter={null}
                          payload={legendOf([
                            ['자본총계', C.s1], ['부채총계', C.s2],
                            ...(has('debt_ratio') ? [['부채비율', C.s5]] : []),
                          ])} />
                        <Bar yAxisId="left" dataKey="total_equity" stackId="b" name="자본총계"
                          fill={C.s1} stroke={surface} strokeWidth={1} maxBarSize={26} />
                        <Bar yAxisId="left" dataKey="total_liabilities" stackId="b" name="부채총계"
                          fill={C.s2} stroke={surface} strokeWidth={1} maxBarSize={26}
                          radius={[4, 4, 0, 0]} />
                        <Line yAxisId="right" type="monotone" dataKey="debt_ratio" name="부채비율"
                          stroke={C.s5} strokeWidth={2} dot={{ r: 2.5, strokeWidth: 0, fill: C.s5 }}
                          activeDot={{ r: 5, stroke: surface, strokeWidth: 2 }} connectNulls />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </ChartBlock>

                  {hasFlow && (
                    <ChartBlock
                      title="현금흐름"
                      caption={`막대는 잉여현금흐름(영업CF − CAPEX), 선은 활동별 현금흐름 (단위 ${cfUnit.suffix}원)`}
                    >
                      <ResponsiveContainer width="100%" height={280}>
                        <ComposedChart data={quarters} margin={{ top: 4, right: 4, left: -12, bottom: 0 }}>
                          <CartesianGrid {...chartGrid(dark)} />
                          <XAxis dataKey="tick" {...chartAxis(colors)} interval={0}
                            height={34} minTickGap={0}
                            tick={<QuarterTick rows={quarters} colors={colors} />} />
                          <YAxis {...chartAxis(colors)} tickFormatter={fmtAxis(cfUnit)} />
                          <Tooltip content={<SeriesTooltip unit={cfUnit} />}
                            cursor={{ fill: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }} />
                          <Legend wrapperStyle={legendStyle(colors)} iconType="circle" iconSize={7} itemSorter={null}
                            payload={legendOf([
                              ['잉여현금흐름', dark ? 'rgba(255,255,255,0.30)' : '#C9C6C1'],
                              ['영업활동', C.s1], ['투자활동', C.s2], ['재무활동', C.s3],
                            ])} />
                          <ReferenceLine y={0} stroke={dark ? '#383835' : '#C3C2B7'} strokeWidth={1} />
                          <Bar dataKey="fcf" name="잉여현금흐름"
                            fill={dark ? 'rgba(255,255,255,0.20)' : '#D9D6D1'}
                            maxBarSize={26} radius={[3, 3, 0, 0]} />
                          <Line type="monotone" dataKey="operating_cf" name="영업활동"
                            stroke={C.s1} strokeWidth={2} dot={{ r: 2.5, strokeWidth: 0, fill: C.s1 }}
                            activeDot={{ r: 5, stroke: surface, strokeWidth: 2 }} connectNulls />
                          <Line type="monotone" dataKey="investing_cf" name="투자활동"
                            stroke={C.s2} strokeWidth={2} dot={{ r: 2.5, strokeWidth: 0, fill: C.s2 }}
                            activeDot={{ r: 5, stroke: surface, strokeWidth: 2 }} connectNulls />
                          <Line type="monotone" dataKey="financing_cf" name="재무활동"
                            stroke={C.s3} strokeWidth={2} dot={{ r: 2.5, strokeWidth: 0, fill: C.s3 }}
                            activeDot={{ r: 5, stroke: surface, strokeWidth: 2 }} connectNulls />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </ChartBlock>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 표 보기 (라이트 모드 대비 완화 + 접근성 대체 경로) ─────────────
const TABLE_ROWS = [
  ['매출액', 'revenue'], ['매출원가', 'cogs'], ['판매관리비', 'sgna'],
  ['영업이익', 'operating_profit'], ['자산총계', 'total_assets'],
  ['부채총계', 'total_liabilities'], ['자본총계', 'total_equity'],
  ['부채비율', 'debt_ratio'], ['영업활동CF', 'operating_cf'],
  ['투자활동CF', 'investing_cf'], ['재무활동CF', 'financing_cf'],
  ['잉여현금흐름', 'fcf'],
]

function SeriesTable({ quarters, colors, dark }) {
  const sep = dark ? 'rgba(255,255,255,0.07)' : '#F0F0F0'
  // 단위는 행마다 따로 고른다. 표 전체에 하나만 쓰면 판관비·현금흐름처럼
  // 자릿수가 작은 항목이 전부 "0.0조"로 뭉개진다.
  const rowUnits = Object.fromEntries(
    TABLE_ROWS.map(([, key]) => [key, pickUnit(quarters.map((q) => q[key]))]),
  )
  return (
    <div style={{ overflowX: 'auto', marginBottom: 28 }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse', fontSize: 12,
        minWidth: 140 + quarters.length * 74,
      }}>
        <thead>
          <tr>
            <th style={{
              position: 'sticky', left: 0, backgroundColor: colors.bgPrimary,
              textAlign: 'left', padding: '8px 10px', color: colors.textMuted,
              fontWeight: 600, fontSize: 11, borderBottom: `1px solid ${sep}`,
            }}>
              항목
            </th>
            {quarters.map((q) => (
              <th key={q.label} style={{
                textAlign: 'right', padding: '8px 10px', color: colors.textMuted,
                fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap',
                borderBottom: `1px solid ${sep}`,
              }}>{q.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TABLE_ROWS.map(([label, key]) => (
            <tr key={key}>
              <td style={{
                position: 'sticky', left: 0, backgroundColor: colors.bgPrimary,
                padding: '8px 10px', color: colors.textSecondary,
                whiteSpace: 'nowrap', borderBottom: `1px solid ${sep}`,
              }}>
                {label}
                {key !== 'debt_ratio' && (
                  <span style={{ color: colors.textMuted, fontSize: 10, marginLeft: 4 }}>
                    ({rowUnits[key].suffix}원)
                  </span>
                )}
              </td>
              {quarters.map((q) => {
                const v = q[key]
                return (
                  <td key={q.label} style={{
                    textAlign: 'right', padding: '8px 10px',
                    fontFamily: FONTS.mono, fontVariantNumeric: 'tabular-nums',
                    color: v == null ? colors.textMuted
                      : v < 0 ? colors.negative : colors.textPrimary,
                    whiteSpace: 'nowrap', borderBottom: `1px solid ${sep}`,
                  }}>
                    {key === 'debt_ratio'
                      ? (v == null ? '-' : `${v.toFixed(1)}%`)
                      : fmtUnit(v, rowUnits[key])}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

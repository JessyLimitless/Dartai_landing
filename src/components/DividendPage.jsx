import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { PREMIUM, FONTS, getBoxStyle } from '../constants/theme'
import { useDividend, useDividendStock } from '../hooks/useDividend'

// ── 배당 안전등급 팔레트 ─────────────────────────────────────────
// 등급은 '안전'을 뜻하므로 주가 등락(적=상승)과 다른 축을 쓴다.
const DIV_GRADE = {
  S: { label: '최우수', solid: '#0D9488', light: '#F0FDFA', text: '#0F766E', darkText: '#5EEAD4' },
  A: { label: '우수', solid: '#16A34A', light: '#F0FDF4', text: '#15803D', darkText: '#86EFAC' },
  B: { label: '보통', solid: '#D97706', light: '#FFFBEB', text: '#B45309', darkText: '#FCD34D' },
  C: { label: '주의', solid: '#EA580C', light: '#FFF7ED', text: '#C2410C', darkText: '#FDBA74' },
  D: { label: '위험', solid: '#DC2626', light: '#FEF2F2', text: '#B91C1C', darkText: '#FCA5A5' },
}

const TABS = [
  { key: 'screener', label: '배당 스크리너' },
  { key: 'calendar', label: '배당 캘린더' },
  { key: 'capture', label: '캡처 시그널' },
]

const PRESETS = [
  { key: 'all', label: '전체', params: {} },
  { key: 'high', label: '고배당 5%+', params: { min_yield: 5 } },
  { key: 'safe', label: '안전 우량 A+', params: { min_score: 65 } },
  { key: 'streak', label: '3년 연속', params: { min_consecutive: 3 } },
  { key: 'core', label: '핵심 (고배당·안전·연속)', params: { min_yield: 4, min_score: 65, min_consecutive: 3 } },
  { key: 'sane', label: '배당성향 60% 이하', params: { max_payout: 60 } },
]

const SORTS = [
  { key: 'score', label: '안전점수' },
  { key: 'yield', label: '수익률' },
  { key: 'dps', label: '배당금' },
  { key: 'consecutive', label: '연속 연수' },
]

const fmtPct = (v, d = 2) => (v === null || v === undefined || isNaN(v) ? '—' : `${v.toFixed(d)}%`)
const fmtNum = (v) => (v === null || v === undefined || isNaN(v) ? '—' : Math.round(v).toLocaleString())
const fmtDate = (s) => (s && s.length === 8 ? `${s.slice(4, 6)}.${s.slice(6, 8)}` : '—')

// ── 원자 컴포넌트 ────────────────────────────────────────────────

function GradeBadge({ grade, size = 'md' }) {
  const { dark } = useTheme()
  const g = DIV_GRADE[grade] || DIV_GRADE.D
  const sm = size === 'sm'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: sm ? 20 : 24, height: sm ? 20 : 24, padding: '0 6px',
      borderRadius: 6, fontSize: sm ? 11 : 12, fontWeight: 700,
      fontFamily: FONTS.mono, letterSpacing: '0.02em',
      background: g.solid, color: '#fff',
      boxShadow: dark ? 'none' : `0 1px 3px ${g.solid}33`,
    }}>{grade}</span>
  )
}

/** 안전점수 게이지 — 숫자와 막대를 함께 보여 한눈에 서열이 읽히게 한다 */
function ScoreGauge({ score, grade, width = 92 }) {
  const { dark } = useTheme()
  const g = DIV_GRADE[grade] || DIV_GRADE.D
  const pct = Math.max(0, Math.min(100, score || 0))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, minWidth: 34,
        textAlign: 'right', color: dark ? g.darkText : g.text,
        fontVariantNumeric: 'tabular-nums',
      }}>{score ?? '—'}</span>
      <div style={{
        width, height: 6, borderRadius: 3, overflow: 'hidden',
        background: dark ? 'rgba(255,255,255,0.08)' : '#EFEFF1',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 3,
          background: g.solid, transition: 'width .35s ease',
        }} />
      </div>
    </div>
  )
}

/** DPS 3년 추세 스파크라인 */
function DpsSpark({ dps }) {
  const { dark } = useTheme()
  const vals = (dps || []).map((v) => (v === null || v === undefined ? null : v))
  const nums = vals.filter((v) => v !== null && v > 0)
  if (nums.length < 2) return <span style={{ color: dark ? '#52525B' : '#C4C4C8', fontSize: 11 }}>—</span>

  const max = Math.max(...nums), min = Math.min(...nums)
  const span = max - min || 1
  const w = 44, h = 16
  const pts = vals.map((v, i) => {
    if (v === null || v <= 0) return null
    const x = (i / Math.max(1, vals.length - 1)) * w
    const y = h - ((v - min) / span) * h
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).filter(Boolean).join(' ')

  const rising = nums[nums.length - 1] > nums[0]
  const color = rising ? '#16A34A' : nums[nums.length - 1] < nums[0] ? '#DC2626' : (dark ? '#71717A' : '#A1A1AA')

  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.6"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Stat({ label, value, sub, accent }) {
  const { colors, dark } = useTheme()
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: 11, color: colors.textMuted, fontWeight: 500,
        letterSpacing: '0.02em', marginBottom: 4, whiteSpace: 'nowrap',
      }}>{label}</div>
      <div style={{
        fontFamily: FONTS.mono, fontSize: 19, fontWeight: 700, lineHeight: 1.1,
        color: accent ? (dark ? '#5EEAD4' : '#0F766E') : colors.textPrimary,
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function Notice({ tone = 'info', title, children }) {
  const { dark } = useTheme()
  const map = {
    info: { bd: '#3B82F6', bg: dark ? 'rgba(59,130,246,.08)' : '#EFF6FF', tx: dark ? '#93C5FD' : '#1D4ED8' },
    warn: { bd: '#D97706', bg: dark ? 'rgba(217,119,6,.09)' : '#FFFBEB', tx: dark ? '#FCD34D' : '#B45309' },
  }
  const c = map[tone] || map.info
  return (
    <div style={{
      borderLeft: `3px solid ${c.bd}`, background: c.bg,
      borderRadius: '0 10px 10px 0', padding: '12px 14px', marginBottom: 14,
    }}>
      {title && <div style={{ fontSize: 12.5, fontWeight: 700, color: c.tx, marginBottom: 4 }}>{title}</div>}
      <div style={{ fontSize: 12.5, lineHeight: 1.65, color: c.tx, opacity: 0.92 }}>{children}</div>
    </div>
  )
}

function SkeletonRows({ n = 8 }) {
  const { dark } = useTheme()
  return (
    <div style={{ padding: '8px 0' }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="dv-skel" style={{
          height: 44, margin: '0 14px 8px',
          borderRadius: 8,
          background: dark ? 'rgba(255,255,255,0.045)' : '#F4F4F5',
        }} />
      ))}
    </div>
  )
}

function Empty({ text }) {
  const { colors } = useTheme()
  return (
    <div style={{ padding: '52px 20px', textAlign: 'center', color: colors.textMuted, fontSize: 13 }}>
      {text}
    </div>
  )
}

// ── 스크리너 탭 ──────────────────────────────────────────────────

function FactorBars({ factors }) {
  const { colors, dark } = useTheme()
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(168px, 1fr))', gap: '10px 18px',
    }}>
      {(factors || []).map((f) => {
        const pct = (f.score / (f.max || 20)) * 100
        const tone = pct >= 80 ? '#16A34A' : pct >= 50 ? '#D97706' : '#DC2626'
        return (
          <div key={f.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11.5, color: colors.textSecondary, fontWeight: 600 }}>{f.label}</span>
              <span style={{
                fontSize: 11.5, fontFamily: FONTS.mono, fontWeight: 700, color: tone,
                fontVariantNumeric: 'tabular-nums',
              }}>{f.score}<span style={{ opacity: .45 }}>/{f.max}</span></span>
            </div>
            <div style={{
              height: 4, borderRadius: 2, overflow: 'hidden',
              background: dark ? 'rgba(255,255,255,0.07)' : '#EFEFF1', marginBottom: 4,
            }}>
              <div style={{ width: `${pct}%`, height: '100%', background: tone, borderRadius: 2 }} />
            </div>
            <div style={{ fontSize: 10.5, color: colors.textMuted, lineHeight: 1.4 }}>{f.note}</div>
          </div>
        )
      })}
    </div>
  )
}

function ExpandedDetail({ row }) {
  const { colors, dark } = useTheme()
  const { data } = useDividendStock(row.stock_code)
  const cap = data?.capture

  return (
    <div style={{
      padding: '16px 18px 18px',
      background: dark ? 'rgba(255,255,255,0.022)' : '#FBFBFC',
      borderTop: `1px solid ${dark ? '#1E1E22' : '#F0F0F2'}`,
    }}>
      <FactorBars factors={row.factors} />

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '8px 22px', marginTop: 16,
        paddingTop: 14, borderTop: `1px dashed ${dark ? '#232328' : '#EAEAEC'}`,
        fontSize: 12, color: colors.textSecondary,
      }}>
        <span>연도별 DPS&nbsp;
          <b style={{ fontFamily: FONTS.mono, color: colors.textPrimary }}>
            {(row.years || []).map((y, i) => `${y.slice(2)}년 ${fmtNum(row.dps[i])}원`).join(' · ')}
          </b>
        </span>
        {row.close && (
          <span>기준 종가&nbsp;
            <b style={{ fontFamily: FONTS.mono, color: colors.textPrimary }}>
              {fmtNum(row.close)}원 ({fmtDate(row.close_dt)})
            </b>
            {row.close_stale_days > 3 && (
              <span style={{ color: '#D97706', marginLeft: 6 }}>· {row.close_stale_days}일 지연</span>
            )}
          </span>
        )}
        {data && (
          <span>유니버스 순위&nbsp;
            <b style={{ fontFamily: FONTS.mono, color: colors.textPrimary }}>
              {data.rank}위 / {data.universe}
            </b>
          </span>
        )}
        <span>결산&nbsp;<b style={{ color: colors.textPrimary }}>{row.settlement_label}</b></span>
      </div>

      {cap && (
        <div style={{ marginTop: 12, fontSize: 12, color: colors.textSecondary }}>
          배당 공시 후 5거래일 시장 대비 초과수익&nbsp;
          <b style={{ fontFamily: FONTS.mono, color: colors.textPrimary }}>
            {fmtPct(cap.capture?.horizons?.['5']?.excess_med)}
          </b>
          <span style={{ color: colors.textMuted }}> (표본 {cap.capture?.sample_n}건 · 인과 아님)</span>
        </div>
      )}
    </div>
  )
}

function ScreenerTab() {
  const { colors, dark } = useTheme()
  const [preset, setPreset] = useState('all')
  const [sort, setSort] = useState('score')
  const [basis, setBasis] = useState('live')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)

  const params = useMemo(() => ({
    ...(PRESETS.find((p) => p.key === preset)?.params || {}),
    sort, yield_basis: basis, limit: 60, q: q.trim() || undefined,
  }), [preset, sort, basis, q])

  const { data, loading, error } = useDividend('screener', params)
  const s = data?.summary
  const items = data?.items || []
  const ykey = basis === 'live' ? 'live_yield' : 'dart_yield'

  return (
    <div>
      {/* 요약 스트립 */}
      <div style={{
        ...getBoxStyle(dark, 'section'), padding: '16px 18px', marginBottom: 14,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(112px, 1fr))', gap: 16,
      }}>
        <Stat label="배당 유니버스" value={s ? `${s.universe.toLocaleString()}` : '—'} sub="종목" />
        <Stat label="추천 등급 (A+)" value={s ? `${s.recommended_count.toLocaleString()}` : '—'} sub="65점 이상" accent />
        <Stat label="평균 안전점수" value={s?.avg_score ?? '—'} sub="100점 만점" />
        <Stat label="중앙 배당수익률" value={s ? fmtPct(s.med_yield) : '—'} sub={basis === 'live' ? '현재가 기준' : 'DART 시가배당률'} />
        <Stat label="조건 충족" value={s ? `${s.matched.toLocaleString()}` : '—'} sub="종목" />
      </div>

      {s?.stale_count > 0 && (
        <Notice tone="warn" title="가격 기준일 안내">
          전체 {s.universe.toLocaleString()}종 중 <b>{s.stale_count.toLocaleString()}종</b>은 일봉 수집이 밀려
          최신 거래일({fmtDate(s.price_as_of)})보다 오래된 종가로 수익률을 계산했습니다.
          종목을 펼치면 각 종목의 기준 종가와 지연 일수를 확인할 수 있습니다.
        </Notice>
      )}

      {/* 필터 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {PRESETS.map((p) => {
            const active = preset === p.key
            return (
              <button key={p.key} onClick={() => { setPreset(p.key); setOpen(null) }}
                className="dv-chip"
                style={{
                  padding: '7px 13px', borderRadius: 999, cursor: 'pointer', fontSize: 12.5,
                  fontWeight: active ? 700 : 500,
                  border: `1px solid ${active ? PREMIUM.accent : (dark ? '#27272A' : '#E4E4E7')}`,
                  background: active ? PREMIUM.accent : 'transparent',
                  color: active ? '#fff' : colors.textSecondary,
                  transition: 'all .18s ease',
                }}>{p.label}</button>
            )
          })}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="종목명 · 코드 검색"
            style={{
              flex: '1 1 180px', maxWidth: 260, padding: '8px 12px', fontSize: 13,
              borderRadius: 8, outline: 'none',
              border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
              background: dark ? '#0F0F11' : '#fff', color: colors.textPrimary,
              fontFamily: FONTS.body,
            }} />

          <Segmented value={basis} onChange={setBasis} options={[
            { key: 'live', label: '현재가 기준' }, { key: 'dart', label: 'DART 공시' },
          ]} />

          <Segmented value={sort} onChange={setSort} options={SORTS} />
        </div>
      </div>

      {/* 테이블 */}
      <div style={{ ...getBoxStyle(dark, 'table') }}>
        <div className="dv-head" style={{
          display: 'grid', gap: 10, padding: '11px 16px',
          borderBottom: `1px solid ${dark ? '#1E1E22' : '#F0F0F2'}`,
          background: dark ? '#101012' : '#FBFBFC',
          fontSize: 11, fontWeight: 600, color: colors.textMuted, letterSpacing: '0.02em',
        }}>
          <span>종목</span>
          <span>안전점수</span>
          <span style={{ textAlign: 'right' }}>배당수익률</span>
          <span style={{ textAlign: 'right' }} className="dv-c-dps">주당배당금</span>
          <span style={{ textAlign: 'right' }} className="dv-c-payout">배당성향</span>
          <span style={{ textAlign: 'center' }} className="dv-c-trend">3년 추세</span>
        </div>

        {loading && <SkeletonRows />}
        {error && <Empty text={`불러오지 못했습니다 — ${error}`} />}
        {!loading && !error && items.length === 0 && <Empty text="조건에 맞는 종목이 없습니다." />}

        {!loading && !error && items.map((r) => {
          const expanded = open === r.stock_code
          const g = DIV_GRADE[r.grade] || DIV_GRADE.D
          const y = r[ykey]
          return (
            <div key={r.stock_code || r.corp_code}>
              <div
                className="dv-row"
                onClick={() => setOpen(expanded ? null : r.stock_code)}
                style={{
                  display: 'grid', gap: 10, padding: '11px 16px', cursor: 'pointer',
                  alignItems: 'center',
                  borderBottom: `1px solid ${dark ? '#161619' : '#F6F6F7'}`,
                  background: expanded ? (dark ? 'rgba(255,255,255,0.03)' : '#FAFAFB') : 'transparent',
                  transition: 'background .15s ease',
                }}>
                <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <GradeBadge grade={r.grade} size="sm" />
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 13.5, fontWeight: 600, color: colors.textPrimary,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{r.corp_name}</div>
                    <div style={{
                      fontSize: 10.5, color: colors.textMuted, fontFamily: FONTS.mono, marginTop: 1,
                    }}>{r.stock_code} · {r.consecutive_years}년 연속</div>
                  </div>
                </div>

                <ScoreGauge score={r.safety_score} grade={r.grade} />

                <div style={{
                  textAlign: 'right', fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700,
                  color: y >= 5 ? (dark ? '#5EEAD4' : '#0F766E') : colors.textPrimary,
                  fontVariantNumeric: 'tabular-nums',
                }}>{fmtPct(y)}</div>

                <div className="dv-c-dps" style={{
                  textAlign: 'right', fontFamily: FONTS.mono, fontSize: 13,
                  color: colors.textSecondary, fontVariantNumeric: 'tabular-nums',
                }}>{fmtNum(r.latest_dps)}원</div>

                <div className="dv-c-payout" style={{
                  textAlign: 'right', fontFamily: FONTS.mono, fontSize: 13,
                  color: (r.payout_ratio ?? 0) > 100 || (r.payout_ratio ?? 0) < 0 ? '#DC2626' : colors.textSecondary,
                  fontVariantNumeric: 'tabular-nums',
                }}>{fmtPct(r.payout_ratio, 1)}</div>

                <div className="dv-c-trend" style={{ display: 'flex', justifyContent: 'center' }}>
                  <DpsSpark dps={r.dps} />
                </div>
              </div>
              {expanded && <ExpandedDetail row={r} />}
            </div>
          )
        })}

        {!loading && data?.total > items.length && (
          <div style={{
            padding: '11px 16px', fontSize: 12, color: colors.textMuted, textAlign: 'center',
          }}>
            상위 {items.length}종 표시 · 조건 충족 {data.total.toLocaleString()}종
          </div>
        )}
      </div>
    </div>
  )
}

function Segmented({ value, onChange, options }) {
  const { colors, dark } = useTheme()
  return (
    <div style={{
      display: 'inline-flex', gap: 2, padding: 3, borderRadius: 9,
      background: dark ? 'rgba(255,255,255,0.05)' : '#F4F4F5',
    }}>
      {options.map((o) => {
        const active = value === o.key
        return (
          <button key={o.key} onClick={() => onChange(o.key)}
            style={{
              padding: '6px 11px', borderRadius: 7, border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: active ? 700 : 500,
              background: active ? (dark ? '#27272A' : '#fff') : 'transparent',
              color: active ? colors.textPrimary : colors.textMuted,
              boxShadow: active && !dark ? '0 1px 2px rgba(0,0,0,.07)' : 'none',
              transition: 'all .16s ease', whiteSpace: 'nowrap',
            }}>{o.label}</button>
        )
      })}
    </div>
  )
}

// ── 캘린더 탭 ────────────────────────────────────────────────────

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

function CalendarTab() {
  const { colors, dark } = useTheme()
  const [month, setMonth] = useState(null)
  const { data, loading } = useDividend('calendar', { month: month || undefined, limit: 30 })

  const buckets = data?.buckets || []
  const bmap = Object.fromEntries(buckets.map((b) => [b.month, b]))
  const maxCount = Math.max(1, ...buckets.map((b) => b.count))
  const sel = data?.selected_month

  return (
    <div>
      <Notice tone="info" title="이 캘린더가 보여주는 것">
        기업이 <b>실제 공시한 결산기준일</b>의 분포입니다. 배당기준일·지급일은 종목마다 다르고
        개별 공시 본문에만 있어 여기서 단정하지 않습니다 — 아래 <b>확정 공시 피드</b>로 실제 발생 이벤트를 확인하세요.
      </Notice>

      {/* 월별 분포 */}
      <div style={{ ...getBoxStyle(dark, 'section'), padding: 16, marginBottom: 14 }}>
        <div style={{
          fontSize: 12.5, fontWeight: 700, color: colors.textPrimary, marginBottom: 12,
        }}>결산월 분포 <span style={{ fontWeight: 400, color: colors.textMuted }}>· 막대를 눌러 해당 월 기업 보기</span></div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 5, alignItems: 'end',
          height: 110,
        }}>
          {MONTHS.map((m) => {
            const b = bmap[m]
            const cnt = b?.count || 0
            const h = cnt ? Math.max(6, (cnt / maxCount) * 76) : 3
            const active = sel === m
            return (
              <button key={m} onClick={() => setMonth(m)} title={b ? `${b.label} ${cnt}종` : '해당 없음'}
                disabled={!cnt}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                  gap: 5, border: 'none', background: 'transparent', padding: 0,
                  cursor: cnt ? 'pointer' : 'default', height: '100%',
                }}>
                <span style={{
                  fontSize: 10, fontFamily: FONTS.mono, fontWeight: 700,
                  color: active ? PREMIUM.accent : colors.textMuted,
                  opacity: cnt ? 1 : 0.35,
                }}>{cnt || ''}</span>
                <div style={{
                  width: '100%', height: h, borderRadius: '4px 4px 0 0',
                  background: active ? PREMIUM.accent : cnt ? (dark ? '#3F3F46' : '#D4D4D8') : (dark ? '#1E1E22' : '#EFEFF1'),
                  transition: 'background .18s ease, height .3s ease',
                }} />
                <span style={{
                  fontSize: 10.5, fontFamily: FONTS.mono,
                  color: active ? PREMIUM.accent : colors.textMuted,
                  fontWeight: active ? 700 : 500,
                }}>{parseInt(m, 10)}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="dv-cal-grid" style={{ display: 'grid', gap: 14 }}>
        {/* 선택 월 기업 */}
        <div style={{ ...getBoxStyle(dark, 'table') }}>
          <div style={{
            padding: '12px 16px', borderBottom: `1px solid ${dark ? '#1E1E22' : '#F0F0F2'}`,
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8,
          }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: colors.textPrimary }}>
              {bmap[sel]?.label || '결산월'} 기업
            </span>
            <span style={{ fontSize: 11.5, color: colors.textMuted, fontFamily: FONTS.mono }}>
              {data ? `${data.item_total.toLocaleString()}종 · 안전점수 순` : ''}
            </span>
          </div>

          {loading && <SkeletonRows n={6} />}
          {!loading && (data?.items || []).length === 0 && <Empty text="해당 월 데이터가 없습니다." />}
          {!loading && (data?.items || []).map((r) => (
            <div key={r.stock_code} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px',
              borderBottom: `1px solid ${dark ? '#161619' : '#F6F6F7'}`,
            }}>
              <GradeBadge grade={r.grade} size="sm" />
              <span style={{
                flex: 1, minWidth: 0, fontSize: 13, fontWeight: 600, color: colors.textPrimary,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{r.corp_name}</span>
              <span style={{
                fontFamily: FONTS.mono, fontSize: 12.5, color: colors.textSecondary,
                fontVariantNumeric: 'tabular-nums',
              }}>{fmtNum(r.latest_dps)}원</span>
              <span style={{
                fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700, minWidth: 54, textAlign: 'right',
                color: (r.live_yield ?? 0) >= 5 ? (dark ? '#5EEAD4' : '#0F766E') : colors.textPrimary,
                fontVariantNumeric: 'tabular-nums',
              }}>{fmtPct(r.live_yield)}</span>
            </div>
          ))}
        </div>

        {/* 확정 공시 피드 */}
        <div style={{ ...getBoxStyle(dark, 'table') }}>
          <div style={{
            padding: '12px 16px', borderBottom: `1px solid ${dark ? '#1E1E22' : '#F0F0F2'}`,
            fontSize: 13, fontWeight: 700, color: colors.textPrimary,
          }}>
            최근 배당 확정 공시
            <span style={{ fontWeight: 400, fontSize: 11.5, color: colors.textMuted, marginLeft: 6 }}>
              실제 발생 이벤트
            </span>
          </div>
          {loading && <SkeletonRows n={6} />}
          {!loading && (data?.recent_filings || []).slice(0, 24).map((f) => (
            <div key={f.rcept_no} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px',
              borderBottom: `1px solid ${dark ? '#161619' : '#F6F6F7'}`,
            }}>
              <span style={{
                fontFamily: FONTS.mono, fontSize: 11, color: colors.textMuted, minWidth: 42,
              }}>{(f.created_at || '').slice(5, 10)}</span>
              <span style={{
                fontSize: 12.5, fontWeight: 600, color: colors.textPrimary,
                minWidth: 0, maxWidth: '38%',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{f.corp_name}</span>
              <span style={{
                flex: 1, minWidth: 0, fontSize: 11.5, color: colors.textMuted,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{f.report_nm}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── 캡처 시그널 탭 ───────────────────────────────────────────────

function CaptureTab() {
  const { colors, dark } = useTheme()
  const [sort, setSort] = useState('reliability')
  const [minSample, setMinSample] = useState(2)
  const { data, loading } = useDividend('capture', { sort, min_sample: minSample, limit: 40 })

  const items = data?.items || []

  return (
    <div>
      <Notice tone="warn" title="먼저 읽어주세요 — 이 지표는 인과가 아닙니다">
        <div style={{ marginBottom: 6 }}>
          <b>연말 배당락 회복률은 만들지 않았습니다.</b> 배당절차 개편(선 배당금 확정 → 후 배당기준일 지정)으로
          배당기준일이 연말에서 이탈했고, 실제로 2025년 12월 하순 시장 전체 일별 수익률 중앙값은
          <b> -0.44%~0.00%</b>로 배당락이 실측되지 않았습니다. 없는 배당락일을 가정하지 않습니다.
        </div>
        <div>
          대신 <b>배당 결정 공시일 이후 시장(전종목 중앙값) 대비 초과수익</b>을 실측했습니다.
          공시가 주가를 올렸다는 뜻이 아니라 <b>공시 전후의 흐름</b>일 뿐입니다.
          {data?.shock_overlap?.pct != null && (
            <> 특히 표본의 <b>{data.shock_overlap.pct}%</b>가 {data.shock_overlap.window} 구간에 걸쳐 있어
            시장 충격과 분리되지 않습니다.</>
          )}
        </div>
      </Notice>

      <div style={{
        ...getBoxStyle(dark, 'section'), padding: '14px 18px', marginBottom: 14,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(108px, 1fr))', gap: 16,
      }}>
        <Stat label="분석 종목" value={data ? data.stock_n?.toLocaleString() : '—'} sub="배당 공시 보유" />
        <Stat label="공시 이벤트" value={data ? data.sample_n?.toLocaleString() : '—'} sub="건" />
        <Stat label="랭킹 대상" value={data ? data.total?.toLocaleString() : '—'} sub={`표본 ${minSample}건 이상`} />
        <Stat label="표본 기간" value={data?.period ? `${fmtDate(data.period.from)}` : '—'}
          sub={data?.period ? `~ ${fmtDate(data.period.to)}` : ''} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12, alignItems: 'center' }}>
        <Segmented value={sort} onChange={setSort} options={[
          { key: 'reliability', label: '승률' },
          { key: 'speed', label: '초과수익' },
          { key: 'yield', label: '배당수익률' },
          { key: 'score', label: '안전점수' },
        ]} />
        <Segmented value={minSample} onChange={setMinSample} options={[
          { key: 2, label: '표본 2+' }, { key: 3, label: '표본 3+' }, { key: 4, label: '표본 4+' },
        ]} />
      </div>

      <div style={{ ...getBoxStyle(dark, 'table') }}>
        <div className="dv-cap-head" style={{
          display: 'grid', gap: 10, padding: '11px 16px',
          borderBottom: `1px solid ${dark ? '#1E1E22' : '#F0F0F2'}`,
          background: dark ? '#101012' : '#FBFBFC',
          fontSize: 11, fontWeight: 600, color: colors.textMuted,
        }}>
          <span>종목</span>
          <span style={{ textAlign: 'right' }}>5일 초과수익</span>
          <span style={{ textAlign: 'right' }} className="dv-c-win">승률</span>
          <span style={{ textAlign: 'right' }} className="dv-c-h20">20일 초과</span>
          <span style={{ textAlign: 'right' }}>표본</span>
        </div>

        {loading && <SkeletonRows />}
        {!loading && items.length === 0 && <Empty text="조건에 맞는 종목이 없습니다." />}
        {!loading && items.map((i) => {
          const h5 = i.capture?.horizons?.['5'] || {}
          const h20 = i.capture?.horizons?.['20'] || {}
          const ex5 = h5.excess_med
          const ex20 = h20.excess_med
          const tone = (v) => (v == null ? colors.textMuted : v > 0 ? (dark ? '#F87171' : '#DC2626') : (dark ? '#60A5FA' : '#2563EB'))
          return (
            <div key={i.stock_code} className="dv-row dv-cap" style={{
              display: 'grid', gap: 10, padding: '11px 16px', alignItems: 'center',
              borderBottom: `1px solid ${dark ? '#161619' : '#F6F6F7'}`,
            }}>
              <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                {i.grade && <GradeBadge grade={i.grade} size="sm" />}
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 13.5, fontWeight: 600, color: colors.textPrimary,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>{i.corp_name}</div>
                  <div style={{ fontSize: 10.5, color: colors.textMuted, fontFamily: FONTS.mono, marginTop: 1 }}>
                    {i.stock_code}{i.live_yield != null && ` · 수익률 ${fmtPct(i.live_yield)}`}
                  </div>
                </div>
              </div>
              <div style={{
                textAlign: 'right', fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700,
                color: tone(ex5), fontVariantNumeric: 'tabular-nums',
              }}>{ex5 == null ? '—' : `${ex5 > 0 ? '+' : ''}${ex5.toFixed(2)}%`}</div>
              <div className="dv-c-win" style={{
                textAlign: 'right', fontFamily: FONTS.mono, fontSize: 13, color: colors.textSecondary,
                fontVariantNumeric: 'tabular-nums',
              }}>{h5.excess_win_rate == null ? '—' : `${h5.excess_win_rate}%`}</div>
              <div className="dv-c-h20" style={{
                textAlign: 'right', fontFamily: FONTS.mono, fontSize: 13, color: tone(ex20),
                fontVariantNumeric: 'tabular-nums',
              }}>{ex20 == null ? '—' : `${ex20 > 0 ? '+' : ''}${ex20.toFixed(2)}%`}</div>
              <div style={{
                textAlign: 'right', fontFamily: FONTS.mono, fontSize: 12,
                color: i.capture?.low_sample ? '#D97706' : colors.textMuted,
              }}>{i.capture?.sample_n}건</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 페이지 ───────────────────────────────────────────────────────

export default function DividendPage() {
  const { colors, dark } = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const active = TABS.some((t) => t.key === tabParam) ? tabParam : 'screener'

  const setTab = (k) => setSearchParams(k === 'screener' ? {} : { tab: k }, { replace: true })

  return (
    <div>
      <style>{`
        .dv-head, .dv-row { grid-template-columns: minmax(0,2.3fr) 148px 96px 96px 88px 64px; }
        .dv-cap-head, .dv-row.dv-cap { grid-template-columns: minmax(0,2.3fr) 108px 78px 96px 60px; }
        .dv-cal-grid { grid-template-columns: 1fr 1fr; }
        .dv-row:hover { background: ${dark ? 'rgba(255,255,255,0.028)' : '#FAFAFB'} !important; }
        .dv-chip:hover { border-color: ${PREMIUM.accent} !important; }
        .dv-skel { animation: dvPulse 1.4s ease-in-out infinite; }
        @keyframes dvPulse { 0%,100% { opacity:1 } 50% { opacity:.45 } }
        @media (max-width: 1024px) {
          .dv-cal-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 860px) {
          .dv-head, .dv-row { grid-template-columns: minmax(0,2fr) 120px 84px 84px; }
          .dv-c-payout, .dv-c-trend { display: none !important; }
          .dv-cap-head, .dv-row.dv-cap { grid-template-columns: minmax(0,2fr) 96px 72px 56px; }
          .dv-c-h20 { display: none !important; }
        }
        @media (max-width: 600px) {
          .dv-head, .dv-row { grid-template-columns: minmax(0,1.6fr) 96px 76px; }
          .dv-c-dps { display: none !important; }
          .dv-cap-head, .dv-row.dv-cap { grid-template-columns: minmax(0,1.6fr) 88px 56px; }
          .dv-c-win { display: none !important; }
        }
      `}</style>

      {/* 서브탭 */}
      <div className="sub-tab-bar" style={{
        display: 'flex', justifyContent: 'center',
        borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.bgCard,
      }}>
        <div style={{
          display: 'inline-flex', gap: 4, padding: 4, borderRadius: 10,
          backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5',
        }}>
          {TABS.map((t) => {
            const on = active === t.key
            return (
              <button key={t.key} onClick={() => setTab(t.key)} className="sub-tab-btn"
                style={{
                  padding: '11px 20px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: on ? 600 : 500,
                  backgroundColor: on ? colors.bgCard : 'transparent',
                  color: on ? PREMIUM.accent : colors.textSecondary,
                  boxShadow: on ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease', WebkitTapHighlightColor: 'transparent',
                }}>{t.label}</button>
            )
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '20px 16px 56px' }}>
        {/* 헤더 */}
        <div style={{ marginBottom: 18 }}>
          <h1 style={{
            fontFamily: FONTS.serif, fontSize: 25, fontWeight: 700, margin: 0,
            color: colors.textPrimary, letterSpacing: '-0.01em',
          }}>배당</h1>
          <p style={{
            margin: '6px 0 0', fontSize: 13, color: colors.textSecondary, lineHeight: 1.6,
          }}>
            DART 공시 배당 데이터로 <b style={{ color: colors.textPrimary }}>안전점수 5요소</b>를 계산하고,
            현재가 기준 실시간 배당수익률로 다시 줄 세웁니다.
          </p>
        </div>

        {active === 'screener' && <ScreenerTab />}
        {active === 'calendar' && <CalendarTab />}
        {active === 'capture' && <CaptureTab />}

        <div style={{
          marginTop: 22, paddingTop: 14, fontSize: 11.5, lineHeight: 1.7,
          color: colors.textMuted, borderTop: `1px solid ${dark ? '#1E1E22' : '#F0F0F2'}`,
        }}>
          <b>데이터 출처</b> · 배당 이력 = DART 정기공시 배당에관한사항(alotMatter) · 종가 = 키움 일봉(price_daily) ·
          배당수익률(현재가 기준) = 최신 DPS ÷ 최신 종가 재계산 · 안전점수 = 지속성·성장·배당성향·수익률·실적 5요소 각 20점.
          투자 판단과 책임은 이용자 본인에게 있습니다.
        </div>
      </div>
    </div>
  )
}

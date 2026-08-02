import React, { useState, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM_GOLD } from '../constants/theme'
import { useDividend, useDividendStock } from '../hooks/useDividend'

// ══════════════════════════════════════════════════════════════════
// 배당 — 에디토리얼 프레임 · 모노크롬 + 골드 1점
//
// 색 규칙 (이 파일 전체에 적용)
//  · 기본은 무채색(잉크 램프). 위계는 색이 아니라 크기·굵기·여백으로 만든다.
//  · 골드는 최상위 등급(S)에만. 한 화면에 강조색은 하나뿐이어야 눈이 쉰다.
//  · 상태색(경고/위험)은 '상태'에만 쓰고 등급 서열에는 쓰지 않는다.
//    반드시 라벨을 동반한다 — 색만으로 뜻을 전달하지 않는다(색각 접근성).
//  · 숫자 텍스트는 데이터 색을 입지 않는다. 정체성은 옆의 마크가 나른다.
//    예외: 초과수익의 +/- 는 부호가 곧 의미라 등락 관례색을 쓰되 부호를 병기한다.
// ══════════════════════════════════════════════════════════════════

/** 무채색 잉크 램프 — 라이트/다크 각각 별도로 고른 단계(자동 반전 아님) */
const INK = {
  light: { 900: '#18181B', 700: '#3F3F46', 600: '#52525B', 400: '#A1A1AA', 300: '#C4C4C8', 200: '#D4D4D8', 100: '#E9E9EC', 50: '#F4F4F5', rule: '#EAEAEC', ruleSoft: '#F2F2F4', surface: '#FFFFFF' },
  dark: { 900: '#FAFAFA', 700: '#D4D4D8', 600: '#A1A1AA', 400: '#71717A', 300: '#52525B', 200: '#3F3F46', 100: '#27272A', 50: '#1C1C1F', rule: '#232327', ruleSoft: '#1A1A1D', surface: '#0E0E10' },
}
const useInk = () => { const { dark } = useTheme(); return dark ? INK.dark : INK.light }

/** 골드 — 라이트/다크에서 각각 대비를 확보한 단계 */
const GOLD = { light: { mark: PREMIUM_GOLD.primary, text: '#8A6508', wash: 'rgba(212,160,23,0.14)' },
               dark: { mark: '#E3B84A', text: '#E3B84A', wash: 'rgba(227,184,74,0.18)' } }
const useGold = () => { const { dark } = useTheme(); return dark ? GOLD.dark : GOLD.light }

/** 상태색 — 오직 '위험 신호'에만. 등급 서열에는 절대 쓰지 않는다. */
const STATUS = { light: { warn: '#B45309', warnWash: '#FEF6E7' }, dark: { warn: '#E0A82E', warnWash: 'rgba(224,168,46,0.12)' } }
const useStatus = () => { const { dark } = useTheme(); return dark ? STATUS.dark : STATUS.light }

// 등급 = 색이 아니라 라벨 + 잉크 단계. S만 골드를 쓴다.
const GRADE_LABEL = { S: '최우수', A: '우수', B: '보통', C: '주의', D: '위험' }
const GRADE_INK = { S: 'gold', A: 900, B: 600, C: 400, D: 400 }

const TABS = [
  { key: 'screener', label: '스크리너' },
  { key: 'calendar', label: '캘린더' },
  { key: 'capture', label: '캡처 시그널' },
]

const PRESETS = [
  { key: 'all', label: '전체', params: {} },
  { key: 'high', label: '고배당 5%+', params: { min_yield: 5 } },
  { key: 'safe', label: '안전 65점+', params: { min_score: 65 } },
  { key: 'streak', label: '3년 연속', params: { min_consecutive: 3 } },
  { key: 'core', label: '핵심', params: { min_yield: 4, min_score: 65, min_consecutive: 3 } },
  { key: 'sane', label: '배당성향 60% 이하', params: { max_payout: 60 } },
]

const SORTS = [
  { key: 'score', label: '안전점수' },
  { key: 'yield', label: '수익률' },
  { key: 'dps', label: '배당금' },
  { key: 'consecutive', label: '연속' },
]

const nil = (v) => v === null || v === undefined || (typeof v === 'number' && isNaN(v))
const fmtPct = (v, d = 2) => (nil(v) ? '—' : `${v.toFixed(d)}%`)
const fmtSigned = (v, d = 2) => (nil(v) ? '—' : `${v > 0 ? '+' : ''}${v.toFixed(d)}%`)
const fmtNum = (v) => (nil(v) ? '—' : Math.round(v).toLocaleString())
const fmtDate = (s) => (s && s.length === 8 ? `${s.slice(4, 6)}.${s.slice(6, 8)}` : '—')

/** 배당성향 이상 판정 — 100% 초과(이익보다 많이 배당) 또는 음수(적자 중 배당) */
const payoutRisk = (p) => (nil(p) ? null : p < 0 ? '적자 배당' : p > 100 ? '이익 초과 배당' : null)

// ══════════════════════════════════════════════════════════════════
// 원자 컴포넌트
// ══════════════════════════════════════════════════════════════════

/** 얇은 구분선 — 이 페이지에서 '박스' 대신 구조를 만드는 유일한 장치 */
function Rule({ strong = false, style }) {
  const ink = useInk()
  return <div style={{ height: 1, background: strong ? ink.rule : ink.ruleSoft, ...style }} />
}

/** 섹션 라벨 — 스몰캡스. 제목을 크게 키우는 대신 작고 조용하게 둔다. */
function Eyebrow({ children, style }) {
  const ink = useInk()
  return (
    <div style={{
      fontSize: 10.5, fontWeight: 700, letterSpacing: '0.11em', textTransform: 'uppercase',
      color: ink[400], ...style,
    }}>{children}</div>
  )
}

/** 등급 마크 — 점(색) + 라벨(글자). 색만으로 뜻을 전하지 않는다. */
function GradeMark({ grade, showLabel = true, size = 7 }) {
  const ink = useInk(); const gold = useGold()
  const step = GRADE_INK[grade]
  const isGold = step === 'gold'
  const color = isGold ? gold.mark : ink[step] || ink[400]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
      <span style={{ width: size, height: size, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {showLabel && (
        <span style={{
          fontSize: 11, fontWeight: isGold ? 700 : 600,
          color: isGold ? gold.text : ink[600],
        }}>{GRADE_LABEL[grade] || '—'}</span>
      )}
    </span>
  )
}

/**
 * 안전점수 미터 — 시퀀셜(크기) 인코딩.
 * 트랙은 채움과 '같은 램프의 옅은 단계'를 쓴다(무채색 회색 트랙 금지).
 */
function Meter({ score, grade, width = 56 }) {
  const ink = useInk(); const gold = useGold()
  const isGold = GRADE_INK[grade] === 'gold'
  const pct = Math.max(0, Math.min(100, score || 0))
  const fill = isGold ? gold.mark : ink[600]
  const track = isGold ? gold.wash : ink[100]
  return (
    <div style={{ width, height: 3, background: track, borderRadius: 1.5, overflow: 'hidden' }}>
      <div style={{
        width: `${pct}%`, height: '100%', background: fill,
        borderRadius: '0 1.5px 1.5px 0', transition: 'width .35s ease',
      }} />
    </div>
  )
}

/**
 * DPS 3년 추세 — 최신 연도만 강조하고 나머지는 물러난다.
 * 값 라벨은 붙이지 않는다(모든 점에 숫자 = 소음). 값은 펼침 상세와 표에 있다.
 */
function Spark({ dps }) {
  const ink = useInk(); const gold = useGold()
  const vals = (dps || []).map((v) => (nil(v) || v <= 0 ? null : v))
  const nums = vals.filter((v) => v !== null)
  if (nums.length < 2) return <span style={{ fontSize: 11, color: ink[300] }}>—</span>

  const max = Math.max(...nums), min = Math.min(...nums)
  const span = max - min || 1
  const w = 46, h = 15, pad = 2
  const pt = (v, i) => [
    (i / Math.max(1, vals.length - 1)) * w,
    (h - pad) - ((v - min) / span) * (h - pad * 2),
  ]
  const pts = vals.map((v, i) => (v === null ? null : pt(v, i))).filter(Boolean)
  const last = pts[pts.length - 1]
  const rising = nums[nums.length - 1] > nums[0]

  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
      <polyline points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')}
        fill="none" stroke={ink[300]} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* 끝점은 서피스 링을 둘러 겹침에도 읽히게 한다 */}
      <circle cx={last[0]} cy={last[1]} r="2.6" fill={rising ? gold.mark : ink[400]}
        stroke={ink.surface} strokeWidth="1.5" />
    </svg>
  )
}

/**
 * 히어로 수치 — 한 화면에 하나만.
 * 세리프/디스플레이 서체를 쓰지 않는다(장식처럼 읽힘). 비례숫자(tabular 아님).
 */
function Hero({ value, label, foot }) {
  const ink = useInk()
  return (
    <div style={{ minWidth: 0 }}>
      <Eyebrow>{label}</Eyebrow>
      <div style={{
        fontFamily: FONTS.mono, fontSize: 52, fontWeight: 700, lineHeight: 1.02,
        letterSpacing: '-0.03em', color: ink[900], marginTop: 6,
      }}>{value}</div>
      {foot && <div style={{ fontSize: 11.5, color: ink[400], marginTop: 6 }}>{foot}</div>}
    </div>
  )
}

function StatTile({ label, value, foot }) {
  const ink = useInk()
  return (
    <div style={{ minWidth: 0 }}>
      <Eyebrow>{label}</Eyebrow>
      <div style={{
        fontFamily: FONTS.mono, fontSize: 21, fontWeight: 600, lineHeight: 1.15,
        color: ink[900], marginTop: 5, letterSpacing: '-0.01em',
      }}>{value}</div>
      {foot && <div style={{ fontSize: 11, color: ink[400], marginTop: 4 }}>{foot}</div>}
    </div>
  )
}

/** 에디토리얼 주석 — 박스가 아니라 얇은 세로 룰 + 스몰캡스 라벨 */
function Note({ label = '알아두기', tone = 'plain', children }) {
  const ink = useInk(); const st = useStatus()
  const accent = tone === 'warn' ? st.warn : ink[200]
  return (
    <div style={{ display: 'flex', gap: 12, margin: '0 0 22px' }}>
      <div style={{ width: 2, background: accent, borderRadius: 1, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <Eyebrow style={{ color: tone === 'warn' ? st.warn : ink[400], marginBottom: 5 }}>{label}</Eyebrow>
        <div style={{ fontSize: 12.5, lineHeight: 1.75, color: ink[600] }}>{children}</div>
      </div>
    </div>
  )
}

/** 위험 신호 태그 — 색 + 아이콘 + 라벨을 항상 함께 */
function RiskTag({ children }) {
  const st = useStatus()
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '1px 6px',
      borderRadius: 4, background: st.warnWash, color: st.warn,
      fontSize: 10.5, fontWeight: 700, whiteSpace: 'nowrap',
    }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={st.warn} strokeWidth="3"
        strokeLinecap="round" aria-hidden="true">
        <path d="M12 8v5" /><path d="M12 17h.01" />
      </svg>
      {children}
    </span>
  )
}

function Skeleton({ n = 8, height = 52 }) {
  const ink = useInk()
  return (
    <div>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="dv-skel" style={{ padding: '0 2px' }}>
          <div style={{ height, borderBottom: `1px solid ${ink.ruleSoft}`, display: 'flex', alignItems: 'center' }}>
            <div style={{ height: 10, width: `${38 - (i % 4) * 5}%`, borderRadius: 3, background: ink[50] }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Empty({ text }) {
  const ink = useInk()
  return <div style={{ padding: '64px 20px', textAlign: 'center', color: ink[400], fontSize: 13 }}>{text}</div>
}

/** 칩 필터 — 활성은 색이 아니라 잉크 반전으로 표시 */
function Chip({ active, onClick, children }) {
  const ink = useInk()
  return (
    <button onClick={onClick} className="dv-chip" style={{
      padding: '6px 12px', borderRadius: 999, cursor: 'pointer', fontSize: 12,
      fontWeight: active ? 700 : 500, fontFamily: FONTS.body,
      border: `1px solid ${active ? ink[900] : ink.rule}`,
      background: active ? ink[900] : 'transparent',
      color: active ? ink.surface : ink[600],
      transition: 'all .16s ease', whiteSpace: 'nowrap',
    }}>{children}</button>
  )
}

function Segmented({ value, onChange, options }) {
  const ink = useInk()
  return (
    <div style={{ display: 'inline-flex', gap: 14, alignItems: 'center' }}>
      {options.map((o) => {
        const active = value === o.key
        return (
          <button key={o.key} onClick={() => onChange(o.key)} style={{
            padding: '3px 0', border: 'none', background: 'none', cursor: 'pointer',
            fontFamily: FONTS.body, fontSize: 12, fontWeight: active ? 700 : 500,
            color: active ? ink[900] : ink[400],
            borderBottom: `1.5px solid ${active ? ink[900] : 'transparent'}`,
            transition: 'color .16s ease', whiteSpace: 'nowrap',
          }}>{o.label}</button>
        )
      })}
    </div>
  )
}

/** 재조회 중에는 스켈레톤을 다시 띄우지 않고 직전 렌더를 흐리게 유지한다 */
function Live({ loading, hasData, children, skeleton }) {
  if (!hasData && loading) return skeleton
  return (
    <div style={{
      opacity: loading ? 0.42 : 1,
      transition: 'opacity .18s ease',
      pointerEvents: loading ? 'none' : 'auto',
    }}>{children}</div>
  )
}

// ══════════════════════════════════════════════════════════════════
// 스크리너
// ══════════════════════════════════════════════════════════════════

function FactorBars({ factors }) {
  const ink = useInk()
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(176px, 1fr))', gap: '14px 26px' }}>
      {(factors || []).map((f) => {
        const pct = (f.score / (f.max || 20)) * 100
        return (
          <div key={f.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
              <span style={{ fontSize: 11.5, color: ink[600], fontWeight: 600 }}>{f.label}</span>
              <span style={{
                fontSize: 11.5, fontFamily: FONTS.mono, fontWeight: 700, color: ink[900],
                fontVariantNumeric: 'tabular-nums',
              }}>{f.score}<span style={{ color: ink[400], fontWeight: 500 }}>/{f.max}</span></span>
            </div>
            {/* 5요소는 서열이 없는 명목 항목 → 전부 같은 색. 길이만 값을 나른다. */}
            <div style={{ height: 3, background: ink[100], borderRadius: 1.5, overflow: 'hidden', marginBottom: 5 }}>
              <div style={{ width: `${pct}%`, height: '100%', background: ink[600], borderRadius: '0 1.5px 1.5px 0' }} />
            </div>
            <div style={{ fontSize: 10.5, color: ink[400], lineHeight: 1.5 }}>{f.note}</div>
          </div>
        )
      })}
    </div>
  )
}

function ExpandedDetail({ row }) {
  const ink = useInk()
  const { data } = useDividendStock(row.stock_code)
  const cap = data?.capture
  const risk = payoutRisk(row.payout_ratio)

  const Facts = ({ items }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 30px' }}>
      {items.filter(Boolean).map(([k, v]) => (
        <div key={k}>
          <Eyebrow style={{ marginBottom: 3 }}>{k}</Eyebrow>
          <div style={{ fontSize: 12.5, color: ink[900], fontFamily: FONTS.mono, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ padding: '20px 4px 26px' }}>
      <Eyebrow style={{ marginBottom: 12 }}>안전점수 5요소</Eyebrow>
      <FactorBars factors={row.factors} />

      <Rule style={{ margin: '20px 0 16px' }} />

      <Facts items={[
        ['연도별 주당배당금', (row.years || []).map((y, i) => `${y.slice(2)}년 ${fmtNum(row.dps[i])}원`).join('  ·  ')],
        row.close && ['기준 종가', `${fmtNum(row.close)}원 (${fmtDate(row.close_dt)})${row.close_stale_days > 3 ? ` · ${row.close_stale_days}일 지연` : ''}`],
        data && ['유니버스 순위', `${data.rank}위 / ${data.universe}`],
        ['결산', row.settlement_label],
        ['DART 시가배당률', fmtPct(row.dart_yield)],
      ]} />

      {risk && (
        <div style={{ marginTop: 14 }}>
          <RiskTag>{risk}</RiskTag>
          <span style={{ fontSize: 11.5, color: ink[600], marginLeft: 8 }}>
            배당성향 {fmtPct(row.payout_ratio, 1)} — 이익 대비 배당 부담이 큽니다. 지속성을 따로 확인하세요.
          </span>
        </div>
      )}

      {cap && (
        <div style={{ marginTop: 14, fontSize: 12, color: ink[600] }}>
          배당 공시 후 5거래일 시장 대비 초과수익{' '}
          <b style={{ fontFamily: FONTS.mono, color: ink[900] }}>
            {fmtSigned(cap.capture?.horizons?.['5']?.excess_med)}
          </b>
          <span style={{ color: ink[400] }}> · 표본 {cap.capture?.sample_n}건 · 인과 아님</span>
        </div>
      )}
    </div>
  )
}

function ScreenerTab() {
  const ink = useInk(); const st = useStatus()
  const [preset, setPreset] = useState('all')
  const [sort, setSort] = useState('score')
  const [basis, setBasis] = useState('live')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  const seen = useRef(false)

  const params = useMemo(() => ({
    ...(PRESETS.find((p) => p.key === preset)?.params || {}),
    sort, yield_basis: basis, limit: 60, q: q.trim() || undefined,
  }), [preset, sort, basis, q])

  const { data, loading, error } = useDividend('screener', params)
  if (data) seen.current = true
  const s = data?.summary
  const items = data?.items || []
  const ykey = basis === 'live' ? 'live_yield' : 'dart_yield'

  return (
    <div>
      {/* ── 히어로: 한 화면에 큰 수치는 하나. 나머지는 조연으로 물러난다 ── */}
      <div className="dv-hero" style={{ display: 'grid', gap: 28, alignItems: 'end', marginBottom: 22 }}>
        <Hero
          value={s ? fmtPct(s.med_yield) : '—'}
          label="중앙 배당수익률"
          foot={basis === 'live'
            ? `현재가 기준 · ${s?.price_as_of ? `${fmtDate(s.price_as_of)} 종가` : '—'}`
            : 'DART 시가배당률 · 해당 사업연도 평균가 기준'}
        />
        <div className="dv-hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 22 }}>
          <StatTile label="유니버스" value={s ? s.universe.toLocaleString() : '—'} foot="배당 이력 보유" />
          <StatTile label="추천 등급" value={s ? s.recommended_count.toLocaleString() : '—'} foot="안전 65점 이상" />
          <StatTile label="평균 안전점수" value={s?.avg_score ?? '—'} foot="100점 만점" />
        </div>
      </div>

      {s?.stale_count > 0 && (
        <Note label="가격 기준일" tone="warn">
          {s.universe.toLocaleString()}종 중 <b>{s.stale_count.toLocaleString()}종</b>은 일봉 수집이 밀려
          최신 거래일({fmtDate(s.price_as_of)})보다 오래된 종가로 수익률을 계산했습니다.
          종목을 펼치면 각 종목의 기준 종가와 지연 일수가 나옵니다.
        </Note>
      )}

      {/* ── 필터: 표를 스코프하는 모든 조작은 이 한 줄 위에 모은다 ── */}
      <Rule strong />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, padding: '13px 0' }}>
        {PRESETS.map((p) => (
          <Chip key={p.key} active={preset === p.key} onClick={() => { setPreset(p.key); setOpen(null) }}>
            {p.label}
          </Chip>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', alignItems: 'center', paddingBottom: 13 }}>
        <input
          value={q} onChange={(e) => setQ(e.target.value)} placeholder="종목명 · 코드"
          style={{
            flex: '0 1 190px', padding: '6px 0', fontSize: 12.5, outline: 'none',
            border: 'none', borderBottom: `1px solid ${ink.rule}`, borderRadius: 0,
            background: 'transparent', color: ink[900], fontFamily: FONTS.body,
          }} />
        <Segmented value={basis} onChange={setBasis}
          options={[{ key: 'live', label: '현재가 기준' }, { key: 'dart', label: 'DART 공시' }]} />
        <Segmented value={sort} onChange={setSort} options={SORTS} />
        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: ink[400], fontFamily: FONTS.mono }}>
          {s ? `${s.matched.toLocaleString()}종 충족` : ''}
        </span>
      </div>
      <Rule strong />

      {/* ── 표: 박스 없이 얇은 룰만. 열 제목은 조용하게 ── */}
      <div className="dv-head" style={{
        display: 'grid', gap: 14, padding: '9px 2px', borderBottom: `1px solid ${ink.ruleSoft}`,
        fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: ink[400],
      }}>
        <span>종목</span>
        <span className="dv-c-trend" style={{ textAlign: 'center' }}>3년 추세</span>
        <span className="dv-c-safe">안전</span>
        <span className="dv-c-payout" style={{ textAlign: 'right' }}>배당성향</span>
        <span style={{ textAlign: 'right' }}>배당수익률</span>
      </div>

      {error && <Empty text={`불러오지 못했습니다 — ${error}`} />}
      {!error && (
        <Live loading={loading} hasData={seen.current} skeleton={<Skeleton />}>
          {items.length === 0 && !loading && <Empty text="조건에 맞는 종목이 없습니다." />}
          {items.map((r) => {
            const expanded = open === r.stock_code
            const y = r[ykey]
            const risk = payoutRisk(r.payout_ratio)
            return (
              <div key={r.stock_code || r.corp_code} style={{ borderBottom: `1px solid ${ink.ruleSoft}` }}>
                <div className="dv-row" onClick={() => setOpen(expanded ? null : r.stock_code)}
                  style={{
                    display: 'grid', gap: 14, padding: '14px 2px', cursor: 'pointer', alignItems: 'center',
                    background: expanded ? ink.ruleSoft : 'transparent', transition: 'background .15s ease',
                  }}>
                  {/* 종목 */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{
                      fontSize: 15, fontWeight: 600, color: ink[900], letterSpacing: '-0.01em',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>{r.corp_name}</div>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 7, marginTop: 3,
                      fontSize: 11, color: ink[400], fontFamily: FONTS.mono, flexWrap: 'wrap',
                    }}>
                      <span>{r.stock_code}</span>
                      <span style={{ color: ink[200] }}>·</span>
                      <span>{r.consecutive_years}년 연속</span>
                      {risk && <RiskTag>{risk}</RiskTag>}
                    </div>
                  </div>

                  {/* 3년 추세 */}
                  <div className="dv-c-trend" style={{ display: 'flex', justifyContent: 'center' }}>
                    <Spark dps={r.dps} />
                  </div>

                  {/* 안전 — 라벨을 먼저, 숫자와 미터는 뒤에 */}
                  <div className="dv-c-safe" style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                      <GradeMark grade={r.grade} />
                      <span style={{
                        fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: ink[600],
                        fontVariantNumeric: 'tabular-nums',
                      }}>{r.safety_score ?? '—'}</span>
                    </div>
                    <Meter score={r.safety_score} grade={r.grade} />
                  </div>

                  {/* 배당성향 */}
                  <div className="dv-c-payout" style={{
                    textAlign: 'right', fontFamily: FONTS.mono, fontSize: 13,
                    color: risk ? st.warn : ink[600], fontVariantNumeric: 'tabular-nums',
                  }}>{fmtPct(r.payout_ratio, 1)}</div>

                  {/* 배당수익률 — 행에서 가장 큰 수치 */}
                  <div style={{
                    textAlign: 'right', fontFamily: FONTS.mono, fontSize: 20, fontWeight: 700,
                    color: ink[900], fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
                  }}>{fmtPct(y)}</div>
                </div>
                {expanded && <ExpandedDetail row={r} />}
              </div>
            )
          })}
        </Live>
      )}

      {!loading && data?.total > items.length && (
        <div style={{ padding: '16px 2px', fontSize: 11.5, color: ink[400], textAlign: 'center' }}>
          상위 {items.length}종 표시 · 조건 충족 {data.total.toLocaleString()}종
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// 캘린더
// ══════════════════════════════════════════════════════════════════

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']

function CalendarTab() {
  const ink = useInk(); const gold = useGold()
  const [month, setMonth] = useState(null)
  const seen = useRef(false)
  const { data, loading } = useDividend('calendar', { month: month || undefined, limit: 30 })
  if (data) seen.current = true

  const buckets = data?.buckets || []
  const bmap = Object.fromEntries(buckets.map((b) => [b.month, b]))
  const maxCount = Math.max(1, ...buckets.map((b) => b.count))
  const sel = data?.selected_month

  return (
    <div>
      <Note label="이 캘린더가 보여주는 것">
        기업이 <b style={{ color: ink[900] }}>실제 공시한 결산기준일</b>의 분포입니다.
        배당기준일·지급일은 종목마다 다르고 개별 공시 본문에만 있어 여기서 단정하지 않습니다 —
        아래 <b style={{ color: ink[900] }}>확정 공시</b>로 실제 발생 이벤트를 확인하세요.
      </Note>

      {/* 결산월 분포 */}
      <Rule strong />
      <div style={{ padding: '18px 0 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
          <Eyebrow>결산월 분포</Eyebrow>
          <span style={{ fontSize: 11, color: ink[400] }}>막대를 눌러 해당 월 기업 보기</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6, alignItems: 'end', height: 96 }}>
          {MONTHS.map((m) => {
            const b = bmap[m]
            const cnt = b?.count || 0
            const h = cnt ? Math.max(4, (cnt / maxCount) * 62) : 2
            const active = sel === m
            return (
              <button key={m} onClick={() => cnt && setMonth(m)} disabled={!cnt}
                title={b ? `${b.label} ${cnt}종` : '해당 없음'}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
                  gap: 6, border: 'none', background: 'transparent', padding: 0,
                  cursor: cnt ? 'pointer' : 'default', height: '100%',
                }}>
                <span style={{
                  fontSize: 10, fontFamily: FONTS.mono, fontWeight: 700,
                  color: active ? gold.text : ink[400], opacity: cnt ? 1 : 0,
                }}>{cnt || ''}</span>
                {/* 데이터 끝만 둥글게, 바닥은 각지게 — 기준선에서 자란다는 뜻 */}
                <div style={{
                  width: '100%', maxWidth: 24, height: h, borderRadius: '3px 3px 0 0',
                  background: active ? gold.mark : cnt ? ink[200] : ink[100],
                  transition: 'background .18s ease, height .3s ease',
                }} />
                <span style={{
                  fontSize: 10.5, fontFamily: FONTS.mono,
                  color: active ? ink[900] : ink[400], fontWeight: active ? 700 : 500,
                }}>{parseInt(m, 10)}</span>
              </button>
            )
          })}
        </div>
      </div>
      <Rule strong style={{ marginTop: 14 }} />

      <div className="dv-cal-grid" style={{ display: 'grid', gap: 34, paddingTop: 20 }}>
        {/* 선택 월 기업 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Eyebrow>{bmap[sel]?.label || '결산월'} 기업</Eyebrow>
            <span style={{ fontSize: 11, color: ink[400], fontFamily: FONTS.mono }}>
              {data ? `${data.item_total.toLocaleString()}종 · 안전점수 순` : ''}
            </span>
          </div>
          <Rule />
          <Live loading={loading} hasData={seen.current} skeleton={<Skeleton n={6} height={44} />}>
            {(data?.items || []).length === 0 && !loading && <Empty text="해당 월 데이터가 없습니다." />}
            {(data?.items || []).map((r) => (
              <div key={r.stock_code} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 2px',
                borderBottom: `1px solid ${ink.ruleSoft}`,
              }}>
                <GradeMark grade={r.grade} showLabel={false} />
                <span style={{
                  flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 600, color: ink[900],
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{r.corp_name}</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: ink[400], fontVariantNumeric: 'tabular-nums' }}>
                  {fmtNum(r.latest_dps)}원
                </span>
                <span style={{
                  fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, minWidth: 58, textAlign: 'right',
                  color: ink[900], fontVariantNumeric: 'tabular-nums',
                }}>{fmtPct(r.live_yield)}</span>
              </div>
            ))}
          </Live>
        </div>

        {/* 확정 공시 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <Eyebrow>최근 배당 확정 공시</Eyebrow>
            <span style={{ fontSize: 11, color: ink[400] }}>실제 발생 이벤트</span>
          </div>
          <Rule />
          <Live loading={loading} hasData={seen.current} skeleton={<Skeleton n={6} height={40} />}>
            {(data?.recent_filings || []).slice(0, 24).map((f) => (
              <div key={f.rcept_no} style={{
                display: 'flex', alignItems: 'baseline', gap: 12, padding: '10px 2px',
                borderBottom: `1px solid ${ink.ruleSoft}`,
              }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 11, color: ink[400], minWidth: 38 }}>
                  {(f.created_at || '').slice(5, 10)}
                </span>
                <span style={{
                  fontSize: 12.5, fontWeight: 600, color: ink[900], minWidth: 0, maxWidth: '40%',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{f.corp_name}</span>
                <span style={{
                  flex: 1, minWidth: 0, fontSize: 11.5, color: ink[400],
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{f.report_nm}</span>
              </div>
            ))}
          </Live>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// 캡처 시그널
// ══════════════════════════════════════════════════════════════════

function CaptureTab() {
  const ink = useInk(); const st = useStatus()
  const { dark } = useTheme()
  const [sort, setSort] = useState('reliability')
  const [minSample, setMinSample] = useState(2)
  const seen = useRef(false)
  const { data, loading } = useDividend('capture', { sort, min_sample: minSample, limit: 40 })
  if (data) seen.current = true

  const items = data?.items || []
  // 초과수익은 '방향'이 곧 의미다 → 등락 관례색(발산). 부호를 항상 병기해 색만으로 읽지 않게 한다.
  const dir = (v) => (nil(v) ? ink[400] : v > 0 ? (dark ? '#F87171' : '#C0392B') : (dark ? '#60A5FA' : '#2563EB'))

  return (
    <div>
      <Note label="먼저 읽어주세요 — 인과가 아닙니다" tone="warn">
        <div style={{ marginBottom: 7 }}>
          <b style={{ color: ink[900] }}>연말 배당락 회복률은 만들지 않았습니다.</b> 배당절차 개편(선 배당금 확정 →
          후 배당기준일 지정)으로 배당기준일이 연말에서 이탈했고, 2025년 12월 하순 시장 전체 일별 수익률 중앙값은
          <b style={{ color: ink[900] }}> -0.44%~0.00%</b>로 배당락이 실측되지 않았습니다. 없는 배당락일을 가정하지 않습니다.
        </div>
        <div>
          대신 <b style={{ color: ink[900] }}>배당 결정 공시일 이후 시장(전종목 중앙값) 대비 초과수익</b>을 실측했습니다.
          공시가 주가를 올렸다는 뜻이 아니라 공시 전후의 흐름일 뿐입니다.
          {data?.shock_overlap?.pct != null && (
            data.shock_overlap.pct >= 30 ? (
              <> 특히 표본의 <b style={{ color: ink[900] }}>{data.shock_overlap.pct}%</b>가 {data.shock_overlap.window} 구간에
              몰려 있어 시장 충격과 분리되지 않습니다.</>
            ) : (
              <> 표본의 <b style={{ color: ink[900] }}>{data.shock_overlap.pct}%</b>는 {data.shock_overlap.window} 구간에
              속하며, 그만큼은 시장 충격과 분리되지 않습니다.</>
            )
          )}
        </div>
      </Note>

      <div className="dv-hero" style={{ display: 'grid', gap: 28, alignItems: 'end', marginBottom: 22 }}>
        <Hero value={data ? (data.sample_n ?? 0).toLocaleString() : '—'} label="공시 이벤트 표본"
          foot={data?.period ? `${fmtDate(data.period.from)} ~ ${fmtDate(data.period.to)}` : ''} />
        <div className="dv-hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 22 }}>
          <StatTile label="분석 종목" value={data ? (data.stock_n ?? 0).toLocaleString() : '—'} foot="배당 공시 보유" />
          <StatTile label="랭킹 대상" value={data ? (data.total ?? 0).toLocaleString() : '—'} foot={`표본 ${minSample}건 이상`} />
          <StatTile label="급변동 겹침" value={data?.shock_overlap?.pct != null ? `${data.shock_overlap.pct}%` : '—'} foot="2026-07 구간" />
        </div>
      </div>

      <Rule strong />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 24px', alignItems: 'center', padding: '13px 0' }}>
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
      <Rule strong />

      <div className="dv-cap-head" style={{
        display: 'grid', gap: 14, padding: '9px 2px', borderBottom: `1px solid ${ink.ruleSoft}`,
        fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: ink[400],
      }}>
        <span>종목</span>
        <span className="dv-c-win" style={{ textAlign: 'right' }}>승률</span>
        <span className="dv-c-h20" style={{ textAlign: 'right' }}>20일 초과</span>
        <span style={{ textAlign: 'right' }}>표본</span>
        <span style={{ textAlign: 'right' }}>5일 초과수익</span>
      </div>

      <Live loading={loading} hasData={seen.current} skeleton={<Skeleton />}>
        {items.length === 0 && !loading && <Empty text="조건에 맞는 종목이 없습니다." />}
        {items.map((i) => {
          const h5 = i.capture?.horizons?.['5'] || {}
          const h20 = i.capture?.horizons?.['20'] || {}
          return (
            <div key={i.stock_code} className="dv-row dv-cap" style={{
              display: 'grid', gap: 14, padding: '14px 2px', alignItems: 'center',
              borderBottom: `1px solid ${ink.ruleSoft}`,
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 15, fontWeight: 600, color: ink[900], letterSpacing: '-0.01em',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{i.corp_name}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 7, marginTop: 3,
                  fontSize: 11, color: ink[400], fontFamily: FONTS.mono,
                }}>
                  <span>{i.stock_code}</span>
                  {i.grade && <><span style={{ color: ink[200] }}>·</span><GradeMark grade={i.grade} size={6} /></>}
                  {i.live_yield != null && <><span style={{ color: ink[200] }}>·</span><span>{fmtPct(i.live_yield)}</span></>}
                </div>
              </div>
              <div className="dv-c-win" style={{
                textAlign: 'right', fontFamily: FONTS.mono, fontSize: 13, color: ink[600],
                fontVariantNumeric: 'tabular-nums',
              }}>{h5.excess_win_rate == null ? '—' : `${h5.excess_win_rate}%`}</div>
              <div className="dv-c-h20" style={{
                textAlign: 'right', fontFamily: FONTS.mono, fontSize: 13, color: dir(h20.excess_med),
                fontVariantNumeric: 'tabular-nums',
              }}>{fmtSigned(h20.excess_med)}</div>
              <div style={{
                textAlign: 'right', fontFamily: FONTS.mono, fontSize: 12,
                color: i.capture?.low_sample ? st.warn : ink[400],
                fontVariantNumeric: 'tabular-nums',
              }}>{i.capture?.sample_n}건</div>
              <div style={{
                textAlign: 'right', fontFamily: FONTS.mono, fontSize: 20, fontWeight: 700,
                color: dir(h5.excess_med), fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em',
              }}>{fmtSigned(h5.excess_med)}</div>
            </div>
          )
        })}
      </Live>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════

export default function DividendPage() {
  const { colors, dark } = useTheme()
  const ink = useInk()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const active = TABS.some((t) => t.key === tabParam) ? tabParam : 'screener'
  const setTab = (k) => setSearchParams(k === 'screener' ? {} : { tab: k }, { replace: true })

  return (
    <div>
      <style>{`
        .dv-hero { grid-template-columns: minmax(0,1fr) minmax(0,1.45fr); }
        .dv-head, .dv-row { grid-template-columns: minmax(0,2.4fr) 60px 116px 82px 96px; }
        .dv-cap-head, .dv-row.dv-cap { grid-template-columns: minmax(0,2.4fr) 66px 84px 54px 104px; }
        .dv-cal-grid { grid-template-columns: 1fr 1fr; }
        .dv-row:hover { background: ${ink.ruleSoft} !important; }
        .dv-chip:hover { border-color: ${ink[400]} !important; }
        .dv-skel { animation: dvPulse 1.5s ease-in-out infinite; }
        @keyframes dvPulse { 0%,100% { opacity:1 } 50% { opacity:.45 } }
        @media (max-width: 1024px) {
          .dv-cal-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 900px) {
          .dv-hero { grid-template-columns: 1fr; gap: 22px !important; }
          .dv-head, .dv-row { grid-template-columns: minmax(0,2.2fr) 116px 96px; }
          .dv-c-trend, .dv-c-payout { display: none !important; }
          .dv-cap-head, .dv-row.dv-cap { grid-template-columns: minmax(0,2.2fr) 66px 54px 104px; }
          .dv-c-h20 { display: none !important; }
        }
        @media (max-width: 600px) {
          .dv-hero-stats { grid-template-columns: repeat(3, minmax(0,1fr)) !important; gap: 12px !important; }
          .dv-head, .dv-row { grid-template-columns: minmax(0,1.9fr) 92px; }
          .dv-c-safe { display: none !important; }
          .dv-cap-head, .dv-row.dv-cap { grid-template-columns: minmax(0,1.9fr) 54px 92px; }
          .dv-c-win { display: none !important; }
        }
      `}</style>

      {/* 서브탭 — 알약 버튼 대신 밑줄. 페이지 상단을 조용하게 유지한다 */}
      <div className="sub-tab-bar" style={{
        display: 'flex', justifyContent: 'center',
        borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.bgCard,
      }}>
        <div style={{ display: 'inline-flex', gap: 26, padding: '0 4px' }}>
          {TABS.map((t) => {
            const on = active === t.key
            return (
              <button key={t.key} onClick={() => setTab(t.key)} className="sub-tab-btn" style={{
                padding: '15px 2px', border: 'none', background: 'none', cursor: 'pointer',
                fontFamily: FONTS.body, fontSize: 13, fontWeight: on ? 700 : 500,
                color: on ? ink[900] : ink[400],
                borderBottom: `2px solid ${on ? ink[900] : 'transparent'}`,
                marginBottom: -1, transition: 'color .18s ease', WebkitTapHighlightColor: 'transparent',
              }}>{t.label}</button>
            )
          })}
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '38px 20px 72px' }}>
        {/* 매스트헤드 */}
        <div style={{ marginBottom: 30 }}>
          <h1 style={{
            fontFamily: FONTS.serif, fontSize: 38, fontWeight: 700, margin: 0,
            color: ink[900], letterSpacing: '-0.025em', lineHeight: 1.1,
          }}>배당</h1>
          <p style={{ margin: '10px 0 0', fontSize: 13, color: ink[600], lineHeight: 1.7, maxWidth: 620 }}>
            DART 공시 배당 이력으로 <b style={{ color: ink[900] }}>안전점수 5요소</b>를 계산하고,
            현재가 기준 배당수익률로 다시 줄 세웁니다. 등급은 색이 아니라 라벨로 읽습니다.
          </p>
        </div>

        {active === 'screener' && <ScreenerTab />}
        {active === 'calendar' && <CalendarTab />}
        {active === 'capture' && <CaptureTab />}

        <Rule strong style={{ marginTop: 40 }} />
        <div style={{ paddingTop: 16, fontSize: 11, lineHeight: 1.85, color: ink[400] }}>
          <Eyebrow style={{ marginBottom: 6 }}>데이터 출처</Eyebrow>
          배당 이력 = DART 정기공시 배당에관한사항(alotMatter) · 종가 = 키움 일봉(price_daily) ·
          안전점수 = 자체 산식(지속성·성장·배당성향·수익률·실적뒷받침 각 20점).
          <b style={{ color: ink[600] }}> 특정 종목의 매수·매도를 권유하지 않습니다.</b>
        </div>
      </div>
    </div>
  )
}

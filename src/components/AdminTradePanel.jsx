import React, { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API, secretHeaders } from '../lib/api'

/**
 * 🛠 매매 운영 패널 — 관리자 전용.
 *
 * 전광판(TradeBoard)과 __목적이 다르다.__
 *   전광판 = 보여주는 화면. 종목을 아예 안 받는다.
 *   이 패널 = 운영하는 화면. 종목명·__스킵 사유__·크론 로그·킬스위치.
 *
 * 스킵 사유가 이 화면의 핵심이다. "왜 샀나"보다 __"왜 안 샀나"__ 를 못 보면
 * 집행 필터가 옳았는지 영영 못 잰다.
 *
 * 화면 문법: 트레이딩 데스크 — 헤어라인 경계 · 등폭 숫자 · 색은 손익에만.
 * 한국 관례상 상승=빨강, 하락=파랑.
 */

const UP = '#DC2626'
const DOWN = '#2563EB'

export default function AdminTradePanel() {
  const { colors, dark } = useTheme()
  const [d, setD] = useState(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState('')
  const [plan, setPlan] = useState(null)

  const t = {
    line: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    hair: dark ? 'rgba(255,255,255,0.045)' : 'rgba(0,0,0,0.045)',
    panel: dark ? '#0B0B0E' : '#FFFFFF',
    sunken: dark ? '#08080A' : '#FAFAFB',
    dim: dark ? '#6B6B75' : '#A1A1AA',
  }

  const load = useCallback(() => {
    fetch(`${API}/api/admin/trade/status`, { headers: secretHeaders() })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(r.status === 403
        ? '관리자 토큰이 없습니다 — localStorage.dart_admin_token 을 설정하세요'
        : `오류 ${r.status}`))))
      .then(x => { setD(x); setErr('') })
      .catch(e => setErr(e.message))
  }, [])

  useEffect(() => {
    load()
    const iv = setInterval(load, 30000)
    return () => clearInterval(iv)
  }, [load])

  const post = async (path, qs, label) => {
    setBusy(label)
    try {
      const r = await fetch(`${API}${path}${qs}`, { method: 'POST', headers: secretHeaders() })
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).detail || `오류 ${r.status}`)
      load()
    } catch (e) { setErr(e.message) } finally { setBusy('') }
  }

  const fetchPlan = async () => {
    setBusy('plan')
    try {
      const r = await fetch(`${API}/api/admin/trade/status?plan=1`, { headers: secretHeaders() })
      const x = await r.json()
      setPlan(x.plan || ['(출력 없음)'])
    } catch (e) { setErr(String(e)) } finally { setBusy('') }
  }

  if (err) return <Notice tone="err" colors={colors} t={t}>{err}</Notice>
  if (!d) return <Notice colors={colors} t={t}>불러오는 중…</Notice>

  const positions = d.positions || []
  const open = positions.filter(p => ['open', 'ordered', 'exit_ordered'].includes(p.status))
  const isMock = (d.mode || '').includes('모의')

  return (
    <div style={{ fontFamily: FONTS.body }}>

      {/* ══ 상태 바 ══ */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        padding: '11px 14px', borderRadius: 10, marginBottom: 14,
        border: `1px solid ${d.halted ? 'rgba(220,38,38,0.35)' : t.line}`,
        background: d.halted ? (dark ? 'rgba(220,38,38,0.07)' : 'rgba(220,38,38,0.04)') : t.panel,
      }}>
        <Dot on={!d.halted} />
        <span style={{ fontSize: 13, fontWeight: 800, color: colors.textPrimary, letterSpacing: '-0.01em' }}>
          {d.halted ? '매매 정지' : '매매 가동'}
        </span>
        <Chip tone={isMock ? 'teal' : 'red'}>{isMock ? '모의투자' : '실계좌'}</Chip>
        {d.rule?.exit && <Chip tone="mute">{d.rule.exit}</Chip>}

        <span style={{ marginLeft: 'auto', display: 'flex', gap: 14, fontSize: 11,
                       color: t.dim, fontFamily: FONTS.mono }}>
          <span>대조 {d.last_reconcile ? d.last_reconcile.slice(5, 16).replace('T', ' ') : '—'}</span>
          <span style={{ color: d.reconcile_ok === false ? UP : t.dim }}>
            {d.reconcile_ok === false ? '불일치' : d.reconcile_ok ? '일치' : '미확인'}
          </span>
        </span>
      </div>

      {d.halted && (
        <pre style={{
          margin: '0 0 14px', padding: '10px 13px', borderRadius: 8, fontSize: 11.5,
          whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: FONTS.mono,
          color: UP, background: dark ? 'rgba(220,38,38,0.07)' : 'rgba(220,38,38,0.04)',
          border: `1px solid rgba(220,38,38,0.2)`,
        }}>{d.halted}</pre>
      )}

      {/* ══ 컨트롤 ══ */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <Btn onClick={fetchPlan} busy={busy === 'plan'} colors={colors} t={t}>
          오늘 진입 계획 미리보기
        </Btn>
        {d.halted ? (
          <Btn onClick={() => post('/api/admin/trade/resume', '?confirm=RESUME', 'resume')}
               busy={busy === 'resume'} tone="warn" colors={colors} t={t}>
            정지 해제
          </Btn>
        ) : (
          <Btn onClick={() => post('/api/admin/trade/halt', '?reason=관리자 수동 정지', 'halt')}
               busy={busy === 'halt'} tone="danger" colors={colors} t={t}>
            즉시 정지
          </Btn>
        )}
        <span style={{ alignSelf: 'center', fontSize: 11, color: t.dim, lineHeight: 1.5 }}>
          주문은 크론만 낸다 — 이 화면에서 매수·매도를 직접 걸 수 없다
        </span>
      </div>

      {plan && (
        <Section title="진입 계획 (dry-run)" t={t} colors={colors}>
          <pre style={{
            margin: 0, padding: '12px 14px', fontSize: 11.5, lineHeight: 1.75,
            fontFamily: FONTS.mono, color: colors.textSecondary,
            whiteSpace: 'pre-wrap', background: t.sunken,
          }}>{plan.join('\n')}</pre>
        </Section>
      )}

      {/* ══ 포지션 ══ */}
      <Section title={`포지션 ${open.length}`} t={t} colors={colors}
               right={d.updated_at ? d.updated_at.slice(5, 16).replace('T', ' ') : null}>
        {positions.length === 0 ? (
          <Empty t={t}>체결된 포지션이 없습니다</Empty>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>{['종목', '상태', '진입', '수량', '손익', '고점', '발동선까지', '보유'].map((h, i) => (
                  <th key={h} style={{
                    textAlign: i < 2 ? 'left' : 'right', padding: '7px 10px',
                    fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                    color: t.dim, borderBottom: `1px solid ${t.line}`, whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {positions.map((p, i) => <PosRow key={i} p={p} t={t} colors={colors} dark={dark} />)}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ══ 주문·스킵 로그 ══ */}
      <Section title="주문 · 스킵 이력" t={t} colors={colors}
               note="스킵 사유가 곧 집행 필터의 성적표다">
        {(d.orders || []).length === 0 ? (
          <Empty t={t}>아직 주문 이력이 없습니다</Empty>
        ) : (
          <div style={{ maxHeight: 340, overflowY: 'auto' }}>
            {d.orders.map((o, i) => <OrderRow key={i} o={o} t={t} colors={colors} />)}
          </div>
        )}
      </Section>

      {/* ══ 크론 로그 ══ */}
      <Section title="크론 로그" t={t} colors={colors} note="live_trade.log 최근 40줄">
        {(d.log_tail || []).length === 0 ? (
          <Empty t={t}>로그가 비어 있습니다 — 크론이 아직 한 번도 안 돌았습니다</Empty>
        ) : (
          <pre style={{
            margin: 0, padding: '12px 14px', maxHeight: 260, overflow: 'auto',
            fontSize: 11, lineHeight: 1.65, fontFamily: FONTS.mono,
            color: colors.textSecondary, background: t.sunken, whiteSpace: 'pre-wrap',
          }}>{d.log_tail.join('\n')}</pre>
        )}
      </Section>
    </div>
  )
}

/* ── 포지션 행 ─────────────────────────────────────────── */
function PosRow({ p, t, colors, dark }) {
  const entry = p.entry_price || p.ref_price || 0
  const cur = p.exit_price || p.last_price || 0
  const peak = p.peak || entry
  const ret = entry && cur ? (cur / entry - 1) * 100 : null
  const peakPct = entry && peak ? (peak / entry - 1) * 100 : null
  const trigger = peak ? Math.round(peak * 0.88) : null
  const room = cur && trigger ? (cur / trigger - 1) * 100 : null
  const cap = 10
  const held = p.hold_days ?? null

  return (
    <tr style={{ borderBottom: `1px solid ${t.hair}` }}>
      <td style={{ padding: '9px 10px', whiteSpace: 'nowrap' }}>
        <div style={{ fontWeight: 700, color: colors.textPrimary }}>{p.corp_name}</div>
        <div style={{ fontSize: 10.5, color: t.dim, fontFamily: FONTS.mono }}>{p.stock_code}</div>
      </td>
      <td style={{ padding: '9px 10px' }}>
        <Chip tone={p.status === 'open' ? 'teal' : p.status === 'closed' ? 'mute' : 'amber'}>
          {statusLabel(p.status)}
        </Chip>
        {(p.warn || []).length > 0 && (
          <div style={{ fontSize: 10, color: '#B45309', marginTop: 3, maxWidth: 210, lineHeight: 1.4 }}>
            {p.warn[0]}
          </div>
        )}
      </td>
      <Num t={t}>{entry ? entry.toLocaleString() : '—'}</Num>
      <Num t={t}>{p.shares || '—'}</Num>
      <Num t={t} color={ret == null ? null : ret > 0 ? UP : ret < 0 ? DOWN : null} bold>
        {fmtPct(ret)}
      </Num>
      <Num t={t}>{fmtPct(peakPct)}</Num>
      <Num t={t} color={room != null && room < 3 ? UP : null}>
        {room == null ? '—' : `${room.toFixed(1)}%p`}
      </Num>
      <td style={{ padding: '9px 10px', textAlign: 'right', minWidth: 64 }}>
        <div style={{ fontSize: 11, fontFamily: FONTS.mono, color: t.dim }}>
          {held == null ? '—' : `${held}/${cap}`}
        </div>
        {held != null && (
          <div style={{ height: 3, borderRadius: 2, marginTop: 4,
                        background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)' }}>
            <div style={{
              width: `${Math.min(100, (held / cap) * 100)}%`, height: '100%', borderRadius: 2,
              background: held >= cap ? UP : colors.textSecondary,
            }} />
          </div>
        )}
      </td>
    </tr>
  )
}

/* ── 주문 로그 행 ──────────────────────────────────────── */
function OrderRow({ o, t, colors }) {
  const kind = o.kind || ''
  const tone = kind === 'order' ? (o.sent ? 'teal' : 'mute')
    : kind === 'skip' ? 'amber' : 'red'
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 14px',
      borderBottom: `1px solid ${t.hair}`, fontSize: 11.5,
    }}>
      <span style={{ fontFamily: FONTS.mono, color: t.dim, whiteSpace: 'nowrap', minWidth: 78 }}>
        {(o.ts || '').slice(5, 16).replace('T', ' ')}
      </span>
      <Chip tone={tone}>{kindLabel(kind, o.side, o.sent)}</Chip>
      <span style={{ color: colors.textPrimary, fontWeight: 600, minWidth: 96 }}>
        {o.corp_name || '—'}
      </span>
      <span style={{ color: colors.textSecondary, flex: 1, lineHeight: 1.5 }}>
        {o.reason || (o.qty ? `${o.qty}주 @${(o.ref_price || 0).toLocaleString()}` : '')}
        {o.ord_no ? <span style={{ color: t.dim, fontFamily: FONTS.mono }}> · #{o.ord_no}</span> : null}
      </span>
    </div>
  )
}

/* ── 프리미티브 ────────────────────────────────────────── */
function Section({ title, note, right, children, t, colors }) {
  return (
    <div style={{
      border: `1px solid ${t.line}`, borderRadius: 10, overflow: 'hidden',
      marginBottom: 16, background: t.panel,
    }}>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 10, padding: '9px 14px',
        borderBottom: `1px solid ${t.line}`,
      }}>
        <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em',
                       color: colors.textPrimary, textTransform: 'uppercase' }}>{title}</span>
        {note && <span style={{ fontSize: 10.5, color: t.dim }}>{note}</span>}
        {right && <span style={{ marginLeft: 'auto', fontSize: 10.5, color: t.dim,
                                 fontFamily: FONTS.mono }}>{right}</span>}
      </div>
      {children}
    </div>
  )
}

const Num = ({ children, t, color, bold }) => (
  <td style={{
    padding: '9px 10px', textAlign: 'right', whiteSpace: 'nowrap',
    fontFamily: FONTS.mono, fontVariantNumeric: 'tabular-nums',
    color: color || t.dim, fontWeight: bold ? 700 : 500,
  }}>{children}</td>
)

function Chip({ tone = 'mute', children }) {
  const m = {
    teal: ['#0D9488', 'rgba(13,148,136,0.12)'],
    amber: ['#B45309', 'rgba(180,83,9,0.12)'],
    red: ['#DC2626', 'rgba(220,38,38,0.12)'],
    mute: ['#71717A', 'rgba(113,113,122,0.12)'],
  }[tone]
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
      color: m[0], background: m[1], whiteSpace: 'nowrap', letterSpacing: '0.02em',
    }}>{children}</span>
  )
}

const Dot = ({ on }) => (
  <span style={{
    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
    background: on ? '#0D9488' : UP,
    boxShadow: `0 0 0 3px ${on ? 'rgba(13,148,136,0.16)' : 'rgba(220,38,38,0.16)'}`,
  }} />
)

function Btn({ children, onClick, busy, tone, colors, t }) {
  const c = tone === 'danger' ? UP : tone === 'warn' ? '#B45309' : colors.textPrimary
  return (
    <button onClick={onClick} disabled={!!busy} style={{
      padding: '7px 14px', borderRadius: 8, cursor: busy ? 'wait' : 'pointer',
      border: `1px solid ${tone ? c : t.line}`, background: 'transparent',
      color: c, fontSize: 12, fontWeight: 700, fontFamily: FONTS.body,
      opacity: busy ? 0.5 : 1,
    }}>{busy ? '…' : children}</button>
  )
}

const Empty = ({ children, t }) => (
  <div style={{ padding: '26px 14px', textAlign: 'center', fontSize: 12, color: t.dim }}>
    {children}
  </div>
)

const Notice = ({ children, tone, colors, t }) => (
  <div style={{
    padding: '14px 16px', borderRadius: 10, fontSize: 12.5, lineHeight: 1.6,
    border: `1px solid ${tone === 'err' ? 'rgba(220,38,38,0.3)' : t.line}`,
    color: tone === 'err' ? UP : colors.textMuted, fontFamily: FONTS.body,
  }}>{children}</div>
)

function fmtPct(v) {
  if (v == null || isNaN(v)) return '—'
  return `${v > 0 ? '+' : ''}${v.toFixed(2)}%`
}

const statusLabel = s => ({
  open: '보유', ordered: '주문', exit_ordered: '청산주문', closed: '청산',
  no_fill: '미체결', skipped: '스킵',
}[s] || s || '—')

const kindLabel = (kind, side, sent) => {
  if (kind === 'skip') return '스킵'
  if (kind === 'blocked') return '차단'
  if (kind === 'error') return '실패'
  const s = side === 'buy' ? '매수' : side === 'sell' ? '매도' : '주문'
  return sent ? s : `${s}(dry)`
}

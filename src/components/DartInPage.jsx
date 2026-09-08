import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'

/**
 * 다트인 (DART In) — 공시 파싱 → 1페이지 리포트.
 *
 * 파는 것은 통찰이 아니라 __"원문 3분 → 3초"__ 다. 그래서 이 화면의 설계 핵심은
 * 예쁜 카드가 아니라 __실패를 감추지 않는 것__이다(DARTIN.md §2).
 *
 *   · `parse_status` 와 `parse_errors` 를 그대로 띄운다. 빈칸이 왜 빈칸인지 보여야
 *     사용자가 원문 링크로 넘어갈 수 있고, 다음에 고칠 수도 있다.
 *   · 없는 값을 "-" 로 채우지 않는다. 서버가 이미 그렇게 내려준다.
 *   · `parsable=false` 는 목록에서 __미리__ 알린다 — 열어보고 실망하지 않게.
 *
 * ⚠️ 경계: 여기 나가는 것은 __DART 공개 원문과 그 정량 분해까지__다.
 *    게이트 점수·픽 종목·요인 분해는 절대 들어가지 않는다(CLAUDE.md 영업비밀 HARD RULE).
 *    그래서 이 페이지는 토큰도 세션도 쓰지 않는다.
 *
 * ⚠️ 라우트 이름 주의: `/admin/report`(ReportViewer)는 __수익률·게이트 점수가 든
 *    관리자 전용__이다. 여기는 `/dartin` 이고 서로 겹치면 안 된다(DARTIN.md §6-2).
 */

const CATEGORIES = [
  { key: 'ALL',        label: '전체',      color: '#71717A' },
  { key: 'GROWTH',     label: '성장·수주',  color: '#0D9488' },
  { key: 'EARNINGS',   label: '실적·배당',  color: '#1D4ED8' },
  { key: 'GOVERNANCE', label: '지분·자사주', color: '#7C3AED' },
  { key: 'CAPITAL',    label: '자금조달',   color: '#D97706' },
  { key: 'ALERT',      label: '시장경보',   color: '#DC2626' },
  { key: 'GENERAL',    label: '기타',      color: '#A1A1AA' },
]
const CAT_COLOR = Object.fromEntries(CATEGORIES.map(c => [c.key, c.color]))

// 서버가 내려주는 다섯 상태를 그대로 보여준다. 뭉개지 않는다.
const STATUS = {
  ok:              { label: '분해 완료',   color: '#0D9488', desc: '핵심 값을 전부 읽었습니다.' },
  partial:         { label: '일부만 읽음', color: '#D97706', desc: '일부 값이 원문에 없거나 서식이 달랐습니다.' },
  failed:          { label: '분해 실패',   color: '#DC2626', desc: '값을 읽지 못했습니다. 원문에서 확인하세요.' },
  no_document:     { label: '원문 못 읽음', color: '#DC2626', desc: 'DART 원문을 불러오지 못했습니다.' },
  synthetic_rcept: { label: '원문 번호 없음', color: '#71717A', desc: '거래소 경보 경로로 들어온 항목이라 DART 접수번호가 없습니다.' },
  not_attempted:   { label: '분해 대상 아님', color: '#71717A', desc: '아직 정량 분해를 검증한 유형이 아닙니다.' },
}

// 리포트 유형별로 보여줄 지표와 순서. 서버 키를 그대로 쓴다.
const METRIC_ROWS = {
  SUPPLY_CONTRACT: [
    ['contract_amount', '계약금액'],
    ['revenue_ratio', '매출액 대비'],
    ['prev_revenue', '직전 매출액'],
    ['counterparty', '계약상대방'],
    ['period', '계약 시작일'],
  ],
  EARNINGS: [
    ['period', '기간'],
    ['revenue', '매출액'],
    ['revenue_yoy', '매출 전년동기'],
    ['operating_profit', '영업이익'],
    ['operating_profit_yoy', '영업이익 전년동기'],
    ['opm', '영업이익률'],
    ['net_income', '당기순이익'],
  ],
}

export default function DartInPage() {
  const { colors, dark } = useTheme()
  const [category, setCategory] = useState('GROWTH')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [list, setList] = useState([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [selected, setSelected] = useState(null)
  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const panelRef = useRef(null)

  const sep = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const surface = dark ? '#141416' : '#FFFFFF'
  const subtle = dark ? '#1A1A1E' : '#FAFAFA'

  // 목록 — category 는 서버에서 거른다(창은 서버가 300으로 고정한다, DARTIN.md §4-3).
  useEffect(() => {
    let alive = true
    setListLoading(true)
    setListError('')
    const p = new URLSearchParams({ limit: '60' })
    if (category !== 'ALL') p.set('category', category)
    if (search) p.set('search', search)
    fetch(`${API}/api/flash/disclosures?${p}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(d => { if (alive) setList(d.disclosures || []) })
      .catch(e => { if (alive) { setList([]); setListError(String(e.message || e)) } })
      .finally(() => { if (alive) setListLoading(false) })
    return () => { alive = false }
  }, [category, search])

  const openReport = useCallback((row) => {
    setSelected(row)
    setReport(null)
    setCopied(false)
    setReportLoading(true)
    fetch(`${API}/api/flash/report/${row.rcept_no}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(setReport)
      .catch(e => setReport({
        parse_status: 'failed',
        parse_errors: [String(e.message || e)],
        takeaway: '리포트를 불러오지 못했습니다.',
        corp_name: row.corp_name, stock_code: row.stock_code,
        report_nm: row.report_nm, dart_url: row.dart_url, metrics: {},
      }))
      .finally(() => {
        setReportLoading(false)
        // 모바일은 패널이 목록 아래에 붙으므로 직접 데려간다.
        if (window.innerWidth < 900 && panelRef.current) {
          panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
  }, [])

  const copyMessenger = () => {
    const t = report?.messenger_copy
    if (!t) return
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1800) }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(t).then(done).catch(() => {})
    else done()
  }

  const fmtDate = (s) => {
    if (!s) return ''
    const m = String(s).match(/(\d{4})-(\d{2})-(\d{2})/)
    return m ? `${m[2]}/${m[3]}` : String(s).slice(0, 10)
  }

  const st = STATUS[report?.parse_status] || STATUS.not_attempted

  return (
    <div style={{
      maxWidth: 1180, margin: '0 auto', fontFamily: FONTS.body,
      padding: '24px clamp(14px, 3vw, 24px)',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
    }}>
      <style>{`
        .di-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 900px) {
          .di-grid { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); align-items: start; }
          .di-panel { position: sticky; top: 76px; }
          .di-list-scroll { max-height: calc(100vh - 210px); overflow-y: auto; }
        }
        .di-row { width: 100%; text-align: left; background: transparent; border: 0; cursor: pointer; }
        .di-row:hover { background: var(--di-hover); }
      `}</style>

      {/* ── 헤더 ── */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{
            fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 800, fontFamily: FONTS.serif,
            color: colors.textPrimary, margin: 0, letterSpacing: '-0.02em',
          }}>다트인</h1>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: '#0D9488',
            background: 'rgba(13,148,136,0.10)', padding: '3px 9px', borderRadius: 20,
          }}>BETA</span>
        </div>
        <p style={{ fontSize: 14, color: colors.textSecondary, margin: '8px 0 0', lineHeight: 1.65 }}>
          공시 원문을 열어 <b style={{ color: colors.textPrimary }}>숫자로 분해</b>해 드립니다.
          해석이 아니라 재료입니다 — 값 옆에 항상 원문 링크가 붙습니다.
        </p>
      </div>

      {/* ── 필터 ── */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
        {CATEGORIES.map(c => {
          const on = category === c.key
          return (
            <button key={c.key} onClick={() => setCategory(c.key)} style={{
              fontSize: 12.5, fontWeight: on ? 700 : 500, cursor: 'pointer',
              padding: '6px 12px', borderRadius: 20,
              border: `1px solid ${on ? c.color : sep}`,
              color: on ? c.color : colors.textSecondary,
              background: on ? `${c.color}14` : 'transparent',
              fontFamily: FONTS.body, whiteSpace: 'nowrap',
            }}>{c.label}</button>
          )
        })}
      </div>

      <form onSubmit={e => { e.preventDefault(); setSearch(query.trim()) }} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="종목명 · 종목코드 6자리 · 공시 제목"
          style={{
            flex: 1, minWidth: 0, fontSize: 13.5, padding: '9px 12px',
            borderRadius: 10, border: `1px solid ${sep}`,
            background: surface, color: colors.textPrimary, fontFamily: FONTS.body,
          }}
        />
        <button type="submit" style={{
          fontSize: 13, fontWeight: 700, padding: '9px 16px', borderRadius: 10,
          border: 'none', cursor: 'pointer', background: '#18181B', color: '#fff',
          fontFamily: FONTS.body, whiteSpace: 'nowrap',
        }}>검색</button>
        {search && (
          <button type="button" onClick={() => { setQuery(''); setSearch('') }} style={{
            fontSize: 13, padding: '9px 12px', borderRadius: 10, cursor: 'pointer',
            border: `1px solid ${sep}`, background: 'transparent', color: colors.textSecondary,
          }}>초기화</button>
        )}
      </form>

      <div className="di-grid" style={{ '--di-hover': subtle }}>
        {/* ── 목록 ── */}
        <div style={{ border: `1px solid ${sep}`, borderRadius: 14, background: surface, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 8,
            padding: '12px 16px', borderBottom: `1px solid ${sep}`,
          }}>
            <span style={{ fontSize: 13.5, fontWeight: 800, color: colors.textPrimary }}>공시 목록</span>
            <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
              {listLoading ? '불러오는 중' : `${list.length}건`}
            </span>
          </div>

          <div className="di-list-scroll">
            {listError && (
              <div style={{ padding: '28px 16px', fontSize: 13, color: '#DC2626' }}>
                목록을 불러오지 못했습니다 ({listError}).
              </div>
            )}
            {!listError && !listLoading && list.length === 0 && (
              <div style={{ padding: '32px 16px', fontSize: 13, color: colors.textMuted, lineHeight: 1.7 }}>
                조건에 맞는 공시가 없습니다. 카테고리를 바꾸거나 검색어를 지워보세요.
              </div>
            )}
            {list.map(row => {
              const on = selected?.rcept_no === row.rcept_no
              const cc = CAT_COLOR[row.category] || '#A1A1AA'
              return (
                <button
                  key={row.rcept_no} className="di-row" onClick={() => openReport(row)}
                  style={{
                    display: 'block', padding: '11px 16px',
                    borderBottom: `1px solid ${sep}`,
                    background: on ? (dark ? 'rgba(13,148,136,0.10)' : 'rgba(13,148,136,0.06)') : 'transparent',
                    boxShadow: on ? `inset 3px 0 0 #0D9488` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, color: cc,
                      background: `${cc}14`, padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap',
                    }}>{row.category_label}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: colors.textPrimary }}>{row.corp_name}</span>
                    {row.stock_code && (
                      <span style={{ fontSize: 10.5, color: colors.textMuted, fontFamily: FONTS.mono }}>{row.stock_code}</span>
                    )}
                    <span style={{ marginLeft: 'auto', fontSize: 10.5, color: colors.textMuted, fontFamily: FONTS.mono }}>
                      {fmtDate(row.rcept_dt)}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 1.5 }}>
                    {row.report_nm}
                  </div>
                  {!row.parsable && (
                    // 열어보고 실망하지 않게 __목록에서 미리__ 말한다.
                    <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 4 }}>
                      정량 분해 대상 아님 · 분류와 원문 링크까지
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── 리포트 ── */}
        <div className="di-panel" ref={panelRef}>
          <div style={{ border: `1px solid ${sep}`, borderRadius: 14, background: surface, overflow: 'hidden' }}>
            {!selected && (
              <div style={{ padding: '44px 20px', textAlign: 'center' }}>
                {/* 데스크톱은 목록이 왼쪽, 모바일은 위 — 방향을 말하면 한쪽에서 틀린다. */}
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>
                  목록에서 공시를 하나 고르세요
                </div>
                <div style={{ fontSize: 12.5, color: colors.textMuted, lineHeight: 1.75, maxWidth: 320, margin: '0 auto' }}>
                  원문을 열어 계약금액·매출 대비 비율·영업이익 같은 값을 뽑아 한 장으로 보여드립니다.
                  못 읽은 값은 채우지 않고 못 읽었다고 적습니다.
                </div>
              </div>
            )}

            {selected && (
              <>
                <div style={{ padding: '14px 16px', borderBottom: `1px solid ${sep}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 5 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary }}>
                      {report?.corp_name || selected.corp_name}
                    </span>
                    {(report?.stock_code || selected.stock_code) && (
                      <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
                        {report?.stock_code || selected.stock_code}
                      </span>
                    )}
                    {report && (
                      <span style={{
                        marginLeft: 'auto', fontSize: 10.5, fontWeight: 700, color: st.color,
                        background: `${st.color}14`, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap',
                      }}>{st.label}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 1.5 }}>
                    {report?.report_nm || selected.report_nm}
                  </div>
                </div>

                {reportLoading && (
                  <div style={{ padding: '40px 16px', textAlign: 'center', fontSize: 13, color: colors.textMuted }}>
                    원문을 여는 중입니다…
                  </div>
                )}

                {!reportLoading && report && (
                  <>
                    {/* 한 줄 결론 */}
                    {report.takeaway && (
                      <div style={{
                        padding: '13px 16px', background: subtle, borderBottom: `1px solid ${sep}`,
                        fontSize: 13.5, lineHeight: 1.7, color: colors.textPrimary, fontWeight: 600,
                      }}>{report.takeaway}</div>
                    )}

                    {/* 정량 분해 */}
                    {METRIC_ROWS[report.template_type] && (
                      <div>
                        {METRIC_ROWS[report.template_type].map(([k, label]) => {
                          const v = report.metrics?.[k]
                          if (v === undefined || v === null || v === '') return null
                          const empty = v === '-'
                          return (
                            <div key={k} style={{
                              display: 'grid', gridTemplateColumns: '118px 1fr', gap: 10,
                              padding: '10px 16px', borderBottom: `1px solid ${sep}`, alignItems: 'baseline',
                            }}>
                              <span style={{ fontSize: 12, color: colors.textMuted }}>{label}</span>
                              <span style={{
                                fontSize: 13.5, fontWeight: empty ? 400 : 700,
                                color: empty ? colors.textMuted : colors.textPrimary,
                                fontFamily: FONTS.mono, wordBreak: 'break-all',
                              }}>{empty ? '원문 확인 필요' : v}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* 상태 설명 + 왜 비었는지 */}
                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${sep}` }}>
                      <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.65 }}>
                        {st.desc}
                        {report.parse_confidence != null && (
                          <span style={{ color: colors.textMuted, fontFamily: FONTS.mono }}> · confidence {report.parse_confidence}</span>
                        )}
                        {report.cached && <span style={{ color: colors.textMuted }}> · 캐시</span>}
                      </div>
                      {Array.isArray(report.parse_errors) && report.parse_errors.length > 0 && (
                        <ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>
                          {report.parse_errors.map((e, i) => (
                            <li key={i} style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.7 }}>{e}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* 액션 */}
                    <div style={{ display: 'flex', gap: 8, padding: '12px 16px', flexWrap: 'wrap' }}>
                      {report.dart_url ? (
                        <a href={report.dart_url} target="_blank" rel="noopener noreferrer" style={{
                          fontSize: 12.5, fontWeight: 700, padding: '8px 14px', borderRadius: 9,
                          background: '#18181B', color: '#fff', textDecoration: 'none', whiteSpace: 'nowrap',
                        }}>DART 원문 열기</a>
                      ) : (
                        <span style={{ fontSize: 12, color: colors.textMuted }}>
                          DART 원문 번호가 없어 링크를 만들지 않았습니다.
                        </span>
                      )}
                      {report.messenger_copy && (
                        <button onClick={copyMessenger} style={{
                          fontSize: 12.5, fontWeight: 700, padding: '8px 14px', borderRadius: 9,
                          border: `1px solid ${sep}`, background: 'transparent',
                          color: copied ? '#0D9488' : colors.textPrimary, cursor: 'pointer', whiteSpace: 'nowrap',
                        }}>{copied ? '복사했습니다' : '메신저용 복사'}</button>
                      )}
                    </div>

                    {report.messenger_copy && (
                      <pre style={{
                        margin: 0, padding: '12px 16px', background: subtle,
                        borderTop: `1px solid ${sep}`,
                        fontSize: 11.5, lineHeight: 1.75, color: colors.textSecondary,
                        fontFamily: FONTS.mono, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                      }}>{report.messenger_copy}</pre>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* 정직성 고지 — 감추면 제품, 드러내면 도구 (DARTIN.md §7-2) */}
          <div style={{
            marginTop: 12, padding: '12px 14px', borderRadius: 12,
            border: `1px dashed ${sep}`, fontSize: 11.5, lineHeight: 1.8, color: colors.textMuted,
          }}>
            정량 분해는 <b style={{ color: colors.textSecondary }}>단일판매·공급계약</b>과
            {' '}<b style={{ color: colors.textSecondary }}>영업(잠정)실적</b> 2종만 지원합니다.
            나머지는 분류와 원문 링크까지입니다.<br />
            값을 뽑았다는 것이 <b style={{ color: colors.textSecondary }}>맞다는 뜻은 아닙니다</b> —
            필드별 정확도 실측은 아직 진행 중이라, 판단 전에 원문을 함께 보시기 바랍니다.
          </div>
        </div>
      </div>
    </div>
  )
}

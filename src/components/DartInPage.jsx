import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'

/**
 * 다트인 (DART In) — 공시 파싱 → 1페이지 리포트.
 *
 * v0 는 "공시를 열어 숫자로 분해한다"는 __기능__을 세웠고, v1(여기)은 그 기능을
 * __증권사·자산운용사의 아침 동선__ 위에 올린다. 그쪽 실무의 페인포인트는 넷이다.
 *
 *   1. 도구는 전체 시장을 보여주는데, 사람은 __자기 커버리지 종목__만 본다.
 *   2. "빠뜨렸나?" 의 불안 — 무엇을 확인했는지 __아무 데도 안 남는다.__
 *   3. 숫자를 손으로 옮긴다 — 원문 → 메신저 → 모닝미팅 노트 → 엑셀.
 *   4. 값을 대야 한다 — __어디서 언제 나온 숫자인지__(감사 추적)를 먼저 묻는다.
 *
 * 그래서 화면 뼈대가 목록/리포트가 아니라 __유니버스 → 커버리지 → 추출 → 반출__ 이다.
 *
 * 설계 원칙은 v0 그대로다(DARTIN.md §2): __실패를 감추지 않는다.__
 *   · `parse_status`·`parse_errors`·`confidence` 를 그대로 띄운다.
 *   · 없는 값을 "-" 로 채우지 않는다.
 *   · `not_in_document`(원문에 값이 없음)와 `failed`(우리가 못 읽음)를 __가른다.__
 *     실무 대응이 정반대라서다 — 전자는 원문을 봐도 없고, 후자는 봐야 한다.
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

// 서버가 내려주는 상태를 그대로 보여준다. 뭉개지 않는다.
const STATUS = {
  ok:              { label: '분해 완료',    color: '#0D9488', desc: '핵심 값을 전부 읽었습니다.' },
  partial:         { label: '일부만 읽음',  color: '#D97706', desc: '일부 값이 원문에 없거나 서식이 달랐습니다.' },
  not_in_document: { label: '원문에 값 없음', color: '#6366F1', desc: '원문이 그 값을 기재하지 않았습니다(공시 유보·영업기밀 등). 추출 실패가 아닙니다.' },
  inconsistent:    { label: '검산 불일치',  color: '#DC2626', desc: '원문에서 읽은 값끼리 산술이 맞지 않아 숫자를 싣지 않았습니다. 원문에서 직접 확인하세요.' },
  failed:          { label: '분해 실패',    color: '#DC2626', desc: '값을 읽지 못했습니다. 원문에서 확인하세요.' },
  no_document:     { label: '원문 못 읽음',  color: '#DC2626', desc: 'DART 원문을 불러오지 못했습니다.' },
  synthetic_rcept: { label: '원문 번호 없음', color: '#71717A', desc: '거래소 경보 경로로 들어온 항목이라 DART 접수번호가 없습니다.' },
  not_attempted:   { label: '분해 대상 아님', color: '#71717A', desc: '아직 정량 분해를 검증한 유형이 아닙니다.' },
}

// 리포트 유형별로 보여줄 지표와 순서. 서버 키를 그대로 쓴다.
const METRIC_ROWS = {
  SUPPLY_CONTRACT: [
    ['contract_amount', '계약금액'],
    ['revised_from', '정정 전 금액'],
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

// 정형 API 유형은 지표 키가 공시마다 다르다(사채·증자·자사주가 서로 다른 항목을 쓴다).
// 그래서 목록을 고정하지 않고 __서버가 준 순서 그대로__ 그린다.
// 화면에 올리지 않을 내부 키만 여기서 거른다.
const DYNAMIC_TEMPLATES = ['INSIDER', 'MAJOR_HOLDING', 'DS005', 'OWNER_CHANGE',
  'GUARANTEE', 'EMBEZZLEMENT', 'DIVIDEND', 'FACILITY', 'CANCELLATION']
const METRIC_SKIP = new Set(['is_accumulation', 'verified', 'cross_check', 'source_api',
  'contract_amount_raw', 'revenue_ratio_raw', 'revenue_raw', 'operating_profit_raw',
  'net_income_raw', 'revenue_yoy_raw', 'operating_profit_yoy_raw', 'yoy_basis'])

// 엑셀로 넘어가는 열. __원문 URL 과 접수번호를 반드시 같이 보낸다__ — 값만 옮기면
// 나중에 출처를 되짚을 수 없고, 그때부터 이 숫자는 근거가 아니라 소문이 된다.
const CSV_COLS = [
  ['rcept_day', '접수일'],
  ['corp_name', '종목명'],
  ['stock_code', '종목코드'],
  ['category_label', '분류'],
  ['report_nm', '공시제목'],
  ['status_label', '분해상태'],
  ['summary', '요약'],
  ['contract_amount', '계약금액'],
  ['revenue_ratio', '매출액대비'],
  ['counterparty', '계약상대방'],
  ['revenue', '매출액'],
  ['operating_profit', '영업이익'],
  ['operating_profit_yoy', '영업이익전년동기'],
  ['rcept_no', '접수번호'],
  ['dart_url', '원문URL'],
]

const LS = {
  key: 'dartin.key',
  universe: 'dartin.universe',
  seen: 'dartin.seen',
  mode: 'dartin.mode',
  days: 'dartin.days',
}
const readLS = (k, fallback) => {
  try { const v = localStorage.getItem(k); return v === null ? fallback : v } catch { return fallback }
}
const writeLS = (k, v) => { try { localStorage.setItem(k, v) } catch { /* 사파리 프라이빗 등 */ } }

// 🔒 모든 다트인 호출은 __접근 키를 달고 나간다.__ 키가 없거나 틀리면 서버가 401 을
// 준다 — 화면에서 가리는 것이 아니라 __서버가 잠근다__(프론트 게이트는 보안이 아니다).
class AccessError extends Error {
  constructor(status, detail) { super(detail); this.status = status; this.detail = detail }
}

async function flashFetch(path) {
  const key = readLS(LS.key, '')
  const r = await fetch(`${API}${path}`, key ? { headers: { 'x-dartin-key': key } } : undefined)
  if (r.status === 401 || r.status === 429) {
    let detail = ''
    try { detail = (await r.json()).detail || '' } catch { /* 본문 없음 */ }
    throw new AccessError(r.status, detail)
  }
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  return r.json()
}

const parseCodes = (text) => {
  const found = String(text || '').match(/\d{6}/g) || []
  return [...new Set(found)].slice(0, 400)
}

// 목록 정렬 — 시간순으로만 두면 __첫 화면이 시장경보로 도배된다.__
// 2026-09-08 실측: 오늘 165건 중 68건이 경보였고, 최신순이라 위 20줄이 전부 그것이었다.
// 실무자가 볼 것은 "숫자가 나오는 공시" 인데 그게 아래로 밀린다.
// ⚠️ 이건 __분류 순서일 뿐 점수가 아니다.__ 게이트 가중치와 무관하고 공개 규칙이다
//    (CLAUDE.md 영업비밀 HARD RULE — 선정 로직은 이 화면에 들어오지 않는다).
const CAT_RANK = { GROWTH: 0, EARNINGS: 0, CAPITAL: 1, GOVERNANCE: 1, GENERAL: 2, ALERT: 3 }

// 📏 정확도 실측 (`_flash_accuracy.py` · 2026-09-08).
// __파는 것은 정확도 자체가 아니라 정확도를 잰다는 사실__ 이므로 화면에 붙인다.
// 판정 방법 = 원문이 스스로 적어 둔 산술로 검산한다. 세 값이 서로 다른 칸에서
// 오므로 하나라도 잘못 집으면 닫히지 않는다.
//   · 공급계약: 계약금액 ÷ 직전 매출액 × 100 == 원문의 매출액 대비(%)
//   · 잠정실적: (당기 − 전년동기) ÷ 전년동기 × 100 == 원문의 전년동기대비(%)
const ACCURACY = {
  date: '2026-09-08',
  note: '원문의 산술로 검산한 결과입니다. 검산이 불가능한 건(원문에 비교값이 없음)은 "확인되지 않음"으로 둡니다.',
  rows: [
    ['공급계약 · 계약금액', 67, 63, 0],
    ['공급계약 · 매출액 대비', 67, 63, 0],
    ['잠정실적 · 매출액', 40, 39, 0],
    ['잠정실적 · 영업이익', 40, 39, 0],
    ['잠정실적 · 당기순이익', 40, 35, 0],
  ],
}

const SAMPLE_UNIVERSE = '005930 000660 035420 051910 207940 000270 105560 034730'

export default function DartInPage() {
  const { colors, dark } = useTheme()

  // ── 유니버스(내 커버리지) ──
  const [universe, setUniverse] = useState(() => parseCodes(readLS(LS.universe, '')))
  const [editingUniverse, setEditingUniverse] = useState(false)
  const [universeDraft, setUniverseDraft] = useState('')
  const [mode, setMode] = useState(() => readLS(LS.mode, 'market'))     // universe | market
  const [days, setDays] = useState(() => Number(readLS(LS.days, '1')) || 1)  // 1 | 3 | 0(전체)

  // ── 목록 ──
  const [category, setCategory] = useState('ALL')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [sortBy, setSortBy] = useState('signal')   // signal(중요순) | time(최신순)
  const [list, setList] = useState([])
  const [meta, setMeta] = useState(null)
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState('')

  // ── 확인 이력 · 선택 ──
  const [seen, setSeen] = useState(() => {
    try { return new Set(JSON.parse(readLS(LS.seen, '[]'))) } catch { return new Set() }
  })
  const [picked, setPicked] = useState(() => new Set())

  // ── 리포트 ──
  const [selected, setSelected] = useState(null)
  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reports, setReports] = useState({})        // rcept_no → 리포트 (목록 인라인 숫자용)
  const [prefetching, setPrefetching] = useState(false)
  const [toast, setToast] = useState('')
  const [access, setAccess] = useState(() => (readLS(LS.key, '') ? 'ok' : 'need_key'))
  const [keyDraft, setKeyDraft] = useState('')
  const [accessMsg, setAccessMsg] = useState('')
  const panelRef = useRef(null)
  const toastTimer = useRef(null)

  const sep = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const surface = dark ? '#141416' : '#FFFFFF'
  const subtle = dark ? '#1A1A1E' : '#FAFAFA'
  const accent = '#0D9488'

  const say = useCallback((msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2200)
  }, [])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // 유니버스가 비어 있으면 유니버스 모드는 성립하지 않는다.
  const universeMode = mode === 'universe' && universe.length > 0

  // ── 목록 조회 ── (창은 서버가 넓게 잡는다, DARTIN.md §4-3)
  useEffect(() => {
    let alive = true
    setListLoading(true)
    setListError('')
    const p = new URLSearchParams({ limit: '200' })
    if (category !== 'ALL') p.set('category', category)
    if (search) p.set('search', search)
    if (universeMode) p.set('codes', universe.join(','))
    if (days) p.set('days', String(days))
    flashFetch(`/api/flash/disclosures?${p}`)
      .then(d => { if (alive) { setList(d.disclosures || []); setMeta(d); setAccess('ok') } })
      .catch(e => {
        if (!alive) return
        setList([]); setMeta(null)
        if (e instanceof AccessError) { setAccess('need_key'); setAccessMsg(e.detail || '') }
        else setListError(String(e.message || e))
      })
      .finally(() => { if (alive) setListLoading(false) })
    return () => { alive = false }
  }, [category, search, universeMode, universe, days])

  // ── 숫자 미리 채우기 ──
  // 실무는 한 건씩 열지 않는다. 목록이 숫자를 들고 있어야 훑을 수 있다.
  // 분해 가능한 행만, 한 번에 최대 20건. 서버 원문 캐시(24h)가 있어 재조회는 공짜다.
  useEffect(() => {
    const todo = list
      .filter(r => r.parsable && !reports[r.rcept_no])
      .slice(0, 20)
      .map(r => r.rcept_no)
    if (todo.length === 0) return
    let alive = true
    setPrefetching(true)
    flashFetch(`/api/flash/reports?rcept_nos=${todo.join(',')}`)
      .then(d => {
        if (!alive) return
        setReports(prev => {
          const next = { ...prev }
          for (const rep of d.reports || []) if (rep?.rcept_no) next[rep.rcept_no] = rep
          return next
        })
      })
      .catch(() => { /* 인라인 숫자는 부가 정보다 — 실패해도 목록은 살아 있다 */ })
      .finally(() => { if (alive) setPrefetching(false) })
    return () => { alive = false }
  }, [list])   // eslint-disable-line react-hooks/exhaustive-deps

  // ── 리포트 열기 ──
  const markSeen = useCallback((rcept_no) => {
    setSeen(prev => {
      if (prev.has(rcept_no)) return prev
      const next = new Set(prev)
      next.add(rcept_no)
      // 무한정 쌓이지 않게 최근 3,000건만 남긴다.
      const arr = [...next].slice(-3000)
      writeLS(LS.seen, JSON.stringify(arr))
      return new Set(arr)
    })
  }, [])

  const openReport = useCallback((row) => {
    if (!row) return
    setSelected(row)
    markSeen(row.rcept_no)
    const cached = reports[row.rcept_no]
    if (cached) { setReport(cached); setReportLoading(false) }
    else { setReport(null); setReportLoading(true) }
    flashFetch(`/api/flash/report/${row.rcept_no}`)
      .then(d => {
        setReport(d)
        setReports(prev => ({ ...prev, [row.rcept_no]: d }))
      })
      .catch(e => setReport({
        parse_status: e instanceof AccessError ? 'no_document' : 'failed',
        parse_errors: [e instanceof AccessError ? (e.detail || '접근이 거부되었습니다.') : String(e.message || e)],
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
  }, [markSeen, reports])

  // ── 화면에 실제로 그리는 목록 ──
  const rows = useMemo(() => {
    const base = onlyUnread ? list.filter(r => !seen.has(r.rcept_no)) : list
    if (sortBy === 'time') return base
    // 중요순 = ①숫자가 나오는 것 ②사건성 분류 ③나머지, 각 묶음 안에서는 최신순.
    return [...base].sort((a, b) => {
      const pa = (a.parsable ? 0 : 1) * 10 + (CAT_RANK[a.category] ?? 2)
      const pb = (b.parsable ? 0 : 1) * 10 + (CAT_RANK[b.category] ?? 2)
      if (pa !== pb) return pa - pb
      return String(b.rcept_dt || '').localeCompare(String(a.rcept_dt || ''))
    })
  }, [list, onlyUnread, seen, sortBy])
  const unreadCount = useMemo(() => list.filter(r => !seen.has(r.rcept_no)).length, [list, seen])

  const togglePick = (rcept_no) => {
    setPicked(prev => {
      const next = new Set(prev)
      next.has(rcept_no) ? next.delete(rcept_no) : next.add(rcept_no)
      return next
    })
  }

  // ── 키보드 (j/k · ↑/↓ 이동, space 선택) ── 실무자는 마우스를 안 쓴다.
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      const idx = rows.findIndex(r => r.rcept_no === selected?.rcept_no)
      if (['j', 'ArrowDown'].includes(e.key)) {
        e.preventDefault(); openReport(rows[Math.min(idx + 1, rows.length - 1)] || rows[0])
      } else if (['k', 'ArrowUp'].includes(e.key)) {
        e.preventDefault(); openReport(rows[Math.max(idx - 1, 0)] || rows[0])
      } else if (e.key === ' ' && selected) {
        e.preventDefault(); togglePick(selected.rcept_no)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })   // 매 렌더 갱신 — rows/selected 를 항상 최신으로 본다

  // ── 반출: 회의 노트 · CSV ──
  const exportRows = useMemo(() => {
    const base = picked.size > 0 ? rows.filter(r => picked.has(r.rcept_no)) : rows
    return base
  }, [rows, picked])

  const copyDigest = async () => {
    const src = exportRows
    if (src.length === 0) return say('내보낼 항목이 없습니다')
    const head = universeMode
      ? `[다트인] 커버리지 ${universe.length}종 · ${src.length}건`
      : `[다트인] 공시 ${src.length}건`
    const byCat = {}
    for (const r of src) (byCat[r.category_label] ||= []).push(r)
    const lines = [head, meta?.today_kst ? `기준 ${meta.today_kst} (KST)` : '', '']
    for (const [cat, items] of Object.entries(byCat)) {
      lines.push(`■ ${cat} (${items.length})`)
      for (const r of items) {
        const rep = reports[r.rcept_no]
        lines.push(`· ${r.corp_name}(${r.stock_code || '-'}) ${r.report_nm}`)
        const facts = factLine(rep)
        if (facts) lines.push(`  ${facts}`)
        if (r.dart_url) lines.push(`  ${r.dart_url}`)
      }
      lines.push('')
    }
    lines.push('※ 숫자는 DART 공시원문에서 기계 추출한 값입니다. 판단 전 원문을 함께 확인하세요.')
    const text = lines.join('\n')
    try { await navigator.clipboard.writeText(text) ; say(`회의 노트 ${src.length}건 복사했습니다`) }
    catch { say('복사에 실패했습니다') }
  }

  const downloadCsv = () => {
    const src = exportRows
    if (src.length === 0) return say('내보낼 항목이 없습니다')
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const body = src.map(r => {
      const rep = reports[r.rcept_no] || {}
      const m = rep.metrics || {}
      const st = STATUS[rep.parse_status] || (r.parsable ? { label: '미조회' } : STATUS.not_attempted)
      const flat = {
        ...r,
        status_label: st.label,
        summary: factLine(rep) || (rep.takeaway || ''),
        contract_amount: m.contract_amount && m.contract_amount !== '-' ? m.contract_amount : '',
        revenue_ratio: m.revenue_ratio && m.revenue_ratio !== '-' ? m.revenue_ratio : '',
        counterparty: m.counterparty || '',
        revenue: m.revenue && m.revenue !== '-' ? m.revenue : '',
        operating_profit: m.operating_profit && m.operating_profit !== '-' ? m.operating_profit : '',
        operating_profit_yoy: m.operating_profit_yoy && m.operating_profit_yoy !== '-' ? m.operating_profit_yoy : '',
      }
      return CSV_COLS.map(([k]) => esc(flat[k])).join(',')
    })
    // 엑셀이 UTF-8 을 알아보게 BOM 을 붙인다 — 없으면 한글이 깨진다.
    const csv = '﻿' + [CSV_COLS.map(([, l]) => esc(l)).join(','), ...body].join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `dartin_${(meta?.today_kst || '').replace(/-/g, '')}_${src.length}건.csv`
    document.body.appendChild(a); a.click(); a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    say(`CSV ${src.length}건 내려받았습니다`)
  }

  const copyOne = async () => {
    const t = report?.messenger_copy
    if (!t) return
    try { await navigator.clipboard.writeText(t); say('메신저용으로 복사했습니다') }
    catch { say('복사에 실패했습니다') }
  }

  // ── 유니버스 편집 ──
  const openUniverseEditor = () => { setUniverseDraft(universe.join(' ')); setEditingUniverse(true) }
  const saveUniverse = () => {
    const codes = parseCodes(universeDraft)
    setUniverse(codes)
    writeLS(LS.universe, codes.join(' '))
    setEditingUniverse(false)
    if (codes.length > 0) { setMode('universe'); writeLS(LS.mode, 'universe') }
    say(codes.length > 0 ? `유니버스 ${codes.length}종 저장했습니다` : '유니버스를 비웠습니다')
  }
  const switchMode = (m) => {
    if (m === 'universe' && universe.length === 0) { openUniverseEditor(); return }
    setMode(m); writeLS(LS.mode, m)
  }
  const switchDays = (d) => { setDays(d); writeLS(LS.days, String(d)) }

  const fmtTime = (s) => {
    if (!s) return ''
    const d = new Date(s)
    if (isNaN(d)) return String(s).slice(5, 10)
    const z = (n) => String(n).padStart(2, '0')
    return `${z(d.getMonth() + 1)}/${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}`
  }

  const st = STATUS[report?.parse_status] || STATUS.not_attempted
  const counts = meta?.counts || {}
  const parsableCount = list.filter(r => r.parsable).length

  if (access === 'need_key') {
    return (
      <div style={{
        maxWidth: 520, margin: '0 auto', fontFamily: FONTS.body,
        padding: '64px clamp(14px, 4vw, 24px)',
      }}>
        <h1 style={{
          fontSize: 24, fontWeight: 800, fontFamily: FONTS.serif,
          color: colors.textPrimary, margin: '0 0 10px', letterSpacing: '-0.02em',
        }}>다트인</h1>
        <p style={{ fontSize: 13.5, color: colors.textSecondary, lineHeight: 1.75, margin: '0 0 18px' }}>
          접근 키가 필요합니다. 발급받은 키를 넣어 주세요 —
          이 브라우저에만 저장되고 서버로 다시 보내는 것은 요청 헤더뿐입니다.
        </p>
        {accessMsg && (
          <div style={{
            fontSize: 12.5, color: '#DC2626', background: 'rgba(220,38,38,0.06)',
            border: `1px solid rgba(220,38,38,0.2)`, borderRadius: 10,
            padding: '10px 12px', marginBottom: 14, lineHeight: 1.7,
          }}>{accessMsg}</div>
        )}
        <form onSubmit={e => {
          e.preventDefault()
          const v = keyDraft.trim()
          if (!v) return
          writeLS(LS.key, v); setAccessMsg(''); setAccess('ok'); setKeyDraft('')
        }} style={{ display: 'flex', gap: 8 }}>
          <input
            value={keyDraft} onChange={e => setKeyDraft(e.target.value)}
            placeholder="dartin_…" autoFocus
            style={{
              flex: 1, minWidth: 0, fontSize: 13.5, padding: '11px 13px',
              borderRadius: 10, border: `1px solid ${sep}`, background: surface,
              color: colors.textPrimary, fontFamily: FONTS.mono,
            }}
          />
          <button type="submit" style={{
            fontSize: 13, fontWeight: 700, padding: '11px 18px', borderRadius: 10,
            border: 'none', background: accent, color: '#fff', cursor: 'pointer',
          }}>확인</button>
        </form>
        <div style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.8, marginTop: 16 }}>
          키는 조직 단위로 발급되고 <b style={{ color: colors.textSecondary }}>열람 기록이 남습니다</b>.
          분실했다면 기존 키를 폐기하고 새로 발급받아야 합니다.
        </div>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: 1320, margin: '0 auto', fontFamily: FONTS.body,
      padding: '20px clamp(12px, 2.4vw, 22px)',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
    }}>
      <style>{`
        .di-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 980px) {
          .di-grid { grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); align-items: start; }
          .di-panel { position: sticky; top: 72px; }
          .di-list-scroll { max-height: calc(100vh - 250px); overflow-y: auto; }
        }
        .di-row { width: 100%; text-align: left; background: transparent; border: 0; cursor: pointer; }
        .di-row:hover { background: var(--di-hover); }
        .di-btn { cursor: pointer; font-family: inherit; }
      `}</style>

      {/* ── 헤더 ── */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{
            fontSize: 'clamp(21px, 3.6vw, 26px)', fontWeight: 800, fontFamily: FONTS.serif,
            color: colors.textPrimary, margin: 0, letterSpacing: '-0.02em',
          }}>다트인</h1>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: accent,
            background: 'rgba(13,148,136,0.10)', padding: '3px 9px', borderRadius: 20,
          }}>BETA</span>
          <span style={{ fontSize: 12.5, color: colors.textMuted }}>
            공시 원문 3분 → 3초. 해석이 아니라 <b style={{ color: colors.textSecondary }}>재료</b>입니다.
          </span>
        </div>
      </div>

      {/* ── 커버리지 바 ── 이 화면의 첫 질문은 "오늘 내 종목에 뭐가 떴나" 다 ── */}
      <div style={{
        border: `1px solid ${sep}`, borderRadius: 14, background: surface,
        padding: '12px 14px', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* 모드 */}
          <div style={{ display: 'flex', border: `1px solid ${sep}`, borderRadius: 9, overflow: 'hidden' }}>
            {[['universe', '내 커버리지'], ['market', '전체 시장']].map(([m, label]) => {
              const on = (m === 'universe' ? universeMode : !universeMode)
              return (
                <button key={m} className="di-btn" onClick={() => switchMode(m)} style={{
                  fontSize: 12.5, fontWeight: on ? 800 : 500, padding: '7px 13px', border: 0,
                  background: on ? accent : 'transparent', color: on ? '#fff' : colors.textSecondary,
                }}>{label}</button>
              )
            })}
          </div>

          {/* 기간 */}
          <div style={{ display: 'flex', border: `1px solid ${sep}`, borderRadius: 9, overflow: 'hidden' }}>
            {[[1, '오늘'], [3, '최근 3일'], [0, '전체']].map(([d, label]) => {
              const on = days === d
              return (
                <button key={d} className="di-btn" onClick={() => switchDays(d)} style={{
                  fontSize: 12.5, fontWeight: on ? 800 : 500, padding: '7px 12px', border: 0,
                  background: on ? (dark ? '#26262B' : '#EFEFF1') : 'transparent',
                  color: on ? colors.textPrimary : colors.textSecondary,
                }}>{label}</button>
              )
            })}
          </div>

          <button className="di-btn" onClick={openUniverseEditor} style={{
            fontSize: 12.5, fontWeight: 700, padding: '7px 13px', borderRadius: 9,
            border: `1px solid ${sep}`, background: 'transparent', color: colors.textPrimary,
          }}>
            내 유니버스 {universe.length > 0 ? `${universe.length}종` : '등록'}
          </button>

          <div style={{
            display: 'flex', border: `1px solid ${sep}`, borderRadius: 9,
            overflow: 'hidden', marginLeft: 'auto',
          }}>
            {[['signal', '중요순'], ['time', '최신순']].map(([k, label]) => {
              const on = sortBy === k
              return (
                <button key={k} className="di-btn" onClick={() => setSortBy(k)} style={{
                  fontSize: 12, fontWeight: on ? 800 : 500, padding: '7px 11px', border: 0,
                  background: on ? (dark ? '#26262B' : '#EFEFF1') : 'transparent',
                  color: on ? colors.textPrimary : colors.textSecondary,
                }}>{label}</button>
              )
            })}
          </div>

          <label style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5,
            color: colors.textSecondary, cursor: 'pointer',
          }}>
            <input type="checkbox" checked={onlyUnread} onChange={e => setOnlyUnread(e.target.checked)} />
            미확인만 ({unreadCount})
          </label>
        </div>

        {/* 커버리지 숫자 — 누락 여부를 __숫자로__ 말한다 */}
        <div style={{
          display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 11, paddingTop: 11,
          borderTop: `1px solid ${sep}`, fontSize: 12.5, color: colors.textSecondary,
        }}>
          <Stat label={universeMode ? '내 커버리지 공시' : '수집 공시'}
                value={listLoading ? '…' : `${meta?.matched ?? list.length}건`}
                colors={colors} mono />
          <Stat label="미확인" value={listLoading ? '…' : `${unreadCount}건`}
                colors={colors} mono tone={unreadCount > 0 ? '#D97706' : undefined} />
          <Stat label="정량 분해 가능" value={`${parsableCount}건`} colors={colors} mono />
          {universeMode && (
            <Stat label="공시 난 종목" value={`${meta?.universe_hit ?? 0} / ${universe.length}종`} colors={colors} mono />
          )}
          {meta?.truncated && (
            <span style={{ fontSize: 11.5, color: '#D97706' }}>
              표시 상한(200건)을 넘었습니다 — 기간·분류를 좁혀 보세요.
            </span>
          )}
        </div>

        {/* 유니버스 편집기 */}
        {editingUniverse && (
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${sep}` }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
              내 유니버스 (커버리지·보유 종목)
            </div>
            <div style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.7, marginBottom: 8 }}>
              엑셀의 <b style={{ color: colors.textSecondary }}>종목코드 열을 그대로 붙여넣으세요</b>.
              구분자는 무엇이든 됩니다 — 6자리 숫자만 골라 읽습니다(최대 400종).
              이 목록은 <b style={{ color: colors.textSecondary }}>브라우저에만</b> 저장되고 서버로 가지 않습니다.
            </div>
            <textarea
              value={universeDraft} onChange={e => setUniverseDraft(e.target.value)}
              rows={4} placeholder="005930, 000660, 035420 …"
              style={{
                width: '100%', boxSizing: 'border-box', fontSize: 13, padding: '10px 12px',
                borderRadius: 10, border: `1px solid ${sep}`, background: subtle,
                color: colors.textPrimary, fontFamily: FONTS.mono, resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="di-btn" onClick={saveUniverse} style={{
                fontSize: 12.5, fontWeight: 700, padding: '8px 15px', borderRadius: 9,
                border: 0, background: accent, color: '#fff',
              }}>저장 ({parseCodes(universeDraft).length}종)</button>
              <button className="di-btn" onClick={() => setEditingUniverse(false)} style={{
                fontSize: 12.5, padding: '8px 13px', borderRadius: 9,
                border: `1px solid ${sep}`, background: 'transparent', color: colors.textSecondary,
              }}>취소</button>
              <button className="di-btn" onClick={() => setUniverseDraft(SAMPLE_UNIVERSE)} style={{
                fontSize: 12, padding: '8px 12px', borderRadius: 9,
                border: `1px dashed ${sep}`, background: 'transparent', color: colors.textMuted,
              }}>예시 넣기</button>
              {universe.length > 0 && (
                <button className="di-btn" onClick={() => setUniverseDraft('')} style={{
                  fontSize: 12, padding: '8px 12px', borderRadius: 9,
                  border: 'none', background: 'transparent', color: colors.textMuted,
                }}>비우기</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── 분류 칩 (건수 포함) + 검색 ── */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
        {CATEGORIES.map(c => {
          const on = category === c.key
          const n = c.key === 'ALL' ? (meta?.matched ?? list.length) : (counts[c.key] || 0)
          if (c.key !== 'ALL' && n === 0 && !on) return null   // 빈 칸은 그리지 않는다
          return (
            <button key={c.key} className="di-btn" onClick={() => setCategory(c.key)} style={{
              fontSize: 12.5, fontWeight: on ? 700 : 500,
              padding: '6px 12px', borderRadius: 20,
              border: `1px solid ${on ? c.color : sep}`,
              color: on ? c.color : colors.textSecondary,
              background: on ? `${c.color}14` : 'transparent',
              whiteSpace: 'nowrap',
            }}>
              {c.label}
              <span style={{ marginLeft: 6, fontFamily: FONTS.mono, fontSize: 11, opacity: 0.75 }}>{n}</span>
            </button>
          )
        })}
      </div>

      <form onSubmit={e => { e.preventDefault(); setSearch(query.trim()) }}
            style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="종목명 · 종목코드 6자리 · 공시 제목"
          style={{
            flex: 1, minWidth: 0, fontSize: 13.5, padding: '9px 12px',
            borderRadius: 10, border: `1px solid ${sep}`,
            background: surface, color: colors.textPrimary, fontFamily: FONTS.body,
          }}
        />
        <button type="submit" className="di-btn" style={{
          fontSize: 13, fontWeight: 700, padding: '9px 16px', borderRadius: 10,
          border: 'none', background: '#18181B', color: '#fff', whiteSpace: 'nowrap',
        }}>검색</button>
        {search && (
          <button type="button" className="di-btn" onClick={() => { setQuery(''); setSearch('') }} style={{
            fontSize: 13, padding: '9px 12px', borderRadius: 10,
            border: `1px solid ${sep}`, background: 'transparent', color: colors.textSecondary,
          }}>초기화</button>
        )}
      </form>

      {/* ── 반출 바 ── 숫자를 손으로 옮기는 일을 없앤다 ── */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12,
        padding: '9px 12px', borderRadius: 12, background: subtle, border: `1px solid ${sep}`,
      }}>
        <span style={{ fontSize: 12, color: colors.textMuted }}>
          {picked.size > 0 ? `선택 ${picked.size}건` : `표시된 ${rows.length}건 전체`}
        </span>
        <button className="di-btn" onClick={copyDigest} style={{
          fontSize: 12.5, fontWeight: 700, padding: '7px 13px', borderRadius: 9,
          border: `1px solid ${sep}`, background: surface, color: colors.textPrimary,
        }}>회의 노트 복사</button>
        <button className="di-btn" onClick={downloadCsv} style={{
          fontSize: 12.5, fontWeight: 700, padding: '7px 13px', borderRadius: 9,
          border: `1px solid ${sep}`, background: surface, color: colors.textPrimary,
        }}>CSV 내보내기</button>
        {picked.size > 0 && (
          <button className="di-btn" onClick={() => setPicked(new Set())} style={{
            fontSize: 12, padding: '7px 11px', borderRadius: 9, border: 'none',
            background: 'transparent', color: colors.textMuted,
          }}>선택 해제</button>
        )}
        <button className="di-btn" onClick={() => { rows.forEach(r => markSeen(r.rcept_no)); say('모두 확인 처리했습니다') }}
          style={{
            fontSize: 12, padding: '7px 11px', borderRadius: 9, border: 'none',
            background: 'transparent', color: colors.textMuted, marginLeft: 'auto',
          }}>모두 확인 처리</button>
        <span style={{ fontSize: 11.5, color: colors.textMuted, fontFamily: FONTS.mono }}>
          {prefetching ? '숫자 불러오는 중…' : 'j/k 이동 · space 선택'}
        </span>
        <button className="di-btn" onClick={() => { writeLS(LS.key, ''); setAccess('need_key') }}
          style={{
            fontSize: 11.5, padding: '7px 10px', borderRadius: 9, border: 'none',
            background: 'transparent', color: colors.textMuted,
          }}>키 변경</button>
      </div>

      <div className="di-grid" style={{ '--di-hover': subtle }}>
        {/* ── 목록 ── */}
        <div style={{ border: `1px solid ${sep}`, borderRadius: 14, background: surface, overflow: 'hidden' }}>
          <div className="di-list-scroll">
            {listError && (
              <div style={{ padding: '28px 16px', fontSize: 13, color: '#DC2626' }}>
                목록을 불러오지 못했습니다 ({listError}).
              </div>
            )}
            {!listError && listLoading && (
              <div style={{ padding: '32px 16px', fontSize: 13, color: colors.textMuted }}>불러오는 중…</div>
            )}
            {!listError && !listLoading && rows.length === 0 && (
              <div style={{ padding: '32px 16px', fontSize: 13, color: colors.textMuted, lineHeight: 1.8 }}>
                {universeMode
                  ? <>이 기간에 <b style={{ color: colors.textSecondary }}>내 유니버스 {universe.length}종</b>의 공시가 없습니다.
                      기간을 넓히거나 전체 시장으로 바꿔 보세요.</>
                  : onlyUnread
                    ? '미확인 항목이 없습니다. 오늘 것을 다 보셨습니다.'
                    : '조건에 맞는 공시가 없습니다. 기간·분류를 바꿔 보세요.'}
              </div>
            )}
            {rows.map(row => (
              <ListRow
                key={row.rcept_no} row={row}
                report={reports[row.rcept_no]}
                selected={selected?.rcept_no === row.rcept_no}
                unread={!seen.has(row.rcept_no)}
                picked={picked.has(row.rcept_no)}
                onOpen={() => openReport(row)}
                onPick={() => togglePick(row.rcept_no)}
                colors={colors} dark={dark} sep={sep} fmtTime={fmtTime}
              />
            ))}
          </div>
        </div>

        {/* ── 리포트 ── */}
        <div className="di-panel" ref={panelRef}>
          <div style={{ border: `1px solid ${sep}`, borderRadius: 14, background: surface, overflow: 'hidden' }}>
            {!selected && (
              <div style={{ padding: '22px 18px' }}>
                {universe.length === 0 ? (
                  <>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: colors.textPrimary, marginBottom: 7 }}>
                      먼저 커버리지 종목을 등록하세요
                    </div>
                    <div style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 1.8, marginBottom: 13 }}>
                      전체 시장은 하루 수백 건입니다. 담당 종목만 걸러 두면
                      <b style={{ color: colors.textPrimary }}> 오늘 볼 것이 몇 건인지</b>가 숫자로 나오고,
                      확인한 것과 안 한 것이 구분됩니다.
                      엑셀의 종목코드 열을 그대로 붙여넣으면 됩니다.
                    </div>
                    <button className="di-btn" onClick={openUniverseEditor} style={{
                      fontSize: 12.5, fontWeight: 700, padding: '9px 15px', borderRadius: 9,
                      border: 0, background: accent, color: '#fff',
                    }}>내 유니버스 등록</button>
                  </>
                ) : (
                  <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>
                    공시를 하나 고르세요
                  </div>
                )}
                <div style={{
                  marginTop: 16, paddingTop: 14, borderTop: `1px solid ${sep}`,
                  fontSize: 12.5, color: colors.textMuted, lineHeight: 1.85,
                }}>
                  고르면 원문을 열어 이런 값을 한 장으로 만듭니다.
                  <div style={{
                    marginTop: 8, padding: '10px 12px', borderRadius: 9, background: subtle,
                    fontFamily: FONTS.mono, fontSize: 11.5, lineHeight: 1.9, color: colors.textSecondary,
                  }}>
                    공급계약 · 계약금액 / 매출액 대비 % / 상대방 / 시작일<br />
                    잠정실적 · 매출액 / 영업이익 / 전년동기 / 영업이익률
                  </div>
                  못 읽은 값은 채우지 않고 <b style={{ color: colors.textSecondary }}>못 읽었다고 적습니다.</b>
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
                    {report.takeaway && (
                      <div style={{
                        padding: '13px 16px', background: subtle, borderBottom: `1px solid ${sep}`,
                        fontSize: 13.5, lineHeight: 1.7, color: colors.textPrimary, fontWeight: 600,
                      }}>{report.takeaway}</div>
                    )}

                    {(METRIC_ROWS[report.template_type] || DYNAMIC_TEMPLATES.includes(report.template_type)) && (
                      <div>
                        {(METRIC_ROWS[report.template_type]
                          || Object.keys(report.metrics || {})
                               .filter(k => !METRIC_SKIP.has(k))
                               .map(k => [k, k])
                        ).map(([k, label]) => {
                          const v = report.metrics?.[k]
                          if (v === undefined || v === null || v === '') return null
                          const empty = v === '-'
                          return (
                            <div key={k} style={{
                              display: 'grid', gridTemplateColumns: '124px 1fr', gap: 10,
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

                    {/* 검산 — __잰다는 사실__ 이 이 도구가 파는 것이다 */}
                    {report.metrics?.cross_check && (
                      <div style={{
                        display: 'flex', gap: 8, alignItems: 'flex-start',
                        padding: '11px 16px', borderBottom: `1px solid ${sep}`,
                        background: report.metrics.verified
                          ? (dark ? 'rgba(13,148,136,0.08)' : 'rgba(13,148,136,0.05)')
                          : (dark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.05)'),
                      }}>
                        <span style={{
                          fontSize: 10.5, fontWeight: 800, whiteSpace: 'nowrap',
                          color: report.metrics.verified ? '#0D9488' : '#DC2626',
                        }}>{report.metrics.verified ? '검산 통과' : '검산 불일치'}</span>
                        <span style={{
                          fontSize: 11.5, lineHeight: 1.7, color: colors.textSecondary,
                          fontFamily: FONTS.mono,
                        }}>{report.metrics.cross_check}</span>
                      </div>
                    )}

                    {/* 원문이 "안 적었다"고 말한 대목을 그대로 인용한다 —
                        이게 있으면 사용자는 원문을 열 필요가 없다. */}
                    {report.parse_note && (
                      <div style={{
                        padding: '12px 16px', borderBottom: `1px solid ${sep}`,
                        background: dark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
                      }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', marginBottom: 5 }}>
                          원문 인용
                        </div>
                        <div style={{ fontSize: 12, lineHeight: 1.75, color: colors.textSecondary }}>
                          “{report.parse_note}”
                        </div>
                      </div>
                    )}

                    {/* 상태 설명 + 왜 비었는지 */}
                    <div style={{ padding: '12px 16px', borderBottom: `1px solid ${sep}` }}>
                      <div style={{ fontSize: 12, color: colors.textSecondary, lineHeight: 1.65 }}>{st.desc}</div>
                      {Array.isArray(report.parse_errors) && report.parse_errors.length > 0 && (
                        // "전부 읽었습니다" 밑에 오류 목록만 덩그러니 두면 서로 어긋나 보인다.
                        // 핵심 값은 읽었고 __부수 항목__ 을 못 읽은 것이라고 말해 준다.
                        <div style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 8 }}>
                          읽지 못한 항목 — 원문에서 확인하세요
                        </div>
                      )}
                      {Array.isArray(report.parse_errors) && report.parse_errors.length > 0 && (
                        <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
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
                        <button className="di-btn" onClick={copyOne} style={{
                          fontSize: 12.5, fontWeight: 700, padding: '8px 14px', borderRadius: 9,
                          border: `1px solid ${sep}`, background: 'transparent', color: colors.textPrimary,
                        }}>메신저용 복사</button>
                      )}
                    </div>

                    {/* 감사 추적 — 금융권은 값보다 이걸 먼저 묻는다 */}
                    <div style={{
                      padding: '10px 16px', borderTop: `1px solid ${sep}`, background: subtle,
                      fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono, lineHeight: 1.8,
                      wordBreak: 'break-all',
                    }}>
                      출처 {report.source || 'DART 공시원문'} · 접수번호 {report.rcept_no || '-'}
                      {report.parse_confidence != null && <> · confidence {report.parse_confidence}</>}
                      {report.generated_at && <> · 추출 {String(report.generated_at).replace('T', ' ').slice(0, 16)}</>}
                      {report.cached && <> · 캐시</>}
                    </div>
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
            정량 분해 지원: <b style={{ color: colors.textSecondary }}>공급계약 · 잠정실적</b>(원문 표 분해),
            {' '}<b style={{ color: colors.textSecondary }}>임원·주요주주 소유 · 대량보유(5%) · 주요사항보고서</b>
            {' '}(DART 정형 API — 파싱 없이 값을 그대로 받습니다),
            {' '}<b style={{ color: colors.textSecondary }}>최대주주 변동 · 채무보증 · 횡령배임 · 배당 · 시설투자 · 주식소각</b>
            {' '}(원문 표 + 검산). 시장경보와 텍스트 공시(풍문해명·대표이사변경)는 뽑을 숫자가 없어 대상이 아닙니다.
            시장경보는 DART 원문 자체가 없어 분해 대상이 아닙니다.<br />
            판단 전에 원문을 함께 보시기 바랍니다.
            유니버스와 확인 이력은 <b style={{ color: colors.textSecondary }}>이 브라우저에만</b> 저장됩니다.
          </div>

          {/* 📏 정확도 실측 — 감추면 제품, 드러내면 도구 (DARTIN.md §7-2) */}
          <div style={{
            marginTop: 12, border: `1px solid ${sep}`, borderRadius: 12,
            background: surface, overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 8,
              padding: '11px 14px', borderBottom: `1px solid ${sep}`,
            }}>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: colors.textPrimary }}>정확도 실측</span>
              <span style={{ fontSize: 10.5, color: colors.textMuted, fontFamily: FONTS.mono }}>{ACCURACY.date}</span>
            </div>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 52px 52px 62px',
              fontSize: 11, color: colors.textMuted, padding: '7px 14px', gap: 4,
              borderBottom: `1px solid ${sep}`,
            }}>
              <span>필드</span><span style={{ textAlign: 'right' }}>표본</span>
              <span style={{ textAlign: 'right' }}>값 냄</span><span style={{ textAlign: 'right' }}>불일치</span>
            </div>
            {ACCURACY.rows.map(([label, n, got, bad]) => (
              <div key={label} style={{
                display: 'grid', gridTemplateColumns: '1fr 52px 52px 62px', gap: 4,
                padding: '7px 14px', fontSize: 11.5, color: colors.textSecondary,
                borderBottom: `1px solid ${sep}`,
              }}>
                <span>{label}</span>
                <span style={{ textAlign: 'right', fontFamily: FONTS.mono }}>{n}</span>
                <span style={{ textAlign: 'right', fontFamily: FONTS.mono, color: colors.textPrimary, fontWeight: 700 }}>
                  {got}
                </span>
                <span style={{
                  textAlign: 'right', fontFamily: FONTS.mono, fontWeight: 700,
                  color: bad ? '#DC2626' : '#0D9488',
                }}>{bad}</span>
              </div>
            ))}
            <div style={{ padding: '10px 14px', fontSize: 11, lineHeight: 1.75, color: colors.textMuted }}>
              {ACCURACY.note}<br />
              값을 못 낸 건은 원문이 <b style={{ color: colors.textSecondary }}>기재하지 않았거나</b>
              {' '}서식이 달라 읽지 못한 경우이며, <b style={{ color: colors.textSecondary }}>추측으로 채우지 않습니다.</b>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', left: '50%', transform: 'translateX(-50%)',
          bottom: 'calc(24px + env(safe-area-inset-bottom, 0px))', zIndex: 60,
          background: dark ? '#F4F4F5' : '#18181B', color: dark ? '#18181B' : '#fff',
          fontSize: 12.5, fontWeight: 700, padding: '9px 16px', borderRadius: 22,
          boxShadow: '0 6px 24px rgba(0,0,0,0.18)',
        }}>{toast}</div>
      )}
    </div>
  )
}

/* ── 목록 한 줄 ────────────────────────────────────────────────
   밀도를 높인다. 실무자는 카드가 아니라 __줄__을 훑는다.               */
function ListRow({ row, report, selected, unread, picked, onOpen, onPick, colors, dark, sep, fmtTime }) {
  const cc = CAT_COLOR[row.category] || '#A1A1AA'
  const facts = factLine(report)
  const st = report ? STATUS[report.parse_status] : null

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 0,
      borderBottom: `1px solid ${sep}`,
      background: selected ? (dark ? 'rgba(13,148,136,0.10)' : 'rgba(13,148,136,0.06)') : 'transparent',
      boxShadow: selected ? 'inset 3px 0 0 #0D9488' : 'none',
    }}>
      <label style={{ padding: '13px 6px 13px 12px', cursor: 'pointer' }}>
        <input type="checkbox" checked={picked} onChange={onPick} />
      </label>
      <button className="di-row" onClick={onOpen} style={{ padding: '11px 14px 11px 4px', flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
          {unread && (
            <span title="미확인" style={{
              width: 6, height: 6, borderRadius: 3, background: '#D97706', flexShrink: 0,
            }} />
          )}
          <span style={{
            fontSize: 10, fontWeight: 700, color: cc,
            background: `${cc}14`, padding: '2px 7px', borderRadius: 4, whiteSpace: 'nowrap',
          }}>{row.category_label}</span>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: colors.textPrimary }}>{row.corp_name}</span>
          {row.stock_code && (
            <span style={{ fontSize: 10.5, color: colors.textMuted, fontFamily: FONTS.mono }}>{row.stock_code}</span>
          )}
          {row.is_correction && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#DC2626',
              background: 'rgba(220,38,38,0.10)', padding: '2px 6px', borderRadius: 4,
            }}>정정</span>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 10.5, color: colors.textMuted, fontFamily: FONTS.mono }}>
            {fmtTime(row.rcept_dt)}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: colors.textSecondary, lineHeight: 1.5 }}>{row.report_nm}</div>

        {/* 인라인 숫자 — 목록에서 이미 답이 보여야 한 건씩 열지 않는다 */}
        {facts && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap',
          }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: colors.textPrimary, fontFamily: FONTS.mono,
            }}>{facts}</span>
            {st && (
              <span style={{ fontSize: 10, fontWeight: 700, color: st.color }}>{st.label}</span>
            )}
          </div>
        )}
        {!facts && row.parsable && !report && (
          <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 4 }}>숫자 불러오는 중…</div>
        )}
        {!row.parsable && ['GROWTH', 'EARNINGS'].includes(row.category) && (
          // 열어보고 실망하지 않게 __목록에서 미리__ 말한다.
          // ⚠️ 단 시장경보처럼 __애초에 분해할 것이 없는__ 분류에까지 붙이면
          //    모든 줄에 같은 문구가 반복돼 화면이 소음이 된다(2026-09-08 실측).
          <div style={{ fontSize: 10.5, color: colors.textMuted, marginTop: 4 }}>
            정량 분해 대상 아님 · 분류와 원문 링크까지
          </div>
        )}
      </button>
    </div>
  )
}

/* 리포트 → 한 줄 팩트. 없는 값은 만들지 않는다. */
function factLine(rep) {
  if (!rep) return ''
  const m = rep.metrics || {}
  const has = (v) => v && v !== '-'
  if (rep.template_type === 'SUPPLY_CONTRACT') {
    if (rep.parse_status === 'not_in_document' && !has(m.contract_amount)) {
      return has(m.revenue_ratio) ? `매출대비 ${m.revenue_ratio} · 금액 미기재(원문 유보)` : '금액 미기재(원문 유보)'
    }
    const parts = []
    if (has(m.contract_amount)) parts.push(m.contract_amount)
    if (has(m.revenue_ratio)) parts.push(`매출대비 ${m.revenue_ratio}`)
    if (has(m.counterparty) && m.counterparty !== '미공시 또는 확인 필요') parts.push(m.counterparty)
    return parts.join(' · ')
  }
  if (rep.template_type === 'CANCELLATION') {
    const parts = []
    if (has(m['소각 주식수'])) parts.push(m['소각 주식수'])
    // 소각은 __발행주식 대비__ 가 규모다. 금액만 보면 규모 차이가 안 보인다.
    if (has(m['발행주식 대비'])) parts.push(`발행주식 대비 ${m['발행주식 대비']}`)
    if (has(m['소각예정금액'])) parts.push(m['소각예정금액'])
    return parts.join(' · ')
  }
  if (rep.template_type === 'GUARANTEE' || rep.template_type === 'EMBEZZLEMENT'
      || rep.template_type === 'FACILITY') {
    const amt = m['채무보증금액'] || m['혐의발생금액'] || m['투자금액']
    const parts = []
    if (has(amt)) parts.push(amt)
    // 규모는 금액이 아니라 __자기자본 대비__ 다 — 같은 100억도 회사마다 다른 사건이다
    if (has(m['자기자본 대비'])) parts.push(`자기자본 대비 ${m['자기자본 대비']}`)
    if (has(m['채권자'])) parts.push(m['채권자'])
    return parts.join(' · ')
  }
  if (rep.template_type === 'DIVIDEND') {
    const parts = []
    if (has(m['1주당 배당금'])) parts.push(`1주당 ${m['1주당 배당금']}`)
    if (has(m['시가배당률'])) parts.push(`시가배당률 ${m['시가배당률']}`)
    if (has(m['배당금총액'])) parts.push(m['배당금총액'])
    return parts.join(' · ')
  }
  if (rep.template_type === 'OWNER_CHANGE') {
    const parts = []
    if (has(m['직전 지분율']) && has(m['이번 지분율'])) parts.push(`${m['직전 지분율']} → ${m['이번 지분율']}`)
    if (has(m['지분율 증감'])) parts.push(m['지분율 증감'])
    // 변경원인이 사건의 성격이다 — 장내매수와 교환은 부호가 같아도 다른 일이다
    if (has(m['변경 원인'])) parts.push(m['변경 원인'])
    return parts.join(' · ')
  }
  if (rep.template_type === 'INSIDER') {
    const parts = []
    if (has(m['증감'])) parts.push(m['증감'])
    // ☠️ 방법을 모르면 __방향을 말하지 않는다__ (스톡옵션·무상신주가 (+)로 온다)
    parts.push(has(m['취득·처분 방법']) ? m['취득·처분 방법'] : '방법 미확인')
    if (has(m['지분율'])) parts.push(`지분 ${m['지분율']}`)
    return parts.join(' · ')
  }
  if (rep.template_type === 'MAJOR_HOLDING') {
    const parts = []
    if (has(m['직전 비율']) && has(m['보유 비율'])) parts.push(`${m['직전 비율']} → ${m['보유 비율']}`)
    else if (has(m['보유 비율'])) parts.push(m['보유 비율'])
    if (has(m['비율 증감'])) parts.push(m['비율 증감'])
    if (has(m['보유 목적'])) parts.push(m['보유 목적'])
    return parts.join(' · ')
  }
  if (rep.template_type === 'DS005') {
    const pick = ['사채총액', '표면이자율(%)', '전환시 발행주식 대비(%)', '신주 보통주(주)',
                  '증자전 발행주식 대비(%)', '취득예정 금액', '계약금액', '해지 전 계약금액',
                  '발행주식 대비(%)']
    const parts = []
    for (const k of pick) {
      if (!has(m[k]) || parts.length >= 3) continue
      parts.push(k.includes('(%)') ? `${k.replace('(%)', '')} ${m[k]}${String(m[k]).includes('%') ? '' : '%'}` : m[k])
    }
    return parts.join(' · ')
  }
  if (rep.template_type === 'EARNINGS') {
    const parts = []
    if (has(m.operating_profit)) parts.push(`영업익 ${m.operating_profit}`)
    if (has(m.operating_profit_yoy)) parts.push(`전년동기 ${m.operating_profit_yoy}`)
    if (has(m.revenue)) parts.push(`매출 ${m.revenue}`)
    return parts.join(' · ')
  }
  return ''
}

function Stat({ label, value, colors, mono, tone }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontSize: 11.5, color: colors.textMuted }}>{label}</span>
      <b style={{
        fontSize: 13.5, color: tone || colors.textPrimary,
        fontFamily: mono ? FONTS.mono : 'inherit', fontWeight: 800,
      }}>{value}</b>
    </span>
  )
}

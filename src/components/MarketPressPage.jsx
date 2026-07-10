import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { API } from '../lib/api'

// KOREA MARKET PRESS — 외국인 투자자 대상 영문 데일리 (독립 신문 형태)
// 에디토리얼 프레임(마스트헤드 + 헤어라인 룰 + 멀티컬럼 + 드롭캡)은 유지하되
// DART Insight 브랜드 팔레트(화이트/zinc/시그널 레드) + Noto Serif KR로 정렬.
const SERIF = "'Noto Serif KR','Georgia','Times New Roman',serif"

export default function MarketPressPage() {
  const navigate = useNavigate()
  const { date: routeDate } = useParams()
  const [issue, setIssue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [archive, setArchive] = useState([])  // [{date, headline, edition}] 최신순

  // 발행 이슈 로드 — URL에 날짜가 있으면 그 날짜, 없으면 최신(today)
  useEffect(() => {
    setLoading(true)
    const url = routeDate
      ? `${API}/api/market-press/date/${routeDate}`
      : `${API}/api/market-press/today`
    fetch(url)
      .then(r => r.json())
      .then(d => setIssue(d && (d.lead || d.date) ? d : null))
      .catch(() => setIssue(null))
      .finally(() => setLoading(false))
  }, [routeDate])

  // 아카이브 목록(드롭다운/이전·다음용)
  useEffect(() => {
    fetch(`${API}/api/market-press/list`)
      .then(r => r.json())
      .then(d => setArchive(Array.isArray(d?.issues) ? d.issues : []))
      .catch(() => setArchive([]))
  }, [])

  // 스크롤 리빌 — 지면 섹션이 뷰포트에 들어올 때 페이드업
  useEffect(() => {
    if (loading) return
    const els = Array.from(document.querySelectorAll('.kmp-reveal'))
    if (!els.length) return
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('kmp-in')); return }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('kmp-in'); io.unobserve(e.target) } })
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [issue, loading])

  const chg = (v) => {
    if (typeof v !== 'number') return null
    const up = v > 0
    return <span style={{ color: up ? '#DC2626' : '#18181B', fontWeight: 700 }}>
      {up ? '▲' : v < 0 ? '▼' : ''}{Math.abs(v).toFixed(2)}%
    </span>
  }

  const scrollToId = (id) => {
    if (!id) return
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div style={{ background: '#FFFFFF', minHeight: '100vh', fontFamily: SERIF, color: '#18181B', overflowX: 'hidden', maxWidth: '100vw' }}>
      <style>{`
        .kmp-wrap{max-width:1080px;margin:0 auto;padding:0 20px 80px}
        .kmp-cols{column-count:1;column-gap:34px}
        @media(min-width:760px){.kmp-cols{column-count:2}}
        @media(min-width:1000px){.kmp-lead-cols{column-count:2;column-gap:38px}}
        .kmp-dropcap::first-letter{float:left;font-size:3.4em;line-height:.78;padding:6px 10px 0 0;font-weight:700}
        .kmp-sec{break-inside:avoid;margin-bottom:26px}
        .kmp-rule{border:0;border-top:1px solid #18181B;margin:0}
        .kmp-rule-thin{border:0;border-top:1px solid #E4E4E7;margin:0}
        .kmp-link{cursor:pointer;text-decoration:none;color:inherit}
        .kmp-kicker{font-family:${SERIF};font-size:11px;letter-spacing:.18em;text-transform:uppercase;font-weight:700;color:#DC2626}
        .kmp-nav{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 2px;padding:9px 0 2px}
        .kmp-nav-item{font-family:${SERIF};font-size:11px;letter-spacing:.16em;text-transform:uppercase;font-weight:700;color:#3F3F46;text-decoration:none;cursor:pointer;padding:2px 8px;white-space:nowrap}
        .kmp-nav-item:hover{color:#DC2626}
        .kmp-nav-div{color:#D4D4D8;font-size:11px;user-select:none}
        .kmp-sec{scroll-margin-top:16px}
        @media(max-width:759px){.kmp-nav-item{font-size:10px;letter-spacing:.1em;padding:2px 5px}}
        /* scroll reveal */
        .kmp-reveal{opacity:0;transform:translateY(16px);transition:opacity .7s ease,transform .7s cubic-bezier(.22,1,.36,1)}
        .kmp-reveal.kmp-in{opacity:1;transform:none}
        /* framed data boxes */
        .kmp-box{border:1px solid #18181B;background:#FFFFFF}
        .kmp-box-hd{border-bottom:1px solid #18181B;padding:10px 14px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;background:#18181B;color:#FFFFFF;display:flex;justify-content:space-between;align-items:baseline;gap:12px}
        .kmp-box-hd .kmp-box-when{font-weight:400;letter-spacing:.08em;color:#A1A1AA;font-size:10.5px}
        .kmp-box-sub{padding:11px 14px 2px;font-style:italic;color:#52525B;font-size:13px;line-height:1.4}
        .kmp-box-note{padding:9px 14px;font-size:11px;color:#A1A1AA;border-top:1px solid #F4F4F5;font-style:italic;line-height:1.5}
        /* foreign money flow */
        .kmp-two{display:grid;grid-template-columns:1fr}
        @media(min-width:680px){.kmp-two{grid-template-columns:1fr 1fr}.kmp-two>.kmp-flowcol:first-child{border-right:1px solid #F4F4F5}}
        .kmp-flowcol{padding:14px 16px 8px}
        .kmp-flowcol>h4{margin:0 0 13px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#71717A;font-weight:700}
        .kmp-flrow{margin:0 0 13px}
        .kmp-flrow-top{display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:5px}
        .kmp-flrow-nm{font-size:13.5px;font-weight:700;line-height:1.15}
        .kmp-flrow-q{font-family:monospace;font-size:12px;white-space:nowrap;color:#3F3F46}
        .kmp-bar{height:7px;background:#F4F4F5;overflow:hidden}
        .kmp-bar-fill{height:100%;display:block;width:0;animation:kmp-grow 1.05s cubic-bezier(.22,1,.36,1) forwards}
        @keyframes kmp-grow{from{width:0}to{width:var(--w,0%)}}
        .kmp-tag{display:inline-block;font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;padding:1px 5px;border:1px solid currentColor;margin-left:7px;vertical-align:middle;opacity:.85}
        /* chart of the day */
        .kmp-spark{width:100%;height:auto;display:block}
        .kmp-chart-grid{display:grid;grid-template-columns:1fr;gap:22px;margin-top:22px}
        @media(min-width:760px){.kmp-chart-grid{grid-template-columns:1.35fr 1fr}}
        /* calendar / wire */
        .kmp-cal-item{display:flex;gap:14px;padding:10px 0;border-top:1px solid #F4F4F5}
        .kmp-cal-item:first-child{border-top:0}
        .kmp-cal-date{font-family:monospace;font-size:12px;color:#DC2626;font-weight:700;white-space:nowrap;min-width:62px}
        .kmp-cal-lbl{font-size:14px;line-height:1.42}
        .kmp-cal-tag{font-size:9px;letter-spacing:.1em;text-transform:uppercase;font-weight:700;color:#A1A1AA}
        /* ── mobile hardening (콘텐츠 화면 밖 이탈 방지) ── */
        .kmp-wrap{box-sizing:border-box;width:100%}
        .kmp-wrap *{box-sizing:border-box}
        .kmp-wrap img,.kmp-wrap svg{max-width:100%;height:auto}
        .kmp-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}
        /* data tables — reflow to stacked cards on phones so nothing scrolls off-screen */
        .kmp-mkt{min-width:440px}
        .kmp-lev{min-width:460px}
        @media(max-width:519px){
          .kmp-mkt,.kmp-lev{min-width:0}
          .kmp-mkt thead,.kmp-lev thead{display:none}
          .kmp-mkt tbody tr,.kmp-lev tbody tr{display:block;border-top:1px solid #18181B}
          .kmp-mkt tbody tr:first-child,.kmp-lev tbody tr:first-child{border-top:0}
          .kmp-mkt td,.kmp-lev td{display:flex;justify-content:space-between;align-items:baseline;gap:12px;padding:6px 14px!important;text-align:right!important;white-space:normal!important}
          .kmp-mkt td:first-child,.kmp-lev td:first-child{text-align:left!important;padding-top:11px!important;padding-bottom:4px!important}
          .kmp-mkt td[data-label]::before,.kmp-lev td[data-label]::before{content:attr(data-label);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#71717A;font-weight:700}
        }
        /* The Setup — bull/bear ledger + what to watch */
        .kmp-setup-li{font-size:13.5px;line-height:1.5;padding:8px 0 8px 16px;position:relative;border-top:1px solid #F4F4F5}
        .kmp-flowcol>h4+.kmp-setup-li{border-top:0}
        .kmp-setup-li::before{content:'';position:absolute;left:0;top:14px;width:6px;height:6px;border-radius:50%}
        .kmp-setup-bull::before{background:#047857}
        .kmp-setup-bear::before{background:#DC2626}
        .kmp-watch-item{display:flex;flex-direction:column;gap:2px;padding:9px 0;border-top:1px solid #F4F4F5}
        .kmp-watch-item:first-of-type{border-top:0}
        .kmp-watch-lbl{font-size:13.5px;font-weight:700;line-height:1.25}
        .kmp-watch-detail{font-size:12.5px;color:#52525B;line-height:1.45}
        .kmp-dropcap::first-letter{overflow-wrap:normal}
        .kmp-lead-cols p,.kmp-cols p,.kmp-sec h3{overflow-wrap:break-word;word-break:break-word}
        /* 단락별 한국어 번역 토글 */
        .kmp-para{margin:0 0 13px}
        .kmp-ko-toggle{display:inline-flex;align-items:center;gap:4px;background:none;border:0;padding:0;cursor:pointer;font-family:${SERIF};font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#B4B4BB;transition:color .15s}
        .kmp-ko-toggle:hover{color:#DC2626}
        .kmp-ko-toggle .kmp-ko-caret{font-size:9px;transition:transform .2s}
        .kmp-ko-body{margin:9px 0 0;padding:11px 14px;background:#FAFAFA;border-left:2px solid #DC2626;font-size:14.5px;line-height:1.72;color:#3F3F46;word-break:keep-all;overflow-wrap:break-word}
        /* 발행일 네비게이터 */
        .kmp-issuenav{position:relative;display:flex;align-items:center;justify-content:center;gap:14px;padding:8px 0 2px}
        .kmp-issuenav-btn{background:none;border:0;cursor:pointer;font-family:${SERIF};font-size:11px;letter-spacing:.12em;text-transform:uppercase;font-weight:700;color:#3F3F46;padding:2px 4px;white-space:nowrap;transition:color .15s}
        .kmp-issuenav-btn:hover:not(:disabled){color:#DC2626}
        .kmp-issuenav-btn:disabled{color:#D4D4D8;cursor:default}
        .kmp-issuenav-cur{display:inline-flex;align-items:center;gap:6px;background:none;border:0;cursor:pointer;font-family:${SERIF};font-size:12px;letter-spacing:.05em;font-weight:700;color:#18181B;padding:2px 6px}
        .kmp-issuenav-cur:hover{color:#DC2626}
        .kmp-issuenav-menu{position:absolute;top:calc(100% + 4px);left:50%;transform:translateX(-50%);z-index:20;background:#FFFFFF;border:1px solid #18181B;box-shadow:0 8px 28px rgba(0,0,0,.14);max-height:340px;overflow-y:auto;width:min(360px,88vw)}
        .kmp-issuenav-item{display:block;width:100%;text-align:left;background:none;border:0;border-top:1px solid #F4F4F5;cursor:pointer;padding:9px 13px;font-family:${SERIF};color:#18181B}
        .kmp-issuenav-item:first-child{border-top:0}
        .kmp-issuenav-item:hover{background:#FAFAFA}
        .kmp-issuenav-item.kmp-on{background:#18181B;color:#FFFFFF}
        .kmp-issuenav-d{font-family:monospace;font-size:11px;color:#DC2626;font-weight:700}
        .kmp-issuenav-item.kmp-on .kmp-issuenav-d{color:#FCA5A5}
        .kmp-issuenav-h{font-size:12.5px;line-height:1.34;margin-top:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        @media(max-width:640px){
          .kmp-wrap{padding-left:14px;padding-right:14px}
          .kmp-box-hd{flex-wrap:wrap;gap:4px 10px}
          .kmp-flrow-nm{font-size:12.5px}
          .kmp-cal-item{gap:10px}
        }
        /* masthead — refined editorial nameplate */
        .kmp-topbar{background:#18181B}
        .kmp-topbar-in{display:flex;align-items:center;justify-content:space-between;padding:8px 20px;font-size:11px;letter-spacing:.05em}
        .kmp-topbar-back{color:#E4E4E7;font-weight:600}
        .kmp-topbar-back:hover{color:#FFFFFF}
        .kmp-topbar-tag{text-transform:uppercase;letter-spacing:.24em;color:#8A8A93;font-size:9.5px;white-space:nowrap}
        .kmp-eyebrow{display:flex;align-items:center;justify-content:center;gap:15px;margin-bottom:15px}
        .kmp-eyebrow-line{height:1px;width:min(72px,15vw);background:#18181B;opacity:.45}
        .kmp-eyebrow-txt{font-family:${SERIF};font-size:10px;letter-spacing:.34em;text-transform:uppercase;color:#DC2626;font-weight:700;white-space:nowrap}
        .kmp-nameplate{font-family:${SERIF};font-size:clamp(40px,8.6vw,80px);line-height:.9;margin:0;font-weight:800;letter-spacing:-0.028em;color:#18181B}
        .kmp-tagline{font-family:${SERIF};font-size:13px;font-style:italic;color:#52525B;margin-top:14px}
        .kmp-doublerule{border-top:3px solid #18181B}
        .kmp-doublerule-thin{border-top:1px solid #18181B;margin-top:2.5px}
        .kmp-folioline{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:4px 12px;padding:7px 0;font-family:${SERIF};font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#3F3F46}
        .kmp-folioline .kmp-folio-date{font-weight:700;letter-spacing:.05em;color:#18181B}
        @media(max-width:519px){
          .kmp-eyebrow{gap:10px}
          .kmp-eyebrow-txt{letter-spacing:.2em;font-size:9px}
          .kmp-nameplate{letter-spacing:-0.02em}
          .kmp-folioline{font-size:9.5px;letter-spacing:.09em}
        }
      `}</style>

      {/* 유틸리티 바 */}
      <div className="kmp-topbar">
        <div className="kmp-wrap kmp-topbar-in">
          <span onClick={() => navigate('/')} className="kmp-link kmp-topbar-back">← DART Insight</span>
          <span className="kmp-topbar-tag">In English · For Global Investors</span>
        </div>
      </div>

      <div className="kmp-wrap" style={{ paddingTop: 30 }}>
        {/* 마스트헤드 */}
        <div style={{ textAlign: 'center' }}>
          <div className="kmp-eyebrow">
            <span className="kmp-eyebrow-line" />
            <span className="kmp-eyebrow-txt">Seoul · Semiconductors</span>
            <span className="kmp-eyebrow-line" />
          </div>
          <h1 className="kmp-nameplate">Korea Market Press</h1>
          <div className="kmp-tagline">The Daily English Brief on Samsung Electronics &amp; SK Hynix</div>
        </div>

        {/* 더블 룰 + 폴리오 라인 (신문 마스트헤드) */}
        <div style={{ margin: '20px 0 4px' }}>
          <div className="kmp-doublerule" />
          <div className="kmp-doublerule-thin" />
          <div className="kmp-folioline">
            <span>{issue?.dateline || 'Seoul'}</span>
            <span className="kmp-folio-date">{fmtDate(issue?.date, issue?.weekday)}</span>
            <span style={{ textAlign: 'right' }}>{issue?.edition || 'Chip Edition'}</span>
          </div>
          <div className="kmp-doublerule-thin" style={{ marginTop: 0 }} />
        </div>

        {/* 발행일 네비게이터 — 이전/다음 + 날짜 드롭다운(아카이브) */}
        {archive.length > 1 && (
          <IssueNavigator
            archive={archive}
            currentDate={issue?.date || routeDate}
            onGo={(d) => navigate(`/market-press/${d}`)}
          />
        )}

        {loading ? (
          <Skeleton />
        ) : !issue || !issue.lead ? (
          <ComingSoon navigate={navigate} />
        ) : (
          <>
            {/* 섹션 레일 / 키커 내비 */}
            {Array.isArray(issue.nav) && issue.nav.length > 0 && (
              <>
                <nav className="kmp-nav" aria-label="Sections">
                  {issue.nav.map((n, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="kmp-nav-div">·</span>}
                      <a
                        href={`#${slug(n)}`}
                        className="kmp-nav-item"
                        onClick={(e) => { e.preventDefault(); scrollToId(slug(n)) }}
                      >{n}</a>
                    </React.Fragment>
                  ))}
                </nav>
                <hr className="kmp-rule-thin" style={{ marginTop: 8 }} />
              </>
            )}

            {/* 리드 스토리 */}
            <div style={{ padding: '26px 0 10px' }}>
              {issue.lead.kicker && <div className="kmp-kicker" style={{ marginBottom: 10 }}>{issue.lead.kicker}</div>}
              <h2 style={{
                fontSize: 'clamp(30px,5.2vw,52px)', lineHeight: 1.04, margin: 0, fontWeight: 800,
                letterSpacing: '-0.015em', maxWidth: 900,
              }}>
                {issue.lead.headline}
              </h2>
              {issue.lead.deck && (
                <p style={{ fontSize: 'clamp(16px,2.2vw,20px)', fontStyle: 'italic', color: '#3F3F46', lineHeight: 1.45, margin: '14px 0 0', maxWidth: 760 }}>
                  {issue.lead.deck}
                </p>
              )}
              {issue.lead.byline && (
                <div style={{ fontSize: 11.5, letterSpacing: '.06em', textTransform: 'uppercase', color: '#71717A', marginTop: 14 }}>
                  By {issue.lead.byline}
                </div>
              )}
              <hr className="kmp-rule-thin" style={{ margin: '18px 0' }} />
              <div className="kmp-lead-cols">
                {(issue.lead.body || []).map((p, i) => (
                  <Para
                    key={i}
                    text={p}
                    ko={(issue.lead.body_ko || [])[i]}
                    pClassName={i === 0 ? 'kmp-dropcap' : ''}
                    pStyle={{ fontSize: 16.5, lineHeight: 1.62, margin: '0 0 4px' }}
                  />
                ))}
              </div>
            </div>

            {/* 마감 시세 박스 + 풀쿼트 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 22, margin: '10px 0 30px' }}>
              {issue.market_box && (
                <div style={{ border: '1px solid #18181B', padding: '0' }}>
                  <div style={{ borderBottom: '1px solid #18181B', padding: '9px 14px', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, background: '#18181B', color: '#FFFFFF' }}>
                    {issue.market_box.title || 'At the Close'}
                  </div>
                  <div className="kmp-scroll">
                    <table className="kmp-mkt" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: SERIF }}>
                    <thead>
                      <tr style={{ fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: '#71717A' }}>
                        <th style={thL}>Company</th><th style={thR}>Last</th><th style={thR}>Chg</th>
                        <th style={thR}>Foreign</th><th style={thR}>52W</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(issue.market_box.rows || []).map((r, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #F4F4F5' }}>
                          <td style={tdL}>
                            <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                            <div style={{ fontSize: 11, color: '#A1A1AA', fontFamily: "monospace" }}>{r.code}</div>
                          </td>
                          <td style={tdR} data-label="Last">{r.price}</td>
                          <td style={tdR} data-label="Chg">{chg(r.change)}</td>
                          <td style={tdR} data-label="Foreign">{r.foreign}</td>
                          <td style={tdR} data-label="52W">{r.range52}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  {issue.market_box.note && (
                    <div style={{ padding: '8px 14px', fontSize: 11, color: '#A1A1AA', borderTop: '1px solid #F4F4F5', fontStyle: 'italic' }}>{issue.market_box.note}</div>
                  )}
                </div>
              )}

              {issue.leverage_box && (
                <div id="leverage-watch" style={{ border: '1px solid #18181B', padding: '0', scrollMarginTop: 16 }}>
                  <div style={{ borderBottom: '1px solid #18181B', padding: '9px 14px', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, background: '#18181B', color: '#FFFFFF' }}>
                    {issue.leverage_box.title || 'Leverage & Inverse Watch'}
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="kmp-lev" style={{ width: '100%', borderCollapse: 'collapse', fontFamily: SERIF }}>
                      <thead>
                        <tr style={{ fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: '#71717A' }}>
                          <th style={thL}>Product</th><th style={thL}>Underlying</th>
                          <th style={thL}>Type</th><th style={thR}>Last</th><th style={thR}>Chg</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(issue.leverage_box.rows || []).map((r, i) => (
                          <tr key={i} style={{ borderTop: '1px solid #F4F4F5' }}>
                            <td style={tdL}>
                              <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                              {r.code && <div style={{ fontSize: 11, color: '#A1A1AA', fontFamily: 'monospace' }}>{r.code}</div>}
                            </td>
                            <td style={{ ...tdL, fontSize: 14 }} data-label="Underlying">{r.underlying}</td>
                            <td style={{ ...tdL, fontSize: 13, fontStyle: 'italic', color: '#52525B' }} data-label="Type">{r.kind}</td>
                            <td style={tdR} data-label="Last">{r.price}</td>
                            <td style={tdR} data-label="Chg">{chg(r.change)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {issue.leverage_box.note && (
                    <div style={{ padding: '8px 14px', fontSize: 11, color: '#A1A1AA', borderTop: '1px solid #F4F4F5', fontStyle: 'italic' }}>{issue.leverage_box.note}</div>
                  )}
                </div>
              )}

              {issue.quote_box && (
                <blockquote style={{ margin: 0, padding: '4px 0', borderTop: '3px solid #18181B', borderBottom: '1px solid #18181B' }}>
                  <p style={{ fontSize: 'clamp(20px,3vw,27px)', lineHeight: 1.3, fontWeight: 700, margin: '16px 0 10px', letterSpacing: '-0.01em' }}>
                    “{issue.quote_box.text}”
                  </p>
                  {issue.quote_box.source && (
                    <cite style={{ fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: '#71717A', fontStyle: 'normal' }}>— {issue.quote_box.source}</cite>
                  )}
                </blockquote>
              )}
            </div>

            {/* 외국인 수급 흐름 — 킬러 데이터 섹션 */}
            {issue.flow_box && <FlowBox flow={issue.flow_box} />}

            {/* Chart of the Day + Notable Moves */}
            {(issue.chart || issue.movers_box) && (
              <div className="kmp-chart-grid">
                {issue.chart && <ChartOfDay chart={issue.chart} />}
                {issue.movers_box && <MoversBox movers={issue.movers_box} chg={chg} />}
              </div>
            )}

            {/* 섹션들 */}
            <hr className="kmp-rule" style={{ borderTopWidth: 3, marginBottom: 22, marginTop: 30 }} />
            <div className="kmp-cols">
              {(() => {
                const seen = new Set()
                return (issue.sections || []).map((s, i) => {
                  const id = slug(s.kicker)
                  const anchorId = id && !seen.has(id) ? (seen.add(id), id) : undefined
                  return (
                    <div key={i} id={anchorId} className="kmp-sec">
                      {s.kicker && <div className="kmp-kicker" style={{ marginBottom: 6 }}>{s.kicker}</div>}
                  <h3 style={{ fontSize: 21, lineHeight: 1.15, margin: '0 0 10px', fontWeight: 800, letterSpacing: '-0.01em' }}>{s.headline}</h3>
                  {(s.body || []).map((p, j) => (
                    <Para
                      key={j}
                      text={p}
                      ko={(s.body_ko || [])[j]}
                      pStyle={{ fontSize: 15, lineHeight: 1.58, margin: '0 0 4px' }}
                    />
                  ))}
                      <hr className="kmp-rule-thin" style={{ marginTop: 4 }} />
                    </div>
                  )
                })
              })()}
            </div>

            {/* The Setup — 강세/약세 팩트 정리 + 다음 세션 관전 포인트 */}
            {issue.setup_box && <SetupBox setup={issue.setup_box} />}

            {/* On the Wire — 일정/공시 캘린더 */}
            {issue.calendar && Array.isArray(issue.calendar.items) && issue.calendar.items.length > 0 && (
              <CalendarBox calendar={issue.calendar} />
            )}

            {/* 푸터 */}
            <div style={{ marginTop: 34, paddingTop: 16, borderTop: '3px solid #18181B', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.01em' }}>Korea Market Press</div>
              <div style={{ fontSize: 11.5, color: '#71717A', marginTop: 8, lineHeight: 1.6, maxWidth: 620, margin: '8px auto 0' }}>
                {issue.footer || 'Information only. Not investment advice. Figures are exchange-close data via Kiwoom and DART regulatory filings.'}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const thL = { textAlign: 'left', padding: '8px 14px', fontWeight: 700 }
const thR = { textAlign: 'right', padding: '8px 14px', fontWeight: 700 }
const tdL = { textAlign: 'left', padding: '11px 14px', verticalAlign: 'top' }
const tdR = { textAlign: 'right', padding: '11px 14px', fontSize: 15, verticalAlign: 'top', whiteSpace: 'nowrap' }

// ── Foreign Money Flow — 좌(순매도)/우(순매수) 발산 막대 인포그래픽 ──
function FlowBox({ flow }) {
  const sells = (flow.sell || []).filter(r => r && typeof r.qty === 'number')
  const buys = (flow.buy || []).filter(r => r && typeof r.qty === 'number')
  const maxSell = Math.max(1, ...sells.map(r => Math.abs(r.qty)))
  const maxBuy = Math.max(1, ...buys.map(r => Math.abs(r.qty)))
  const fmtQ = (q) => {
    const a = Math.abs(q)
    if (a >= 1e6) return (a / 1e6).toFixed(2) + 'M'
    if (a >= 1e3) return Math.round(a / 1e3) + 'K'
    return String(a)
  }
  const Col = ({ title, rows, max, color, sign }) => (
    <div className="kmp-flowcol">
      <h4>{title}</h4>
      {rows.map((r, i) => (
        <div key={i} className="kmp-flrow">
          <div className="kmp-flrow-top">
            <span className="kmp-flrow-nm">
              {r.name}
              {r.tag && <span className="kmp-tag" style={{ color }}>{r.tag}</span>}
            </span>
            <span className="kmp-flrow-q">{sign}{fmtQ(r.qty)}</span>
          </div>
          <div className="kmp-bar">
            <span className="kmp-bar-fill" style={{ '--w': `${Math.max(6, Math.round(Math.abs(r.qty) / max * 100))}%`, background: color }} />
          </div>
        </div>
      ))}
    </div>
  )
  return (
    <section className="kmp-box kmp-reveal" style={{ marginTop: 22 }}>
      <div className="kmp-box-hd">
        <span>{flow.title || 'Foreign Money Flow'}</span>
        {flow.when && <span className="kmp-box-when">{flow.when}</span>}
      </div>
      {flow.subtitle && <div className="kmp-box-sub">{flow.subtitle}</div>}
      <div className="kmp-two" style={{ paddingTop: 6 }}>
        <Col title={flow.sell_title || 'Foreigners Sold'} rows={sells} max={maxSell} color="#18181B" sign="−" />
        <Col title={flow.buy_title || 'Foreigners Bought'} rows={buys} max={maxBuy} color="#DC2626" sign="+" />
      </div>
      {flow.note && <div className="kmp-box-note">{flow.note}</div>}
    </section>
  )
}

// ── Chart of the Day — 종가 시리즈 스파크라인(영역+라인) ──
function ChartOfDay({ chart }) {
  const series = (chart.series || []).filter(v => typeof v === 'number')
  const W = 320, H = 96, pad = 6
  let path = '', area = '', lastPt = null
  if (series.length >= 2) {
    const min = Math.min(...series), max = Math.max(...series)
    const rng = max - min || 1
    const x = (i) => pad + (i / (series.length - 1)) * (W - pad * 2)
    const y = (v) => pad + (1 - (v - min) / rng) * (H - pad * 2)
    const pts = series.map((v, i) => [x(i), y(v)])
    path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')
    area = `${path} L${pts[pts.length - 1][0].toFixed(1)} ${H - pad} L${pts[0][0].toFixed(1)} ${H - pad} Z`
    lastPt = pts[pts.length - 1]
  }
  const c = typeof chart.change === 'number' ? chart.change : 0
  const col = c > 0 ? '#DC2626' : '#18181B'
  return (
    <section className="kmp-box kmp-reveal">
      <div className="kmp-box-hd">
        <span>{chart.title || 'Chart of the Day'}</span>
        {chart.when && <span className="kmp-box-when">{chart.when}</span>}
      </div>
      <div style={{ padding: '13px 16px 4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9, gap: 8 }}>
          <span style={{ fontSize: 15, fontWeight: 700 }}>
            {chart.name}
            {chart.code && <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#A1A1AA', marginLeft: 6 }}>{chart.code}</span>}
          </span>
          <span style={{ fontFamily: 'monospace', fontSize: 14, whiteSpace: 'nowrap' }}>
            {chart.last}{' '}
            {typeof chart.change === 'number' && (
              <span style={{ color: col, fontWeight: 700 }}>{c > 0 ? '▲' : c < 0 ? '▼' : ''}{Math.abs(c).toFixed(2)}%</span>
            )}
          </span>
        </div>
        {series.length >= 2 ? (
          <svg className="kmp-spark" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="price trend">
            <path d={area} fill={col} opacity="0.08" />
            <path d={path} fill="none" stroke={col} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            {lastPt && <circle cx={lastPt[0]} cy={lastPt[1]} r="3" fill={col} />}
          </svg>
        ) : (
          <div style={{ fontSize: 12, color: '#A1A1AA', padding: '12px 0' }}>Series unavailable.</div>
        )}
      </div>
      {chart.note && <div className="kmp-box-note">{chart.note}</div>}
    </section>
  )
}

// ── Notable Moves — 그날 % 변동 큰 종목/ETF ──
function MoversBox({ movers, chg }) {
  const rows = movers.rows || []
  return (
    <section className="kmp-box kmp-reveal">
      <div className="kmp-box-hd">
        <span>{movers.title || 'Notable Moves'}</span>
        {movers.when && <span className="kmp-box-when">{movers.when}</span>}
      </div>
      <div style={{ padding: '2px 0' }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, padding: '9px 16px', borderTop: i ? '1px solid #F4F4F5' : 'none' }}>
            <span style={{ fontSize: 13.5, lineHeight: 1.25 }}>
              {r.name}
              {r.tag && <span className="kmp-tag" style={{ color: '#DC2626' }}>{r.tag}</span>}
            </span>
            <span style={{ fontFamily: 'monospace', fontSize: 13.5, whiteSpace: 'nowrap' }}>{chg(r.change)}</span>
          </div>
        ))}
      </div>
      {movers.note && <div className="kmp-box-note">{movers.note}</div>}
    </section>
  )
}

// ── The Setup — 강세/약세 팩트 원장 + 다음 세션 관전 포인트 (조언 아님, 판단 재료) ──
function SetupBox({ setup }) {
  const bull = setup.bull || []
  const bear = setup.bear || []
  const watch = setup.watch || []
  return (
    <section id="the-setup" className="kmp-box kmp-reveal kmp-sec" style={{ marginTop: 30 }}>
      <div className="kmp-box-hd">
        <span>{setup.title || 'The Setup'}</span>
        {setup.when && <span className="kmp-box-when">{setup.when}</span>}
      </div>
      {setup.subtitle && <div className="kmp-box-sub">{setup.subtitle}</div>}
      <div className="kmp-two" style={{ marginTop: 6 }}>
        <div className="kmp-flowcol">
          <h4 style={{ color: '#047857' }}>{setup.bull_title || 'The Case for Strength'}</h4>
          {bull.map((t, i) => (<div key={i} className="kmp-setup-li kmp-setup-bull">{t}</div>))}
        </div>
        <div className="kmp-flowcol">
          <h4 style={{ color: '#DC2626' }}>{setup.bear_title || 'The Case for Caution'}</h4>
          {bear.map((t, i) => (<div key={i} className="kmp-setup-li kmp-setup-bear">{t}</div>))}
        </div>
      </div>
      {watch.length > 0 && (
        <div style={{ borderTop: '1px solid #18181B', padding: '13px 16px 6px' }}>
          <h4 style={{ margin: '0 0 11px', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#71717A', fontWeight: 700 }}>
            {setup.watch_title || 'What to Watch Next Session'}
          </h4>
          {watch.map((w, i) => (
            <div key={i} className="kmp-watch-item">
              <span className="kmp-watch-lbl">{w.label}</span>
              {w.detail && <span className="kmp-watch-detail">{w.detail}</span>}
            </div>
          ))}
        </div>
      )}
      {setup.note && <div className="kmp-box-note">{setup.note}</div>}
    </section>
  )
}

// ── On the Wire — 일정/공시 데이트라인 리스트 ──
function CalendarBox({ calendar }) {
  return (
    <section className="kmp-box kmp-reveal" style={{ marginTop: 30 }}>
      <div className="kmp-box-hd"><span>{calendar.title || 'On the Wire'}</span></div>
      <div style={{ padding: '4px 16px 10px' }}>
        {calendar.items.map((it, i) => (
          <div key={i} className="kmp-cal-item">
            <span className="kmp-cal-date">{it.date}</span>
            <span className="kmp-cal-lbl">{it.label}{it.tag && <span className="kmp-cal-tag"> · {it.tag}</span>}</span>
          </div>
        ))}
      </div>
      {calendar.note && <div className="kmp-box-note">{calendar.note}</div>}
    </section>
  )
}

// ── 단락 + 한국어 번역 토글 ──
// ko가 있으면 "한국어 ▾" 토글을 달아 해당 단락의 국문 번역을 인라인으로 펼친다.
function Para({ text, ko, pClassName = '', pStyle }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="kmp-para">
      <p className={pClassName} style={pStyle}>{text}</p>
      {ko && (
        <>
          <button
            type="button"
            className="kmp-ko-toggle"
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
          >
            한국어 <span className="kmp-ko-caret" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
          </button>
          {open && <p className="kmp-ko-body">{ko}</p>}
        </>
      )}
    </div>
  )
}

// ── 발행일 네비게이터 — 이전/다음 화살표 + 날짜 드롭다운(아카이브) ──
function IssueNavigator({ archive, currentDate, onGo }) {
  const [open, setOpen] = useState(false)
  // archive는 최신순. 현재 인덱스 기준 이전(과거)=idx+1, 다음(최신)=idx-1
  const idx = archive.findIndex(a => a.date === currentDate)
  const cur = idx >= 0 ? archive[idx] : archive[0]
  const older = idx >= 0 && idx < archive.length - 1 ? archive[idx + 1] : null
  const newer = idx > 0 ? archive[idx - 1] : null

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [open])

  const go = (d) => { setOpen(false); if (d) onGo(d) }

  return (
    <div className="kmp-issuenav" onClick={(e) => e.stopPropagation()}>
      <button className="kmp-issuenav-btn" disabled={!older} onClick={() => go(older?.date)}>‹ Prev</button>
      <div style={{ position: 'relative' }}>
        <button className="kmp-issuenav-cur" onClick={() => setOpen(o => !o)} aria-expanded={open}>
          {fmtDateShort(cur?.date)} <span style={{ fontSize: 9, color: '#A1A1AA' }}>▾</span>
        </button>
        {open && (
          <div className="kmp-issuenav-menu">
            {archive.map((a) => (
              <button
                key={a.date}
                className={`kmp-issuenav-item${a.date === cur?.date ? ' kmp-on' : ''}`}
                onClick={() => go(a.date)}
              >
                <span className="kmp-issuenav-d">{fmtDateShort(a.date)}</span>
                {a.headline && <span className="kmp-issuenav-h">{a.headline}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="kmp-issuenav-btn" disabled={!newer} onClick={() => go(newer?.date)}>Next ›</button>
    </div>
  )
}

function fmtDateShort(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return dateStr }
}

function slug(s) {
  return (s == null ? '' : String(s)).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function fmtDate(dateStr, weekday) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr + 'T00:00:00')
    const s = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    return weekday ? `${weekday}, ${s}` : s
  } catch { return dateStr }
}

function Skeleton() {
  return (
    <div style={{ padding: '40px 0' }}>
      {[80, 100, 60, 92, 70, 88].map((w, i) => (
        <div key={i} style={{ height: 18, width: `${w}%`, background: '#F4F4F5', borderRadius: 3, margin: '0 0 14px' }} />
      ))}
    </div>
  )
}

function ComingSoon({ navigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '70px 20px' }}>
      <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 12 }}>The presses are warming up.</div>
      <p style={{ fontSize: 16, color: '#52525B', lineHeight: 1.6, maxWidth: 460, margin: '0 auto 24px' }}>
        Today's edition of Korea Market Press has not been published yet. Check back for the daily Samsung &amp; SK Hynix brief.
      </p>
      <button onClick={() => navigate('/')} style={{
        border: '1px solid #18181B', background: 'transparent', padding: '10px 20px',
        fontFamily: SERIF, fontSize: 14, cursor: 'pointer',
      }}>← Back to DART Insight</button>
    </div>
  )
}

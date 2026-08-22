import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API, secretHeaders } from '../lib/api'
import { MarkdownBody } from './BriefingPage'
import { isAdmin } from './AdminPage'
import PickScorecard from './PickScorecard'
import PaperTrading from './PaperTrading'

const GRADE_COLOR = { S: '#E8364E', A: '#0D9488', B: '#6B7280', D: '#DC2626' }

// DART 픽 접근 권한 — __관리자 전용__ (2026-08-22)
//
// 픽은 유료 정보 서비스 상품이 아니다. __자산운용을 위한 내부 도구__다(사용자 결정).
// 그래서 판매도 하지 않고, 구독자에게도 열지 않는다 — 예전의 premium 플래그 분기를
// 뗐다. 남겨두면 "구독하면 열리는 것"으로 읽혀 상품 경계가 흐려진다.
//
// 판매하지 않는 판단은 데이터와도 정합적이다: 알파 초과중앙 +0.49%(p=1.000),
// 위약 대조군 p=0.363. __성과를 약속할 수 없는 것을 팔지 않는다.__
// 화면 자체는 매일 픽 세션이 쓰므로 라우트·API·로직은 전부 그대로 둔다.
function hasPickAccess() {
  return isAdmin()
}

export default function DartPickPage() {
  const { colors, dark } = useTheme()
  const navigate = useNavigate()
  const [pick, setPick] = useState(null)
  const [extraPicks, setExtraPicks] = useState([])
  const [noPick, setNoPick] = useState(false)
  // 결측(파이프라인 미실행) — "분석했고 임계 미달"인 noPick과 의미가 정반대다
  const [unrecorded, setUnrecorded] = useState(false)
  const [degraded, setDegraded] = useState(false)
  const [degradedReason, setDegradedReason] = useState('')
  const [note, setNote] = useState('')
  const [archive, setArchive] = useState([])
  const [scores, setScores] = useState(null)
  const [paper, setPaper] = useState(null)
  const [loading, setLoading] = useState(true)
  const allowed = hasPickAccess()

  useEffect(() => {
    if (!allowed) return
    Promise.all([
      fetch(`${API}/api/pick/today`, { headers: secretHeaders() }).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/pick/list`, { headers: secretHeaders() }).then(r => r.json()).catch(() => null),
    ])
      .then(([today, list]) => {
        // 신 스키마(picks[]) 우선, 구 스키마(flat/pick) 하위호환
        const picks = (today && Array.isArray(today.picks) && today.picks.length)
          ? today.picks
          : (today && today.corp_name ? [today] : (today && today.pick ? [today.pick] : []))
        setPick(picks[0] || null)
        setExtraPicks(picks.slice(1))
        setNoPick(!!(today && today.no_pick))
        setUnrecorded(!!(today && today.unrecorded))
        // 픽 상태는 세 가지다: no_pick(임계 미달·유효 표본) / degraded(필수 시그널
        // 소스가 죽어 있었음) / unrecorded(미실행). degraded 를 안 보여주면
        // 결손된 후보 풀에서 고른 픽이 __정상 픽처럼 읽힌다.__
        setDegraded(!!(today && today.degraded))
        setDegradedReason((today && today.degraded_reason) || '')
        setNote((today && today.note) || '')
        const all = (list && Array.isArray(list.picks)) ? list.picks : []
        // 오늘(featured) 픽과 같은 날짜는 아카이브에서 제외
        const headDate = picks[0]?.date
        const rest = headDate ? all.filter(it => it.date !== headDate) : all
        setArchive(rest)
      })
      .finally(() => setLoading(false))
    // DART 픽 성적표 — 선정 후 시세 추적 + 요인 분해 (키움 실측)
    fetch(`${API}/api/pick/feedback`, { headers: secretHeaders() }).then(r => r.json())
      .then(d => setScores(d && Array.isArray(d.picks) ? d : null))
      .catch(() => setScores(null))
    // 페이퍼 트레이딩 원장 — 1,000만원 가상매매 트랙레코드
    fetch(`${API}/api/pick/paper`, { headers: secretHeaders() }).then(r => r.json())
      .then(d => setPaper(d && Array.isArray(d.positions) && d.positions.length ? d : null))
      .catch(() => setPaper(null))
  }, [])

  const lineSep = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
  const accent = '#DC2626'

  if (!allowed) return <PickPremiumGate dark={dark} colors={colors} navigate={navigate} />

  return (
    <div className="page-enter" style={{
      maxWidth: 720, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>
      {/* 헤더 */}
      <div className="bp-pad" style={{ paddingTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 800, color: '#fff', background: accent,
            padding: '3px 8px', borderRadius: 6, letterSpacing: '0.04em',
          }}>DART 픽</span>
          <span style={{ fontSize: 13, color: colors.textMuted }}>매일 아침, 단 하나의 상승 시그널 종목</span>
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 8, lineHeight: 1.6 }}>
          800여 건 공시 + 미국 AI 섹터를 한 깔때기에 넣어 <b style={{ color: colors.textSecondary }}>단 하나</b>로 좁힙니다.
        </div>
      </div>

      <div className="bp-pad">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '24px 0' }}>
            {[70, 100, 55, 90].map((w, i) => (
              <div key={i} style={{
                height: 16, width: `${w}%`, borderRadius: 8,
                background: dark ? '#1A1A1E' : '#F4F4F5',
                animation: 'pulse 1.4s ease-in-out infinite',
              }} />
            ))}
          </div>
        ) : !pick ? (
          unrecorded
            ? <UnrecordedState colors={colors} note={note} lineSep={lineSep} dark={dark} />
            : noPick
              ? <NoPickState colors={colors} note={note} lineSep={lineSep} dark={dark} />
              : <EmptyState colors={colors} />
        ) : (
          <div>
            {degraded && (
              <div style={{
                margin: '14px 0 2px', padding: '11px 13px', borderRadius: 10,
                border: `1px solid ${dark ? 'rgba(217,119,6,0.35)' : '#FDE68A'}`,
                background: dark ? 'rgba(217,119,6,0.10)' : '#FFFBEB',
              }}>
                <div style={{
                  fontSize: 12, fontWeight: 800, marginBottom: 4,
                  color: dark ? '#FBBF24' : '#B45309',
                }}>
                  신호 소스 일부가 수집되지 않은 날입니다
                </div>
                <div style={{ fontSize: 11, lineHeight: 1.65, color: colors.textMuted }}>
                  {degradedReason || '거래소 소수계좌·투자경고 데이터를 확보하지 못했습니다.'}
                  {' '}아래 픽은 DART 공시만으로 골랐으며, 성적표 집계에서는 제외됩니다.
                </div>
              </div>
            )}
            {extraPicks.length > 0 && (
              <div style={{
                fontSize: 12, color: colors.textMuted, marginTop: 18, marginBottom: -6,
              }}>
                오늘은 강한 신호가 <b style={{ color: '#DC2626' }}>{extraPicks.length + 1}종</b> 나왔어요. 대표 픽부터 봅니다.
              </div>
            )}
            {/* 종목 헤더 카드 */}
            <div style={{
              marginTop: 20, padding: '18px 18px',
              borderRadius: 16, border: `1px solid ${lineSep}`,
              background: dark ? '#1416' : '#FFF',
              boxShadow: dark ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                {pick.grade && (
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: '#fff',
                    background: GRADE_COLOR[pick.grade] || '#6B7280',
                    padding: '2px 7px', borderRadius: 5,
                  }}>{pick.grade}</span>
                )}
                <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono }}>{pick.date}</span>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5 }}>
                {pick.corp_name}
                <span style={{ fontSize: 14, color: colors.textMuted, fontWeight: 600, marginLeft: 8, fontFamily: FONTS.mono }}>
                  {pick.stock_code}
                </span>
              </div>

              {/* 강도 미터 — score/factors를 한눈에 (본문 점수 산문의 시각 요약) */}
              {typeof pick.score === 'number' && (
                <StrengthMeter score={pick.score} colors={colors} dark={dark} accent={accent} />
              )}

              {/* 요인 칩 — 신호유형·밸류·테마·위치 */}
              {pick.factors && (
                <FactorChips factors={pick.factors} colors={colors} dark={dark} accent={accent} />
              )}

              {pick.reason && (
                <div style={{
                  fontSize: 14, color: colors.textSecondary, marginTop: 12, lineHeight: 1.6,
                  paddingTop: 12, borderTop: `1px solid ${lineSep}`,
                }}>
                  {pick.reason}
                </div>
              )}
            </div>

            {/* 본문 (선정 깔때기) */}
            {pick.detail && (
              <div style={{ padding: '12px 0 8px' }}>
                <MarkdownBody content={pick.detail} colors={colors} dark={dark} />
              </div>
            )}

            {/* 함께 고른 강신호 (보조 픽) */}
            {extraPicks.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{
                  fontSize: 13, fontWeight: 800, color: colors.textSecondary,
                  paddingTop: 16, borderTop: `1px solid ${lineSep}`, marginBottom: 4,
                }}>
                  함께 고른 강신호
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12 }}>
                  대표 픽만큼 신호가 강해 같은 날 함께 담은 종목입니다.
                </div>
                {extraPicks.map((ep, i) => (
                  <SecondaryPick key={`${ep.date}-${ep.stock_code}-${i}`} p={ep} colors={colors} dark={dark} lineSep={lineSep} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* DART 픽 성적표 — 선정 후 시세 추적 + 요인 분해 */}
        {scores && scores.picks && scores.picks.length > 0 && (
          <PickScorecard data={scores} colors={colors} dark={dark} lineSep={lineSep} defaultOpen={true} />
        )}

        {/* 페이퍼 트레이딩 — 1,000만원 가상매매 트랙레코드 */}
        {paper && (
          <PaperTrading data={paper} colors={colors} dark={dark} lineSep={lineSep} defaultOpen={false} />
        )}

        {/* 지난 픽 아카이브 */}
        {!loading && archive.length > 0 && (
          <div style={{ marginTop: 28 }}>
            <div style={{
              fontSize: 13, fontWeight: 800, color: colors.textSecondary,
              letterSpacing: '0.02em', marginBottom: 4, paddingTop: 16,
              borderTop: `1px solid ${lineSep}`,
            }}>
              지난 픽
            </div>
            <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12 }}>
              날짜를 누르면 그날의 선정 깔때기를 펼쳐 봅니다.
            </div>
            {archive.map(item => (
              <ArchiveItem key={item.date} item={item} colors={colors} dark={dark} lineSep={lineSep} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 강도 미터 — 강도 점수를 임계(6점) 대비 막대로 시각화 (본문 점수 산문의 요약)
const STRENGTH_MAX = 12
function StrengthMeter({ score, colors, dark, accent }) {
  const pct = Math.max(0, Math.min(1, score / STRENGTH_MAX)) * 100
  const threshPct = (6 / STRENGTH_MAX) * 100
  const pass = score >= 6
  const band = score >= 9 ? '강력' : score >= 7 ? '뚜렷' : pass ? '임계 통과' : '임계 미달'
  const track = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: colors.textMuted, letterSpacing: '0.03em' }}>선정 강도</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: accent, fontFamily: FONTS.mono, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>/ 임계 6</span>
        <span style={{
          marginLeft: 'auto', fontSize: 10.5, fontWeight: 700, color: accent,
          background: dark ? 'rgba(220,38,38,0.14)' : 'rgba(220,38,38,0.07)',
          padding: '2px 8px', borderRadius: 20,
        }}>{band}</span>
      </div>
      <div style={{ position: 'relative', height: 7, borderRadius: 20, background: track, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, width: `${pct}%`, borderRadius: 20,
          background: `linear-gradient(90deg, ${accent}CC, ${accent})`,
          transition: 'width .4s ease',
        }} />
      </div>
      {/* 임계선(6점) 마커 */}
      <div style={{ position: 'relative', height: 0 }}>
        <div style={{
          position: 'absolute', left: `${threshPct}%`, top: -7, width: 1.5, height: 7,
          background: dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.32)',
        }} />
      </div>
    </div>
  )
}

// 요인 칩 — factors를 간결한 태그로 (신호유형·밸류·테마·AI)
function FactorChips({ factors, colors, dark, accent }) {
  const f = factors || {}
  const chips = []
  if (f.signal_type) {
    chips.push({ label: f.repeat ? `${f.signal_type} ${f.repeat}회` : f.signal_type, strong: true })
  }
  if (f.is_ai) chips.push({ label: 'AI 밸류체인 1차', strong: true })
  if (f.theme) chips.push({ label: f.theme })
  if (typeof f.pbr === 'number') {
    chips.push({ label: `PBR ${f.pbr}` })
  } else if (f.pbr_band) {
    chips.push({ label: `PBR ${f.pbr_band}` })
  }
  if (!chips.length) return null
  const base = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
      {chips.map((c, i) => (
        <span key={i} style={{
          fontSize: 11.5, fontWeight: c.strong ? 700 : 600,
          color: c.strong ? accent : colors.textSecondary,
          background: c.strong ? (dark ? 'rgba(220,38,38,0.13)' : 'rgba(220,38,38,0.06)') : base,
          padding: '4px 10px', borderRadius: 8, letterSpacing: '0.01em',
        }}>{c.label}</span>
      ))}
    </div>
  )
}

function ArchiveItem({ item, colors, dark, lineSep }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderRadius: 12, border: `1px solid ${lineSep}`,
      background: dark ? '#141416' : '#FFF', marginBottom: 8, overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 14px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        {item.grade && (
          <span style={{
            fontSize: 10, fontWeight: 800, color: '#fff',
            background: GRADE_COLOR[item.grade] || '#6B7280',
            padding: '2px 6px', borderRadius: 4, flexShrink: 0,
          }}>{item.grade}</span>
        )}
        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono, flexShrink: 0 }}>{item.date}</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary, flexShrink: 0 }}>{item.corp_name}</span>
        {item.reason && (
          <span style={{
            fontSize: 12, color: colors.textMuted, marginLeft: 4,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{item.reason}</span>
        )}
        <span style={{
          marginLeft: 'auto', fontSize: 12, color: colors.textMuted, flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s',
        }}>▾</span>
      </button>
      {open && item.detail && (
        <div style={{ padding: '0 14px 16px', borderTop: `1px solid ${lineSep}` }}>
          <MarkdownBody content={item.detail} colors={colors} dark={dark} />
        </div>
      )}
    </div>
  )
}

// 비공개 안내 — DART 픽은 판매 상품이 아니라 내부 자산운용 도구다.
// 페이월(=돈 내면 열림)이 아니라 __비공개__라고 정확히 말해야 한다.
// 여기서 구독을 권하면 팔지 않기로 한 것을 파는 셈이 된다.
function PickPremiumGate({ dark, colors, navigate }) {
  const lineSep = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  return (
    <div className="page-enter" style={{
      maxWidth: 520, margin: '0 auto', padding: '80px 24px 120px',
      fontFamily: FONTS.body, textAlign: 'center',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h1 style={{
        fontSize: 20, fontWeight: 800, fontFamily: FONTS.serif, color: colors.textPrimary,
        margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.4,
      }}>
        비공개 페이지입니다
      </h1>
      <p style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.75, margin: '0 auto 28px', maxWidth: 380 }}>
        DART 픽은 자체 자산운용에 쓰는 내부 도구라
        구독 상품에 포함되지 않습니다.
      </p>

      <button onClick={() => navigate('/briefing')} style={{
        width: '100%', maxWidth: 300, padding: '13px', borderRadius: 10, border: 'none',
        background: colors.textPrimary, color: dark ? '#0A0A0B' : '#fff',
        fontSize: 14.5, fontWeight: 700, cursor: 'pointer', fontFamily: FONTS.body,
      }}>
        오늘의 브리핑 보러 가기
      </button>

      <div style={{
        marginTop: 32, paddingTop: 20, borderTop: `1px solid ${lineSep}`,
        fontSize: 12, color: colors.textMuted, lineHeight: 1.7,
      }}>
        구독 상품은 오늘의 공시 · 브리핑 · 미국장 브리핑 3종입니다.
      </div>
    </div>
  )
}

// 보조 픽 카드 — 대표 픽 아래 접이식(선정 깔때기 detail 포함)
function SecondaryPick({ p, colors, dark, lineSep }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      borderRadius: 14, border: `1px solid ${lineSep}`,
      background: dark ? '#141416' : '#FFF', marginBottom: 10, overflow: 'hidden',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '14px 16px', background: 'transparent', border: 'none',
        cursor: 'pointer', textAlign: 'left',
      }}>
        <span style={{
          fontSize: 10, fontWeight: 800, color: '#fff', background: '#6B7280',
          padding: '2px 6px', borderRadius: 4, flexShrink: 0,
        }}>보조</span>
        <span style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, flexShrink: 0 }}>{p.corp_name}</span>
        <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono, flexShrink: 0 }}>{p.stock_code}</span>
        {typeof p.score === 'number' && (
          <span style={{
            fontSize: 11, fontWeight: 700, color: '#DC2626', fontFamily: FONTS.mono,
            background: dark ? 'rgba(220,38,38,0.13)' : 'rgba(220,38,38,0.06)',
            padding: '2px 7px', borderRadius: 6, flexShrink: 0,
          }}>강도 {p.score}</span>
        )}
        {p.detail && (
          <span style={{
            marginLeft: 'auto', fontSize: 12, color: colors.textMuted, flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s',
          }}>▾</span>
        )}
      </button>
      {p.reason && (
        <div style={{ padding: '0 16px 14px', fontSize: 13.5, color: colors.textSecondary, lineHeight: 1.6 }}>
          {p.reason}
        </div>
      )}
      {open && p.detail && (
        <div style={{ padding: '0 16px 16px', borderTop: `1px solid ${lineSep}` }}>
          <MarkdownBody content={p.detail} colors={colors} dark={dark} />
        </div>
      )}
    </div>
  )
}

// 강도 미달 → 픽 없음 (억지 픽 금지)
function NoPickState({ colors, note, lineSep, dark }) {
  return (
    <div style={{
      marginTop: 20, padding: '28px 20px', textAlign: 'center',
      borderRadius: 16, border: `1px dashed ${lineSep}`,
      background: dark ? '#141416' : '#FAFAFA',
    }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, marginBottom: 8 }}>
        오늘은 픽이 없습니다
      </div>
      <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.7, maxWidth: 420, margin: '0 auto' }}>
        {note || '기준 강도를 넘는 상승 시그널이 없어, 억지로 종목을 고르지 않았습니다. 신호가 약한 날은 쉬는 것도 전략입니다.'}
      </div>
    </div>
  )
}

// 파이프라인 미실행 → 결측. "분석했는데 미달"이 아니라 "그날은 분석 자체를 안 했다"는 뜻.
// 사후에 결과를 보고 채우면 look-ahead bias라 비워둔 채로 정직하게 표기한다.
function UnrecordedState({ colors, note, lineSep, dark }) {
  return (
    <div style={{
      marginTop: 20, padding: '28px 20px', textAlign: 'center',
      borderRadius: 16, border: `1px dashed ${lineSep}`,
      background: dark ? '#141416' : '#FAFAFA',
    }}>
      <div style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, marginBottom: 8 }}>
        이 날은 픽 기록이 없습니다
      </div>
      <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.7, maxWidth: 440, margin: '0 auto' }}>
        선정 파이프라인이 실행되지 않은 <b style={{ color: colors.textSecondary }}>결측</b>일입니다.
        강도가 미달이라 쉬어간 날과는 다릅니다. 지나간 날을 결과를 보고 채우면
        성적이 부풀려지기 때문에, <b style={{ color: colors.textSecondary }}>비워둔 채로 남깁니다.</b>
      </div>
      {note && (
        <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.6, marginTop: 12, opacity: 0.8 }}>
          {note}
        </div>
      )}
    </div>
  )
}

function EmptyState({ colors }) {
  return (
    <div style={{ padding: '60px 0', textAlign: 'center' }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
        오늘의 픽이 아직 없어요
      </div>
      <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>
        매일 아침, 공시·미국 시그널을 종합한 상승 시그널 종목을 선정합니다.
      </div>
    </div>
  )
}

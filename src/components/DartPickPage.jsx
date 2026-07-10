import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'
import { MarkdownBody } from './BriefingPage'
import { isAdmin } from './AdminPage'
import PickScorecard from './PickScorecard'
import PaperTrading from './PaperTrading'

const GRADE_COLOR = { S: '#E8364E', A: '#0D9488', B: '#6B7280', D: '#DC2626' }

// 프리미엄 권한 판정: 관리자 또는 로그인 사용자의 premium 플래그
function hasPickAccess() {
  if (isAdmin()) return true
  try { return !!JSON.parse(localStorage.getItem('dart_user'))?.premium } catch { return false }
}

export default function DartPickPage() {
  const { colors, dark } = useTheme()
  const navigate = useNavigate()
  const [pick, setPick] = useState(null)
  const [extraPicks, setExtraPicks] = useState([])
  const [noPick, setNoPick] = useState(false)
  const [note, setNote] = useState('')
  const [archive, setArchive] = useState([])
  const [scores, setScores] = useState(null)
  const [paper, setPaper] = useState(null)
  const [loading, setLoading] = useState(true)
  const allowed = hasPickAccess()

  useEffect(() => {
    if (!allowed) return
    Promise.all([
      fetch(`${API}/api/pick/today`).then(r => r.json()).catch(() => null),
      fetch(`${API}/api/pick/list`).then(r => r.json()).catch(() => null),
    ])
      .then(([today, list]) => {
        // 신 스키마(picks[]) 우선, 구 스키마(flat/pick) 하위호환
        const picks = (today && Array.isArray(today.picks) && today.picks.length)
          ? today.picks
          : (today && today.corp_name ? [today] : (today && today.pick ? [today.pick] : []))
        setPick(picks[0] || null)
        setExtraPicks(picks.slice(1))
        setNoPick(!!(today && today.no_pick))
        setNote((today && today.note) || '')
        const all = (list && Array.isArray(list.picks)) ? list.picks : []
        // 오늘(featured) 픽과 같은 날짜는 아카이브에서 제외
        const headDate = picks[0]?.date
        const rest = headDate ? all.filter(it => it.date !== headDate) : all
        setArchive(rest)
      })
      .finally(() => setLoading(false))
    // DART 픽 성적표 — 선정 후 시세 추적 + 요인 분해 (키움 실측)
    fetch(`${API}/api/pick/feedback`).then(r => r.json())
      .then(d => setScores(d && Array.isArray(d.picks) ? d : null))
      .catch(() => setScores(null))
    // 페이퍼 트레이딩 원장 — 1,000만원 가상매매 트랙레코드
    fetch(`${API}/api/pick/paper`).then(r => r.json())
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
          noPick ? <NoPickState colors={colors} note={note} lineSep={lineSep} dark={dark} /> : <EmptyState colors={colors} />
        ) : (
          <div>
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

// 프리미엄 페이월 — DART 픽은 유료 전용. 결제 연동 전까지 문의로 전환.
function PickPremiumGate({ dark, colors, navigate }) {
  const accent = '#DC2626'
  const lineSep = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  return (
    <div className="page-enter" style={{
      maxWidth: 560, margin: '0 auto', padding: '64px 24px 120px',
      fontFamily: FONTS.body, textAlign: 'center',
    }}>
      {/* 자물쇠 + 과녁 */}
      <div style={{
        width: 64, height: 64, borderRadius: 18, margin: '0 auto 22px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: dark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.07)',
      }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <span style={{
          fontSize: 11, fontWeight: 800, color: '#fff', background: accent,
          padding: '3px 8px', borderRadius: 6, letterSpacing: '0.04em',
        }}>DART 픽</span>
        <span style={{
          fontSize: 11, fontWeight: 800, color: accent, letterSpacing: '0.08em',
          background: dark ? 'rgba(220,38,38,0.14)' : 'rgba(220,38,38,0.08)',
          padding: '3px 8px', borderRadius: 6,
        }}>PREMIUM</span>
      </div>

      <h1 style={{
        fontSize: 24, fontWeight: 800, fontFamily: FONTS.serif, color: colors.textPrimary,
        margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.3,
      }}>
        매일 아침, 단 하나의 상승 시그널 종목
      </h1>
      <p style={{ fontSize: 15, color: colors.textMuted, lineHeight: 1.7, margin: '0 auto 8px', maxWidth: 400 }}>
        800여 건의 공시와 미국 AI 섹터 흐름을 하나의 깔때기에 넣어
        <b style={{ color: colors.textSecondary }}> 단 하나의 종목</b>으로 좁혀 드립니다.
      </p>
      <p style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.7, margin: '0 auto 28px', maxWidth: 400 }}>
        공시 브리핑과 미국장 브리핑은 무료로 열려 있어요.<br />
        <b style={{ color: colors.textSecondary }}>DART 픽</b>은 프리미엄 전용입니다.
      </p>

      <button onClick={() => navigate('/inquiry?type=premium')} style={{
        width: '100%', maxWidth: 320, padding: '14px', borderRadius: 12, border: 'none',
        background: accent, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer',
      }}>
        프리미엄 문의하기
      </button>
      <div style={{ marginTop: 14 }}>
        <button onClick={() => navigate('/premium')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, color: colors.textMuted, textDecoration: 'underline',
        }}>
          프리미엄 안내 보기 →
        </button>
      </div>

      <div style={{
        marginTop: 32, paddingTop: 20, borderTop: `1px solid ${lineSep}`,
        fontSize: 12, color: colors.textMuted, lineHeight: 1.7,
      }}>
        모든 시세·재무는 실제 API로 조회한 값만 사용합니다.<br />
        투자 참고 정보이며, 최종 판단과 책임은 본인에게 있습니다.
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

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useTheme } from '../contexts/ThemeContext'
import { API } from '../lib/api'
import { isAdmin } from './AdminPage'

// 책 전용 폰트 (Pretendard + Noto Serif KR — 둘 다 시스템에 폴백 가능)
const FONT_SERIF = '"Noto Serif KR", "Nanum Myeongjo", "Times New Roman", serif'
const FONT_SANS = 'Pretendard, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif'
const FONT_MONO = '"JetBrains Mono", "Fira Code", monospace'

const STATUS_LABEL = {
  planned: { text: '📝 예정', color: '#94a3b8' },
  drafting: { text: '✍️ 작성', color: '#f59e0b' },
  review: { text: '👀 검토', color: '#3b82f6' },
  final: { text: '✅ 완성', color: '#10b981' },
}

// 사이드바 폭(데스크탑/모바일)
const SIDEBAR_DESKTOP = 320
const READING_MAX = 760  // 책 본문 폭 — 한 줄 12~14단어

export default function BookViewer() {
  const { colors, dark } = useTheme()
  const navigate = useNavigate()
  const { partDir, chapterFile } = useParams()
  const [toc, setToc] = useState(null)
  const [chapter, setChapter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [chapterLoading, setChapterLoading] = useState(false)
  const [expandedParts, setExpandedParts] = useState({})
  const [search, setSearch] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)  // 모바일 사이드바 토글
  const [isMobile, setIsMobile] = useState(false)

  // 권한 체크
  useEffect(() => {
    if (!isAdmin()) navigate('/')
  }, [navigate])

  // 모바일 감지
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 목차 로드
  useEffect(() => {
    fetch(`${API}/api/admin/book/toc`)
      .then(r => r.json())
      .then(d => {
        setToc(d)
        if (partDir) {
          setExpandedParts({ [partDir]: true })
        } else if (d.parts?.length > 0) {
          // 표지 화면에서는 모든 파트 펼침 (요약 보기)
          const all = {}
          d.parts.forEach(p => { all[p.dir] = false })
          setExpandedParts(all)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  // 챕터 로드 + 스크롤 상단
  useEffect(() => {
    if (!partDir || !chapterFile) {
      setChapter(null)
      return
    }
    setChapterLoading(true)
    fetch(`${API}/api/admin/book/chapter?path=${encodeURIComponent(`${partDir}/${chapterFile}`)}`)
      .then(r => r.json())
      .then(d => {
        setChapter(d)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      })
      .catch(() => setChapter(null))
      .finally(() => setChapterLoading(false))
  }, [partDir, chapterFile])

  // 평탄화 챕터 리스트
  const flatChapters = useMemo(() => {
    if (!toc) return []
    const flat = []
    toc.parts?.forEach(p => {
      p.chapters?.forEach(c => flat.push({ ...c, partDir: p.dir, partTitle: p.title }))
    })
    return flat
  }, [toc])

  const currentIdx = useMemo(() => {
    if (!partDir || !chapterFile) return -1
    return flatChapters.findIndex(c => c.path === `${partDir}/${chapterFile}`)
  }, [partDir, chapterFile, flatChapters])

  const goToChapter = useCallback((path) => {
    const [pd, cf] = path.split('/')
    navigate(`/admin/book/${pd}/${cf}`)
    if (isMobile) setSidebarOpen(false)
  }, [navigate, isMobile])

  const togglePart = (dir) => {
    setExpandedParts(prev => ({ ...prev, [dir]: !prev[dir] }))
  }

  // 키보드 단축키 ← / → / Esc / /
  useEffect(() => {
    const onKey = (e) => {
      // 입력창 포커스 시 단축키 비활성
      const tag = e.target.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') {
        if (e.key === 'Escape') e.target.blur()
        return
      }
      if (e.key === '/') {
        e.preventDefault()
        const el = document.getElementById('book-search-input')
        if (el) el.focus()
        return
      }
      if (e.key === 'ArrowLeft' && currentIdx > 0) {
        goToChapter(flatChapters[currentIdx - 1].path)
      } else if (e.key === 'ArrowRight' && currentIdx >= 0 && currentIdx < flatChapters.length - 1) {
        goToChapter(flatChapters[currentIdx + 1].path)
      } else if (e.key === 'Escape' && isMobile) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIdx, flatChapters, goToChapter, isMobile])

  const filteredParts = useMemo(() => {
    if (!toc || !search.trim()) return toc?.parts || []
    const q = search.trim().toLowerCase()
    return toc.parts.map(p => ({
      ...p,
      chapters: p.chapters.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.num.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q)
      ),
    })).filter(p => p.chapters.length > 0)
  }, [toc, search])

  if (loading) {
    return <div style={{ padding: 60, textAlign: 'center', color: colors.textMuted, fontFamily: FONT_SANS }}>책을 펼치는 중…</div>
  }
  if (!toc) {
    return <div style={{ padding: 60, color: colors.danger, fontFamily: FONT_SANS }}>책 목차를 불러올 수 없습니다.</div>
  }

  const borderLight = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const bgSidebar = dark ? 'rgba(255,255,255,0.02)' : '#FAFAF7'
  const bgPage = dark ? colors.bgPrimary : '#FCFBF8'  // 따뜻한 종이 톤
  const bgActive = dark ? 'rgba(232,54,78,0.15)' : 'rgba(232,54,78,0.08)'
  const showCover = !chapter && !chapterLoading

  return (
    <>
      {/* 글로벌 책 스타일 + 인쇄 + 모바일 */}
      <style>{`
        .book-content { font-family: ${FONT_SANS}; }
        .book-content h1, .book-content h2, .book-content h3, .book-content h4 { font-family: ${FONT_SERIF}; letter-spacing: -0.5px; }
        .book-content .first-letter::first-letter {
          float: left; font-family: ${FONT_SERIF}; font-size: 3.6em; line-height: 1; font-weight: 700;
          margin-right: 8px; margin-top: 2px; color: #E8364E;
        }
        .book-md p { word-break: keep-all; overflow-wrap: break-word; }
        .book-md table { font-feature-settings: 'tnum'; }
        .book-table-wrap { position: relative; }
        .book-table-wrap::after {
          content: ''; position: absolute; top: 0; right: 0; bottom: 0; width: 24px;
          background: linear-gradient(to right, transparent, rgba(0,0,0,0.04));
          pointer-events: none; opacity: 0;
        }
        .book-table-wrap.scrollable::after { opacity: 1; }

        /* 태블릿 + 모바일 (≤1023px) */
        @media (max-width: 1023px) {
          .book-sidebar { position: fixed !important; left: 0; top: 0; height: 100vh; z-index: 100;
            transform: translateX(-100%); transition: transform 0.25s; box-shadow: 4px 0 24px rgba(0,0,0,0.15);
            max-width: 88vw; width: 320px; }
          .book-sidebar.open { transform: translateX(0); }
          .book-main { padding: 20px 16px !important; }
        }

        /* 모바일 (≤768px) */
        @media (max-width: 768px) {
          .book-main { padding: 16px 12px !important; }
          .book-md { font-size: 15px !important; line-height: 1.85 !important; }
          .book-md p { margin-bottom: 14px !important; }
          .book-md h1, .book-md h2 { font-size: 20px !important; margin-top: 28px !important; }
          .book-md h3 { font-size: 16px !important; margin-top: 22px !important; }
          .book-md h4 { font-size: 14px !important; }
          .book-md blockquote { padding: 12px 14px !important; margin: 16px 0 !important; font-size: 14px !important; }
          .book-md table { font-size: 12px !important; }
          .book-md th, .book-md td { padding: 7px 9px !important; }
          .book-md ul, .book-md ol { padding-left: 18px !important; }

          .book-chapter-header { margin-bottom: 32px !important; padding-bottom: 18px !important; }
          .book-chapter-header h1 { font-size: 24px !important; margin-bottom: 12px !important; letter-spacing: -0.5px !important; }
          .book-chapter-header .ch-label { font-size: 10px !important; letter-spacing: 2px !important; }
          .book-chapter-header .ch-critical { display: inline-block !important; margin-left: 0 !important; margin-top: 6px !important; }
          .book-chapter-header .ch-meta { font-size: 10px !important; gap: 8px !important; }

          .book-cover-section { padding: 32px 22px !important; margin-bottom: 28px !important; }
          .book-cover-title { font-size: 28px !important; letter-spacing: -0.5px !important; }
          .book-cover-sub { font-size: 14px !important; }
          .book-cover-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .book-cover-quote { padding: 18px 18px !important; font-size: 13.5px !important; line-height: 1.75 !important; }
          .book-cover-critical-num { font-size: 9px !important; }
          .book-cover-critical-title { font-size: 14px !important; }

          .book-nav { flex-direction: column !important; }
          .book-nav-btn { width: 100% !important; text-align: left !important; }

          .book-fab { width: 40px !important; height: 40px !important; top: 84px !important; }
        }

        @media print {
          .book-sidebar, .book-nav, .book-fab, .book-print-hide { display: none !important; }
          .book-main { max-width: 100% !important; padding: 0 !important; }
          .book-md { font-size: 12pt !important; line-height: 1.6 !important; }
          .book-chapter-header { page-break-after: avoid; }
          h1, h2, h3 { page-break-after: avoid; }
          table, blockquote, pre { page-break-inside: avoid; }
        }
      `}</style>

      <div style={{
        display: 'flex',
        maxWidth: 1400, margin: '0 auto',
        minHeight: 'calc(100vh - 80px)',
        backgroundColor: bgPage,
        fontFamily: FONT_SANS,
      }}>
        {/* 모바일 사이드바 백드롭 */}
        {isMobile && sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 99,
          }} />
        )}

        {/* 사이드바 */}
        <aside className={`book-sidebar ${sidebarOpen ? 'open' : ''}`} style={{
          width: SIDEBAR_DESKTOP, flexShrink: 0,
          borderRight: `1px solid ${borderLight}`,
          backgroundColor: bgSidebar,
          padding: '20px 0',
          position: 'sticky', top: 0,
          maxHeight: 'calc(100vh - 80px)',
          overflowY: 'auto',
        }}>
          {/* 헤더 */}
          <div style={{ padding: '0 20px 18px', borderBottom: `1px solid ${borderLight}` }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: colors.textMuted, letterSpacing: 2, marginBottom: 6 }}>
              DART INSIGHT BOOK · v0.3
            </div>
            <div onClick={() => navigate('/admin/book')} style={{
              fontFamily: FONT_SERIF, fontSize: 20, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.3,
              cursor: 'pointer', letterSpacing: -0.3,
            }}>
              소수계좌 시그널
            </div>
            <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 6, lineHeight: 1.5 }}>
              거래소의 단속에서 알파를 찾는다
            </div>

            {/* 진행률 */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}>
                <span>{toc.progress_pct || 0}% 완성</span>
                <span>{(toc.total_current / 10000).toFixed(1)}만 / {(toc.total_target / 10000).toFixed(0)}만자</span>
              </div>
              <div style={{ height: 4, backgroundColor: borderLight, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${toc.progress_pct || 0}%`,
                  background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                  transition: 'width 0.3s',
                }} />
              </div>
            </div>

            {/* 검색 */}
            <input
              id="book-search-input"
              type="text"
              placeholder="🔍 챕터 검색 ( / )"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                marginTop: 12, width: '100%', padding: '7px 10px',
                fontSize: 12, border: `1px solid ${borderLight}`,
                borderRadius: 6, backgroundColor: colors.bgPrimary,
                color: colors.textPrimary, outline: 'none',
                fontFamily: FONT_SANS,
              }}
            />
          </div>

          {/* 파트 트리 */}
          <nav style={{ padding: '8px 0' }}>
            {filteredParts.map(part => (
              <div key={part.dir} style={{ marginBottom: 2 }}>
                <button
                  onClick={() => togglePart(part.dir)}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '9px 20px', border: 'none',
                    backgroundColor: 'transparent',
                    color: colors.textPrimary,
                    fontSize: 12, fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    fontFamily: FONT_SERIF,
                  }}
                >
                  <span style={{ flex: 1, lineHeight: 1.4 }}>
                    <span style={{ marginRight: 7, fontSize: 9, color: colors.textMuted }}>
                      {expandedParts[part.dir] ? '▼' : '▶'}
                    </span>
                    {part.title}
                  </span>
                  <span style={{ fontSize: 10, color: colors.textMuted, fontWeight: 500, fontFamily: FONT_SANS }}>
                    {part.chapter_count}
                  </span>
                </button>

                {expandedParts[part.dir] && (
                  <div style={{ paddingLeft: 0 }}>
                    {part.chapters.map(ch => {
                      const isActive = ch.path === `${partDir}/${chapterFile}`
                      const statusInfo = STATUS_LABEL[ch.status] || STATUS_LABEL.planned
                      return (
                        <button
                          key={ch.path}
                          onClick={() => goToChapter(ch.path)}
                          style={{
                            width: '100%', textAlign: 'left',
                            padding: '7px 20px 7px 32px', border: 'none',
                            borderLeft: isActive ? '3px solid #E8364E' : '3px solid transparent',
                            backgroundColor: isActive ? bgActive : 'transparent',
                            color: isActive ? '#E8364E' : colors.textSecondary,
                            fontSize: 11, fontWeight: isActive ? 700 : 400,
                            cursor: 'pointer', lineHeight: 1.4,
                            fontFamily: FONT_SANS,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                            <span style={{ color: colors.textMuted, fontSize: 10, fontWeight: 700, minWidth: 32 }}>
                              {ch.num}
                            </span>
                            <span style={{ flex: 1 }}>
                              {ch.critical && <span style={{ color: '#E8364E', marginRight: 4 }}>★</span>}
                              {ch.title}
                            </span>
                          </div>
                          <div style={{ marginTop: 3, marginLeft: 38, fontSize: 9, color: statusInfo.color }}>
                            {statusInfo.text} · {ch.length_target?.toLocaleString() || 0}자
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* 단축키 안내 */}
          <div className="book-print-hide" style={{
            margin: '16px 20px 0', padding: '12px 14px',
            borderTop: `1px solid ${borderLight}`,
            fontSize: 10, color: colors.textMuted, lineHeight: 1.7,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>단축키</div>
            <div>← / → · 이전/다음 챕터</div>
            <div>/ · 검색 포커스</div>
            <div>Ctrl/⌘+P · 인쇄·PDF 저장</div>
          </div>
        </aside>

        {/* 모바일 사이드바 토글 버튼 */}
        {isMobile && !sidebarOpen && (
          <button onClick={() => setSidebarOpen(true)} className="book-fab" style={{
            position: 'fixed', top: 96, left: 12, zIndex: 50,
            width: 44, height: 44, borderRadius: 22,
            border: 'none', backgroundColor: '#E8364E', color: '#fff',
            fontSize: 18, cursor: 'pointer', boxShadow: '0 4px 12px rgba(232,54,78,0.4)',
          }}>≡</button>
        )}

        {/* 본문 */}
        <main className="book-main" style={{
          flex: 1, padding: '40px 60px',
          minWidth: 0,
        }}>
          <div style={{ maxWidth: READING_MAX, margin: '0 auto' }}>
            {showCover ? (
              <BookCover toc={toc} colors={colors} dark={dark} onJump={goToChapter} />
            ) : chapterLoading ? (
              <div style={{ padding: 60, textAlign: 'center', color: colors.textMuted, fontFamily: FONT_SERIF }}>
                챕터 펼치는 중…
              </div>
            ) : !chapter || chapter.error ? (
              <div style={{ padding: 60, color: colors.danger }}>
                챕터를 불러올 수 없습니다.
              </div>
            ) : (
              <ChapterView
                chapter={chapter}
                colors={colors}
                dark={dark}
                flatChapters={flatChapters}
                currentIdx={currentIdx}
                goToChapter={goToChapter}
              />
            )}
          </div>
        </main>
      </div>
    </>
  )
}

// ── 표지 (BookCover) ──
function BookCover({ toc, colors, dark, onJump }) {
  const critical = []
  toc.parts?.forEach(p => p.chapters?.forEach(c => c.critical && critical.push({ ...c, partTitle: p.title })))

  const bgGrad = dark
    ? 'linear-gradient(135deg, rgba(232,54,78,0.12) 0%, rgba(0,0,0,0) 60%)'
    : 'linear-gradient(135deg, rgba(232,54,78,0.06) 0%, rgba(255,255,255,0) 60%)'

  return (
    <div className="book-content" style={{ padding: '40px 0 80px' }}>
      {/* 표지 카드 */}
      <div className="book-cover-section" style={{
        padding: '56px 48px',
        borderRadius: 12,
        background: bgGrad,
        border: `1px solid ${dark ? 'rgba(232,54,78,0.2)' : 'rgba(232,54,78,0.15)'}`,
        marginBottom: 40,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: '#E8364E', letterSpacing: 3, marginBottom: 24 }}>
          DART INSIGHT BOOK · v0.3
        </div>
        <h1 className="book-cover-title" style={{
          fontFamily: FONT_SERIF, fontSize: 44, fontWeight: 800, lineHeight: 1.15,
          color: colors.textPrimary, margin: '0 0 18px', letterSpacing: -1,
        }}>
          소수계좌 시그널
        </h1>
        <div className="book-cover-sub" style={{
          fontFamily: FONT_SERIF, fontSize: 18, color: colors.textSecondary,
          marginBottom: 28, lineHeight: 1.5, fontWeight: 400,
        }}>
          거래소의 단속에서 알파를 찾는다
        </div>
        <div style={{
          fontSize: 12, color: colors.textMuted, letterSpacing: 1, paddingTop: 18,
          borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        }}>
          공시 × 차트 × 재무 입체 결합 모형 — 232종 3개월 실증
        </div>
      </div>

      {/* 핵심 명제 */}
      <div className="book-cover-quote" style={{
        padding: '24px 28px', borderRadius: 8,
        borderLeft: '4px solid #E8364E',
        backgroundColor: dark ? 'rgba(232,54,78,0.05)' : 'rgba(232,54,78,0.03)',
        marginBottom: 32, fontFamily: FONT_SERIF,
        fontSize: 15, color: colors.textPrimary, lineHeight: 1.85,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#E8364E', letterSpacing: 2, marginBottom: 10, fontFamily: FONT_SANS }}>
          핵심 명제
        </div>
        KIND 소수계좌 공시는 <strong>매집이 이미 끝난 후</strong>에 발표되는 본질적 후행 지표지만,
        그 한계를 인정한 위에서 <em>선행 진입</em>(재무 + 차트로 미리 1순위 잡기)과
        <em> 후행 진입</em>(에스컬레이션 따라가기)의 두 전략을 분리하면,
        차트 바닥권 + 거래량 동반 장대양봉 + PBR 가치권 + 흑자의 4중 결합에서
        정확한 매수 알파를 만들 수 있다.
      </div>

      {/* 통계 */}
      <div className="book-cover-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 40 }}>
        <Stat label="파트" value={toc.parts?.length || 0} colors={colors} dark={dark} />
        <Stat label="챕터" value={toc.total_chapters} colors={colors} dark={dark} />
        <Stat label="분량" value={`${(toc.total_target / 10000).toFixed(0)}만`} unit="자" colors={colors} dark={dark} />
        <Stat label="완성도" value={`${toc.progress_pct || 0}%`} colors={colors} dark={dark} highlight />
      </div>

      {/* ★ 결정적 챕터 빠른 진입 */}
      {critical.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontFamily: FONT_SERIF, fontSize: 18, fontWeight: 700, color: colors.textPrimary,
            marginBottom: 16, letterSpacing: -0.3,
          }}>
            ★ 결정적 챕터
          </div>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 16, lineHeight: 1.6 }}>
            책의 12개 파트 중 *어떤 경로*로 읽어도 반드시 만나게 되는 핵심 챕터입니다.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {critical.map(c => (
              <button
                key={c.path}
                onClick={() => onJump(c.path)}
                style={{
                  textAlign: 'left', padding: '14px 18px',
                  border: `1px solid ${dark ? 'rgba(232,54,78,0.3)' : 'rgba(232,54,78,0.2)'}`,
                  borderRadius: 8,
                  backgroundColor: dark ? 'rgba(232,54,78,0.06)' : 'rgba(232,54,78,0.03)',
                  cursor: 'pointer', fontFamily: FONT_SANS,
                }}
              >
                <div className="book-cover-critical-num" style={{ fontSize: 10, color: '#E8364E', fontWeight: 700, marginBottom: 4, letterSpacing: 1.5 }}>
                  ★ CHAPTER {c.num} · {c.partTitle}
                </div>
                <div className="book-cover-critical-title" style={{ fontFamily: FONT_SERIF, fontSize: 16, color: colors.textPrimary, fontWeight: 600 }}>
                  {c.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 들어가며 / 첫 챕터 진입 */}
      <div style={{
        padding: 24, borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        fontSize: 12, color: colors.textMuted, lineHeight: 1.8, textAlign: 'center',
      }}>
        좌측 목차에서 챕터를 선택하거나, 아래 *들어가며*부터 차근차근 시작하세요.<br/>
        <button onClick={() => onJump('00-preface/0-1-compression-philosophy.md')} style={{
          marginTop: 16, padding: '10px 24px', fontSize: 13, fontWeight: 600,
          fontFamily: FONT_SERIF, letterSpacing: -0.3,
          backgroundColor: '#E8364E', color: '#fff', border: 'none', borderRadius: 6,
          cursor: 'pointer',
        }}>책 처음부터 읽기 →</button>
      </div>
    </div>
  )
}

function Stat({ label, value, unit, colors, dark, highlight }) {
  return (
    <div style={{
      padding: '16px 14px',
      backgroundColor: highlight
        ? (dark ? 'rgba(232,54,78,0.1)' : 'rgba(232,54,78,0.06)')
        : (dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
      borderRadius: 8, textAlign: 'center',
      border: `1px solid ${highlight ? 'rgba(232,54,78,0.2)' : 'transparent'}`,
    }}>
      <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 6, fontWeight: 600, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontFamily: FONT_SERIF, fontSize: 22, color: highlight ? '#E8364E' : colors.textPrimary, fontWeight: 800 }}>
        {value}{unit && <span style={{ fontSize: 13, marginLeft: 2 }}>{unit}</span>}
      </div>
    </div>
  )
}

// ── 챕터 본문 (ChapterView) ──
function ChapterView({ chapter, colors, dark, flatChapters, currentIdx, goToChapter }) {
  const meta = chapter.meta || {}
  const statusInfo = STATUS_LABEL[meta.status] || STATUS_LABEL.planned
  const isCritical = (meta.critical || '').toLowerCase() === 'true'
  const prev = currentIdx > 0 ? flatChapters[currentIdx - 1] : null
  const next = currentIdx >= 0 && currentIdx < flatChapters.length - 1 ? flatChapters[currentIdx + 1] : null
  const borderLight = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'

  // 본문에서 첫 H1과 본문 분리 (frontmatter는 백엔드에서 이미 제거됨)
  // 본문 시작 부분의 `# X.Y 제목`을 책 헤더로 대체하고 나머지 본문 렌더링
  let body = chapter.body || ''
  const h1Match = body.match(/^#\s+(.+?)\n/)
  if (h1Match) {
    body = body.slice(h1Match[0].length).trim()
  }

  return (
    <article className="book-content" style={{ paddingBottom: 80 }}>
      {/* 챕터 헤더 — 책 페이지처럼 */}
      <header className="book-chapter-header" style={{ marginBottom: 48, paddingBottom: 28, borderBottom: `2px solid ${borderLight}` }}>
        <div className="ch-label" style={{
          fontSize: 11, fontWeight: 700, color: '#E8364E', letterSpacing: 4, marginBottom: 12,
          fontFamily: FONT_SANS,
        }}>
          CHAPTER {meta.chapter}
        </div>
        <h1 style={{
          fontFamily: FONT_SERIF, fontSize: 36, fontWeight: 800, lineHeight: 1.2,
          color: colors.textPrimary, margin: '0 0 16px', letterSpacing: -1,
        }}>
          {meta.title}
          {isCritical && (
            <span className="ch-critical" style={{
              display: 'inline-block', marginLeft: 12, fontSize: 11, padding: '4px 10px',
              borderRadius: 4, backgroundColor: '#E8364E', color: '#fff', fontWeight: 700,
              fontFamily: FONT_SANS, letterSpacing: 1, verticalAlign: 'middle',
            }}>
              ★ 결정적
            </span>
          )}
        </h1>
        <div className="book-print-hide ch-meta" style={{
          fontSize: 11, color: colors.textMuted, display: 'flex', gap: 16, flexWrap: 'wrap',
          fontFamily: FONT_SANS,
        }}>
          <span>{statusInfo.text}</span>
          <span>·</span>
          <span>{parseInt(meta.length_target || 0).toLocaleString()}자 목표</span>
          <span>·</span>
          <span>현재 {chapter.length_current?.toLocaleString() || 0}자</span>
          <span>·</span>
          <span>{meta.last_updated || '-'}</span>
        </div>
      </header>

      {/* 본문 마크다운 */}
      <div className="book-md" style={{ fontSize: 16, lineHeight: 1.95, color: colors.textPrimary }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => <h2 style={{ fontFamily: FONT_SERIF, fontSize: 26, fontWeight: 800, color: colors.textPrimary, marginTop: 40, marginBottom: 16, lineHeight: 1.3, letterSpacing: -0.5 }} {...props} />,
            h2: ({ node, ...props }) => <h2 style={{ fontFamily: FONT_SERIF, fontSize: 22, fontWeight: 800, color: colors.textPrimary, marginTop: 40, marginBottom: 14, lineHeight: 1.3, letterSpacing: -0.5, paddingBottom: 6, borderBottom: `1px solid ${borderLight}` }} {...props} />,
            h3: ({ node, ...props }) => <h3 style={{ fontFamily: FONT_SERIF, fontSize: 18, fontWeight: 700, color: colors.textPrimary, marginTop: 28, marginBottom: 12 }} {...props} />,
            h4: ({ node, ...props }) => <h4 style={{ fontFamily: FONT_SERIF, fontSize: 15, fontWeight: 700, color: colors.textPrimary, marginTop: 22, marginBottom: 10 }} {...props} />,
            p: ({ node, children, ...props }) => (
              <p style={{ marginBottom: 18, color: colors.textPrimary, lineHeight: 1.95 }} {...props}>{children}</p>
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote style={{
                borderLeft: '4px solid #E8364E',
                padding: '16px 22px',
                margin: '24px 0',
                backgroundColor: dark ? 'rgba(232,54,78,0.06)' : 'rgba(232,54,78,0.04)',
                borderRadius: '0 6px 6px 0',
                color: colors.textPrimary,
                fontFamily: FONT_SERIF, fontSize: 15.5, lineHeight: 1.85,
              }} {...props} />
            ),
            ul: ({ node, ordered, ...props }) => <ul style={{ marginBottom: 18, paddingLeft: 22, lineHeight: 1.9 }} {...props} />,
            ol: ({ node, ordered, ...props }) => <ol style={{ marginBottom: 18, paddingLeft: 22, lineHeight: 1.9 }} {...props} />,
            li: ({ node, ...props }) => <li style={{ marginBottom: 8, color: colors.textPrimary }} {...props} />,
            table: ({ node, ...props }) => (
              <div style={{ overflowX: 'auto', margin: '24px 0' }}>
                <table style={{
                  borderCollapse: 'collapse', width: '100%', fontSize: 13.5,
                  border: `1px solid ${borderLight}`, fontFamily: FONT_SANS,
                }} {...props} />
              </div>
            ),
            th: ({ node, ...props }) => <th style={{
              padding: '10px 14px', border: `1px solid ${borderLight}`,
              backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
              fontWeight: 700, textAlign: 'left', letterSpacing: -0.3,
            }} {...props} />,
            td: ({ node, ...props }) => <td style={{
              padding: '10px 14px', border: `1px solid ${borderLight}`, lineHeight: 1.6,
            }} {...props} />,
            code: ({ node, inline, ...props }) => inline ? (
              <code style={{
                padding: '2px 7px', borderRadius: 4, fontSize: 13.5,
                backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                fontFamily: FONT_MONO, color: '#E8364E',
              }} {...props} />
            ) : (
              <code style={{
                display: 'block', padding: 16, borderRadius: 6,
                backgroundColor: dark ? 'rgba(0,0,0,0.4)' : '#f6f5ee',
                fontFamily: FONT_MONO, fontSize: 13.5,
                overflowX: 'auto', lineHeight: 1.6,
                border: `1px solid ${borderLight}`,
              }} {...props} />
            ),
            hr: () => <hr style={{ border: 'none', borderTop: `1px solid ${borderLight}`, margin: '36px 0' }} />,
            a: ({ node, href, children, ...props }) => {
              // 내부 마크다운 링크면 SPA 라우팅으로 변환
              const isBookLink = href && href.endsWith('.md') && !href.startsWith('http')
              if (isBookLink) {
                return (
                  <a onClick={(e) => {
                    e.preventDefault()
                    // 상대경로 해석: ../05-part5-chart-context/5-6-xxx.md → /admin/book/05-.../5-6-xxx.md
                    const cleaned = href.replace(/^\.\.\//, '')
                    const parts = cleaned.split('/')
                    if (parts.length === 2) {
                      goToChapter(`${parts[0]}/${parts[1]}`)
                    }
                  }} style={{ color: '#E8364E', textDecoration: 'underline', cursor: 'pointer' }} {...props}>{children}</a>
                )
              }
              return <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#E8364E', textDecoration: 'underline' }} {...props}>{children}</a>
            },
            strong: ({ node, ...props }) => <strong style={{ fontWeight: 700, color: colors.textPrimary }} {...props} />,
            em: ({ node, ...props }) => <em style={{ fontStyle: 'italic', color: dark ? '#fbbf24' : '#92400e' }} {...props} />,
          }}
        >{body}</ReactMarkdown>
      </div>

      {/* 이전/다음 챕터 네비 */}
      <nav className="book-nav" style={{
        marginTop: 56, paddingTop: 24,
        borderTop: `2px solid ${borderLight}`,
        display: 'flex', gap: 12,
      }}>
        {prev ? (
          <button className="book-nav-btn" onClick={() => goToChapter(prev.path)} style={navBtnStyle(colors, dark, false)}>
            <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 6, letterSpacing: 1 }}>← 이전</div>
            <div style={{ fontFamily: FONT_SERIF, fontSize: 14, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.4 }}>
              <span style={{ color: '#E8364E', marginRight: 6 }}>{prev.num}</span>
              {prev.title}
            </div>
          </button>
        ) : <div style={{ flex: 1 }} />}
        {next ? (
          <button className="book-nav-btn" onClick={() => goToChapter(next.path)} style={{ ...navBtnStyle(colors, dark, true) }}>
            <div style={{ fontSize: 10, color: colors.textMuted, marginBottom: 6, letterSpacing: 1 }}>다음 →</div>
            <div style={{ fontFamily: FONT_SERIF, fontSize: 14, fontWeight: 700, color: colors.textPrimary, lineHeight: 1.4 }}>
              <span style={{ color: '#E8364E', marginRight: 6 }}>{next.num}</span>
              {next.title}
            </div>
          </button>
        ) : <div style={{ flex: 1 }} />}
      </nav>
    </article>
  )
}

function navBtnStyle(colors, dark, alignRight) {
  return {
    flex: 1, padding: '16px 20px',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    borderRadius: 8, backgroundColor: 'transparent',
    cursor: 'pointer', textAlign: alignRight ? 'right' : 'left',
    transition: 'all 0.15s',
  }
}

import { useState, useRef, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import { FONTS } from '../constants/theme'

/**
 * 버핏 챗 플로팅 패널 — Premium Dark Theme
 * - 오른쪽 하단 플로팅 버튼 → 클릭 시 오른쪽 슬라이드 패널
 * - corpCode prop 전달 시 해당 종목 자동 질문
 */
export default function BuffettChatPanel({ corpCode: externalCorpCode }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const prevCorpRef = useRef(null)

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [open])

  // PremiumPage에서 "직접 질문하기" 클릭 시 패널 열기
  useEffect(() => {
    const handleOpen = () => setOpen(true)
    window.addEventListener('open-buffett-chat', handleOpen)
    return () => window.removeEventListener('open-buffett-chat', handleOpen)
  }, [])

  // 외부에서 corpCode가 전달되면 자동으로 패널 열고 질문
  useEffect(() => {
    if (externalCorpCode && externalCorpCode !== prevCorpRef.current) {
      prevCorpRef.current = externalCorpCode
      setOpen(true)
      autoAsk(externalCorpCode)
    }
  }, [externalCorpCode])

  const autoAsk = useCallback(async (corpCode) => {
    const text = `이 기업을 분석해줘`
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, corp_code: corpCode, history: [] }),
      })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.answer || '답변을 생성하지 못했습니다.',
        scorecard: res.scorecard,
      }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `오류: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }, [])

  // 기업카드에서 "AI 분석" 클릭 → corpCode와 함께 패널 열기
  useEffect(() => {
    const handleCorpOpen = (e) => {
      const corpCode = e.detail
      if (corpCode) {
        prevCorpRef.current = null
        setOpen(true)
        autoAsk(corpCode)
      }
    }
    window.addEventListener('open-buffett-chat-corp', handleCorpOpen)
    return () => window.removeEventListener('open-buffett-chat-corp', handleCorpOpen)
  }, [autoAsk])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, history }),
      })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.answer || '답변을 생성하지 못했습니다.',
        scorecard: res.scorecard,
      }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `오류: ${err.message}` }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    prevCorpRef.current = null
  }

  return (
    <>
      {/* 오버레이 */}
      {open && <div style={S.overlay} onClick={() => setOpen(false)} />}

      {/* 슬라이드 패널 */}
      <div style={{
        ...S.panel,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
      }}>
        {/* 헤더 */}
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/bufit.png" alt="" style={S.headerAvatar} />
            <div>
              <div style={S.headerTitle}>Buffett AI</div>
              <div style={S.headerSub}>Intrinsic Value Analyst</div>
            </div>
          </div>
          <div style={S.headerActions}>
            {messages.length > 0 && (
              <button style={S.iconBtn} onClick={clearChat} title="대화 초기화">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                </svg>
              </button>
            )}
            <button style={S.iconBtn} onClick={() => setOpen(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div style={S.messages}>
          {messages.length === 0 && (
            <div style={S.empty}>
              <img src="/bufit.png" alt="" style={S.emptyAvatar} />
              <p style={S.emptyTitle}>안녕하세요, Buffett AI입니다</p>
              <p style={S.emptyDesc}>기업의 내재가치를 6가지 관점에서 분석해드려요.<br />아래 버튼을 눌러 바로 시작해보세요!</p>
              <div style={S.examples}>
                <button
                  style={{ ...S.exampleBtn, background: 'rgba(220,38,38,0.08)', borderColor: 'rgba(220,38,38,0.2)', color: '#F87171' }}
                  onClick={() => { setInput('삼성전자 분석해줘'); setTimeout(() => sendMessage(), 100) }}
                >
                  삼성전자 바로 분석하기
                </button>
                {[
                  'SK하이닉스 해자 있어?',
                  '현대차 재무 건전해?',
                ].map((ex, i) => (
                  <button
                    key={i}
                    style={S.exampleBtn}
                    onClick={() => { setInput(ex); inputRef.current?.focus() }}
                    onMouseEnter={e => { e.target.style.borderColor = '#DC2626'; e.target.style.color = '#F5F5F0' }}
                    onMouseLeave={e => { e.target.style.borderColor = '#2A2A2E'; e.target.style.color = '#A1A1AA' }}
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{
              ...S.msgRow,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}>
              {msg.role === 'assistant' && (
                <img src="/bufit.png" alt="" style={S.msgAvatar} />
              )}
              <div style={{
                ...S.bubble,
                ...(msg.role === 'user' ? S.userBubble : S.botBubble),
              }}>
                {msg.content.split('\n').map((line, j) => (
                  <p key={j} style={{ margin: 0 }}>{line || '\u00A0'}</p>
                ))}
                {msg.scorecard && <ScorecardBadges scorecard={msg.scorecard} />}
              </div>
            </div>
          ))}

          {loading && (
            <div style={S.msgRow}>
              <img src="/bufit.png" alt="" style={S.msgAvatar} />
              <div style={{ ...S.bubble, ...S.botBubble }}>
                <div style={S.typingDots}>
                  <span style={{ ...S.dot, animationDelay: '0s' }} />
                  <span style={{ ...S.dot, animationDelay: '0.2s' }} />
                  <span style={{ ...S.dot, animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 — 프리미엄 스타일 */}
        <div style={S.inputArea}>
          <div style={S.inputWrapper}>
            <img src="/bufit.png" alt="" style={S.inputAvatar} />
            <textarea
              ref={inputRef}
              style={S.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="종목명이나 궁금한 점을 물어보세요"
              rows={1}
              disabled={loading}
            />
            <button
              className="touch-press"
              style={{
                ...S.sendBtn,
                opacity: loading || !input.trim() ? 0.2 : 1,
                transform: loading || !input.trim() ? 'scale(0.9)' : 'scale(1)',
              }}
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
          <div style={S.disclaimer}>
            DART 실시간 데이터 기반 · 투자 권유 아님
          </div>
        </div>
      </div>

      {/* 플로팅 버튼 */}
      {!open && (
        <button
          style={S.fab}
          onClick={() => setOpen(true)}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(220,38,38,0.4)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)' }}
        >
          <img src="/bufit.png" alt="" style={{
            width: 30, height: 30, borderRadius: '50%', objectFit: 'cover',
          }} />
        </button>
      )}

      <style>{`
        @keyframes buffett-dot-pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes buffett-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  )
}


function ScorecardBadges({ scorecard }) {
  const sd = scorecard?.summary_data
  if (!sd) return null

  const badges = [
    sd.margin_of_safety != null && {
      label: `MoS ${sd.margin_of_safety}%`,
      color: sd.margin_of_safety >= 25 ? '#22C55E' : sd.margin_of_safety >= 0 ? '#EAB308' : '#EF4444',
    },
    sd.roe != null && {
      label: `ROE ${sd.roe}%`,
      color: sd.roe >= 15 ? '#22C55E' : sd.roe >= 10 ? '#EAB308' : '#71717A',
    },
    sd.debt_ratio != null && {
      label: `D/E ${sd.debt_ratio}%`,
      color: sd.debt_ratio <= 50 ? '#22C55E' : sd.debt_ratio <= 100 ? '#EAB308' : '#EF4444',
    },
    sd.moat_verdict && {
      label: sd.moat_verdict,
      color: sd.moat_verdict.includes('강한') ? '#22C55E' : sd.moat_verdict.includes('가능') ? '#EAB308' : '#71717A',
    },
    sd.fcf != null && {
      label: sd.fcf > 0 ? 'FCF +' : 'FCF -',
      color: sd.fcf > 0 ? '#22C55E' : '#EF4444',
    },
  ].filter(Boolean)

  const flags = sd.red_flags || []

  if (badges.length === 0 && flags.length === 0) return null

  return (
    <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
      {badges.map((b, i) => (
        <span key={i} style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px',
          borderRadius: 8, border: `1px solid ${b.color}50`,
          color: b.color, background: 'rgba(0,0,0,0.2)',
          fontFamily: FONTS?.mono || 'JetBrains Mono, monospace',
        }}>
          {b.label}
        </span>
      ))}
      {flags.map((f, i) => (
        <span key={`rf-${i}`} style={{
          fontSize: 10, fontWeight: 700, padding: '2px 8px',
          borderRadius: 8, background: 'rgba(239,68,68,0.12)',
          color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)',
        }}>{f}</span>
      ))}
    </div>
  )
}


// ── Premium Dark Styles ──
const S = {
  fab: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: '50%',
    background: '#111113',
    border: '2px solid rgba(220,38,38,0.3)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    zIndex: 9998,
    transition: 'transform 0.2s, box-shadow 0.2s',
  },

  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 9998,
    backdropFilter: 'blur(4px)',
    animation: 'buffett-fade-in 0.2s ease-out',
  },

  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: 'min(440px, 92vw)',
    height: '100vh',
    background: '#0C0C0E',
    boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: FONTS?.body || 'Pretendard, sans-serif',
    borderLeft: '1px solid #1E1E22',
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderBottom: '1px solid #1E1E22',
    background: 'rgba(220,38,38,0.02)',
    flexShrink: 0,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1.5px solid rgba(220,38,38,0.25)',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: '#F5F5F0',
    letterSpacing: '-0.3px',
    fontFamily: FONTS?.serif || 'Noto Serif KR, serif',
  },
  headerSub: {
    fontSize: 10,
    color: '#52525B',
    marginTop: 1,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    fontFamily: FONTS?.mono || 'JetBrains Mono, monospace',
  },
  headerActions: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#52525B',
    padding: 6,
    borderRadius: 6,
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s',
  },

  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 14px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },

  empty: {
    textAlign: 'center',
    padding: '48px 16px 32px',
  },
  emptyAvatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid rgba(220,38,38,0.2)',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 15,
    color: '#E4E4E7',
    fontWeight: 700,
    marginBottom: 6,
    fontFamily: FONTS?.serif || 'Noto Serif KR, serif',
  },
  emptyDesc: {
    fontSize: 12,
    color: '#52525B',
    lineHeight: 1.6,
    marginBottom: 24,
  },
  examples: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'center',
  },
  exampleBtn: {
    padding: '9px 18px',
    border: '1px solid #2A2A2E',
    borderRadius: 20,
    background: 'transparent',
    color: '#A1A1AA',
    fontSize: 13,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },

  msgRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'flex-start',
  },
  msgAvatar: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    objectFit: 'cover',
    marginTop: 2,
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '82%',
    padding: '11px 14px',
    borderRadius: 14,
    fontSize: 13,
    lineHeight: 1.7,
  },
  userBubble: {
    background: 'rgba(220,38,38,0.1)',
    border: '1px solid rgba(220,38,38,0.18)',
    color: '#E4E4E7',
    borderBottomRightRadius: 4,
    marginLeft: 'auto',
  },
  botBubble: {
    background: '#151517',
    border: '1px solid #1E1E22',
    color: '#D4D4D8',
    borderBottomLeftRadius: 4,
  },

  typingDots: {
    display: 'flex',
    gap: 5,
    padding: '4px 0',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#52525B',
    display: 'inline-block',
    animation: 'buffett-dot-pulse 1.4s infinite',
  },

  inputArea: {
    padding: '12px 14px',
    paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
    borderTop: '1px solid #1E1E22',
    background: '#0A0A0C',
    flexShrink: 0,
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '6px 6px 6px 12px',
    borderRadius: 16,
    border: '1.5px solid #27272A',
    background: '#111113',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputAvatar: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    padding: '10px 4px',
    border: 'none',
    borderRadius: 0,
    fontSize: 14,
    fontFamily: 'inherit',
    resize: 'none',
    outline: 'none',
    background: 'transparent',
    color: '#E4E4E7',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    background: '#DC2626',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
  },
  disclaimer: {
    fontSize: 10,
    color: '#3F3F46',
    textAlign: 'center',
    marginTop: 8,
  },

}

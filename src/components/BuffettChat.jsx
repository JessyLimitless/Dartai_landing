import { useState, useRef, useEffect, useCallback } from 'react'
import { apiFetch } from '../lib/api'
import { FONTS, PREMIUM } from '../constants/theme'
import { useTheme } from '../contexts/ThemeContext'

export default function BuffettChatPanel({ corpCode: externalCorpCode }) {
  const { colors, dark } = useTheme()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const prevCorpRef = useRef(null)

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300)
  }, [open])

  useEffect(() => {
    const h = () => setOpen(true)
    window.addEventListener('open-buffett-chat', h)
    return () => window.removeEventListener('open-buffett-chat', h)
  }, [])

  const autoAsk = useCallback(async (corpCode) => {
    const text = '이 기업을 분석해줘'
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)
    try {
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, corp_code: corpCode, history: [] }),
      })
      setMessages(prev => [...prev, { role: 'assistant', content: res.answer || '답변을 생성하지 못했습니다.', scorecard: res.scorecard }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `오류: ${err.message}` }])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    const h = (e) => { if (e.detail) { prevCorpRef.current = null; setOpen(true); autoAsk(e.detail) } }
    window.addEventListener('open-buffett-chat-corp', h)
    return () => window.removeEventListener('open-buffett-chat-corp', h)
  }, [autoAsk])

  useEffect(() => {
    if (externalCorpCode && externalCorpCode !== prevCorpRef.current) {
      prevCorpRef.current = externalCorpCode; setOpen(true); autoAsk(externalCorpCode)
    }
  }, [externalCorpCode])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setInput('')
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await apiFetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: text, history }) })
      setMessages(prev => [...prev, { role: 'assistant', content: res.answer || '답변을 생성하지 못했습니다.', scorecard: res.scorecard }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `오류: ${err.message}` }])
    } finally { setLoading(false); inputRef.current?.focus() }
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }
  const clearChat = () => { setMessages([]); prevCorpRef.current = null }

  const bg = dark ? '#09090B' : '#FFFFFF'
  const sep = dark ? '#1E1E22' : '#F0F0F2'
  const dimBg = dark ? '#141416' : '#F8F8FA'

  return (
    <>
      {/* 오버레이 */}
      {open && <div onClick={() => setOpen(false)} style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)',
        animation: 'bfFade 0.2s ease-out',
      }} />}

      {/* 채팅 패널 — 모바일: 풀스크린, 데스크톱: 우측 패널 */}
      <div className="buffett-panel" style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        width: '100%',
        maxWidth: '440px',
        zIndex: 9999,
        background: bg,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.08)',
        borderLeft: `1px solid ${sep}`,
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
      }}>
        {/* 헤더 — 토스 스타일 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderBottom: `1px solid ${sep}`, flexShrink: 0,
        }}>
          <button className="touch-press" onClick={() => setOpen(false)} style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: colors.textMuted, display: 'flex', alignItems: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/bufit.png" alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: colors.textPrimary }}>Buffett AI</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {messages.length > 0 && (
              <button className="touch-press" onClick={clearChat} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: colors.textMuted,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* 메시지 영역 */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px 16px 8px',
          display: 'flex', flexDirection: 'column', gap: 14,
          WebkitOverflowScrolling: 'touch',
        }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 16px 20px' }}>
              <img src="/bufit.png" alt="" style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginBottom: 14 }} />
              <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
                안녕하세요, Buffett AI입니다
              </div>
              <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6, marginBottom: 24 }}>
                기업의 내재가치를 분석해드려요
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <button className="touch-press" onClick={() => { setInput('삼성전자 분석해줘'); setTimeout(sendMessage, 100) }} style={{
                  padding: '12px 24px', borderRadius: 24, border: 'none',
                  background: PREMIUM.accent, color: '#fff',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', minHeight: 44,
                }}>
                  삼성전자 바로 분석하기
                </button>
                {['SK하이닉스 해자 있어?', '현대차 재무 건전해?'].map((ex, i) => (
                  <button key={i} className="touch-press" onClick={() => { setInput(ex); inputRef.current?.focus() }} style={{
                    padding: '10px 20px', borderRadius: 20, border: `1px solid ${sep}`,
                    background: 'transparent', color: colors.textSecondary,
                    fontSize: 13, cursor: 'pointer',
                  }}>{ex}</button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.role === 'assistant' && (
                <img src="/bufit.png" alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginTop: 2, flexShrink: 0 }} />
              )}
              <div style={{
                maxWidth: '80%', padding: '12px 16px', borderRadius: 16,
                fontSize: 14, lineHeight: 1.7,
                ...(msg.role === 'user'
                  ? { background: PREMIUM.accent, color: '#fff', borderBottomRightRadius: 4 }
                  : { background: dimBg, color: colors.textPrimary, borderBottomLeftRadius: 4, border: `1px solid ${sep}` }
                ),
              }}>
                {msg.content.split('\n').map((line, j) => (
                  <p key={j} style={{ margin: 0 }}>{line || '\u00A0'}</p>
                ))}
                {msg.scorecard && <ScorecardCard scorecard={msg.scorecard} colors={colors} dark={dark} />}
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <img src="/bufit.png" alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', marginTop: 2 }} />
              <div style={{ padding: '14px 18px', borderRadius: 16, background: dimBg, border: `1px solid ${sep}`, borderBottomLeftRadius: 4, display: 'flex', gap: 5 }}>
                {[0, 1, 2].map(d => <span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: colors.textMuted, animation: `bfDot 1.4s infinite ${d * 0.2}s` }} />)}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 — 토스 스타일 */}
        <div style={{
          padding: '10px 16px', paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))',
          borderTop: `1px solid ${sep}`, flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '4px 4px 4px 16px', borderRadius: 24,
            border: `1px solid ${sep}`, background: dimBg,
          }}>
            <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown} placeholder="종목명이나 궁금한 점을 물어보세요"
              rows={1} disabled={loading}
              style={{
                flex: 1, padding: '10px 0', border: 'none', borderRadius: 0,
                fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none',
                background: 'transparent', color: colors.textPrimary,
              }}
            />
            <button className="touch-press" onClick={sendMessage} disabled={loading || !input.trim()} style={{
              width: 36, height: 36, borderRadius: '50%', border: 'none',
              background: loading || !input.trim() ? (dark ? '#27272A' : '#E4E4E7') : PREMIUM.accent,
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
          <div style={{ fontSize: 10, color: colors.textMuted, textAlign: 'center', marginTop: 6 }}>
            DART 실시간 데이터 기반 · 투자 권유 아님
          </div>
        </div>
      </div>

      {/* 플로팅 버튼 */}
      {!open && (
        <button className="touch-press" onClick={() => setOpen(true)} style={{
          position: 'fixed', bottom: 80, right: 16, zIndex: 9998,
          width: 52, height: 52, borderRadius: '50%',
          background: colors.bgCard, border: `1px solid ${sep}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <img src="/bufit.png" alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        </button>
      )}

      <style>{`
        @keyframes bfDot { 0%,80%,100%{opacity:0.3;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }
        @keyframes bfFade { from{opacity:0} to{opacity:1} }
        @media (max-width: 768px) {
          .buffett-panel {
            max-width: 100% !important;
            border-left: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </>
  )
}

// ══ 스코어카드 — 카드형 UI ══
function ScorecardCard({ scorecard, colors, dark }) {
  const sd = scorecard?.summary_data
  if (!sd) return null

  const sep = dark ? '#1E1E22' : '#F0F0F2'

  const metrics = [
    sd.margin_of_safety != null && { label: '안전마진(MoS)', value: `${sd.margin_of_safety}%`, color: sd.margin_of_safety >= 25 ? '#DC2626' : sd.margin_of_safety >= 0 ? '#D97706' : '#2563EB' },
    sd.roe != null && { label: 'ROE', value: `${sd.roe}%`, color: sd.roe >= 15 ? '#DC2626' : '#71717A' },
    sd.debt_ratio != null && { label: '부채비율', value: `${sd.debt_ratio}%`, color: sd.debt_ratio <= 100 ? '#DC2626' : '#2563EB' },
    sd.moat_verdict && { label: '경제적 해자', value: sd.moat_verdict, color: sd.moat_verdict.includes('강한') ? '#DC2626' : '#71717A' },
    sd.fcf != null && { label: 'FCF', value: sd.fcf > 0 ? '양호' : '부진', color: sd.fcf > 0 ? '#DC2626' : '#2563EB' },
  ].filter(Boolean)

  const flags = sd.red_flags || []

  if (metrics.length === 0 && flags.length === 0) return null

  return (
    <div style={{
      marginTop: 12, borderRadius: 12,
      border: `1px solid ${sep}`,
      background: dark ? '#0C0C0E' : '#FFFFFF',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${sep}`, fontSize: 11, fontWeight: 700, color: colors.textMuted, letterSpacing: '0.06em' }}>
        SCORECARD
      </div>
      {metrics.map((m, i) => (
        <div key={m.label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 14px',
          borderTop: i > 0 ? `1px solid ${sep}` : 'none',
        }}>
          <span style={{ fontSize: 13, color: colors.textMuted }}>{m.label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: FONTS.mono, color: m.color }}>{m.value}</span>
        </div>
      ))}
      {flags.length > 0 && (
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${sep}`, background: 'rgba(220,38,38,0.04)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#DC2626', marginBottom: 4 }}>RED FLAGS</div>
          {flags.map((f, i) => (
            <div key={i} style={{ fontSize: 12, color: '#DC2626', padding: '2px 0' }}>· {f}</div>
          ))}
        </div>
      )}
    </div>
  )
}

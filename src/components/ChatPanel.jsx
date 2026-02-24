import React, { useState, useRef, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'

const WELCOME_MSG = {
  role: 'assistant',
  text: '안녕하세요! AI 애널리스트입니다.\n이 기업에 대해 궁금한 점을 물어보세요. 재무 분석, 공시 해석, 투자 포인트 등을 도와드립니다.',
}

export default function ChatPanel({ corpName }) {
  const { colors, dark } = useTheme()
  const [messages, setMessages] = useState([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const text = input.trim()
    if (!text || loading) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: '현재 AI 애널리스트 기능을 준비 중입니다. 곧 Gemini 기반 실시간 분석을 제공할 예정입니다.' },
      ])
      setLoading(false)
    }, 1000)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const panelStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '500px',
    background: colors.bgCard,
    borderRadius: PREMIUM.cardRadius,
    border: `1px solid ${colors.border}`,
    overflow: 'hidden',
  }

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    borderBottom: `1px solid ${colors.border}`,
    background: dark ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.03)',
  }

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `2px solid ${PREMIUM.accent}`,
  }

  const messagesStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  }

  const inputAreaStyle = {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    borderTop: `1px solid ${colors.border}`,
    background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
  }

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <img src="/bufit.png" alt="AI Analyst" style={avatarStyle} />
        <div>
          <div style={{
            fontFamily: FONTS.serif,
            fontWeight: 700,
            fontSize: '15px',
            color: colors.textPrimary,
          }}>
            AI 애널리스트
          </div>
          <div style={{
            fontSize: '12px',
            color: colors.textMuted,
            fontFamily: FONTS.body,
          }}>
            {corpName ? `${corpName} 분석 상담` : '기업 분석 상담'}
          </div>
        </div>
        <div style={{
          marginLeft: 'auto',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: '#22C55E',
        }} />
      </div>

      {/* Messages */}
      <div style={messagesStyle}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} colors={colors} dark={dark} />
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
            <img src="/bufit.png" alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
            <TypingIndicator colors={colors} />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={inputAreaStyle}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="질문을 입력하세요..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '10px',
            border: `1px solid ${colors.border}`,
            background: colors.bgPrimary,
            color: colors.textPrimary,
            fontSize: '14px',
            fontFamily: FONTS.body,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = PREMIUM.accent}
          onBlur={(e) => e.target.style.borderColor = colors.border}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          style={{
            padding: '10px 16px',
            borderRadius: '10px',
            border: 'none',
            background: !input.trim() || loading ? colors.textMuted : PREMIUM.accent,
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: FONTS.body,
            cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, opacity 0.2s',
            opacity: !input.trim() || loading ? 0.5 : 1,
            whiteSpace: 'nowrap',
          }}
        >
          전송
        </button>
      </div>
    </div>
  )
}

function MessageBubble({ msg, colors, dark }) {
  const isUser = msg.role === 'user'

  const bubbleStyle = {
    maxWidth: '85%',
    padding: '10px 14px',
    borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
    background: isUser
      ? PREMIUM.accent
      : dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    color: isUser ? '#fff' : colors.textPrimary,
    fontSize: '14px',
    lineHeight: '1.6',
    fontFamily: FONTS.body,
    alignSelf: isUser ? 'flex-end' : 'flex-start',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }

  if (!isUser) {
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
        <img src="/bufit.png" alt="" style={{ width: '28px', height: '28px', borderRadius: '50%', marginTop: '2px', flexShrink: 0 }} />
        <div style={bubbleStyle}>{msg.text}</div>
      </div>
    )
  }

  return <div style={bubbleStyle}>{msg.text}</div>
}

function TypingIndicator({ colors }) {
  return (
    <div style={{
      display: 'flex',
      gap: '4px',
      padding: '8px 12px',
      borderRadius: '12px',
      background: colors.bgPrimary,
    }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: colors.textMuted,
            animation: `typing 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}

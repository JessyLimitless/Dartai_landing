import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'

const CATEGORIES = [
  '자동매매 프로그램 제작',
  'AI 솔루션 개발',
  'DART Insight 프리미엄',
  '기타 문의',
]

export default function InquiryPage() {
  const { colors, dark } = useTheme()
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const sep = dark ? '#1E1E22' : '#F0F0F2'

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      await fetch(`${API}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, category, message }),
      })
      setSubmitted(true)
    } catch {}
    setLoading(false)
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 20px', textAlign: 'center', fontFamily: FONTS.body }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>
          문의가 접수되었습니다
        </div>
        <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>
          담당자가 확인 후 연락드리겠습니다.<br />
          감사합니다.
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 80px', fontFamily: FONTS.body }}>

      {/* 헤더 */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: colors.textPrimary, marginBottom: 6 }}>
          자동매매 제품 문의
        </div>
        <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>
          맞춤형 자동매매 프로그램 제작 및 AI 솔루션 개발에 대해 문의해주세요.
        </div>
      </div>

      {/* 문의 폼 */}
      <div style={{
        borderRadius: 14, padding: '20px',
        background: dark ? '#141416' : '#fff',
        border: `1px solid ${sep}`,
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, marginBottom: 16 }}>
          문의하기
        </div>

        {/* 카테고리 */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 6, display: 'block' }}>문의 유형</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{
            width: '100%', padding: '10px 12px', borderRadius: 8,
            border: `1px solid ${sep}`, background: dark ? '#0C0C0E' : '#FAFAFA',
            color: colors.textPrimary, fontSize: 14, outline: 'none',
          }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* 이름 */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 6, display: 'block' }}>이름 (선택)</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="홍길동"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: `1px solid ${sep}`, background: dark ? '#0C0C0E' : '#FAFAFA',
              color: colors.textPrimary, fontSize: 14, outline: 'none',
              boxSizing: 'border-box',
            }} />
        </div>

        {/* 연락처 */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 6, display: 'block' }}>연락처 (선택)</label>
          <input value={contact} onChange={e => setContact(e.target.value)} placeholder="이메일 또는 전화번호"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: `1px solid ${sep}`, background: dark ? '#0C0C0E' : '#FAFAFA',
              color: colors.textPrimary, fontSize: 14, outline: 'none',
              boxSizing: 'border-box',
            }} />
        </div>

        {/* 문의 내용 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 6, display: 'block' }}>문의 내용</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder="자동매매 프로그램 제작에 관심이 있습니다..."
            rows={5}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: `1px solid ${sep}`, background: dark ? '#0C0C0E' : '#FAFAFA',
              color: colors.textPrimary, fontSize: 14, outline: 'none',
              resize: 'vertical', lineHeight: 1.6,
              boxSizing: 'border-box',
            }} />
        </div>

        {/* 제출 */}
        <button onClick={handleSubmit} disabled={loading || !message.trim()} style={{
          width: '100%', padding: '14px', borderRadius: 10, border: 'none',
          background: message.trim() ? '#DC2626' : (dark ? '#1A1A1E' : '#E4E4E7'),
          color: message.trim() ? '#fff' : colors.textMuted,
          fontSize: 15, fontWeight: 700, cursor: message.trim() ? 'pointer' : 'default',
        }}>
          {loading ? '접수 중...' : '문의 접수'}
        </button>
      </div>

      </div>{/* inquiry-grid 끝 */}

      {/* 회사 정보 */}
      <div style={{ marginTop: 24, fontSize: 12, color: colors.textMuted, lineHeight: 1.8, textAlign: 'center' }}>
        주식회사 뮤즈에이아이 | 사업자등록번호 764-88-03375<br />
        서울특별시 은평구 통일로62길 7, 3층
      </div>

    </div>
  )
}

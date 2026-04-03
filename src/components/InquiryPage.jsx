import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'
import { useSearchParams } from 'react-router-dom'

const MODES = {
  default: {
    title: '서비스 문의',
    desc: '맞춤형 솔루션 개발 및 서비스에 대해 문의해주세요.',
    categories: ['자동매매 프로그램 제작', 'AI 솔루션 개발', 'DART Insight 프리미엄', '기타 문의'],
    placeholder: '문의 내용을 자유롭게 작성해주세요.',
  },
  api: {
    title: '공시 데이터 연동 문의',
    desc: '실시간 공시 데이터를 시스템에 연동하는 방법을 안내해드려요.',
    categories: ['실시간 공시 API 연동', 'AI 기업분석 연동', '공시 시그널 데이터', '맞춤형 데이터 구축'],
    placeholder: '어떤 시스템에 연동을 원하시나요? (예: 사내 AI 챗봇, 트레이딩 시스템, 리서치 플랫폼 등)',
    features: [
      { label: '실시간 공시 API', desc: 'DART+KIND 공시를 등급 분류와 함께 실시간 수신' },
      { label: 'AI 기업분석', desc: '875종목 재무+시세+AI 분석 데이터 제공' },
      { label: '공시 시그널', desc: '공시 유형별 초과수익률·승률 통계 데이터' },
    ],
  },
}

export default function InquiryPage() {
  const { colors, dark } = useTheme()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') || 'default'
  const mode = MODES[type] || MODES.default

  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [category, setCategory] = useState(mode.categories[0])
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => { setCategory(mode.categories[0]) }, [type])

  const sep = dark ? '#1E1E22' : '#F0F0F2'
  const R = '#DC2626'

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      await fetch(`${API}/api/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contact, category, message, type }),
      })
      setSubmitted(true)
    } catch {}
    setLoading(false)
  }

  if (submitted) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '80px 20px', textAlign: 'center', fontFamily: FONTS.body }}>
        <div style={{ marginBottom: 20 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, marginBottom: 8 }}>
          문의가 접수되었습니다
        </div>
        <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>
          담당자가 확인 후 연락드리겠습니다.
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px 80px', fontFamily: FONTS.body }}>

      {/* 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, marginBottom: 6, letterSpacing: '-0.5px' }}>
          {mode.title}
        </div>
        <div style={{ fontSize: 14, color: colors.textMuted, lineHeight: 1.6 }}>
          {mode.desc}
        </div>
      </div>

      {/* 데이터 연동 — 제공 항목 */}
      {type === 'api' && mode.features && (
        <div style={{
          borderRadius: 14, padding: '18px 20px', marginBottom: 16,
          background: dark ? '#111113' : '#F8F8FA',
          border: `1px solid ${sep}`,
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#A1A1AA', letterSpacing: '0.08em', marginBottom: 12 }}>
            제공 데이터
          </div>
          {mode.features.map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '10px 0',
              borderBottom: i < mode.features.length - 1 ? `1px solid ${sep}` : 'none',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: R, flexShrink: 0, marginTop: 6 }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: colors.textPrimary }}>{f.label}</div>
                <div style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 폼 */}
      <div style={{
        borderRadius: 14, padding: '20px',
        background: dark ? '#141416' : '#fff',
        border: `1px solid ${sep}`,
      }}>
        {/* 카테고리 */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 6, display: 'block' }}>
            {type === 'api' ? '연동 유형' : '문의 유형'}
          </label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={{
            width: '100%', padding: '10px 12px', borderRadius: 8,
            border: `1px solid ${sep}`, background: dark ? '#0C0C0E' : '#FAFAFA',
            color: colors.textPrimary, fontSize: 14, outline: 'none',
          }}>
            {mode.categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* 이름 */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 6, display: 'block' }}>
            {type === 'api' ? '회사명 / 담당자명' : '이름'} (선택)
          </label>
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder={type === 'api' ? '회사명 또는 담당자명' : '홍길동'}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: `1px solid ${sep}`, background: dark ? '#0C0C0E' : '#FAFAFA',
              color: colors.textPrimary, fontSize: 14, outline: 'none', boxSizing: 'border-box',
            }} />
        </div>

        {/* 연락처 */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 6, display: 'block' }}>연락처 (선택)</label>
          <input value={contact} onChange={e => setContact(e.target.value)} placeholder="이메일 또는 전화번호"
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: `1px solid ${sep}`, background: dark ? '#0C0C0E' : '#FAFAFA',
              color: colors.textPrimary, fontSize: 14, outline: 'none', boxSizing: 'border-box',
            }} />
        </div>

        {/* 내용 */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: colors.textMuted, marginBottom: 6, display: 'block' }}>문의 내용</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)}
            placeholder={mode.placeholder}
            rows={5}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 8,
              border: `1px solid ${sep}`, background: dark ? '#0C0C0E' : '#FAFAFA',
              color: colors.textPrimary, fontSize: 14, outline: 'none',
              resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box',
            }} />
        </div>

        {/* 제출 */}
        <button onClick={handleSubmit} disabled={loading || !message.trim()} style={{
          width: '100%', padding: '14px', borderRadius: 10, border: 'none',
          background: message.trim() ? '#18181B' : (dark ? '#1A1A1E' : '#E4E4E7'),
          color: message.trim() ? '#fff' : colors.textMuted,
          fontSize: 15, fontWeight: 700, cursor: message.trim() ? 'pointer' : 'default',
        }}>
          {loading ? '접수 중...' : '문의 접수'}
        </button>
      </div>

      {/* 회사 정보 */}
      <div style={{ marginTop: 24, fontSize: 12, color: colors.textMuted, lineHeight: 1.8, textAlign: 'center' }}>
        주식회사 뮤즈에이아이 | 사업자등록번호 764-88-03375<br />
        서울특별시 은평구 통일로62길 7, 3층
      </div>
    </div>
  )
}

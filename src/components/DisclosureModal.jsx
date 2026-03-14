import React, { useState, useEffect } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { GRADE_COLORS, FONTS } from '../constants/theme'
import { API } from '../lib/api'

// 공시 유형별 파싱 필드 레이블 매핑
const FIELD_LABELS = {
  contract_amount:        { label: '계약금액',     format: 'money' },
  revenue_ratio:          { label: '매출 대비',     format: 'pct' },
  client_name:            { label: '계약 상대방',   format: 'text' },
  counterparty:           { label: '계약 상대방',   format: 'text' },
  contract_period:        { label: '계약 기간',     format: 'text' },
  contract_period_start:  { label: '계약 시작일',   format: 'text' },
  prev_revenue:           { label: '직전 매출액',   format: 'money' },
  current_revenue:   { label: '당기 매출액',   format: 'money' },
  prev_op_profit:    { label: '직전 영업이익', format: 'money' },
  current_op_profit: { label: '당기 영업이익', format: 'money' },
  current_net_income:{ label: '당기 순이익',   format: 'money' },
  op_profit_yoy:     { label: '영업이익 YoY',  format: 'pctval' },
  revenue_yoy:       { label: '매출 YoY',      format: 'pctval' },
  ratio:             { label: '신주 배정 비율', format: 'ratio' },
  new_shares:        { label: '신주 총수',      format: 'shares' },
  record_date:       { label: '기준일',         format: 'text' },
  target:            { label: '배정 대상자',    format: 'text' },
  amount:            { label: '발행 가액',      format: 'money' },
  purpose:           { label: '자금 용도',      format: 'text' },
}

function fmtMoney(v) {
  if (v == null || v === '') return '—'
  const n = Number(v)
  if (isNaN(n)) return String(v)
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(1)}조원`
  if (Math.abs(n) >= 1e8)  return `${(n / 1e8).toFixed(0)}억원`
  if (Math.abs(n) >= 1e4)  return `${(n / 1e4).toFixed(0)}만원`
  return `${n.toLocaleString()}원`
}

function fmtValue(val, format) {
  if (val == null || val === '') return '—'
  switch (format) {
    case 'money':  return fmtMoney(val)
    case 'pct':    return `${Number(val).toFixed(1)}%`
    case 'pctval': return `${Number(val) >= 0 ? '+' : ''}${Number(val).toFixed(1)}%`
    case 'ratio':  return `1주당 ${Number(val).toFixed(2)}주`
    case 'shares': return `${Number(val).toLocaleString()}주`
    default:       return String(val)
  }
}

function fmtRceptDt(dt) {
  if (!dt || dt.length < 8) return dt || ''
  return `${dt.slice(0, 4)}.${dt.slice(4, 6)}.${dt.slice(6, 8)}`
}

const DART_URL = 'https://dart.fss.or.kr/dsaf001/main.do?rcpNo='

export default function DisclosureModal({ rcept_no, onClose, onViewCard }) {
  const { colors, dark } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!rcept_no) return
    setLoading(true)
    fetch(`${API}/api/disclosures/${rcept_no}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [rcept_no])

  // ESC 키 닫기
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const raw = data?.raw_data || {}
  const parsed = data?.parsed_data || {}
  const grade = data?.grade || ''
  const gc = GRADE_COLORS[grade] || { bg: '#A1A1AA', color: '#fff' }

  // 표시할 파싱 필드만 추출
  const parsedEntries = Object.entries(FIELD_LABELS).filter(
    ([key]) => parsed[key] != null && parsed[key] !== ''
  )

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: dark ? '#18181B' : '#fff',
          borderRadius: 16,
          width: '100%', maxWidth: 520,
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
          border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
        }}
      >
        {/* 헤더 */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: `1px solid ${dark ? '#27272A' : '#F4F4F5'}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {grade && (
                  <span style={{
                    background: gc.bg, color: gc.color,
                    fontSize: 10, fontWeight: 800,
                    padding: '2px 7px', borderRadius: 4,
                    fontFamily: FONTS.mono, flexShrink: 0,
                  }}>{grade}</span>
                )}
                {raw.corp_cls && (
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3,
                    background: dark ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
                    color: colors.textMuted,
                  }}>
                    {{ Y: 'KOSPI', K: 'KOSDAQ', N: 'KONEX' }[raw.corp_cls] || raw.corp_cls}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 17, fontWeight: 700, color: colors.textPrimary,
                fontFamily: FONTS.serif, marginBottom: 3,
              }}>
                {data?.corp_name || raw.corp_name || '—'}
              </div>
              <div style={{
                fontSize: 12, color: colors.textSecondary,
                lineHeight: 1.4,
              }}>
                {data?.report_nm || raw.report_nm || ''}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: dark ? 'rgba(255,255,255,0.08)' : '#F4F4F5',
                border: 'none', cursor: 'pointer', borderRadius: 8,
                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: colors.textMuted, fontSize: 14, flexShrink: 0,
              }}
            >✕</button>
          </div>

          {/* 접수일 + 종목코드 */}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {raw.rcept_dt && (
              <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
                접수일 {fmtRceptDt(raw.rcept_dt)}
              </span>
            )}
            {raw.stock_code && (
              <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
                {raw.stock_code}
              </span>
            )}
          </div>
        </div>

        {/* 바디 — 파싱 데이터가 있을 때만 표시 */}
        {(loading || parsedEntries.length > 0) && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[80, 120, 60].map((w, i) => (
                  <div key={i} style={{ height: 14, width: `${w}%`, borderRadius: 4, background: dark ? '#27272A' : '#F4F4F5', animation: 'pulse 1.4s infinite' }} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {parsedEntries.map(([key, meta]) => (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                    padding: '9px 12px', borderRadius: 8,
                    background: dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA',
                    gap: 12,
                  }}>
                    <span style={{ fontSize: 12, color: colors.textSecondary, flexShrink: 0 }}>
                      {meta.label}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 700, fontFamily: FONTS.mono,
                      color: colors.textPrimary, textAlign: 'right',
                    }}>
                      {fmtValue(parsed[key], meta.format)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 푸터 액션 */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${dark ? '#27272A' : '#F4F4F5'}`,
          display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center',
        }}>
          {/* DART 원문 */}
          <a
            href={`${DART_URL}${rcept_no}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              fontSize: 12, color: colors.textMuted,
              textDecoration: 'none', padding: '6px 10px', borderRadius: 7,
              border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
              background: 'transparent', transition: 'all 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = colors.textPrimary}
            onMouseLeave={e => e.currentTarget.style.color = colors.textMuted}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            DART 원문
          </a>

          {/* 기업 카드 */}
          {raw.corp_code && (
            <button
              onClick={() => { onViewCard?.(raw.corp_code); onClose() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', borderRadius: 8,
                border: `1px solid ${dark ? '#3F3F46' : '#D4D4D8'}`,
                background: dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5',
                color: colors.textPrimary,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.12)' : '#E4E4E7' }}
              onMouseLeave={e => { e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5' }}
            >
              기업 카드 보기
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { GRADE_COLORS, FONTS } from '../constants/theme'
import { API } from '../lib/api'

const FIELD_LABELS = {
  contract_amount:        { label: '계약금액',     format: 'money' },
  revenue_ratio:          { label: '매출 대비',     format: 'pct' },
  client_name:            { label: '계약 상대방',   format: 'text' },
  counterparty:           { label: '계약 상대방',   format: 'text' },
  contract_period:        { label: '계약 기간',     format: 'text' },
  contract_period_start:  { label: '계약 시작일',   format: 'text' },
  prev_revenue:           { label: '직전 매출액',   format: 'money' },
  current_revenue:        { label: '당기 매출액',   format: 'money' },
  prev_op_profit:         { label: '직전 영업이익', format: 'money' },
  current_op_profit:      { label: '당기 영업이익', format: 'money' },
  current_net_income:     { label: '당기 순이익',   format: 'money' },
  op_profit_yoy:          { label: '영업이익 YoY',  format: 'pctval' },
  revenue_yoy:            { label: '매출 YoY',      format: 'pctval' },
  ratio:                  { label: '신주 배정 비율', format: 'ratio' },
  new_shares:             { label: '신주 총수',      format: 'shares' },
  record_date:            { label: '기준일',         format: 'text' },
  target:                 { label: '배정 대상자',    format: 'text' },
  amount:                 { label: '발행 가액',      format: 'money' },
  purpose:                { label: '자금 용도',      format: 'text' },
}

function fmtMoney(v) {
  if (v == null || v === '') return '\u2014'
  const n = Number(v)
  if (isNaN(n)) return String(v)
  if (Math.abs(n) >= 1e12) return `${(n / 1e12).toFixed(1)}\uC870\uC6D0`
  if (Math.abs(n) >= 1e8)  return `${(n / 1e8).toFixed(0)}\uC5B5\uC6D0`
  if (Math.abs(n) >= 1e4)  return `${(n / 1e4).toFixed(0)}\uB9CC\uC6D0`
  return `${n.toLocaleString()}\uC6D0`
}

function fmtValue(val, format) {
  if (val == null || val === '') return '\u2014'
  switch (format) {
    case 'money':  return fmtMoney(val)
    case 'pct':    return `${Number(val).toFixed(1)}%`
    case 'pctval': return `${Number(val) >= 0 ? '+' : ''}${Number(val).toFixed(1)}%`
    case 'ratio':  return `1\uC8FC\uB2F9 ${Number(val).toFixed(2)}\uC8FC`
    case 'shares': return `${Number(val).toLocaleString()}\uC8FC`
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
  const [visible, setVisible] = useState(false)
  const sheetRef = useRef(null)

  useEffect(() => {
    if (!rcept_no) return
    setLoading(true)
    fetch(`${API}/api/disclosures/${rcept_no}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [rcept_no])

  // 진입 애니메이션
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  // ESC 닫기
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 250)
  }

  const raw = data?.raw_data || {}
  const parsed = data?.parsed_data || {}
  const grade = data?.grade || ''
  const gc = GRADE_COLORS[grade] || { bg: '#A1A1AA', color: '#fff' }

  const parsedEntries = Object.entries(FIELD_LABELS).filter(
    ([key]) => parsed[key] != null && parsed[key] !== ''
  )

  const bg = dark ? '#141416' : '#FFFFFF'
  const border = dark ? '#232328' : '#EBEBEB'
  const dimBg = dark ? '#0F0F11' : '#F8F8FA'

  return (
    <>
      {/* 오버레이 */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.4)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* 중앙 모달 */}
      <div
        ref={sheetRef}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: visible ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.95)',
          zIndex: 1001,
          background: bg,
          borderRadius: 16,
          width: 'min(94%, 480px)',
          maxHeight: '88vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          opacity: visible ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >

        {/* 헤더 */}
        <div style={{
          padding: '4px 16px 14px',
          borderBottom: `1px solid ${border}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {grade && (
                  <span style={{
                    background: gc.bg, color: gc.color,
                    fontSize: 11, fontWeight: 800,
                    padding: '3px 8px', borderRadius: 5,
                    fontFamily: FONTS.mono, flexShrink: 0,
                  }}>{grade}</span>
                )}
                {raw.corp_cls && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                    background: dimBg, color: colors.textMuted,
                  }}>
                    {{ Y: 'KOSPI', K: 'KOSDAQ', N: 'KONEX' }[raw.corp_cls] || raw.corp_cls}
                  </span>
                )}
              </div>
              <div style={{
                fontSize: 18, fontWeight: 700, color: colors.textPrimary,
                fontFamily: FONTS.serif, marginBottom: 4,
              }}>
                {data?.corp_name || raw.corp_name || '\u2014'}
              </div>
              <div style={{
                fontSize: 13, color: colors.textSecondary, lineHeight: 1.4,
              }}>
                {data?.report_nm || raw.report_nm || ''}
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                background: dimBg, border: 'none', cursor: 'pointer',
                borderRadius: 10, width: 32, height: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: colors.textMuted, fontSize: 15, flexShrink: 0,
                minHeight: 44, minWidth: 44,
              }}
            >x</button>
          </div>

          {/* 접수일 + 종목코드 */}
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            {raw.rcept_dt && (
              <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono }}>
                {fmtRceptDt(raw.rcept_dt)}
              </span>
            )}
            {raw.stock_code && (
              <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono }}>
                {raw.stock_code}
              </span>
            )}
          </div>
        </div>

        {/* 바디 */}
        {(loading || parsedEntries.length > 0) && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', WebkitOverflowScrolling: 'touch' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[80, 100, 60].map((w, i) => (
                  <div key={i} style={{
                    height: 16, width: `${w}%`, borderRadius: 6,
                    background: dimBg, animation: 'dsm-pulse 1.4s infinite',
                  }} />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {parsedEntries.map(([key, meta]) => (
                  <div key={key} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 14px', borderRadius: 10,
                    background: dimBg,
                    minHeight: 44,
                  }}>
                    <span style={{ fontSize: 13, color: colors.textSecondary, flexShrink: 0 }}>
                      {meta.label}
                    </span>
                    <span style={{
                      fontSize: 14, fontWeight: 700, fontFamily: FONTS.mono,
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
          padding: '12px 16px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
          borderTop: `1px solid ${border}`,
          display: 'flex', gap: 8,
          flexShrink: 0,
        }}>
          {!rcept_no?.startsWith('KIND_') ? (
            <a
              className="touch-press"
              href={`${DART_URL}${rcept_no}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                flex: 1, padding: '12px', borderRadius: 12,
                border: `1px solid ${border}`,
                background: 'transparent',
                color: colors.textSecondary,
                fontSize: 14, fontWeight: 600,
                textDecoration: 'none',
                minHeight: 48,
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              DART 원문
            </a>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              flex: 1, padding: '12px', borderRadius: 12,
              border: `1px solid ${border}`,
              background: 'transparent',
              color: colors.textMuted,
              fontSize: 12, fontWeight: 500,
              minHeight: 48,
            }}>
              DART 원문 등록 대기 중
            </div>
          )}

          {(raw.corp_code || data?.corp_code || raw.stock_code) && (
            <button
              className="touch-press"
              onClick={() => {
                // corp_code 우선, 없으면 stock_code
                const cc = data?.corp_code || raw.corp_code || data?.stock_code || raw.stock_code
                if (cc) {
                  onViewCard?.(cc)
                }
                handleClose()
              }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                flex: 1, padding: '12px', borderRadius: 12,
                border: 'none',
                background: dark ? '#FAFAFA' : '#18181B',
                color: dark ? '#18181B' : '#FAFAFA',
                fontSize: 14, fontWeight: 700,
                cursor: 'pointer',
                minHeight: 48,
              }}
            >
              기업 카드 보기
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <style>{`@keyframes dsm-pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </>
  )
}

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM } from '../constants/theme'
import { apiFetch } from '../lib/api'

// 전략별 메타 (QuantPage와 동일 구조)
const STRATEGY_META = {
  golden_cross: {
    label: '골든크로스',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
  bollinger: {
    label: '볼린저 반등',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.2)',
  },
  volume_surge: {
    label: '거래량 폭발',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.2)',
  },
  breakout: {
    label: '신고가 돌파',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.2)',
  },
}

const STRATEGY_KEYS = ['golden_cross', 'bollinger', 'volume_surge', 'breakout']

// 팝업 내 표시할 최대 종목 수
const POPUP_MAX = 10

function fmtChange(val) {
  if (val == null || isNaN(val)) return '-'
  const n = Number(val)
  const sign = n > 0 ? '+' : ''
  return sign + n.toFixed(2) + '%'
}

function fmtPrice(val) {
  if (val == null || isNaN(val)) return '-'
  return Number(val).toLocaleString()
}

// 팝업 종목 행
function PopupStockRow({ item, strategy, onSelect, colors, dark }) {
  const meta = STRATEGY_META[strategy]
  const change = Number(item.change_pct)
  const changeColor = change > 0 ? '#059669' : change < 0 ? '#2563EB' : '#71717A'
  const strength = Math.round(item.signal_strength || 0)

  return (
    <div
      onClick={() => onSelect(item.stock_code)}
      style={{
        display: 'flex', alignItems: 'center',
        padding: '12px 16px', cursor: 'pointer',
        borderRadius: 10, gap: 12,
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.04)' : '#F9FAFB'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* 신호 강도 원형 배지 */}
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: meta.bg, border: `1.5px solid ${meta.border}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 800, color: meta.color, fontFamily: FONTS.mono, lineHeight: 1 }}>
          {strength}
        </span>
        <span style={{ fontSize: 8, color: meta.color, opacity: 0.7, marginTop: 1 }}>강도</span>
      </div>

      {/* 종목명 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700,
          color: dark ? '#FAFAFA' : '#18181B',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: FONTS.serif,
        }}>
          {item.corp_name || item.stock_code}
        </div>
        <div style={{ fontSize: 11, color: '#71717A', fontFamily: FONTS.mono, marginTop: 1 }}>
          {item.stock_code}
        </div>
      </div>

      {/* 가격 + 등락률 */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontSize: 16, fontWeight: 800, fontFamily: FONTS.mono,
          color: changeColor, letterSpacing: '-0.02em',
        }}>
          {item.change_pct == null ? '—' : `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`}
        </div>
        {item.close_price && (
          <div style={{ fontSize: 11, color: '#71717A', fontFamily: FONTS.mono, marginTop: 1 }}>
            {fmtPrice(item.close_price)}원
          </div>
        )}
      </div>

      {/* 화살표 */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </div>
  )
}

// 신호 강도 미니 바
function StrengthBar({ value, color }) {
  return (
    <div style={{
      width: '100%',
      height: '3px',
      borderRadius: '2px',
      backgroundColor: 'rgba(0,0,0,0.06)',
      overflow: 'hidden',
      marginTop: '4px',
    }}>
      <div style={{
        width: `${Math.min(100, value)}%`,
        height: '100%',
        backgroundColor: color,
        borderRadius: '2px',
      }} />
    </div>
  )
}

export default function QuantPopup({ onViewCard }) {
  const { colors, dark } = useTheme()
  const [open, setOpen] = useState(false)
  const [activeStrategy, setActiveStrategy] = useState('golden_cross')
  const [strategies, setStrategies] = useState({})
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [pulsing, setPulsing] = useState(false)
  const autoOpenedRef = useRef(false)

  // 데이터 로드
  const loadData = useCallback(() => {
    if (loaded) return
    setLoading(true)
    setError(null)
    apiFetch('/api/quant/signals')
      .then((res) => {
        const strats = res.strategies || {}
        setStrategies(strats)
        setLoaded(true)
        // 신호가 있으면 배지 펄스 + 자동 팝업 (최초 1회)
        const total = Object.values(strats).reduce((s, v) => s + (v?.length || 0), 0)
        if (total > 0) {
          setPulsing(true)
          setTimeout(() => setPulsing(false), 4000)
          if (!autoOpenedRef.current) {
            autoOpenedRef.current = true
            setOpen(true)
            // 8초 후 자동 닫힘 (사용자가 이미 닫았으면 무시)
            setTimeout(() => setOpen(prev => prev ? false : prev), 8000)
          }
        }
      })
      .catch((e) => {
        console.error('QuantPopup 데이터 로드 실패:', e)
        setError('데이터 로드 실패')
      })
      .finally(() => setLoading(false))
  }, [loaded])

  // 페이지 로드 시 자동으로 데이터 가져오기
  useEffect(() => {
    const timer = setTimeout(loadData, 2000)  // 2초 후 백그라운드 로드
    return () => clearTimeout(timer)
  }, [loadData])

  // 팝업 열기
  const handleOpen = () => {
    setOpen(true)
    loadData()
  }

  // 팝업 닫기
  const handleClose = () => setOpen(false)

  // 종목 클릭
  const handleSelect = (stockCode) => {
    handleClose()
    if (onViewCard) onViewCard(stockCode)
  }

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  const currentItems = (strategies[activeStrategy] || []).slice(0, POPUP_MAX)
  const meta = STRATEGY_META[activeStrategy]

  // 총 신호 수 (배지용)
  const totalSignals = Object.values(strategies).reduce((s, v) => s + (v?.length || 0), 0)

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={handleOpen}
        aria-label="Quant 신호 보기"
        style={{
          position: 'fixed',
          bottom: '80px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '10px 16px',
          borderRadius: '24px',
          border: 'none',
          backgroundColor: '#0D9488',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: 700,
          fontFamily: FONTS.body,
          cursor: 'pointer',
          boxShadow: pulsing
            ? '0 4px 20px rgba(13,148,136,0.6)'
            : '0 4px 16px rgba(13,148,136,0.35)',
          animation: pulsing ? 'quantBtnPulse 0.8s ease-in-out infinite' : 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#0F766E'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(13,148,136,0.45)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#0D9488'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(13,148,136,0.35)'
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        Quant
        {totalSignals > 0 && (
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            padding: '1px 5px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255,255,255,0.25)',
            color: '#fff',
            minWidth: '16px',
            textAlign: 'center',
          }}>
            {totalSignals}
          </span>
        )}
      </button>

      {/* 오버레이 + 모달 */}
      {open && (
        <>
          {/* 배경 오버레이 */}
          <div
            onClick={handleClose}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1001,
              backgroundColor: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(2px)',
            }}
          />

          {/* 모달 */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1002,
              width: '480px',
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: '80vh',
              borderRadius: '20px',
              backgroundColor: colors.bgCard,
              border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
              boxShadow: dark
                ? '0 24px 80px rgba(0,0,0,0.6)'
                : '0 24px 80px rgba(0,0,0,0.18)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              animation: 'quantModalIn 0.22s ease-out',
            }}
          >
            {/* 모달 헤더 */}
            <div style={{
              padding: '20px 20px 14px',
              borderBottom: `1px solid ${dark ? '#27272A' : '#F4F4F5'}`,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexShrink: 0,
              background: dark
                ? 'linear-gradient(135deg, rgba(13,148,136,0.08), transparent)'
                : 'linear-gradient(135deg, rgba(13,148,136,0.04), transparent)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: '17px', fontWeight: 700,
                    color: colors.textPrimary, fontFamily: FONTS.serif,
                  }}>
                    오늘의 퀀트 신호
                  </span>
                  {!loading && totalSignals > 0 && (
                    <span style={{
                      background: '#0D9488', color: '#fff',
                      fontSize: 10, fontWeight: 800,
                      padding: '2px 8px', borderRadius: 20,
                    }}>{totalSignals}개 감지</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: colors.textMuted }}>
                  종목을 클릭하면 상세 기업 카드로 이동합니다
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{
                  background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                  border: 'none', cursor: 'pointer',
                  color: colors.textMuted, padding: '6px 8px',
                  borderRadius: 8, lineHeight: 1, fontSize: 14,
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { e.target.style.background = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.target.style.background = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }}
              >
                ✕
              </button>
            </div>

            {/* 전략 탭 */}
            <div style={{
              display: 'flex',
              borderBottom: `1px solid ${colors.border}`,
              overflowX: 'auto',
              flexShrink: 0,
              scrollbarWidth: 'none',
            }}>
              {STRATEGY_KEYS.map((key) => {
                const m = STRATEGY_META[key]
                const active = activeStrategy === key
                const cnt = (strategies[key] || []).length
                return (
                  <button
                    key={key}
                    onClick={() => setActiveStrategy(key)}
                    style={{
                      flex: '1 0 auto',
                      padding: '8px 4px',
                      border: 'none',
                      borderBottom: active ? `2px solid ${m.color}` : '2px solid transparent',
                      backgroundColor: 'transparent',
                      color: active ? m.color : colors.textMuted,
                      fontSize: '11px',
                      fontWeight: active ? 700 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.12s ease',
                      marginBottom: '-1px',
                    }}
                  >
                    {m.label}
                    {!loading && cnt > 0 && (
                      <span style={{
                        marginLeft: '3px',
                        fontSize: '9px',
                        padding: '1px 4px',
                        borderRadius: '6px',
                        backgroundColor: active ? m.color : colors.border,
                        color: active ? '#fff' : colors.textMuted,
                      }}>
                        {cnt}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* 종목 목록 */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 4px',
            }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '32px', color: colors.textMuted, fontSize: '13px' }}>
                  <div style={{ marginBottom: '8px', fontSize: '20px' }}>⚡</div>
                  스캔 중...
                </div>
              ) : error ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#EF4444', fontSize: '13px' }}>
                  {error}
                </div>
              ) : currentItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: colors.textMuted, fontSize: '13px' }}>
                  <div style={{ marginBottom: '8px', fontSize: '20px' }}>📊</div>
                  신호 없음
                </div>
              ) : (
                currentItems.map((item) => (
                  <PopupStockRow
                    key={item.stock_code}
                    item={item}
                    strategy={activeStrategy}
                    onSelect={handleSelect}
                    colors={colors}
                    dark={dark}
                  />
                ))
              )}
            </div>

            {/* 하단: 전체 보기 링크 */}
            <div style={{
              padding: '10px 16px',
              borderTop: `1px solid ${colors.border}`,
              flexShrink: 0,
            }}>
              <button
                onClick={() => {
                  handleClose()
                  window.location.hash = '#/quant'
                }}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: `1px solid ${colors.border}`,
                  backgroundColor: 'transparent',
                  color: colors.textSecondary,
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.12s ease',
                  fontFamily: FONTS.body,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0D9488'
                  e.currentTarget.style.color = '#fff'
                  e.currentTarget.style.borderColor = '#0D9488'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = colors.textSecondary
                  e.currentTarget.style.borderColor = colors.border
                }}
              >
                전체 보기 →
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes quantBtnPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 4px 16px rgba(13,148,136,0.35); }
          50% { transform: scale(1.06); box-shadow: 0 6px 24px rgba(13,148,136,0.65); }
        }
        @keyframes quantModalIn {
          from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
          to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </>
  )
}

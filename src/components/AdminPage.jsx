import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'

const ADMIN_EMAIL = 'j07087815@gmail.com'

export function isAdmin() {
  try {
    const user = JSON.parse(localStorage.getItem('dart_user'))
    return user?.email === ADMIN_EMAIL
  } catch {
    return false
  }
}

export default function AdminPage() {
  const { colors, dark } = useTheme()
  const navigate = useNavigate()
  const [disclosures, setDisclosures] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/')
      return
    }
    fetch(`${API}/api/admin/disclosures?limit=200`)
      .then(r => r.json())
      .then(d => setDisclosures(d.disclosures || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const sep = dark ? '#1E1E22' : '#F0F0F2'

  return (
    <div style={{
      maxWidth: 720, margin: '0 auto', padding: '24px 20px 80px',
      fontFamily: FONTS.body,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <div style={{
          width: 8, height: 8, borderRadius: 4,
          background: '#DC2626',
        }} />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: colors.textPrimary, margin: 0 }}>
          관리자 — 프리미엄 공시
        </h1>
        <span style={{
          fontSize: 11, fontWeight: 600, color: '#DC2626',
          padding: '2px 8px', borderRadius: 4,
          background: dark ? 'rgba(220,38,38,0.1)' : 'rgba(220,38,38,0.06)',
          marginLeft: 'auto',
        }}>
          {disclosures.length}건
        </span>
      </div>

      <div style={{
        fontSize: 13, color: colors.textMuted, marginBottom: 20, lineHeight: 1.6,
      }}>
        이사회결의, 주주총회소집, BW, 합병/분할, 전환권행사 등<br />
        일반 유저에게 노출되지 않는 프리미엄 전용 공시입니다.
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>로딩 중...</div>
      ) : disclosures.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: colors.textMuted }}>
          아직 수집된 프리미엄 공시가 없습니다.
        </div>
      ) : (
        <div style={{
          borderRadius: 12, overflow: 'hidden',
          border: `1px solid ${sep}`,
          background: dark ? '#141416' : '#fff',
        }}>
          {disclosures.map((d, i) => {
            const kstTime = d.created_at ? (() => {
              const dt = new Date(d.created_at)
              const k = new Date(dt.getTime() + 9 * 3600000)
              return `${k.getUTCMonth() + 1}/${k.getUTCDate()} ${String(k.getUTCHours()).padStart(2, '0')}:${String(k.getUTCMinutes()).padStart(2, '0')}`
            })() : ''

            return (
              <div key={d.rcept_no}
                onClick={() => d.corp_code ? navigate(`/deep-dive/${d.corp_code}`) : null}
                style={{
                  padding: '14px 16px', cursor: d.corp_code ? 'pointer' : 'default',
                  borderBottom: i < disclosures.length - 1 ? `1px solid ${sep}` : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = dark ? 'rgba(255,255,255,0.03)' : '#FAFAFA'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    background: '#DC2626', color: '#fff',
                  }}>{d.grade}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary }}>
                    {d.corp_name}
                  </span>
                  <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: FONTS.mono, marginLeft: 'auto' }}>
                    {kstTime}
                  </span>
                </div>
                <div style={{
                  fontSize: 13, color: colors.textMuted, lineHeight: 1.4,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {d.report_nm}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

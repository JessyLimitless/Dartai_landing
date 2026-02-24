import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import FlowDashboard from './FlowDashboard'
import IndustryDashboard from './IndustryDashboard'
import ValuationDashboard from './ValuationDashboard'
import { useTheme } from '../contexts/ThemeContext'
import { PREMIUM } from '../constants/theme'

const TABS = [
  { key: 'flow', label: '외국인 수급' },
  { key: 'industry', label: 'Industry' },
  { key: 'valuation', label: 'Valuation' },
]

const VALID_TABS = TABS.map(t => t.key)

export default function MarketPage({ onViewCard }) {
  const { colors, dark } = useTheme()
  const [searchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const initialTab = VALID_TABS.includes(tabParam) ? tabParam : 'flow'
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (VALID_TABS.includes(tabParam)) setActiveTab(tabParam)
  }, [tabParam])

  return (
    <div>
      {/* Sub-tab bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '12px 2rem',
        borderBottom: `1px solid ${colors.border}`,
        backgroundColor: colors.bgCard,
      }}>
        <div style={{
          display: 'inline-flex',
          gap: '4px',
          padding: '4px',
          borderRadius: '10px',
          backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#F4F4F5',
        }}>
          {TABS.map((t) => {
            const active = activeTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  padding: '7px 20px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: active ? 600 : 500,
                  backgroundColor: active ? colors.bgCard : 'transparent',
                  color: active ? PREMIUM.accent : colors.textSecondary,
                  boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = colors.textPrimary
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = colors.textSecondary
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {activeTab === 'flow' && <FlowDashboard onViewCard={onViewCard} />}
      {activeTab === 'industry' && <IndustryDashboard onViewCard={onViewCard} />}
      {activeTab === 'valuation' && <ValuationDashboard onViewCard={onViewCard} />}
    </div>
  )
}

import React from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS } from '../constants/theme'
import CustomerAnalysisPage from './CustomerAnalysisPage'

export default function DeepDataPage({ onViewCard }) {
  const { colors } = useTheme()

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 16px' }}>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 700, fontFamily: FONTS.serif,
          color: colors.textPrimary, margin: 0,
        }}>
          Deep Data
        </h1>
        <p style={{
          fontSize: 13, color: colors.textMuted, margin: '4px 0 0',
        }}>
          시간외 거래 데이터 기반 업종별 수익률 패턴 분석
        </p>
      </div>

      <CustomerAnalysisPage embedded />
    </div>
  )
}

import React from 'react'
import {
  RadarChart as RechartsRadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts'
import { useTheme } from '../contexts/ThemeContext'
import { tooltipStyle } from './ChartPrimitives'

const LABELS = ['CCC', '레버리지', '희석리스크', '안전마진', '모멘텀']

export default function RadarChart({ factors = [], size = 200 }) {
  const { colors, dark } = useTheme()
  const scores = factors.length >= 5 ? factors : [5, 5, 5, 5, 5]

  const data = LABELS.map((label, i) => ({
    subject: label,
    value: scores[i],
    fullMark: 10,
  }))

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="65%">
          <PolarGrid stroke={colors.border} strokeOpacity={0.6} />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fontSize: 10, fill: colors.textSecondary }}
          />
          <PolarRadiusAxis
            domain={[0, 10]}
            tick={{ fontSize: 8, fill: colors.textMuted }}
            axisLine={false}
            tickCount={5}
          />
          <Tooltip
            formatter={(value) => [value.toFixed(1), '점수']}
            contentStyle={tooltipStyle(colors, dark)}
          />
          <Radar
            dataKey="value"
            stroke={colors.accent}
            fill={colors.accent}
            fillOpacity={0.2}
            strokeWidth={2}
            dot={{ r: 3, fill: colors.accent }}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}

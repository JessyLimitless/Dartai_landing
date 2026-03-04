import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const LABELS = ['CCC', '레버리지', '희석리스크', '안전마진']
const N = 4
const MAX_SCORE = 10
const GRID_LEVELS = 4

function polarToXY(cx, cy, r, angleRad) {
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) }
}

export default function RadarChart({ factors = [], size = 200 }) {
  const { colors } = useTheme()
  const scores = factors.length >= N ? factors.slice(0, N) : Array(N).fill(5)

  const cx = size / 2
  const cy = size / 2
  const r = size * 0.30          // 도형 반경
  const labelR = size * 0.44     // 라벨 반경
  const startAngle = -Math.PI / 2 // 꼭짓점: 위 → 오른쪽 → 아래 → 왼쪽

  const angles = Array.from({ length: N }, (_, i) => startAngle + (2 * Math.PI * i) / N)
  const outerPts = angles.map(a => polarToXY(cx, cy, r, a))
  const labelPts = angles.map(a => polarToXY(cx, cy, labelR, a))

  // 배경 격자 (동심 4각형)
  const gridLevels = Array.from({ length: GRID_LEVELS }, (_, lvl) => {
    const ratio = (lvl + 1) / GRID_LEVELS
    return angles.map(a => polarToXY(cx, cy, r * ratio, a))
  })

  // 데이터 폴리곤
  const dataPts = angles.map((a, i) => polarToXY(cx, cy, r * Math.min((scores[i] || 0) / MAX_SCORE, 1), a))
  const toPoints = pts => pts.map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')

  // 라벨 텍스트 정렬 보정
  const labelAnchor = (i) => {
    const x = labelPts[i].x
    if (x < cx - 2) return 'end'
    if (x > cx + 2) return 'start'
    return 'middle'
  }
  const labelBaseline = (i) => {
    const y = labelPts[i].y
    if (y < cy - 2) return 'auto'
    if (y > cy + 2) return 'hanging'
    return 'central'
  }

  return (
    <svg width={size} height={size} aria-label="4대 변수 레이더 차트">
      {/* 축선 */}
      {outerPts.map((pt, i) => (
        <line key={`ax-${i}`}
          x1={cx} y1={cy} x2={pt.x} y2={pt.y}
          stroke={colors.border} strokeOpacity={0.5} strokeWidth={1}
        />
      ))}

      {/* 동심 4각형 격자 */}
      {gridLevels.map((pts, lvl) => (
        <polygon key={`grid-${lvl}`}
          points={toPoints(pts)}
          fill="none"
          stroke={colors.border} strokeOpacity={0.35} strokeWidth={1}
        />
      ))}

      {/* 데이터 영역 */}
      <polygon
        points={toPoints(dataPts)}
        fill={colors.accent} fillOpacity={0.22}
        stroke={colors.accent} strokeWidth={2}
      />

      {/* 꼭짓점 점 */}
      {dataPts.map((pt, i) => (
        <circle key={`dot-${i}`}
          cx={pt.x} cy={pt.y} r={3}
          fill={colors.accent}
        />
      ))}

      {/* 라벨 */}
      {labelPts.map((pt, i) => (
        <text key={`lbl-${i}`}
          x={pt.x} y={pt.y}
          textAnchor={labelAnchor(i)}
          dominantBaseline={labelBaseline(i)}
          fontSize={9}
          fill={colors.textSecondary}
          fontFamily="sans-serif"
        >
          {LABELS[i]}
        </text>
      ))}
    </svg>
  )
}

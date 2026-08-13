import { useState, useEffect } from 'react'
import { FONTS } from '../constants/theme'
import { API } from '../lib/api'

/**
 * 랜딩 최상단 거시지표 밴드.
 *
 * 1) 지표 숫자와 등락까지만 낸다. "수출 수혜 / 무차입 안전지대" 같은 해석은 붙이지 않는다 —
 *    2026-08-13 실측에서 부채비율로 가른 금리 민감도가 방향만 맞고 크기가 없었다
 *    (β=-0.0222%p/bp, 금리 1σ=4.85bp에 스프레드 0.11%p). 근거가 생기기 전까지 사실만 전달한다.
 *
 * 2) 색은 **라이트 고정**이다. LandingPage.jsx가 useTheme을 쓰지 않고 라이트 컬러를
 *    하드코딩(38곳)한 라이트 전용 페이지라, 이 밴드만 테마를 따라가면 검은 띠 하나가
 *    흰 페이지에 박힌다. 다크를 지원하려면 랜딩 전체를 함께 옮겨야 한다.
 */
const ITEMS = [
  { key: 'USD/KRW', label: '원/달러', unit: '원', digits: 2 },
  { key: 'JPY/KRW', label: '원/100엔', unit: '원', digits: 2 },
  { key: 'KR3Y', label: '국고채 3년', unit: '%', digits: 2 },
]

const BG = '#FCFCFD'
const LINE = '#F1F1F3'
const MUTED = '#A1A1AA'
const FAINT = '#C4C4C8'

export default function MacroTicker() {
  const [data, setData] = useState(null)

  useEffect(() => {
    const load = () => {
      fetch(`${API}/api/macro-ticker`)
        .then(r => (r.ok ? r.json() : null))
        .then(d => { if (d && Object.keys(d).length > 0) setData(d) })
        .catch(() => {})
    }
    load()
    const iv = setInterval(load, 5 * 60 * 1000)
    return () => clearInterval(iv)
  }, [])

  if (!data) return null
  const items = ITEMS.filter(i => data[i.key])
  if (items.length === 0) return null

  // 계열마다 기준일이 다를 수 있다(국고채는 환율보다 하루 늦게 확정되는 날이 있다).
  // 상단 도장은 최신일을 쓰고, 그보다 낡은 항목엔 개별 날짜를 따로 붙인다.
  const asOf = items.map(i => data[i.key]?.date).filter(Boolean).sort().pop()

  return (
    <section style={{
      borderTop: `1px solid #F4F4F5`,
      borderBottom: `1px solid #F4F4F5`,
      background: BG,
      position: 'relative',
    }}>
      {/* 좁은 화면에서 항목이 잘릴 때 더 있다는 걸 알리는 페이드 */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 34,
        pointerEvents: 'none',
        background: `linear-gradient(to right, transparent, ${BG})`,
      }} />

      <style>{`
        .macro-band { display: flex; align-items: stretch; gap: 0;
          max-width: 1040px; margin: 0 auto;
          padding: 0 clamp(20px, 5vw, 40px);
          overflow-x: auto; scrollbar-width: none; }
        .macro-band::-webkit-scrollbar { display: none; }
        /* 내용보다 좁아지면 글자가 겹치므로 절대 shrink 시키지 않는다.
           남는 공간에서만 늘어나고, 좁은 화면에서는 밴드가 가로 스크롤된다. */
        .macro-cell { flex: 1 0 auto; min-width: max-content; padding: 16px 0 15px;
          display: flex; align-items: baseline; gap: 9px; }
        .macro-cell + .macro-cell { padding-left: 22px; }
        @media (max-width: 640px) {
          .macro-cell { padding: 13px 0 12px; }
          .macro-cell + .macro-cell { padding-left: 14px; }
        }
      `}</style>

      <div className="macro-band">
        {items.map((item, idx) => {
          const d = data[item.key]
          const up = d.change > 0
          const down = d.change < 0
          const accent = up ? '#DC2626' : down ? '#2563EB' : FAINT

          return (
            <div
              key={item.key}
              className="macro-cell"
              style={{ borderLeft: idx === 0 ? 'none' : `1px solid ${LINE}` }}
            >
              <span style={{
                fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                letterSpacing: '0.02em', color: MUTED,
              }}>{item.label}</span>

              <span style={{
                fontSize: 17, fontWeight: 700, fontFamily: FONTS.mono,
                letterSpacing: '-0.02em', whiteSpace: 'nowrap', color: '#18181B',
              }}>
                {d.value.toLocaleString(undefined, {
                  minimumFractionDigits: item.digits,
                  maximumFractionDigits: item.digits,
                })}
                <span style={{
                  fontSize: 11, fontWeight: 500, marginLeft: 2, color: MUTED,
                }}>{item.unit}</span>
              </span>

              <span style={{
                fontSize: 11.5, fontWeight: 700, fontFamily: FONTS.mono,
                color: accent, whiteSpace: 'nowrap',
              }}>
                {up ? '▲' : down ? '▼' : '·'}
                {d.change_val !== undefined
                  ? Math.abs(d.change_val).toFixed(item.digits)
                  : Math.abs(d.change).toFixed(2)}
              </span>

              {d.date && d.date !== asOf && (
                <span style={{
                  fontSize: 9.5, whiteSpace: 'nowrap', color: FAINT,
                }}>{d.date.slice(5)}</span>
              )}
            </div>
          )
        })}

        {asOf && (
          <div style={{
            display: 'flex', alignItems: 'center', paddingLeft: 22,
            fontSize: 10, whiteSpace: 'nowrap', color: FAINT,
          }}>{asOf} 종가</div>
        )}
      </div>
    </section>
  )
}

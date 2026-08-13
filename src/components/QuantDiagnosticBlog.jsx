import React from 'react'
import { FONTS } from '../constants/theme'

/* ═══════════════════════════════════════════════════════════
   퀀트 진단 보고서 — AI/Quant Research 합류 1주차
   PRD "DART Pick AI 퀀트 엔진 구축 및 가상 매매 트레이딩 최적화"(v1.0)에
   대한 응답. 원장 실측 위에서만 쓴다.

   데이터 스냅샷: 2026-08-13 로컬 원장
   - data/picks/*.json 52파일 (픽 43일 · no_pick 2 · unrecorded 7 · 총 61행)
   - data/pick_model_log.md 2026-08-08 측정 회차
   - sim_paper.py:40,200-205 (운영룰 구현 확인)
   ═══════════════════════════════════════════════════════════ */

export default function QuantDiagnosticBlog({ colors, dark, sep }) {
  const h1 = { fontSize: 26, fontWeight: 900, color: colors.textPrimary, margin: 0, fontFamily: FONTS.serif, lineHeight: 1.3 }
  const h2 = { fontSize: 19, fontWeight: 800, color: colors.textPrimary, margin: '48px 0 14px', fontFamily: FONTS.serif }
  const h3 = { fontSize: 15, fontWeight: 700, color: colors.textPrimary, margin: '28px 0 10px' }
  const p = { fontSize: 14, color: colors.textSecondary, lineHeight: 1.85, margin: '0 0 16px' }
  const quote = { borderLeft: '3px solid #DC2626', paddingLeft: 16, margin: '20px 0', fontSize: 14, color: colors.textSecondary, lineHeight: 1.8 }
  const badge = (bg) => ({ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: bg, color: '#fff', marginRight: 6 })
  const mono = { fontFamily: FONTS.mono, fontSize: 12, color: colors.textPrimary, background: dark ? '#1A1A1E' : '#F4F4F5', padding: '16px 18px', borderRadius: 10, margin: '14px 0 18px', lineHeight: 1.7, overflowX: 'auto', whiteSpace: 'pre' }
  const tblWrap = { overflowX: 'auto', margin: '14px 0 22px' }
  const tbl = { width: '100%', fontSize: 12, borderCollapse: 'collapse', minWidth: 480 }
  const th = { textAlign: 'left', padding: '8px 10px', fontWeight: 700, color: colors.textPrimary, borderBottom: `2px solid ${dark ? '#333' : '#D4D4D8'}`, fontSize: 11, whiteSpace: 'nowrap' }
  const td = { padding: '8px 10px', borderBottom: `1px solid ${sep}`, color: colors.textSecondary, fontSize: 12, lineHeight: 1.5, verticalAlign: 'top' }
  const num = { ...td, fontFamily: FONTS.mono, textAlign: 'right', whiteSpace: 'nowrap' }
  const divider = { height: 1, background: sep, margin: '40px 0' }
  const strong = { color: colors.textPrimary, fontWeight: 700 }
  const sev = (lv) => lv === 'red' ? '#DC2626' : lv === 'orange' ? '#D97706' : lv === 'green' ? '#16A34A' : lv === 'blue' ? '#2563EB' : colors.textMuted
  const chip = (text, lv) => (
    <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: `${sev(lv)}1A`, color: sev(lv), whiteSpace: 'nowrap' }}>{text}</span>
  )
  const card = (accent) => ({
    padding: '16px 18px', borderRadius: 12, marginBottom: 10,
    background: dark ? '#141416' : '#fff',
    border: `1px solid ${sep}`, borderLeft: `3px solid ${accent}`,
  })
  const cardLabel = { fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 6 }
  const cardBody = { fontSize: 13.5, color: colors.textSecondary, lineHeight: 1.75 }

  return (
    <div style={{ maxWidth: 680 }}>

      {/* ── 타이틀 ── */}
      <div style={{ marginBottom: 8 }}>
        <span style={badge('#DC2626')}>진단 보고서</span>
        <span style={badge(dark ? '#52525B' : '#A1A1AA')}>2026-08-13</span>
        <span style={badge(dark ? '#52525B' : '#A1A1AA')}>AI · Quant Research</span>
      </div>
      <h1 style={h1}>트레일링 −12%는 무엇을 하고 있는가</h1>
      <p style={{ fontSize: 14, color: colors.textMuted, margin: '8px 0 0', lineHeight: 1.6 }}>
        DART 픽 가상매매 수익률 진단 · 합류 1주차. PRD를 받고 코드보다 원장을 먼저 열었다.
        결론부터 쓴다 — 우리는 아직 수익률을 측정할 수 있는 상태가 아니다. 그리고 그건 8주 안에 고칠 수 있다.
      </p>

      <div style={divider} />

      {/* ── 0. 요약 ── */}
      <h2 style={{ ...h2, marginTop: 0 }}>먼저 네 문장</h2>

      <div style={card('#16A34A')}>
        <div style={{ ...cardLabel, color: '#16A34A' }}>① 성과는 실재한다</div>
        <div style={cardBody}>
          운영룰(선정일 시가 진입 + 고점 대비 트레일링 −12%, 종가 확인)의 건당 평균 <b style={strong}>+7.42%</b>·중앙 <b style={strong}>+1.55%</b>는
          원장에서 실제로 나온 숫자다. 조작도 과장도 아니다.
        </div>
      </div>

      <div style={card('#DC2626')}>
        <div style={{ ...cardLabel, color: '#DC2626' }}>② 그런데 그게 시장보다 나은지는 아무도 모른다</div>
        <div style={cardBody}>
          같은 보유창의 시장 대비 초과중앙값 <b style={strong}>+0.49%</b>, 부호검정 <b style={strong}>p=1.000</b>.
          정본 구간에서 실제로 실현된 10건만 보면 초과중앙이 <b style={strong}>−0.90%</b>다.
          이건 &ldquo;알파가 없다&rdquo;가 아니라 <b style={strong}>이 표본으로는 보이지 않는다</b>는 뜻이다. 두 진술은 전혀 다르다.
        </div>
      </div>

      <div style={card('#DC2626')}>
        <div style={{ ...cardLabel, color: '#DC2626' }}>③ 룰 교체 임계 1.5%p는 표본 3,000건짜리 임계다</div>
        <div style={cardBody}>
          진입 5 × 청산 20 = 100조합에서 챔피언을 고르는 행위 자체가 잡음을 만든다.
          참 알파가 <b style={strong}>정확히 0이어도</b> 현재 표본(n=54)에서 최고 룰은 우연히 <b style={strong}>+11.9%p</b>까지 앞서 보인다.
          현행 임계는 그보다 <b style={strong}>7.9배 느슨</b>하다. 자세히 §4.
        </div>
      </div>

      <div style={card('#2563EB')}>
        <div style={{ ...cardLabel, color: '#2563EB' }}>④ 그리고 이 셋을 한 번에 푸는 수가 하나 있다</div>
        <div style={cardBody}>
          픽이 쌓이길 기다리는 게 아니라 <b style={strong}>이미 있는 공시 33,507건에 게이트를 소급 적용</b>하는 것.
          표본이 3,000이 되면 검정력이 살아나고, 임계 1.5%p가 비로소 <b style={strong}>옳은 숫자가 된다</b>(§4·§6).
        </div>
      </div>

      <div style={divider} />

      {/* ── 1. 검정력 ── */}
      <h2 style={h2}>1. 대상을 재기 전에 장비의 분해능을 쟀다</h2>
      <p style={p}>
        실험물리에서 첫 주에 하는 일은 시료 측정이 아니라 검출기의 분해능 측정이다.
        보이지 않는 것과 없는 것을 구별하지 못하면 그다음 모든 숫자가 무의미해진다.
        그래서 성과를 논하기 전에 <b style={strong}>현재 표본이 탐지할 수 있는 최소 효과크기</b>부터 계산했다.
      </p>
      <div style={tblWrap}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>모집단</th><th style={{ ...th, textAlign: 'right' }}>n</th><th style={{ ...th, textAlign: 'right' }}>탐지가능 최소 d</th><th style={{ ...th, textAlign: 'right' }}>수익률 환산</th><th style={th}>의미</th>
          </tr></thead>
          <tbody>
            {[
              ['완숙 실현분', '22', '0.597', '≈ 18.8%p', 'σ 31.5 — 대박 픽이 전부 여기 있다', 'red'],
              ['정본 구간(07-07~)', '35', '0.473', '≈ 7.8%p', 'σ 16.6 — 단 아직 안 익어서 작다', 'orange'],
              ['전수 픽', '61', '0.359', '≈ 8.5%p', '8%p 미만은 잡음과 구분 불가', 'orange'],
              ['소급 모집단(제안)', '500', '0.125', '≈ 3.0%p', '실무적으로 의미있는 구간 진입', 'green'],
              ['소급 모집단(제안)', '3,000', '0.051', '≈ 1.2%p', '수수료·슬리피지 수준까지 분해', 'green'],
            ].map((r, i) => (
              <tr key={i}>
                <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>{r[0]}</td>
                <td style={{ ...num, fontWeight: 700, color: colors.textPrimary }}>{r[1]}</td>
                <td style={num}>{r[2]}</td>
                <td style={{ ...num, color: sev(r[5]), fontWeight: 700 }}>{r[3]}</td>
                <td style={td}>{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ ...p, fontSize: 12.5, color: colors.textMuted }}>
        양측 α=0.05 · 검정력 0.80. 수익률 환산 = d × σ 이고, <b style={strong}>σ는 2026-08-13 실측값</b>이다
        (`_sigma_reconcile.py`, 현행 운영룰 기준). 초판은 전 행에 25%p를 가정했으나
        σ는 모집단마다 다르다 — 아래 상자 참조.
      </p>
      <div style={{ ...quote, borderLeft: '3px solid #D97706' }}>
        <b style={strong}>σ는 상수가 아니었다.</b> 실측하니 정본 <b style={strong}>16.6%p</b> ·
        전수 23.7%p · 산발 30.9%p · 완숙 <b style={strong}>31.5%p</b>로 <b style={strong}>2배 가까이 벌어진다.</b>
        대박 픽(+120%·+174%)이 전부 산발·완숙 구간에 있기 때문이다. 그래서 초판의 단일 σ 가정은
        <b style={strong}> 완숙 행을 낙관적으로, 정본 행을 비관적으로</b> 동시에 틀렸다
        (14.9 → 18.8 / 11.8 → 7.8).
        <br /><br />
        ⚠️ <b style={strong}>정본의 7.8%p를 그대로 믿으면 안 된다.</b> 정본 σ가 작은 건 실력이 아니라
        <b style={strong}> 아직 안 익어서</b>다. 완숙되며 큰 움직임이 실현되면 σ는 산발 수준(≈31)으로
        올라갈 수 있고, 그러면 탐지 하한도 <b style={strong}>≈14.7%p로 되돌아간다.</b> 지금 값은
        낙관 쪽으로 치우친 하한이다.
      </div>
      <div style={quote}>
        알파 측정의 <b style={strong}>p=1.000</b>은 실패한 실험이 아니다. 정상 작동하는 검출기가
        &ldquo;내 분해능 아래&rdquo;라고 보고한 것이다. 지금 필요한 건 더 좋은 전략이 아니라 <b style={strong}>더 좋은 검출기</b>다.
      </div>

      {/* ── 2. 트레일링의 실제 작용 ── */}
      <h2 style={h2}>2. 트레일링 −12%는 수익을 만들지 않는다. 분포를 성형한다</h2>
      <p style={p}>
        원장에 이미 답이 있었다. 2026-08-08 측정 회차(n=54)를 다시 읽으면, 트레일링을 평균으로 평가하는 한
        <b style={strong}> 트레일링은 항상 진다</b>. 그런데 그건 트레일링이 나쁘다는 뜻이 아니라 평균이 잘못된 자라는 뜻이다.
      </p>
      <div style={tblWrap}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>룰</th>
            <th style={{ ...th, textAlign: 'right' }}>평균</th>
            <th style={{ ...th, textAlign: 'right' }}>중앙</th>
            <th style={{ ...th, textAlign: 'right' }}>상위3 제외</th>
            <th style={{ ...th, textAlign: 'right' }}>최악</th>
          </tr></thead>
          <tbody>
            {[
              ['무트레일 T+25 종가', '+10.94', '+3.50', '+2.84', '−56.4', false],
              ['A 종가확인 −12% (현행)', '+7.42', '+1.55', '+3.11', '−22.6', true],
              ['C 실측체결 −25%', '+6.53', '+2.34', '+2.33', '−25.0', false],
              ['C 실측체결 −12%', '+0.76', '0.00', '−1.35', '−15.7', false],
            ].map((r, i) => (
              <tr key={i} style={{ background: r[5] ? (dark ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.035)') : 'transparent' }}>
                <td style={{ ...td, fontWeight: r[5] ? 700 : 600, color: colors.textPrimary }}>{r[0]}</td>
                <td style={num}>{r[1]}</td>
                <td style={num}>{r[2]}</td>
                <td style={{ ...num, fontWeight: 700, color: colors.textPrimary }}>{r[3]}</td>
                <td style={{ ...num, color: '#DC2626', fontWeight: 700 }}>{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={p}>
        평균에서는 무트레일이 <b style={strong}>3.52%p 앞선다</b>. 그런데 상위 3건을 빼면 순위가 뒤집히고(2.84 vs 3.11),
        최악값은 <b style={strong}>−56.4% 대 −22.6%</b>로 벌어진다. 트레일링이 하는 일은 이렇게 정리된다.
      </p>
      <div style={mono}>{`트레일링 -12% = 오른쪽 꼬리를 조금 자르고
                 왼쪽 꼬리를 많이 자르는 변환

  평균(1차 모멘트)     : 손해   10.94 → 7.42
  중앙값               : 손해    3.50 → 1.55
  최악값(왼쪽 꼬리)    : 이득  -56.4 → -22.6
  상위3 제외한 본체    : 이득    2.84 → 3.11`}</div>
      <p style={p}>
        이건 알파 생성기가 아니라 <b style={strong}>왜도(skewness) 변환기</b>다. 그래서 평가 지표를 바꿔야 한다.
        그리고 어떤 지표로 바꿔야 하는지는, 이 서비스가 이미 지키고 있던 규칙 안에 답이 있었다.
      </p>

      {/* ── 3. 에르고딕성 ── */}
      <h2 style={h2}>3. &ldquo;중앙값 병기&rdquo; 규칙에는 물리학적 근거가 있었다</h2>
      <p style={p}>
        HARD RULE #3은 <b style={strong}>평균만 쓰지 말고 중앙값을 반드시 병기하라</b>고 정한다.
        문서에는 이유가 &ldquo;대박 2~3건이 평균을 끌어올리므로&rdquo;라고 적혀 있다. 맞는 말이지만 이건 관행이 아니라
        <b style={strong}> 정리(theorem)</b>이고, 정리로 다시 쓰면 훨씬 강해진다.
      </p>
      <p style={p}>
        가상매매는 여러 우주에서 동시에 굴리는 게 아니다. <b style={strong}>한 자본이 시간을 따라 흐른다.</b>
        곱셈 과정에서 이런 계는 <b style={strong}>비에르고딕</b>이라, 앙상블 평균이 아니라
        시간평균 성장률 <span style={{ fontFamily: FONTS.mono }}>g = exp(E[ln(1+r)]) − 1</span>이 실제 자산을 지배한다.
      </p>
      <div style={mono}>{`로그정규 적합에서:   median = exp(mu)
                     g      = exp(E[ln(1+r)]) - 1 = exp(mu) - 1

               ⇒     g == median`}</div>
      <p style={p}>
        <b style={strong}>시간평균 성장률은 중앙값과 같아진다.</b> 이 프로젝트가 &ldquo;정직한 표기&rdquo;를 위해 지켜온 중앙값 병기는
        사실 <b style={strong}>복리 성장률을 쓰라는 말과 동일한 규칙</b>이었다. 우연이 아니라 필연이다.
      </p>
      <div style={tblWrap}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>룰</th>
            <th style={{ ...th, textAlign: 'right' }}>산술평균</th>
            <th style={{ ...th, textAlign: 'right' }}>시간평균 g</th>
            <th style={{ ...th, textAlign: 'right' }}>과대배율</th>
            <th style={{ ...th, textAlign: 'right' }}>함의 σ</th>
          </tr></thead>
          <tbody>
            {[
              ['무트레일 T+25 종가', '+10.94%', '+3.50%', '3.1×', '0.373'],
              ['A 종가확인 −12% (현행)', '+7.42%', '+1.55%', '4.8×', '0.335'],
              ['C 실측체결 −25%', '+6.53%', '+2.34%', '2.8×', '0.283'],
              ['C 실측체결 −12%', '+0.76%', '+0.01%', '76×', '0.122'],
            ].map((r, i) => (
              <tr key={i}>
                <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>{r[0]}</td>
                <td style={num}>{r[1]}</td>
                <td style={{ ...num, fontWeight: 700, color: colors.textPrimary }}>{r[2]}</td>
                <td style={{ ...num, color: '#DC2626', fontWeight: 700 }}>{r[3]}</td>
                <td style={num}>{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={quote}>
        가상매매 복리 수익률을 산술평균으로 추정하면 현행 룰에서 <b style={strong}>4.8배 과대</b>하다.
        원장에 남아 있는 &ldquo;복리 843%는 판타지&rdquo; 경고는 옳았다. 다만 그건 실수 하나가 아니라
        <b style={strong}> 비에르고딕 계의 구조적 성질</b>이다. 경고문으로 두지 말고 지표로 박아야 한다.
      </div>

      <h3 style={h3}>여기서 트레일링의 진짜 값이 드러난다</h3>
      <p style={p}>
        복리 성장은 로그 공간에서 일어나므로 왼쪽 꼬리가 비대칭적으로 파괴적이다. 최악값을 로그로 옮기면:
      </p>
      <div style={mono}>{`무트레일 최악  -56.4%  →  ln(1+r) = -0.8301
현행 -12% 최악  -22.6%  →  ln(1+r) = -0.2562

산술 차이 : 33.8%p
로그 차이 : 3.24배   ← 복리가 실제로 겪는 손상`}</div>
      <p style={p}>
        산술 세계에서 &ldquo;33.8%p 차이&rdquo;로 보이는 것이 복리 세계에서는 <b style={strong}>3.24배</b>다.
        트레일링이 평균을 3.5%p 내주고 사 온 것이 이것이다 — <b style={strong}>평균 손실로 로그 손실을 산 거래</b>이고,
        복리로 굴리는 계에서는 대체로 남는 장사다. 다만 아직 <b style={strong}>증명은 아니다</b>(§10 ②).
      </p>

      <div style={divider} />

      {/* ── 4. 다중검정 ── */}
      <h2 style={h2}>4. 챔피언 선정이 잡음과 구분되는가 — 다중검정</h2>
      <p style={p}>
        이 서비스는 진입 5종 × 청산 20종 = <b style={strong}>100조합</b>의 그리드를 돌려 챔피언을 고른다.
        그런데 여러 후보 중 <b style={strong}>최댓값을 고르는 행위 자체가 편향</b>이다.
        참 알파가 정확히 0인 세계에서도 100개 중 1등은 반드시 앞서 보인다.
      </p>
      <div style={mono}>{`[초판] SE = sigma / sqrt(n) = 0.335 / sqrt(54) = 4.56%p
[실측] SE_pair = SD(A-B) / sqrt(n) = 10.53 / sqrt(60) = 1.36%p

참 알파가 0일 때 N개 중 최댓값의 기대치:
    E[max] ≈ SE · sqrt(2 · ln N)

              초판      실측(짝지음)
    N=  5    8.18%p      2.44%p
    N= 20   11.16%p      3.33%p
    N=100   13.84%p      4.13%p   ← 현행 그리드 크기

실제 관측된 최고-현행 격차          =  3.52%p
                                       ↑ 실측 상한의 85%`}</div>
      <p style={p}>
        <b style={strong}>결론은 살아남지만 여유가 훨씬 좁다.</b> 초판은 격차가 잡음 상한의 25%라고 했는데,
        실측 상한으로 재면 <b style={strong}>85%</b>다. N_eff=30 기준 짝지은 상한 4.63%p 대비로도
        격차 3.52%p는 여전히 안쪽이라 <b style={strong}>&ldquo;유지&rdquo; 판정 자체는 바뀌지 않는다.</b>
        다만 &ldquo;통째로 잡음 안&rdquo;이라고 말할 만큼 넉넉하지는 않다.
      </p>
      <p style={p}>
        초판이 상한을 부풀린 원인은 <b style={strong}>두 개가 곱해진 것</b>이다 —
        σ 과대(<b style={strong}>1.42배</b>, 로그정규 적합이 두꺼운 꼬리를 σ로 흡수)
        × 짝 안 지음(<b style={strong}>2.24배</b>, 100개 룰이 같은 픽 위에서 도는데 단일 룰 SE를 씀)
        = 합계 <b style={strong}>3.18배</b>.
      </p>

      <h3 style={h3}>이 계산이 과거 판정들을 사후 정당화한다</h3>
      <p style={p}>
        원장을 보면 <span style={{ fontFamily: FONTS.mono }}>/pick-optimize</span>는 매 회차 <b style={strong}>&ldquo;유지&rdquo;</b>를 선택했다.
        근거는 &ldquo;교체 3박자(표본 40 + 마진 1.5%p + 고원) 미충족&rdquo;이라는 휴리스틱이었다.
        다중검정 관점에서 보면 <b style={strong}>그 판단들은 전부 옳았다</b> — 어떤 도전자도 잡음 상한을 넘은 적이 없기 때문이다.
        휴리스틱이 이유를 말하지 못한 채 맞는 일을 하고 있었다.
      </p>
      <p style={p}>
        다만 <b style={strong}>임계값 자체는 틀렸다.</b> 교체 마진은 상수일 수 없다. 표본의 함수다.
      </p>
      <div style={mono}>{`margin(n) = sigma/sqrt(n) · sqrt(2 · ln N_eff)`}</div>
      <div style={tblWrap}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>표본 n</th>
            <th style={{ ...th, textAlign: 'right' }}>초판 마진</th>
            <th style={{ ...th, textAlign: 'right' }}>실측 마진 (N_eff=30)</th>
            <th style={{ ...th, textAlign: 'right' }}>현행 1.5%p 대비</th>
          </tr></thead>
          <tbody>
            {[
              ['22 (완숙)', '18.63%p', '5.86%p', '3.9× 느슨', 'red'],
              ['54 (2026-08-08 측정)', '11.89%p', '3.74%p', '2.5× 느슨', 'orange'],
              ['200', '6.18%p', '1.94%p', '1.3× 느슨', 'green'],
              ['1,000', '2.76%p', '0.87%p', '되레 빡빡', 'green'],
              ['3,000 (소급 제안)', '1.60%p', '0.50%p', '되레 빡빡', 'green'],
            ].map((r, i) => (
              <tr key={i} style={{ background: r[4] === 'green' ? (dark ? 'rgba(22,163,74,0.07)' : 'rgba(22,163,74,0.04)') : 'transparent' }}>
                <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>{r[0]}</td>
                <td style={num}>{r[1]}</td>
                <td style={{ ...num, fontWeight: 700, color: colors.textPrimary }}>{r[2]}</td>
                <td style={{ ...num, color: sev(r[4]), fontWeight: 700 }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={quote}>
        <b style={strong}>초판의 &ldquo;1.5%p는 표본 3,000건짜리 숫자다&rdquo;는 틀렸다.</b>
        짝지어 실측하면 <b style={strong}>n≈200에서 이미 적정</b>해진다(1.94%p). 3,000에서는
        되레 현행 임계가 <b style={strong}>느슨한 게 아니라 빡빡해진다</b>(0.50%p).
        <br /><br />
        이건 §6의 소급 모집단 대공사가 <b style={strong}>임계를 옳게 만들기 위해서는 필요 없다</b>는 뜻이다.
        다만 팩터 8개를 추정하려면 <span style={{ fontFamily: FONTS.mono }}>n/p ≥ 10</span> 요구가 별개로 살아 있어
        <b style={strong}> 큰 표본은 여전히 필요하다</b> — 이유가 바뀐 것이지 결론이 뒤집힌 게 아니다.
      </div>
      <p style={{ ...p, fontSize: 12.5, color: colors.textMuted }}>
        보완: 정식 처리는 Deflated Sharpe Ratio(Bailey &amp; López de Prado)로, 시행 횟수와 룰 간 상관을 함께 넣어
        조정된 유의성을 계산한다. 위 근사는 그 하한을 손으로 잡은 것이다.
      </p>

      <div style={divider} />

      {/* ── 5. KPI 감사 ── */}
      <h2 style={h2}>5. PRD KPI 감사 — 무엇이 8주 안에 가능한가</h2>
      <p style={p}>
        KPI 네 개를 현재 축적 속도(정본 구간 <b style={strong}>1.25픽/거래일</b>)에 대고 계산했다. 반박이 아니라 <b style={strong}>표본 계산</b>이다.
      </p>
      <div style={tblWrap}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>KPI</th><th style={th}>판정</th><th style={th}>근거</th>
          </tr></thead>
          <tbody>
            <tr>
              <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>편향 0% 백테스트</td>
              <td style={td}>{chip('8주 내 가능', 'green')}</td>
              <td style={td}>네 개 중 <b style={strong}>유일하게 데이터가 이미 있다.</b> 공시 33,507건 · price_tracks 12,706건.
                상장폐지·거래정지 편향은 실재하고 소급 교정 가능. 여기부터 한다.</td>
            </tr>
            <tr>
              <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>샤프 30% 향상</td>
              <td style={td}>{chip('현행 경로로 불가', 'red')}</td>
              <td style={td}>두 샤프 차이를 유의하게 탐지하려면 기준 SR=0.5에서 <b style={strong}>814건</b>(Lo 2002 근사).
                현재 속도로 <b style={strong}>651거래일 ≈ 2.6년</b>, SR=0.3이면 6.7년.
                <b style={strong}>단, 소급 모집단이면 즉시 충족된다.</b></td>
            </tr>
            <tr>
              <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>MDD −15% 이내</td>
              <td style={td}>{chip('정의 미비', 'orange')}</td>
              <td style={td}>MDD는 <b style={strong}>포트폴리오 지표</b>인데 우리에겐 픽 단위 지표만 있다.
                포지션 사이징·동시보유 상한이 없어 아직 계산될 수 없다.
                <b style={strong}>KPI가 아니라 선행 설계 항목</b>으로 옮겨야 한다(§8 B3).</td>
            </tr>
            <tr>
              <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>500ms 레이턴시</td>
              <td style={td}>{chip('병목 아님', 'red')}</td>
              <td style={td}>진입이 <b style={strong}>다음 거래일 시가</b>라 시그널→체결 총 지연은 1.5~11시간이다.
                암달의 법칙상 500ms를 <b style={strong}>0으로 만들어도</b> 전체 단축 상한은 <b style={strong}>0.0013%</b>.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={p}>
        레이턴시가 무의미한 건 <b style={strong}>진입 모델이 다음 시가이기 때문</b>이지 기술적으로 무가치해서가 아니다.
        당일 장중 진입으로 바꾸면 500ms에 값이 생긴다. 다만 익일 진입(<span style={{ fontFamily: FONTS.mono }}>E_next</span>)에서
        두 룰이 모두 붕괴한 측정이 이미 있고, 진입 모델 변경은 성과 전체를 재정의한다.
        <b style={strong}> 레이턴시는 진입 모델 결정의 종속 변수</b>다. 순서를 지켜야 한다.
      </p>

      <div style={divider} />

      {/* ── 6. 핵심 제안 ── */}
      <h2 style={h2}>6. 핵심 제안 — 표본은 픽이 아니라 공시다</h2>
      <p style={p}>
        모든 논의가 &ldquo;픽 61건&rdquo;에 묶여 있다. 완숙 40건을 기다리자는 말도, 룰 교체를 미루자는 말도 이 숫자 앞에서 멈춘다.
        그런데 <b style={strong}>픽은 사람이 만드는 병목</b>이라 하루 1.25개씩만 늘어난다. 검정력은 √n으로 자라므로
        표본을 열 배로 만드는 데 <b style={strong}>2년 반</b>이 걸린다.
      </p>
      <p style={p}>
        하지만 파이프라인을 분해하면 사람이 병목인 구간은 <b style={strong}>맨 끝 한 칸뿐</b>이다.
      </p>
      <div style={mono}>{`공시 33,507건 ─→ [게이트: 기계] ─→ 후보 ─→ [원문 검증: 사람] ─→ 픽 61
                      ↑                            ↑
                 소급 적용 가능              소급 불가능
                 (룰이 결정적이므로)         (판단이 남아있지 않으므로)`}</div>
      <p style={p}>
        게이트는 결정적 룰이다. 과거 공시에 되돌려 적용하면 <b style={strong}>&ldquo;이 룰이 3년간 돌았다면&rdquo;의 반사실 모집단</b>이
        오늘 만들어진다. 표본 61 → 수천. 검정력은 <b style={strong}>15%p에서 1.3%p로</b> 간다.
      </p>

      <h3 style={h3}>사람 단계를 빼도 잃는 게 없다 — 오히려 그게 측정이다</h3>
      <p style={p}>
        반론이 예상된다. &ldquo;원문 검증이 우리 해자인데 그걸 빼면 무슨 의미냐.&rdquo; 타당한 지적이고, 답은 원장에 있다.
        위약 대조군에서 <b style={strong}>사람 단계의 기여는 p=0.363으로 아직 확인되지 않았다.</b>
        확인되지 않은 것을 표본 확보의 전제조건으로 삼으면 순환이 된다 — 사람의 기여를 재려면 표본이 필요한데,
        표본을 만들려면 사람이 필요하다는 구조다.
      </p>
      <div style={quote}>
        기계 게이트만으로 만든 소급 모집단은 사람 단계를 <b style={strong}>버리는</b> 게 아니라,
        사람 기여를 재는 <b style={strong}>대조군</b>이 된다. 같은 기간·같은 게이트에서 사람이 통과시킨 픽과
        게이트가 뱉은 전체를 비교하면, p=0.363을 처음으로 검정력 있게 다시 물을 수 있다.
      </div>
      <p style={p}>
        <b style={strong}>두 모집단은 서로 다른 질문에 답하며 대체 관계가 아니다.</b> 이걸 섞으면 안 된다.
      </p>
      <div style={tblWrap}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>모집단</th><th style={th}>답하는 질문</th><th style={th}>규모</th><th style={th}>한계</th>
          </tr></thead>
          <tbody>
            <tr>
              <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>소급(기계 게이트)</td>
              <td style={td}>이 <b style={strong}>룰</b>이 알파를 갖는가</td>
              <td style={{ ...td, fontFamily: FONTS.mono, fontWeight: 700, color: colors.textPrimary }}>수천</td>
              <td style={td}>실제로 집행된 적 없음. 게이트의 과거 재현성에 의존</td>
            </tr>
            <tr>
              <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>실시간(현행 픽)</td>
              <td style={td}>우리 <b style={strong}>운영</b>이 그 룰을 집행할 수 있는가</td>
              <td style={{ ...td, fontFamily: FONTS.mono, fontWeight: 700, color: colors.textPrimary }}>61</td>
              <td style={td}>검정력 부족. 데이터 커버리지 75.0%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ ...p, fontSize: 12.5, color: colors.textMuted }}>
        커버리지 주석: 정본 구간 28거래일 중 <span style={{ fontFamily: FONTS.mono }}>unrecorded</span> 7일 → 데이터 커버리지 21/28 = 75.0%.
        파일 커버리지는 seal 스텁 때문에 항상 100%로 나오므로 전수 논의에 쓰면 안 된다.
      </p>

      <div style={divider} />

      {/* ── 7. capacity ── */}
      <h2 style={h2}>7. 시장충격 모델 — PRD가 맞았지만 이유가 다르다</h2>
      <p style={p}>
        PRD REQ 1.2는 슬리피지·시장충격을 <b style={strong}>백테스트 정밀도</b>를 위해 요구한다. 필요하다는 데 동의한다.
        다만 이 서비스에서 그 모델의 진짜 값은 정밀도가 아니라 <b style={strong}>용량(capacity)</b>이다.
      </p>
      <p style={p}>
        픽 다수가 PBR&lt;1 소형주이고, 관측 사례 중에는 일평균 거래대금 1.8억 종목과
        갭상승으로 <b style={strong}>체결 자체가 불가능했던 건</b>이 이미 원장에 있다. 제곱근 충격 법칙을 대면 질문이 바뀐다.
      </p>
      <div style={mono}>{`ΔP/P  ≈  Y · sigma · sqrt(Q / V)     (square-root impact law)

  Q = 주문 규모 · V = 일평균 거래대금 · sigma = 일간 변동성

질문이 바뀐다:
  (기존)  백테스트가 정확한가?
  (제안)  이 전략은 얼마까지 담을 수 있는가?`}</div>
      <p style={p}>
        이건 기술 질문이 아니라 <b style={strong}>사업 질문</b>이다. 성적표에 최근 붙은 <b style={strong}>원금 10억 복리 시뮬레이션</b>이
        정확히 이 검증을 요구한다. 1,000만원에서 성립하는 수익률이 10억에서 성립하지 않으면
        그 시뮬레이션은 성과가 아니라 <b style={strong}>측정되지 않은 가정</b>이다.
        원장도 같은 말을 이미 하고 있었다 — <i>&ldquo;복리는 소액에서만 성립한다&rdquo;</i>.
        나는 그 문장을 <b style={strong}>숫자로 바꾸려는 것</b>이다. 산출물은 &ldquo;자본 규모 → 실현 가능 수익률&rdquo; 곡선 하나다.
      </p>

      <div style={divider} />

      {/* ── 8. 개선 로드맵 ── */}
      <h2 style={h2}>8. 향후 개선방안 — 12건</h2>
      <p style={p}>
        비용과 선행조건을 기준으로 세 티어로 나눴다. <b style={strong}>티어 A는 신규 데이터가 한 건도 필요 없다</b> —
        이미 있는 원장을 다시 계산하는 것만으로 답이 나온다. 티어 B는 지금 새고 있는 데이터를 막는 수리다.
        티어 C가 8주의 본체다.
      </p>

      <h3 style={h3}>티어 A — 재계산만으로 답이 나오는 것 (신규 데이터 0)</h3>
      <div style={tblWrap}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>#</th><th style={th}>개선안</th><th style={th}>왜</th><th style={th}>산출물</th>
          </tr></thead>
          <tbody>
            {[
              ['A1', '성적표에 시간평균 성장률 g 병기',
                '산술평균이 복리를 4.8배 과대평가(§3). 원계열 로그수익 직접 계산으로 로그정규 가정도 제거',
                '/api/pick/feedback에 g 필드'],
              ['A2', '룰 판정 기준을 평균 → g + 다중검정 마진',
                '평균 기준은 트레일링에 구조적으로 불리(§2). 교체 마진을 상수 1.5%p → margin(n) 함수로(§4)',
                'sim_backtest.py 판정부'],
              ['A3', 'ratchet 계열을 g 기준으로 재계산',
                '평균으로는 졌지만 꼬리를 더 자르는 룰이라 g에서 역전 가능. 데이터 추가 0건으로 답이 나옴',
                '재계산 리포트'],
              ['A4', '재픽 중복의 독립성 위반 정량화',
                '전수 61행 중 7종목이 14행(23.0%)을 차지. 같은 종목 재픽은 보유창이 겹치면 상관 → p값이 낙관 쪽으로 편향',
                'dedup 모집단 병기'],
            ].map((r, i) => (
              <tr key={i}>
                <td style={{ ...td, fontFamily: FONTS.mono, fontWeight: 700, color: '#16A34A' }}>{r[0]}</td>
                <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>{r[1]}</td>
                <td style={td}>{r[2]}</td>
                <td style={{ ...td, fontFamily: FONTS.mono, fontSize: 11 }}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={h3}>티어 B — 새고 있는 데이터부터 막기</h3>
      <div style={tblWrap}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>#</th><th style={th}>개선안</th><th style={th}>왜</th><th style={th}>긴급도</th>
          </tr></thead>
          <tbody>
            {[
              ['B1', '진입일 당일 장중 관측 결측 수리',
                '관측기가 픽 당일 레코드를 만들지 않아 진입 당일 스냅샷이 항상 0. 장중 경로는 소멸성 데이터라 오늘 안 잡으면 영원히 없다',
                '최우선', 'red'],
              ['B2', '픽 게이트를 DART 직접 조회로',
                '게이트가 로컬 DB(30%)를 보는데 브리핑은 DART 직접(893건)을 본다. 데이터 커버리지 75%의 원인이자 경로 문제라 시점을 옮겨도 안 고쳐짐',
                '높음', 'red'],
              ['B3', '포지션 사이징 정의 (1/n 고정부터)',
                'MDD KPI가 계산되기 위한 선행조건. Risk Parity는 표본이 없으므로 나중',
                '중간', 'orange'],
              ['B4', '건당 수익 σ 실측 — 완료(08-13)',
                '실측 결과 σ는 단일값이 아니었다(정본 16.6 ~ 완숙 31.5). §1·§4 반영 완료. 남은 것은 정본이 완숙되며 σ가 산발 수준으로 올라가는지 재측정',
                '완료', 'green'],
            ].map((r, i) => (
              <tr key={i}>
                <td style={{ ...td, fontFamily: FONTS.mono, fontWeight: 700, color: '#D97706' }}>{r[0]}</td>
                <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>{r[1]}</td>
                <td style={td}>{r[2]}</td>
                <td style={td}>{chip(r[3], r[4])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={h3}>티어 C — 구조 (8주의 본체)</h3>
      <div style={tblWrap}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>#</th><th style={th}>개선안</th><th style={th}>내용 · 근거</th>
          </tr></thead>
          <tbody>
            {[
              ['C1', '소급 모집단 구축',
                '게이트 재현성 검증 → 공시 33,507건에 소급 적용 → 상장폐지·정지 포함. 표본 61 → 수천. 다른 모든 항목이 여기에 의존'],
              ['C2', '위약 대조군 재검정',
                '같은 날 같은 시총·업종 풀에서 무작위 N종을 뽑아 같은 룰로 돌린 분포와 비교. p=0.363을 처음으로 검정력 있게 다시 묻는다'],
              ['C3', '변동성 정규화 트레일링 (k·σ)',
                '아래 별도 설명. 파라미터를 1개만 추가하므로 자유도 비용 최소'],
              ['C4', 'capacity 곡선',
                '제곱근 충격 법칙으로 "자본 규모 → 실현 가능 수익률". 10억 복리 시뮬의 전제를 검증(§7)'],
            ].map((r, i) => (
              <tr key={i}>
                <td style={{ ...td, fontFamily: FONTS.mono, fontWeight: 700, color: '#2563EB' }}>{r[0]}</td>
                <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>{r[1]}</td>
                <td style={td}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={h3}>C3 상세 — 고정 12%는 종목마다 다른 룰이다</h3>
      <p style={p}>
        현행 트레일링은 모든 종목에 <b style={strong}>동일한 12%</b>를 건다. 그런데 종목별 변동성이 다르면
        같은 12%가 <b style={strong}>전혀 다른 강도의 룰</b>이 된다.
      </p>
      <div style={tblWrap}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>종목 일간 σ</th><th style={{ ...th, textAlign: 'right' }}>12% 스톱까지</th><th style={th}>실효 강도</th>
          </tr></thead>
          <tbody>
            {[['3%', '4.0 σ', '거의 안 걸림', 'green'],
              ['5%', '2.4 σ', '적정', 'green'],
              ['8%', '1.5 σ', '너무 타이트', 'orange'],
              ['12%', '1.0 σ', '평상 등락에도 발동', 'red']].map((r, i) => (
              <tr key={i}>
                <td style={num}>{r[0]}</td>
                <td style={{ ...num, fontWeight: 700, color: colors.textPrimary }}>{r[1]}</td>
                <td style={td}>{chip(r[2], r[3])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={p}>
        저변동 종목엔 사실상 무트레일이고, 고변동 종목엔 평상 등락에도 발동한다.
        <b style={strong}> 물리적으로 잘못된 스케일링</b>이다. 폭을 <span style={{ fontFamily: FONTS.mono }}>k·σ</span>로 정규화하면
        모든 종목에서 실효 강도가 균일해진다. PRD REQ 3.1의 &ldquo;적응형 파라미터&rdquo;가 정당화되는 지점이 정확히 여기다 —
        시장 VIX 연동보다 <b style={strong}>종목 σ 정규화가 먼저</b>다. 그리고 파라미터를 12% → k 하나로 <b style={strong}>바꾸는</b> 것이라
        자유도가 늘지 않는다.
      </p>
      <p style={{ ...p, fontSize: 12.5, color: colors.textMuted }}>
        ⚠️ 단 C3은 티어 C다. 현재 표본에서 k를 튜닝하면 §4의 함정에 그대로 빠진다.
        <b style={{ color: colors.textSecondary }}> C1 이후에만 착수한다.</b>
      </p>

      <div style={divider} />

      {/* ── 9. 8주 재배열 ── */}
      <h2 style={h2}>9. 8주 재배열</h2>
      <p style={p}>
        EPIC은 그대로 두되 <b style={strong}>순서를 바꾼다.</b> 원 PRD는 엔진을 먼저 만들고 데이터를 나중에 쓰는 배열인데,
        이 프로젝트의 병목은 엔진이 아니라 표본이다.
      </p>
      <div style={tblWrap}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>단계</th><th style={th}>PRD 원안</th><th style={th}>제안</th><th style={th}>바꾸는 이유</th>
          </tr></thead>
          <tbody>
            {[
              ['W1–2', '백테스팅 파이프라인', '검정력 지도 + 티어 A 전건 + B1 수리',
                '무엇을 언제 알 수 있는지 지도를 먼저 그린다. 티어 A는 신규 데이터가 필요 없어 1~2주에 끝난다'],
              ['W3–4', '슬리피지 엔진', 'C1 소급 모집단 (공시 33,507 × 상폐 포함)',
                '8주 전체에서 가장 큰 레버. 나머지가 전부 여기에 의존한다'],
              ['W5–6', '공시 팩터화', '소급 모집단 위에서 팩터화 + C2 위약 대조군',
                '자유도가 생긴 뒤에 쓴다. 순서를 지키면 같은 작업이 과적합에서 추정으로 바뀐다'],
              ['W7–8', '파라미터 최적화', 'C3 σ 정규화 + C4 capacity + 그리드 재실행',
                '이때 비로소 그리드를 돌릴 수 있다 — 아래 설명'],
            ].map((r, i) => (
              <tr key={i}>
                <td style={{ ...td, fontFamily: FONTS.mono, fontWeight: 700, color: colors.textPrimary, whiteSpace: 'nowrap' }}>{r[0]}</td>
                <td style={{ ...td, color: colors.textMuted }}>{r[1]}</td>
                <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>{r[2]}</td>
                <td style={td}>{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={h3}>파라미터 최적화를 마지막에 두는 이유</h3>
      <p style={p}>
        PRD REQ 3.1의 그리드 서치를 <b style={strong}>지금</b> 하면 §4에서 계산한 잡음을 진짜 개선으로 채택하게 된다.
        여기에 자유도 문제가 겹친다. PRD가 명시한 팩터만 세어도 8개다
        (자금조달 목적·리픽싱·납입일·발행규모 비율·최대주주 지분변동률·임원 매수·임원 매도·정정 횟수).
      </p>
      <div style={tblWrap}>
        <table style={tbl}>
          <thead><tr>
            <th style={th}>모집단</th><th style={{ ...th, textAlign: 'right' }}>n</th><th style={{ ...th, textAlign: 'right' }}>팩터 8개 기준 n/p</th><th style={th}>판정</th>
          </tr></thead>
          <tbody>
            {[['전수 픽', '61', '7.6', 'orange', '하한 미달'],
              ['정본 구간', '35', '4.4', 'red', '추정 불안정'],
              ['완숙 실현분', '22', '2.8', 'red', '사실상 보간'],
              ['소급 모집단(제안)', '3,000', '375', 'green', '충분']].map((r, i) => (
              <tr key={i}>
                <td style={{ ...td, fontWeight: 600, color: colors.textPrimary }}>{r[0]}</td>
                <td style={num}>{r[1]}</td>
                <td style={{ ...num, fontWeight: 700, color: sev(r[3]) }}>{r[2]}</td>
                <td style={td}>{chip(r[4], r[3])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={p}>
        안정적 계수 추정의 통상 하한은 <span style={{ fontFamily: FONTS.mono }}>n/p ≥ 10~20</span>이다.
        현행 표본에서 팩터 8개를 최적화하는 것은 <b style={strong}>데이터를 설명하는 게 아니라 외우는 것</b>이다.
        그러니 &ldquo;그리드를 돌리지 말자&rdquo;가 아니라 <b style={strong}>W3–4가 성공해야 W7–8에서 비로소 돌릴 수 있다</b>는 뜻이다.
      </p>
      <p style={p}>
        이 판단은 내 것이 아니라 원장에 이미 있던 것이기도 하다 — A/40%가 평균 10.35로 1위였지만
        <b style={strong}> 174% 단일 픽이 만든 절벽</b>이라 기각한 2026-08-08 결정이 정확히 같은 논리다.
        나는 그 직관을 <b style={strong}>계산 가능한 임계로 일반화</b>하려는 것뿐이다.
      </p>

      <div style={divider} />

      {/* ── 10. 반증 조건 ── */}
      <h2 style={h2}>10. 내가 틀릴 수 있는 지점</h2>
      <p style={p}>이 보고서가 원장에 남는다면 반증 조건도 함께 남아야 한다. 세 군데다.</p>
      <div style={card('#D97706')}>
        <div style={{ ...cardLabel, color: '#D97706' }}>① 소급 모집단은 게이트의 과거 재현성에 의존한다</div>
        <div style={cardBody}>
          게이트가 과거 공시에서 지금과 동일하게 작동한다는 보장이 없다. 공시 서식이 바뀐 구간이 있으면 거기서 깨진다
          (PRD 리스크 #2가 지적한 그것). <b style={strong}>W3 첫 산출물은 모집단이 아니라 재현성 검증 리포트여야 한다.</b>
          재현이 안 되는 구간은 채우지 말고 잘라낸다. 여기서 실패하면 §6 전체가 무너지고, 8주 계획은 재작성된다.
        </div>
      </div>
      <div style={card('#D97706')}>
        <div style={{ ...cardLabel, color: '#D97706' }}>② 로그정규 가정은 편의이고, 낙관 쪽으로 틀린다</div>
        <div style={cardBody}>
          §3의 g는 평균·중앙값으로 역산한 값이지 원계열 로그수익의 직접 평균이 아니다.
          실제 분포는 꼬리가 더 두꺼울 가능성이 높고, 그러면 실제 g는 내 추정보다 <b style={strong}>낮다</b>.
          A1이 이걸 즉시 대체한다 — 그래서 A1을 1순위에 뒀다.
        </div>
      </div>
      <div style={card('#16A34A')}>
        <div style={{ ...cardLabel, color: '#16A34A' }}>③ σ=0.335는 적합값이다 → <b>해결(2026-08-13)</b></div>
        <div style={cardBody}>
          실측했다. <b style={strong}>내 예측은 방향이 반대였다</b> — &ldquo;실측 σ가 더 크면 더 보수적으로
          재작성해야 한다&rdquo;고 썼는데, 실제 σ는 더 <b style={strong}>작았다</b>(전수 23.7 vs 적합 33.5).
          로그정규 적합이 두꺼운 꼬리를 σ로 흡수해 부풀린 것이다.
          <br /><br />
          더 중요한 건 <b style={strong}>σ가 단일값이 아니었다는 점</b>이다(정본 16.6 ~ 완숙 31.5).
          단일 σ를 전 행에 쓴 탓에 §1은 완숙 행을 낙관·정본 행을 비관으로 <b style={strong}>동시에</b> 틀렸다.
          내 자기비판이 &ldquo;값이 얼마냐&rdquo;를 물었지 &ldquo;하나이긴 하냐&rdquo;를 묻지 않은 것이 진짜 사각이었다.
          <br /><br />
          §1의 d 열과 <span style={{ fontFamily: FONTS.mono }}>sqrt(2·lnN)</span> 배수가 σ와 무관해 더 단단하다는
          진술은 <b style={strong}>맞았다</b> — 그 두 열은 이번 정정에서 그대로다.
        </div>
      </div>

      <div style={divider} />

      {/* ── 11. 마무리 ── */}
      <h2 style={h2}>11. 첫 주를 한 줄로</h2>
      <div style={{
        padding: '22px 24px', borderRadius: 14,
        background: dark ? 'rgba(220,38,38,0.07)' : 'rgba(220,38,38,0.04)',
        border: `1px solid ${dark ? 'rgba(220,38,38,0.2)' : 'rgba(220,38,38,0.15)'}`,
        marginBottom: 18,
      }}>
        <div style={{ fontSize: 15.5, color: colors.textPrimary, lineHeight: 1.85, fontFamily: FONTS.serif, fontWeight: 600 }}>
          우리는 −12%가 좋은 숫자인지 모른다.<br />
          그런데 −12%가 <b>무엇을 하는지</b>는 안다 — 꼬리를 자른다.<br />
          다음 8주는 그 자르기가 시간평균 성장률을 올리는지를
          <b> 볼 수 있는 장비를 만드는 데</b> 쓴다.
        </div>
      </div>
      <p style={p}>
        수익률을 올리는 일부터 하지 않는 이유는 하나다. <b style={strong}>지금은 올렸는지 알 수 없기 때문이다.</b>
        분해능 15%p인 검출기 앞에서 파라미터를 돌리면 얻는 건 개선이 아니라 <b style={strong}>개선했다는 착각</b>이고,
        그 착각은 되돌리기가 매우 어렵다 — 코드에 굳고, 성적표에 실리고, 나중에 실제 자본이 그 위에 얹히기 때문이다.
      </p>
      <p style={p}>
        반대로 장비를 먼저 만들면 그 뒤의 모든 최적화가 <b style={strong}>검증 가능한 작업</b>이 된다.
        8주 뒤에 내가 내놓고 싶은 건 더 높은 수익률이 아니라 <b style={strong}>수익률을 신뢰할 수 있게 된 상태</b>다.
      </p>
      <p style={p}>
        마지막으로 하나 덧붙인다. 이 보고서에서 내가 제안한 것 중 <b style={strong}>새로운 아이디어는 거의 없다.</b>
        중앙값 병기도, 상위3 제외 검토도, 174% 절벽 기각도, &ldquo;복리는 소액에서만&rdquo;도 전부 원장에 이미 있었다.
        내가 한 일은 그 직관들이 <b style={strong}>왜 옳은지를 계산으로 바꾸고, 상수를 함수로 바꾼 것</b>이다.
        좋은 신호다 — 이 팀은 이미 맞는 방향으로 판단하고 있었고, 다만 그걸 <b style={strong}>측정할 장비가 없었을 뿐</b>이다.
      </p>

      {/* ── 출처 ── */}
      <div style={{ ...divider, margin: '36px 0 18px' }} />
      <div style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.8 }}>
        <div style={{ fontWeight: 700, marginBottom: 6, color: colors.textSecondary }}>데이터 출처 · 스냅샷 2026-08-13</div>
        <div>· 픽 원장 <span style={{ fontFamily: FONTS.mono }}>data/picks/*.json</span> 52파일 — 픽 43일 · no_pick 2일 · unrecorded 7일 · 총 61행(정본 35 / 산발 26)</div>
        <div>· 성과·꼬리·알파 수치 <span style={{ fontFamily: FONTS.mono }}>data/pick_model_log.md</span> 2026-08-08 회차
          (<span style={{ fontFamily: FONTS.mono }}>_trail_vs_none.py</span> n=54 · <span style={{ fontFamily: FONTS.mono }}>_alpha_study.py</span> · <span style={{ fontFamily: FONTS.mono }}>_fill_order_study.py</span> 스냅샷 8,874)</div>
        <div>· 운영룰 구현 확인 <span style={{ fontFamily: FONTS.mono }}>sim_paper.py:40,200-205</span> — <span style={{ fontFamily: FONTS.mono }}>close &lt;= peak*(1-0.12)</span>, 종가 판정</div>
        <div>· 검정력 · 다중검정 · 암달 · 에르고딕 · 자유도 계산은 본 보고서에서 직접 수행. 가정은 §10에 명시</div>
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px dashed ${sep}` }}>
          이 보고서는 매매를 권유하지 않으며, 인용된 성과는 전부 <b style={{ color: colors.textSecondary }}>종가 확인 집행</b>을 전제한 과거 기록이다.
          장중 스톱 주문으로 집행하면 같은 −12%가 +7.42% → +0.76%로 무너진다.
        </div>
      </div>

    </div>
  )
}

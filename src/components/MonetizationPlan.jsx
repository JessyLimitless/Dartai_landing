import React from 'react'
import { FONTS } from '../constants/theme'

/**
 * 전략기획 — 유료화 설계서 (MONETIZATION_PRD.md 의 화면판)
 *
 * 원본: dart-insight/MONETIZATION_PRD.md (v1.1, 2026-08-19)
 * 이 화면은 요약판이다. 수치·근거는 원본과 동일하게 유지할 것 —
 * 화면에서만 숫자를 고치면 두 문서가 어긋난다.
 *
 * 스타일은 StrategyBlog / QuantDiagnosticBlog 와 동일한 에디토리얼 문법을 따른다
 * (maxWidth 680 · serif 제목 · 좌측 빨강 인용 · mono 블록). 앱 문법을 벗어나지 않는다.
 */
export default function MonetizationPlan({ colors, dark, sep }) {
  const h1 = { fontSize: 26, fontWeight: 900, color: colors.textPrimary, margin: 0, fontFamily: FONTS.serif, lineHeight: 1.3 }
  const h2 = { fontSize: 19, fontWeight: 800, color: colors.textPrimary, margin: '48px 0 14px', fontFamily: FONTS.serif }
  const h3 = { fontSize: 15, fontWeight: 700, color: colors.textPrimary, margin: '28px 0 10px' }
  const p = { fontSize: 14, color: colors.textSecondary, lineHeight: 1.85, margin: '0 0 16px' }
  const quote = { borderLeft: '3px solid #DC2626', paddingLeft: 16, margin: '20px 0 24px', fontSize: 14.5, color: colors.textPrimary, lineHeight: 1.8, fontWeight: 500 }
  const badge = (bg) => ({ display: 'inline-block', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: bg, color: '#fff', marginRight: 6 })
  const tbl = { width: '100%', fontSize: 12.5, borderCollapse: 'collapse', margin: '14px 0 22px' }
  const th = { textAlign: 'left', padding: '8px 10px', fontWeight: 700, color: colors.textPrimary, borderBottom: `2px solid ${dark ? '#333' : '#D4D4D8'}`, fontSize: 11 }
  const td = { padding: '8px 10px', borderBottom: `1px solid ${sep}`, color: colors.textSecondary, fontSize: 12.5, lineHeight: 1.5, verticalAlign: 'top' }
  const tdNum = { ...td, fontFamily: FONTS.mono, whiteSpace: 'nowrap' }
  const cardBox = { padding: '16px 18px', borderRadius: 12, border: `1px solid ${sep}`, background: dark ? '#141416' : '#fff', marginBottom: 10 }
  const divider = { height: 1, background: sep, margin: '40px 0' }
  const label = { fontSize: 11, fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }
  const b = { color: colors.textPrimary, fontWeight: 600 }
  const warn = { ...cardBox, borderLeft: '3px solid #D97706', background: dark ? '#1C1710' : '#FFFBEB' }
  const scroll = { overflowX: 'auto' }

  return (
    <div style={{ maxWidth: 680 }}>

      {/* ── 타이틀 ── */}
      <div style={{ marginBottom: 8 }}>
        <span style={badge('#DC2626')}>전략기획</span>
        <span style={badge(dark ? '#52525B' : '#A1A1AA')}>v1.1 · 2026-08-19</span>
      </div>
      <h1 style={h1}>유료화 설계서</h1>
      <p style={{ fontSize: 14, color: colors.textMuted, margin: '8px 0 0', lineHeight: 1.6 }}>
        투자 수익을 파는 회사에서, 정보에 값을 매기는 회사로.
      </p>
      <div style={divider} />

      {/* ── 1. 한 문장 전략 ── */}
      <h2 style={h2}>한 문장 전략</h2>
      <div style={quote}>
        투자 수익을 파는 회사가 아니라, 정보에 값을 매기는 회사가 된다.
      </div>
      <p style={p}>
        투자 수익 모델은 <b style={b}>"고객이 돈을 벌었는가"</b>로 검증당한다.
        우리는 그 검증을 통과하지 못한다 — 시장 초과수익 중앙 +0.49%, <b style={b}>p=1.000</b>.
      </p>
      <p style={p}>
        정보 서비스 모델은 <b style={b}>"그 정보가 정확하고, 빠짐없고, 빠른가"</b>로 검증당한다.
        이건 우리가 통과할 수 있고, 이미 하고 있는 일이다.
      </p>
      <p style={p}>
        블룸버그 단말이 비싼 이유는 그걸 쓴 사람이 돈을 벌어서가 아니다.
        <b style={b}> 정보 서비스는 고객의 손익과 무관하게 값이 매겨진다.</b>
      </p>

      {/* ── 2. 현 위치 ── */}
      <h2 style={h2}>현 위치 — 매출 0, 외부 사용자 0~1명</h2>
      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>지표</th><th style={th}>실측</th></tr></thead>
          <tbody>
            <tr><td style={td}>구독자</td><td style={td}>등록 3건 — 활성 2건 <b style={b}>모두 본인 계정</b>, 1건 테스트<br /><span style={{ color: '#DC2626', fontWeight: 700 }}>외부 구독자 0명</span></td></tr>
            <tr><td style={td}>가입 유저</td><td style={td}>2명 — 본인 + 1명(로그인 1회)<br /><span style={{ color: '#DC2626', fontWeight: 700 }}>실사용 외부 0~1명</span></td></tr>
            <tr><td style={td}>결제</td><td style={td}>코드 없음 — <code>/premium</code>은 문의 페이지</td></tr>
            <tr><td style={td}>매출</td><td style={tdNum}>0</td></tr>
          </tbody>
        </table>
      </div>
      <div style={warn}>
        <div style={label}>기준선</div>
        <p style={{ ...p, margin: 0 }}>
          검증된 외부 수요는 <b style={b}>0</b>이다. 이 문서의 모든 목표는 0에서 출발하며,
          그래서 첫 관문이 매출이 아니라 <b style={b}>"외부인 한 명이 두 번 오는가"</b>다.
        </p>
      </div>

      <h3 style={h3}>가진 것 — 정보 서비스의 재고</h3>
      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>자산</th><th style={th}>규모</th><th style={th}>재현</th></tr></thead>
          <tbody>
            <tr><td style={td}>공시 (운영)</td><td style={tdNum}>125,602건</td><td style={td}>중</td></tr>
            <tr><td style={td}>일봉</td><td style={tdNum}>178,580행 / 2,633종</td><td style={td}>낮음</td></tr>
            <tr><td style={td}>공시 시점 스냅샷</td><td style={tdNum}>14,432행</td><td style={td}><b style={b}>높음</b></td></tr>
            <tr><td style={td}>장중 10분 가격경로</td><td style={td}>운영 중</td><td style={td}><b style={{ color: '#DC2626' }}>재현 불가</b></td></tr>
            <tr><td style={td}>픽 원장</td><td style={tdNum}>64픽 / 45일</td><td style={td}><b style={{ color: '#DC2626' }}>재현 불가</b></td></tr>
            <tr><td style={td}>임원 특정증권 공시</td><td style={tdNum}>7,467건</td><td style={td}>중</td></tr>
            <tr><td style={td}>신용잔고 시계열</td><td style={tdNum}>2,581종 · 14.8MB</td><td style={td}>중</td></tr>
            <tr><td style={td}>재무 딥분석</td><td style={tdNum}>675편 (통과분)</td><td style={td}>높음</td></tr>
          </tbody>
        </table>
      </div>

      {/* ── 3. 왜 안 되는가 ── */}
      <h2 style={h2}>왜 투자 수익 모델로는 안 되는가</h2>
      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>문제</th><th style={th}>근거</th></tr></thead>
          <tbody>
            <tr><td style={td}><b style={b}>알파 미입증</b></td><td style={td}>초과수익 p=1.000 · 위약 대조군 p=0.363</td></tr>
            <tr><td style={td}><b style={b}>사람 1명 의존</b></td><td style={td}><code>/dart-pick</code>은 대화형 세션 — 크론이 못 부른다</td></tr>
            <tr><td style={td}><b style={b}>컴플라이언스</b></td><td style={td}>유료 투자판단 제공 = 유사투자자문업 검토 대상</td></tr>
          </tbody>
        </table>
      </div>
      <p style={p}>
        세 개가 각각 문제인 게 아니라 <b style={b}>곱해진다.</b> 성과로 팔 수 없고,
        팔려도 확장이 안 되고, 확장되면 규제가 온다.
      </p>
      <p style={p}>
        정보 서비스로 옮기면 셋 다 완화된다 — 검증 축이 바뀌고, 자동 생성이 가능하고,
        사실 제공이라 규제 노출이 낮아진다.
      </p>

      {/* ── 4. 수익 아키텍처 ── */}
      <h2 style={h2}>수익 아키텍처 — 6개 스트림</h2>
      <p style={p}>
        투자 수익 단일 축을 버리고, 같은 데이터 위에 6개 수익원을 세운다.
        핵심은 <b style={b}>하나의 수집 파이프라인이 여섯 번 팔린다</b>는 것이다.
      </p>
      {/* 수익 트리 — ASCII 대신 CSS. 박스문자는 한글 폭과 어긋나 가지가 밀린다 */}
      <div style={{ margin: '18px 0 26px' }}>
        <div style={{
          padding: '11px 14px', borderRadius: 10, textAlign: 'center',
          border: `1px dashed ${dark ? '#3F3F46' : '#D4D4D8'}`,
          background: dark ? '#1A1A1E' : '#F9F9FA',
          fontSize: 12.5, fontWeight: 700, color: colors.textPrimary,
        }}>
          수집 · 정형화 파이프라인
          <span style={{ fontWeight: 400, color: colors.textMuted }}> — 고정비</span>
        </div>
        <div style={{ width: 1, height: 15, background: sep, margin: '0 auto' }} />
        {/* 가지 시작선 — 첫 칸 중앙에서 마지막 칸 중앙까지(5/6 폭) */}
        <div style={{ width: '83.34%', height: 1, background: sep, margin: '0 auto' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)' }}>
          {[
            { id: 'S1', name: '구독', sub: 'B2C' },
            { id: 'S2', name: '데이터 API', sub: 'B2B' },
            { id: 'S3', name: '위젯', sub: '임베드' },
            { id: 'S4', name: '콘텐츠', sub: '라이선스' },
            { id: 'S5', name: '영문 매체', sub: '스폰서' },
            { id: 'S6', name: '제휴', sub: '리드' },
          ].map((x) => (
            <div key={x.id} style={{ textAlign: 'center' }}>
              <div style={{ width: 1, height: 13, background: sep, margin: '0 auto 7px' }} />
              <div style={{ fontFamily: FONTS.mono, fontSize: 10.5, fontWeight: 700, color: '#DC2626', letterSpacing: 0.3 }}>{x.id}</div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: colors.textPrimary, lineHeight: 1.4, marginTop: 2 }}>{x.name}</div>
              <div style={{ fontSize: 10.5, color: colors.textMuted, lineHeight: 1.4 }}>{x.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={cardBox}>
        <div style={label}>S1 · 구독 (B2C) — 주력</div>
        <p style={{ ...p, margin: 0 }}>실시간 알림 · 스크리너 · 전체 이력 · CSV. <b style={b}>전제는 무료 페이지가 만든 검색 유입.</b></p>
      </div>
      <div style={cardBox}>
        <div style={label}>S2 · 데이터 API (B2B) — 마진 최고</div>
        <p style={{ ...p, margin: 0 }}>
          정형화된 공시·내부자·공매도 피드. 원재료는 무료 공개인데 <b style={b}>정형화가 어렵다</b> —
          DS005 매핑 · KIND 회사코드 함정 · 분기금액 A/B형. 그걸 아는 게 상품이다.
          추가 생산비가 0에 가깝고 사람 시간이 안 든다.
        </p>
      </div>
      <div style={cardBox}>
        <div style={label}>S3 · 임베드 위젯</div>
        <p style={{ ...p, margin: 0 }}>종목별 위젯을 남의 사이트에 삽입. 위젯에 링크가 붙는다 = <b style={b}>백링크 = SEO 강화</b> → S1을 키운다.</p>
      </div>
      <div style={cardBox}>
        <div style={label}>S4 · 콘텐츠 라이선스</div>
        <p style={{ ...p, margin: 0 }}>재무 딥분석 675편 + 갱신 파이프라인. <b style={b}>즉시 판매 가능한 유일한 완성품.</b> 단 06월 이후 미갱신이라 파이프라인과 세트로 판다.</p>
      </div>
      <div style={cardBox}>
        <div style={label}>S5 · 영문 매체 — 가장 큰 빈 공간</div>
        <p style={{ ...p, margin: 0 }}>
          KOREA MARKET PRESS 구독·스폰서. 외국인이 코스피·코스닥 공시를 영어로 볼 수단이 사실상 없다.
          <b style={b}> 언어만 바꿔서 시장 크기를 바꾸는 유일한 레버</b> — 같은 파이프라인인데 독자 모수가 수십 배다.
        </p>
      </div>
      <div style={cardBox}>
        <div style={label}>S6 · 제휴 / 리드</div>
        <p style={{ ...p, margin: 0 }}>증권사 계좌개설 제휴. 트래픽 종속이고, 금융 제휴는 규제 확인이 선행이다.</p>
      </div>

      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>스트림</th><th style={th}>착수</th><th style={th}>사람 시간</th><th style={th}>확장성</th></tr></thead>
          <tbody>
            <tr><td style={td}>S4 콘텐츠</td><td style={td}><b style={b}>지금</b></td><td style={td}>중</td><td style={td}>낮음</td></tr>
            <tr><td style={td}>S1 구독</td><td style={td}>Phase 1</td><td style={td}>낮음</td><td style={td}>높음</td></tr>
            <tr><td style={td}>S2 API</td><td style={td}>Phase 2</td><td style={td}><b style={b}>거의 0</b></td><td style={td}><b style={b}>매우 높음</b></td></tr>
            <tr><td style={td}>S3 위젯</td><td style={td}>Phase 2</td><td style={td}>낮음</td><td style={td}>높음</td></tr>
            <tr><td style={td}>S5 영문</td><td style={td}>Phase 1 병행</td><td style={td}><b style={b}>높음</b></td><td style={td}><b style={b}>매우 높음</b></td></tr>
            <tr><td style={td}>S6 제휴</td><td style={td}>Phase 3</td><td style={td}>낮음</td><td style={td}>트래픽 종속</td></tr>
          </tbody>
        </table>
      </div>

      {/* ── 5. KPI 전환 ── */}
      <h2 style={h2}>KPI를 바꾼다</h2>
      <p style={p}>축을 바꾸면 측정 대상도 바뀐다. <b style={b}>이게 전환의 실질이다.</b></p>
      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>투자 수익 모델</th><th style={th}>정보 서비스 모델</th></tr></thead>
          <tbody>
            <tr><td style={td}>수익률 · 승률 · 샤프</td><td style={td}><b style={b}>커버리지</b> — 그날 공시 몇 %를 봤나</td></tr>
            <tr><td style={td}>알파 유의성</td><td style={td}><b style={b}>결측일 0</b> — 하루 빠지면 신뢰가 깨진다</td></tr>
            <tr><td style={td}>백테스트</td><td style={td}><b style={b}>지연 시간</b> — 공시에서 알림까지 몇 분</td></tr>
            <tr><td style={td}>—</td><td style={td}>정확도 — 오탐·오연결 건수</td></tr>
            <tr><td style={td}>—</td><td style={td}><b style={b}>페이지 수</b> — 검색 노출 면적</td></tr>
          </tbody>
        </table>
      </div>
      <div style={quote}>
        이 지표들은 전부 이미 측정하고 있거나 측정할 수 있다. 반면 알파는 6개월을 재도 p=1.000이었다.
        이길 수 있는 게임으로 옮기는 것이다.
      </div>
      <p style={p}>
        2026-08-12 게이트 커버리지 100% 전환과 08-19 시장경보 이중화가 정확히 이 축의 작업이었다.
      </p>

      {/* ── 6. 로드맵 ── */}
      <h2 style={h2}>로드맵</h2>

      <h3 style={h3}>Phase 0 · 팔 수 있는 상태 (0~2개월)</h3>
      <p style={p}>매출 0의 원인은 상품이 아니라 <b style={b}>결제와 법적 정리의 부재</b>다.</p>
      <div style={scroll}>
        <table style={tbl}>
          <tbody>
            <tr><td style={td}><b style={b}>P0-1</b></td><td style={td}>유사투자자문업 해당 여부 전문가 확인 → 신고 또는 상품 형태 조정</td></tr>
            <tr><td style={td}><b style={b}>P0-2</b></td><td style={td}>정기결제 도입</td></tr>
            <tr><td style={td}><b style={b}>P0-3</b></td><td style={td}>성과 표기 중앙값 병기 의무를 화면에도 적용</td></tr>
            <tr><td style={td}><b style={b}>P0-4</b></td><td style={td}>딥분석 675편 갱신 라인 복구 → 라이선스 제안서</td></tr>
          </tbody>
        </table>
      </div>
      <div style={warn}>
        <p style={{ ...p, margin: 0 }}>
          <b style={b}>P0-1 전에 Phase 1을 출시하지 않는다.</b> 순서를 바꾸면 매출이 규제 리스크로 바뀐다.
        </p>
      </div>

      <h3 style={h3}>Phase 1 · 첫 정보 상품 — 내부자 매수 레이더 (2~6개월)</h3>
      <p style={p}>5개 조건을 동시에 만족하는 유일한 후보다.</p>
      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>조건</th><th style={th}>충족</th></tr></thead>
          <tbody>
            <tr><td style={td}>데이터가 이미 있다</td><td style={td}>7,467건 + DART elestock 정형 API</td></tr>
            <tr><td style={td}>도메인 우위</td><td style={td}><code>insider_direction.py</code> — 취득/처분 <b style={b}>방법</b>까지 읽어 스톡옵션·액면분할·담보대출·ETF설정을 걸러낸다. <b style={b}>Fintel의 킬러 기능과 동일</b></td></tr>
            <tr><td style={td}>사람 판단 불필요</td><td style={td}>전자동</td></tr>
            <tr><td style={td}>SEO 친화</td><td style={td}>종목별·임원별 페이지 자동 생성</td></tr>
            <tr><td style={td}>규제 안전</td><td style={td}>사실 보도이지 투자 권유가 아니다</td></tr>
          </tbody>
        </table>
      </div>
      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>무료 = 생산 설비</th><th style={th}>유료</th></tr></thead>
          <tbody>
            <tr><td style={td}>종목별 내부자 이력 페이지 2,600종 전체 공개</td><td style={td}>실시간 알림</td></tr>
            <tr><td style={td}>최근 7일 요약</td><td style={td}>스크리너 · 필터 · 전체 이력 · CSV</td></tr>
          </tbody>
        </table>
      </div>
      <p style={p}>
        무료 페이지는 손해가 아니라 <b style={b}>엔진</b>이다. Fintel 트래픽의 53.8%가 검색이다.
        같은 레이더를 영문으로도 낸다(S5) — 추가 수집 비용 0, 편집 비용만 발생.
      </p>

      <h3 style={h3}>Phase 2 · 데이터 축 확장 + API 개시 (6~12개월)</h3>
      <p style={p}>
        <b style={b}>공매도·대차는 지금 시작해야 한다 — 소멸성이다.</b> 오늘 안 모으면 1년 뒤에도 없다.
      </p>
      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>데이터</th><th style={th}>공개</th><th style={th}>현재</th></tr></thead>
          <tbody>
            <tr><td style={td}>공매도 잔고</td><td style={td}>KRX 일간 무료</td><td style={td}><b style={{ color: '#DC2626' }}>미수집</b></td></tr>
            <tr><td style={td}>대차잔고</td><td style={td}>예탁원·금투협 일간 무료</td><td style={td}><b style={{ color: '#DC2626' }}>미수집</b></td></tr>
            <tr><td style={td}>신용잔고</td><td style={td}>키움 ka10013</td><td style={td}>주간 2,581종</td></tr>
            <tr><td style={td}>Borrow fee</td><td style={td}>—</td><td style={td}>한국에 통합 시세 없음</td></tr>
          </tbody>
        </table>
      </div>
      <p style={p}>
        현행 신용 모니터는 Fintel 숏스퀴즈의 등가물이 아니라 <b style={b}>정반대</b>다 —
        신용융자는 레버리지 롱이라 청산이 매도를 만들고, 공매도는 숏이라 청산이 매수를 만든다.
        <b style={b}> 우리는 하락 축만 갖고 있고, 트래픽이 붙는 상승 축이 비어 있다.</b>
      </p>
      <div style={warn}>
        <p style={{ ...p, margin: 0 }}>
          2023-11 ~ 2025-03 공매도 전면금지 구간은 <b style={b}>별도 모집단</b>이다. 합산 금지.
          스퀴즈 지표는 실증 전까지 "지표"로만 쓰고 <b style={b}>"확률"로 부르지 않는다.</b>
        </p>
      </div>

      <h3 style={h3}>Phase 3 · 기관 · 제휴 (12개월~)</h3>
      <p style={p}>
        기관 데이터 라이선스 · 검정 방법론 컨설팅 · 제휴.
        선행 조건은 <b style={b}>최소 12개월 연속 시계열</b>이다.
      </p>

      {/* ── 7. 가격 ── */}
      <h2 style={h2}>가격</h2>
      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>티어</th><th style={th}>월</th><th style={th}>내용</th></tr></thead>
          <tbody>
            <tr><td style={td}>Free</td><td style={tdNum}>0</td><td style={td}>종목 페이지 · 최근 7일 · 브리핑</td></tr>
            <tr><td style={td}><b style={b}>Basic</b></td><td style={tdNum}>9,900</td><td style={td}>실시간 알림 · 스크리너 · 전체 이력</td></tr>
            <tr><td style={td}><b style={b}>Pro</b></td><td style={tdNum}>29,000</td><td style={td}>+ 공매도·신용 지표 · CSV · 픽</td></tr>
          </tbody>
        </table>
      </div>
      <p style={p}>
        Fintel($14.95 / $29.75 / $95)의 약 절반. 국내 B2B 준거는
        <b style={b}> FnGuide DataGuide 최초 계정 연 720만원</b>(추가 480만원)이다.
      </p>

      <h3 style={h3}>50억 도달 시나리오</h3>
      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>구성</th><th style={th}>규모</th><th style={th}>연 매출</th></tr></thead>
          <tbody>
            <tr><td style={td}>S1 구독</td><td style={td}>유료 1.1만 명 × 평균 15,000원</td><td style={tdNum}>약 20억</td></tr>
            <tr><td style={td}>S2+S3 API·위젯</td><td style={td}>기업 30곳 × 연 3,000만원</td><td style={tdNum}>약 9억</td></tr>
            <tr><td style={td}>S4 콘텐츠</td><td style={td}>라이선스 3~5건</td><td style={tdNum}>약 3억</td></tr>
            <tr><td style={td}>S5 영문</td><td style={td}>구독 + 스폰서</td><td style={tdNum}>약 8억</td></tr>
            <tr><td style={td}>S6 제휴</td><td style={td}>트래픽 종속</td><td style={tdNum}>약 2억</td></tr>
          </tbody>
        </table>
      </div>
      <div style={warn}>
        <p style={{ ...p, margin: 0 }}>
          <b style={b}>단일 스트림으로는 50억에 못 간다.</b> S1만으로는 20억이 한계다.
          6개를 병행하되 하나의 파이프라인을 공유하는 것이 이 설계의 핵심이다.
          위 숫자는 전부 <b style={b}>가정에 기반한 산술</b>이며 검증된 예측이 아니다.
        </p>
      </div>

      {/* ── 8. 목표 ── */}
      <h2 style={h2}>목표</h2>
      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>단계</th><th style={th}>지표</th><th style={th}>6개월</th></tr></thead>
          <tbody>
            <tr><td style={td}>0단계</td><td style={td}><b style={b}>외부 재방문 유저</b></td><td style={tdNum}>10명 (현재 0)</td></tr>
            <tr><td style={td}>Phase 1</td><td style={td}>검색 유입 세션</td><td style={tdNum}>월 1만</td></tr>
            <tr><td style={td}>Phase 1</td><td style={td}>색인된 페이지</td><td style={tdNum}>2,000+</td></tr>
            <tr><td style={td}>Phase 2</td><td style={td}>수집 무결성</td><td style={tdNum}>99%+</td></tr>
            <tr><td style={td}>Phase 2</td><td style={td}>API 고객</td><td style={tdNum}>3곳</td></tr>
            <tr><td style={td}>공통</td><td style={td}>유료 구독자</td><td style={tdNum}>50명</td></tr>
          </tbody>
        </table>
      </div>
      <p style={p}>
        0명에서 1.1만 명으로 한 번에 가지 않는다.
        <b style={b}> 첫 관문은 유료가 아니라 재방문 10명</b>이고, 그 다음이 유료 50명이다.
      </p>

      {/* ── 9. 하지 않을 것 ── */}
      <h2 style={h2}>하지 않을 것</h2>
      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>항목</th><th style={th}>이유</th></tr></thead>
          <tbody>
            <tr><td style={td}>옵션 플로우</td><td style={td}>한국에 개별주식옵션 시장이 없다</td></tr>
            <tr><td style={td}>Beneish M-Score</td><td style={td}>미국 1982~92 캘리브레이션, 미검증. 분식 탐지는 상승 시그널과 방향이 반대</td></tr>
            <tr><td style={td}>Altman Z (원식)</td><td style={td}>제조업 전용. 코스닥 바이오·SW·금융에 무의미</td></tr>
            <tr><td style={td}>13F형 기관 매집 랭킹</td><td style={td}>한국에 제도가 없다</td></tr>
            <tr><td style={td}>Postgres/Supabase 이전</td><td style={td}>순수 비용. 서베이큐에서 소멸 전례</td></tr>
            <tr><td style={td}>텔레그램 알림</td><td style={td}>Web Push 사용</td></tr>
            <tr><td style={td}><b style={b}>수익률로 파는 것</b></td><td style={td}>p=1.000. 팔 근거가 없다</td></tr>
          </tbody>
        </table>
      </div>

      {/* ── 10. 무효 조건 ── */}
      <h2 style={h2}>무효 조건</h2>
      <p style={p}>이게 나오면 전략을 바꾼다. 전망은 조건부 논리로만 쓴다.</p>
      <div style={scroll}>
        <table style={tbl}>
          <thead><tr><th style={th}>리스크</th><th style={th}>무효 조건</th></tr></thead>
          <tbody>
            <tr><td style={td}>SEO 유입 가설</td><td style={td}>6개월 내 검색 유입 <b style={b}>월 1천 세션 미달</b> → S1 축소, B2B로 전환</td></tr>
            <tr><td style={td}>내부자 신호 상품성</td><td style={td}>무료 페이지 체류·재방문 미형성 → 축을 공매도로 이동</td></tr>
            <tr><td style={td}>컴플라이언스</td><td style={td}>유사투자자문 해당 판정 → 픽 판매 중단, 사실 상품만 유지</td></tr>
            <tr><td style={td}>소스 단절</td><td style={td}>KIND 차단 사례 → 모든 수집 경로 이중화(08-19 완료)</td></tr>
            <tr><td style={td}>1인 의존</td><td style={td}>Phase 1 자동화 실패 시 매출이 늘수록 본인 시간이 고갈된다</td></tr>
          </tbody>
        </table>
      </div>

      {/* ── 11. 즉시 착수 ── */}
      <h2 style={h2}>즉시 착수 — 다음 2주</h2>
      <div style={scroll}>
        <table style={tbl}>
          <tbody>
            <tr><td style={tdNum}>1</td><td style={td}><b style={b}>유사투자자문업 해당 여부 확인</b> — 다른 모든 것의 선행 조건</td></tr>
            <tr><td style={tdNum}>2</td><td style={td}><b style={b}>공매도·대차 일간 수집 신설</b> — 소멸성. 전략과 무관하게 오늘 시작해야 손실이 없다</td></tr>
            <tr><td style={tdNum}>3</td><td style={td}>내부자 레이더 종목 페이지 자동 생성 — 백엔드는 이미 있다</td></tr>
            <tr><td style={tdNum}>4</td><td style={td}>딥분석 675편 라이선스 제안서</td></tr>
            <tr><td style={tdNum}>5</td><td style={td}><code>credit_monitor</code> 일간 전환</td></tr>
          </tbody>
        </table>
      </div>
      <div style={quote}>
        2번은 어떤 전략을 고르든 후회하지 않는 유일한 항목이다.
        무료·일간·소멸성이라 시작하는 것 자체가 순이익이다.
      </div>

      <div style={divider} />
      <p style={{ fontSize: 11.5, color: colors.textMuted, lineHeight: 1.7, margin: 0 }}>
        원본 <code>dart-insight/MONETIZATION_PRD.md</code> v1.1 · 근거는 2026-08-19 세션 실측.
        선행 문서 <code>UP.md</code>(퀀트 엔진) · <code>UP2.md</code>(포렌식)의 우선순위를 재배치한 문서다.
        UP2의 10대 시나리오는 폐기가 아니라 Phase 1·2의 재료 — 소급 검정 가능한 것
        (자사주 소각 515건 · 담보 178건 · 전환가액 조정 238건)을 먼저 잰다.
      </p>
    </div>
  )
}

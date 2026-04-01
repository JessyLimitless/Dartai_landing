import React, { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM, SPACING } from '../constants/theme'

const ISSUES = [
  {
    id: '2026-ai-semi-ip',
    title: '한국 팹리스, AI 반도체 설계 시장에 진입하다',
    subtitle: '같은 날 2건의 반도체 IP 라이선스 계약 — "만드는 나라"에서 "설계하는 나라"로',
    status: 'REPORT',
    statusColor: '#DC2626',
    tag: '산업분석',
    tagColor: '#DC2626',
    lastUpdate: '2026.04.01',
    timeline: [
      { date: '2026.04.01', title: '오픈엣지 IP 라이선스 35억 계약', desc: '반도체 설계자산(IP) 라이선스. 매출대비 21.7%. 국내 반도체 기업 대상', signal: '수주' },
      { date: '2026.04.01', title: '퀄리타스 IP 라이선스 13억 계약', desc: '반도체 설계자산(IP) 라이선스. 매출대비 21.2%. 상대방 비공개', signal: '수주' },
    ],
    analysis: `## 만드는 나라에서, 설계하는 나라로

4월 1일, 한국 팹리스 2곳이 동시에 반도체 설계자산(IP) 라이선스 공급계약을 공시했다.

| 기업 | 계약금액 | 매출대비 | 장중 등락 |
|------|---------|---------|----------|
| 오픈엣지테크놀로지 | 35억원 | 21.7% | +7.5% |
| 퀄리타스반도체 | 12.9억원 | 21.2% | +12.5% |

---

### 반도체 IP란 무엇인가

반도체 IP는 칩 안에 들어가는 **설계 블록**이다. 건축의 "설계 도면"에 해당한다. AI 반도체를 만들려면 처음부터 모든 회로를 설계하지 않는다 — 검증된 IP 블록을 **라이선스로 사서** 자기 칩에 통합한다.

글로벌 시장은 ARM, Synopsys, Cadence 등 해외 기업이 지배해왔다.

---

### 왜 지금, 한국 팹리스인가

**1. AI 반도체 수요 폭증**
범용 GPU가 아닌 맞춤형 칩(ASIC)을 원하는 기업이 늘고 있다. 맞춤형 칩을 만들려면 IP 블록을 사서 조합해야 한다.

**2. 한국은 "만드는 나라"였다**
메모리(삼성/SK) + 파운드리(삼성) + 후공정 장비. 설계(Design) 영역은 해외 의존도가 높았다. 오늘 공시는 한국 팹리스가 IP 시장에서 **공급자로 자리 잡기 시작했다**는 신호다.

**3. 매출 대비 21%**
오픈엣지(매출 161억)에 35억, 퀄리타스(매출 61억)에 13억. IP 라이선스는 한 번 계약하면 후속 로열티까지 발생하므로 반복 매출로 이어진다.

---

### 한국 반도체 밸류체인 확장

- **기존**: 메모리 → 파운드리 → 후공정 장비
- **확장**: 설계(IP) → 맞춤형 칩(ASIC) → AI 반도체 생태계

한국 팹리스가 "IP를 사는 쪽"에서 **"IP를 파는 쪽"으로** 전환하고 있다.

---

### 모니터링 포인트

1. 후속 IP 라이선스 계약 발생 여부
2. 상대방 기업 정체 — 대기업인지 스타트업인지
3. 해외 기업과의 라이선스 계약 확대 여부

*DART 공시 원문 기반 분석. 시장 전망이나 투자 추천이 아닌 팩트 기반 해석입니다.*`,
  },
  {
    id: '2026-jeju-semi',
    title: '제주반도체 — 온디바이스 AI 시대, 저전력 메모리의 조용한 독점',
    subtitle: '삼성·SK·마이크론이 안 하는 시장을 독점하는 팹리스. 퀄컴+미디어텍 듀얼 인증, 국내 유일.',
    archived: true,
    status: 'CLOSED',
    statusColor: '#94A3B8',
    tag: '유망종목',
    tagColor: '#10B981',
    lastUpdate: '2026.03.31',
    timeline: [
      { date: '2025.Q3', title: '분기 매출 1,110억 돌파', desc: '사상 첫 분기 1,000억 돌파. 전년 동기 대비 +197%', signal: '실적' },
      { date: '2025.연간', title: '연매출 3,022억 (+90% YoY)', desc: '영업이익 359억 (+274%). 사상 최대 실적', signal: '성장' },
      { date: '2026.03.13', title: 'CB+BW 1,170억 발행', desc: '웨이퍼 구입 + R&D. 전환가 44,300원 (20% 프리미엄)', signal: '투자' },
      { date: '2026~2027', title: 'LPDDR4X → LPDDR5/5X 로드맵', desc: 'SK하이닉스 팹 위탁생산. 차세대 저전력 DRAM 진입', signal: '기술' },
    ],
    analysis: `## 거인이 무시한 시장을 독점하는 자

제주반도체(080220) | 코스닥 | 시총 1.27조 | 저전력 메모리 팹리스

공장 없이 설계만 한다. 생산은 SK하이닉스에 맡긴다. LPDDR(저전력 DRAM)이 매출의 70%. 핵심 경쟁력은 단 하나 — **삼성·SK하이닉스·마이크론이 진입하지 않는 시장을 독점한다.**

대형 3사에게 와이파이 공유기, 카드 결제 단말기, 통신 중계기에 들어가는 저용량 메모리는 "돈이 안 되는" 시장이다. 제주반도체는 그 틈새에서 세계 3위다.

---

## 온디바이스 AI — 왜 지금인가

CES 2026의 키워드는 "피지컬 AI". 로봇이 스스로 판단하고, 스마트폰이 클라우드 없이 AI를 돌린다. **공통 조건: 저전력.** 클라우드 AI는 전력을 무제한 쓴다. 온디바이스 AI는 배터리로 돌아야 한다.

| 시장 | 성장률 |
|------|--------|
| 5G IoT | 25%+ |
| 엣지 AI (카메라, 로봇) | 30%+ |
| 커넥티드 차량 | 20%+ |
| 와이파이 7 공유기 | 15%+ |

이 시장 전부에 납품한다. 매출 상위 10개사가 60~70%로, 특정 고객 쏠림 없이 분산되어 있다.

---

## 해자 — 퀄컴 + 미디어텍 듀얼 인증

LPDDR을 만들어도 AP와 호환 인증 없으면 의미 없다. 전세계 AP 시장은 퀄컴과 미디어텍이 양분한다.

**퀄컴 + 미디어텍 양사 인증을 모두 획득한 국내 유일 기업.** 글로벌로도 마이크론과 함께 둘뿐이다. 인증 획득에 2~3년. 대형 3사는 진입할 인센티브 없음. 기존 인증 보유 기업의 독점이 강화되는 구조다.

---

## 실적 — 사상 최대

| | 2023 | 2024 | 2025 | YoY |
|--|------|------|------|-----|
| 매출 | 1,459억 | 1,623억 | **3,022억** | **+86%** |
| 영업이익 | 178억 | 96억 | **359억** | **+274%** |
| OPM | 12.2% | 5.9% | **11.9%** | 회복 |
| 순이익 | 169억 | 194억 | **303억** | +56% |

분기별로 보면 더 극적이다:

| | Q1 | Q2 | Q3 |
|--|------|------|------|
| 매출 | 484억 | 511억 | **1,110억** |
| 영업이익 | 37억 | 43억 | **139억** |

Q3에서 분기 매출 1,000억을 처음 돌파. 전년 동기 대비 +197%. DDR4 단종에 따른 공급 부족이 구조적으로 유리한 환경을 만들고 있다.

---

## CB+BW 1,170억 — 왜 돈을 빌리나

2026년 3월, CB 450억 + BW 720억 = **총 1,170억원**. 전환가 44,300원 (현재가 대비 20% 프리미엄).

| 구분 | 규모 | 용도 |
|------|------|------|
| CB | 450억 | 웨이퍼 300억 + R&D 150억 |
| BW | 720억 | 원자재 + R&D + 해외거래처 |

희석: 264만주 (7.7%). 전환가가 현재가보다 20% 높다는 건 "이 가격 이상으로 갈 것"이라는 경영진의 확신. 용도가 "웨이퍼 구입"이라는 건 수요가 생산 능력을 초과하고 있다는 뜻. **팔 물건이 있는데 재료가 부족해서 돈을 빌리는 것** — 긍정적 희석이다.

---

## 밸류에이션

| 지표 | 현재 |
|------|------|
| PER | 41~65배 |
| PBR | 6.81배 |
| ROE | 19.21% |

싸지는 않다. 핵심은 성장률이 PER을 정당화하는가다.

| 시나리오 | 2026E 영업이익 | Forward PER |
|----------|-------------|-------------|
| Bull (+50%) | 550억 | ~23배 |
| Base (+30%) | 450억 | ~28배 |
| Bear (+10%) | 370억 | ~34배 |

Bull에서 Forward PER 23배 — 팹리스 업종 평균(25~30배)보다 낮다.

---

## 경쟁

| 기업 | 포지션 |
|------|--------|
| ESMT (대만) | 세계 1위 |
| ISSI (미국) | 세계 2위 |
| **제주반도체** | **세계 3위 → 1위 목표** |

대형 3사가 DDR4를 단종하면서 공급 공백. 제주반도체가 그 공백을 채우고 있다.

---

## 리스크

| 리스크 | 등급 |
|--------|------|
| CB/BW 희석 7.7% | A |
| 대주주 지분 10.47% — 경영권 불안 | A |
| 외국인 0.22% — 기관 관심 부족 | A |
| LPDDR4X/5 양산 지연 | A |
| 대형사 니치마켓 재진입 | B |

---

## 감시 포인트

- LPDDR4X 양산 일정 — SK하이닉스 팹 투입 시점
- 분기 실적 — Q3 1,110억이 일회성인지 구조적인지
- CB/BW 전환 — 44,300원 도달 여부
- 외국인 매수 유입 — 0.22%에서 변화 시 신호

---

*거인들이 무시한 시장에서 조용히 1위를 향해 걷고 있다. 삼성이 HBM에 몰두하는 동안, 제주의 작은 팹리스는 세상의 모든 IoT 기기에 메모리를 넣고 있다. 온디바이스 AI가 "어디서든 돌아가야 한다"고 말할 때, 그 "어디서든"의 전제 조건은 저전력이다. 저전력 메모리의 독점자에게, 미래는 이미 주문서의 형태로 도착하고 있다.*

---
*DART Insight | 공시의 이면을 읽다 | 투자 판단의 최종 책임은 투자자 본인에게 있습니다.*`,
    insight: '삼성이 HBM에 몰두하는 동안, 제주의 작은 팹리스는 세상의 모든 IoT 기기에 메모리를 넣고 있다. 온디바이스 AI의 전제 조건은 저전력이다.',
  },
  {
    id: '2026-moadata-takeover',
    archived: true,
    title: '모아데이타 — 최대주주 담보 76%, 경영권이 흔들리는 289억짜리 회사',
    subtitle: '적자 확대, 부채 급증, 대주주 주식 76% 담보 설정. 그런데 누군가 대량 매집 중이고 주가는 +14.9% 급등했다.',
    status: 'TRACKING',
    statusColor: '#DC2626',
    tag: '경영권',
    tagColor: '#DC2626',
    lastUpdate: '2026.03.30',
    timeline: [
      { date: '2026.03.12', title: '채무보증 + 대량보유(약식)', desc: '자회사 모아라이프플러스 195억 채무보증. 외부 투자자 지분 변동 신고', signal: '지분' },
      { date: '2026.03.13', title: '주주총회 소집결의', desc: '정기주총 소집 — 이사 선임·재무제표 승인', signal: '주총' },
      { date: '2026.03.19', title: '유상증자 결정 (정정)', desc: '추가 자금조달 — CB 120억에 이어 유증까지', signal: '희석' },
      { date: '2026.03.20', title: '매출/손익 30%+ 변동 (S등급)', desc: '2025년 매출 -33%, 영업손실 -346% 확대', signal: '실적' },
      { date: '2026.03.30', title: '최대주주 변경 수반 담보 + 대량보유 + 급등', desc: '경영권 이전 가능성 + 14.9% 급등', signal: '경영권' },
    ],
    analysis: `## 모아데이타 — 289억짜리 회사의 경영권이 흔들린다

### 회사 개요

모아데이타(288980) | 코스닥 | 시총 289억 | AI 이상탐지 솔루션

2014년 설립, 2022년 기술특례 상장. 본업은 ICT 인프라 장애 예측 AI "페타온 포캐스터". 별도 기준으로는 영업이익 13억의 흑자 기업이다. 문제는 자회사다.

- 2023년: 메디에이지 인수 (디지털 헬스케어, 36억)
- 2024년: **모아라이프플러스(142760) 인수** — 지분 153억 + 유증 100억 + 채무보증 195억 = **총 448억 투입**

시총 289억짜리 회사가 448억을 자회사에 쏟아부었다. 연결 실적은 당연히 적자로 전환됐다.

---

### 재무 — 적자 확대의 구조

| | 2022 | 2023 | 2024 | 2025 |
|--|------|------|------|------|
| 매출 | 217억 | 245억 | 344억 | **232억(-33%)** |
| 영업이익 | +11억 | **-4억** | **-13억** | **-59억** |
| 순이익 | +18억 | - | -41억 | **-115억** |
| 부채 | - | 330억 | 577억 | **588억** |
| 자본 | - | 301억 | 297억 | **271억** |

2025년 영업손실 59억은 매출 33% 감소 + 거래처 파산 대손충당금 + R&D 감가상각 증가. 순손실 115억은 자회사 지분법 손실이 추가된 결과다.

**부채비율 217%.** 자본(271억) 대비 부채(588억)가 2배 이상. 그런데 여기에 CB 120억 + 유상증자가 추가로 진행 중이다.

---

### 최대주주 담보 — 76%가 담보에 잡혀 있다

한상진 대표 보유 805.6만주 중 **612.9만주(76%)가 담보 설정**:

| 채권자 | 담보 주식 | 대출금 | 만기 |
|--------|----------|--------|------|
| IM증권 | 91.5만주 | 4억 | 2026.2.23 (만료) |
| 씨드파이낸셜 | 90만주 | 5억 | 2026.3.31 (내일 만료) |
| **상상인증권** | **431.4만주** | **15억** | **2026.4.6** |

**상상인증권 431만주가 핵심이다.** 4월 6일 만기. 이 담보가 실행되면 한상진 대표의 잔여 지분은 192.7만주(5.58%)로 급감한다. 최대주주 지위를 잃는다.

씨드파이낸셜 90만주는 **내일(3/31) 만기**. 상환하지 못하면 반대매매.

---

### 3/30 — 왜 급등했나

오늘 동시에 나온 공시:
1. **최대주주 변경을 수반하는 주식 담보제공 계약 체결** (정정)
2. **주식등의 대량보유상황보고서(일반)**

"최대주주 변경을 수반하는" — 이 문구가 핵심이다. 담보 실행 시 최대주주가 바뀔 수 있다는 뜻이다.

동시에 누군가 5%+ 대량보유 신고. **담보권자가 경영권을 인수하려는 것인지, 제3의 세력이 매집하는 것인지** — 원문에서 대량보유 목적(경영참여/단순투자)이 핵심이다.

시장은 **경영권 프리미엄**을 가격에 반영했다. +14.9%.

---

### 희석 리스크 — CB + 유증 + 담보

| 구분 | 규모 | 희석 |
|------|------|------|
| 6회차 CB (2022) | 100억 | 전환가 3,150원 |
| CB (2025.12) | 20억 | 전환가 950원, 210만주(5.74%) |
| 유상증자 (2026.3) | 진행 중 | 조건 미확인 |
| 담보 실행 시 | 612.9만주 | 최대주주 변경 |

전환가 950원짜리 CB가 있다. 현재가 대비 이미 행사 가능 구간. CB 전환 + 유증 + 담보 실행이 겹치면 기존 주주 희석은 극대화된다.

---

### 시나리오

**Bull — 백기사 등장**: 제3자가 경영권 인수 + 프리미엄 공개매수. 시총 289억은 인수 비용이 낮아 매력적. AI + 헬스케어 자산 가치 재평가.

**Base — 담보 연장**: 한상진 대표가 상상인증권 담보를 재연장하거나 일부 상환. 경영권 유지되나 재무 악화 지속.

**Bear — 반대매매**: 4월 6일 상상인증권 담보 실행 → 431만주 시장 매각 → 주가 급락 + 최대주주 변경 → CB 전환 러시 → 추가 희석.

---

### 감시 포인트

1. **3/31 씨드파이낸셜 90만주 만기** — 내일. 상환 or 반대매매
2. **4/6 상상인증권 431만주 만기** — 1주 후. 이게 진짜 분기점
3. **대량보유 목적** — 경영참여면 인수전, 단순투자면 투기
4. **유상증자 조건** — 발행가, 배정 대상 (제3자배정이면 경영권 이전)
5. **후속 내부자 매매** — 한상진 대표의 추가 처분 여부

---

*289억짜리 회사에 448억을 쏟아부은 CEO의 주식이 담보에 잡혀 있고, 내일과 1주 뒤에 각각 만기가 돌아온다. 누군가 그 틈을 노리고 있다. 재무제표는 적자를 말하고, 공시는 경영권을 말한다. 숫자와 권력이 동시에 움직일 때, 주가는 둘 중 하나를 따르지 않는다 — 더 큰 쪽을 따른다.*

---
*DART Insight | 공시의 이면을 읽다 | 투자 판단의 최종 책임은 투자자 본인에게 있습니다.*`,
  },
  {
    id: '2026-political-economy',
    archived: true,
    title: '비용의 시대는 끝났다 — 정치경제가 지배하는 새로운 투자 문법',
    subtitle: '효율성이 안보에 자리를 내주고, 시장 논리가 권력 논리에 흡수되는 시대. 공시는 기업의 지정학적 선택서다.',
    status: 'REPORT',
    statusColor: '#2563EB',
    tag: '매크로',
    tagColor: '#2563EB',
    lastUpdate: '2026.03.28',
    timeline: [
      { date: '2026.Q1', title: '반도체 후공정 투자 급증', desc: 'HBM4 + 하이브리드 본딩 설비투자 공시 증가. 병목 확보 경쟁', signal: '반도체' },
      { date: '2026.Q1', title: '소버린 AI 수주 확대', desc: 'B2G 국산 LLM 기업 공공 조달 공시 증가', signal: 'AI' },
      { date: '2026.Q1', title: '에너지 인프라 부상', desc: 'SMR/액침냉각/초고압변압기 관련 투자 공시', signal: '에너지' },
      { date: '2026.Q1', title: '방산 수출 가속', desc: 'AI 드론/위성 관련 공급계약 공시 증가', signal: '방산' },
    ],
    analysis: `## 들어가며: 재무제표 너머를 봐야 할 때

지난 30년의 투자 문법은 단순했다. 누가 더 싸게 만드는가. 누가 더 빠르게 성장하는가. 엑셀 시트 위의 게임이었다.

2026년, 그 문법이 바뀌었다. 효율성(Efficiency)이 안보(Security)에 자리를 내주고, 시장의 논리가 권력의 논리에 흡수되는 시대.

기업들이 어디에 공장을 짓는지, 누구와 JV를 맺는지, 어디서 자금을 조달하는지 — 그 모든 결정이 "어느 진영의 공급망 안에 들어가겠다"는 지정학적 선택이다.

## 1. 반도체: 병목을 쥔 자가 협상력을 갖는다

2026년 반도체 투자의 핵심은 HBM4와 첨단 패키징이다. 칩을 잘 만드는 것보다 "어떻게 연결하고 검증하여 무결한 공급망을 유지하느냐"가 수익률을 결정한다.

후공정(OSAT) 고도화를 위한 대규모 설비투자, 하이브리드 본딩 장비 도입을 위한 자금 조달, 미국/유럽 팹과의 기술협력 MOU — 이것들은 단순한 투자 결정이 아니다. "우리는 신뢰할 수 있는 공급망의 핵심 병목에 있다"는 선언이다.

| 키워드 | DART 공시 시그널 |
|--------|----------------|
| **HBM4** | 설비투자, 공급계약 |
| **하이브리드 본딩** | 장비 도입 자금 조달 |
| **후공정(OSAT)** | 대규모 CAPEX |
| **유리기판** | 기술협력 MOU |

**실제 공시 (DART 수집 기준):**
- **아이티엠반도체** 3/24 타법인주식및출자증권취득결정 (S등급) + 3/17 매출/손익 30%+ 변동
- **퀄리타스반도체** 3/18 단일판매공급계약체결 (A등급) + 3/27 임원 소유상황 변동
- **한미반도체** 3/20 기업가치제고계획(밸류업) 공시

## 2. AI 소프트웨어: 데이터가 곧 영토다

모두를 위한 AI의 시대는 가고, **소버린 AI(Sovereign AI)** 의 시대가 왔다. 국가 보안과 데이터 주권을 지키려는 수요가 폭발하면서, B2G/B2B 특화 AI 솔루션 기업들이 공공 조달 시장의 전면에 등장하고 있다.

공공기관 수주 공시가 늘고 있는 국산 LLM 기업들, 온디바이스 AI 칩(NPU) 관련 전략적 투자 유치 공시가 이어지는 기업들. 우리말과 우리 데이터를 가장 잘 이해하는 AI를 가진 기업이 글로벌 빅테크의 공세를 막아내는 방파제가 된다.

**실제 공시:**
- **어보브반도체** 3/26 기업가치제고계획 (NPU 관련 밸류업)
- **엠아이큐브솔루션** 3/27 타법인주식및출자증권취득결정 (AI 솔루션 M&A)

## 3. 에너지 인프라: AI 제국의 심장을 식히는 자

AI라는 거대 기계를 돌리는 전력은 이제 통상 권력의 핵심이다. 초고압 변압기, 액침 냉각(Immersion Cooling), SMR 밸류체인.

전기가 없으면 알고리즘은 깡통에 불과하다. 에너지 독립성을 보장하는 기술은 정치경제 시대의 가장 강력한 통화가 될 것이다.

## 4. 방산/우주: 보이지 않는 곳을 먼저 보는 자

저궤도 위성 군집과 AI 드론이 전 세계 물동량과 군사 이동을 초단위로 감시하는 시대. AI 기반 감시/정찰(ISR), 위성 데이터 분석, 자율비행 플랫폼 — 안보 기술은 더 이상 특수 영역이 아니라 민간 경제의 표준 인프라가 되고 있다.

**실제 공시:**
- **한화에어로스페이스** 3/23 투자판단관련주요경영사항 (S등급) + 3/24 기업가치제고계획 + 3/25 풍문해명
- **오성첨단소재** 3/26 타법인주식및출자증권취득결정 (방산 소재 M&A)

## 2026년 포트폴리오 3대 질문

| 질문 | 판단 기준 |
|------|-----------|
| **진영** | 이 기업의 공급망은 신뢰할 수 있는 동맹 내에 있는가? |
| **병목** | 이 기업은 대체 불가능한 기술적 병목을 갖고 있는가? |
| **실체** | 이 기업의 성장은 서비스인가, 권력을 뒷받침하는 물리적 인프라인가? |

투자는 숫자의 게임이 아니라 구도의 게임이다. DART Insight는 그 구도를 공시에서 읽는다.`,
    insight: '지금 DART에 올라오는 공시들은 기업이 어느 진영을 선택했는지에 대한 선언문이다. 공시를 읽어야 구도가 보인다.',
  },
  {
    id: 'tway-trinity',
    archived: true,
    title: '티웨이항공 → 트리니티 항공: 4,000억 유상증자 완료 + 사명 변경',
    subtitle: '수십 건 동시 공시 — 소노인터내셔널 47.75% 장악, LCC→FSC 전환 선언',
    status: 'NEW',
    statusColor: '#DC2626',
    tag: '유상증자 완료',
    tagColor: '#D97706',
    lastUpdate: '2026.03.27',
    price: '1,090',
    change: '-',
    changeNeg: false,
    timeline: [
      { date: '2025.12', title: '주주배정 유상증자 결정', desc: '약 4,000억원 규모 주주배정 유상증자 공시', signal: '시작' },
      { date: '2026.01~02', title: '소노인터내셔널 증자 참여', desc: '대명소노그룹이 증자에 적극 참여, 지분 확대', signal: '진행' },
      { date: '2026.03.27', title: '유상증자 완료 — 수십 건 동시 공시', desc: '임원·주요주주 소유상황 + 최대주주 변동 수십 건 동시 제출. 소노인터내셔널 지분 47.75% 확정', signal: '완료', highlight: true },
      { date: '2026.03.31', title: '주주총회 — 사명 변경 의결 예정', desc: '티웨이항공 → 트리니티 항공(Trinity Airways)으로 사명 변경 안건 상정', signal: '예정' },
    ],
    analysis: `## 공시가 말하는 것

3/27 하루에 수십 건의 **임원·주요주주 소유상황보고서**와 **최대주주 변동신고서**가 동시 제출되었다. 이는 약 4,000억원 규모 유상증자가 완료되었음을 알리는 종결 신호다.

## 지배구조 변동

| 항목 | 내용 |
|------|------|
| **소노인터내셔널 지분** | 47.75% (단독 지배력 확보) |
| **기존 최대주주 측** | 지분 희석 |
| **의미** | 지배구조 불확실성 해소 |

## 재무 현황 (공시 기반)

| 항목 | 수치 |
|------|------|
| **2025년 매출** | 1.8조원 (역대 최고) |
| **2025년 영업손실** | △2,655억원 |
| **유상증자 규모** | 약 4,000억원 |
| **부채비율 변화** | 3,000%대 → 700%대 |
| **신주 발행가** | 952원 |

수치 출처: DART 공시 원문 확인 필요

## 한화솔루션과의 대비

같은 유상증자이지만 방향이 정반대다:

| 기업 | 유상증자 | 상태 | 시장 반응 |
|------|---------|------|----------|
| **한화솔루션** | 주총 결정 | 적자+증자 = 희석 공포 | -18.22% |
| **티웨이항공** | 완료 | 증자 완료 = 재무 정상화 | 발행가 근처 바닥 다지기 |

## 리스크

| 리스크 | 내용 |
|--------|------|
| 🔴 안전 이슈 | 최근 5년간 국적사 중 최대 47억원 과징금 부과 이력 |
| 🟠 환율·유가 | 리스료·항공유 달러 결제 — 고환율 시 현금 소진 가속 |
| 🟡 오버행 | 유상증자 신주 상장 이후 물량 출회 → 단기 주가 하방 압력 |

## 감시 포인트

- 3/31 주총: 사명 변경(트리니티 항공) 의결 여부
- 신주 상장일 및 거래량 추이
- 유럽 노선(파리·로마·바르셀로나·프랑크푸르트) 탑승률 공시
- 2026 Q1 잠정실적 — 영업손실 축소 여부`,
    insight: '같은 유상증자라도 "결정"은 공포이고 "완료"는 정상화다. 한화솔루션은 전자, 티웨이는 후자. 공시의 타이밍이 방향을 결정한다.',
  },
  {
    id: 'hanwha-solutions',
    archived: true,
    title: '한화솔루션 주총 유상증자 → -18% 폭락',
    subtitle: '적자 기업이 주총에서 유상증자를 결정하자 시장이 하루 만에 -18%로 응답',
    status: 'CLOSED',
    statusColor: '#DC2626',
    tag: '유상증자',
    tagColor: '#DC2626',
    lastUpdate: '2026.03.26',
    price: '36,800',
    change: '-18.22%',
    changeNeg: true,
    timeline: [
      { date: '2026.03.20', title: '투자판단관련주요경영사항 공시', desc: '유상증자 관련 사전 공시 제출', signal: '전조' },
      { date: '2026.03.24~25', title: '임원·주요주주 소유상황 보고', desc: '내부자 지분 변동 보고서 다수 제출', signal: '전조' },
      { date: '2026.03.26', title: '정기주주총회 — 유상증자 결정', desc: '주총에서 유상증자 의결. 종가 36,800원(-18.22%), 거래량 1,060만 주 폭증', signal: '폭락', highlight: true },
    ],
    analysis: `## 왜 -18% 폭락했나

한화솔루션은 현재 **EPS -3,728원으로 적자** 상태다. 적자 기업이 유상증자를 결정한 것은 두 가지를 의미한다:

1. **자금 조달이 절박하다** — 영업으로 돈을 벌지 못하니 주주에게서 가져와야 한다
2. **기존 주주 가치가 희석된다** — PBR 0.70배, 자산가치 이하에서 신주를 발행

## 시세 데이터 (키움 API 3/26)

| 항목 | 수치 |
|------|------|
| **종가** | 36,800원 |
| **등락률** | -18.22% (-8,200원) |
| **거래량** | 10,598,663주 |
| **시총** | 6.3조 |
| **PBR** | 0.70배 |
| **외국인** | 14.0% |

## 같은 날, 정반대 공시

같은 주총 시즌에 **메리츠금융지주는 자사주 소각+재매입 3종 세트**, **포스코홀딩스는 6,351억 소각**을 결정했다. 한화솔루션만 반대 방향이다.

| 기업 | 주총 결정 | 주가 반응 |
|------|----------|----------|
| 메리츠금융지주 | 소각+재매입 | +2.51% |
| 포스코홀딩스 | 6,351억 소각 | +0.15% |
| **한화솔루션** | **유상증자** | **-18.22%** |

## 감시 포인트

- 유상증자 상세 조건 (규모, 발행가, 배정 방식) — 원문 확인 필요
- 자금 사용 목적 (부채상환? 신사업 투자?)
- 추가 하락 여부 — 유증 후 통상 2~3일 추가 조정
- 외국인 지분 이탈 여부 (현재 14.0%)`,
    insight: '소각은 주주에게 돌려주는 것이고, 유증은 주주에게서 빼앗는 것이다. 주총은 경영진의 본심이 드러나는 자리다.',
  },
  {
    id: 'korea-zinc',
    archived: true,
    title: '고려아연 경영권 분쟁',
    subtitle: 'MBK+영풍 vs 최윤범 — 한국 증시 최대 지배구조 전쟁',
    status: 'LIVE',
    statusColor: '#DC2626',
    tag: '경영권 분쟁',
    tagColor: '#DC2626',
    lastUpdate: '2026.03.25',
    price: '1,280,000',
    change: '+1.19%',
    changeNeg: false,
    timeline: [
      { date: '2024.09', title: 'MBK+영풍, 공개매수 발표', desc: '주당 66만원, 지분 14.6% 목표. 경영권 분쟁 시작', signal: '시작' },
      { date: '2024.10', title: '최윤범 회장, 자사주 매입 방어', desc: '1조원+ 자사주 매입 결정. "경영권 방어" 명분', signal: '방어' },
      { date: '2024.11', title: '1차 공개매수 결과', desc: 'MBK+영풍 지분 확보. 경영권 확보에는 미달', signal: '교착' },
      { date: '2025.01', title: '임시주총 표 대결', desc: '이사회 구성 안건. 양측 위임장 대결', signal: '격화' },
      { date: '2025.06', title: '2차 공개매수 + 자사주 소각', desc: '양측 지분 확대 경쟁 지속', signal: '지속' },
      { date: '2026.03.25', title: '정기주주총회 결과 (오늘)', desc: '이사회 구성 최종 결정. 경영권 향방의 분수령', signal: '결정', highlight: true },
    ],
    analysis: `## 왜 중요한가

고려아연 경영권 분쟁은 **이벤트 드리븐 투자의 교과서**다. 2024년 9월 시작된 이 싸움에서 모든 공시가 주가를 움직였다.

- 공개매수 발표 → 주가 급등
- 자사주 매입 방어 → 하방 지지
- 주총 표 대결 → 변동성 극대화

## 핵심 이해관계

| 진영 | 목표 | 전략 |
|------|------|------|
| **MBK+영풍** | 경영권 확보 | 공개매수 + 위임장 대결 |
| **최윤범 회장** | 경영권 방어 | 자사주 매입 + 소각 + 우호 지분 확보 |

## 3/25 주총이 결정적인 이유

오늘 정기주총에서 **이사회 구성**이 결정된다. 이사회를 누가 장악하느냐가 곧 경영권이다.

- MBK 측 이사 선임 성공 → 경영권 교체 신호
- 최윤범 측 방어 성공 → 현 경영 체제 유지

## 시나리오별 대응 전략

### 시나리오 A: MBK 측 승리 (이사회 장악)
- **예상 후속 공시**: 대표이사 변경, 사업 구조조정, 자산 매각 결정
- **감시 공시**: "대표이사변경", "영업양수도", "타법인주식처분"
- **대응**: 구조조정 공시가 나오면 → 자산 가치 재평가 기회. 단, 경영 혼란 리스크 공존

### 시나리오 B: 최윤범 측 방어 성공
- **예상 후속 공시**: 추가 자사주 매입/소각, 배당 확대, 밸류업 계획
- **감시 공시**: "자기주식취득", "주식소각결정", "배당결정"
- **대응**: 자사주 소각 공시가 나오면 → 주당 가치 직접 상승. 주주환원 강화 기조

### 시나리오 C: 교착 지속 (양측 모두 과반 미확보)
- **예상 후속 공시**: 임시주총 소집, 추가 공개매수, 위임장 대결 재개
- **감시 공시**: "주주총회소집결의", "공개매수신고서"
- **대응**: 분쟁 장기화 = 변동성 지속. 공개매수 공시 나오면 프리미엄 발생 구간

## 매수/매도 시그널 정리

| 공시 유형 | 시그널 | 의미 |
|----------|--------|------|
| 자사주 소각 결정 | 🟢 매수 | 주당 가치 직접 상승 |
| 추가 공개매수 | 🟢 매수 | 프리미엄 발생 |
| 내부자 장내 매수 | 🟢 매수 | 확신 시그널 |
| 대표이사 변경 | ⚪ 관망 | 방향 확인 필요 |
| 대규모 자산 매각 | ⚪ 관망 | 매각 가격 확인 |
| 유상증자 결정 | 🟡 주의 | 지분 희석 |
| 소송 제기 | 🟡 주의 | 분쟁 격화, 불확실성 |

**핵심: "어떤 공시가 나올 때 움직여라." 예측하지 말고, 공시를 기다려라.**`,
    insight: '예측하지 말고 공시를 기다려라 — 자사주 소각이 나오면 사고, 유상증자가 나오면 피하라. 모든 답은 공시에 있다.',
  },
]

export default function IssuePage() {
  const { colors, dark } = useTheme()
  const currentIssues = ISSUES.filter(i => !i.archived)
  const archivedIssues = ISSUES.filter(i => i.archived)
  const [selectedId, setSelectedId] = useState(currentIssues[0]?.id || null)
  const selected = ISSUES.find(i => i.id === selectedId)

  const sep = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'

  const [archivePage, setArchivePage] = useState(0)
  const ARCHIVE_PER_PAGE = 10
  const archivePages = Math.ceil(archivedIssues.length / ARCHIVE_PER_PAGE)
  const pagedArchive = archivedIssues.slice(archivePage * ARCHIVE_PER_PAGE, (archivePage + 1) * ARCHIVE_PER_PAGE)

  const ArchiveSidebar = () => archivedIssues.length > 0 ? (
    <div style={{
      borderRadius: 14, overflow: 'hidden',
      background: dark ? '#111113' : '#FAFAFA',
      border: `1px solid ${sep}`,
    }}>
      {/* 헤더 */}
      <div style={{
        padding: '12px 16px',
        borderBottom: `1px solid ${sep}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2" strokeLinecap="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span style={{ fontSize: 12, fontWeight: 700, color: colors.textPrimary }}>지난 이슈</span>
        </div>
        <span style={{
          fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono,
        }}>{archivedIssues.length}건</span>
      </div>

      {/* 리스트 */}
      <div style={{ padding: '6px 10px' }}>
        {pagedArchive.map((issue, i) => {
          const active = selectedId === issue.id
          return (
            <div key={issue.id} className="touch-press"
              onClick={() => setSelectedId(issue.id)}
              style={{
                padding: '12px 14px', cursor: 'pointer', marginBottom: 6,
                borderRadius: 10,
                background: active
                  ? (dark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.04)')
                  : (dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)'),
                border: `1px solid ${active ? 'rgba(220,38,38,0.15)' : 'transparent'}`,
                transition: 'all 0.15s',
              }}>
              {/* 상단: 태그 + 날짜 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                    background: `${issue.tagColor}12`, color: issue.tagColor,
                  }}>{issue.tag}</span>
                  {issue.status === 'CLOSED' && (
                    <span style={{
                      fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 3,
                      background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                      color: colors.textMuted,
                    }}>종료</span>
                  )}
                </div>
                <span style={{
                  fontSize: 10, color: colors.textMuted, fontFamily: FONTS.mono,
                }}>{issue.lastUpdate}</span>
              </div>
              {/* 제목 */}
              <div style={{
                fontSize: 13, fontWeight: 700,
                color: active ? PREMIUM.accent : colors.textPrimary,
                lineHeight: 1.4, marginBottom: 4,
                fontFamily: FONTS.serif,
              }}>{issue.title}</div>
              {/* 서브타이틀 */}
              <div style={{
                fontSize: 11, color: colors.textMuted, lineHeight: 1.4,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>{issue.subtitle}</div>
              {/* 가격 */}
              {issue.price && (
                <div style={{
                  marginTop: 8, paddingTop: 6,
                  borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
                    {issue.price}원
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, fontFamily: FONTS.mono,
                    color: issue.changeNeg ? '#2563EB' : '#DC2626',
                  }}>{issue.change}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 페이지 터너 */}
      {archivePages > 1 && (
        <div style={{
          padding: '8px 16px',
          borderTop: `1px solid ${sep}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <button onClick={() => setArchivePage(Math.max(0, archivePage - 1))}
            disabled={archivePage === 0}
            style={{
              background: 'none', border: 'none', cursor: archivePage === 0 ? 'default' : 'pointer',
              color: archivePage === 0 ? (dark ? '#333' : '#D4D4D8') : colors.textMuted,
              fontSize: 12, padding: '2px 6px',
            }}>←</button>
          {Array.from({ length: archivePages }).map((_, p) => (
            <button key={p} onClick={() => setArchivePage(p)}
              style={{
                width: 22, height: 22, borderRadius: 6, border: 'none',
                fontSize: 10, fontWeight: 700, fontFamily: FONTS.mono,
                cursor: 'pointer',
                background: p === archivePage ? PREMIUM.accent : 'transparent',
                color: p === archivePage ? '#fff' : colors.textMuted,
              }}>{p + 1}</button>
          ))}
          <button onClick={() => setArchivePage(Math.min(archivePages - 1, archivePage + 1))}
            disabled={archivePage === archivePages - 1}
            style={{
              background: 'none', border: 'none',
              cursor: archivePage === archivePages - 1 ? 'default' : 'pointer',
              color: archivePage === archivePages - 1 ? (dark ? '#333' : '#D4D4D8') : colors.textMuted,
              fontSize: 12, padding: '2px 6px',
            }}>→</button>
        </div>
      )}
    </div>
  ) : null

  return (
    <div className="page-enter" style={{
      maxWidth: 960, margin: '0 auto',
      paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
      fontFamily: FONTS.body, backgroundColor: colors.bgPrimary,
    }}>

      {/* 헤더 */}
      <div style={{ padding: '28px 24px 0' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: colors.textPrimary, letterSpacing: -0.5, fontFamily: FONTS.serif }}>
          이슈 <span style={{ color: PREMIUM.accent }}>트래커</span>
        </div>
        <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 6 }}>
          시장을 움직이는 이슈를 처음부터 끝까지 추적합니다
        </div>
      </div>

      {/* 2컬럼: 본문 + 사이드바 (데스크톱) / 1컬럼 (모바일) */}
      <div className="issue-layout" style={{
        display: 'flex', gap: 20, padding: '22px 24px 0',
        alignItems: 'flex-start',
      }}>

        {/* 좌: 본문 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* 현재 이슈 카드 — 지난 이슈 선택 시 숨김 */}
          {!(selected && selected.archived) && currentIssues.map((issue) => {
            const active = selectedId === issue.id
            return (
              <div key={issue.id} className="touch-press"
                onClick={() => setSelectedId(issue.id)}
                style={{
                  display: 'flex', borderRadius: 16, cursor: 'pointer',
                  marginBottom: 14, overflow: 'hidden',
                  background: active
                    ? (dark ? 'rgba(220,38,38,0.06)' : 'rgba(220,38,38,0.03)')
                    : (dark ? '#141416' : '#fff'),
                  border: `1px solid ${active ? 'rgba(220,38,38,0.15)' : sep}`,
                  transition: 'all 0.2s',
                }}>
                {/* 좌측 액센트바 */}
                <div style={{
                  width: active ? 4 : 0, flexShrink: 0,
                  background: PREMIUM.accent,
                  borderRadius: '4px 0 0 4px',
                  transition: 'width 0.2s',
                }} />
                <div style={{ flex: 1, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 4,
                      background: issue.statusColor, color: '#fff', letterSpacing: '0.05em',
                    }}>{issue.status}</span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                      background: `${issue.tagColor}15`, color: issue.tagColor,
                    }}>{issue.tag}</span>
                    <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono, marginLeft: 'auto' }}>
                      {issue.lastUpdate}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 17, fontWeight: 800, color: colors.textPrimary,
                    fontFamily: FONTS.serif, letterSpacing: '-0.3px', marginBottom: 4,
                  }}>{issue.title}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 6 }}>
                    <div style={{ fontSize: 13, color: colors.textMuted, lineHeight: 1.5, flex: 1 }}>
                      {issue.subtitle}
                    </div>
                    {issue.price && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 }}>
                        <span style={{
                          fontSize: 14, fontWeight: 700, fontFamily: FONTS.mono,
                          color: colors.textPrimary,
                        }}>{issue.price}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, fontFamily: FONTS.mono,
                          color: issue.changeNeg ? '#2563EB' : PREMIUM.accent,
                        }}>{issue.change}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* 아카이브 이슈 선택 시: 돌아가기 버튼 + 제목 */}
          {selected && selected.archived && (
            <>
              <button className="touch-press" onClick={() => setSelectedId(currentIssues[0]?.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 600, color: PREMIUM.accent,
                  padding: 0, marginBottom: 8,
                }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={PREMIUM.accent} strokeWidth="2" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                현재 이슈로
              </button>
              <div style={{
                padding: '16px 20px', borderRadius: 14, marginBottom: 14,
                background: dark ? '#141416' : '#fff',
                border: `1px solid ${sep}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                    background: `${selected.tagColor}15`, color: selected.tagColor,
                  }}>{selected.tag}</span>
                  <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>
                    {selected.lastUpdate}
                  </span>
                  <span style={{
                    fontSize: 8, fontWeight: 600, padding: '1px 6px', borderRadius: 3,
                    background: dark ? '#27272A' : '#E4E4E7', color: colors.textMuted,
                  }}>지난 이슈</span>
                </div>
                <div style={{
                  fontSize: 17, fontWeight: 800, color: colors.textPrimary,
                  fontFamily: FONTS.serif, letterSpacing: '-0.3px',
                }}>{selected.title}</div>
                <div style={{ fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 1.5 }}>
                  {selected.subtitle}
                </div>
              </div>
            </>
          )}

          {/* 선택된 이슈 상세 */}
          {selected && (
            <>
              {/* 타임라인 */}
              <div style={{
                padding: '22px 20px', borderRadius: 16,
                background: dark ? '#141416' : '#fff',
                border: `1px solid ${sep}`,
                marginBottom: 16,
              }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: colors.textPrimary,
                  fontFamily: FONTS.serif, marginBottom: 18,
                }}>타임라인</div>
                {selected.timeline.map((event, i) => {
                  const dotSize = event.highlight ? 14 : 9
                  const lineLeft = event.highlight ? 7 : 4
                  return (
                  <div key={i} style={{
                    display: 'flex', gap: 14, marginBottom: i < selected.timeline.length - 1 ? 18 : 0,
                    position: 'relative',
                  }}>
                    {i < selected.timeline.length - 1 && (
                      <div style={{
                        position: 'absolute', left: lineLeft, top: dotSize + 4, bottom: -18,
                        width: 1, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                      }} />
                    )}
                    <div className={event.highlight ? 'timeline-dot-pulse' : undefined} style={{
                      width: dotSize, height: dotSize, borderRadius: '50%', flexShrink: 0, marginTop: 3,
                      background: event.highlight ? PREMIUM.accent : (dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'),
                      boxShadow: event.highlight ? '0 0 0 4px rgba(220,38,38,0.15)' : 'none',
                      border: event.highlight ? '2px solid rgba(220,38,38,0.3)' : 'none',
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: FONTS.mono }}>{event.date}</span>
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4,
                          background: event.highlight ? `${PREMIUM.accent}15` : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
                          color: event.highlight ? PREMIUM.accent : colors.textMuted,
                        }}>{event.signal}</span>
                      </div>
                      <div style={{
                        fontSize: 14, fontWeight: event.highlight ? 700 : 600,
                        color: event.highlight ? PREMIUM.accent : colors.textPrimary,
                        fontFamily: FONTS.serif, marginBottom: 3,
                      }}>{event.title}</div>
                      <div style={{ fontSize: 12, color: colors.textMuted, lineHeight: 1.55 }}>
                        {event.desc}
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>

              {/* 분석 본문 */}
              <div style={{
                padding: '22px 20px', borderRadius: 16,
                background: dark ? '#141416' : '#fff',
                border: `1px solid ${sep}`,
                marginBottom: 16,
              }}>
                <IssueMarkdown content={selected.analysis} colors={colors} dark={dark} />
              </div>

              {/* 인사이트 */}
              <div style={{
                padding: '18px 22px', borderRadius: 14,
                borderLeft: `3px solid ${PREMIUM.accent}`,
                background: dark ? 'rgba(220,38,38,0.04)' : 'rgba(220,38,38,0.02)',
                position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', top: 10, left: 18,
                  fontSize: 36, fontFamily: FONTS.serif, fontWeight: 700,
                  color: dark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.08)',
                  lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
                }}>"</span>
                <div style={{
                  fontSize: 14, fontStyle: 'italic', color: colors.textSecondary,
                  lineHeight: 1.7, fontFamily: FONTS.serif,
                  paddingLeft: 20, paddingTop: 4,
                }}>
                  {selected.insight}
                </div>
              </div>
            </>
          )}

          {/* 모바일: 지난 이슈 하단 표시 */}
          <div className="issue-archive-mobile">
            <ArchiveSidebar />
          </div>
        </div>

        {/* 우: 사이드바 (데스크톱만) */}
        <div className="issue-sidebar" style={{ width: 280, flexShrink: 0 }}>
          <div style={{ position: 'sticky', top: 80 }}>
            <ArchiveSidebar />
          </div>
        </div>
      </div>

      <style>{`
        .issue-sidebar { display: block; }
        .issue-archive-mobile { display: none; }
        @media (max-width: 768px) {
          .issue-layout { flex-direction: column !important; }
          .issue-sidebar { display: none !important; }
          .issue-archive-mobile { display: block; margin-top: 20px; }
        }
        .issue-archive-item:hover {
          background: ${dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'} !important;
        }
        @keyframes timeline-pulse {
          0% { box-shadow: 0 0 0 4px rgba(220,38,38,0.15); }
          50% { box-shadow: 0 0 0 8px rgba(220,38,38,0.06); }
          100% { box-shadow: 0 0 0 4px rgba(220,38,38,0.15); }
        }
        .timeline-dot-pulse {
          animation: timeline-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}


function IssueMarkdown({ content, colors, dark }) {
  if (!content) return null
  const lines = content.split('\n')
  const elements = []
  let tableRows = []
  let tableHeaders = []
  let inTable = false
  let key = 0

  const renderInline = (text) => {
    const parts = []
    let idx = 0, lastEnd = 0
    const re = /\*\*(.+?)\*\*/g
    let match
    while ((match = re.exec(text)) !== null) {
      if (match.index > lastEnd) parts.push(<span key={`t${idx++}`}>{text.slice(lastEnd, match.index)}</span>)
      parts.push(<strong key={`b${idx++}`} style={{ color: colors.textPrimary, fontWeight: 600 }}>{match[1]}</strong>)
      lastEnd = match.index + match[0].length
    }
    if (lastEnd < text.length) parts.push(<span key={`t${idx++}`}>{text.slice(lastEnd)}</span>)
    return parts.length > 0 ? parts : text
  }

  const flushTable = () => {
    if (tableHeaders.length > 0) {
      elements.push(
        <div key={`tbl-${key++}`} style={{
          overflowX: 'auto', margin: '12px 0',
          borderRadius: 10, border: `1px solid ${dark ? '#27272A' : '#E4E4E7'}`,
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>{tableHeaders.map((h, i) => (
                <th key={i} style={{
                  padding: '8px 12px', textAlign: 'left',
                  borderBottom: `2px solid ${dark ? '#333' : '#D4D4D8'}`,
                  background: dark ? '#0F0F11' : '#FAFAFA',
                  color: colors.textMuted, fontWeight: 600, fontSize: 11,
                }}>{renderInline(h)}</th>
              ))}</tr>
            </thead>
            <tbody>
              {tableRows.map((row, ri) => (
                <tr key={ri}>{row.map((cell, ci) => (
                  <td key={ci} style={{
                    padding: '7px 12px',
                    borderBottom: `1px solid ${dark ? '#1E1E22' : '#F0F0F2'}`,
                    color: colors.textSecondary, fontSize: 12,
                  }}>{renderInline(cell)}</td>
                ))}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
    tableHeaders = []; tableRows = []; inTable = false
  }

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed.split('|').slice(1, -1).map(c => c.trim())
      if (cells.every(c => /^[-:]+$/.test(c))) continue
      if (!inTable) { tableHeaders = cells; inTable = true } else { tableRows.push(cells) }
      continue
    }
    if (inTable) flushTable()
    if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={key++} style={{ fontSize: 16, fontWeight: 800, color: colors.textPrimary, fontFamily: FONTS.serif, margin: '20px 0 10px' }}>{renderInline(trimmed.replace(/^##\s*/, ''))}</h2>)
      continue
    }
    if (trimmed.startsWith('- ')) {
      elements.push(<div key={key++} style={{ display: 'flex', gap: 8, margin: '4px 0', fontSize: 13, color: colors.textSecondary, lineHeight: 1.6 }}><span style={{ color: PREMIUM.accent }}>•</span><span>{renderInline(trimmed.replace(/^-\s*/, ''))}</span></div>)
      continue
    }
    if (!trimmed) continue
    elements.push(<p key={key++} style={{ margin: '6px 0', fontSize: 13.5, lineHeight: 1.7, color: colors.textSecondary }}>{renderInline(trimmed)}</p>)
  }
  if (inTable) flushTable()
  return <>{elements}</>
}

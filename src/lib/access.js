// 유료 정보 서비스 접근 제어 (2026-08-22)
//
// 상품 구성 = 오늘의 공시 · 브리핑 · 미국장 브리핑 3종, 월 9,900원.
// __DART 픽은 상품에 포함하지 않는다__ — 자산운용용 내부 도구라 판매 대상이 아니다.
// 픽을 팔지 않기로 한 판단은 근거가 있다: 알파 초과중앙 +0.49%(p=1.000),
// 위약 대조군 p=0.363. 성과를 약속할 수 없는 것을 상품에 넣지 않는다.
//
// ⚠️ 판매 문구에 "수익을 높여준다" 류를 쓰지 않는다. 이 셋은 성과 상품이 아니라
//    __정보 압축·시간 절약__ 상품이다(원문 검증이 유일한 해자).

export const PREMIUM_PRICE = 9900
export const PREMIUM_PRICE_LABEL = '월 9,900원'

// 무료/유료 경계 — __여기만 고치면 경계가 바뀐다.__
// 오늘의 공시를 무료 유입 채널로 되돌리려면 today: false 한 줄이면 된다.
// 🚧 2026-08-22 현재 __전부 꺼둔 상태로 배포__돼 있다.
//    페이월 코드는 완성됐지만, 대가를 받고 불특정 다수에게 투자판단 정보를 제공하면
//    __유사투자자문업 신고 대상__이 된다(무료일 때는 안 걸리던 문제다).
//    신고 여부를 확인한 뒤 아래 셋을 true 로 바꾸면 즉시 유료화된다.
export const PAID = {
  today: false,      // 오늘의 공시
  briefing: false,   // 일일 브리핑
  usMarket: false,   // 미국장 브리핑 (편지 + 인과 지도)
}

// 비구독자에게 보여주는 미리보기 분량
export const PREVIEW = {
  todayRows: 5,       // 공시 피드 상단 N행
  contentRatio: 0.2,  // 마크다운 본문 앞 20%
  // ⚠️ 비율만 쓰면 __긴 글에서 미리보기가 폭주한다.__ 미국 편지는 본문이 길어
  //    20%만 해도 「어젯밤 뉴욕 10줄」이 통째로 열렸다(실측). 글자 수 상한을 함께 건다.
  contentMaxChars: 900,
}

const ADMIN_EMAIL = 'j07087815@gmail.com'

function readUser() {
  try { return JSON.parse(localStorage.getItem('dart_user')) } catch { return null }
}

export function isAdminUser() {
  return readUser()?.email === ADMIN_EMAIL
}

export function isLoggedIn() {
  return !!readUser()
}

// 구독 권한: 관리자 또는 로그인 사용자의 premium 플래그
export function hasPremium() {
  if (isAdminUser()) return true
  return !!readUser()?.premium
}

// 해당 콘텐츠를 지금 볼 수 있는가
export function canView(key) {
  if (!PAID[key]) return true
  return hasPremium()
}

// 마크다운 본문을 미리보기 분량으로 자른다.
//
// __섹션 경계에서 끊는 것이 핵심이다.__ 글자 수로만 자르면 하필 알맹이 한가운데서
// 끊긴다 — 미국 편지는 900자 상한이 「어젯밤 뉴욕 10줄」 안쪽에 떨어졌다(실측 24행·854자).
// 그래서 첫 구분선(---)이나 두 번째 이후 헤딩에서 먼저 끊고, 그게 없을 때만
// 비율·글자수 상한으로 폴백한다.
export function previewMarkdown(content, ratio = PREVIEW.contentRatio) {
  if (!content) return ''
  const lines = content.split('\n')

  // 1) 비율 + 글자 수 상한 (둘 중 먼저 걸리는 쪽)
  let cut = Math.max(6, Math.floor(lines.length * ratio))
  let acc = 0
  for (let i = 0; i < cut; i++) {
    acc += lines[i].length + 1
    if (acc > PREVIEW.contentMaxChars) { cut = Math.max(6, i); break }
  }

  // 2) 섹션 경계가 그 앞에 있으면 거기서 끊는다 (도입부만 열리는 자연스러운 지점)
  for (let i = 3; i < cut; i++) {
    const ln = lines[i].trim()
    if (ln === '---' || ln === '***' || /^##+ /.test(ln)) { cut = i; break }
  }

  // 3) 표 한가운데서 끊기면 표 시작 전까지만 (반쪽 표는 깨져 보인다)
  while (cut > 3 && lines[cut] && lines[cut].trim().startsWith('|')) cut--
  return lines.slice(0, cut).join('\n')
}

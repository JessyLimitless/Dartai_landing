/** API 베이스 URL.
 *  - 개발: VITE_API_URL 미설정 → '' → Vite proxy 경유
 *  - 프로덕션: VITE_API_URL=https://cloud5-도메인 → 절대 URL
 */
export const API = import.meta.env.VITE_API_URL || ''

/** 🔑 구글 로그인 세션 토큰 (localStorage `dart_session_token`).
 *
 *  __이게 기본 경로다.__ 관리자 계정으로 구글 로그인하면 백엔드가 발급해서
 *  내려주고(`/api/auth/google` 의 `session_token`), 아래 `secretHeaders()` 가
 *  자동으로 실어 보낸다. 사용자가 손으로 넣을 것이 없다.
 *
 *  ☠️ 왜 만들었나: 예전엔 화면 진입은 __구글 로그인__ 이 가르고 데이터는
 *     __수동 토큰__ 이 갈랐다. 둘이 서로를 몰라서 "로그인했는데 픽이 비어 있다"가
 *     났다. 게다가 수동 토큰은 서버 `/app/.env` 에만 살아 __재빌드하면 무효__ 가
 *     되는데, 틀린 토큰이 401 이 아니라 200 + masked 로 와서 화면이 에러조차
 *     못 띄웠다. 세션은 SQLite(볼륨)에 있어 재빌드를 견딘다.
 */
export function sessionToken() {
  try { return localStorage.getItem('dart_session_token') || '' } catch { return '' }
}

/** 🔒 공유 시크릿 (localStorage `dart_admin_token`) — __폴백 경로.__
 *
 *  크론·curl 같은 사람 없는 호출이 쓰는 서버 `ADMIN_API_TOKEN` 과 같은 값이다.
 *  브라우저에서는 세션이 없을 때의 비상구로만 남긴다. 평소엔 필요 없다.
 */
export function adminToken() {
  try { return localStorage.getItem('dart_admin_token') || '' } catch { return '' }
}

/** 🔑 로그인 응답을 저장한다 — __반드시 여기 한 곳에서만.__
 *
 *  ☠️ 2026-08-25 실사고. `/api/auth/google` 호출부가 __네 군데__로 복붙돼 있었다
 *     (Header · LandingPage · BriefingPage · DartViewPage). 세션 저장을
 *     Header 에만 넣었더니 __랜딩에서 로그인한 경우 픽이 계속 잠겼다.__
 *     서버는 세션을 정상 발급했는데 화면이 그걸 버린 것이라 로그만 봐서는
 *     "로그인 성공"으로 보였다.
 *
 *  저장 로직을 여기로 모은다. 호출부가 다섯 번째로 늘어나도 이 함수만 부르면
 *  같은 구멍이 다시 안 생긴다.
 */
export function saveAuth(data) {
  try {
    if (data && data.user) localStorage.setItem('dart_user', JSON.stringify(data.user))
    if (data && data.session_token) localStorage.setItem('dart_session_token', data.session_token)
    else localStorage.removeItem('dart_session_token')
  } catch { /* 무시 */ }
}

/** 비밀 게이트 헤더. __세션 우선__, 없으면 공유 시크릿, 둘 다 없으면 마스킹된 응답. */
export function secretHeaders() {
  const h = {}
  const s = sessionToken()
  if (s) h['x-session-token'] = s
  const t = adminToken()
  if (t) h['x-admin-token'] = t
  return h
}

/**
 * API 공통 fetch 헬퍼.
 * JSON 응답을 파싱하여 반환한다.
 *
 * @param {string} path - '/api/quant/signals' 형태의 경로 (또는 쿼리스트링 포함)
 * @param {RequestInit} [options] - fetch 옵션 (method, body 등)
 * @returns {Promise<any>} - 파싱된 JSON
 * @throws {Error} - 네트워크 오류 또는 HTTP 에러 시
 */
export async function apiFetch(path, options = {}) {
  const url = `${API}${path}`
  const res = await window.fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...secretHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API 오류 ${res.status}: ${path}`)
  }
  return res.json()
}

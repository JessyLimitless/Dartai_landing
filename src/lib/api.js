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

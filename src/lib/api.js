/** API 베이스 URL.
 *  - 개발: VITE_API_URL 미설정 → '' → Vite proxy 경유
 *  - 프로덕션: VITE_API_URL=https://cloud5-도메인 → 절대 URL
 */
export const API = import.meta.env.VITE_API_URL || ''

/** 🔒 영업비밀 게이트 토큰 (localStorage `dart_admin_token`).
 *
 *  픽 종목·선정 로직은 서버가 __기본적으로 마스킹__한다. 이 토큰이 붙은 요청만
 *  원문을 받는다. 브라우저에 두는 값이라 완벽한 비밀은 아니지만,
 *  __위조가 자명한 `x-user-email` 헤더보다는 훨씬 낫고__ 무인증 전면 공개를 막는다.
 *
 *  설정: 브라우저 콘솔에서
 *    localStorage.setItem('dart_admin_token', '<서버 ADMIN_API_TOKEN>')
 */
export function adminToken() {
  try { return localStorage.getItem('dart_admin_token') || '' } catch { return '' }
}

/** 토큰이 있으면 비밀 게이트 헤더를 얹는다. 없으면 빈 객체(=마스킹된 응답). */
export function secretHeaders() {
  const t = adminToken()
  return t ? { 'x-admin-token': t } : {}
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

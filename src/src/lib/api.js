/** API 베이스 URL.
 *  - 개발: VITE_API_URL 미설정 → '' → Vite proxy 경유
 *  - 프로덕션: VITE_API_URL=https://cloud5-도메인 → 절대 URL
 */
export const API = import.meta.env.VITE_API_URL || ''

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
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) {
    throw new Error(`API 오류 ${res.status}: ${path}`)
  }
  return res.json()
}

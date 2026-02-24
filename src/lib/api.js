/** API 베이스 URL.
 *  - 개발: VITE_API_URL 미설정 → '' → Vite proxy 경유
 *  - 프로덕션: VITE_API_URL=https://cloud5-도메인 → 절대 URL
 */
export const API = import.meta.env.VITE_API_URL || ''

/** API 베이스 URL.
 *  - 개발: VITE_API_URL 미설정 → Vite proxy 경유 (vite.config.js proxy 설정 사용)
 *  - 프로덕션: VITE_API_URL 환경변수 우선, 없으면 Cloud5 백엔드 기본값
 */
export const API = import.meta.env.VITE_API_URL || 'https://dartai-backend.cloud5.socialbrain.co.kr'

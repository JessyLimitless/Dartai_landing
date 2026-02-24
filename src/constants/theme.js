// DART Insight — Premium Design Tokens

export const GRADE_COLORS = {
  S: { bg: '#DC2626', color: '#fff', label: 'S', lightBg: '#FEF2F2' },
  A: { bg: '#0D9488', color: '#fff', label: 'A', lightBg: '#F0FDFA' },
  D: { bg: '#1D4ED8', color: '#fff', label: 'D', lightBg: '#EFF6FF' },
}

export const MARKET_LABELS = {
  Y: 'KOSPI',
  K: 'KOSDAQ',
  N: 'KONEX',
  E: 'ETC',
}

export const EARNINGS_STYLE = {
  border: '#DC2626',
  bg: '#FEF2F2',
  accent: '#991B1B',
  badge: '#DC2626',
  label: 'Earnings',
}

export const VARIABLE_GRADE_COLORS = {
  '대운': { bg: '#FEF3C7', text: '#92400E', badge: '#F59E0B', mark: '\u2B50' },
  '순풍': { bg: '#DCFCE7', text: '#166534', badge: '#16A34A', mark: '\uD83D\uDFE2' },
  '양호': { bg: '#F0FDF4', text: '#15803D', badge: '#4ADE80', mark: '\uD83D\uDFE1' },
  '보통': { bg: '#FEF9C3', text: '#92400E', badge: '#D97706', mark: '\u26AA' },
  '주의': { bg: '#FEF2F2', text: '#991B1B', badge: '#EA580C', mark: '\uD83D\uDFE0' },
  '경고': { bg: '#FEE2E2', text: '#991B1B', badge: '#DC2626', mark: '\uD83D\uDD34' },
}

export const FONTS = {
  body: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  serif: "'Noto Serif KR', 'Georgia', serif",
}

export const PREMIUM = {
  accent: '#DC2626',
  accentLight: '#FEF2F2',
  accentDark: '#991B1B',
  shadowSm: '0 1px 2px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.04)',
  shadowMd: '0 4px 8px rgba(0,0,0,0.06), 0 12px 24px -4px rgba(0,0,0,0.08)',
  shadowLg: '0 8px 16px rgba(0,0,0,0.08), 0 20px 40px -8px rgba(0,0,0,0.12)',
  cardRadius: '16px',
  borderLight: '#E4E4E7',
}

export const COLORS = {
  bgPrimary: '#FAFAFA',
  bgCard: '#FFFFFF',
  bgDark: '#18181B',
  bgDarkHover: '#27272A',
  border: '#E4E4E7',
  borderLight: '#F4F4F5',
  textPrimary: '#18181B',
  textSecondary: '#52525B',
  textMuted: '#A1A1AA',
  accent: '#DC2626',
  positive: '#059669',
  negative: '#2563EB',
}

export function formatKoreanNumber(value) {
  if (value == null || isNaN(value)) return '-'
  const abs = Math.abs(value)
  if (abs >= 1e12) return (value / 1e12).toFixed(1) + '조'
  if (abs >= 1e8) return (value / 1e8).toFixed(0) + '억'
  if (abs >= 1e4) return (value / 1e4).toFixed(0) + '만'
  return value.toLocaleString()
}

export function formatPercent(value) {
  if (value == null || isNaN(value)) return '-'
  const sign = value > 0 ? '+' : ''
  return sign + value.toFixed(2) + '%'
}

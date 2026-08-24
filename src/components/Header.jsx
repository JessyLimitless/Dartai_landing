import React, { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import { useTheme } from '../contexts/ThemeContext'
import { FONTS, PREMIUM, PREMIUM_GOLD } from '../constants/theme'
import { isAdmin, ADMIN_EMAIL } from './AdminPage'
import { useAuth } from '../contexts/AuthContext'

const TABS = [
  { key: '/', label: '홈', mobileLabel: '홈', exact: true },
  // 오늘의 공시는 __무료__ — PRO 배지를 붙이지 않는다(2026-08-22 경계 확정)
  { key: '/today', label: '오늘의 공시', mobileLabel: '공시' },
  // 🔒 DART 픽 = __관리자 전용 메뉴__ (2026-08-25 복구).
  //    2026-08-22에 통째로 감췄다가, 메뉴·아이콘은 되살리고 __노출 대상만 좁혔다__ —
  //    매일 픽 세션이 이 화면을 쓰는데 주소를 직접 쳐야 했기 때문이다(사용자 요청).
  //
  //    ⚠️ __PRO 배지를 붙이지 않는다.__ 픽은 유료 상품이 아니라 자산운용용 내부
  //    도구다. PRO 를 달면 "구독하면 열리는 것"으로 읽혀 상품 경계가 흐려진다
  //    (`lib/access.js` 의 PAID 에 pick 키가 없는 것과 같은 이유).
  //    판매하지 않는 판단은 데이터와도 정합적이다: 알파 초과중앙 +0.49%(p=1.000),
  //    위약 대조군 p=0.363 — 성과를 약속할 수 없는 것을 팔지 않는다.
  //
  //    ⚠️ __이 필터는 화면 게이트일 뿐 보안이 아니다.__ 진짜 경계는 API 마스킹
  //    (`X-Admin-Token`)에 있고, 이미 걸려 있다 — 토큰 없이 `/api/pick/today` 를
  //    치면 corp_name 이 null 로 온다(2026-08-25 실측). 프론트 게이트만 믿지 않는다.
  { key: '/dart-pick', label: 'DART 픽', mobileLabel: '픽', adminOnly: true },
  { key: '/briefing', label: '브리핑', mobileLabel: '브리핑', premium: true },
  { key: '/us-market', label: '미국장', mobileLabel: '미국장', premium: true },
  // 🔕 배당 노출 중단(2026-08-19) — 국내 배당 정보는 효용이 낮고 데이터 부채도 있다
  //    (291종이 2023년 이전에서 stale). __코드·API·라우트는 그대로 둔다__ —
  //    되돌릴 수 있게, 그리고 종목 페이지의 한 섹션으로 흡수할 예정이라.
  // { key: '/dividend', label: '배당', mobileLabel: '배당' },
  // 🔕 레이더 노출 중단(2026-08-19, 신설 당일) — 실측이 서사를 기각했다. 상세 `UP3.md`.
  //    · 보드1 대차잔고: 유니버스 백분위 48% = __측정된 무정보__(100거래일)
  //    · 보드2 공매도비중: 초과는 있으나 값의 대부분이 종목 선택이지 일간 순위가 아님
  //      (횡단면 T+25 +7.95% vs 자기대조 +1.30%p) → 매일 보는 랭킹일 이유가 없다
  //    · 보드3 시장경보·보드4 내부자: 브리핑·픽 게이트가 이미 쓰고, 내부자는 방향 미판독
  //    남아 있던 비편집 근거(SEO 내부링크)도 무효 — /radar 는 CSR 이라 크롤러가 받는
  //    HTML 에 종목 링크가 __0개__ 다(실측). 서버렌더인 /stock 과 다르다.
  //    배당과 동일 처리: __코드·API·라우트는 그대로 둔다__ — 되돌릴 수 있게, 그리고
  //    종목 페이지의 한 섹션으로 흡수할 예정이라. 수집 크론도 유지한다(소멸성 데이터).
  // { key: '/radar', label: '레이더', mobileLabel: '레이더' },
  // 재무분석(/dart-view): 미완성이라 정식 서비스에서 숨김. 라우트는 App.jsx에 유지 — 완성 시 이 줄 복구로 재노출.
  // { key: '/dart-view', label: '재무분석', mobileLabel: '재무분석' },
  // 프리미엄은 하단 탭에서 뺀다. 375px에서 탭 7개(minWidth 56)는 폭을 넘겨
  // 마지막 칸이 화면 밖으로 잘렸다 — 그래서 모바일에서 안 보였다.
  // 대신 상단 헤더에 상시 노출되는 PRO 칩으로 올린다(아래 mobile-only).
  { key: '/premium', label: '프리미엄', mobileLabel: '구독', mobileHidden: true },
]

const TAB_ICONS = {
  '/': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  '/premium': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7l4.5 4L12 5l4.5 6L21 7l-1.8 11H4.8L3 7z" /><line x1="4.8" y1="21" x2="19.2" y2="21" />
    </svg>
  ),
  '/dart-pick': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.6" fill={color} />
    </svg>
  ),
  '/briefing': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  '/today': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  '/feedback': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  '/issues': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  '/signal': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  // 레이더 — 좌하단 원점에서 퍼지는 신호 호 3개 + 발신점.
  // ⚠️ 동심원+점으로 그렸더니 `/dart-pick`(circle r9 + r4.5 + dot)과 실루엣이
  //    사실상 같았다(모바일 탭바에서 두 칸이 붙어 있어 구분 불가).
  //    첫 수정본은 호 간격이 좁아 20px 에서 뭉쳐 보였다 → 반지름을 6/11/16 으로
  //    벌리고 사분호로 정리했다. 톤(24 viewBox · stroke 1.8 · round)은 유지.
  '/radar': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13.5 A 6 6 0 0 1 11 19.5" />
      <path d="M5 8.5 A 11 11 0 0 1 16 19.5" />
      <path d="M5 3.5 A 16 16 0 0 1 21 19.5" />
      <circle cx="5" cy="19.5" r="1.5" fill={color} stroke="none" />
    </svg>
  ),
  '/dividend': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M14.8 9.2a3 3 0 0 0-2.8-1.7c-1.5 0-2.6.9-2.6 2.1 0 2.9 5.6 1.5 5.6 4.5 0 1.3-1.2 2.2-2.8 2.2a3.1 3.1 0 0 1-2.9-1.8" />
      <line x1="12" y1="6" x2="12" y2="18" />
    </svg>
  ),
  '/dart-view': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  '/us-beneficiary': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2 a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1 -4 10 15.3 15.3 0 0 1 -4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  '/us-market': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  '/dart-event': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="10" y1="14" x2="14" y2="14" />
    </svg>
  ),
  '/deep-dive': (color, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
}

export default function Header({
  notifications,
  unreadCount,
  loading,
  onRead,
  onMarkAllRead,
  onSelectNotification,
  hiddenTopBar = false,
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { dark, toggle, colors } = useTheme()
  const googleBtnRef = useRef(null)
  const [showGoogleBtn, setShowGoogleBtn] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLoginNotice, setShowLoginNotice] = useState(false)
  const { user, login, logout } = useAuth()

  // 관리자 전용 탭(현재 DART 픽) 노출 여부.
  //
  // ⚠️ `isAdmin()` 대신 __컨텍스트의 user 를 본다.__ isAdmin() 은 localStorage 를
  //    직접 읽어서 값은 같지만 __리렌더를 유발하지 않는다__ — 로그인 직후 메뉴가
  //    안 나타나고 새로고침해야 보이는 문제가 생긴다. useAuth() 의 user 는
  //    dart-auth-change 이벤트로 갱신되므로 로그인·로그아웃 즉시 반영된다.
  const showAdminTabs = user?.email === ADMIN_EMAIL
  const visibleTabs = TABS.filter(tab => !tab.adminOnly || showAdminTabs)

  // 외부 클릭 시 유저 메뉴 닫기
  useEffect(() => {
    if (!showUserMenu) return
    const handler = () => setShowUserMenu(false)
    window.addEventListener('click', handler)
    return () => window.removeEventListener('click', handler)
  }, [showUserMenu])

  const handleGoogleLogin = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: '20826231899-mfkodjf7svaafnr63ne773g5s6cf5k1m.apps.googleusercontent.com',
        callback: async (response) => {
          try {
            const API_URL = import.meta.env.VITE_API_URL || ''
            const res = await fetch(`${API_URL}/api/auth/google`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            })
            if (res.ok) {
              const data = await res.json()
              if (data.user) {
                login(data.user)
                setShowGoogleBtn(false)
              }
            }
          } catch {}
        },
      })
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setShowGoogleBtn(true)
          setTimeout(() => {
            if (googleBtnRef.current) {
              window.google.accounts.id.renderButton(googleBtnRef.current, {
                theme: 'outline', size: 'large', width: 280, text: 'signin_with',
              })
            }
          }, 100)
        }
      })
    }
  }

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleNav = (path) => navigate(path)

  const accentColor = '#DC2626'

  return (
    <>
      {/* ── 데스크톱 상단 바 ── */}
      {!hiddenTopBar && <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 56,
        backgroundColor: dark ? 'rgba(9,9,11,0.97)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Left: Logo */}
        <div onClick={() => navigate(isAdmin() ? '/admin' : '/')}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 7,
            background: 'linear-gradient(135deg, #DC2626, #991B1B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span style={{
            fontSize: 16, fontWeight: 700, letterSpacing: -0.5,
            fontFamily: FONTS.serif, color: colors.textPrimary,
          }}>
            DART <span style={{ color: accentColor }}>Insight</span>
          </span>
        </div>

        {/* Center: Desktop nav — 5탭만 */}
        <nav className="desktop-nav" style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 2,
          // ⚠️ absolute + 무폭이라 라벨이 길어지면 __버튼 안에서 줄바꿈__된다.
          //    2026-08-19 '배당'(2자)→'레이더'(3자)만으로 전 메뉴가 2줄로 깨졌다.
          //    라벨 길이에 안 흔들리게 nowrap 을 고정한다.
          whiteSpace: 'nowrap',
        }}>
          {visibleTabs.map((tab, idx) => {
            const active = isActive(tab.key)
            return (
              <button key={tab.key}
                onClick={() => handleNav(tab.key)}
                style={{
                  // nowrap 을 걸면 폭이 늘어 769~1100px 에서 우측 '로그인'과 겹친다.
                  // 데스크톱 nav 는 absolute 중앙정렬이라 공간을 예약하지 않기 때문이다.
                  // 좌우 패딩을 20→14 로 줄여 7개 항목 기준 84px 를 회수한다.
                  padding: '8px 14px', borderRadius: 8,
                  border: 'none', cursor: 'pointer',
                  whiteSpace: 'nowrap', flexShrink: 0,
                  fontSize: 14, fontWeight: active ? 700 : 400,
                  fontFamily: FONTS.serif,
                  letterSpacing: '0.02em',
                  backgroundColor: active
                    ? (dark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.06)')
                    : 'transparent',
                  color: active ? accentColor : colors.textMuted,
                  transition: 'all 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = colors.textPrimary
                    e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.color = colors.textMuted
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                {tab.label}
                {tab.premium && (
                  <span style={{
                    marginLeft: 5, fontSize: 9, fontWeight: 900, letterSpacing: '0.06em',
                    color: '#3A2C00', background: PREMIUM_GOLD.gradient,
                    padding: '2px 5px', borderRadius: 4, verticalAlign: 'middle',
                    boxShadow: `0 0 6px ${PREMIUM_GOLD.glow}`, fontFamily: FONTS.body,
                  }}>PRO</span>
                )}
                {/* 관리자 전용 표시 — 금색 PRO 와 __색을 겹치지 않게__ 무채색으로 둔다.
                    이게 판매 등급이 아니라 접근 범위라는 걸 한눈에 구분시키려는 것. */}
                {tab.adminOnly && (
                  <span style={{
                    marginLeft: 5, fontSize: 9, fontWeight: 800, letterSpacing: '0.06em',
                    color: dark ? '#A1A1AA' : '#6B7280',
                    border: `1px solid ${dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)'}`,
                    padding: '1px 4px', borderRadius: 4, verticalAlign: 'middle',
                    fontFamily: FONTS.body,
                  }}>ADMIN</span>
                )}
                {active && <div style={{
                  position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 16, height: 2, borderRadius: 1, background: accentColor,
                }} />}
              </button>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {/* 모바일 전용 프리미엄 진입점 — 하단 탭에서 뺀 자리를 여기서 받는다.
              결제 페이지가 아니라 안내 페이지라 상단 상시 노출로 충분하다. */}
          {/* 글자 'PRO'로 두면 로고 바로 옆이라 'DART Insight PRO'라는 상품명으로
              읽힌다. 아이콘 버튼으로 두면 옆의 테마·알림 버튼과 같은 문법이 된다. */}
          <button onClick={() => navigate('/premium')} className="mobile-only" aria-label="프리미엄"
            style={{
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none',
              width: 30, height: 30, borderRadius: 8, padding: 0,
              background: location.pathname === '/premium'
                ? (dark ? 'rgba(212,175,55,0.22)' : 'rgba(212,175,55,0.20)')
                : 'transparent',
            }}>
            {TAB_ICONS['/premium'](
              location.pathname === '/premium' ? '#D4AF37' : (dark ? '#C9A227' : '#A98A22'), 18
            )}
          </button>

          {/* PREMIUM 버튼 — 결제 연동 후 아래 주석 해제
          <button onClick={() => navigate('/premium')} className="desktop-nav" style={{
            padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: location.pathname === '/premium'
              ? (dark ? 'rgba(220,38,38,0.15)' : 'rgba(220,38,38,0.08)')
              : (dark ? 'rgba(220,38,38,0.08)' : 'rgba(220,38,38,0.06)'),
            color: '#DC2626', fontSize: 12, fontWeight: 700, letterSpacing: '0.02em',
          }}>PREMIUM</button>
          */}

          {user ? (
            <div style={{ position: 'relative' }}>
              <div onClick={(e) => { e.stopPropagation(); setShowUserMenu(v => !v) }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '4px 8px', borderRadius: 8 }}>
                {user.picture
                  ? <img src={user.picture} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                  : <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#fff', fontWeight: 700 }}>{user.name?.[0] || 'U'}</div>
                }
                <span className="desktop-nav" style={{ fontSize: 12, color: colors.textMuted, fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
              </div>
              {showUserMenu && (
                <div onClick={e => e.stopPropagation()} style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: 4,
                  background: dark ? '#1A1A1E' : '#FFFFFF',
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  minWidth: 180, zIndex: 200, overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: colors.textPrimary }}>{user.name}</div>
                    <div style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>{user.email}</div>
                  </div>
                  <button onClick={() => { logout(); setShowUserMenu(false) }} style={{
                    width: '100%', padding: '10px 16px', border: 'none', background: 'none',
                    textAlign: 'left', cursor: 'pointer', fontSize: 13,
                    color: '#DC2626', fontWeight: 500,
                  }}>로그아웃</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowLoginNotice(true)} style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: 'none', border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              color: colors.textMuted, fontSize: 12, fontWeight: 500,
              padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              로그인
            </button>
          )}
          <button onClick={toggle} aria-label={dark ? 'Light' : 'Dark'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, fontSize: 14, color: colors.textMuted, borderRadius: 8, lineHeight: 1,
            }}>
            {dark ? '☀' : '🌙'}
          </button>
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            loading={loading}
            onRead={onRead}
            onMarkAllRead={onMarkAllRead}
            onSelect={onSelectNotification}
          />
        </div>
      </header>}

      {/* 로그인 = 프리미엄 회원 전용 안내 모달 */}
      {showLoginNotice && (
        <div onClick={() => setShowLoginNotice(false)} style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: dark ? '#1A1A1E' : '#FFFFFF', borderRadius: 18, padding: '30px 26px',
            textAlign: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.24)',
            maxWidth: 360, width: '100%',
          }}>
            {/* 자물쇠 */}
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: dark ? 'rgba(220,38,38,0.12)' : 'rgba(220,38,38,0.07)',
            }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <span style={{
              display: 'inline-block', fontSize: 10, fontWeight: 900, letterSpacing: '0.06em',
              color: '#3A2C00', background: PREMIUM_GOLD.gradient,
              padding: '3px 8px', borderRadius: 5, marginBottom: 12,
              boxShadow: `0 0 6px ${PREMIUM_GOLD.glow}`,
            }}>PREMIUM</span>

            <p style={{ fontSize: 16, fontWeight: 700, color: colors.textPrimary, margin: '0 0 8px', fontFamily: FONTS.serif, letterSpacing: '-0.01em' }}>
              로그인은 프리미엄 회원 전용이에요
            </p>
            <p style={{ fontSize: 13.5, color: colors.textMuted, lineHeight: 1.7, margin: '0 0 22px' }}>
              로그인 계정은 <b style={{ color: colors.textSecondary }}>유료 회원</b>에게만 발급돼요.
              공시·브리핑·미국장은 로그인 없이 무료로 이용하실 수 있어요.
            </p>

            <button onClick={() => { setShowLoginNotice(false); navigate('/inquiry?type=premium') }} style={{
              width: '100%', padding: '13px', borderRadius: 12, border: 'none',
              background: '#DC2626', color: '#fff', fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
            }}>
              프리미엄 문의하기
            </button>
            <button onClick={() => { setShowLoginNotice(false); handleGoogleLogin() }} style={{
              width: '100%', marginTop: 10, padding: '11px', borderRadius: 12,
              border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#E4E4E7'}`, background: 'transparent',
              color: colors.textSecondary, fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}>
              이미 프리미엄 회원이에요 · Google 로그인
            </button>
            <button onClick={() => setShowLoginNotice(false)} style={{
              marginTop: 12, background: 'none', border: 'none', cursor: 'pointer',
              color: colors.textMuted, fontSize: 12.5,
            }}>닫기</button>
          </div>
        </div>
      )}

      {/* Google 로그인 폴백 모달 */}
      {showGoogleBtn && (
        <div onClick={() => setShowGoogleBtn(false)} style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: dark ? '#1A1A1E' : '#FFFFFF', borderRadius: 16, padding: '32px 28px',
            textAlign: 'center', boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
          }}>
            <p style={{ fontSize: 15, fontWeight: 600, color: colors.textPrimary, marginBottom: 20 }}>Google 계정으로 로그인</p>
            <div ref={googleBtnRef} />
            <button onClick={() => setShowGoogleBtn(false)} style={{
              marginTop: 16, padding: '8px 20px', borderRadius: 6,
              border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : '#E4E4E7'}`, background: 'transparent',
              color: colors.textMuted, fontSize: 13, cursor: 'pointer',
            }}>취소</button>
          </div>
        </div>
      )}

      {/* ── 모바일 하단 탭 바 ── */}
      {!hiddenTopBar && <nav className="bottom-tab-bar" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        display: 'none', // CSS로 모바일에서만 flex
        justifyContent: 'space-around', alignItems: 'center',
        height: 'calc(56px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: dark ? 'rgba(9,9,11,0.97)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
      }}>
        {visibleTabs.filter(tab => !tab.desktopOnly && !tab.mobileHidden).map((tab) => {
          const active = isActive(tab.key)
          const iconColor = active ? accentColor : '#94A3B8'
          const IconFn = TAB_ICONS[tab.key]
          return (
            <button key={tab.key}
              onClick={() => handleNav(tab.key)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 2, padding: '6px 0', border: 'none', cursor: 'pointer',
                background: 'transparent', minWidth: 56,
                transition: 'all 0.15s',
              }}>
              <span style={{ position: 'relative', display: 'inline-flex' }}>
                {IconFn && IconFn(iconColor, 20)}
                {tab.premium && (
                  <span style={{
                    position: 'absolute', top: -4, right: -9,
                    fontSize: 7, fontWeight: 900, letterSpacing: '0.02em',
                    color: '#3A2C00', background: PREMIUM_GOLD.gradient,
                    padding: '0 3px', borderRadius: 3, lineHeight: 1.5,
                    boxShadow: `0 0 4px ${PREMIUM_GOLD.glow}`,
                  }}>PRO</span>
                )}
              </span>
              <span style={{
                fontSize: 10, fontWeight: active ? 700 : 500,
                color: iconColor, letterSpacing: '0.02em',
                fontFamily: FONTS.serif,
              }}>
                {tab.mobileLabel}
              </span>
            </button>
          )
        })}
      </nav>}

      <style>{`
        .desktop-nav { display: flex; }
        .bottom-tab-bar { display: none !important; }
        .mobile-only { display: none !important; }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .bottom-tab-bar { display: flex !important; }
          .mobile-only { display: inline-flex !important; }
        }
      `}</style>
    </>
  )
}

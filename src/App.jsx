import React, { useState, useCallback, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom'
import Header from './components/Header'
import PushSubscribeBanner from './components/PushSubscribeBanner'
import ToastContainer from './components/ToastContainer'
import NotificationDetailModal from './components/NotificationDetailModal'
import { useNotifications } from './hooks/useNotifications'
import { useToastManager } from './hooks/useToastManager'
import { useTheme } from './contexts/ThemeContext'
import { ErrorProvider } from './contexts/ErrorContext'
import ErrorBoundary from './components/ErrorBoundary'
import LandingPage from './components/LandingPage'
import { FONTS } from './constants/theme'

const TodayPage   = lazy(() => import('./components/TodayPage'))
const HistoryPage = lazy(() => import('./components/HistoryPage'))
const CompanyCard = lazy(() => import('./components/CompanyCard'))
const DeepDataPage = lazy(() => import('./components/DeepDataPage'))
const PremiumPage = lazy(() => import('./components/PremiumPage'))
const DartEventPage = lazy(() => import('./components/DartEventPage'))
const LibraryPage = lazy(() => import('./components/LibraryPage'))
const BriefingPage = lazy(() => import('./components/BriefingPage'))
const PatternPage = lazy(() => import('./components/PatternPage'))
import BuffettChatPanel from './components/BuffettChat'
import DisclosureModal from './components/DisclosureModal'
import EmailCapture from './components/EmailCapture'
import PwaInstallBanner from './components/PwaInstallBanner'

function FilingsCorpRedirect() {
  const { corpCode } = useParams()
  return <Navigate to={`/deep-dive/${corpCode}`} replace />
}

function DeepDiveWrapper({ onViewCard }) {
  const { corpCode } = useParams()
  return <CompanyCard corpCode={corpCode} onBack={() => window.history.back()} onViewCard={onViewCard} />
}

export default function App() {
  const { colors } = useTheme()
  const { toasts, addToast, dismissToast } = useToastManager()
  const [detailNotification, setDetailNotification] = useState(null)
  const navigate = useNavigate()

  const handleNewNotifications = useCallback((newItems) => {
    newItems.forEach((item) => addToast(item))
  }, [addToast])

  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications({
    onNewNotifications: handleNewNotifications,
  })

  const navigateToCard = useCallback((corpCode) => {
    if (corpCode) {
      navigate(`/deep-dive/${corpCode}`)
    } else {
      navigate('/deep-dive')
    }
  }, [navigate])

  const [notifRceptNo, setNotifRceptNo] = useState(null)

  const handleSelectNotification = useCallback((notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
    }
    // rcept_no가 있으면 공시 모달로, 없으면 기존 모달
    if (notification.rcept_no) {
      setNotifRceptNo(notification.rcept_no)
    } else {
      setDetailNotification(notification)
    }
  }, [markAsRead])

  const location = useLocation()
  const isLanding = location.pathname === '/'

  return (
    <ErrorProvider addToast={addToast}>
      <div style={{ minHeight: '100vh', backgroundColor: isLanding ? '#FFFFFF' : colors.bgPrimary, fontFamily: FONTS.body }}>
        {!isLanding && (
          <>
            <Header
              notifications={notifications}
              unreadCount={unreadCount}
              loading={loading}
              onRead={markAsRead}
              onMarkAllRead={markAllAsRead}
              onSelectNotification={handleSelectNotification}
            />
            <PushSubscribeBanner />
            <PwaInstallBanner />
          </>
        )}
        <ErrorBoundary>
          <main className="app-content">
            <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
            <div key={location.pathname.split('/')[1] || 'home'} className="page-enter">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/today" element={<TodayPage onViewCard={navigateToCard} />} />
              <Route path="/briefing" element={<BriefingPage />} />
              <Route path="/history" element={<HistoryPage onViewCard={navigateToCard} />} />
              <Route path="/patterns" element={<PatternPage />} />
              <Route path="/ai-live" element={<Navigate to="/history" replace />} />
              <Route path="/deep-dive" element={<CompanyCard onViewCard={navigateToCard} />} />
              <Route path="/deep-dive/:corpCode" element={<DeepDiveWrapper onViewCard={navigateToCard} />} />
              <Route path="/deep-data" element={<DeepDataPage onViewCard={navigateToCard} />} />
              <Route path="/dart-event" element={<DartEventPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/premium" element={<PremiumPage />} />
              {/* Legacy redirects */}
              <Route path="/surge" element={<Navigate to="/today" replace />} />
              <Route path="/quant" element={<Navigate to="/today" replace />} />
              <Route path="/customer-analysis" element={<Navigate to="/today" replace />} />
              <Route path="/discover" element={<Navigate to="/today" replace />} />
              <Route path="/market" element={<Navigate to="/today" replace />} />
              <Route path="/dashboard" element={<Navigate to="/today" replace />} />
              <Route path="/filings" element={<Navigate to="/today" replace />} />
              <Route path="/filings/:corpCode" element={<FilingsCorpRedirect />} />
              <Route path="/analysis" element={<Navigate to="/today" replace />} />
              <Route path="/discovery" element={<Navigate to="/today" replace />} />
              <Route path="/feed" element={<Navigate to="/today" replace />} />
              <Route path="/industries" element={<Navigate to="/today" replace />} />
              <Route path="/valuations" element={<Navigate to="/today" replace />} />
              <Route path="/screener" element={<Navigate to="/today" replace />} />
              <Route path="/edge" element={<Navigate to="/today" replace />} />
              <Route path="/companies" element={<Navigate to="/deep-dive" replace />} />
              <Route path="/companies/:corpCode" element={<FilingsCorpRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </div>
            </Suspense>
          </main>
        </ErrorBoundary>

        {/* 토스트 알림 스택 */}
        <ToastContainer
          toasts={toasts}
          onDismiss={dismissToast}
          onSelectNotification={handleSelectNotification}
        />

        {/* 버핏 챗 플로팅 패널 (프리미엄 + 기업카드 페이지) */}
        {(location.pathname === '/premium' || location.pathname.startsWith('/deep-dive')) && <BuffettChatPanel />}

        {/* 이메일 수집 배너 (랜딩 제외) */}
        {!isLanding && <EmailCapture />}

        {/* 알림 → 공시 모달 (rcept_no 있는 경우) */}
        {notifRceptNo && (
          <DisclosureModal
            rcept_no={notifRceptNo}
            onClose={() => setNotifRceptNo(null)}
            onViewCard={navigateToCard}
          />
        )}

        {/* 알림 상세 모달 (rcept_no 없는 경우 폴백) */}
        {detailNotification && (
          <NotificationDetailModal
            notification={detailNotification}
            onClose={() => setDetailNotification(null)}
          />
        )}
      </div>
    </ErrorProvider>
  )
}

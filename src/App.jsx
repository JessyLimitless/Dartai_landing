import React, { useState, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from 'react-router-dom'
import Header from './components/Header'
import TodayPage from './components/TodayPage'
import DeepDivePage from './components/DeepDivePage'
import DiscoveryPage from './components/DiscoveryPage'
import MarketPage from './components/MarketPage'
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

function FilingsCorpRedirect() {
  const { corpCode } = useParams()
  return <Navigate to={`/deep-dive/${corpCode}`} replace />
}

export default function App() {
  const { colors } = useTheme()
  const { toasts, addToast, dismissToast } = useToastManager()
  const [detailNotification, setDetailNotification] = useState(null)
  const navigate = useNavigate()

  // 신규 알림 도착 시 토스트 추가
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

  // 알림 상세 모달 열기 (패널 또는 토스트에서 공용)
  const handleSelectNotification = useCallback((notification) => {
    setDetailNotification(notification)
    if (!notification.is_read) {
      markAsRead(notification.id)
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
          </>
        )}
        <ErrorBoundary>
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/today" element={<TodayPage onViewCard={navigateToCard} />} />
              <Route path="/deep-dive" element={<DeepDivePage onViewCard={navigateToCard} />} />
              <Route path="/deep-dive/:corpCode" element={<DeepDivePage onViewCard={navigateToCard} />} />
              <Route path="/discover" element={<DiscoveryPage onViewCard={navigateToCard} />} />
              <Route path="/market" element={<MarketPage onViewCard={navigateToCard} />} />
              {/* Legacy redirects */}
              <Route path="/dashboard" element={<Navigate to="/today" replace />} />
              <Route path="/filings" element={<Navigate to="/today" replace />} />
              <Route path="/filings/:corpCode" element={<FilingsCorpRedirect />} />
              <Route path="/analysis" element={<Navigate to="/discover" replace />} />
              <Route path="/discovery" element={<Navigate to="/discover" replace />} />
              <Route path="/feed" element={<Navigate to="/today" replace />} />
              <Route path="/variables" element={<Navigate to="/discover" replace />} />
              <Route path="/industries" element={<Navigate to="/market" replace />} />
              <Route path="/valuations" element={<Navigate to="/market" replace />} />
              <Route path="/screener" element={<Navigate to="/discover" replace />} />
              <Route path="/edge" element={<Navigate to="/discover" replace />} />
              <Route path="/companies" element={<Navigate to="/deep-dive" replace />} />
              <Route path="/companies/:corpCode" element={<FilingsCorpRedirect />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </ErrorBoundary>

        {/* 토스트 알림 스택 */}
        <ToastContainer
          toasts={toasts}
          onDismiss={dismissToast}
          onSelectNotification={handleSelectNotification}
        />

        {/* 알림 상세 모달 */}
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

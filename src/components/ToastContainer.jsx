import React, { useState, useCallback } from 'react'
import NotificationToast from './NotificationToast'
import NotificationDetailModal from './NotificationDetailModal'

export default function ToastContainer({ toasts, onDismiss, onSelectNotification }) {
  const [detailNotification, setDetailNotification] = useState(null)

  const handleToastClick = useCallback((notification) => {
    // 토스트 닫기 + 상세 모달 열기
    onDismiss?.(notification.id)
    if (onSelectNotification) {
      onSelectNotification(notification)
    } else {
      setDetailNotification(notification)
    }
  }, [onDismiss, onSelectNotification])

  return (
    <>
      {/* 토스트 스택 — 우상단 */}
      <div
        className="toast-container"
        style={{
          position: 'fixed',
          top: '72px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 1500,
          pointerEvents: 'none',
        }}
      >
        {toasts.map((toast) => (
          <div key={toast.id} style={{ pointerEvents: 'auto' }}>
            <NotificationToast
              notification={toast}
              onDismiss={onDismiss}
              onClick={handleToastClick}
            />
          </div>
        ))}
      </div>

      {/* 상세 모달 (토스트 클릭 시, 외부 onSelectNotification이 없는 경우) */}
      {detailNotification && !onSelectNotification && (
        <NotificationDetailModal
          notification={detailNotification}
          onClose={() => setDetailNotification(null)}
        />
      )}
    </>
  )
}

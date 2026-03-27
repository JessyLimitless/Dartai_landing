import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import './styles/theme-vars.css'
import './styles/responsive.css'

// Service Worker 등록 + 업데이트 토스트
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((reg) => {
    reg.addEventListener('updatefound', () => {
      const newSW = reg.installing
      if (newSW) {
        newSW.addEventListener('statechange', () => {
          if (newSW.state === 'activated' && navigator.serviceWorker.controller) {
            // 새 버전 활성화 → 토스트 표시 (강제 리로드 안 함)
            showUpdateToast()
          }
        })
      }
    })
  }).catch((err) => {
    console.warn('SW registration failed:', err)
  })
  // SW에서 업데이트 메시지 수신
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'SW_UPDATED') {
      showUpdateToast()
    }
  })
}

function showUpdateToast() {
  // 이미 토스트가 있으면 무시
  if (document.getElementById('sw-update-toast')) return
  const toast = document.createElement('div')
  toast.id = 'sw-update-toast'
  toast.innerHTML = `
    <div style="
      position:fixed; bottom:calc(80px + env(safe-area-inset-bottom, 0px)); left:50%; transform:translateX(-50%);
      z-index:99999; background:#18181B; color:#fff; padding:12px 20px; border-radius:12px;
      font-size:13px; font-weight:600; display:flex; align-items:center; gap:10px;
      box-shadow:0 8px 32px rgba(0,0,0,0.3); cursor:pointer; animation:fadeInUp 0.3s ease;
    " onclick="window.location.reload()">
      <span>새 버전이 있습니다</span>
      <span style="background:#DC2626; padding:4px 12px; border-radius:6px; font-size:12px;">업데이트</span>
    </div>
  `
  document.body.appendChild(toast)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
)

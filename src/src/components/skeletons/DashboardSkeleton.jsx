import React from 'react'
import Skeleton from '../Skeleton'

export default function DashboardSkeleton() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Skeleton width="120px" height="24px" style={{ marginBottom: '20px' }} />

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <Skeleton width="60px" height="12px" style={{ marginBottom: '8px' }} />
            <Skeleton width="80px" height="28px" />
          </div>
        ))}
      </div>

      {/* Weekly summary */}
      <Skeleton width="140px" height="18px" style={{ marginBottom: '16px' }} />
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} width="90px" height="36px" borderRadius="8px" />
        ))}
      </div>

      {/* Recent disclosures */}
      <Skeleton width="160px" height="18px" style={{ marginBottom: '12px' }} />
      <div className="skeleton-card" style={{ padding: 0, overflow: 'hidden' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: i < 5 ? '1px solid var(--border-light, #f1f5f9)' : 'none' }}>
            <Skeleton width="32px" height="22px" borderRadius="4px" />
            <div style={{ flex: 1 }}>
              <Skeleton width="120px" height="14px" style={{ marginBottom: '4px' }} />
              <Skeleton width="200px" height="12px" />
            </div>
            <Skeleton width="50px" height="11px" />
          </div>
        ))}
      </div>
    </div>
  )
}

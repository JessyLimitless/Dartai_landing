import React from 'react'
import Skeleton from '../Skeleton'

export default function FeedSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-light, #f1f5f9)' }}>
          <Skeleton width="32px" height="22px" borderRadius="4px" />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <Skeleton width="80px" height="14px" />
              <Skeleton width="40px" height="12px" />
            </div>
            <Skeleton width="240px" height="12px" style={{ marginBottom: '4px' }} />
            <Skeleton width="180px" height="11px" />
          </div>
          <Skeleton width="36px" height="11px" />
        </div>
      ))}
    </div>
  )
}

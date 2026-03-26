import React from 'react'
import Skeleton from '../Skeleton'

export default function VariableSkeleton() {
  return (
    <div>
      {/* Grade summary cards */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} width="100px" height="40px" borderRadius="8px" />
        ))}
      </div>

      {/* Search bar */}
      <Skeleton width="100%" height="42px" borderRadius="8px" style={{ marginBottom: '16px' }} />

      {/* Count */}
      <Skeleton width="100px" height="12px" style={{ marginBottom: '12px' }} />

      {/* Score rows */}
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 16px', borderRadius: '10px',
          backgroundColor: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e2e8f0)',
          marginBottom: '8px',
        }}>
          <Skeleton width="70px" height="24px" borderRadius="6px" />
          <div style={{ flex: '0 0 120px' }}>
            <Skeleton width="80px" height="14px" style={{ marginBottom: '4px' }} />
            <Skeleton width="50px" height="11px" />
          </div>
          <Skeleton width="40px" height="18px" style={{ flex: '0 0 50px' }} />
          <div style={{ flex: 1, display: 'flex', gap: '4px' }}>
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} style={{ flex: 1 }}>
                <Skeleton width="100%" height="6px" borderRadius="3px" />
              </div>
            ))}
          </div>
          <Skeleton width="160px" height="11px" />
        </div>
      ))}
    </div>
  )
}

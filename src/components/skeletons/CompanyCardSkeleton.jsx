import React from 'react'
import Skeleton from '../Skeleton'

export default function CompanyCardSkeleton() {
  return (
    <div className="page-container" style={{ maxWidth: '960px', margin: '0 auto', padding: '24px' }}>
      <Skeleton width="140px" height="13px" style={{ marginBottom: '16px' }} />

      {/* Header card */}
      <div className="skeleton-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Skeleton width="140px" height="22px" />
            <Skeleton width="50px" height="16px" />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <Skeleton width="60px" height="12px" />
            <Skeleton width="80px" height="12px" />
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Skeleton width="120px" height="24px" style={{ marginBottom: '4px', marginLeft: 'auto' }} />
          <Skeleton width="80px" height="13px" style={{ marginLeft: 'auto' }} />
        </div>
      </div>

      {/* 2x2 Grid */}
      <div className="company-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="skeleton-card">
            <Skeleton width="100px" height="12px" style={{ marginBottom: '14px' }} />
            <Skeleton width="100%" height="80px" borderRadius="4px" />
          </div>
        ))}
      </div>
    </div>
  )
}

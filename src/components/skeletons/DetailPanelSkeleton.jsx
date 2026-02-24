import React from 'react'
import Skeleton from '../Skeleton'

export default function DetailPanelSkeleton() {
  return (
    <div style={{ padding: '16px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border, #e2e8f0)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Skeleton width="32px" height="22px" borderRadius="4px" />
          <Skeleton width="120px" height="18px" />
        </div>
        <Skeleton width="220px" height="13px" style={{ marginBottom: '4px' }} />
        <Skeleton width="160px" height="11px" />
      </div>

      {/* Parsed data */}
      <Skeleton width="80px" height="12px" style={{ marginBottom: '10px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{ padding: '8px 10px', backgroundColor: 'var(--bg-primary, #f8fafc)', borderRadius: '6px' }}>
            <Skeleton width="50px" height="10px" style={{ marginBottom: '4px' }} />
            <Skeleton width="70px" height="13px" />
          </div>
        ))}
      </div>

      {/* AI Summary */}
      <Skeleton width="60px" height="12px" style={{ marginBottom: '10px' }} />
      <Skeleton width="100%" height="13px" style={{ marginBottom: '6px' }} />
      <Skeleton width="95%" height="13px" style={{ marginBottom: '6px' }} />
      <Skeleton width="80%" height="13px" style={{ marginBottom: '6px' }} />
      <Skeleton width="90%" height="13px" style={{ marginBottom: '16px' }} />

      {/* Button */}
      <Skeleton width="100%" height="40px" borderRadius="8px" />
    </div>
  )
}

import React from 'react'

export default function Skeleton({ width, height, borderRadius, style, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width: width || '100%',
        height: height || '14px',
        borderRadius: borderRadius || '6px',
        ...style,
      }}
    />
  )
}

export function SkeletonText({ lines = 3, widths }) {
  const defaultWidths = ['100%', '90%', '75%', '85%', '60%']
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="skeleton-text"
          width={widths?.[i] || defaultWidths[i % defaultWidths.length]}
        />
      ))}
    </div>
  )
}

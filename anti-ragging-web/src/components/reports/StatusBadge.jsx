import React from 'react'

export const StatusBadge = ({ status, className = '' }) => {
  const normStatus = status?.toLowerCase() || 'pending'
  
  const variants = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-green-100 text-green-800 border-green-200',
    investigating: 'bg-blue-100 text-blue-800 border-blue-200',
    resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    assigned: 'bg-purple-100 text-purple-800 border-purple-200',
  }

  const selectedVariant = variants[normStatus] || variants.pending
  const displayStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Pending'

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${selectedVariant} ${className}`}>
      {displayStatus}
    </span>
  )
}

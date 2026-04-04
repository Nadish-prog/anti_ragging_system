import { AlertCircle } from 'lucide-react'

export const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null

  return (
    <div className={`flex items-center gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg ${className}`}>
      <AlertCircle size={18} className="shrink-0" />
      <span>{message}</span>
    </div>
  )
}

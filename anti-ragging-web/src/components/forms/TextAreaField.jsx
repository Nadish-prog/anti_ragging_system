import React from 'react'
import { AlertCircle } from 'lucide-react'

export const TextAreaField = React.forwardRef(({ 
  label, 
  error, 
  id, 
  className = '', 
  rows = 4,
  ...props 
}, ref) => {
  const inputId = id || props.name || Math.random().toString(36).substring(7)
  
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 text-sm font-medium text-[var(--color-primary-900)]">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          id={inputId}
          ref={ref}
          rows={rows}
          className={`
            w-full px-4 py-3 text-base bg-white border rounded-lg outline-none
            transition-all duration-200 resize-y
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-red-900' 
              : 'border-gray-200 focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--color-primary-500)]/10 text-gray-900 placeholder:text-gray-400'
            }
          `}
          {...props}
        />
        {error && (
          <div className="absolute top-3 right-0 flex items-center pr-3 pointer-events-none text-red-500">
            <AlertCircle size={18} />
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  )
})

TextAreaField.displayName = 'TextAreaField'

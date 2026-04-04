import React from 'react'
import { Loader2 } from 'lucide-react'

export const Button = React.forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  fullWidth = false,
  className = '',
  disabled,
  ...props 
}, ref) => {
  
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg'
  
  const variants = {
    primary: 'bg-[var(--color-primary-900)] text-white hover:bg-gray-800 focus:ring-gray-900',
    secondary: 'bg-[var(--color-primary-100)] text-[var(--color-primary-900)] hover:bg-gray-200 focus:ring-gray-200',
    outline: 'border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-900 focus:ring-gray-200',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
  }
  
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2.5',
    lg: 'text-lg px-6 py-3',
  }

  const widthStyle = fullWidth ? 'w-full' : ''
  const isActuallyDisabled = isLoading || disabled

  return (
    <button
      ref={ref}
      disabled={isActuallyDisabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

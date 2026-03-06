import React from 'react'

export const SelectField = React.forwardRef(({
  label,
  error,
  id,
  options = [],
  className = '',
  placeholder = 'Select an option',
  ...props
}, ref) => {
  const selectId = id || props.name || Math.random().toString(36).substring(7)
  
  return (
    <div className={`flex flex-col mb-4 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="mb-1.5 text-sm font-medium text-[var(--color-primary-900)]">
          {label}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        className={`
          w-full px-4 py-2.5 text-base bg-white border rounded-lg outline-none
          transition-all duration-200 appearance-none
          ${error 
            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 text-red-900' 
            : 'border-gray-200 focus:border-[var(--color-primary-500)] focus:ring-4 focus:ring-[var(--color-primary-500)]/10 text-gray-900'
          }
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
          backgroundPosition: 'right 0.5rem center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '1.5em 1.5em',
          paddingRight: '2.5rem'
        }}
        {...props}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  )
})

SelectField.displayName = 'SelectField'

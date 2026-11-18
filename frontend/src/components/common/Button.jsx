import React from 'react'
import { Loader2 } from 'lucide-react'












const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent shadow-sm',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm',
  outline: 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300',
  ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 border-transparent',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const Button = React.forwardRef(
  ({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, className = '', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2 font-medium rounded-lg border
          transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}
        `}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button

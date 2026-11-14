type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'gray' | 'blue'

interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  size?: 'sm' | 'md'
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  danger: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
  blue: 'bg-blue-600 text-white border-blue-600',
}

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
}

const Badge = ({ variant = 'gray', children, size = 'md' }: BadgeProps) => {
  return (
    <span className={`inline-flex items-center font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  )
}

export default Badge

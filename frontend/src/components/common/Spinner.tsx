interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3',
  xl: 'w-16 h-16 border-4',
}

const Spinner = ({ size = 'md', className = '' }: SpinnerProps) => {
  return (
    <div
      className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin ${className}`}
    />
  )
}

export default Spinner

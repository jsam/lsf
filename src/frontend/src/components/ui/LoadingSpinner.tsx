import React from 'react'

export type SpinnerSize = 'small' | 'medium' | 'large'
export type SpinnerVariant = 'inline' | 'overlay' | 'skeleton'

export interface LoadingSpinnerProps {
  size?: SpinnerSize
  color?: string
  variant?: SpinnerVariant
  text?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'text-primary-600',
  variant = 'inline',
  text,
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12'
  }

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  }

  if (variant === 'skeleton') {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-neutral-200 rounded-md h-4 mb-2"></div>
        <div className="bg-neutral-200 rounded-md h-4 mb-2 w-5/6"></div>
        <div className="bg-neutral-200 rounded-md h-4 w-4/6"></div>
      </div>
    )
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <svg
        className={`animate-spin ${sizeClasses[size]} ${color}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && (
        <p className={`mt-2 ${textSizeClasses[size]} text-neutral-600`}>
          {text}
        </p>
      )}
    </div>
  )

  if (variant === 'overlay') {
    return (
      <div className={`fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 ${className}`}>
        {spinner}
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {spinner}
    </div>
  )
}

export default LoadingSpinner

export const SkeletonLine: React.FC<{ width?: string; className?: string }> = ({
  width = 'w-full',
  className = ''
}) => (
  <div className={`animate-pulse bg-neutral-200 rounded-md h-4 ${width} ${className}`} />
)

export const SkeletonCard: React.FC<{ className?: string }> = ({
  className = ''
}) => (
  <div className={`animate-pulse p-6 border border-neutral-200 rounded-lg ${className}`}>
    <div className="bg-neutral-200 rounded-md h-6 w-1/3 mb-4" />
    <div className="space-y-2">
      <div className="bg-neutral-200 rounded-md h-4 w-full" />
      <div className="bg-neutral-200 rounded-md h-4 w-5/6" />
      <div className="bg-neutral-200 rounded-md h-4 w-4/6" />
    </div>
  </div>
)
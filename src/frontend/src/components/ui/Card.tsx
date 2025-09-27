import React from 'react'

export type CardVariant = 'default' | 'elevated' | 'flat' | 'outlined'
export type CardPadding = 'none' | 'small' | 'medium' | 'large'

export interface CardProps {
  children: React.ReactNode
  title?: string
  actions?: React.ReactNode
  variant?: CardVariant
  padding?: CardPadding
  elevated?: boolean
  className?: string
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  actions,
  variant = 'default',
  padding = 'medium',
  elevated = false,
  className = ''
}) => {
  const variantClasses = {
    default: 'bg-white border border-neutral-200',
    elevated: 'bg-white shadow-lg border border-neutral-100',
    flat: 'bg-neutral-50',
    outlined: 'bg-white border-2 border-neutral-300'
  }

  const paddingClasses = {
    none: 'p-0',
    small: 'p-3',
    medium: 'p-6',
    large: 'p-8'
  }

  const elevatedClass = elevated ? 'shadow-md' : ''

  const cardClasses = [
    'rounded-lg',
    variantClasses[variant],
    paddingClasses[padding],
    elevatedClass,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={cardClasses}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-neutral-900">
              {title}
            </h3>
          )}
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card
import React from 'react'

export interface MainContentProps {
  children: React.ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | 'full'
  className?: string
}

const MainContent: React.FC<MainContentProps> = ({
  children,
  padding = 'md',
  maxWidth = 'full',
  className = ''
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  }

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full'
  }

  return (
    <div className="layout-main">
      <div className={`
        ${paddingClasses[padding]}
        ${maxWidthClasses[maxWidth]}
        ${maxWidth !== 'full' ? 'mx-auto' : ''}
        ${className}
      `.trim()}>
        {children}
      </div>
    </div>
  )
}

export default MainContent
import React, { forwardRef } from 'react'

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  inputType?: InputType
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      inputType = 'text',
      className = '',
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    const baseInputClasses = [
      'block w-full px-3 py-2 border rounded-md text-neutral-900 placeholder-neutral-500',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
      'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed',
      'transition-colors duration-200'
    ]

    const errorClasses = error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-neutral-300'

    const iconPaddingClasses = {
      left: leftIcon ? 'pl-10' : '',
      right: rightIcon ? 'pr-10' : ''
    }

    const inputClasses = [
      ...baseInputClasses,
      errorClasses,
      iconPaddingClasses.left,
      iconPaddingClasses.right,
      className
    ].filter(Boolean).join(' ')

    const containerClasses = fullWidth ? 'w-full' : ''

    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-neutral-400">
                {leftIcon}
              </div>
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={inputClasses}
            disabled={disabled}
            required={required}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-neutral-400">
                {rightIcon}
              </div>
            </div>
          )}
        </div>

        {(error || helperText) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-sm text-neutral-500">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  fullWidth?: boolean
  rows?: number
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      rows = 4,
      className = '',
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`

    const baseClasses = [
      'block w-full px-3 py-2 border rounded-md text-neutral-900 placeholder-neutral-500',
      'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
      'disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed',
      'transition-colors duration-200 resize-vertical'
    ]

    const errorClasses = error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-neutral-300'

    const textareaClasses = [
      ...baseClasses,
      errorClasses,
      className
    ].filter(Boolean).join(' ')

    const containerClasses = fullWidth ? 'w-full' : ''

    return (
      <div className={containerClasses}>
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-neutral-700 mb-1"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaClasses}
          disabled={disabled}
          required={required}
          {...props}
        />

        {(error || helperText) && (
          <div className="mt-1">
            {error && (
              <p className="text-sm text-red-600">
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className="text-sm text-neutral-500">
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
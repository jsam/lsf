import React, { useState, useRef, useEffect } from 'react'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectProps {
  options: SelectOption[]
  value?: string | number | (string | number)[]
  onChange: (value: string | number | (string | number)[]) => void
  label?: string
  error?: string
  helperText?: string
  placeholder?: string
  searchable?: boolean
  multiple?: boolean
  disabled?: boolean
  required?: boolean
  fullWidth?: boolean
  className?: string
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  label,
  error,
  helperText,
  placeholder = 'Select an option',
  searchable = false,
  multiple = false,
  disabled = false,
  required = false,
  fullWidth = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const selectRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options

  const selectedValues = Array.isArray(value) ? value : value !== undefined ? [value] : []

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder

    if (multiple) {
      if (selectedValues.length === 1) {
        const option = options.find(opt => opt.value === selectedValues[0])
        return option?.label || ''
      }
      return `${selectedValues.length} items selected`
    }

    const option = options.find(opt => opt.value === selectedValues[0])
    return option?.label || placeholder
  }

  const handleOptionClick = (optionValue: string | number) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : []
      const newValues = currentValues.includes(optionValue)
        ? currentValues.filter(v => v !== optionValue)
        : [...currentValues, optionValue]
      onChange(newValues)
    } else {
      onChange(optionValue)
      setIsOpen(false)
    }
  }

  const handleRemoveValue = (valueToRemove: string | number, event: React.MouseEvent) => {
    event.stopPropagation()
    if (multiple && Array.isArray(value)) {
      const newValues = value.filter(v => v !== valueToRemove)
      onChange(newValues)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  const containerClasses = fullWidth ? 'w-full' : ''

  const triggerClasses = [
    'relative w-full border rounded-md bg-white px-3 py-2 text-left cursor-pointer',
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
    'disabled:bg-neutral-100 disabled:cursor-not-allowed',
    error ? 'border-red-300' : 'border-neutral-300',
    disabled ? 'bg-neutral-100 text-neutral-500' : 'text-neutral-900',
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div ref={selectRef} className="relative">
        <button
          type="button"
          className={triggerClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
              {multiple && selectedValues.length > 0 ? (
                selectedValues.map(val => {
                  const option = options.find(opt => opt.value === val)
                  return option ? (
                    <span
                      key={val}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {option.label}
                      <span
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-primary-600 hover:bg-primary-200 hover:text-primary-800 cursor-pointer"
                        onClick={(e) => handleRemoveValue(val, e)}
                      >
                        ×
                      </span>
                    </span>
                  ) : null
                })
              ) : (
                <span className={selectedValues.length === 0 ? 'text-neutral-500' : ''}>
                  {getDisplayText()}
                </span>
              )}
            </div>
            <div className="ml-2 flex-shrink-0">
              <svg
                className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-neutral-200">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-neutral-500">
                No options found
              </div>
            ) : (
              <ul className="py-1" role="listbox">
                {filteredOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value)
                  return (
                    <li
                      key={option.value}
                      className={`px-3 py-2 cursor-pointer text-sm transition-colors ${
                        option.disabled
                          ? 'text-neutral-400 cursor-not-allowed'
                          : isSelected
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-neutral-900 hover:bg-neutral-100'
                      }`}
                      onClick={() => !option.disabled && handleOptionClick(option.value)}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {multiple && isSelected && (
                          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
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

export default Select